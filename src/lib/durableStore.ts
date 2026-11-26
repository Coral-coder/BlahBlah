import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

// Durable key-value storage that survives an app delete/reinstall.
//
//   • Local (AsyncStorage) is the fast, always-available primary.
//   • On iOS we ALSO mirror to iCloud key-value storage (NSUbiquitousKeyValueStore)
//     via the blah-icloud-kv native module, so data survives uninstall and syncs
//     across the user's devices. If the native module / iCloud entitlement isn't
//     present, it degrades to local-only (no crash).
//   • On Android, AsyncStorage is covered by Auto Backup (see AndroidManifest),
//     which restores it on reinstall — so no extra mirror is needed.
//
// iCloud KVS has a ~1MB per-key limit; the progress blob is well under that.

interface ICloudNative {
  setItem(key: string, value: string): Promise<boolean>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<boolean>;
  sync(): Promise<boolean>;
}

const iCloud: ICloudNative | undefined =
  Platform.OS === "ios" ? (NativeModules as any).BlahICloudKv : undefined;

export function iCloudAvailable(): boolean {
  return !!iCloud;
}

/**
 * Read a value. Prefers the local copy; if it's missing (e.g. a fresh install
 * after a delete, or a brand-new device), falls back to iCloud and re-seeds the
 * local copy so subsequent reads are fast.
 */
export async function durableGet(key: string): Promise<string | null> {
  try {
    const local = await AsyncStorage.getItem(key);
    if (local != null) return local;
  } catch {
    // ignore
  }
  if (iCloud) {
    try {
      const remote = await iCloud.getItem(key);
      if (remote != null) {
        AsyncStorage.setItem(key, remote).catch(() => {});
        return remote;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/** Write a value to both local storage and (on iOS) iCloud. */
export async function durableSet(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // ignore
  }
  if (iCloud) {
    iCloud.setItem(key, value).catch(() => {});
  }
}

/** Remove a value from both stores. */
export async function durableRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
  if (iCloud) {
    iCloud.removeItem(key).catch(() => {});
  }
}
