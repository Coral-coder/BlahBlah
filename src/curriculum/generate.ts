import type {
  CEFR,
  Course,
  Exercise,
  Lesson,
  Section,
  Unit,
} from "@/curriculum/types";

// ----------------------------------------------------------------------------
// Blueprint: the compact, hand-authored input. A small vocab + sentence bank per
// unit is expanded by `generateCourse` into many lessons that introduce new
// words a couple at a time and continually review earlier ones (spaced
// repetition), so vocabulary builds gradually instead of all at once.
// ----------------------------------------------------------------------------

export interface VocabItem {
  /** Target-language word/phrase. */
  target: string;
  /** English meaning. */
  en: string;
  /** Optional pronunciation aid (e.g. pinyin). */
  pinyin?: string;
}

export interface SentenceItem {
  /** Target sentence as SINGLE-space-separated words (for the tile mechanic). */
  target: string;
  en: string;
  pinyin?: string;
}

export interface UnitBlueprint {
  id: string;
  title: string;
  subtitle: string;
  cefr: CEFR;
  color: string;
  icon: string;
  vocab: VocabItem[];
  sentences?: SentenceItem[];
}

export interface SectionBlueprint {
  id: string;
  title: string;
  subtitle: string;
  units: UnitBlueprint[];
}

export interface CourseBlueprint {
  code: string;
  name: string;
  endonym: string;
  flag: string;
  fromLanguage: string;
  speechLocale?: string;
  sections: SectionBlueprint[];
}

