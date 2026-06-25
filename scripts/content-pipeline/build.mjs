#!/usr/bin/env node
// Content data pipeline — runs in CI (open network) to grow each course's
// vocabulary from OPEN, attributable data instead of hand-authoring thousands of
// words by guess.
//
//   frequency ranking  (hermitdave/FrequencyWords, OpenSubtitles 2018)
//   + translations     (FreeDict bilingual dictionaries, <target>-eng TEI)
//   ──────────────────────────────────────────────────────────────────────
//   → the N most common target words that have a clean English gloss, bucketed
//     into CEFR-laddered units and written as a SectionBlueprint TS file.
//
// The generator (src/curriculum/generate.ts) then expands these into lessons,
// and `npm run validate:content` gates the result before anything ships. We only
// emit entries with a confident single short gloss, so wrong/garbled content is
// dropped rather than taught.
//
// Output: src/curriculum/blueprints/generated/<code>.ts  + a barrel index.ts.
//
// Env overrides: MAX_WORDS (default 400), UNIT_SIZE (default 25),
//                ONLY=de,fr  (restrict to some languages).

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT_DIR = join(ROOT, "src/curriculum/blueprints/generated");
const MAX_WORDS = Number(process.env.MAX_WORDS || 4800);
const UNIT_SIZE = Number(process.env.UNIT_SIZE || 25);
// Skip the very top of the frequency list: those are function words (articles,
// pronouns, common prepositions) that are already in the hand-authored basics
// AND have the noisiest dictionary glosses (e.g. German "es" → a musical note).
// Harvesting from a bit deeper yields cleaner, more teachable content words.
const SKIP_TOP = Number(process.env.SKIP_TOP || 100);
const ONLY = (process.env.ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);

// Languages we can source well (FreeDict <x>-eng + hermitdave frequency exist).
// `freq` is the hermitdave folder; `dict` is the FreeDict pair name.
const LANGS = [
  { code: "de", name: "German", endonym: "Deutsch", flag: "🇩🇪", speechLocale: "de-DE", freq: "de", dict: "deu-eng" },
  { code: "es", name: "Spanish", endonym: "Español", flag: "🇪🇸", speechLocale: "es-ES", freq: "es", dict: "spa-eng" },
  { code: "fr", name: "French", endonym: "Français", flag: "🇫🇷", speechLocale: "fr-FR", freq: "fr", dict: "fra-eng" },
  { code: "it", name: "Italian", endonym: "Italiano", flag: "🇮🇹", speechLocale: "it-IT", freq: "it", dict: "ita-eng" },
];

const UNIT_COLORS = ["#58CC02", "#1CB0F6", "#CE82FF", "#FF9600", "#FF4B4B", "#2B70C9", "#FFC800", "#00CD9C"];
const UNIT_ICONS = ["📚", "🗣️", "✍️", "🌍", "🍽️", "🏙️", "🧭", "💬", "🎓", "⭐"];
// CEFR ladder across units (early units easiest).
function cefrFor(unitIndex) {
  const ramp = ["A1", "A1", "A1", "A2", "A2", "A2", "B1", "B1", "B1", "B2", "B2", "C1"];
  return ramp[Math.min(unitIndex, ramp.length - 1)];
}

