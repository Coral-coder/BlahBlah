import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { generateAIStory } from "@/lib/ai";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const IDEAS = ["a talking cat", "a trip to the market", "a birthday surprise", "a lost dog", "ordering pizza"];

export function AIStoryScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasKey = !!state.settings.apiKey.trim();

  async function generate(t: string) {
    if (!course) return;
    if (!hasKey) {
      setError("Add your Claude API key in Settings to generate stories.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const story = await generateAIStory({
        apiKey: state.settings.apiKey,
        model: state.settings.model,
        courseCode: course.code,
        languageName: course.name,
        level: "A2",
        topic: t.trim() || undefined,
      });
      if (!story.lines.length) throw new Error("empty");
      nav.replace("story", { story });
    } catch {
      setError("Couldn't generate a story — check your API key and connection, then retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>AI Story</Text>
          <Text style={styles.subtitle}>A fresh {course?.name} story at your level</Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
        {!hasKey ? (
          <Card>
            <Text style={styles.cardText}>
              This uses Claude to write you a one-of-a-kind story. Add your API key in Settings first.
            </Text>
            <Button label="Open Settings" variant="ghost" onPress={() => nav.navigate("settings")} style={{ marginTop: theme.spacing(1.5) }} />
          </Card>
        ) : null}

        <Card>
          <Text style={styles.label}>What should it be about? (optional)</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. a dragon who loves coffee"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          <View style={styles.ideas}>
            {IDEAS.map((i) => (
              <Text key={i} style={styles.idea} onPress={() => setTopic(i)}>
                {i}
              </Text>
            ))}
          </View>
          <Button
            label={loading ? "Writing your story…" : "✨ Generate story"}
            onPress={() => generate(topic)}
            loading={loading}
            disabled={loading}
            style={{ marginTop: theme.spacing(2) }}
          />
          {loading ? <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 12 }} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: theme.spacing(2), paddingBottom: 10 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  cardText: { color: theme.colors.textMuted, lineHeight: 20 },
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
  ideas: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  idea: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: "hidden",
    fontWeight: "600",
  },
  error: { color: theme.colors.danger, marginTop: 12, fontWeight: "600" },
});
