import RNBlobUtil from "react-native-blob-util";
import { unzip } from "react-native-zip-archive";

import { VOICE_MODELS as BUNDLED_VOICES, VOICE_RELEASE_BASE, type VoiceModel } from "./voiceCatalog";

// Manager that downloads/extracts/caches on-device neural voices under the app's
// Documents directory. The catalog itself (which voices exist, their URLs and
// settings) comes from the active content bundle — bundled in the binary by
// default, replaced by the over-the-air bundle when one loads — so adding a
// language's voice never needs an app build.

export type { VoiceModel };

// Active catalog + download base, swappable from the OTA bundle.
let activeVoices: VoiceModel[] = BUNDLED_VOICES;
let releaseBase: string = VOICE_RELEASE_BASE;

/** Replace the voice catalog (and optionally its download base) from the OTA bundle. */
export function setActiveVoices(voices?: VoiceModel[], baseUrl?: string): void {
  if (Array.isArray(voices) && voices.length) activeVoices = voices;
  if (typeof baseUrl === "string" && baseUrl) releaseBase = baseUrl;
}

export function getVoices(): VoiceModel[] {
  return activeVoices;
}

/** Back-compat: the active catalog (was a static const). */
export const VOICE_MODELS: VoiceModel[] = BUNDLED_VOICES;

const ROOT = `${RNBlobUtil.fs.dirs.DocumentDir}/voices`;

/** In-memory set of installed model ids, scanned once at startup. */
const installed = new Set<string>();
let scanned = false;

export function modelDir(id: string): string {
  return `${ROOT}/${id}`;
}

export function modelForLocale(locale?: string): VoiceModel | undefined {
  if (!locale) return undefined;
  const prefix = locale.toLowerCase().split("-")[0];
  return activeVoices.find(
    (m) => m.locale.toLowerCase() === locale.toLowerCase() || m.locale.toLowerCase().startsWith(prefix),
  );
}

/** Populate the installed set from disk (call once on app start). */
export async function scanInstalled(): Promise<void> {
  if (scanned) return;
  scanned = true;
  try {
    const exists = await RNBlobUtil.fs.exists(ROOT);
    if (!exists) return;
    for (const m of activeVoices) {
      const ok = await RNBlobUtil.fs.exists(`${modelDir(m.id)}/${m.modelFile}`);
      if (ok) installed.add(m.id);
    }
  } catch {
    // ignore
  }
}

export function isInstalled(id: string): boolean {
  return installed.has(id);
}

export function installedModelForLocale(locale?: string): VoiceModel | undefined {
  const m = modelForLocale(locale);
  return m && installed.has(m.id) ? m : undefined;
}

/** Download + extract a model. onProgress gets 0..1. */
export async function downloadModel(
  model: VoiceModel,
  onProgress?: (p: number) => void,
): Promise<boolean> {
  const dir = modelDir(model.id);
  const zipPath = `${ROOT}/${model.id}.zip`;
  try {
    await RNBlobUtil.fs.mkdir(ROOT).catch(() => {});
    const task = RNBlobUtil.config({ path: zipPath, fileCache: true }).fetch(
      "GET",
      `${releaseBase}/${model.id}.zip`,
    );
    task.progress({ interval: 250 }, (received, total) => {
      if (total > 0 && onProgress) onProgress(Math.min(0.95, received / total));
    });
    const res = await task;
    const status = res.info().status;
    if (status >= 400) throw new Error(`HTTP ${status}`);
    await RNBlobUtil.fs.unlink(dir).catch(() => {});
    await unzip(zipPath, dir);
    await RNBlobUtil.fs.unlink(zipPath).catch(() => {});
    const ok = await RNBlobUtil.fs.exists(`${dir}/${model.modelFile}`);
    if (ok) {
      installed.add(model.id);
      onProgress?.(1);
      return true;
    }
    return false;
  } catch {
    await RNBlobUtil.fs.unlink(zipPath).catch(() => {});
    return false;
  }
}

export async function removeModel(id: string): Promise<void> {
  installed.delete(id);
  await RNBlobUtil.fs.unlink(modelDir(id)).catch(() => {});
}
