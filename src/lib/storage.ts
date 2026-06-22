import AsyncStorage from "@react-native-async-storage/async-storage";

import { LANGUAGES, type Language, type LevelId } from "./languages";
import type { Lesson, Settings } from "./types";

const KEYS = {
  settings: "blahblah.settings",
  language: "blahblah.language",
  level: "blahblah.level",
  lessons: "blahblah.lessons",
} as const;

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  model: "claude-opus-4-8",
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  async getSettings(): Promise<Settings> {
    return { ...DEFAULT_SETTINGS, ...(await readJSON(KEYS.settings, {})) };
  },
  saveSettings(settings: Settings) {
    return writeJSON(KEYS.settings, settings);
  },

  async getLanguage(): Promise<Language> {
    return readJSON(KEYS.language, LANGUAGES[0]);
  },
  saveLanguage(language: Language) {
    return writeJSON(KEYS.language, language);
  },

  async getLevel(): Promise<LevelId> {
    return readJSON<LevelId>(KEYS.level, "A1");
  },
  saveLevel(level: LevelId) {
    return writeJSON(KEYS.level, level);
  },

  // Lessons are cached locally so learners can revisit them offline.
  async getLessons(): Promise<Lesson[]> {
    return readJSON<Lesson[]>(KEYS.lessons, []);
  },
  async addLesson(lesson: Lesson): Promise<Lesson[]> {
    const existing = await this.getLessons();
    const next = [lesson, ...existing].slice(0, 50);
    await writeJSON(KEYS.lessons, next);
    return next;
  },
  async clearLessons(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.lessons);
  },
};
