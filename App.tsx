import { useState } from "react";
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
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
import { ReviewScreen } from "@/screens/ReviewScreen";
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
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Text style={{ fontSize: 22, opacity: active ? 1 : 0.5 }}>{icon}</Text>
      <Text style={[styles.tabLabel, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Router() {
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
    default:
      return <Shell />;
  }
}

function Root() {
  const { ready, state } = useProgress();
  if (!ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>blah blah</Text>
        <Text style={styles.tagline}>better than Duolingo</Text>
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
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
  splash: { flex: 1, backgroundColor: theme.colors.bg, alignItems: "center", justifyContent: "center" },
  logo: { color: theme.colors.text, fontSize: 52, fontWeight: "900", letterSpacing: -1 },
  tagline: { color: theme.colors.success, fontSize: 18, fontWeight: "800", marginTop: 8 },
});
