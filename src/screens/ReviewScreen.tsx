import { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
import { normalize, shuffle, typedAnswerCorrect, pinyinAnswerCorrect } from "@/lesson/engine";
import { learnedWordsFor, type LearnedWord } from "@/lib/learned";
import { isDue } from "@/lib/srs";
import { playSfx } from "@/lib/sfx";
import { setSpeechLocale, speak } from "@/lib/speech";
import { useNav, useRoute } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const SESSION = 12;

interface Card {
  word: LearnedWord;
  mode: "type" | "choose";
  options?: string[];
}

export function ReviewScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, isCompleted, completeLesson, recordWordResult } = useProgress();
  const { mistakesOnly } = useRoute<{ mistakesOnly?: boolean }>();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  // Honor the global "I hate typing" opt-out: when typing is disabled, every
  // review card becomes a tap-to-choose card (no keyboard at all).
  const typingOff = state.settings.typingExercises === false;

  const cards = useMemo<Card[]>(() => {
    if (course) setSpeechLocale(course.speechLocale);
    if (!course) return [];
    const words = learnedWordsFor(course, isCompleted);
    if (words.length < 4) return [];
    const stats = state.wordStats[course.code] ?? {};
    let pool = words;
    if (mistakesOnly) {
      pool = words.filter((w) => (stats[w.target]?.w ?? 0) > 0);
      if (pool.length === 0) return [];
    }
    // due first, then weakest (lower correct-wrong), then least-recently seen
    const scored = pool
      .map((w) => {
        const s = stats[w.target];
        return { w, due: isDue(s) ? 0 : 1, score: s ? s.c - s.w : 0, t: s ? s.t : 0 };
      })
      .sort((a, b) => a.due - b.due || a.score - b.score || a.t - b.t);
    const chosen = scored.slice(0, SESSION).map((x) => x.w);
    const chooseCard = (word: LearnedWord): Card => {
      const distract = shuffle(words.filter((x) => x.target !== word.target)).slice(0, 3);
      return {
        word,
        mode: "choose",
        options: shuffle([word.target, ...distract.map((d) => d.target)]),
      };
    };
    return shuffle(chosen).map((word, i) => {
      if (typingOff || i % 2 !== 0) return chooseCard(word);
      return { word, mode: "type" as const };
    });
  }, [course, isCompleted, typingOff]);

  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!course || cards.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ fontSize: 52 }}>{mistakesOnly ? "🎯" : "🧠"}</Text>
        <Text style={styles.empty}>
          {mistakesOnly
            ? "No mistakes to review — nice work! Keep learning and check back."
            : "Finish a few lessons first — Review drills the words you've learned."}
        </Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const card = cards[idx];

  function check() {
    Keyboard.dismiss();
    const resp = card.mode === "type" ? typed : pick ?? "";
    // Typed answers accept the target script OR its romanization (pinyin); choose
    // cards still match exactly.
    const ok =
      card.mode === "type"
        ? typedAnswerCorrect(card.word.target, resp) ||
          (!!card.word.pinyin && pinyinAnswerCorrect(card.word.pinyin, resp))
        : normalize(resp) === normalize(card.word.target);
    setCorrect(ok);
    setChecked(true);
    playSfx(ok ? "correct" : "wrong");
    recordWordResult(course!.code, card.word.target, ok);
    if (ok) setScore((s) => s + 1);
    speak(card.word.target);
  }

  function next() {
    Keyboard.dismiss();
    if (idx < cards.length - 1) {
      setIdx((i) => i + 1);
      setTyped("");
      setPick(null);
      setChecked(false);
      setCorrect(false);
    } else {
      completeLesson(course!.code, `review:${Date.now()}`, 10);
      setDone(true);
    }
  }

  if (done) {
    return (
      <View style={[styles.root, styles.center, { padding: theme.spacing(4) }]}>
        <Confetti />
        <Text style={{ fontSize: 64 }}>🧠</Text>
        <Text style={styles.doneTitle}>Review complete!</Text>
        <Text style={styles.doneSub}>{score}/{cards.length} recalled · +10 XP</Text>
        <Button label="Done" onPress={nav.goBack} style={{ marginTop: 24, alignSelf: "stretch" }} />
      </View>
    );
  }

  const canCheck = card.mode === "type" ? typed.trim().length > 0 : pick !== null;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <ProgressBar progress={idx / cards.length} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 10}
      >
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing(2), flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.prompt}>How do you say…</Text>
        <Text style={styles.english}>{card.word.en}</Text>

        {card.mode === "type" ? (
          <>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              editable={!checked}
              placeholder="Type it in the target language"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => {
                if (!checked && typed.trim().length > 0) check();
              }}
              style={[
                styles.input,
                checked && { borderColor: correct ? theme.colors.success : theme.colors.danger },
              ]}
            />
            {checked && !correct ? (
              <Text style={styles.answer}>{card.word.target}{card.word.pinyin ? `  (${card.word.pinyin})` : ""}</Text>
            ) : null}
          </>
        ) : (
          <View style={{ gap: 12, marginTop: theme.spacing(2) }}>
            {card.options!.map((opt) => {
              const isPick = pick === opt;
              let border: string = theme.colors.border;
              let bg: string = theme.colors.surface;
              if (checked && opt === card.word.target) (border = theme.colors.success), (bg = "#15301A");
              else if (checked && isPick) (border = theme.colors.danger), (bg = "#301717");
              else if (isPick) (border = theme.colors.primary), (bg = theme.colors.surfaceAlt);
              return (
                <Pressable
                  key={opt}
                  disabled={checked}
                  onPress={() => setPick(opt)}
                  style={[styles.opt, { borderColor: border, backgroundColor: bg }]}
                >
                  <Text style={styles.optText}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {checked ? (
          <Button label={idx < cards.length - 1 ? "Continue" : "Finish"} onPress={next} />
        ) : (
          <Button label="Check" onPress={check} disabled={!canCheck} />
        )}
      </View>
      </KeyboardAvoidingView>
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
  english: { color: theme.colors.text, fontSize: 30, fontWeight: "900", marginTop: 6 },
  input: {
    marginTop: theme.spacing(3),
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
  },
  answer: { color: theme.colors.success, fontSize: 18, fontWeight: "700", marginTop: 12 },
  opt: { borderWidth: 2, borderRadius: theme.radius.md, padding: theme.spacing(2) },
  optText: { color: theme.colors.text, fontSize: 18, fontWeight: "600" },
  footer: { paddingTop: 12, paddingHorizontal: theme.spacing(2), borderTopWidth: 1, borderTopColor: theme.colors.border },
  doneTitle: { color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 10 },
  doneSub: { color: theme.colors.gold, fontSize: 17, fontWeight: "700", marginTop: 6 },
});
