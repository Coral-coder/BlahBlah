import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseView, type ExResponse } from "@/components/Exercise";
import { Button, Hearts, ProgressBar } from "@/components/ui";
import { flattenCourse, type Exercise } from "@/curriculum/types";
import { getCourse } from "@/curriculum";
import { isCorrect, lessonXp } from "@/lesson/engine";
import { useNav, useRoute } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const START_HEARTS = 5;

export function LessonScreen() {
  const { courseCode, lessonId } = useRoute<{ courseCode: string; lessonId: string }>();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const course = getCourse(courseCode);
  const node = useMemo(
    () => (course ? flattenCourse(course).find((n) => n.lesson.id === lessonId) : undefined),
    [course, lessonId],
  );

  const total = node?.lesson.exercises.length ?? 0;
  const [queue, setQueue] = useState<Exercise[]>(node ? [...node.lesson.exercises] : []);
  const [response, setResponse] = useState<ExResponse>(null);
  const [phase, setPhase] = useState<"answer" | "checked">("answer");
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [solved, setSolved] = useState(0);
  const [round, setRound] = useState(0);

  if (!node) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text }}>Lesson not found.</Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const current = queue[0];
  const isMatch = current.type === "match";

  function finish(passed: boolean) {
    const xp = passed ? lessonXp(mistakes) : 0;
    if (passed) completeLesson(courseCode, lessonId, xp);
    nav.replace("lessonComplete", { courseCode, lessonId, passed, xp, mistakes, total });
  }

  function check() {
    const ok = isCorrect(current, response as number | string);
    setCorrect(ok);
    setPhase("checked");
    if (!ok) {
      setMistakes((m) => m + 1);
      setHearts((h) => h - 1);
    }
  }

  function proceed(wasCorrect: boolean) {
    if (!wasCorrect && hearts <= 0) return finish(false);
    let next: Exercise[];
    if (wasCorrect) {
      next = queue.slice(1);
      setSolved((s) => s + 1);
    } else {
      next = [...queue.slice(1), queue[0]];
    }
    if (next.length === 0) return finish(true);
    setQueue(next);
    setResponse(null);
    setPhase("answer");
    setCorrect(null);
    setRound((r) => r + 1);
  }

  function onMatchMistake() {
    setMistakes((m) => m + 1);
    setHearts((h) => h - 1);
  }

  const canCheck = response !== null;
  const showContinue = phase === "checked" || (isMatch && response === "done");

  return (
    <View style={styles.root}>
      {/* top bar: close, progress, hearts */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <ProgressBar progress={total ? solved / total : 0} />
        </View>
        <Hearts count={Math.max(0, hearts)} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <ExerciseView
          key={`${node.lesson.id}-${round}`}
          exercise={current}
          revealed={phase === "checked"}
          correct={correct}
          onChange={setResponse}
          onMistake={onMatchMistake}
        />
      </ScrollView>

      {/* footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 14 },
          phase === "checked" && {
            backgroundColor: correct ? "#14301B" : "#301414",
            borderTopColor: correct ? theme.colors.success : theme.colors.danger,
          },
        ]}
      >
        {phase === "checked" ? (
          <Text style={[styles.banner, { color: correct ? theme.colors.success : theme.colors.danger }]}>
            {correct ? "Nice! ✓" : "Not quite — it'll come back around."}
          </Text>
        ) : null}

        {showContinue ? (
          <Button
            label="Continue"
            onPress={() => proceed(isMatch ? true : correct === true)}
            style={correct === false ? { backgroundColor: theme.colors.danger } : undefined}
          />
        ) : (
          <Button label="Check" onPress={check} disabled={!canCheck || isMatch} />
        )}
        {isMatch && !showContinue ? (
          <Text style={styles.matchHint}>Tap each pair to match them all.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  top: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing(2),
    paddingBottom: 12,
  },
  close: { color: theme.colors.textMuted, fontSize: 24, fontWeight: "700" },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing(2),
    paddingTop: 14,
    gap: 10,
  },
  banner: { fontSize: 17, fontWeight: "800" },
  matchHint: { color: theme.colors.textMuted, textAlign: "center" },
});
