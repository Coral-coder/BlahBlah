import { useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Chip } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { cancelReminders, scheduleDailyReminder } from "@/lib/reminders";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const TIMES = [8, 12, 17, 20];
const fmtHour = (h: number) =>
  h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`;

export function SettingsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, resetCourse, setReminder, setSettings } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(state.settings.apiKey);
  const [savedKey, setSavedKey] = useState(false);

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  async function toggleReminder() {
    if (state.reminderEnabled) {
      await cancelReminders();
      setReminder(false, state.reminderHour);
      setReminderMsg(null);
    } else {
      const ok = await scheduleDailyReminder(state.reminderHour);
      setReminder(ok, state.reminderHour);
      setReminderMsg(
        ok ? null : "Couldn't enable — allow notifications for BlahBlah in iOS Settings.",
      );
    }
  }

  async function pickHour(hour: number) {
    setReminder(state.reminderEnabled, hour);
    if (state.reminderEnabled) await scheduleDailyReminder(hour);
  }

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Settings</Text>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
        <Card>
          <Text style={styles.cardTitle}>Daily reminder</Text>
          <Text style={styles.cardSub}>
            Get a nudge to practice every day and keep your streak going.
          </Text>
          <Button
            label={state.reminderEnabled ? "Reminder on ✓ — tap to turn off" : "Turn on daily reminder"}
            variant={state.reminderEnabled ? "primary" : "ghost"}
            onPress={toggleReminder}
            style={{ marginTop: theme.spacing(2) }}
          />
          <Text style={[styles.cardSub, { marginTop: theme.spacing(2) }]}>Remind me at</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {TIMES.map((h) => (
              <Chip
                key={h}
                label={fmtHour(h)}
                active={state.reminderHour === h}
                onPress={() => pickHour(h)}
              />
            ))}
          </View>
          {reminderMsg ? <Text style={styles.warn}>{reminderMsg}</Text> : null}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Reset course progress</Text>
          <Text style={styles.cardSub}>
            {course
              ? `Clears all completed lessons and your placement for ${course.name}. XP and streak are kept.`
              : "Pick a course first."}
          </Text>
          {course ? (
            confirm ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: theme.spacing(2) }}>
                <Button
                  label="Yes, reset"
                  variant="danger"
                  style={{ flex: 1 }}
                  onPress={() => {
                    resetCourse(course.code);
                    setConfirm(false);
                    nav.reset("shell");
                  }}
                />
                <Button label="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => setConfirm(false)} />
              </View>
            ) : (
              <Button
                label="Reset progress"
                variant="danger"
                style={{ marginTop: theme.spacing(2) }}
                onPress={() => setConfirm(true)}
              />
            )
          ) : null}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Claude API key</Text>
          <Text style={styles.cardSub}>
            Optional — only needed for AI Stories. Stored on this device.
          </Text>
          <TextInput
            value={apiKey}
            onChangeText={(t) => {
              setApiKey(t);
              setSavedKey(false);
            }}
            placeholder="sk-ant-…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Button
            label={savedKey ? "Saved ✓" : "Save key"}
            variant="ghost"
            style={{ marginTop: theme.spacing(1.5) }}
            onPress={() => {
              setSettings({ apiKey: apiKey.trim() });
              setSavedKey(true);
            }}
          />
          <Button
            label="Get an API key →"
            variant="ghost"
            onPress={() => Linking.openURL("https://console.anthropic.com/settings/keys")}
            style={{ marginTop: theme.spacing(1) }}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardSub}>
            BlahBlah — learn languages through a guided, structured path of bite-sized lessons.
            Version 0.2.0.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing(2),
    paddingBottom: 8,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  cardSub: { color: theme.colors.textMuted, marginTop: 6, lineHeight: 20 },
  warn: { color: theme.colors.gold, marginTop: 10, fontWeight: "600" },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: theme.spacing(1.5),
  },
});
