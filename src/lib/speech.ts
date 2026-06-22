import Tts from "react-native-tts";

/**
 * Thin wrapper over react-native-tts so screens can just call `speak(text)`.
 * Failures (e.g. no TTS engine on the device) are swallowed — listening is a
 * nice-to-have, not something that should crash a lesson.
 */
export function speak(text: string, languageTag?: string): void {
  try {
    Tts.stop();
    if (languageTag) {
      // Best-effort; ignored if the device lacks a voice for this language.
      Tts.setDefaultLanguage(languageTag).catch(() => {});
    }
    Tts.speak(text);
  } catch {
    // no-op
  }
}
