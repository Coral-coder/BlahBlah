import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Confetti } from "@/components/Confetti";
import { Button, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { normalize, shuffle } from "@/lesson/engine";
import { learnedSentencesFor, type LearnedSentence } from "@/lib/learned";
import { playSfx } from "@/lib/sfx";
import { setSpeechLocale, speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const SESSION = 8;

export function DictationScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, isCompleted, completeLesson } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  const deck = useMemo<LearnedSentence[]>(() => {
    if (course) setSpeechLocale(course.speechLocale);
    if (!course) return [];
    return shuffle(learnedSentencesFor(course, isCompleted)).slice(0, SESSION);
  }, [course, isCompleted]);

  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Play the current sentence when it appears.
  useEffect(() => {
    if (deck[idx]) speak(deck[idx].target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, deck.length]);

  if (!course || deck.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ fontSize: 52 }}>👂</Text>
        <Text style={styles.empty}>
          Finish some sentence lessons first — dictation plays sentences you've learned.
        </Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const item = deck[idx];

  function check() {
    const ok = normalize(typed) === normalize(item.target);
    setCorrect(ok);
    setChecked(true);
    playSfx(ok ? "correct" : "wrong");
    if (ok) setScore((s) => s + 1);
  }

  function next() {
    if (idx < deck.length - 1) {
      setIdx((i) => i + 1);
      setTyped("");
      setChecked(false);
      setCorrect(false);
    } else {
      completeLesson(course!.code, `dictation:${Date.now()}`, 10);
      setDone(true);
    }
  }

  if (done) {
    return (
      <View style={[styles.root, styles.center, { padding: theme.spacing(4) }]}>
        <Confetti />
        <Text style={{ fontSize: 64 }}>👂</Text>
        <Text style={styles.doneTitle}>Dictation complete!</Text>
        <Text style={styles.doneSub}>{score}/{deck.length} correct · +10 XP</Text>
        <Button label="Done" onPress={nav.goBack} style={{ marginTop: 24, alignSelf: "stretch" }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <ProgressBar progress={idx / deck.length} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), flexGrow: 1 }}>
        <Text style={styles.prompt}>Type what you hear</Text>
        <Pressable style={styles.bigSpeak} onPress={() => speak(item.target)}>
          <Text style={{ fontSize: 40 }}>🔊</Text>
          <Text style={styles.bigSpeakLabel}>Tap to replay</Text>
        </Pressable>

        <TextInput
          value={typed}
          onChangeText={setTyped}
          editable={!checked}
          placeholder="Type it here"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          style={[
            styles.input,
            checked && { borderColor: correct ? theme.colors.success : theme.colors.danger },
          ]}
        />

        {checked ? (
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.answerLabel, { color: correct ? theme.colors.success : theme.colors.danger }]}>
              {correct ? "Correct! ✓" : "Answer:"}
            </Text>
            <Text style={styles.answer}>{item.target}</Text>
            {item.pinyin ? <Text style={styles.pinyin}>{item.pinyin}</Text> : null}
            <Text style={styles.en}>{item.en}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {checked ? (
          <Button label={idx < deck.length - 1 ? "Continue" : "Finish"} onPress={next} />
        ) : (
          <Button label="Check" onPress={check} disabled={!typed.trim()} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  empty: { color: theme.colors.textMuted, textAlign: "center", marginTop: 14, paddingHorizontal: 30, lineHeight: 22 },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: theme.spacing(2), paddingBottom: 10 },
  close: { color: theme.colors.textMuted, fontSize: 24, fontWeight: "700" },
  prompt: { color: theme.colors.textMuted, fontSize: 15, fontWeight: "700" },
  bigSpeak: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing(2),
  },
  bigSpeakLabel: { color: theme.colors.primaryText, fontWeight: "700", fontSize: 16 },
  input: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    minHeight: 56,
  },
  answerLabel: { fontWeight: "800", fontSize: 15 },
  answer: { color: theme.colors.text, fontSize: 20, fontWeight: "700", marginTop: 6 },
  pinyin: { color: theme.colors.accent, marginTop: 2 },
  en: { color: theme.colors.textMuted, marginTop: 4 },
  footer: { paddingTop: 12, paddingHorizontal: theme.spacing(2), borderTopWidth: 1, borderTopColor: theme.colors.border },
  doneTitle: { color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 10 },
  doneSub: { color: theme.colors.gold, fontSize: 17, fontWeight: "700", marginTop: 6 },
});
