import Voice from "@react-native-voice/voice";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Confetti } from "@/components/Confetti";
import { Button, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { normalize } from "@/lesson/engine";
import { getSpeechLocale, setSpeechLocale, speak } from "@/lib/speech";
import { playSfx } from "@/lib/sfx";
import { useNav, useRoute } from "@/navigation";
import { getStory } from "@/stories";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

function score(expected: string, heard: string): number {
  const e = normalize(expected).replace(/\s+/g, "");
  const h = normalize(heard).replace(/\s+/g, "");
  if (!e) return 0;
  if (e === h) return 100;
  // simple overlap ratio
  let same = 0;
  for (let i = 0; i < Math.min(e.length, h.length); i++) if (e[i] === h[i]) same++;
  return Math.round((same / Math.max(e.length, h.length)) * 100);
}

export function RoleplayScreen() {
  const { storyId } = useRoute<{ storyId: string }>();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { completeLesson } = useProgress();

  const story = getStory(storyId);
  const course = story ? getCourse(story.courseCode) : undefined;

  // "You" play the first non-narrator speaker; the rest is read to you.
  const myRole = useMemo(() => {
    if (!story) return undefined;
    const l = story.lines.find((x) => x.speaker && !x.speaker.includes("📖"));
    return l?.speaker;
  }, [story]);

  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<"idle" | "listening" | "scored">("idle");
  const [sc, setSc] = useState<number | null>(null);
  const transcript = useRef("");
  const scored = useRef(false);

  useEffect(() => {
    if (course) setSpeechLocale(course.speechLocale);
  }, [course]);

  const isMine = (i: number) => !!myRole && story?.lines[i]?.speaker === myRole;

  // Auto-read partner lines when reached.
  useEffect(() => {
    if (story && !isMine(idx)) speak(story.lines[idx]?.target ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    (Voice as any).onSpeechResults = (e: { value?: string[] }) => {
      if (e.value?.[0]) transcript.current = e.value[0];
    };
    (Voice as any).onSpeechEnd = () => finalize();
    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (!story) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text }}>Story not found.</Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const line = story.lines[idx];
  const mine = isMine(idx);

  function finalize() {
    if (scored.current) return;
    scored.current = true;
    const s = score(line.target, transcript.current);
    setSc(s);
    setStatus("scored");
    playSfx(s >= 60 ? "correct" : "wrong");
  }

  async function startMic() {
    transcript.current = "";
    scored.current = false;
    setSc(null);
    try {
      setStatus("listening");
      await Voice.start(getSpeechLocale());
    } catch {
      setStatus("idle");
    }
  }
  async function stopMic() {
    try {
      await Voice.stop();
    } catch {
      // no-op
    }
    setTimeout(finalize, 700);
  }

  function next() {
    if (idx < story!.lines.length - 1) {
      setIdx((i) => i + 1);
      setStatus("idle");
      setSc(null);
      scored.current = false;
    } else {
      completeLesson(story!.courseCode, `roleplay:${story!.id}`, 15);
      setIdx(story!.lines.length); // signals done
    }
  }

  if (idx >= story.lines.length) {
    return (
      <View style={[styles.root, styles.center, { padding: theme.spacing(4) }]}>
        <Confetti />
        <Text style={{ fontSize: 64 }}>🎭</Text>
        <Text style={styles.doneTitle}>Scene complete!</Text>
        <Text style={styles.doneSub}>+15 XP</Text>
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
          <ProgressBar progress={idx / story.lines.length} />
        </View>
      </View>
      <Text style={styles.role}>You play: {myRole ?? "—"}</Text>

      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), flexGrow: 1, justifyContent: "center" }}>
        <View style={[styles.bubble, mine ? styles.mine : styles.partner]}>
          <Text style={styles.speaker}>{line.speaker} {mine ? "(you)" : ""}</Text>
          <Text style={styles.target}>{line.target}</Text>
          {line.pinyin ? <Text style={styles.pinyin}>{line.pinyin}</Text> : null}
          <Text style={styles.en}>{line.en}</Text>
        </View>

        {mine ? (
          <View style={styles.micWrap}>
            <Pressable
              onPress={status === "listening" ? stopMic : startMic}
              style={[styles.mic, status === "listening" && { backgroundColor: theme.colors.danger }]}
            >
              {status === "listening" ? <ActivityIndicator color="#fff" size="large" /> : <Text style={{ fontSize: 34 }}>🎤</Text>}
            </Pressable>
            <Text style={styles.micLabel}>
              {status === "listening" ? "Listening… tap ✓ when done" : status === "scored" ? `${sc}% — tap to retry` : "Say your line"}
            </Text>
          </View>
        ) : (
          <Pressable onPress={() => speak(line.target)} style={styles.replay}>
            <Text style={styles.replayText}>🔊 Hear it again</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        <Button
          label={idx < story.lines.length - 1 ? "Continue" : "Finish"}
          onPress={next}
          disabled={mine && status === "idle"}
        />
        {mine && status === "idle" ? (
          <Pressable onPress={next} style={{ alignSelf: "center", marginTop: 10 }}>
            <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>Skip line</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: theme.spacing(2), paddingBottom: 6 },
  close: { color: theme.colors.textMuted, fontSize: 24, fontWeight: "700" },
  role: { color: theme.colors.accent, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  bubble: { borderRadius: theme.radius.lg, padding: theme.spacing(2), borderWidth: 1 },
  mine: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.primary },
  partner: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
  speaker: { color: theme.colors.accent, fontWeight: "800", marginBottom: 6 },
  target: { color: theme.colors.text, fontSize: 24, fontWeight: "700", lineHeight: 32 },
  pinyin: { color: theme.colors.accent, marginTop: 4 },
  en: { color: theme.colors.textMuted, marginTop: 8 },
  micWrap: { alignItems: "center", marginTop: theme.spacing(3), gap: 10 },
  mic: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  micLabel: { color: theme.colors.textMuted, fontWeight: "700" },
  replay: { alignSelf: "center", marginTop: theme.spacing(3) },
  replayText: { color: theme.colors.primary, fontWeight: "700", fontSize: 16 },
  footer: { paddingTop: 12, paddingHorizontal: theme.spacing(2), borderTopWidth: 1, borderTopColor: theme.colors.border },
  doneTitle: { color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 10 },
  doneSub: { color: theme.colors.gold, fontSize: 17, fontWeight: "700", marginTop: 6 },
});
