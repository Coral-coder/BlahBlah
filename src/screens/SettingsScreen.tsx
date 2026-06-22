import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button, Card, Chip } from "@/components/ui";
import { storage } from "@/lib/storage";
import type { ModelId } from "@/lib/types";
import { useApp } from "@/state/AppContext";
import { theme } from "@/theme";

const MODELS: { id: ModelId; label: string; note: string }[] = [
  { id: "claude-opus-4-8", label: "Opus 4.8", note: "Most capable · best lessons" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", note: "Balanced speed & cost" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5", note: "Fastest · cheapest" },
];

export function SettingsScreen() {
  const { settings, setSettings } = useApp();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState<ModelId>(settings.model);
  const [saved, setSaved] = useState(false);

  async function save() {
    await setSettings({ apiKey: apiKey.trim(), model });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.label}>Claude API key</Text>
        <TextInput
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-ant-…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Text style={styles.help}>
          Stored only on this device. Get a key from the Anthropic Console.
        </Text>
        <Button
          label="Get an API key →"
          variant="ghost"
          onPress={() =>
            Linking.openURL("https://console.anthropic.com/settings/keys")
          }
          style={{ marginTop: theme.spacing(1) }}
        />
      </Card>

      <Text style={styles.section}>Model</Text>
      <View style={styles.chips}>
        {MODELS.map((m) => (
          <Chip
            key={m.id}
            label={m.label}
            active={model === m.id}
            onPress={() => setModel(m.id)}
          />
        ))}
      </View>
      <Text style={styles.help}>
        {MODELS.find((m) => m.id === model)?.note}
      </Text>

      <Button
        label={saved ? "Saved ✓" : "Save settings"}
        onPress={save}
        style={{ marginTop: theme.spacing(2) }}
      />

      <View style={styles.divider} />

      <Button
        label="Clear cached lessons"
        variant="danger"
        onPress={() => storage.clearLessons()}
      />

      <Card style={styles.note}>
        <Text style={styles.noteText}>
          Heads up: a key embedded in a mobile app can be extracted from network
          traffic. This is fine for personal use. For a public release, route
          requests through your own backend that holds the key server-side.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2), gap: theme.spacing(1) },
  label: { color: theme.colors.text, fontWeight: "700", marginBottom: 10 },
  input: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  help: { color: theme.colors.textMuted, marginTop: 8, lineHeight: 20 },
  section: {
    color: theme.colors.text,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 13,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing(3),
  },
  note: { marginTop: theme.spacing(2), backgroundColor: theme.colors.surfaceAlt },
  noteText: { color: theme.colors.textMuted, lineHeight: 20 },
});
