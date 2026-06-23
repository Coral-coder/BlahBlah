import { useMemo, useReducer, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Button } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

interface Glyph {
  char: string;
  hint?: string;
}

export function TraceScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, learnedWords, traceCount, recordTrace } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  // Build the practice set. For Chinese, practice individual characters; for
  // other scripts, whole words. Prefer words the learner has seen.
  const glyphs = useMemo<Glyph[]>(() => {
    if (!course) return [];
    const learned = learnedWords(course.code);
    const source =
      learned.length > 0
        ? learned
        : (course.sections[0]?.units[0]?.vocab ?? []);
    const out: Glyph[] = [];
    const seen = new Set<string>();
    for (const w of source) {
      if (course.code === "zh") {
        for (const ch of Array.from(w.target)) {
          if (!seen.has(ch)) {
            seen.add(ch);
            out.push({ char: ch, hint: w.en });
          }
        }
      } else if (!seen.has(w.target)) {
        seen.add(w.target);
        out.push({ char: w.target, hint: w.pinyin ?? w.en });
      }
    }
    return out;
  }, [course, learnedWords]);

  const [idx, setIdx] = useState(0);
  // null = follow auto-fade (guide shows while the character is new, then hides
  // on recaps); true/false = user override for the current glyph.
  const [overrideGuide, setOverrideGuide] = useState<boolean | null>(null);
  const [size, setSize] = useState(0);
  const strokes = useRef<string[]>([]);
  const cur = useRef<string>("");
  const [, force] = useReducer((x) => x + 1, 0);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        cur.current = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        force();
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        cur.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        force();
      },
      onPanResponderRelease: () => {
        if (cur.current) strokes.current.push(cur.current);
        cur.current = "";
        force();
      },
    }),
  ).current;

  function reset() {
    strokes.current = [];
    cur.current = "";
    force();
  }
  function go(delta: number) {
    if (!glyphs.length) return;
    // Count the rep just practiced so the guide fades over time.
    if (course) recordTrace(course.code, glyphs[idx].char);
    setIdx((i) => (i + delta + glyphs.length) % glyphs.length);
    setOverrideGuide(null);
    reset();
  }

  if (!course || glyphs.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text, textAlign: "center", paddingHorizontal: 24 }}>
          Learn some words first, then come back to practice writing them.
        </Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const glyph = glyphs[idx];
  const level = traceCount(course.code, glyph.char);
  const autoShow = level < 3; // show the guide for the first few reps, then hide
  const showGuide = overrideGuide ?? autoShow;
  const guideOpacity = level <= 0 ? 0.55 : level === 1 ? 0.42 : level === 2 ? 0.3 : 0.22;
  const allStrokes = cur.current ? [...strokes.current, cur.current] : strokes.current;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Practice writing</Text>
          <Text style={styles.subtitle}>
            {idx + 1} / {glyphs.length} · {glyph.hint ?? ""}
            {level >= 3 ? " · recap" : level > 0 ? " · guide fading" : ""}
          </Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      <View style={styles.canvasArea}>
        <View
          style={styles.canvas}
          onLayout={(e: LayoutChangeEvent) => setSize(e.nativeEvent.layout.width)}
          {...pan.panHandlers}
        >
          {showGuide ? (
            <Text style={[styles.guide, { fontSize: size * 0.72, lineHeight: size, opacity: guideOpacity }]}>
              {glyph.char}
            </Text>
          ) : null}
          {size > 0 ? (
            <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
              {allStrokes.map((d, i) => (
                <Path
                  key={i}
                  d={d}
                  stroke={theme.colors.primary}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
            </Svg>
          ) : null}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={() => speak(glyph.char)} style={styles.ctrl}>
          <Text style={styles.ctrlText}>🔊 Hear</Text>
        </Pressable>
        <Pressable onPress={() => setOverrideGuide(!showGuide)} style={styles.ctrl}>
          <Text style={styles.ctrlText}>{showGuide ? "🙈 Hide guide" : "👁 Show guide"}</Text>
        </Pressable>
        <Pressable onPress={reset} style={styles.ctrl}>
          <Text style={styles.ctrlText}>↺ Clear</Text>
        </Pressable>
      </View>

      <View style={[styles.nav, { paddingBottom: insets.bottom + 14 }]}>
        <Button label="◀ Prev" variant="ghost" style={{ flex: 1 }} onPress={() => go(-1)} />
        <Button label="Next ▶" style={{ flex: 1 }} onPress={() => go(1)} />
      </View>
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
    paddingBottom: 8,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  canvasArea: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(2) },
  canvas: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 380,
    maxHeight: 380,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  guide: {
    color: theme.colors.locked,
    fontWeight: "400",
    textAlign: "center",
    position: "absolute",
    width: "100%",
  },
  controls: { flexDirection: "row", justifyContent: "center", gap: 10, paddingHorizontal: theme.spacing(2) },
  ctrl: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ctrlText: { color: theme.colors.text, fontWeight: "700" },
  nav: { flexDirection: "row", gap: 12, padding: theme.spacing(2) },
});
