import React, { createContext, useContext, useMemo, useState } from "react";

// A tiny stack navigator. The app has four screens and no deep-linking needs,
// so this avoids pulling in react-navigation + its native dependencies.
export type ScreenName = "home" | "lesson" | "immersion" | "settings";

export const SCREEN_TITLES: Record<ScreenName, string> = {
  home: "BlahBlah",
  lesson: "Immersion Lesson",
  immersion: "Conversation",
  settings: "Settings",
};

type NavContextValue = {
  stack: ScreenName[];
  current: ScreenName;
  navigate: (name: ScreenName) => void;
  goBack: () => void;
  canGoBack: boolean;
};

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<ScreenName[]>(["home"]);

  const value = useMemo<NavContextValue>(() => {
    const current = stack[stack.length - 1];
    return {
      stack,
      current,
      canGoBack: stack.length > 1,
      navigate: (name) => setStack((s) => [...s, name]),
      goBack: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    };
  }, [stack]);

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
