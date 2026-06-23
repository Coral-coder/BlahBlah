// Milestone badges, derived purely from the persisted progress state — no extra
// tracking required. Each achievement reports earned/locked plus progress so the
// UI can show a bar toward the next tier.
import type { Persisted } from "@/state/ProgressContext";

export interface AchievementStats {
  lessons: number;
  words: number;
  xp: number;
  maxStreak: number;
  languages: number;
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  goal: number;
  value: number;
  earned: boolean;
  /** 0..1 toward the goal */
  progress: number;
}

export function computeStats(state: Persisted): AchievementStats {
  const lessons = Object.values(state.byCourse).reduce(
    (s, cp) => s + Object.keys(cp.completed).length,
    0,
  );
  const words = Object.values(state.learnedVocab).reduce(
    (s, m) => s + Object.keys(m).length,
    0,
  );
  const languages = Object.values(state.byCourse).filter(
    (cp) => Object.keys(cp.completed).length > 0,
  ).length;
  return { lessons, words, xp: state.xp, maxStreak: state.maxStreak, languages };
}

interface Def {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  goal: number;
  metric: keyof AchievementStats;
}

const DEFS: Def[] = [
  { id: "first", emoji: "🐣", title: "First Steps", desc: "Finish your first lesson", goal: 1, metric: "lessons" },
  { id: "going", emoji: "🚶", title: "Getting Going", desc: "Finish 10 lessons", goal: 10, metric: "lessons" },
  { id: "committed", emoji: "🏃", title: "Committed", desc: "Finish 50 lessons", goal: 50, metric: "lessons" },
  { id: "century", emoji: "💯", title: "Centurion", desc: "Finish 100 lessons", goal: 100, metric: "lessons" },
  { id: "marathon", emoji: "🏅", title: "Marathoner", desc: "Finish 500 lessons", goal: 500, metric: "lessons" },

  { id: "words50", emoji: "📝", title: "Wordsmith", desc: "Learn 50 words", goal: 50, metric: "words" },
  { id: "words250", emoji: "📚", title: "Bookworm", desc: "Learn 250 words", goal: 250, metric: "words" },
  { id: "words1000", emoji: "🧠", title: "Vocab Vault", desc: "Learn 1,000 words", goal: 1000, metric: "words" },

  { id: "streak3", emoji: "✨", title: "Spark", desc: "Reach a 3-day streak", goal: 3, metric: "maxStreak" },
  { id: "streak7", emoji: "🔥", title: "On Fire", desc: "Reach a 7-day streak", goal: 7, metric: "maxStreak" },
  { id: "streak30", emoji: "⚡", title: "Unstoppable", desc: "Reach a 30-day streak", goal: 30, metric: "maxStreak" },
  { id: "streak100", emoji: "👑", title: "Legendary", desc: "Reach a 100-day streak", goal: 100, metric: "maxStreak" },

  { id: "xp1k", emoji: "⭐", title: "Rising Star", desc: "Earn 1,000 XP", goal: 1000, metric: "xp" },
  { id: "xp10k", emoji: "🌟", title: "XP Machine", desc: "Earn 10,000 XP", goal: 10000, metric: "xp" },
  { id: "xp50k", emoji: "💫", title: "XP Legend", desc: "Earn 50,000 XP", goal: 50000, metric: "xp" },

  { id: "lang2", emoji: "🌍", title: "Bilingual Brain", desc: "Start 2 languages", goal: 2, metric: "languages" },
  { id: "lang3", emoji: "🌐", title: "Globetrotter", desc: "Start 3 languages", goal: 3, metric: "languages" },
];

export function computeAchievements(state: Persisted): Achievement[] {
  const stats = computeStats(state);
  return DEFS.map((d) => {
    const value = stats[d.metric];
    return {
      id: d.id,
      emoji: d.emoji,
      title: d.title,
      desc: d.desc,
      goal: d.goal,
      value,
      earned: value >= d.goal,
      progress: Math.max(0, Math.min(1, value / d.goal)),
    };
  });
}
