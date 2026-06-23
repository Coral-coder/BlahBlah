import { useState } from "react";
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { CourseSelectScreen } from "@/screens/CourseSelectScreen";
import { LessonCompleteScreen } from "@/screens/LessonCompleteScreen";
import { LessonScreen } from "@/screens/LessonScreen";
import { PathScreen } from "@/screens/PathScreen";
import { PlacementScreen } from "@/screens/PlacementScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
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
    default:
      return <Shell />;
  }
}

function Root() {
  const { ready, state } = useProgress();
  if (!ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>BlahBlah</Text>
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
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
  logo: { color: theme.colors.text, fontSize: 32, fontWeight: "900" },
});
