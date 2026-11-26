// Short, illustrated reading/listening "Stories" (Duolingo-Stories style): a
// sequence of lines in the target language with tap-to-reveal translations and
// audio, followed by a couple of comprehension questions.

export interface StoryLine {
  /** Optional speaker name/emoji, e.g. "🧑 Ana". */
  speaker?: string;
  /** Target-language line. */
  target: string;
  /** English translation (revealed on tap). */
  en: string;
  /** Optional pronunciation aid (e.g. pinyin / romanization). */
  pinyin?: string;
}

export interface StoryQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface Story {
  id: string;
  courseCode: string;
  title: string;
  emoji: string;
  cefr: string;
  /** One-line English blurb. */
  blurb: string;
  lines: StoryLine[];
  questions: StoryQuestion[];
}
