import type { Course } from "@/curriculum/types";
import { germanCourse } from "@/curriculum/courses/de";
import { spanishCourse } from "@/curriculum/courses/es";
import { chineseCourse } from "@/curriculum/courses/zh";

export const COURSES: Course[] = [germanCourse, chineseCourse, spanishCourse];

export function getCourse(code: string): Course | undefined {
  return COURSES.find((c) => c.code === code);
}
