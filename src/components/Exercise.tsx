import Voice from "@react-native-voice/voice";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Exercise } from "@/curriculum/types";
import { normalize, shuffle } from "@/lesson/engine";
import { accentChars } from "@/lib/accents";
import { glossWord } from "@/lib/glossary";
import { getSpeechLocale, speak, speakSlow } from "@/lib/speech";
import { playSfx } from "@/lib/sfx";
import { theme } from "@/theme";

// ---- Tap-to-translate word hints --------------------------------------------
// A learner can tap (or long-press, on interactive tiles) any target-language
// word to hear it and see what it means.
function useHint() {
  const [hint, setHint] = useState<string | null>(null);
  const reveal = (word: string) => {
    const w = word.trim();
    if (!w) return;
    speak(w);
    const g = glossWord(w);
    setHint(g ? `${w} — ${g}` : `🔊 ${w}`);
  };
  return { hint, reveal };
}

function HintBar({ hint }: { hint: string | null }) {
  if (!hint) return null;
  return (
    <View style={styles.hintBar}>
      <Text style={styles.hintText}>💡 {hint}</Text>
    </View>
  );
}

/** Read-only target text whose words are each tappable for a translation. */
function GlossedText({
  text,
  textStyle,
}: {
  text: string;
  textStyle?: object;
}) {
  const { hint, reveal } = useHint();
  const tokens = text.split(" ").filter((t) => t.length > 0);
  return (
    <View>
      <View style={styles.glossRow}>
        {tokens.map((w, i) => {
          const known = !!glossWord(w);
          return (
            <Pressable key={`${w}-${i}`} onPress={() => reveal(w)} hitSlop={4}>
              <Text style={[styles.question, textStyle, known && styles.glossable]}>{w}</Text>
            </Pressable>
          );
        })}
      </View>
      <HintBar hint={hint} />
    </View>
  );
}

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
  /** Replace this exercise with an equivalent (e.g. swap audio → written). */
  onSwap?: (replacement: Exercise) => void;
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
    case "speak":
      return <SpeakView {...props} exercise={exercise} />;
    case "card":
      return <CardView {...props} exercise={exercise} />;
    case "type":
      return <TypeView {...props} exercise={exercise} />;
    default:
      return null;
  }
}

