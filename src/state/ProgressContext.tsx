import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ModelId } from "@/lib/types";

const STORAGE_KEY = "blahblah.progress.v1";

export interface CourseProgress {
  /** lessonId -> completed */
  completed: Record<string, true>;
  /** whether the placement test has been taken (or skipped) for this course */
  placed: boolean;
}

export interface Settings {
  apiKey: string;
  model: ModelId;
}

export interface LearnedWord {
  target: string;
  en: string;
  pinyin?: string;
}

interface Persisted {
  currentCourse?: string;
  byCourse: Record<string, CourseProgress>;
  /** course code -> (target word -> learned word) */
  learnedVocab: Record<string, Record<string, LearnedWord>>;
  /** date (YYYY-M-D) -> XP earned that day */
  xpHistory: Record<string, number>;
  /** course code -> (glyph -> times practiced in tracing) */
  tracePractice: Record<string, Record<string, number>>;
  /** course code -> (word target -> recall stats) for spaced review */
  wordStats: Record<string, Record<string, { c: number; w: number; t: number }>>;
  xp: number;
  streak: number;
  lastActiveDay?: string;
  dailyGoal: number;
  xpToday: number;
  xpTodayDay?: string;
  reminderEnabled: boolean;
  reminderHour: number;
  settings: Settings;
}

const DEFAULT: Persisted = {
  byCourse: {},
  learnedVocab: {},
  xpHistory: {},
  tracePractice: {},
  wordStats: {},
  xp: 0,
  streak: 0,
  dailyGoal: 30,
  xpToday: 0,
  reminderEnabled: false,
  reminderHour: 19,
  settings: { apiKey: "", model: "claude-opus-4-8" },
};

function dayStr(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
}

interface ProgressContextValue {
  ready: boolean;
  state: Persisted;
  /** Streak that accounts for missed days (0 if the chain is broken). */
  currentStreak: number;
  /** XP earned today (0 if the stored value is from a previous day). */
  xpToday: number;
  setCurrentCourse: (code: string) => void;
  courseProgress: (code: string) => CourseProgress;
  isCompleted: (code: string, lessonId: string) => boolean;
  completeLesson: (
    code: string,
    lessonId: string,
    xpEarned: number,
    learned?: LearnedWord[],
  ) => void;
  learnedWords: (code: string) => LearnedWord[];
  /** XP for each of the last 7 days, oldest first. */
  weeklyXp: () => { label: string; xp: number; today: boolean }[];
  traceCount: (code: string, glyph: string) => number;
  recordTrace: (code: string, glyph: string) => void;
  recordWordResult: (code: string, target: string, correct: boolean) => void;
  applyPlacement: (code: string, completedLessonIds: string[]) => void;
  setDailyGoal: (goal: number) => void;
  setReminder: (enabled: boolean, hour: number) => void;
  setSettings: (partial: Partial<Settings>) => void;
  resetCourse: (code: string) => void;
}

const Ctx = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<Persisted>(DEFAULT);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          setState({
            ...DEFAULT,
            ...parsed,
            byCourse: parsed.byCourse ?? {},
            learnedVocab: parsed.learnedVocab ?? {},
            xpHistory: parsed.xpHistory ?? {},
            tracePractice: parsed.tracePractice ?? {},
            wordStats: parsed.wordStats ?? {},
            settings: { ...DEFAULT.settings, ...(parsed.settings ?? {}) },
          });
        }
      } catch {
        // ignore corrupt storage
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Persisted) => {
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const value = useMemo<ProgressContextValue>(() => {
    const today = dayStr(new Date());
    const currentStreak =
      state.lastActiveDay === today || state.lastActiveDay === yesterdayStr()
        ? state.streak
        : 0;
    const xpToday = state.xpTodayDay === today ? state.xpToday : 0;

    const courseProgress = (code: string): CourseProgress =>
      state.byCourse[code] ?? { completed: {}, placed: false };

    return {
      ready,
      state,
      currentStreak,
      xpToday,
      courseProgress,
      isCompleted: (code, lessonId) => !!courseProgress(code).completed[lessonId],
      learnedWords: (code) => Object.values(state.learnedVocab[code] ?? {}),
      weeklyXp: () => {
        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const out: { label: string; xp: number; today: boolean }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          out.push({
            label: labels[d.getDay()],
            xp: state.xpHistory[dayStr(d)] ?? 0,
            today: i === 0,
          });
        }
        return out;
      },
      traceCount: (code, glyph) => state.tracePractice[code]?.[glyph] ?? 0,
      recordTrace: (code, glyph) => {
        const courseTrace = { ...(state.tracePractice[code] ?? {}) };
        courseTrace[glyph] = (courseTrace[glyph] ?? 0) + 1;
        persist({
          ...state,
          tracePractice: { ...state.tracePractice, [code]: courseTrace },
        });
      },
      recordWordResult: (code, target, correct) => {
        const cs = { ...(state.wordStats[code] ?? {}) };
        const prev = cs[target] ?? { c: 0, w: 0, t: 0 };
        cs[target] = {
          c: prev.c + (correct ? 1 : 0),
          w: prev.w + (correct ? 0 : 1),
          t: Date.now(),
        };
        persist({ ...state, wordStats: { ...state.wordStats, [code]: cs } });
      },
      setCurrentCourse: (code) => persist({ ...state, currentCourse: code }),
      completeLesson: (code, lessonId, xpEarned, learned) => {
        const cp = courseProgress(code);
        const today2 = dayStr(new Date());
        let streak = state.streak;
        let lastActiveDay = state.lastActiveDay;
        if (lastActiveDay !== today2) {
          streak = lastActiveDay === yesterdayStr() ? state.streak + 1 : 1;
          lastActiveDay = today2;
        }
        const baseToday = state.xpTodayDay === today2 ? state.xpToday : 0;
        const courseWords = { ...(state.learnedVocab[code] ?? {}) };
        (learned ?? []).forEach((w) => {
          courseWords[w.target] = { target: w.target, en: w.en, pinyin: w.pinyin };
        });
        persist({
          ...state,
          byCourse: {
            ...state.byCourse,
            [code]: { ...cp, completed: { ...cp.completed, [lessonId]: true } },
          },
          learnedVocab: { ...state.learnedVocab, [code]: courseWords },
          xpHistory: {
            ...state.xpHistory,
            [today2]: (state.xpHistory[today2] ?? 0) + xpEarned,
          },
          xp: state.xp + xpEarned,
          streak,
          lastActiveDay,
          xpToday: baseToday + xpEarned,
          xpTodayDay: today2,
        });
      },
      applyPlacement: (code, completedLessonIds) => {
        const cp = courseProgress(code);
        const completed = { ...cp.completed };
        completedLessonIds.forEach((id) => (completed[id] = true));
        persist({
          ...state,
          byCourse: { ...state.byCourse, [code]: { completed, placed: true } },
        });
      },
      setDailyGoal: (goal) => persist({ ...state, dailyGoal: goal }),
      setReminder: (enabled, hour) =>
        persist({ ...state, reminderEnabled: enabled, reminderHour: hour }),
      setSettings: (partial) =>
        persist({ ...state, settings: { ...state.settings, ...partial } }),
      resetCourse: (code) =>
        persist({
          ...state,
          byCourse: { ...state.byCourse, [code]: { completed: {}, placed: false } },
        }),
    };
  }, [ready, state, persist]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
