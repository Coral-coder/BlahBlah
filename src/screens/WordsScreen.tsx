import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function WordsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, learnedWords } = useProgress();
  const [q, setQ] = useState("");

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const words = useMemo(
    () => (course ? learnedWords(course.code) : []),
    [course, learnedWords],
  );

  const filtered = q
    ? words.filter(
        (w) =>
          w.target.toLowerCase().includes(q.toLowerCase()) ||
          w.en.toLowerCase().includes(q.toLowerCase()),
      )
    : words;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Words you know</Text>
          <Text style={styles.subtitle}>
            {course ? `${words.length} ${course.name} words learned` : ""}
          </Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      {words.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyText}>
            Finish lessons to build your word list. Every new word you learn shows up here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.spacing(2), paddingBottom: insets.bottom + 20, gap: 10 }}>
          {filtered.map((w, i) => (
            <Pressable key={`${w.target}-${i}`} style={styles.row} onPress={() => speak(w.target)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.target}>{w.target}</Text>
                {w.pinyin ? <Text style={styles.pinyin}>{w.pinyin}</Text> : null}
                <Text style={styles.en}>{w.en}</Text>
              </View>
              <Text style={styles.speaker}>🔊</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
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
    paddingBottom: 10,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(4), gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { color: theme.colors.textMuted, textAlign: "center", lineHeight: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
  },
  target: { color: theme.colors.text, fontSize: 20, fontWeight: "700" },
  pinyin: { color: theme.colors.accent, marginTop: 2 },
  en: { color: theme.colors.textMuted, marginTop: 2 },
  speaker: { fontSize: 22, marginLeft: 12 },
});
