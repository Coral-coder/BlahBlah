import type { Course } from "@/curriculum/types";
import { germanCourse } from "@/curriculum/courses/de";
import { spanishCourse } from "@/curriculum/courses/es";

export const COURSES: Course[] = [germanCourse, spanishCourse];

export function getCourse(code: string): Course | undefined {
  return COURSES.find((c) => c.code === code);
}
