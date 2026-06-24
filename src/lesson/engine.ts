import type { Exercise } from "@/curriculum/types";

/** Normalize answer text for forgiving comparison (case, spacing, end punctuation). */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.?!,]+$/g, "");
}

/** Diacritic-insensitive form (é→e, ß stays) for forgiving typed grading. */
function deburr(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = Array.from({ length: n + 1 }, (_, i) => i);
  const curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** Forgiving check for typed answers: ignores case/spacing/accents and tolerates
 *  a small number of typos so a missing umlaut or slip doesn't block progress. */
export function typedAnswerCorrect(answer: string, response: string): boolean {
  const a = normalize(answer);
  const r = normalize(response);
  if (a === r) return true;
  const da = deburr(a);
  const dr = deburr(r);
  if (da === dr) return true;
  const tolerance = Math.max(1, Math.floor(da.length / 12));
  return editDistance(da, dr) <= tolerance;
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
    case "type":
      return typeof response === "string" && typedAnswerCorrect(exercise.answer, response);
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