async function withRetry(fn, what) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      console.log(`  retry ${attempt}/3 (${what}): ${e.message}`);
      await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw lastErr;
}
async function fetchText(url) {
  return withRetry(async () => {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
  }, url);
}
async function fetchBuffer(url) {
  return withRetry(async () => {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return Buffer.from(await res.arrayBuffer());
  }, url);
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

// Turn a raw FreeDict translation gloss into a single clean English meaning, or
// null if it isn't trustworthy enough to teach.
export function cleanGloss(raw, target) {
  if (!raw) return null;
  let g = decodeEntities(raw).trim();
  g = g.replace(/<[^>]+>/g, " "); // strip any nested tags
  g = g.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " "); // drop parentheticals
  g = g.split(/[,;/|]/)[0]; // first sense only
  g = g.replace(/\s+/g, " ").trim();
  g = g.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
  if (!g) return null;
  if (g.length < 2) return null; // drop single-letter glosses (e.g. "E")
  if (g.length > 32) return null;
  if (/\d/.test(g)) return null;
  if (!/^[a-zA-Z][a-zA-Z '-]*$/.test(g)) return null; // English-looking only
  if (g.toLowerCase() === target.toLowerCase()) return null;
  if (g.split(" ").length > 3) return null;
  return g;
}

// Resolve the FreeDict TEI (source) download URL for a pair via the public DB.
async function freedictTeiUrl(pair) {
  const db = JSON.parse(await fetchText("https://freedict.org/freedict-database.json"));
  const entry = db.find((d) => d.name === pair);
  if (!entry || !Array.isArray(entry.releases)) throw new Error(`FreeDict pair not found: ${pair}`);
  // Prefer the TEI source release; then anything whose URL looks like source/TEI;
  // then any release with a URL at all.
  const byPlatform = entry.releases.find((r) => r.platform === "src" && r.URL);
  const byUrl = entry.releases.find((r) => r.URL && /\.src\.|\.tei/i.test(r.URL));
  const any = entry.releases.find((r) => r.URL);
  const pick = byPlatform || byUrl || any;
  if (!pick || !pick.URL) throw new Error(`No downloadable release for ${pair}`);
  return pick.URL;
}

// Download + extract the TEI archive, return a Map(lowerHeadword -> {orth, gloss}).
async function loadDictionary(pair) {
  const url = await freedictTeiUrl(pair);
  const buf = await fetchBuffer(url);
  const dir = mkdtempSync(join(tmpdir(), `fd-${pair}-`));
  const archive = join(dir, "dict.tar");
  // The DB serves .tar.xz (src) — decompress with the system tar.
  writeFileSync(archive + ".xz", buf);
  try {
    execFileSync("tar", ["-xJf", archive + ".xz", "-C", dir]);
  } catch {
    // Some releases are .tar.bz2 / .tar.gz — let tar auto-detect.
    execFileSync("tar", ["-xf", archive + ".xz", "-C", dir]);
  }
  const teiPath = findFile(dir, (f) => f.endsWith(".tei"));
  if (!teiPath) throw new Error(`No .tei in ${pair} archive`);
  const tei = readFileSync(teiPath, "utf8");
  rmSync(dir, { recursive: true, force: true });

  const map = new Map();
  const entryRe = /<entry\b[\s\S]*?<\/entry>/g;
  let m;
  while ((m = entryRe.exec(tei))) {
    const block = m[0];
    const orthM = block.match(/<orth[^>]*>([\s\S]*?)<\/orth>/);
    if (!orthM) continue;
    const orth = decodeEntities(orthM[1].replace(/<[^>]+>/g, "").trim());
    if (!orth) continue;
    const key = orth.toLowerCase();
    if (map.has(key)) continue;
    // translation quotes inside <cit type="trans"> blocks
    const trans = [];
    const citRe = /<cit\b[^>]*type="trans"[^>]*>([\s\S]*?)<\/cit>/g;
    let c;
    while ((c = citRe.exec(block))) {
      const q = c[1].match(/<quote[^>]*>([\s\S]*?)<\/quote>/);
      if (q) trans.push(q[1]);
    }
    if (!trans.length) {
      const q = block.match(/<quote[^>]*>([\s\S]*?)<\/quote>/);
      if (q) trans.push(q[1]);
    }
    // Keep ALL clean candidate senses; the best one is chosen later by English
    // word frequency (so "Tag" → "day", not "tag"; "Klar" → "clear", not "egg-white").
    const glosses = [];
    for (const t of trans) {
      const g = cleanGloss(t, orth);
      if (g && !glosses.includes(g)) glosses.push(g);
    }
    if (glosses.length) map.set(key, { orth, glosses });
  }
  return map;
}

function findFile(dir, pred) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      const found = findFile(p, pred);
      if (found) return found;
    } else if (pred(name.name)) {
      return p;
    }
  }
  return null;
}

