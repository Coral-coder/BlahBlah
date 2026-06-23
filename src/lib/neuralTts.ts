import { NativeModules } from "react-native";

// Bridge to the on-device neural TTS engine (sherpa-onnx). The native module is
// optional: when it isn't present (e.g. a JS-only build, or before the native
// engine has been integrated) every call degrades gracefully and callers fall
// back to the system voice.
interface NeuralNative {
  /** Load a voice model directory (contains model.onnx, tokens.txt, espeak data). */
  load(opts: {
    dir: string;
    modelFile: string;
    tokensFile: string;
    dataDir: string;
    numThreads: number;
  }): Promise<boolean>;
  /** Synthesize text to a WAV file on disk; resolves with its path. */
  synthesize(opts: {
    text: string;
    sid: number;
    speed: number;
  }): Promise<{ path: string; sampleRate: number }>;
}

const Native: NeuralNative | undefined = (NativeModules as any).BlahNeuralTts;

let loadedDir: string | null = null;
let loading: Promise<boolean> | null = null;

export function neuralAvailable(): boolean {
  return !!Native;
}

/** Load a model directory if it isn't already the active one. */
export async function loadNeuralModel(opts: {
  dir: string;
  modelFile: string;
  tokensFile: string;
  dataDir: string;
}): Promise<boolean> {
  if (!Native) return false;
  if (loadedDir === opts.dir) return true;
  // Coalesce concurrent loads of the same model.
  loading = Native.load({ ...opts, numThreads: 2 })
    .then((ok) => {
      loadedDir = ok ? opts.dir : null;
      return ok;
    })
    .catch(() => {
      loadedDir = null;
      return false;
    });
  return loading;
}

export async function synthesizeToFile(
  text: string,
  opts?: { sid?: number; speed?: number },
): Promise<string | null> {
  if (!Native || !loadedDir) return null;
  try {
    const res = await Native.synthesize({
      text,
      sid: opts?.sid ?? 0,
      speed: opts?.speed ?? 1.0,
    });
    return res?.path ?? null;
  } catch {
    return null;
  }
}

export function neuralLoadedDir(): string | null {
  return loadedDir;
}
