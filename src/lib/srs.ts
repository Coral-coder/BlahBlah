import type { Course } from "@/curriculum/types";
import { learnedWordsFor, type LearnedWord } from "@/lib/learned";

const DAY = 86_400_000;
// Leitner-style intervals (days) indexed by a word's strength bucket.
const INTERVALS = [0, 1, 3, 7, 16, 35];

type Stats = Record<string, { c: number; w: number; t: number }>;

function strengthBucket(s: { c: number; w: number }): number {
  return Math.max(0, Math.min(INTERVALS.length - 1, s.c - s.w));
}

/** Is this word due for review now? Unseen learned words are always due. */
export function isDue(stat: { c: number; w: number; t: number } | undefined): boolean {
  if (!stat || stat.t === 0) return true;
  return Date.now() - stat.t >= INTERVALS[strengthBucket(stat)] * DAY;
}

/** Words that are due for spaced review (weakest/oldest first). */
export function dueWords(
  course: Course,
  isCompleted: (code: string, lessonId: string) => boolean,
  stats: Stats,
): LearnedWord[] {
  return learnedWordsFor(course, isCompleted)
    .filter((w) => isDue(stats[w.target]))
    .sort((a, b) => {
      const sa = stats[a.target];
      const sb = stats[b.target];
      const na = sa ? sa.c - sa.w : 0;
      const nb = sb ? sb.c - sb.w : 0;
      return na - nb || (sa?.t ?? 0) - (sb?.t ?? 0);
    });
}
