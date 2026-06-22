import type { Language, LevelId } from "./languages";

/** A single vocabulary item in a generated lesson. */
export type VocabItem = {
  term: string; // in the target language (with script aids if applicable)
  pronunciation?: string; // pinyin / romaji / IPA-ish hint
  translation: string; // English meaning
  example: string; // example sentence in target language
  exampleTranslation: string;
};

/** A comprehension / production exercise. */
export type Exercise = {
  prompt: string; // the question (may mix English + target language)
  answer: string; // expected answer
  hint?: string;
};

/** A full AI-generated immersion lesson. */
export type Lesson = {
  title: string;
  topic: string;
  language: string;
  level: LevelId;
  /** Short immersion paragraph in the target language. */
  immersionText: string;
  immersionTranslation: string;
  vocabulary: VocabItem[];
  exercises: Exercise[];
  createdAt: number;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  /** What is shown in the bubble. */
  content: string;
  /** Optional English gloss the tutor provides for its own target-language reply. */
  translation?: string;
};

export type ModelId =
  | "claude-opus-4-8"
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5";

export type Settings = {
  apiKey: string;
  model: ModelId;
};

export type AppState = {
  settings: Settings;
  language: Language;
  level: LevelId;
};
