import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Exercise } from "@/curriculum/types";
import { shuffle } from "@/lesson/engine";
import { speak } from "@/lib/speech";
import { theme } from "@/theme";

/** Sentinel response that means "match exercise finished". */
export const MATCH_DONE = "__match_done__";

export type ExResponse = number | string | null;

interface Props {
  exercise: Exercise;
  /** Graded by the parent (after Check). Inputs lock and show right/wrong. */
  revealed: boolean;
  /** Whether the parent considers the current response correct. */
  correct: boolean | null;
  onChange: (r: ExResponse) => void;
  /** Called when the user makes a wrong tap inside a match exercise. */
  onMistake?: () => void;
}

export function ExerciseView(props: Props) {
  const { exercise } = props;
  switch (exercise.type) {
    case "select":
      return <SelectView {...props} exercise={exercise} />;
    case "fill":
      return <FillView {...props} exercise={exercise} />;
    case "wordbank":
      return <WordbankView {...props} exercise={exercise} given={exercise.given} />;
    case "listen":
      return <WordbankView {...props} exercise={exercise} listen />;
    case "match":
      return <MatchView {...props} exercise={exercise} />;
    default:
      return null;
  }
}

function Speaker({ text, big }: { text: string; big?: boolean }) {
  return (
    <Pressable onPress={() => speak(text)} hitSlop={10} style={styles.speaker}>
      <Text style={{ fontSize: big ? 30 : 18 }}>🔊</Text>
    </Pressable>
  );
}

function Instruction({ text }: { text: string }) {
  return <Text style={styles.instruction}>{text}</Text>;
}

