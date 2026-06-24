import RNBlobUtil from "react-native-blob-util";

import { CONTENT_SCHEMA, setActiveBlueprints } from "@/curriculum";
import type { CourseBlueprint } from "@/curriculum/generate";

// Over-the-air content: the app ships with content baked into the binary, but on
// launch it also pulls the latest content bundle from this public repo's GitHub
// Releases (CDN-backed, no auth). That lets lessons be edited/added — even whole
// languages — without a new app build. The bundle is cached to disk so it's
// available instantly on the next cold start and offline.
//
// Safety: a schema number gates the bundle. If the bundle's schema doesn't match
// what this build understands, it's ignored and the bundled content is used —
// so a bundle authored for a newer engine can never break an older install.

interface ContentBundle {
  schema: number;
  /** Opaque version (git sha / timestamp) used to skip redundant re-applies. */
  version: string;
  courses: CourseBlueprint[];
}

const BUNDLE_URL =
  "https://github.com/Coral-coder/BlahBlah/releases/download/content/content-bundle.json";
const CACHE_PATH = `${RNBlobUtil.fs.dirs.DocumentDir}/content-bundle.json`;

let appliedVersion: string | null = null;

function isValidBundle(b: unknown): b is ContentBundle {
  if (!b || typeof b !== "object") return false;
  const x = b as Partial<ContentBundle>;
  return (
    typeof x.schema === "number" &&
    Array.isArray(x.courses) &&
    x.courses.every(
      (c) => c && typeof (c as CourseBlueprint).code === "string" && Array.isArray((c as CourseBlueprint).sections),
    )
  );
}

function applyBundle(b: ContentBundle): boolean {
  if (b.schema !== CONTENT_SCHEMA) return false;
  if (b.version && b.version === appliedVersion) return false;
  if (setActiveBlueprints(b.courses)) {
    appliedVersion = b.version ?? null;
    return true;
  }
  return false;
}

/** Apply the disk-cached bundle (fast path on cold start). Returns true if applied. */
export async function loadCachedContent(): Promise<boolean> {
  try {
    if (!(await RNBlobUtil.fs.exists(CACHE_PATH))) return false;
    const raw = await RNBlobUtil.fs.readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!isValidBundle(parsed)) return false;
    return applyBundle(parsed);
  } catch {
    return false;
  }
}

/** Fetch the latest bundle, apply it if newer, and cache it. Returns true if applied. */
export async function refreshRemoteContent(): Promise<boolean> {
  try {
    const res = await fetch(BUNDLE_URL, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) return false;
    const text = await res.text();
    const parsed = JSON.parse(text);
    if (!isValidBundle(parsed)) return false;
    const applied = applyBundle(parsed);
    if (applied) {
      await RNBlobUtil.fs.writeFile(CACHE_PATH, text, "utf8").catch(() => {});
    }
    return applied;
  } catch {
    return false;
  }
}

/** Cold-start sequence: cached first (instant), then network refresh. */
export async function initRemoteContent(): Promise<void> {
  await loadCachedContent();
  await refreshRemoteContent();
}