// ----------------------------------------------------------------------------
// Deterministic RNG so generated lessons are stable build-to-build.
// ----------------------------------------------------------------------------
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled<T>(arr: readonly T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample<T>(arr: readonly T[], n: number, r: () => number): T[] {
  return shuffled(arr, r).slice(0, n);
}

// ----------------------------------------------------------------------------
// Exercise builders
// ----------------------------------------------------------------------------
const NEW_PER_INTRO = 2; // new words introduced per "new words" lesson
const END_REVIEWS = 4; // cumulative review lessons appended per unit

function words(sentence: string): string[] {
  return sentence.split(" ").filter(Boolean);
}

function distractorWords(
  pool: VocabItem[],
  exclude: Set<string>,
  n: number,
  r: () => number,
): string[] {
  const all: string[] = [];
  for (const v of pool) for (const w of words(v.target)) if (!exclude.has(w)) all.push(w);
  return sample(Array.from(new Set(all)), n, r);
}

function mkMatch(items: VocabItem[], r: () => number): Exercise {
  const picked = sample(items, Math.min(5, Math.max(3, items.length)), r);
  return {
    type: "match",
    prompt: "Tap the matching pairs",
    pairs: picked.map((v) => ({
      target: v.target,
      source: v.en,
      sub: v.pinyin,
      speak: v.target,
    })),
  };
}

function mkSelect(correct: VocabItem, pool: VocabItem[], r: () => number): Exercise {
  const distract = sample(
    pool.filter((v) => v.target !== correct.target),
    3,
    r,
  );
  const opts = shuffled([correct, ...distract], r);
  return {
    type: "select",
    prompt: "Select the correct translation",
    question: correct.en,
    options: opts.map((o) => o.target),
    optionSubs: opts.some((o) => o.pinyin) ? opts.map((o) => o.pinyin ?? "") : undefined,
    answer: opts.findIndex((o) => o.target === correct.target),
  };
}

function mkListenWord(correct: VocabItem, pool: VocabItem[], r: () => number): Exercise {
  const distract = distractorWords(pool, new Set(words(correct.target)), 3, r);
  return {
    type: "listen",
    prompt: "Tap what you hear",
    speak: correct.target,
    answer: correct.target,
    bank: shuffled([...words(correct.target), ...distract], r),
    translation: correct.en,
    pinyin: correct.pinyin,
  };
}

function mkSpeakWord(item: VocabItem): Exercise {
  return {
    type: "speak",
    prompt: "Say it out loud",
    text: item.target,
    translation: item.en,
    pinyin: item.pinyin,
  };
}

function mkWordbank(s: SentenceItem, pool: VocabItem[], r: () => number): Exercise {
  const aw = words(s.target);
  const distract = distractorWords(pool, new Set(aw), 3, r);
  return {
    type: "wordbank",
    prompt: "Translate this sentence",
    given: s.en,
    answer: s.target,
    bank: shuffled([...aw, ...distract], r),
    speak: s.target,
    pinyin: s.pinyin,
  };
}

function mkListenSentence(s: SentenceItem, pool: VocabItem[], r: () => number): Exercise {
  const aw = words(s.target);
  const distract = distractorWords(pool, new Set(aw), 2, r);
  return {
    type: "listen",
    prompt: "Tap what you hear",
    speak: s.target,
    answer: s.target,
    bank: shuffled([...aw, ...distract], r),
    translation: s.en,
    pinyin: s.pinyin,
  };
}

function mkSpeakSentence(s: SentenceItem): Exercise {
  return {
    type: "speak",
    prompt: "Say it out loud",
    text: s.target,
    translation: s.en,
    pinyin: s.pinyin,
  };
}

function mkFill(
  s: SentenceItem,
  pool: VocabItem[],
  vocabTargets: Set<string>,
  r: () => number,
): Exercise | null {
  const aw = words(s.target);
  const candidates = aw.filter((w) => vocabTargets.has(w));
  const blankWord = (candidates.length ? candidates : aw)[
    Math.floor(r() * (candidates.length ? candidates.length : aw.length))
  ];
  const idx = aw.indexOf(blankWord);
  if (idx === -1) return null;
  const distract = distractorWords(pool, new Set([blankWord]), 3, r);
  if (distract.length < 2) return null;
  return {
    type: "fill",
    prompt: "Fill in the blank",
    before: aw.slice(0, idx).join(" ") + (idx > 0 ? " " : ""),
    after: (idx < aw.length - 1 ? " " : "") + aw.slice(idx + 1).join(" "),
    answer: blankWord,
    options: shuffled([blankWord, ...distract], r),
    translation: s.en,
    pinyin: s.pinyin,
  };
}

// ----------------------------------------------------------------------------
// Lesson assembly
// ----------------------------------------------------------------------------
function introLesson(
  id: string,
  batch: VocabItem[],
  known: VocabItem[],
  r: () => number,
): Lesson {
  const ex: Exercise[] = [];
  ex.push(mkMatch([...batch, ...sample(known, 2, r)], r));
  batch.forEach((w, i) => {
    ex.push(mkSelect(w, known.length ? known : batch, r));
    if (i === 0) ex.push(mkListenWord(w, known.length ? known : batch, r));
    ex.push(mkSpeakWord(w));
  });
  // a little spaced review of older words
  sample(known, 2, r).forEach((w) => ex.push(mkSelect(w, known, r)));
  return {
    id,
    title: "New words",
    exercises: ex.slice(0, 8),
    vocab: batch.map((v) => ({ target: v.target, en: v.en, pinyin: v.pinyin })),
  };
}

function reviewLesson(
  id: string,
  pool: VocabItem[],
  sentences: SentenceItem[],
  vocabTargets: Set<string>,
  r: () => number,
): Lesson {
  const ex: Exercise[] = [];
  ex.push(mkMatch(sample(pool, 5, r), r));
  const sents = sample(sentences, 4, r);
  if (sents[0]) ex.push(mkWordbank(sents[0], pool, r));
  if (sents[1]) {
    const f = mkFill(sents[1], pool, vocabTargets, r);
    if (f) ex.push(f);
  }
  if (sents[2]) ex.push(mkListenSentence(sents[2], pool, r));
  if (sents[3]) ex.push(mkSpeakSentence(sents[3]));
  // fill remaining slots with vocab drills
  for (const v of sample(pool, 4, r)) {
    if (ex.length >= 8) break;
    ex.push(r() > 0.5 ? mkSelect(v, pool, r) : mkSpeakWord(v));
  }
  return { id, title: "Practice", exercises: ex.slice(0, 8) };
}

function buildUnit(bp: UnitBlueprint): Unit {
  const r = rng(hashString(bp.id));
  const vocab = bp.vocab;
  const sentences = bp.sentences ?? [];
  const vocabTargets = new Set(vocab.map((v) => v.target));
  const lessons: Lesson[] = [];
  const known: VocabItem[] = [];
  let lessonNo = 1;

  for (let i = 0; i < vocab.length; i += NEW_PER_INTRO) {
    const batch = vocab.slice(i, i + NEW_PER_INTRO);
    known.push(...batch);
    lessons.push(introLesson(`${bp.id}-l${lessonNo++}`, batch, known.slice(0, -batch.length), r));
    // sentences whose every word is already known
    const avail = sentences.filter((s) =>
      words(s.target).every((w) => !vocabTargets.has(w) || known.some((k) => k.target === w)),
    );
    lessons.push(
      reviewLesson(`${bp.id}-l${lessonNo++}`, [...known], avail.length ? avail : sentences, vocabTargets, r),
    );
  }
  for (let k = 0; k < END_REVIEWS; k++) {
    lessons.push(reviewLesson(`${bp.id}-l${lessonNo++}`, vocab, sentences, vocabTargets, r));
  }

  return {
    id: bp.id,
    title: bp.title,
    subtitle: bp.subtitle,
    cefr: bp.cefr,
    color: bp.color,
    icon: bp.icon,
    lessons,
    vocab: vocab.map((v) => ({ target: v.target, en: v.en, pinyin: v.pinyin })),
  };
}

export function generateCourse(bp: CourseBlueprint): Course {
  const sections: Section[] = bp.sections.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    units: s.units.map(buildUnit),
  }));
  return {
    code: bp.code,
    name: bp.name,
    endonym: bp.endonym,
    flag: bp.flag,
    fromLanguage: bp.fromLanguage,
    speechLocale: bp.speechLocale,
    sections,
  };
}