// ---------------------------------------------------------------- select
function SelectView({
  exercise,
  revealed,
  onChange,
}: Props & { exercise: Extract<Exercise, { type: "select" }> }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.questionRow}>
        <Text style={styles.question}>{exercise.question}</Text>
        {exercise.speak ? <Speaker text={exercise.speak} /> : null}
      </View>
      <View style={{ gap: 12, marginTop: theme.spacing(2) }}>
        {exercise.options.map((opt, i) => {
          const isSel = selected === i;
          let borderColor: string = theme.colors.border;
          let bg: string = theme.colors.surface;
          if (revealed && i === exercise.answer) {
            borderColor = theme.colors.success;
            bg = "#15301A";
          } else if (revealed && isSel) {
            borderColor = theme.colors.danger;
            bg = "#301717";
          } else if (isSel) {
            borderColor = theme.colors.primary;
            bg = theme.colors.surfaceAlt;
          }
          return (
            <Pressable
              key={i}
              disabled={revealed}
              onPress={() => {
                setSelected(i);
                onChange(i);
              }}
              style={[styles.option, { borderColor, backgroundColor: bg }]}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- fill
function FillView({
  exercise,
  revealed,
  onChange,
}: Props & { exercise: Extract<Exercise, { type: "fill" }> }) {
  const [choice, setChoice] = useState<string | null>(null);
  const options = useMemo(() => shuffle(exercise.options), [exercise]);
  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.sentenceWrap}>
        <Text style={styles.sentence}>
          {exercise.before}
          <Text
            style={[
              styles.blank,
              choice
                ? {
                    color: revealed
                      ? choice === exercise.answer
                        ? theme.colors.success
                        : theme.colors.danger
                      : theme.colors.text,
                    borderBottomColor: theme.colors.primary,
                  }
                : null,
            ]}
          >
            {choice ? ` ${choice} ` : "  ______  "}
          </Text>
          {exercise.after}
        </Text>
        {exercise.speak ? <Speaker text={exercise.speak} /> : null}
      </View>
      {exercise.translation ? (
        <Text style={styles.translation}>{exercise.translation}</Text>
      ) : null}
      <View style={styles.tiles}>
        {options.map((opt, i) => {
          const used = choice === opt;
          return (
            <Pressable
              key={`${opt}-${i}`}
              disabled={revealed}
              onPress={() => {
                const next = used ? null : opt;
                setChoice(next);
                onChange(next);
              }}
              style={[
                styles.tile,
                used && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              ]}
            >
              <Text style={[styles.tileText, used && { color: theme.colors.primaryText }]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {revealed && choice !== exercise.answer ? (
        <Text style={styles.correctHint}>Answer: {exercise.answer}</Text>
      ) : null}
    </View>
  );
}

// ------------------------------------------------ wordbank / listen
function WordbankView({
  exercise,
  revealed,
  onChange,
  listen,
  given,
}: Props & {
  exercise: Extract<Exercise, { type: "wordbank" | "listen" }>;
  listen?: boolean;
  given?: string;
}) {
  const bank = useMemo(
    () => shuffle(exercise.bank).map((word, id) => ({ word, id })),
    [exercise],
  );
  const [used, setUsed] = useState<number[]>([]); // bank ids in chosen order

  useEffect(() => {
    if (listen && exercise.speak) speak(exercise.speak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise]);

  const chosenWords = used.map((id) => bank.find((b) => b.id === id)!.word);
  const answer = chosenWords.join(" ");

  function setChosen(ids: number[]) {
    setUsed(ids);
    onChange(ids.length ? ids.map((id) => bank.find((b) => b.id === id)!.word).join(" ") : null);
  }

  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      {listen ? (
        <Pressable style={styles.bigSpeak} onPress={() => speak(exercise.speak ?? "")}>
          <Text style={{ fontSize: 36 }}>🔊</Text>
          <Text style={styles.bigSpeakLabel}>Tap to replay</Text>
        </Pressable>
      ) : (
        <View style={styles.questionRow}>
          <Text style={styles.given}>{given}</Text>
          {exercise.speak ? <Speaker text={exercise.speak} /> : null}
        </View>
      )}

      {/* assembled answer line */}
      <View style={styles.answerLine}>
        {used.map((id, idx) => {
          const w = bank.find((b) => b.id === id)!.word;
          return (
            <Pressable
              key={id}
              disabled={revealed}
              onPress={() => setChosen(used.filter((_, i) => i !== idx))}
              style={styles.tileSmall}
            >
              <Text style={styles.tileText}>{w}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.answerRule} />

      {/* bank */}
      <View style={styles.tiles}>
        {bank.map((b) => {
          const isUsed = used.includes(b.id);
          return (
            <Pressable
              key={b.id}
              disabled={revealed || isUsed}
              onPress={() => setChosen([...used, b.id])}
              style={[styles.tile, isUsed && styles.tileGhost]}
            >
              <Text style={[styles.tileText, isUsed && { color: "transparent" }]}>
                {b.word}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {revealed && answer.trim() !== exercise.answer ? (
        <Text style={styles.correctHint}>Answer: {exercise.answer}</Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- match
function MatchView({
  exercise,
  onChange,
  onMistake,
}: Props & { exercise: Extract<Exercise, { type: "match" }> }) {
  const left = useMemo(
    () => shuffle(exercise.pairs.map((p, i) => ({ ...p, key: i }))),
    [exercise],
  );
  const right = useMemo(
    () => shuffle(exercise.pairs.map((p, i) => ({ ...p, key: i }))),
    [exercise],
  );
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  function tryMatch(l: number | null, r: number | null) {
    if (l == null || r == null) return;
    if (l === r) {
      const next = [...done, l];
      setDone(next);
      setSelL(null);
      setSelR(null);
      if (next.length === exercise.pairs.length) onChange("done");
    } else {
      onMistake?.();
      setWrong(Date.now());
      setTimeout(() => {
        setSelL(null);
        setSelR(null);
        setWrong(null);
      }, 450);
    }
  }

  const cell = (
    label: string,
    key: number,
    side: "L" | "R",
    selected: boolean,
    speakText?: string,
  ) => {
    const isDone = done.includes(key);
    return (
      <Pressable
        key={`${side}${key}`}
        disabled={isDone}
        onPress={() => {
          if (speakText) speak(speakText);
          if (side === "L") {
            setSelL(key);
            tryMatch(key, selR);
          } else {
            setSelR(key);
            tryMatch(selL, key);
          }
        }}
        style={[
          styles.matchCell,
          selected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceAlt },
          Boolean(wrong) && selected && { borderColor: theme.colors.danger },
          isDone && { opacity: 0.25, borderColor: theme.colors.success },
        ]}
      >
        <Text style={styles.matchText}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.matchRow}>
        <View style={styles.matchCol}>
          {left.map((p) => cell(p.target, p.key, "L", selL === p.key, p.speak ?? p.target))}
        </View>
        <View style={styles.matchCol}>
          {right.map((p) => cell(p.source, p.key, "R", selR === p.key))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: theme.spacing(2), paddingTop: theme.spacing(2) },
  instruction: { color: theme.colors.text, fontSize: 22, fontWeight: "800", marginBottom: theme.spacing(2) },
  questionRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  question: { color: theme.colors.text, fontSize: 26, fontWeight: "700" },
  given: { color: theme.colors.text, fontSize: 22, fontWeight: "600" },
  speaker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  option: {
    borderWidth: 2,
    borderRadius: theme.radius.md,
    padding: theme.spacing(2),
  },
  optionText: { color: theme.colors.text, fontSize: 18, fontWeight: "600" },
  sentenceWrap: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  sentence: { color: theme.colors.text, fontSize: 22, lineHeight: 34, flexShrink: 1 },
  blank: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    fontWeight: "800",
  },
  translation: { color: theme.colors.textMuted, marginTop: 10, fontSize: 15 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: theme.spacing(3) },
  tile: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tileSmall: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tileGhost: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.surfaceAlt },
  tileText: { color: theme.colors.text, fontSize: 18, fontWeight: "600" },
  answerLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    minHeight: 52,
    marginTop: theme.spacing(3),
  },
  answerRule: { height: 2, backgroundColor: theme.colors.border, marginTop: 6 },
  bigSpeak: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
  },
  bigSpeakLabel: { color: theme.colors.primaryText, fontWeight: "700", fontSize: 16 },
  correctHint: { color: theme.colors.success, fontWeight: "700", marginTop: theme.spacing(2), fontSize: 16 },
  matchRow: { flexDirection: "row", gap: 14, marginTop: theme.spacing(1) },
  matchCol: { flex: 1, gap: 12 },
  matchCell: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  matchText: { color: theme.colors.text, fontSize: 17, fontWeight: "600" },
});
