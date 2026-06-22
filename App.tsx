import React from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HomeScreen } from "@/screens/HomeScreen";
import { ImmersionScreen } from "@/screens/ImmersionScreen";
import { LessonScreen } from "@/screens/LessonScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { NavProvider, SCREEN_TITLES, useNav, type ScreenName } from "@/navigation";
import { AppProvider } from "@/state/AppContext";
import { theme } from "@/theme";

const SCREENS: Record<ScreenName, React.ComponentType> = {
  home: HomeScreen,
  lesson: LessonScreen,
  immersion: ImmersionScreen,
  settings: SettingsScreen,
};

function Root() {
  const { current, canGoBack, goBack } = useNav();
  const insets = useSafeAreaInsets();
  const Screen = SCREENS[current];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {canGoBack ? (
          <Pressable onPress={goBack} hitSlop={12} style={styles.back}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <Text style={styles.title}>{SCREEN_TITLES[current]}</Text>
        <View style={styles.back} />
      </View>
      <View style={styles.body}>
        <Screen />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <AppProvider>
        <NavProvider>
          <Root />
        </NavProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  back: { minWidth: 64 },
  backText: { color: theme.colors.primary, fontSize: 16, fontWeight: "700" },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  body: { flex: 1 },
});
