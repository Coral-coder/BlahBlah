import type { Course } from "@/curriculum/types";
import { germanCourse as germanBase } from "@/curriculum/courses/de";
import { advancedGermanSections } from "@/curriculum/courses/de_advanced";
import { spanishCourse } from "@/curriculum/courses/es";
import { chineseCourse } from "@/curriculum/courses/zh";

// German spans A1 → C2: base (A1–A2) plus the advanced sections (B1–C2).
const germanCourse: Course = {
  ...germanBase,
  sections: [...germanBase.sections, ...advancedGermanSections],
};

export const COURSES: Course[] = [germanCourse, chineseCourse, spanishCourse];

export function getCourse(code: string): Course | undefined {
  return COURSES.find((c) => c.code === code);
}
