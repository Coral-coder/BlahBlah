// Pure data: the catalog of downloadable on-device neural voices. No React
// Native imports, so this can be required from Node (the content-bundle builder)
// and serialized into the over-the-air bundle. The runtime manager lives in
// voiceModels.ts and reads whichever catalog is active (bundled or OTA).

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

// Base URL the voice .zip assets are downloaded from (this repo's GitHub Release).
export const VOICE_RELEASE_BASE =
  "https://github.com/Coral-coder/BlahBlah/releases/download/voice-models";

// One natural voice per supported language. IDs match the .zip asset names the
// hosting workflow produces.
export const VOICE_MODELS: VoiceModel[] = [
  { id: "de_DE-thorsten-medium", locale: "de-DE", name: "Thorsten (natural)", language: "German", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "es_ES-davefx-medium", locale: "es-ES", name: "Davefx (natural)", language: "Spanish", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "is_IS-steinn-medium", locale: "is-IS", name: "Steinn (natural)", language: "Icelandic", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "zh_CN-huayan-medium", locale: "zh-CN", name: "Huayan (natural)", language: "Chinese", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "fr_FR-siwis-medium", locale: "fr-FR", name: "Siwis (natural)", language: "French", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "it_IT-paola-medium", locale: "it-IT", name: "Paola (natural)", language: "Italian", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "th_TH-mms-medium", locale: "th-TH", name: "Thai (natural)", language: "Thai", mb: 38, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "ru_RU-irina-medium", locale: "ru-RU", name: "Irina (natural)", language: "Russian", mb: 64, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "ja_JP-mms-medium", locale: "ja-JP", name: "Japanese (natural)", language: "Japanese", mb: 38, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
  { id: "ga_IE-mms-medium", locale: "ga-IE", name: "Irish (natural)", language: "Irish", mb: 38, modelFile: "model.onnx", tokensFile: "tokens.txt", dataDir: "espeak-ng-data", sid: 0, speed: 1.0 },
];
