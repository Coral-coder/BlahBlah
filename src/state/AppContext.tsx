import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Language, LevelId } from "@/lib/languages";
import { storage } from "@/lib/storage";
import type { Settings } from "@/lib/types";

type AppContextValue = {
  ready: boolean;
  settings: Settings;
  language: Language;
  level: LevelId;
  setSettings: (s: Settings) => Promise<void>;
  setLanguage: (l: Language) => Promise<void>;
  setLevel: (l: LevelId) => Promise<void>;
  hasApiKey: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettingsState] = useState<Settings>({
    apiKey: "",
    model: "claude-opus-4-8",
  });
  const [language, setLanguageState] = useState<Language | null>(null);
  const [level, setLevelState] = useState<LevelId>("A1");

  useEffect(() => {
    (async () => {
      const [s, l, lvl] = await Promise.all([
        storage.getSettings(),
        storage.getLanguage(),
        storage.getLevel(),
      ]);
      setSettingsState(s);
      setLanguageState(l);
      setLevelState(lvl);
      setReady(true);
    })();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      settings,
      language: language ?? {
        code: "de",
        name: "German",
        endonym: "Deutsch",
        flag: "🇩🇪",
      },
      level,
      hasApiKey: settings.apiKey.trim().length > 0,
      async setSettings(s) {
        setSettingsState(s);
        await storage.saveSettings(s);
      },
      async setLanguage(l) {
        setLanguageState(l);
        await storage.saveLanguage(l);
      },
      async setLevel(l) {
        setLevelState(l);
        await storage.saveLevel(l);
      },
    }),
    [ready, settings, language, level],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
