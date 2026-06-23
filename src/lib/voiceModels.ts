import RNBlobUtil from "react-native-blob-util";
import { unzip } from "react-native-zip-archive";

// Catalog of downloadable on-device neural voices and a small manager that
// downloads/extracts/caches them under the app's Documents directory. Voices are
// hosted in this repo's GitHub Releases (built by the voice-models workflow from
// free, open Piper / VITS models) and pulled on demand.

export interface VoiceModel {
  id: string;
  /** Speech locale this voice serves (matches a course's speechLocale prefix). */
  locale: string;
  name: string;
  /** Human label for the language. */
  language: string;
  /** Approx download size in MB (for the UI). */
  mb: number;
  /** File names inside the extracted folder. */
  modelFile: string;
  tokensFile: string;
  dataDir: string;
  /** Default speaker id and speaking speed. */
  sid: number;
  speed: number;
}

const RELEASE = "https://github.com/Coral-coder/BlahBlah/releases/download/voice-models";

// One natural voice per supported language. IDs match the .zip asset names the
// hosting workflow produces.
export const VOICE_MODELS: VoiceModel[] = [
  {
    id: "de_DE-thorsten-medium",
    locale: "de-DE",
    name: "Thorsten (natural)",
    language: "German",
    mb: 64,
    modelFile: "model.onnx",
    tokensFile: "tokens.txt",
    dataDir: "espeak-ng-data",
    sid: 0,
    speed: 1.0,
  },
  {
    id: "es_ES-davefx-medium",
    locale: "es-ES",
    name: "Davefx (natural)",
    language: "Spanish",
    mb: 64,
    modelFile: "model.onnx",
    tokensFile: "tokens.txt",
    dataDir: "espeak-ng-data",
    sid: 0,
    speed: 1.0,
  },
  {
    id: "is_IS-steinn-medium",
    locale: "is-IS",
    name: "Steinn (natural)",
    language: "Icelandic",
    mb: 64,
    modelFile: "model.onnx",
    tokensFile: "tokens.txt",
    dataDir: "espeak-ng-data",
    sid: 0,
    speed: 1.0,
  },
  {
    id: "zh_CN-huayan-medium",
    locale: "zh-CN",
    name: "Huayan (natural)",
    language: "Chinese",
    mb: 64,
    modelFile: "model.onnx",
    tokensFile: "tokens.txt",
    dataDir: "espeak-ng-data",
    sid: 0,
    speed: 1.0,
  },
  {
    id: "th_TH-mms-medium",
    locale: "th-TH",
    name: "Thai (natural)",
    language: "Thai",
    mb: 38,
    modelFile: "model.onnx",
    tokensFile: "tokens.txt",
    dataDir: "espeak-ng-data",
    sid: 0,
    speed: 1.0,
  },
];

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
  return VOICE_MODELS.find(
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
    for (const m of VOICE_MODELS) {
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
      `${RELEASE}/${model.id}.zip`,
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
