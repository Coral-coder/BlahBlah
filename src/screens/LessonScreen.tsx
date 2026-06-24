import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseView, type ExResponse } from "@/components/Exercise";
import { Button, Hearts, ProgressBar } from "@/components/ui";
import { flattenCourse, type Exercise } from "@/curriculum/types";
import { getCourse } from "@/curriculum";
import { isCorrect, lessonXp } from "@/lesson/engine";
import { setActiveGlossary } from "@/lib/glossary";
import { playSfx } from "@/lib/sfx";
import { setSpeechLocale } from "@/lib/speech";
import { useNav, useRoute } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const START_HEARTS = 5;

export function LessonScreen() {
  const { courseCode, lessonId } = useRoute<{ courseCode: string; lessonId: string }>();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { completeLesson, state } = useProgress();
  const typingDisabled = state.settings.typingExercises === false;
  const hardMode = state.settings.hardMode && !typingDisabled;

  const course = getCourse(courseCode);
  const node = useMemo(
    () => (course ? flattenCourse(course).find((n) => n.lesson.id === lessonId) : undefined),
    [course, lessonId],
  );

  useEffect(() => {
    setSpeechLocale(course?.speechLocale);
    setActiveGlossary(course?.code);
  }, [course]);

  // Challenge mode: convert word-bank tiles into typed answers for harder recall.
  const harden = (ex: Exercise): Exercise =>
    hardMode && ex.type === "wordbank"
      ? {
          type: "type",
          prompt: "Type the translation",
          question: ex.given,
          answer: ex.answer,
          speak: ex.speak,
          pinyin: ex.pinyin,
        }
      : ex;

  // Word pool from this lesson, used to build tiles when converting typing → tap.
  const lessonWordPool = useMemo(() => {
    const set = new Set<string>();
    for (const e of node?.lesson.exercises ?? []) {
      if (e.type === "wordbank" || e.type === "listen") e.bank.forEach((w) => set.add(w));
      else if (e.type === "fill") e.options.forEach((w) => set.add(w));
      else if (e.type === "match") e.pairs.forEach((p) => p.target.split(" ").forEach((w) => set.add(w)));
    }
    return [...set];
  }, [node]);

  // When the learner has turned typing off, present a tap-the-tiles word bank
  // instead of any typing exercise (generated or via Challenge mode).
  const soften = (ex: Exercise): Exercise => {
    if (!typingDisabled || ex.type !== "type") return ex;
    const answerWords = ex.answer.split(" ").filter(Boolean);
    const excl = new Set(answerWords);
    const distractors = lessonWordPool.filter((w) => !excl.has(w)).slice(0, 4);
    return {
      type: "wordbank",
      prompt: "Tap the translation",
      given: ex.question,
      answer: ex.answer,
      bank: [...answerWords, ...distractors],
      speak: ex.speak,
      pinyin: ex.pinyin,
    };
  };
  const transform = (ex: Exercise): Exercise => soften(harden(ex));
  const exercises = node ? node.lesson.exercises.map(transform) : [];
  const total = exercises.length;
  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [response, setResponse] = useState<ExResponse>(null);
  const [phase, setPhase] = useState<"answer" | "checked">("answer");
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [solved, setSolved] = useState(0);
  const [round, setRound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  if (!node) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text }}>Lesson not found.</Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const current = queue[0];
  // card/match/speak manage their own flow and just report completion.
  const noCheck =
    current.type === "match" || current.type === "speak" || current.type === "card";

  function finish(passed: boolean) {
    const comboBonus = Math.floor(maxCombo / 5) * 3; // reward long perfect runs
    const xp = passed ? lessonXp(mistakes) + comboBonus : 0;
    if (passed) completeLesson(courseCode, lessonId, xp, node?.lesson.vocab);
    nav.replace("lessonComplete", { courseCode, lessonId, passed, xp, mistakes, total });
  }

  function check() {
    const ok = isCorrect(current, response as number | string);
    setCorrect(ok);
    setPhase("checked");
    playSfx(ok ? "correct" : "wrong");
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
      setCombo((c) => {
        const nc = c + 1;
        setMaxCombo((m) => Math.max(m, nc));
        return nc;
      });
    } else {
      next = [...queue.slice(1), queue[0]];
      setCombo(0);
    }
    if (next.length === 0) return finish(true);
    setQueue(next);
    setResponse(null);
    setPhase("answer");
    setCorrect(null);
    setRound((r) => r + 1);
  }

  // Swap the current audio exercise for a written equivalent (no penalty, no skip).
  function swapCurrent(replacement: Exercise) {
    setQueue((q) => [soften(replacement), ...q.slice(1)]);
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
  const showContinue = phase === "checked" || (noCheck && response === "done");

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
        {combo >= 2 ? <Text style={styles.combo}>🔥{combo}</Text> : null}
        <Hearts count={Math.max(0, hearts)} />
      </View>

      <Text style={styles.tapTip}>💡 Tap a dotted word — or hold any word tile — for its meaning</Text>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <ExerciseView
          key={`${node.lesson.id}-${round}`}
          exercise={current}
          revealed={phase === "checked"}
          correct={correct}
          onChange={setResponse}
          onMistake={onMatchMistake}
          onSwap={swapCurrent}
          onAutoAdvance={() => proceed(true)}
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
            onPress={() => {
              if (current.type === "match") playSfx("correct");
              proceed(noCheck ? true : correct === true);
            }}
            style={correct === false ? { backgroundColor: theme.colors.danger } : undefined}
          />
        ) : (
          <Button label="Check" onPress={check} disabled={!canCheck || noCheck} />
        )}
        {current.type === "match" && !showContinue ? (
          <Text style={styles.matchHint}>Tap a word, then its match.</Text>
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
  combo: { color: theme.colors.gold, fontWeight: "900", fontSize: 16, marginRight: 10 },
  tapTip: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: theme.spacing(2),
    paddingBottom: 6,
  },
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