function CardView({
  exercise,
  onChange,
}: Props & { exercise: Extract<Exercise, { type: "card" }> }) {
  useEffect(() => {
    speak(exercise.target);
    onChange("done"); // presentation card — Continue is always available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise]);
  return (
    <View style={[styles.body, { alignItems: "center", justifyContent: "center", flex: 1 }]}>
      <Text style={styles.newWord}>NEW WORD</Text>
      <Pressable onPress={() => speak(exercise.target)} style={styles.cardArt}>
        {exercise.emoji ? (
          <Text style={{ fontSize: 88 }}>{exercise.emoji}</Text>
        ) : (
          <Text style={styles.cardLetter}>{Array.from(exercise.target)[0] ?? "?"}</Text>
        )}
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: theme.spacing(2) }}>
        <Text style={styles.cardWord}>{exercise.target}</Text>
        <Speaker text={exercise.target} />
      </View>
      {exercise.pinyin ? <Text style={styles.pinyin}>{exercise.pinyin}</Text> : null}
      <Text style={styles.cardMeaning}>{exercise.en}</Text>
    </View>
  );
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = Array.from({ length: n + 1 }, (_, i) => i);
  const curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** 0..100 similarity of a spoken transcript to the expected phrase. */
function pronunciationScore(expected: string, heard: string): number {
  const e = normalize(expected).replace(/\s+/g, "");
  const h = normalize(heard).replace(/\s+/g, "");
  if (!e) return 0;
  if (e === h) return 100;
  const dist = levenshtein(e, h);
  return Math.max(0, Math.round((1 - dist / Math.max(e.length, h.length)) * 100));
}

function Speaker({ text, big }: { text: string; big?: boolean }) {
  return (
    <Pressable
      onPress={() => speak(text)}
      onLongPress={() => speakSlow(text)}
      hitSlop={10}
      style={styles.speaker}
    >
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
  const { hint, reveal } = useHint();
  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.questionRow}>
        <Text style={styles.question}>{exercise.question}</Text>
        {exercise.speak ? <Speaker text={exercise.speak} /> : null}
      </View>
      {exercise.subtext ? <Text style={styles.subtext}>{exercise.subtext}</Text> : null}
      <HintBar hint={hint} />
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
              onLongPress={() => reveal(opt)}
              onPress={() => {
                setSelected(i);
                onChange(i);
              }}
              style={[styles.option, { borderColor, backgroundColor: bg }]}
            >
              <Text style={styles.optionText}>{opt}</Text>
              {exercise.optionSubs?.[i] ? (
                <Text style={styles.optionSub}>{exercise.optionSubs[i]}</Text>
              ) : null}
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
  const { hint, reveal } = useHint();
  const beforeWords = exercise.before.split(" ").filter(Boolean);
  const afterWords = exercise.after.split(" ").filter(Boolean);
  const blankColor = !choice
    ? theme.colors.text
    : revealed
      ? choice === exercise.answer
        ? theme.colors.success
        : theme.colors.danger
      : theme.colors.text;
  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.sentenceWrap}>
        <View style={styles.glossRow}>
          {beforeWords.map((w, i) => {
            const known = !!glossWord(w);
            return (
              <Pressable key={`b-${w}-${i}`} onPress={() => reveal(w)} hitSlop={4}>
                <Text style={[styles.sentence, known && styles.glossable]}>{w}</Text>
              </Pressable>
            );
          })}
          <Text style={[styles.sentence, styles.blank, { color: blankColor, borderBottomColor: choice ? theme.colors.primary : theme.colors.border }]}>
            {choice ? ` ${choice} ` : "  ______  "}
          </Text>
          {afterWords.map((w, i) => {
            const known = !!glossWord(w);
            return (
              <Pressable key={`a-${w}-${i}`} onPress={() => reveal(w)} hitSlop={4}>
                <Text style={[styles.sentence, known && styles.glossable]}>{w}</Text>
              </Pressable>
            );
          })}
        </View>
        {exercise.speak ? <Speaker text={exercise.speak} /> : null}
      </View>
      <HintBar hint={hint} />
      {exercise.pinyin ? <Text style={styles.pinyin}>{exercise.pinyin}</Text> : null}
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
  onSwap,
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
  const { hint, reveal } = useHint();

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
        <Pressable
          style={styles.bigSpeak}
          onPress={() => speak(exercise.speak ?? "")}
          onLongPress={() => speakSlow(exercise.speak ?? "")}
        >
          <Text style={{ fontSize: 36 }}>🔊</Text>
          <Text style={styles.bigSpeakLabel}>Tap to replay · hold for slow</Text>
        </Pressable>
      ) : null}
      {listen && onSwap && !revealed ? (
        <Pressable
          onPress={() =>
            onSwap({
              type: "wordbank",
              prompt: "Translate this",
              given: exercise.translation ?? exercise.answer,
              answer: exercise.answer,
              bank: exercise.bank,
              speak: exercise.speak,
              pinyin: exercise.pinyin,
            })
          }
          style={{ marginTop: 10, alignSelf: "flex-start" }}
        >
          <Text style={styles.swapLink}>Can't listen right now? Show the text →</Text>
        </Pressable>
      ) : null}
      {!listen ? (
        <View style={styles.questionRow}>
          <Text style={styles.given}>{given}</Text>
          {exercise.speak ? <Speaker text={exercise.speak} /> : null}
        </View>
      ) : null}

      <HintBar hint={hint} />

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
              onLongPress={() => reveal(b.word)}
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
      {revealed && (exercise.pinyin || exercise.translation) ? (
        <View style={{ marginTop: 10 }}>
          {exercise.pinyin ? <Text style={styles.pinyin}>{exercise.pinyin}</Text> : null}
          {exercise.translation ? (
            <Text style={styles.translation}>{exercise.translation}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- type
function TypeView({
  exercise,
  revealed,
  correct,
  onChange,
}: Props & { exercise: Extract<Exercise, { type: "type" }> }) {
  const [text, setText] = useState("");
  const setBoth = (t: string) => {
    setText(t);
    onChange(t.trim() ? t : null);
  };
  const accents = accentChars(getSpeechLocale());
  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.questionRow}>
        <Text style={styles.question}>{exercise.question}</Text>
        {exercise.speak ? <Speaker text={exercise.speak} /> : null}
      </View>
      <TextInput
        value={text}
        onChangeText={setBoth}
        editable={!revealed}
        placeholder="Type your translation…"
        placeholderTextColor={theme.colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        style={[
          styles.typeInput,
          revealed && {
            borderColor: correct ? theme.colors.success : theme.colors.danger,
            color: correct ? theme.colors.success : theme.colors.danger,
          },
        ]}
      />
      {!revealed && accents.length > 0 ? (
        <View style={styles.accentBar}>
          {accents.map((c) => (
            <Pressable key={c} onPress={() => setBoth(text + c)} style={styles.accentKey}>
              <Text style={styles.accentKeyText}>{c}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {revealed && !correct ? (
        <Text style={styles.correctHint}>Answer: {exercise.answer}</Text>
      ) : null}
      {revealed && exercise.pinyin ? <Text style={styles.pinyin}>{exercise.pinyin}</Text> : null}
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
  const { hint, reveal } = useHint();

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
    sub?: string,
  ) => {
    const isDone = done.includes(key);
    return (
      <Pressable
        key={`${side}${key}`}
        disabled={isDone}
        onLongPress={side === "L" && speakText ? () => reveal(speakText) : undefined}
        onPress={() => {
          // Either column can be tapped first; tapping a selected cell deselects.
          if (side === "L") {
            if (selL === key) return setSelL(null);
            if (speakText) speak(speakText);
            setSelL(key);
            tryMatch(key, selR);
          } else {
            if (selR === key) return setSelR(null);
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
        {sub ? <Text style={styles.matchSub}>{sub}</Text> : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <HintBar hint={hint} />
      <View style={styles.matchRow}>
        <View style={styles.matchCol}>
          {left.map((p) =>
            cell(p.target, p.key, "L", selL === p.key, p.speak ?? p.target, p.sub),
          )}
        </View>
        <View style={styles.matchCol}>
          {right.map((p) => cell(p.source, p.key, "R", selR === p.key))}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- speak
function SpeakView({
  exercise,
  onChange,
  onSwap,
}: Props & { exercise: Extract<Exercise, { type: "speak" }> }) {
  const [status, setStatus] = useState<"idle" | "listening" | "done">("idle");
  const [heard, setHeard] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Latest (cumulative) transcript; scoring happens only when recognition ends,
  // so the learner can say the WHOLE sentence before being graded.
  const transcript = useRef<string>("");
  const scored = useRef(false);

  function finalize() {
    if (scored.current) return;
    const text = transcript.current.trim();
    if (!text) {
      setStatus("idle");
      setError("Didn't catch that — tap the mic and try again.");
      return;
    }
    scored.current = true;
    const sc = pronunciationScore(exercise.text, text);
    setHeard(text);
    setScore(sc);
    setStatus("done");
    playSfx(sc >= 60 ? "correct" : "wrong");
    onChange("done");
  }

  useEffect(() => {
    (Voice as any).onSpeechResults = (e: { value?: string[] }) => {
      // iOS reports the growing full transcript here; just remember it.
      if (e.value?.[0]) transcript.current = e.value[0];
    };
    (Voice as any).onSpeechError = () => {
      if (!scored.current) {
        setStatus("idle");
        setError("Didn't catch that — try again, or skip.");
      }
    };
    // Recognition stopped (user tapped done, or a natural pause) -> score now.
    (Voice as any).onSpeechEnd = () => finalize();
    return () => {
      Voice.destroy()
        .then(() => Voice.removeAllListeners())
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise]);

  async function start() {
    setError(null);
    setHeard(null);
    setScore(null);
    transcript.current = "";
    scored.current = false;
    try {
      setStatus("listening");
      await Voice.start(getSpeechLocale());
    } catch {
      setStatus("idle");
      setError("Speech recognition isn't available here — tap Skip to continue.");
    }
  }
  async function stop() {
    // Stop and let onSpeechEnd finalize; also finalize as a fallback.
    try {
      await Voice.stop();
    } catch {
      // no-op
    }
    setTimeout(finalize, 700);
  }

  const tip =
    score == null
      ? null
      : score >= 85
        ? "Excellent pronunciation! 🎉"
        : score >= 60
          ? "Good — almost there. Listen again and refine it."
          : "Keep practicing — tap the speaker and copy it closely.";
  const scoreColor =
    score == null
      ? theme.colors.text
      : score >= 85
        ? theme.colors.success
        : score >= 60
          ? theme.colors.gold
          : theme.colors.danger;

  return (
    <View style={styles.body}>
      <Instruction text={exercise.prompt} />
      <View style={styles.questionRow}>
        <View style={{ flex: 1 }}>
          <GlossedText text={exercise.text} />
        </View>
        <Speaker text={exercise.text} />
      </View>
      {exercise.pinyin ? <Text style={styles.pinyin}>{exercise.pinyin}</Text> : null}
      {exercise.translation ? (
        <Text style={styles.translation}>{exercise.translation}</Text>
      ) : null}

      <View style={styles.micWrap}>
        <Pressable
          onPress={status === "listening" ? stop : start}
          style={[styles.mic, status === "listening" && { backgroundColor: theme.colors.danger }]}
        >
          {status === "listening" ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={{ fontSize: 36 }}>🎤</Text>
          )}
        </Pressable>
        <Text style={styles.micLabel}>
          {status === "listening"
            ? "Listening… say the whole sentence, then tap ✓"
            : status === "done"
              ? "Tap to try again"
              : "Tap, then say the whole sentence"}
        </Text>
      </View>

      {score != null ? (
        <View style={styles.result}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{score}%</Text>
          <Text style={styles.tip}>{tip}</Text>
          {heard ? <Text style={styles.heard}>Heard: “{heard}”</Text> : null}
        </View>
      ) : null}

      {error ? <Text style={styles.correctHint}>{error}</Text> : null}

      {onSwap ? (
        <Pressable
          onPress={() =>
            onSwap({
              type: "type",
              prompt: "Type the translation",
              question: exercise.translation ?? exercise.text,
              answer: exercise.text,
              pinyin: exercise.pinyin,
              speak: exercise.text,
            })
          }
          style={styles.skip}
        >
          <Text style={styles.swapLink}>Can't speak right now? Type it instead →</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => onChange("done")} style={styles.skip}>
          <Text style={styles.skipText}>Skip this one</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: theme.spacing(2), paddingTop: theme.spacing(2) },
  instruction: { color: theme.colors.text, fontSize: 22, fontWeight: "800", marginBottom: theme.spacing(2) },
  glossRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", columnGap: 8, rowGap: 4 },
  glossable: {
    borderBottomWidth: 1,
    borderStyle: "dotted",
    borderBottomColor: theme.colors.textMuted,
  },
  hintBar: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  hintText: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
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
  optionSub: { color: theme.colors.textMuted, fontSize: 14, marginTop: 4 },
  subtext: { color: theme.colors.accent, fontSize: 18, marginTop: 6 },
  pinyin: { color: theme.colors.accent, fontSize: 16, marginTop: 6 },
  matchSub: { color: theme.colors.textMuted, fontSize: 13, marginTop: 3 },
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
  typeInput: {
    marginTop: theme.spacing(3),
    minHeight: 96,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlignVertical: "top",
  },
  accentBar: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  accentKey: {
    minWidth: 40,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
  },
  accentKeyText: { color: theme.colors.text, fontSize: 18, fontWeight: "700" },
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
  micWrap: { alignItems: "center", marginTop: theme.spacing(4), gap: 12 },
  mic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  micLabel: { color: theme.colors.textMuted, fontWeight: "700" },
  result: { alignItems: "center", marginTop: theme.spacing(3), gap: 6 },
  scoreText: { fontSize: 40, fontWeight: "900" },
  tip: { color: theme.colors.text, fontSize: 16, textAlign: "center" },
  heard: { color: theme.colors.textMuted, fontStyle: "italic", marginTop: 4 },
  skip: { alignSelf: "center", marginTop: theme.spacing(3), padding: 8 },
  skipText: { color: theme.colors.textMuted, fontWeight: "700" },
  swapLink: { color: theme.colors.primary, fontWeight: "800", fontSize: 15 },
  newWord: { color: theme.colors.accent, fontWeight: "900", letterSpacing: 2, fontSize: 13 },
  cardArt: {
    marginTop: theme.spacing(2),
    width: 160,
    height: 160,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLetter: { fontSize: 80, fontWeight: "900", color: theme.colors.primary },
  cardWord: { color: theme.colors.text, fontSize: 34, fontWeight: "900" },
  cardMeaning: { color: theme.colors.textMuted, fontSize: 18, marginTop: 6 },
});
