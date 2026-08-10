import type {
  CEFR,
  Course,
  Exercise,
  Lesson,
  Section,
  Unit,
} from "@/curriculum/types";
import { emojiFor } from "@/curriculum/emoji";
import { getTips } from "@/tips/content";

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

/** A teaching note shown (as a concept card) before practice in a unit. */
export interface TeachNote {
  title: string;
  body: string;
  examples?: { target: string; en: string; pinyin?: string }[];
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
  /** Explicit instruction shown at the start of this unit (script, grammar, …). */
  teach?: TeachNote[];
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
// Lessons introduce just a FEW new words but are filled out with heavy spaced
// repetition: earlier words are pulled in at random so each word recurs many
// times, spread randomly across later lessons (the core of durable memory).
const NEW_PER_LESSON = 3; // only 2–3 new words per lesson
const MAX_EX_PER_LESSON = 16; // filled mostly with random review of earlier words
const END_REVIEWS = 3; // cumulative review lessons appended per unit

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

function mkConcept(t: TeachNote): Exercise {
  return { type: "concept", title: t.title, body: t.body, examples: t.examples };
}

function mkCard(v: VocabItem): Exercise {
  return {
    type: "card",
    target: v.target,
    en: v.en,
    pinyin: v.pinyin,
    emoji: emojiFor(v.en),
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

function mkType(s: SentenceItem): Exercise {
  return {
    type: "type",
    prompt: "Type this in the target language",
    question: s.en,
    answer: s.target,
    pinyin: s.pinyin,
    speak: s.target,
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
function uniqByTarget(items: VocabItem[]): VocabItem[] {
  const seen = new Set<string>();
  const out: VocabItem[] = [];
  for (const v of items) if (!seen.has(v.target)) (seen.add(v.target), out.push(v));
  return out;
}

/** Ensure a lesson has at least 3 exercises by padding with safe drills. */
function pad(ex: Exercise[], pool: VocabItem[], r: () => number): Exercise[] {
  const extras = sample(pool, 6, r);
  let i = 0;
  while (ex.length < 3 && i < extras.length) ex.push(mkSpeakWord(extras[i++]));
  return ex.slice(0, MAX_EX_PER_LESSON);
}

// A varied per-word practice exercise — rotated by index so a batch of new words
// isn't drilled the same way five times in a row (select → listen → speak).
// `speech` is false for constructed languages (Elvish/Klingon/Dragon) that have
// no speech-recognition locale — there we never emit speak exercises (they can't
// be scored), substituting another type instead.
function practiceForWord(
  word: VocabItem,
  pool: VocabItem[],
  i: number,
  r: () => number,
  speech: boolean,
): Exercise {
  const mode = i % 3;
  if (mode === 0 && pool.length >= 4) return mkSelect(word, pool, r);
  if (mode === 1) return mkListenWord(word, pool, r);
  if (speech) return mkSpeakWord(word);
  return pool.length >= 4 ? mkSelect(word, pool, r) : mkListenWord(word, pool, r);
}

// A dense lesson: teach a batch of new words, practise each once (varied), use
// them in sentences where possible, then lightly review earlier words.
function teachLesson(
  id: string,
  newWords: VocabItem[],
  known: VocabItem[],
  sentences: SentenceItem[],
  vocabTargets: Set<string>,
  r: () => number,
  speech: boolean,
): Lesson {
  const pool = uniqByTarget([...newWords, ...known]);
  const knownTargets = new Set([...known, ...newWords].map((v) => v.target));
  const ex: Exercise[] = [];

  // 1) Teach: an intro card for each new word.
  for (const w of newWords) ex.push(mkCard(w));
  // 2) Bind the batch together with a matching exercise.
  if (pool.length >= 3) {
    ex.push(mkMatch(uniqByTarget([...newWords, ...sample(known, 2, r)]), r));
  }
  // 3) Practise each new word once, with a rotating exercise type.
  newWords.forEach((w, i) => ex.push(practiceForWord(w, pool, i, r, speech)));
  // 4) Apply in sentences the learner can fully build from words seen so far.
  const usable = sentences.filter((s) =>
    words(s.target).every((w) => !vocabTargets.has(w) || knownTargets.has(w)),
  );
  const sents = sample(usable.length ? usable : sentences, 4, r);
  if (sents[0]) ex.push(mkWordbank(sents[0], pool, r));
  if (sents[1]) {
    const f = mkFill(sents[1], pool, vocabTargets, r);
    if (f) ex.push(f);
  }
  if (sents[2]) ex.push(mkListenSentence(sents[2], pool, r));
  if (sents[3]) ex.push(mkType(sents[3]));
  // 5) Fill the rest of the lesson with heavy spaced review: earlier words pulled
  //    in at random (varied exercise types) so every word recurs across many
  //    later lessons. This is where most of the repetition lives.
  if (known.length) {
    const want = MAX_EX_PER_LESSON - ex.length;
    sample(known, Math.max(0, want), r).forEach((w, i) => {
      if (ex.length < MAX_EX_PER_LESSON) ex.push(practiceForWord(w, pool, i, r, speech));
    });
  }

  return {
    id,
    title: newWords.length > 1 ? `${newWords.length} new words` : "New word",
    exercises: pad(ex, pool, r),
    vocab: newWords.map((v) => ({ target: v.target, en: v.en, pinyin: v.pinyin })),
  };
}

// A cumulative review lesson: no new words, mixed exercises over everything.
function reviewLesson(
  id: string,
  pool: VocabItem[],
  sentences: SentenceItem[],
  vocabTargets: Set<string>,
  r: () => number,
  speech: boolean,
): Lesson {
  const ex: Exercise[] = [];
  if (pool.length >= 3) ex.push(mkMatch(sample(pool, 5, r), r));
  const sents = sample(sentences, 5, r);
  if (sents[0]) ex.push(mkWordbank(sents[0], pool, r));
  if (sents[1]) {
    const f = mkFill(sents[1], pool, vocabTargets, r);
    if (f) ex.push(f);
  }
  if (sents[2]) ex.push(mkListenSentence(sents[2], pool, r));
  if (sents[3]) ex.push(speech ? mkSpeakSentence(sents[3]) : mkListenSentence(sents[3], pool, r));
  if (sents[4]) ex.push(mkType(sents[4]));
  sample(pool, 8, r).forEach((v, i) => {
    if (ex.length >= MAX_EX_PER_LESSON) return;
    ex.push(practiceForWord(v, pool, i, r, speech));
  });
  return { id, title: "Practice", exercises: pad(ex, pool, r) };
}

// Cheap lesson count for a unit WITHOUT building any exercises — must mirror the
// lesson-producing loop in buildUnit. Used by the course picker so it can show
// counts without generating every course at startup.
export function unitLessonCount(vocabLen: number): number {
  let lessons = 0;
  let known = 0;
  for (let i = 0; i < vocabLen; i += NEW_PER_LESSON) {
    const batch = Math.min(NEW_PER_LESSON, vocabLen - i);
    lessons++; // teach lesson
    known += batch;
    if (known >= NEW_PER_LESSON * 2 && (i / NEW_PER_LESSON) % 3 === 2) lessons++; // review
  }
  return lessons + END_REVIEWS;
}

export function courseLessonCount(bp: CourseBlueprint): number {
  let n = 0;
  for (const s of bp.sections) for (const u of s.units) n += unitLessonCount(u.vocab.length);
  return n;
}

function buildUnit(bp: UnitBlueprint, speech: boolean, intro: TeachNote[]): Unit {
  const r = rng(hashString(bp.id));
  const vocab = bp.vocab;
  const sentences = bp.sentences ?? [];
  const vocabTargets = new Set(vocab.map((v) => v.target));
  const lessons: Lesson[] = [];
  const known: VocabItem[] = [];
  let lessonNo = 1;

  // Teach the unit in dense batches of new words.
  for (let i = 0; i < vocab.length; i += NEW_PER_LESSON) {
    const batch = vocab.slice(i, i + NEW_PER_LESSON);
    const priorKnown = [...known];
    lessons.push(
      teachLesson(`${bp.id}-l${lessonNo++}`, batch, priorKnown, sentences, vocabTargets, r, speech),
    );
    known.push(...batch);
    // A consolidation review after every few batches, once enough is known.
    if (known.length >= NEW_PER_LESSON * 2 && (i / NEW_PER_LESSON) % 3 === 2) {
      lessons.push(
        reviewLesson(`${bp.id}-l${lessonNo++}`, [...known], sentences, vocabTargets, r, speech),
      );
    }
  }
  for (let k = 0; k < END_REVIEWS; k++) {
    lessons.push(reviewLesson(`${bp.id}-l${lessonNo++}`, vocab, sentences, vocabTargets, r, speech));
  }

  // Teach first: open the unit's first lesson with its concept card(s) so the
  // learner is taught the idea before being asked to practise it.
  const notes = [...(bp.teach ?? []), ...intro];
  if (notes.length && lessons[0]) {
    lessons[0] = {
      ...lessons[0],
      exercises: [...notes.map(mkConcept), ...lessons[0].exercises].slice(0, MAX_EX_PER_LESSON + notes.length),
    };
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

// Language prefixes whose speech can actually be RECOGNIZED on-device (iOS
// SFSpeechRecognizer / Android). Note this is different from text-to-speech:
// Icelandic has a TTS voice but no speech recognizer, so we must not generate
// speak exercises for it (they can't be scored). Constructed languages have no
// locale at all. Keep this an allowlist so we only ask people to speak when the
// device can grade it.
const SPEECH_INPUT_LOCALES = new Set([
  "en", "de", "es", "fr", "it", "pt", "nl", "sv", "da", "nb", "no", "fi",
  "pl", "tr", "ru", "uk", "cs", "sk", "hr", "hu", "ro", "el", "ca",
  "zh", "yue", "ja", "ko", "th", "id", "ms", "vi", "ar", "he", "hi",
]);
function speechSupported(locale?: string): boolean {
  if (!locale) return false;
  return SPEECH_INPUT_LOCALES.has(locale.toLowerCase().split("-")[0]);
}

export function generateCourse(bp: CourseBlueprint): Course {
  // Only generate speak exercises when the device can recognize this language.
  // (Constructed languages have no locale; Icelandic has TTS but no recognizer.)
  const speech = speechSupported(bp.speechLocale);
  // Distribute the course's grammar notes as in-lesson teaching: each of the
  // first units opens with one concept card, so the learner is taught the rules
  // in context instead of only finding them on a separate Tips screen.
  const tips = getTips(bp.code);
  let tipIdx = 0;
  const sections: Section[] = bp.sections.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    units: s.units.map((u) => {
      // A unit's own `teach` takes priority; otherwise hand it the next tip.
      const intro = (u.teach?.length ?? 0) === 0 && tipIdx < tips.length ? [tips[tipIdx++]] : [];
      return buildUnit(u, speech, intro);
    }),
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
