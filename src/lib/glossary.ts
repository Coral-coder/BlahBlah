// Word-level translation hints. Built from each course's vocab so a learner can
// tap any target-language word in a lesson and instantly see what it means.
import { getCourse } from "@/curriculum";

function norm(w: string): string {
  return w
    .toLowerCase()
    .replace(/[.,!?;:¿¡"'“”()…»«·、。！？，]/g, "")
    .trim();
}

const cache: Record<string, Record<string, string>> = {};
let active: Record<string, string> = {};

function build(code: string): Record<string, string> {
  if (cache[code]) return cache[code];
  const course = getCourse(code);
  const g: Record<string, string> = {};
  if (course) {
    for (const s of course.sections) {
      for (const u of s.units) {
        for (const v of u.vocab ?? []) {
          const key = norm(v.target);
          if (key && !(key in g)) g[key] = v.en;
        }
      }
    }
  }
  cache[code] = g;
  return g;
}

/** Point the lookup at a course (called when a lesson opens). */
export function setActiveGlossary(code?: string): void {
  active = code ? build(code) : {};
}

/** English gloss for a single target-language word, if known. */
export function glossWord(word: string): string | undefined {
  return active[norm(word)];
}
