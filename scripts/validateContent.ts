/* eslint-disable no-console */
// Content integrity checker for every generated course. Run via `npm run
// validate:content` (here, through a Babel require-hook) and in CI. The goal:
// as content scales to thousands of items, we never ship a broken exercise.
import { getCourses } from "@/curriculum";
import { flattenCourse, type Exercise } from "@/curriculum/types";

const COURSES = getCourses();

export interface Problem {
  course: string;
  lesson: string;
  detail: string;
}

function checkExercise(e: Exercise): string | null {
  switch (e.type) {
    case "select":
      if (!e.options?.length) return "select has no options";
      if (e.answer < 0 || e.answer >= e.options.length) return "select answer index out of range";
      if (new Set(e.options).size !== e.options.length) return "select has duplicate options";
      return null;
    case "wordbank":
    case "listen": {
      if (!e.answer?.trim()) return `${e.type} has empty answer`;
      const missing = e.answer.split(" ").filter((w) => w && !e.bank.includes(w));
      if (missing.length) return `${e.type} answer word(s) not in bank: ${missing.join(",")}`;
      return null;
    }
    case "fill":
      if (!e.options?.includes(e.answer)) return "fill answer not among options";
      return null;
    case "type":
      if (!e.answer?.trim() || !e.question?.trim()) return "type missing answer/question";
      return null;
    case "match":
      if (!e.pairs?.length) return "match has no pairs";
      if (e.pairs.some((p) => !p.target?.trim() || !p.source?.trim())) return "match pair has empty side";
      return null;
    case "speak":
      if (!e.text?.trim()) return "speak has empty text";
      return null;
    case "card":
      if (!e.target?.trim() || !e.en?.trim()) return "card missing target/meaning";
      return null;
    default:
      return null;
  }
}

export function validateAllCourses(): Problem[] {
  const problems: Problem[] = [];
  for (const course of COURSES) {
    const nodes = flattenCourse(course);
    if (nodes.length === 0) problems.push({ course: course.code, lesson: "-", detail: "course has no lessons" });
    for (const n of nodes) {
      if (!n.lesson.exercises?.length) {
        problems.push({ course: course.code, lesson: n.lesson.id, detail: "lesson has no exercises" });
        continue;
      }
      for (const e of n.lesson.exercises) {
        const err = checkExercise(e);
        if (err) problems.push({ course: course.code, lesson: n.lesson.id, detail: `${e.type}: ${err}` });
      }
    }
  }
  return problems;
}

export function courseStats() {
  return COURSES.map((c) => {
    const nodes = flattenCourse(c);
    const ex = nodes.reduce((s, n) => s + n.lesson.exercises.length, 0);
    const words = new Set();
    c.sections.forEach((s) => s.units.forEach((u) => (u.vocab ?? []).forEach((v) => words.add(v.target))));
    return { code: c.code, name: c.name, lessons: nodes.length, exercises: ex, vocab: words.size };
  });
}
