import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProvider } from "@/state/AppContext";
import { theme } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.bg },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: "800" },
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: "BlahBlah" }} />
          <Stack.Screen name="lesson" options={{ title: "Immersion Lesson" }} />
          <Stack.Screen name="immersion" options={{ title: "Conversation" }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
