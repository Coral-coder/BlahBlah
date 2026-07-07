import type { Course } from "@/curriculum/types";
import { generateCourse, courseLessonCount, type CourseBlueprint } from "@/curriculum/generate";
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
import { klingonBlueprint } from "@/curriculum/blueprints/klingon";
import { dovahzulBlueprint } from "@/curriculum/blueprints/dovahzul";
import { japaneseBlueprint } from "@/curriculum/blueprints/japanese";
import { russianBlueprint } from "@/curriculum/blueprints/russian";
import { generatedSections } from "@/curriculum/blueprints/generated";

// Append any pipeline-generated sections for a language onto its blueprint.
function withGenerated(bp: CourseBlueprint): CourseBlueprint {
  const extra = generatedSections[bp.code];
  return extra && extra.length ? { ...bp, sections: [...bp.sections, ...extra] } : bp;
}

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

// The compact blueprint inputs for every course, with pipeline-generated
// sections already folded in. This is the canonical content payload: it is what
// gets serialized into the over-the-air content bundle, and what the generator
// expands into full courses on device.
export const BLUEPRINTS: CourseBlueprint[] = [
  germanFull,
  chineseFull,
  thaiFull,
  spanishFull,
  icelandicBlueprint,
  frenchFull,
  italianFull,
  japaneseBlueprint,
  russianBlueprint,
  sindarinBlueprint,
  klingonBlueprint,
  dovahzulBlueprint,
].map(withGenerated);

// Bump when the blueprint schema OR generator changes in a way that needs a new
// app build. Over-the-air bundles carry the same number; the app ignores a
// bundle whose schema doesn't match (and keeps using the version bundled in the
// binary), so old installs never crash on content authored for a newer engine.
export const CONTENT_SCHEMA = 1;

// The active blueprint set. Starts as the bundled one and is swapped when a newer
// over-the-air bundle loads (see src/lib/remoteContent.ts). Courses are generated
// LAZILY (per-course, cached) so launching the app never expands every course's
// lessons up front — important as the vocabulary grows into the thousands.
let activeBlueprints: CourseBlueprint[] = BLUEPRINTS;
const courseCache = new Map<string, Course>();

type Listener = () => void;
const listeners = new Set<Listener>();
/** Subscribe to active-content swaps (returns an unsubscribe fn). */
export function onContentChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Replace the active blueprints from an OTA bundle; clears the cache + notifies. */
export function setActiveBlueprints(blueprints: CourseBlueprint[]): boolean {
  if (!Array.isArray(blueprints) || !blueprints.length) return false;
  try {
    generateCourse(blueprints[0]); // validate the bundle is usable
  } catch {
    return false; // bad bundle: keep whatever was active
  }
  activeBlueprints = blueprints;
  courseCache.clear();
  listeners.forEach((fn) => fn());
  return true;
}

/** Replace a single course's blueprint (per-course OTA chapter); rebuilds lazily. */
export function setCourseBlueprint(bp: CourseBlueprint): boolean {
  try {
    generateCourse(bp); // validate
  } catch {
    return false;
  }
  const idx = activeBlueprints.findIndex((b) => b.code === bp.code);
  activeBlueprints =
    idx >= 0
      ? activeBlueprints.map((b) => (b.code === bp.code ? bp : b))
      : [...activeBlueprints, bp];
  courseCache.delete(bp.code);
  listeners.forEach((fn) => fn());
  return true;
}

/** Reset back to the content bundled in the binary. */
export function resetToBundledContent(): void {
  activeBlueprints = BLUEPRINTS;
  courseCache.clear();
  manifestSummaries = null;
  listeners.forEach((fn) => fn());
}

// The course picker prefers the OTA manifest (so it reflects the latest catalog
// without downloading any course); falls back to whatever blueprints are loaded.
let manifestSummaries: CourseSummary[] | null = null;
export function setManifestSummaries(summaries: CourseSummary[] | null): void {
  manifestSummaries = summaries && summaries.length ? summaries : null;
  listeners.forEach((fn) => fn());
}

/** Generate (and cache) a single course on demand. */
export function getCourse(code: string): Course | undefined {
  const cached = courseCache.get(code);
  if (cached) return cached;
  const bp = activeBlueprints.find((b) => b.code === code);
  if (!bp) return undefined;
  const course = generateCourse(bp);
  courseCache.set(code, course);
  return course;
}

/** Lightweight course list for the picker — no exercise generation. */
export interface CourseSummary {
  code: string;
  name: string;
  endonym: string;
  flag: string;
  sections: number;
  lessons: number;
}
export function getCourseSummaries(): CourseSummary[] {
  if (manifestSummaries) return manifestSummaries;
  return activeBlueprints.map((bp) => ({
    code: bp.code,
    name: bp.name,
    endonym: bp.endonym,
    flag: bp.flag,
    sections: bp.sections.length,
    lessons: courseLessonCount(bp),
  }));
}

/** Build every course (eager). For tooling/validation — avoid in app hot paths. */
export function getCourses(): Course[] {
  return activeBlueprints.map((bp) => getCourse(bp.code)!);
}
