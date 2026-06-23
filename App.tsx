import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { AIStoryScreen } from "@/screens/AIStoryScreen";
import { CourseSelectScreen } from "@/screens/CourseSelectScreen";
import { GameScreen } from "@/screens/GameScreen";
import { NewsScreen } from "@/screens/NewsScreen";
import { WatchScreen } from "@/screens/WatchScreen";
import { LessonCompleteScreen } from "@/screens/LessonCompleteScreen";
import { LessonScreen } from "@/screens/LessonScreen";
import { PathScreen } from "@/screens/PathScreen";
import { PlacementScreen } from "@/screens/PlacementScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { DictationScreen } from "@/screens/DictationScreen";
import { ReviewScreen } from "@/screens/ReviewScreen";
import { RoleplayScreen } from "@/screens/RoleplayScreen";
import { TipsScreen } from "@/screens/TipsScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { StoriesListScreen } from "@/screens/StoriesListScreen";
import { StoryScreen } from "@/screens/StoryScreen";
import { TraceScreen } from "@/screens/TraceScreen";
import { WordsScreen } from "@/screens/WordsScreen";
import { NavProvider, useNav } from "@/navigation";
import { ProgressProvider, useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

function Shell() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"learn" | "profile">("learn");
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{tab === "learn" ? <PathScreen /> : <ProfileScreen />}</View>
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
        <TabButton label="Learn" icon="🛣️" active={tab === "learn"} onPress={() => setTab("learn")} />
        <TabButton label="Profile" icon="👤" active={tab === "profile"} onPress={() => setTab("profile")} />
      </View>
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: active ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [active, anim]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Animated.Text style={{ fontSize: 22, opacity: active ? 1 : 0.5, transform: [{ scale }] }}>
        {icon}
      </Animated.Text>
      <Text style={[styles.tabLabel, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
        {label}
      </Text>
      {active ? <View style={styles.tabDot} /> : null}
    </Pressable>
  );
}

// Fades + slides each screen in as you navigate, for a polished feel.
function ScreenTransition({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [routeKey, anim]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  return (
    <Animated.View style={{ flex: 1, opacity: anim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function Router() {
  const { current } = useNav();
  return (
    <ScreenTransition routeKey={current.name}>
      <RouterInner />
    </ScreenTransition>
  );
}

function RouterInner() {
  const { current } = useNav();
  switch (current.name) {
    case "shell":
      return <Shell />;
    case "courseSelect":
      return <CourseSelectScreen />;
    case "placement":
      return <PlacementScreen />;
    case "lesson":
      return <LessonScreen />;
    case "lessonComplete":
      return <LessonCompleteScreen />;
    case "settings":
      return <SettingsScreen />;
    case "words":
      return <WordsScreen />;
    case "trace":
      return <TraceScreen />;
    case "game":
      return <GameScreen />;
    case "stories":
      return <StoriesListScreen />;
    case "story":
      return <StoryScreen />;
    case "watch":
      return <WatchScreen />;
    case "news":
      return <NewsScreen />;
    case "aistory":
      return <AIStoryScreen />;
    case "review":
      return <ReviewScreen />;
    case "tips":
      return <TipsScreen />;
    case "dictation":
      return <DictationScreen />;
    case "roleplay":
      return <RoleplayScreen />;
    default:
      return <Shell />;
  }
}

function Splash() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }).start();
  }, [anim]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  return (
    <View style={styles.splash}>
      <Animated.View style={{ alignItems: "center", opacity: anim, transform: [{ scale }] }}>
        <Text style={styles.logo}>blah blah</Text>
        <Text style={styles.tagline}>better than Duolingo</Text>
      </Animated.View>
      <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
}

function Root() {
  const { ready, state } = useProgress();
  if (!ready) {
    return <Splash />;
  }
  return (
    <NavProvider initial={state.currentCourse ? "shell" : "courseSelect"}>
      <Router />
    </NavProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <ProgressProvider>
        <Root />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: "center", gap: 2 },
  tabLabel: { fontSize: 12, fontWeight: "700" },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
  splash: { flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" },
  logo: { color: theme.colors.text, fontSize: 52, fontWeight: "900", letterSpacing: -1 },
  tagline: { color: theme.colors.success, fontSize: 18, fontWeight: "800", marginTop: 8 },
});
