import type { Course } from "@/curriculum/types";
import { generateCourse, type CourseBlueprint } from "@/curriculum/generate";
import { germanBlueprint } from "@/curriculum/blueprints/de";
import { chineseBlueprint } from "@/curriculum/blueprints/zh";
import { spanishBlueprint } from "@/curriculum/blueprints/es";
import { spanishExtraSections } from "@/curriculum/blueprints/es_extra";
import { thaiBlueprint } from "@/curriculum/blueprints/th";

// Courses are generated from compact vocab/sentence blueprints: the generator
// expands each unit into many lessons that introduce a couple of words at a time
// and continually review earlier ones (spaced repetition).
const spanishFull: CourseBlueprint = {
  ...spanishBlueprint,
  sections: [...spanishBlueprint.sections, ...spanishExtraSections],
};

export const COURSES: Course[] = [
  generateCourse(germanBlueprint),
  generateCourse(chineseBlueprint),
  generateCourse(thaiBlueprint),
  generateCourse(spanishFull),
];

export function getCourse(code: string): Course | undefined {
  return COURSES.find((c) => c.code === code);
}
