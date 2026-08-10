import RNBlobUtil from "react-native-blob-util";

import {
  CONTENT_SCHEMA,
  setCourseBlueprint,
  setManifestSummaries,
  type CourseSummary,
} from "@/curriculum";
import type { CourseBlueprint } from "@/curriculum/generate";
import { setActiveVoices } from "@/lib/voiceModels";
import type { VoiceModel } from "@/lib/voiceCatalog";

// Over-the-air content, split into chapters:
//
//   • content-manifest.json  — tiny: course list + lesson counts + voice catalog.
//     Fetched on launch/foreground so the picker is always current. (~3 KB)
//   • course-<code>.json     — one language's full blueprint, fetched only when
//     that language is opened, then cached to disk. (~tens–hundreds of KB)
//
// The app always ships with full content baked into the binary, so everything
// works offline / on first run and a failed fetch never leaves the app empty —
// OTA only ever *upgrades* a course in place. A schema number gates everything.

interface Manifest {
  schema: number;
  version: string;
  voices?: VoiceModel[];
  voicesBaseUrl?: string;
  courses: CourseSummary[];
}

const RELEASE = "https://github.com/Coral-coder/BlahBlah/releases/download/content";
const DIR = `${RNBlobUtil.fs.dirs.DocumentDir}/content`;
const manifestCache = `${DIR}/content-manifest.json`;
const courseCache = (code: string) => `${DIR}/course-${code}.json`;

let manifestVersion: string | null = null;
const appliedCourseVersion: Record<string, string> = {};

async function readJson(path: string): Promise<any | null> {
  try {
    if (!(await RNBlobUtil.fs.exists(path))) return null;
    return JSON.parse(await RNBlobUtil.fs.readFile(path, "utf8"));
  } catch {
    return null;
  }
}
async function writeJson(path: string, text: string): Promise<void> {
  try {
    await RNBlobUtil.fs.mkdir(DIR).catch(() => {});
    await RNBlobUtil.fs.writeFile(path, text, "utf8");
  } catch {
    // ignore
  }
}
async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function applyManifest(m: unknown): boolean {
  if (!m || typeof m !== "object") return false;
  const x = m as Manifest;
  if (x.schema !== CONTENT_SCHEMA || !Array.isArray(x.courses)) return false;
  setActiveVoices(x.voices, x.voicesBaseUrl);
  setManifestSummaries(x.courses);
  manifestVersion = x.version ?? null;
  return true;
}

function applyCourse(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const x = payload as { schema: number; version: string; course: CourseBlueprint };
  if (x.schema !== CONTENT_SCHEMA || !x.course || typeof x.course.code !== "string") return null;
  if (!setCourseBlueprint(x.course)) return null;
  appliedCourseVersion[x.course.code] = x.version ?? "";
  return x.course.code;
}

/** Launch: apply cached manifest instantly, then refresh it from the network. */
export async function initRemoteContent(): Promise<void> {
  const cached = await readJson(manifestCache);
  if (cached) applyManifest(cached);
  await refreshManifest();
}

/** Re-fetch just the small manifest (cheap; safe to call on every foreground). */
export async function refreshManifest(): Promise<boolean> {
  const text = await fetchText(`${RELEASE}/content-manifest.json`);
  if (!text) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return false;
  }
  if (applyManifest(parsed)) {
    await writeJson(manifestCache, text);
    return true;
  }
  return false;
}

/**
 * Ensure a language's content is loaded: apply the cached chapter immediately
 * (instant), then fetch the latest in the background. Call this when a course is
 * opened — it's cheap if already current. The bundled blueprint remains the
 * fallback, so this only upgrades.
 */
export async function ensureCourse(code: string): Promise<void> {
  const cached = await readJson(courseCache(code));
  if (cached) applyCourse(cached);
  const text = await fetchText(`${RELEASE}/course-${code}.json`);
  if (!text) return;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return;
  }
  // Skip re-applying an unchanged chapter (avoids needless lesson rebuilds).
  const v = (parsed as any)?.version;
  if (v && appliedCourseVersion[code] === v) return;
  if (applyCourse(parsed)) {
    await writeJson(courseCache(code), text);
  }
}