async function loadFrequency(langDir) {
  // hermitdave full list: "word count" per line, most frequent first.
  const base = "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018";
  let text;
  try {
    text = await fetchText(`${base}/${langDir}/${langDir}_full.txt`);
  } catch {
    text = await fetchText(`${base}/${langDir}/${langDir}_50k.txt`);
  }
  const words = [];
  for (const line of text.split("\n")) {
    const w = line.split(/\s+/)[0];
    if (!w) continue;
    if (w.length < 2) continue;
    if (!/^[\p{L}][\p{L}'’-]*$/u.test(w)) continue;
    words.push(w.toLowerCase());
  }
  return words;
}

function tsLiteral(s) {
  return JSON.stringify(s);
}

function emitLangFile(lang, vocab) {
  // Bucket vocab into units.
  const units = [];
  for (let i = 0; i < vocab.length; i += UNIT_SIZE) {
    const slice = vocab.slice(i, i + UNIT_SIZE);
    const u = units.length;
    const lo = i + 1;
    const hi = i + slice.length;
    units.push({
      id: `${lang.code}-gen-u${u + 1}`,
      title: `Common words ${lo}–${hi}`,
      subtitle: `The ${lo}–${hi} most frequent words`,
      cefr: cefrFor(u),
      color: UNIT_COLORS[u % UNIT_COLORS.length],
      icon: UNIT_ICONS[u % UNIT_ICONS.length],
      vocab: slice,
    });
  }
  const section = {
    id: `${lang.code}-gen-frequency`,
    title: "Most common words",
    subtitle: "High-frequency vocabulary, built from open data",
    units,
  };
  const header =
    `// AUTO-GENERATED by scripts/content-pipeline/build.mjs — do not edit by hand.\n` +
    `// Source: FreeDict ${lang.dict} (translations) ranked by hermitdave 2018\n` +
    `// word frequency. Regenerate via the "Content pipeline" GitHub Action.\n` +
    `import type { SectionBlueprint } from "@/curriculum/generate";\n\n` +
    `export const sections: SectionBlueprint[] = ${JSON.stringify([section], null, 2)};\n`;
  writeFileSync(join(OUT_DIR, `${lang.code}.ts`), header);
  return { units: units.length, words: vocab.length };
}

function emitBarrel(builtCodes) {
  const imports = builtCodes
    .map((c) => `import { sections as ${c}Sections } from "@/curriculum/blueprints/generated/${c}";`)
    .join("\n");
  const entries = builtCodes.map((c) => `  ${c}: ${c}Sections,`).join("\n");
  const body =
    `// AUTO-GENERATED BARREL — do not edit by hand. See scripts/content-pipeline/build.mjs.\n` +
    `import type { SectionBlueprint } from "@/curriculum/generate";\n` +
    (imports ? imports + "\n\n" : "\n") +
    `export const generatedSections: Record<string, SectionBlueprint[]> = {\n${entries}\n};\n`;
  writeFileSync(join(OUT_DIR, "index.ts"), body);
}

async function buildLang(lang, enRank) {
  console.log(`\n=== ${lang.code} (${lang.name}) ===`);
  const [dict, freq] = await Promise.all([loadDictionary(lang.dict), loadFrequency(lang.freq)]);
  console.log(`  dict entries: ${dict.size}, frequency words: ${freq.length}`);
  // Among a word's candidate senses, pick the one whose English word(s) are most
  // common — that's almost always the everyday meaning, not a technical/rare one.
  const enRankOf = (g) => {
    let best = Infinity;
    for (const w of g.toLowerCase().split(/\s+/)) {
      const r = enRank.get(w);
      if (r != null && r < best) best = r;
    }
    return best;
  };
  const pickGloss = (glosses) =>
    glosses.slice().sort((a, b) => enRankOf(a) - enRankOf(b))[0];

  const vocab = [];
  const usedEn = new Set();
  const usedTarget = new Set();
  for (const w of freq.slice(SKIP_TOP)) {
    if (vocab.length >= MAX_WORDS) break;
    const hit = dict.get(w);
    if (!hit) continue;
    if (hit.orth.length < 3) continue; // skip short function words
    const targetKey = hit.orth.toLowerCase();
    if (usedTarget.has(targetKey)) continue;
    const gloss = pickGloss(hit.glosses);
    if (!gloss) continue;
    const enKey = gloss.toLowerCase();
    if (usedEn.has(enKey)) continue; // keep meanings distinct & varied
    usedTarget.add(targetKey);
    usedEn.add(enKey);
    vocab.push({ target: hit.orth, en: gloss });
  }
  console.log(`  built vocab: ${vocab.length}`);
  if (vocab.length < UNIT_SIZE) throw new Error(`Too few words for ${lang.code} (${vocab.length})`);
  const stats = emitLangFile(lang, vocab);
  console.log(`  wrote ${lang.code}.ts: ${stats.words} words in ${stats.units} units`);
  return lang.code;
}

async function main() {
  const targets = LANGS.filter((l) => ONLY.length === 0 || ONLY.includes(l.code));
  // English word-frequency ranking, used to pick the everyday sense of each word.
  const enFreq = await loadFrequency("en");
  const enRank = new Map(enFreq.map((w, i) => [w, i]));
  console.log(`English frequency rank loaded: ${enRank.size} words`);
  const built = [];
  for (const lang of targets) {
    try {
      built.push(await buildLang(lang, enRank));
    } catch (e) {
      console.error(`  !! skipped ${lang.code}: ${e.message}`);
    }
  }
  if (!built.length) {
    console.error("No languages built — leaving generated content unchanged.");
    process.exit(1);
  }
  emitBarrel(built);
  console.log(`\nDone. Built: ${built.join(", ")}`);
}

// Allow importing the pure helpers (e.g. cleanGloss) in tests without running.
if (!process.env.PIPELINE_NOMAIN) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
