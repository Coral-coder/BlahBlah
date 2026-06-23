import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Chip, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { hasNaturalVoice, setNeuralEnabled } from "@/lib/speech";
import { neuralAvailable } from "@/lib/neuralTts";
import {
  downloadModel,
  isInstalled,
  removeModel,
  scanInstalled,
  VOICE_MODELS,
  type VoiceModel,
} from "@/lib/voiceModels";
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
  const [naturalVoice, setNaturalVoice] = useState<boolean | null>(null);

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  useEffect(() => {
    let alive = true;
    if (course?.speechLocale) {
      hasNaturalVoice(course.speechLocale).then((v) => alive && setNaturalVoice(v));
    }
    return () => {
      alive = false;
    };
  }, [course]);

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
          <Text style={styles.cardTitle}>Natural voice</Text>
          {naturalVoice === true ? (
            <Text style={styles.cardSub}>
              ✓ A high-quality voice is installed for {course?.name}. You're all set.
            </Text>
          ) : (
            <>
              <Text style={styles.cardSub}>
                {naturalVoice === false
                  ? `${course?.name ?? "This language"} is using iOS's basic (robotic) voice.`
                  : "Checking your installed voices…"}
                {"\n\n"}iOS won't let apps install voices automatically, but it's a one-time setup:
                {"\n"}1. Open iOS Settings
                {"\n"}2. Accessibility → Spoken Content → Voices
                {"\n"}3. Pick your language → download the “Premium” (or “Enhanced”) voice
                {"\n\n"}BlahBlah then uses it automatically — much more human.
              </Text>
              <Button
                label="Open iOS Settings"
                variant="ghost"
                onPress={() => Linking.openSettings()}
                style={{ marginTop: theme.spacing(1.5) }}
              />
            </>
          )}
        </Card>

        <NeuralVoicesCard />

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

function NeuralVoicesCard() {
  const { state, setSettings } = useProgress();
  const enabled = state.settings.neuralVoices;
  const [, force] = useState(0);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scanInstalled().then(() => force((n) => n + 1));
  }, []);

  async function onDownload(m: VoiceModel) {
    setError(null);
    setBusy((b) => ({ ...b, [m.id]: true }));
    setProgress((p) => ({ ...p, [m.id]: 0 }));
    const ok = await downloadModel(m, (p) => setProgress((s) => ({ ...s, [m.id]: p })));
    setBusy((b) => ({ ...b, [m.id]: false }));
    if (!ok) setError(`Couldn't download ${m.language}. Check your connection and try again.`);
    force((n) => n + 1);
  }
  async function onRemove(m: VoiceModel) {
    await removeModel(m.id);
    force((n) => n + 1);
  }

  return (
    <Card>
      <Text style={styles.cardTitle}>Natural voices (on-device) ✨</Text>
      <Text style={styles.cardSub}>
        Download free, human-sounding neural voices — including Icelandic, which iOS doesn't
        offer. They work fully offline once downloaded.
      </Text>
      {!neuralAvailable() ? (
        <Text style={styles.warn}>
          The voice engine ships in an upcoming build — you can download voices now and they'll
          activate automatically once it lands.
        </Text>
      ) : null}

      <Button
        label={enabled ? "Using natural voices ✓ — tap to turn off" : "Use natural voices"}
        variant={enabled ? "primary" : "ghost"}
        onPress={() => {
          const next = !enabled;
          setSettings({ neuralVoices: next });
          setNeuralEnabled(next);
        }}
        style={{ marginTop: theme.spacing(2) }}
      />

      <View style={{ marginTop: theme.spacing(2), gap: 12 }}>
        {VOICE_MODELS.map((m) => {
          const installed = isInstalled(m.id);
          const downloading = busy[m.id];
          return (
            <View key={m.id} style={styles.voiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.voiceLang}>{m.language}</Text>
                <Text style={styles.voiceMeta}>
                  {m.name} · {installed ? "Installed" : `${m.mb} MB`}
                </Text>
                {downloading ? (
                  <View style={{ marginTop: 6 }}>
                    <ProgressBar progress={progress[m.id] ?? 0} height={8} />
                  </View>
                ) : null}
              </View>
              {downloading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : installed ? (
                <Pressable onPress={() => onRemove(m)} hitSlop={8}>
                  <Text style={styles.voiceRemove}>Remove</Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => onDownload(m)} hitSlop={8} style={styles.voiceDl}>
                  <Text style={styles.voiceDlText}>Download</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
      {error ? <Text style={styles.warn}>{error}</Text> : null}
    </Card>
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
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  voiceLang: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  voiceMeta: { color: theme.colors.textMuted, marginTop: 2, fontSize: 13 },
  voiceDl: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.md,
  },
  voiceDlText: { color: theme.colors.primaryText, fontWeight: "800" },
  voiceRemove: { color: theme.colors.danger, fontWeight: "700" },
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
