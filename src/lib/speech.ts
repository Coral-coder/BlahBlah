import { Platform } from "react-native";
import Tts from "react-native-tts";

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
export function speak(text: string, languageTag?: string): void {
  ensureInit();
  const locale = languageTag ?? currentLocale;
  const spoken = locale?.startsWith("zh") ? text.replace(/\s+/g, "") : text;
  try {
    Tts.stop();
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
