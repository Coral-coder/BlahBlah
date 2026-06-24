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
  sindarinBlueprint,
].map(withGenerated);

// Bump when the blueprint schema OR generator changes in a way that needs a new
// app build. Over-the-air bundles carry the same number; the app ignores a
// bundle whose schema doesn't match (and keeps using the version bundled in the
// binary), so old installs never crash on content authored for a newer engine.
export const CONTENT_SCHEMA = 1;

function buildCourses(blueprints: CourseBlueprint[]): Course[] {
  return blueprints.map(generateCourse);
}

// The courses bundled in the binary — always available offline / on first run.
const bundledCourses: Course[] = buildCourses(BLUEPRINTS);

// The active course set. Starts as the bundled one and is swapped in-place when
// a newer over-the-air bundle loads (see src/lib/remoteContent.ts). getCourse()
// stays synchronous for all the screens that call it during render.
let activeCourses: Course[] = bundledCourses;

type Listener = () => void;
const listeners = new Set<Listener>();
/** Subscribe to active-content swaps (returns an unsubscribe fn). */
export function onContentChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Replace the active courses from an OTA blueprint set; notifies subscribers. */
export function setActiveBlueprints(blueprints: CourseBlueprint[]): boolean {
  try {
    const next = buildCourses(blueprints);
    if (!next.length) return false;
    activeCourses = next;
    listeners.forEach((fn) => fn());
    return true;
  } catch {
    return false; // bad bundle: keep whatever was active
  }
}

/** Reset back to the content bundled in the binary. */
export function resetToBundledContent(): void {
  activeCourses = bundledCourses;
  listeners.forEach((fn) => fn());
}

export function getCourses(): Course[] {
  return activeCourses;
}

/** Backwards-compatible alias; prefer getCourses() so OTA swaps are picked up. */
export const COURSES: Course[] = bundledCourses;

export function getCourse(code: string): Course | undefined {
  return activeCourses.find((c) => c.code === code);
}
