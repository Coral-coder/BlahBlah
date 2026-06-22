// BlahBlah leads with German and Chinese but supports any language: the AI tutor
// is prompted with whatever target language string is selected, so the featured
// list is just a convenience. Users can also pick "Other" and type a language.
export type Language = {
  code: string;
  name: string; // English name, used in prompts
  endonym: string; // how the language refers to itself
  flag: string;
  /** Hint passed to the tutor so it can add pronunciation aids (e.g. pinyin). */
  scriptHint?: string;
  featured?: boolean;
};

export const LANGUAGES: Language[] = [
  { code: "de", name: "German", endonym: "Deutsch", flag: "🇩🇪", featured: true },
  {
    code: "zh",
    name: "Mandarin Chinese",
    endonym: "中文",
    flag: "🇨🇳",
    featured: true,
    scriptHint:
      "Always include pinyin with tone marks alongside Chinese characters.",
  },
  { code: "es", name: "Spanish", endonym: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", endonym: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italian", endonym: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", endonym: "日本語", flag: "🇯🇵", scriptHint: "Include romaji alongside Japanese script." },
  { code: "ko", name: "Korean", endonym: "한국어", flag: "🇰🇷", scriptHint: "Include romanization alongside Hangul." },
  { code: "pt", name: "Portuguese", endonym: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", endonym: "Русский", flag: "🇷🇺", scriptHint: "Include romanization alongside Cyrillic." },
  { code: "ar", name: "Arabic", endonym: "العربية", flag: "🇸🇦", scriptHint: "Include transliteration; note right-to-left script." },
];

export const CEFR_LEVELS = [
  { id: "A1", label: "A1 · Beginner" },
  { id: "A2", label: "A2 · Elementary" },
  { id: "B1", label: "B1 · Intermediate" },
  { id: "B2", label: "B2 · Upper-Int." },
  { id: "C1", label: "C1 · Advanced" },
] as const;

export type LevelId = (typeof CEFR_LEVELS)[number]["id"];

export function customLanguage(name: string): Language {
  return { code: `custom:${name.toLowerCase()}`, name, endonym: name, flag: "🌐" };
}
