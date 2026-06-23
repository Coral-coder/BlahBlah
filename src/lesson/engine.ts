import type { Exercise } from "@/curriculum/types";

/** Normalize answer text for forgiving comparison (case, spacing, end punctuation). */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.?!,]+$/g, "");
}

/**
 * Check a response against an exercise.
 * - select: response is the chosen option index (number)
 * - wordbank / listen: response is the assembled sentence (string)
 * - fill: response is the chosen word (string)
 * Match exercises are validated in the UI (all pairs matched) and not passed here.
 */
export function isCorrect(exercise: Exercise, response: number | string): boolean {
  switch (exercise.type) {
    case "select":
      return response === exercise.answer;
    case "wordbank":
    case "listen":
      return (
        typeof response === "string" &&
        normalize(response) === normalize(exercise.answer)
      );
    case "fill":
      return (
        typeof response === "string" &&
        normalize(response) === normalize(exercise.answer)
      );
    default:
      return false;
  }
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** XP for finishing a lesson: base + perfect-run bonus. */
export function lessonXp(mistakes: number): number {
  const BASE = 15;
  return mistakes === 0 ? BASE + 5 : BASE;
}
