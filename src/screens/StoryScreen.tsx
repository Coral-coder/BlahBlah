import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Confetti } from "@/components/Confetti";
import { Button, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { playSfx } from "@/lib/sfx";
import { setSpeechLocale, speak } from "@/lib/speech";
import { useNav, useRoute } from "@/navigation";
import { getStory } from "@/stories";
import type { Story } from "@/stories/types";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function StoryScreen() {
  const { storyId, story: inlineStory } = useRoute<{ storyId?: string; story?: Story }>();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const story = inlineStory ?? (storyId ? getStory(storyId) : undefined);
  const course = story ? getCourse(story.courseCode) : undefined;

  const [lineIdx, setLineIdx] = useState(0); // how many lines revealed
  const [phase, setPhase] = useState<"read" | "quiz" | "done">("read");
  const [qIdx, setQIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (course) setSpeechLocale(course.speechLocale);
  }, [course]);

  const shownLines = useMemo(
    () => (story ? story.lines.slice(0, lineIdx + 1) : []),
    [story, lineIdx],
  );

  useEffect(() => {
    if (story && phase === "read") speak(story.lines[lineIdx]?.target ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, phase]);

  if (!story) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text }}>Story not found.</Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const s = story; // narrowed (non-undefined) for use in closures below
  const totalSteps = s.lines.length + s.questions.length;
  const doneSteps =
    phase === "read" ? lineIdx : s.lines.length + qIdx + (checked ? 1 : 0);

  function advanceRead() {
    if (lineIdx < s.lines.length - 1) setLineIdx((i) => i + 1);
    else setPhase("quiz");
  }

  function checkQuiz() {
    const q = s.questions[qIdx];
    const ok = pick === q.answer;
    setChecked(true);
    playSfx(ok ? "correct" : "wrong");
    if (ok) setCorrectCount((c) => c + 1);
  }

  function nextQuiz() {
    if (qIdx < s.questions.length - 1) {
      setQIdx((i) => i + 1);
      setPick(null);
      setChecked(false);
    } else {
      completeLesson(s.courseCode, `story:${s.id}`, 20);
      setPhase("done");
    }
  }

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <ProgressBar progress={totalSteps ? doneSteps / totalSteps : 0} />
        </View>
      </View>

      {phase === "read" ? (
        <>
          <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: 12 }}>
            {shownLines.map((l, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  speak(l.target);
                  setRevealed((r) => ({ ...r, [i]: !r[i] }));
                }}
                style={styles.line}
              >
                {l.speaker ? <Text style={styles.speaker}>{l.speaker}</Text> : null}
                <Text style={styles.lineTarget}>{l.target}</Text>
                {l.pinyin ? <Text style={styles.linePinyin}>{l.pinyin}</Text> : null}
                {revealed[i] ? <Text style={styles.lineEn}>{l.en}</Text> : (
                  <Text style={styles.tapHint}>tap for translation · 🔊</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
            <Button
              label={lineIdx < story.lines.length - 1 ? "Continue" : "Comprehension →"}
              onPress={advanceRead}
            />
          </View>
        </>
      ) : null}

      {phase === "quiz" ? (
        <>
          <ScrollView contentContainerStyle={{ padding: theme.spacing(2) }}>
            <Text style={styles.qPrompt}>{story.questions[qIdx].question}</Text>
            <View style={{ gap: 12, marginTop: theme.spacing(2) }}>
              {story.questions[qIdx].options.map((opt, i) => {
                const isPick = pick === i;
                const ans = s.questions[qIdx].answer;
                let border: string = theme.colors.border;
                let bg: string = theme.colors.surface;
                if (checked && i === ans) (border = theme.colors.success), (bg = "#15301A");
                else if (checked && isPick) (border = theme.colors.danger), (bg = "#301717");
                else if (isPick) (border = theme.colors.primary), (bg = theme.colors.surfaceAlt);
                return (
                  <Pressable
                    key={i}
                    disabled={checked}
                    onPress={() => setPick(i)}
                    style={[styles.opt, { borderColor: border, backgroundColor: bg }]}
                  >
                    <Text style={styles.optText}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
            {checked ? (
              <Button label="Continue" onPress={nextQuiz} />
            ) : (
              <Button label="Check" onPress={checkQuiz} disabled={pick === null} />
            )}
          </View>
        </>
      ) : null}

      {phase === "done" ? (
        <View style={styles.doneWrap}>
          <Confetti />
          <Text style={{ fontSize: 64 }}>📖</Text>
          <Text style={styles.doneTitle}>Story complete!</Text>
          <Text style={styles.doneSub}>
            {correctCount}/{story.questions.length} correct · +20 XP
          </Text>
          <Button label="Done" onPress={nav.goBack} style={{ marginTop: 24, alignSelf: "stretch" }} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: theme.spacing(2), paddingBottom: 10 },
  close: { color: theme.colors.textMuted, fontSize: 24, fontWeight: "700" },
  line: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
  },
  speaker: { color: theme.colors.accent, fontWeight: "800", marginBottom: 4 },
  lineTarget: { color: theme.colors.text, fontSize: 20, fontWeight: "600", lineHeight: 28 },
  linePinyin: { color: theme.colors.accent, marginTop: 3 },
  lineEn: { color: theme.colors.textMuted, marginTop: 6, fontSize: 15 },
  tapHint: { color: theme.colors.textMuted, marginTop: 6, fontSize: 12, fontStyle: "italic" },
  footer: { paddingTop: 12, paddingHorizontal: theme.spacing(2), borderTopWidth: 1, borderTopColor: theme.colors.border },
  qPrompt: { color: theme.colors.text, fontSize: 20, fontWeight: "800" },
  opt: { borderWidth: 2, borderRadius: theme.radius.md, padding: theme.spacing(2) },
  optText: { color: theme.colors.text, fontSize: 17, fontWeight: "600" },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(4) },
  doneTitle: { color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 10 },
  doneSub: { color: theme.colors.gold, fontSize: 17, fontWeight: "700", marginTop: 6 },
});
