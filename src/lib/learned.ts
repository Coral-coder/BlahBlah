import { flattenCourse, type Course } from "@/curriculum/types";

export interface LearnedWord {
  target: string;
  en: string;
  pinyin?: string;
}

/**
 * The vocabulary a learner has met, derived from every COMPLETED lesson in the
 * course. Deriving from completion (rather than a separately-tracked set) makes
 * the list correct retroactively — including lessons finished before the words
 * list existed.
 */
export function learnedWordsFor(
  course: Course,
  isCompleted: (code: string, lessonId: string) => boolean,
): LearnedWord[] {
  const out: LearnedWord[] = [];
  const seen = new Set<string>();
  for (const node of flattenCourse(course)) {
    if (!isCompleted(course.code, node.lesson.id)) continue;
    for (const v of node.lesson.vocab ?? []) {
      if (!seen.has(v.target)) {
        seen.add(v.target);
        out.push({ target: v.target, en: v.en, pinyin: v.pinyin });
      }
    }
  }
  return out;
}
