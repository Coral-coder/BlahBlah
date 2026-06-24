import { Platform } from "react-native";
import Sound from "react-native-sound";
import Tts from "react-native-tts";

import { loadNeuralModel, neuralAvailable, synthesizeToFile } from "./neuralTts";
import {
  downloadModel,
  installedModelForLocale,
  isInstalled,
  modelDir,
  modelForLocale,
  scanInstalled,
} from "./voiceModels";

// Master switch for on-device neural voices (set from Settings). When on and a
// neural model is installed for the active locale, speak() uses it; otherwise it
// falls back to the system voice.
let neuralEnabled = false;
export function setNeuralEnabled(on: boolean): void {
  neuralEnabled = on;
  if (on) void ensureNeuralVoice();
}

// Auto-download: when neural voices are on and the engine is present, the natural
// voice for the active course is fetched in the background the first time we see
// its locale. Until it lands, speak() uses the system voice; afterwards it
// upgrades automatically. One attempt per voice per session.
const autoAttempted = new Set<string>();
let downloadListener: ((id: string, progress: number) => void) | undefined;
/** Settings can subscribe to show live auto-download progress. */
export function setVoiceDownloadListener(fn?: (id: string, progress: number) => void): void {
  downloadListener = fn;
}

export async function ensureNeuralVoice(locale?: string): Promise<void> {
  const loc = locale ?? currentLocale;
  if (!neuralEnabled || !neuralAvailable() || !loc) return;
  const model = modelForLocale(loc);
  if (!model) return;
  await scanInstalled();
  if (isInstalled(model.id) || autoAttempted.has(model.id)) return;
  autoAttempted.add(model.id);
  // Fire-and-forget; failures just leave the system voice in place (we'll retry
  // next session). Progress is forwarded to any UI listener.
  void downloadModel(model, (p) => downloadListener?.(model.id, p)).catch(() => {});
}

let currentSound: Sound | null = null;
function playFile(path: string): void {
  try {
    currentSound?.stop(() => currentSound?.release());
  } catch {
    // no-op
  }
  const s = new Sound(path, "", (err) => {
    if (err) return;
    currentSound = s;
    s.play(() => s.release());
  });
}

// Returns true if it handled speaking via the neural engine.
async function speakNeural(text: string, locale: string, slow: boolean): Promise<boolean> {
  const model = installedModelForLocale(locale);
  if (!model) return false;
  const ok = await loadNeuralModel({
    dir: modelDir(model.id),
    modelFile: model.modelFile,
    tokensFile: model.tokensFile,
    dataDir: model.dataDir,
  });
  if (!ok) return false;
  // Higher speed value = slower speech in sherpa-onnx (length scale).
  const speed = slow ? model.speed * 1.5 : model.speed;
  const path = await synthesizeToFile(text, { sid: model.sid, speed });
  if (!path) return false;
  playFile(path);
  return true;
}

// The active course's speech locale (e.g. "zh-CN"), set when a lesson starts so
// every speak() call uses the right voice without threading it through props.
let currentLocale: string | undefined;
let initialized = false;

type Voice = {
  id: string;
  language: string;
  quality?: number | string;
  notInstalled?: boolean;
  networkConnectionRequired?: boolean;
};
let voices: Voice[] = [];
let voicesLoaded = false;
const chosenVoice: Record<string, string> = {}; // locale -> voice id

function ensureInit(): void {
  if (initialized) return;
  initialized = true;
  try {
    if (Platform.OS === "ios" && typeof (Tts as any).setIgnoreSilentSwitch === "function") {
      (Tts as any).setIgnoreSilentSwitch("ignore");
    }
    Tts.setDefaultRate(0.48);
  } catch {
    // no-op
  }
  scanInstalled();
}

async function loadVoices(): Promise<void> {
  if (voicesLoaded) return;
  voicesLoaded = true;
  try {
    voices = (await Tts.voices()) as unknown as Voice[];
  } catch {
    voices = [];
  }
}

function qualityScore(v: Voice): number {
  const q = v.quality;
  if (typeof q === "number") return q; // iOS: 300 default, 500 enhanced/premium
  const s = String(q).toLowerCase();
  if (s.includes("premium")) return 600;
  if (s.includes("enhanced")) return 500;
  return 300;
}

/** Pick the most natural installed voice for a locale (prefers enhanced/premium). */
function bestVoiceFor(locale: string): string | undefined {
  const lang = locale.toLowerCase();
  const prefix = lang.split("-")[0];
  const cands = voices.filter((v) => {
    if (v.notInstalled) return false;
    const vl = String(v.language).toLowerCase();
    return vl === lang || vl.startsWith(prefix + "-") || vl === prefix;
  });
  if (!cands.length) return undefined;
  cands.sort((a, b) => qualityScore(b) - qualityScore(a));
  return cands[0].id;
}

export async function setSpeechLocale(locale?: string): Promise<void> {
  currentLocale = locale;
  if (!locale) return;
  ensureInit();
  // Kick off the natural-voice download for this course in the background.
  void ensureNeuralVoice(locale);
  await loadVoices();
  if (!chosenVoice[locale]) {
    const id = bestVoiceFor(locale);
    if (id) chosenVoice[locale] = id;
  }
  // Switch the engine to this language's voice immediately so a previous
  // language's voice never bleeds into the new one.
  try {
    if (chosenVoice[locale]) await Tts.setDefaultVoice(chosenVoice[locale]);
  } catch {
    // some engines reject setDefaultVoice; language fallback below still applies
  }
  try {
    await Tts.setDefaultLanguage(locale);
  } catch {
    // no-op
  }
}

export function getSpeechLocale(): string {
  return currentLocale ?? "en-US";
}

/** True if a high-quality (Enhanced/Premium) voice is installed for the locale. */
export async function hasNaturalVoice(locale: string): Promise<boolean> {
  await loadVoices();
  const id = bestVoiceFor(locale);
  if (!id) return false;
  const v = voices.find((x) => x.id === id);
  return !!v && qualityScore(v) >= 500;
}

/**
 * Speak text in the active locale's voice. Sets the voice/language on every call
 * so rapidly switching languages can't leave a stale voice selected.
 */
export function speak(text: string, languageTag?: string, opts?: { slow?: boolean }): void {
  ensureInit();
  const slow = !!opts?.slow;
  const locale = languageTag ?? currentLocale;
  const spoken = locale?.startsWith("zh") ? text.replace(/\s+/g, "") : text;

  // Prefer the on-device neural voice when enabled and installed for this locale.
  if (neuralEnabled && neuralAvailable() && locale) {
    Tts.stop();
    speakNeural(spoken, locale, slow).then((handled) => {
      if (!handled) systemSpeak(spoken, locale, slow);
    });
    return;
  }
  systemSpeak(spoken, locale, slow);
}

/** Convenience: speak slowly (for a long-press "hear it slowly" affordance). */
export function speakSlow(text: string, languageTag?: string): void {
  speak(text, languageTag, { slow: true });
}

function systemSpeak(spoken: string, locale?: string, slow?: boolean): void {
  try {
    Tts.stop();
    Tts.setDefaultRate(slow ? 0.3 : 0.48);
    if (locale) {
      const vid = chosenVoice[locale];
      if (vid) Tts.setDefaultVoice(vid).catch(() => {});
      Tts.setDefaultLanguage(locale).catch(() => {});
    }
    Tts.speak(spoken);
  } catch {
    // no-op
  }
}
