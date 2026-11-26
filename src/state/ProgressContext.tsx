import { durableGet, durableSet } from "@/lib/durableStore";
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
  /** Use downloaded on-device neural voices when available. */
  neuralVoices: boolean;
  /** Challenge mode: turn word-bank exercises into typed answers. */
  hardMode: boolean;
  /** Include typing exercises (when false, they become tap word-banks). */
  typingExercises: boolean;
  /** Whether the "download a natural voice" prompt has been dismissed. */
  voicePromptDismissed: boolean;
  /** Play UI sound effects (correct/wrong/complete). */
  soundEnabled: boolean;
  /** One-time flag: existing installs have been migrated to auto-download voices. */
  voiceAutoMigrated: boolean;
  /** Voice speed multiplier for spoken audio (0.5 slow … 1.2 brisk). */
  speechRate: number;
}

export interface LearnedWord {
  target: string;
  en: string;
  pinyin?: string;
}

export type QuestKind = "xp" | "lessons" | "correct";

export interface QuestItem {
  kind: QuestKind;
  label: string;
  goal: number;
  reward: number; // gems
  progress: number;
  claimed: boolean;
}

export interface DailyQuests {
  day: string;
  items: QuestItem[];
}

const MAX_FREEZES = 2;
const FREEZE_COST = 50;
const WAGER_STAKE = 50;
const WAGER_REWARD = 100;
const WAGER_DAYS = 7;

export interface Wager {
  startDay: string;
  days: number;
  stake: number;
  reward: number;
  /** Day-strings on which a lesson was completed during the wager. */
  completed: string[];
}

export type WagerState =
  | { kind: "none" }
  | { kind: "active"; done: number; target: number; todayDone: boolean }
  | { kind: "won"; reward: number }
  | { kind: "lost" };

// Daily quest pool — two difficulty tiers per kind. One of each kind is offered
// per day, with the tier picked deterministically from the date.
const QUEST_POOL: Record<QuestKind, QuestItem[]> = {
  xp: [
    { kind: "xp", label: "Earn 30 XP", goal: 30, reward: 15, progress: 0, claimed: false },
    { kind: "xp", label: "Earn 50 XP", goal: 50, reward: 25, progress: 0, claimed: false },
  ],
  lessons: [
    { kind: "lessons", label: "Complete 3 lessons", goal: 3, reward: 15, progress: 0, claimed: false },
    { kind: "lessons", label: "Complete 5 lessons", goal: 5, reward: 25, progress: 0, claimed: false },
  ],
  correct: [
    { kind: "correct", label: "Answer 20 correctly", goal: 20, reward: 15, progress: 0, claimed: false },
    { kind: "correct", label: "Answer 40 correctly", goal: 40, reward: 25, progress: 0, claimed: false },
  ],
};

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateQuests(day: string): DailyQuests {
  const seed = hashDay(day);
  const pick = (kind: QuestKind, bit: number) =>
    QUEST_POOL[kind][(seed >> bit) & 1];
  return {
    day,
    items: [pick("xp", 0), pick("lessons", 1), pick("correct", 2)].map((q) => ({
      ...q,
    })),
  };
}

function advanceQuests(
  quests: DailyQuests | undefined,
  day: string,
  deltas: Partial<Record<QuestKind, number>>,
): DailyQuests {
  const base = quests && quests.day === day ? quests : generateQuests(day);
  return {
    day,
    items: base.items.map((q) => {
      const d = deltas[q.kind] ?? 0;
      if (!d || q.claimed) return q;
      return { ...q, progress: Math.min(q.goal, q.progress + d) };
    }),
  };
}

export interface Persisted {
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
  /** course code -> (lessonId -> crown/mastery level 1..5) */
  crowns: Record<string, Record<string, number>>;
  xp: number;
  gems: number;
  maxStreak: number;
  streakFreezes: number;
  wager?: Wager | null;
  quests?: DailyQuests;
  streak: number;
  lastActiveDay?: string;
  dailyGoal: number;
  xpToday: number;
  xpTodayDay?: string;
  reminderEnabled: boolean;
  reminderHour: number;
  /** Day-string on which the daily-goal celebration was last shown. */
  goalCelebratedDay?: string;
  /** Highest streak milestone already celebrated. */
  lastStreakMilestone?: number;
  settings: Settings;
}

const DEFAULT: Persisted = {
  byCourse: {},
  learnedVocab: {},
  xpHistory: {},
  tracePractice: {},
  wordStats: {},
  crowns: {},
  xp: 0,
  gems: 0,
  maxStreak: 0,
  streakFreezes: 0,
  streak: 0,
  dailyGoal: 30,
  xpToday: 0,
  reminderEnabled: false,
  reminderHour: 19,
  settings: {
    apiKey: "",
    model: "claude-opus-4-8",
    // Natural on-device voices are on by default and download automatically for
    // the active course; users can turn this off in Settings.
    neuralVoices: true,
    hardMode: false,
    typingExercises: true,
    voicePromptDismissed: false,
    soundEnabled: true,
    voiceAutoMigrated: false,
    speechRate: 0.9,
  },
};

