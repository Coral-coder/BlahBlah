import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

// A small stack navigator with route params. The app's main surface is the
// "shell" (a bottom-tab container); full-screen flows like a lesson or the
// placement test are pushed on top of it.
export type ScreenName =
  | "shell"
  | "courseSelect"
  | "placement"
  | "lesson"
  | "lessonComplete"
  | "settings"
  | "words"
  | "trace"
  | "game"
  | "stories"
  | "story"
  | "watch"
  | "news"
  | "aistory"
  | "review"
  | "tips"
  | "dictation"
  | "roleplay"
  | "achievements";

export type RouteParams = Record<string, unknown>;
export interface Route {
  name: ScreenName;
  params: RouteParams;
}

interface NavContextValue {
  stack: Route[];
  current: Route;
  canGoBack: boolean;
  navigate: (name: ScreenName, params?: RouteParams) => void;
  replace: (name: ScreenName, params?: RouteParams) => void;
  reset: (name: ScreenName, params?: RouteParams) => void;
  goBack: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({
  initial,
  children,
}: {
  initial: ScreenName;
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<Route[]>([{ name: initial, params: {} }]);

  const value = useMemo<NavContextValue>(() => {
    return {
      stack,
      current: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      navigate: (name, params = {}) =>
        setStack((s) => [...s, { name, params }]),
      replace: (name, params = {}) =>
        setStack((s) => [...s.slice(0, -1), { name, params }]),
      reset: (name, params = {}) => setStack([{ name, params }]),
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

/** Read the current route's params, typed by the caller. */
export function useRoute<T = RouteParams>(): T {
  return useNav().current.params as T;
}
