import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button, Card, Chip } from "@/components/ui";
import { describeError, generateLesson } from "@/lib/claude";
import { speak } from "@/lib/speech";
import { storage } from "@/lib/storage";
import type { Exercise as ExerciseType, Lesson } from "@/lib/types";
import { useNav } from "@/navigation";
import { useApp } from "@/state/AppContext";
import { theme } from "@/theme";

const SUGGESTED = [
  "Ordering coffee",
  "At the train station",
  "Talking about the weather",
  "Making weekend plans",
  "Describing your family",
  "Shopping for groceries",
];

export function LessonScreen() {
  const { settings, language, level, hasApiKey } = useApp();
  const nav = useNav();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  async function run(chosenTopic: string) {
    const t = chosenTopic.trim();
    if (!t) return;
    if (!hasApiKey) {
      setError("Add your Claude API key in Settings first.");
      return;
    }
    setLoading(true);
    setError(null);
    setLesson(null);
    setShowTranslation(false);
    try {
      const result = await generateLesson({
        apiKey: settings.apiKey,
        model: settings.model,
        language,
        level,
        topic: t,
      });
      setLesson(result);
      await storage.addLesson(result);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Text style={styles.context}>
        {language.flag} {language.name} · Level {level}
      </Text>

      <Card>
        <Text style={styles.label}>What do you want to learn about?</Text>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          placeholder="Type a topic…"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          onSubmitEditing={() => run(topic)}
          returnKeyType="go"
        />
        <View style={styles.chips}>
          {SUGGESTED.map((s) => (
            <Chip
              key={s}
              label={s}
              onPress={() => {
                setTopic(s);
                run(s);
              }}
            />
          ))}
        </View>
        <Button
          label={loading ? "Generating…" : "Generate lesson"}
          onPress={() => run(topic)}
          loading={loading}
        />
      </Card>

      {error && (
        <Card style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          {!hasApiKey && (
            <Button
              label="Open Settings"
              variant="ghost"
              onPress={() => nav.navigate("settings")}
              style={{ marginTop: theme.spacing(1) }}
            />
          )}
        </Card>
      )}

      {lesson && (
        <View style={{ gap: theme.spacing(2), marginTop: theme.spacing(2) }}>
          <Text style={styles.title}>{lesson.title}</Text>

          <Card>
            <SectionLabel text="Immersion" />
            <Text style={styles.immersion}>{lesson.immersionText}</Text>
            <Pressable onPress={() => setShowTranslation((v) => !v)}>
              <Text style={styles.toggle}>
                {showTranslation ? "Hide translation" : "Show translation"}
              </Text>
            </Pressable>
            {showTranslation && (
              <Text style={styles.translation}>
                {lesson.immersionTranslation}
              </Text>
            )}
            <SpeakButton text={lesson.immersionText} />
          </Card>

          <SectionLabel text="Vocabulary" />
          {lesson.vocabulary.map((v, i) => (
            <Card key={i}>
              <View style={styles.vocabHead}>
                <Text style={styles.term}>{v.term}</Text>
                <SpeakButton text={v.term} compact />
              </View>
              {v.pronunciation ? (
                <Text style={styles.pron}>{v.pronunciation}</Text>
              ) : null}
              <Text style={styles.meaning}>{v.translation}</Text>
              <Text style={styles.example}>“{v.example}”</Text>
              <Text style={styles.exampleTr}>{v.exampleTranslation}</Text>
            </Card>
          ))}

          <SectionLabel text="Exercises" />
          {lesson.exercises.map((ex, i) => (
            <Exercise key={i} index={i + 1} ex={ex} />
          ))}

          <Button
            label="💬  Practice this in conversation"
            variant="ghost"
            onPress={() => nav.navigate("immersion")}
          />
        </View>
      )}
      <View style={{ height: theme.spacing(4) }} />
    </ScrollView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

function SpeakButton({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <Pressable
      onPress={() => speak(text)}
      style={[styles.speak, compact && { paddingVertical: 4, marginTop: 0 }]}
    >
      <Text style={styles.speakText}>🔊 {compact ? "" : "Listen"}</Text>
    </Pressable>
  );
}

function Exercise({ index, ex }: { index: number; ex: ExerciseType }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Card>
      <Text style={styles.exPrompt}>
        {index}. {ex.prompt}
      </Text>
      {ex.hint && !revealed ? (
        <Text style={styles.hint}>Hint: {ex.hint}</Text>
      ) : null}
      <Pressable onPress={() => setRevealed((v) => !v)}>
        <Text style={styles.toggle}>
          {revealed ? "Hide answer" : "Reveal answer"}
        </Text>
      </Pressable>
      {revealed && <Text style={styles.answer}>{ex.answer}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2), gap: theme.spacing(2) },
  context: { color: theme.colors.textMuted, fontWeight: "700" },
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
    marginBottom: theme.spacing(1.5),
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing(1),
  },
  error: { backgroundColor: "#2A1A1A", borderColor: "#5C2A28" },
  errorText: { color: "#F2A8A2", fontWeight: "600" },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: "800" },
  sectionLabel: {
    color: theme.colors.accent,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
  },
  immersion: { color: theme.colors.text, fontSize: 18, lineHeight: 28 },
  toggle: { color: theme.colors.primary, fontWeight: "700", marginTop: 10 },
  translation: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  speak: { marginTop: 12, alignSelf: "flex-start" },
  speakText: { color: theme.colors.primary, fontWeight: "700" },
  vocabHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  term: { color: theme.colors.text, fontSize: 20, fontWeight: "800" },
  pron: { color: theme.colors.accent, marginTop: 2 },
  meaning: { color: theme.colors.textMuted, marginTop: 4, fontSize: 15 },
  example: { color: theme.colors.text, marginTop: 10, fontStyle: "italic" },
  exampleTr: { color: theme.colors.textMuted, marginTop: 2 },
  exPrompt: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  hint: { color: theme.colors.textMuted, marginTop: 6, fontStyle: "italic" },
  answer: {
    color: theme.colors.accent,
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
  },
});
