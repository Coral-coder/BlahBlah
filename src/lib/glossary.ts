// Word-level translation hints. Built from each course's vocab so a learner can
// tap any target-language word in a lesson and instantly see what it means — and
// so non-Latin scripts (Thai, Chinese) can show a romanization under each tile.
import { getCourse } from "@/curriculum";

function norm(w: string): string {
  return w
    .toLowerCase()
    .replace(/[.,!?;:¿¡"'“”()…»«·、。！？，]/g, "")
    .trim();
}

interface Maps {
  gloss: Record<string, string>;
  roman: Record<string, string>;
}
const cache: Record<string, Maps> = {};
let active: Maps = { gloss: {}, roman: {} };

function build(code: string): Maps {
  if (cache[code]) return cache[code];
  const course = getCourse(code);
  const gloss: Record<string, string> = {};
  const roman: Record<string, string> = {};
  if (course) {
    for (const s of course.sections) {
      for (const u of s.units) {
        for (const v of u.vocab ?? []) {
          const key = norm(v.target);
          if (key && !(key in gloss)) gloss[key] = v.en;
          if (key && v.pinyin && !(key in roman)) roman[key] = v.pinyin;
        }
      }
    }
  }
  cache[code] = { gloss, roman };
  return cache[code];
}

/** Point the lookup at a course (called when a lesson opens). */
export function setActiveGlossary(code?: string): void {
  active = code ? build(code) : { gloss: {}, roman: {} };
}

/** English gloss for a single target-language word, if known. */
export function glossWord(word: string): string | undefined {
  return active.gloss[norm(word)];
}

/** Romanization/reading for a single target word (Thai, Chinese, …), if known. */
export function romanizeWord(word: string): string | undefined {
  return active.roman[norm(word)];
}