function dayStr(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayStr(d);
}
function parseDay(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(s: string, n: number): string {
  const d = parseDay(s);
  d.setDate(d.getDate() + n);
  return dayStr(d);
}
/** Whole calendar days between two day-strings (b - a). */
function daysBetween(a: string, b: string): number {
  const ms = parseDay(b).getTime() - parseDay(a).getTime();
  return Math.round(ms / 86400000);
}

interface ProgressContextValue {
  ready: boolean;
  state: Persisted;
  /** Streak that accounts for missed days (0 if the chain is broken). */
  currentStreak: number;
  /** XP earned today (0 if the stored value is from a previous day). */
  xpToday: number;
  /** Today's daily quests (regenerated each day). */
  todayQuests: DailyQuests;
  claimQuest: (index: number) => void;
  buyStreakFreeze: () => boolean;
  /** Double-or-Nothing wager helpers. */
  wagerState: () => WagerState;
  startWager: () => boolean;
  claimWager: () => void;
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
  /** Mastery/crown level (0..5) for a single path lesson. */
  crownLevel: (code: string, lessonId: string) => number;
  /** Sum of all crown levels earned in a course. */
  totalCrowns: (code: string) => number;
  /** XP for each of the last 7 days, oldest first. */
  weeklyXp: () => { label: string; xp: number; today: boolean }[];
  traceCount: (code: string, glyph: string) => number;
  recordTrace: (code: string, glyph: string) => void;
  recordWordResult: (code: string, target: string, correct: boolean) => void;
  applyPlacement: (code: string, completedLessonIds: string[]) => void;
  setDailyGoal: (goal: number) => void;
  /** Record that today's daily-goal celebration has been shown. */
  markGoalCelebrated: () => void;
  /** Record the highest streak milestone celebrated. */
  setStreakMilestone: (n: number) => void;
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
        const raw = await durableGet(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          const settings = { ...DEFAULT.settings, ...(parsed.settings ?? {}) };
          // One-time migration: natural voices now download automatically, so
          // turn them on for existing installs that predate this (then respect
          // the user's choice going forward).
          if (!settings.voiceAutoMigrated) {
            settings.neuralVoices = true;
            settings.voiceAutoMigrated = true;
          }
          setState({
            ...DEFAULT,
            ...parsed,
            byCourse: parsed.byCourse ?? {},
            learnedVocab: parsed.learnedVocab ?? {},
            xpHistory: parsed.xpHistory ?? {},
            tracePractice: parsed.tracePractice ?? {},
            wordStats: parsed.wordStats ?? {},
            crowns: parsed.crowns ?? {},
            settings,
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
    durableSet(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const value = useMemo<ProgressContextValue>(() => {
    const today = dayStr(new Date());
    // Missed full days since last activity (0 if active today/yesterday). A
    // streak survives as long as freezes can cover the gap.
    const missed = state.lastActiveDay ? Math.max(0, daysBetween(state.lastActiveDay, today) - 1) : 0;
    const currentStreak =
      state.lastActiveDay === today || missed <= state.streakFreezes ? state.streak : 0;
    const xpToday = state.xpTodayDay === today ? state.xpToday : 0;
    const todayQuests =
      state.quests && state.quests.day === today ? state.quests : generateQuests(today);

    const courseProgress = (code: string): CourseProgress =>
      state.byCourse[code] ?? { completed: {}, placed: false };

    return {
      ready,
      state,
      currentStreak,
      xpToday,
      todayQuests,
      claimQuest: (index) => {
        const q = todayQuests.items[index];
        if (!q || q.claimed || q.progress < q.goal) return;
        const items = todayQuests.items.map((it, i) =>
          i === index ? { ...it, claimed: true } : it,
        );
        persist({
          ...state,
          gems: state.gems + q.reward,
          quests: { day: todayQuests.day, items },
        });
      },
      wagerState: (): WagerState => {
        const w = state.wager;
        if (!w) return { kind: "none" };
        const have = new Set(w.completed);
        const elapsed = daysBetween(w.startDay, today); // 0 on start day
        // Every fully-elapsed day in the window must have a completion.
        for (let i = 0; i < Math.min(elapsed, w.days); i++) {
          if (!have.has(addDays(w.startDay, i))) return { kind: "lost" };
        }
        let done = 0;
        for (let i = 0; i < w.days; i++) if (have.has(addDays(w.startDay, i))) done++;
        if (done >= w.days) return { kind: "won", reward: w.reward };
        return { kind: "active", done, target: w.days, todayDone: have.has(today) };
      },
      startWager: () => {
        if (state.wager || state.gems < WAGER_STAKE) return false;
        const today2 = dayStr(new Date());
        persist({
          ...state,
          gems: state.gems - WAGER_STAKE,
          wager: { startDay: today2, days: WAGER_DAYS, stake: WAGER_STAKE, reward: WAGER_REWARD, completed: [] },
        });
        return true;
      },
      claimWager: () => {
        const w = state.wager;
        if (!w) return;
        const have = new Set(w.completed);
        let done = 0;
        for (let i = 0; i < w.days; i++) if (have.has(addDays(w.startDay, i))) done++;
        if (done >= w.days) {
          persist({ ...state, gems: state.gems + w.reward, wager: null });
        } else {
          // Lost or abandoned — clear it.
          persist({ ...state, wager: null });
        }
      },
      buyStreakFreeze: () => {
        if (state.gems < FREEZE_COST || state.streakFreezes >= MAX_FREEZES) return false;
        persist({
          ...state,
          gems: state.gems - FREEZE_COST,
          streakFreezes: state.streakFreezes + 1,
        });
        return true;
      },
      courseProgress,
      isCompleted: (code, lessonId) => !!courseProgress(code).completed[lessonId],
      learnedWords: (code) => Object.values(state.learnedVocab[code] ?? {}),
      crownLevel: (code, lessonId) => state.crowns[code]?.[lessonId] ?? 0,
      totalCrowns: (code) =>
        Object.values(state.crowns[code] ?? {}).reduce((s, n) => s + n, 0),
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
        const today3 = dayStr(new Date());
        persist({
          ...state,
          wordStats: { ...state.wordStats, [code]: cs },
          quests: correct
            ? advanceQuests(state.quests, today3, { correct: 1 })
            : state.quests && state.quests.day === today3
              ? state.quests
              : generateQuests(today3),
        });
      },
      setCurrentCourse: (code) => persist({ ...state, currentCourse: code }),
      completeLesson: (code, lessonId, xpEarned, learned) => {
        const cp = courseProgress(code);
        const today2 = dayStr(new Date());
        let streak = state.streak;
        let lastActiveDay = state.lastActiveDay;
        let streakFreezes = state.streakFreezes;
        if (lastActiveDay !== today2) {
          const missedDays = lastActiveDay ? Math.max(0, daysBetween(lastActiveDay, today2) - 1) : 0;
          if (lastActiveDay === yesterdayStr()) {
            streak = state.streak + 1;
          } else if (missedDays > 0 && streakFreezes >= missedDays) {
            // Freezes cover the gap — consume them and keep the streak going.
            streakFreezes -= missedDays;
            streak = state.streak + 1;
          } else {
            streak = 1;
          }
          lastActiveDay = today2;
        }
        const baseToday = state.xpTodayDay === today2 ? state.xpToday : 0;
        const courseWords = { ...(state.learnedVocab[code] ?? {}) };
        (learned ?? []).forEach((w) => {
          courseWords[w.target] = { target: w.target, en: w.en, pinyin: w.pinyin };
        });
        // Crown/mastery: only real path lessons (auxiliary modes use a "kind:id"
        // lessonId). Each completion levels the lesson up, capped at 5.
        const courseCrowns = { ...(state.crowns[code] ?? {}) };
        if (!lessonId.includes(":")) {
          courseCrowns[lessonId] = Math.min(5, (courseCrowns[lessonId] ?? 0) + 1);
        }
        persist({
          ...state,
          byCourse: {
            ...state.byCourse,
            [code]: { ...cp, completed: { ...cp.completed, [lessonId]: true } },
          },
          learnedVocab: { ...state.learnedVocab, [code]: courseWords },
          crowns: { ...state.crowns, [code]: courseCrowns },
          xpHistory: {
            ...state.xpHistory,
            [today2]: (state.xpHistory[today2] ?? 0) + xpEarned,
          },
          xp: state.xp + xpEarned,
          gems: state.gems + 1,
          maxStreak: Math.max(state.maxStreak, streak),
          streakFreezes,
          wager: state.wager
            ? {
                ...state.wager,
                completed: state.wager.completed.includes(today2)
                  ? state.wager.completed
                  : [...state.wager.completed, today2],
              }
            : state.wager,
          quests: advanceQuests(state.quests, today2, { xp: xpEarned, lessons: 1 }),
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
      markGoalCelebrated: () => persist({ ...state, goalCelebratedDay: dayStr(new Date()) }),
      setStreakMilestone: (n) => persist({ ...state, lastStreakMilestone: n }),
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
