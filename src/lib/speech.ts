import { Platform } from "react-native";
import Tts from "react-native-tts";

// The active course's speech locale (e.g. "zh-CN"), set when a lesson starts so
// every speak() call uses the right voice without threading it through props.
let currentLocale: string | undefined;
let initialized = false;

function ensureInit(): void {
  if (initialized) return;
  initialized = true;
  try {
    // iOS respects the ring/silent switch for TTS by default, which is the most
    // common reason "no sound" happens. Route audio to playback so lessons are
    // audible even when the phone is on silent.
    if (Platform.OS === "ios" && typeof (Tts as any).setIgnoreSilentSwitch === "function") {
      (Tts as any).setIgnoreSilentSwitch("ignore");
    }
    // A slightly slower rate is clearer for learners.
    Tts.setDefaultRate(0.48);
  } catch {
    // no-op
  }
}

export function setSpeechLocale(locale?: string): void {
  currentLocale = locale;
}

/**
 * Thin wrapper over react-native-tts so screens can just call `speak(text)`.
 * Failures (e.g. no TTS engine on the device) are swallowed — listening is a
 * nice-to-have, not something that should crash a lesson.
 */
export function speak(text: string, languageTag?: string): void {
  ensureInit();
  const locale = languageTag ?? currentLocale;
  // Word-bank answers are space-separated for the tile UI; spoken Chinese should
  // have no spaces so the engine reads it naturally.
  const spoken = locale?.startsWith("zh") ? text.replace(/\s+/g, "") : text;

  const run = () => {
    try {
      Tts.stop();
      if (locale) {
        // Best-effort; ignored if the device lacks a voice for this language.
        Tts.setDefaultLanguage(locale).catch(() => {});
      }
      Tts.speak(spoken);
    } catch {
      // no-op
    }
  };

  // Wait for the engine to be ready (resolves immediately if already inited).
  try {
    const status = Tts.getInitStatus?.();
    if (status && typeof status.then === "function") status.then(run).catch(run);
    else run();
  } catch {
    run();
  }
}
