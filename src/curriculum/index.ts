import type { Course } from "@/curriculum/types";
import { generateCourse, type CourseBlueprint } from "@/curriculum/generate";
import { germanBlueprint } from "@/curriculum/blueprints/de";
import { germanThemeSections } from "@/curriculum/blueprints/de_themes";
import { chineseBlueprint } from "@/curriculum/blueprints/zh";
import { chineseThemeSections } from "@/curriculum/blueprints/zh_themes";
import { spanishBlueprint } from "@/curriculum/blueprints/es";
import { spanishExtraSections } from "@/curriculum/blueprints/es_extra";
import { spanishThemeSections } from "@/curriculum/blueprints/es_themes";
import { thaiBlueprint } from "@/curriculum/blueprints/th";
import { thaiThemeSections } from "@/curriculum/blueprints/th_themes";
import { icelandicBlueprint } from "@/curriculum/blueprints/is";
import { frenchBlueprint } from "@/curriculum/blueprints/fr";
import { frenchExtraSections } from "@/curriculum/blueprints/fr_extra";
import { frenchThemeSections } from "@/curriculum/blueprints/fr_themes";
import { italianBlueprint } from "@/curriculum/blueprints/it";
import { italianExtraSections } from "@/curriculum/blueprints/it_extra";
import { italianThemeSections } from "@/curriculum/blueprints/it_themes";
import { sindarinBlueprint } from "@/curriculum/blueprints/sindarin";

// Courses are generated from compact vocab/sentence blueprints: the generator
// expands each unit into many lessons that introduce a couple of words at a time
// and continually review earlier ones (spaced repetition).
const germanFull: CourseBlueprint = {
  ...germanBlueprint,
  sections: [...germanBlueprint.sections, ...germanThemeSections],
};
const spanishFull: CourseBlueprint = {
  ...spanishBlueprint,
  sections: [...spanishBlueprint.sections, ...spanishExtraSections, ...spanishThemeSections],
};
const chineseFull: CourseBlueprint = {
  ...chineseBlueprint,
  sections: [...chineseBlueprint.sections, ...chineseThemeSections],
};
const thaiFull: CourseBlueprint = {
  ...thaiBlueprint,
  sections: [...thaiBlueprint.sections, ...thaiThemeSections],
};
const frenchFull: CourseBlueprint = {
  ...frenchBlueprint,
  sections: [...frenchBlueprint.sections, ...frenchExtraSections, ...frenchThemeSections],
};
const italianFull: CourseBlueprint = {
  ...italianBlueprint,
  sections: [...italianBlueprint.sections, ...italianExtraSections, ...italianThemeSections],
};

export const COURSES: Course[] = [
  generateCourse(germanFull),
  generateCourse(chineseFull),
  generateCourse(thaiFull),
  generateCourse(spanishFull),
  generateCourse(icelandicBlueprint),
  generateCourse(frenchFull),
  generateCourse(italianFull),
  generateCourse(sindarinBlueprint),
];

export function getCourse(code: string): Course | undefined {
  return COURSES.find((c) => c.code === code);
}
