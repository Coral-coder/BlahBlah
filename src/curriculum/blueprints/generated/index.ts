// AUTO-GENERATED BARREL — do not edit by hand.
//
// The content pipeline (`scripts/content-pipeline/build.mjs`, run by the
// "Content pipeline" GitHub Action) regenerates the per-language section files
// in this folder from open data (FreeDict translations ranked by word
// frequency), and rewrites this barrel to import them. Until the pipeline has
// run, this map is empty and the app uses only the hand-authored blueprints.
//
// Each value is an array of SectionBlueprint appended to that language's course.
import type { SectionBlueprint } from "@/curriculum/generate";

export const generatedSections: Record<string, SectionBlueprint[]> = {};
