import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { learnedWordsFor } from "@/lib/learned";
import { shuffle } from "@/lesson/engine";
import { playSfx } from "@/lib/sfx";
import { speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const ROUND = 4;
const SECONDS = 45;

interface W {
  target: string;
  en: string;
}

export function GameScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, isCompleted } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  const pool = useMemo<W[]>(() => {
    if (!course) return [];
    const learned = learnedWordsFor(course, isCompleted);
    if (learned.length >= ROUND * 2) return learned.map((w) => ({ target: w.target, en: w.en }));
    const all: W[] = [];
    for (const s of course.sections) for (const u of s.units) for (const v of u.vocab ?? []) all.push({ target: v.target, en: v.en });
    return all;
  }, [course, isCompleted]);

  const [round, setRound] = useState<W[]>([]);
  const [leftOrder, setLeftOrder] = useState<number[]>([]);
  const [rightOrder, setRightOrder] = useState<number[]>([]);
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [over, setOver] = useState(false);

  function deal() {
    const picks = shuffle(pool).slice(0, ROUND);
    setRound(picks);
    setLeftOrder(shuffle(picks.map((_, i) => i)));
    setRightOrder(shuffle(picks.map((_, i) => i)));
    setSelL(null);
    setSelR(null);
    setDone([]);
  }

  useEffect(() => {
    if (pool.length >= ROUND) deal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useEffect(() => {
    if (over || pool.length < ROUND) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [over, pool.length]);

  function tryMatch(l: number | null, r: number | null) {
    if (l == null || r == null) return;
    if (l === r) {
      const next = [...done, l];
      setDone(next);
      setSelL(null);
      setSelR(null);
      setScore((s) => s + 1);
      playSfx("correct");
      if (next.length === round.length) setTimeout(deal, 250);
    } else {
      playSfx("wrong");
      setWrong(Date.now());
      setTimeout(() => {
        setSelL(null);
        setSelR(null);
        setWrong(null);
      }, 350);
    }
  }

  function restart() {
    setScore(0);
    setTimeLeft(SECONDS);
    setOver(false);
    deal();
  }

  if (!course || pool.length < ROUND) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text, textAlign: "center", paddingHorizontal: 24 }}>
          Learn a few more words first, then come back for Match Blitz!
        </Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.score}>⚡ {score}</Text>
        <Text style={styles.timer}>{timeLeft}s</Text>
      </View>
      <View style={{ paddingHorizontal: theme.spacing(2) }}>
        <ProgressBar progress={timeLeft / SECONDS} color={timeLeft <= 10 ? theme.colors.danger : theme.colors.gold} />
      </View>

      <View style={styles.board}>
        <View style={styles.col}>
          {leftOrder.map((k) => {
            const w = round[k];
            const isDone = done.includes(k);
            const sel = selL === k;
            return (
              <Pressable
                key={`l${k}`}
                disabled={isDone}
                onPress={() => {
                  speak(w.target);
                  if (selL === k) return setSelL(null);
                  setSelL(k);
                  tryMatch(k, selR);
                }}
                style={[
                  styles.cell,
                  sel && styles.cellSel,
                  Boolean(wrong) && sel && styles.cellWrong,
                  isDone && styles.cellDone,
                ]}
              >
                <Text style={styles.cellText}>{w?.target}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.col}>
          {rightOrder.map((k) => {
            const w = round[k];
            const isDone = done.includes(k);
            const sel = selR === k;
            return (
              <Pressable
                key={`r${k}`}
                disabled={isDone}
                onPress={() => {
                  if (selR === k) return setSelR(null);
                  setSelR(k);
                  tryMatch(selL, k);
                }}
                style={[
                  styles.cell,
                  sel && styles.cellSel,
                  Boolean(wrong) && sel && styles.cellWrong,
                  isDone && styles.cellDone,
                ]}
              >
                <Text style={styles.cellText}>{w?.en}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {over ? (
        <View style={styles.overlay}>
          <Text style={styles.overEmoji}>⚡</Text>
          <Text style={styles.overTitle}>Time!</Text>
          <Text style={styles.overScore}>{score} matched</Text>
          <Button label="Play again" onPress={restart} style={{ marginTop: 20, alignSelf: "stretch" }} />
          <Button label="Done" variant="ghost" onPress={nav.goBack} style={{ marginTop: 10, alignSelf: "stretch" }} />
        </View>
      ) : null}
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
  close: { color: theme.colors.textMuted, fontSize: 24, fontWeight: "700" },
  score: { color: theme.colors.gold, fontSize: 20, fontWeight: "900" },
  timer: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  board: { flex: 1, flexDirection: "row", gap: 14, padding: theme.spacing(2) },
  col: { flex: 1, gap: 12 },
  cell: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cellSel: { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceAlt },
  cellWrong: { borderColor: theme.colors.danger },
  cellDone: { opacity: 0.2, borderColor: theme.colors.success },
  cellText: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,12,16,0.94)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(4),
  },
  overEmoji: { fontSize: 64 },
  overTitle: { color: theme.colors.text, fontSize: 30, fontWeight: "900", marginTop: 8 },
  overScore: { color: theme.colors.gold, fontSize: 22, fontWeight: "800", marginTop: 6 },
});
