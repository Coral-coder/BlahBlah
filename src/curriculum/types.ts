// The content model for structured, Duolingo-style courses.
//
// A Course is a tree: Section → Unit → Lesson → Exercise. The learning path is
// the in-order flattening of all lessons; a lesson unlocks when the previous one
// is complete. All content is hand-authored data (no AI generation at runtime).

export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1";

/** Multiple choice — pick the one correct option. */
export interface SelectExercise {
  type: "select";
  /** Short instruction, e.g. "Select the correct translation". */
  prompt: string;
  /** The word/phrase the question is about (shown large). */
  question: string;
  /** Optional smaller line under the question (e.g. pinyin or a gloss). */
  subtext?: string;
  /** Optional text to speak aloud (target language). */
  speak?: string;
  options: string[];
  /** Optional pronunciation/gloss shown under each option (parallel to options). */
  optionSubs?: string[];
  /** Index into options of the correct answer. */
  answer: number;
}

/** Build the target-language sentence by tapping word tiles in order. */
export interface WordbankExercise {
  type: "wordbank";
  prompt: string;
  /** The source-language sentence to translate. */
  given: string;
  /** The correct target sentence (space-separated words). */
  answer: string;
  /** Tiles to choose from — the answer words plus distractors. */
  bank: string[];
  /** Optional TTS of the answer. */
  speak?: string;
  /** Optional pronunciation (e.g. pinyin), revealed after answering. */
  pinyin?: string;
  /** Optional English meaning, revealed after answering. */
  translation?: string;
}

/** Tap the word that fills the blank. */
export interface FillExercise {
  type: "fill";
  prompt: string;
  /** Text before the blank. */
  before: string;
  /** Text after the blank. */
  after: string;
  /** The correct word. */
  answer: string;
  /** Choices including the answer. */
  options: string[];
  /** Optional English meaning shown under the sentence. */
  translation?: string;
  /** Optional pronunciation (e.g. pinyin) shown under the sentence. */
  pinyin?: string;
  speak?: string;
}

/** Match target words to their translations by tapping pairs. */
export interface MatchExercise {
  type: "match";
  prompt: string;
  /** `sub` is an optional small line under the target (e.g. pinyin). */
  pairs: { target: string; source: string; sub?: string; speak?: string }[];
}

/** Hear a sentence and rebuild it from word tiles. */
export interface ListenExercise {
  type: "listen";
  prompt: string;
  /** Required: the sentence spoken aloud. */
  speak: string;
  answer: string;
  bank: string[];
  /** English meaning, revealed after answering. */
  translation?: string;
  /** Optional pronunciation (e.g. pinyin), revealed after answering. */
  pinyin?: string;
}

export type Exercise =
  | SelectExercise
  | WordbankExercise
  | FillExercise
  | MatchExercise
  | ListenExercise;

export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: string;
  /** One-line description of what this unit teaches. */
  subtitle: string;
  cefr: CEFR;
  /** Theme color (hex) for the unit header + lesson nodes. */
  color: string;
  /** Emoji shown on the unit header. */
  icon: string;
  lessons: Lesson[];
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  units: Unit[];
}

export interface Course {
  /** Language code, e.g. "de". */
  code: string;
  name: string;
  endonym: string;
  flag: string;
  fromLanguage: string;
  /** BCP-47 locale for text-to-speech, e.g. "zh-CN", "de-DE". */
  speechLocale?: string;
  sections: Section[];
}

/** A lesson flattened into path order, with its unit/section context. */
export interface PathNode {
  lesson: Lesson;
  unit: Unit;
  section: Section;
  /** 0-based index of this lesson in the whole course. */
  index: number;
  /** 0-based index of this lesson within its unit. */
  indexInUnit: number;
  unitLessonCount: number;
}

/** Flatten a course into ordered path nodes. */
export function flattenCourse(course: Course): PathNode[] {
  const nodes: PathNode[] = [];
  let index = 0;
  for (const section of course.sections) {
    for (const unit of section.units) {
      unit.lessons.forEach((lesson, indexInUnit) => {
        nodes.push({
          lesson,
          unit,
          section,
          index: index++,
          indexInUnit,
          unitLessonCount: unit.lessons.length,
        });
      });
    }
  }
  return nodes;
}
