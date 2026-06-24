import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Confetti } from "@/components/Confetti";
import { Mascot } from "@/components/Mascot";
import { ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { dueWords } from "@/lib/srs";
import { speak } from "@/lib/speech";
import { neuralAvailable } from "@/lib/neuralTts";
import { installedModelForLocale, scanInstalled } from "@/lib/voiceModels";
import { flattenCourse, type PathNode } from "@/curriculum/types";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function PathScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, courseProgress, currentStreak, xpToday, isCompleted, crownLevel, totalCrowns, setSettings, markGoalCelebrated } =
    useProgress();
  const [voiceScanned, setVoiceScanned] = useState(false);
  useEffect(() => {
    scanInstalled().then(() => setVoiceScanned(true));
  }, []);

  // Celebrate the first time the daily goal is reached each day.
  const [celebrate, setCelebrate] = useState(false);
  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  })();
  const goalMet = state.dailyGoal > 0 && xpToday >= state.dailyGoal;
  useEffect(() => {
    if (goalMet && state.goalCelebratedDay !== todayKey) {
      setCelebrate(true);
      markGoalCelebrated();
      const t = setTimeout(() => setCelebrate(false), 4000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet, state.goalCelebratedDay]);

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const cp = course ? courseProgress(course.code) : undefined;

  const nodes = useMemo(() => (course ? flattenCourse(course) : []), [course]);
  const completed = cp?.completed ?? {};
  const currentIndex = useMemo(() => {
    const idx = nodes.findIndex((n) => !completed[n.lesson.id]);
    return idx === -1 ? nodes.length : idx;
  }, [nodes, completed]);

  const dueCount = useMemo(
    () => (course ? dueWords(course, isCompleted, state.wordStats[course.code] ?? {}).length : 0),
    [course, isCompleted, state.wordStats],
  );

  const scrollRef = useRef<ScrollView>(null);
  const unitYRef = useRef<Record<string, number>>({});
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});

  // Keep the current (next-incomplete) lesson parked in ~second place so it's
  // visible without scrolling — re-runs whenever you advance a lesson.
  const HEADER_BLOCK = 96; // section/unit header + top padding (approx)
  const ROW_STRIDE = 112; // height of one lesson node row (approx)
  const currentUnitId = nodes[Math.min(currentIndex, nodes.length - 1)]?.unit.id;
  useEffect(() => {
    if (!currentUnitId) return;
    const firstIdx = nodes.findIndex((n) => n.unit.id === currentUnitId);
    const pos = Math.max(0, currentIndex - firstIdx);
    let tries = 0;
    const id = setInterval(() => {
      const uy = unitYRef.current[currentUnitId];
      if (uy != null) {
        const y = Math.max(0, uy + HEADER_BLOCK + pos * ROW_STRIDE - ROW_STRIDE - 12);
        scrollRef.current?.scrollTo({ y, animated: true });
        clearInterval(id);
      } else if (++tries > 12) {
        clearInterval(id);
      }
    }, 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentUnitId, course]);

  if (!course) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 60, alignItems: "center" }]}>
        <Text style={{ color: theme.colors.text }}>No course selected.</Text>
        <Pressable onPress={() => nav.navigate("courseSelect")} style={{ marginTop: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>Pick a language</Text>
        </Pressable>
      </View>
    );
  }

  const goalPct = state.dailyGoal > 0 ? xpToday / state.dailyGoal : 0;
  const isUnitComplete = (unitId: string) =>
    nodes.filter((n) => n.unit.id === unitId).every((n) => completed[n.lesson.id]);

  // Group consecutive nodes by unit for rendering headers.
  const units = course.sections.flatMap((s) => s.units.map((u) => ({ section: s, unit: u })));

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => nav.navigate("courseSelect")} style={styles.flagBtn}>
          <Text style={{ fontSize: 26 }}>{course.flag}</Text>
        </Pressable>
        <View style={styles.headerStat}>
          <Text style={styles.headerStatText}>🔥 {currentStreak}</Text>
        </View>
        <View style={styles.headerStat}>
          <Text style={[styles.headerStatText, { color: theme.colors.gold }]}>
            ⭐ {state.xp}
          </Text>
        </View>
        <View style={styles.headerStat}>
          <Text style={[styles.headerStatText, { color: theme.colors.accent }]}>
            💎 {state.gems}
          </Text>
        </View>
        {state.streakFreezes > 0 ? (
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatText, { color: "#7FD3FF" }]}>
              🧊 {state.streakFreezes}
            </Text>
          </View>
        ) : null}
        {totalCrowns(course.code) > 0 ? (
          <View style={styles.headerStat}>
            <Text style={[styles.headerStatText, { color: theme.colors.gold }]}>
              👑 {totalCrowns(course.code)}
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => nav.navigate("settings")} hitSlop={10}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* daily goal */}
      <View style={styles.goal}>
        <Text style={styles.goalLabel}>
          Daily goal · {Math.min(xpToday, state.dailyGoal)}/{state.dailyGoal} XP
        </Text>
        <ProgressBar progress={goalPct} color={theme.colors.gold} height={10} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={styles.greeting}>
          <Mascot size={52} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              {xpToday >= state.dailyGoal && state.dailyGoal > 0
                ? "Goal smashed today! 🎉"
                : currentStreak > 0
                  ? `Keep your ${currentStreak}-day streak alive!`
                  : "Ready to learn? Let's go!"}
            </Text>
          </View>
        </View>

        <WordOfDay course={course} />

        {neuralAvailable() &&
        voiceScanned &&
        !installedModelForLocale(course.speechLocale) &&
        !state.settings.voicePromptDismissed ? (
          <Pressable style={styles.voiceBanner} onPress={() => nav.navigate("settings")}>
            <View style={{ flex: 1 }}>
              <Text style={styles.voiceTitle}>🎧 Get a natural voice for {course.name}</Text>
              <Text style={styles.voiceSub}>
                Pronunciation is key — download a free, human-sounding voice →
              </Text>
            </View>
            <Pressable hitSlop={12} onPress={() => setSettings({ voicePromptDismissed: true })}>
              <Text style={styles.voiceDismiss}>✕</Text>
            </Pressable>
          </Pressable>
        ) : null}

        {dueCount > 0 ? (
          <Pressable style={styles.dueBanner} onPress={() => nav.navigate("review")}>
            <Text style={styles.dueTitle}>🧠  {dueCount} word{dueCount === 1 ? "" : "s"} due for review</Text>
            <Text style={styles.dueSub}>Spaced repetition keeps them in long-term memory →</Text>
          </Pressable>
        ) : null}

        {!cp?.placed ? (
          <Pressable style={styles.placementBanner} onPress={() => nav.navigate("placement", { courseCode: course.code })}>
            <Text style={styles.placementTitle}>📊  Already know some {course.name}?</Text>
            <Text style={styles.placementSub}>Take a 2-minute placement test to skip ahead →</Text>
          </Pressable>
        ) : null}

        {units.map(({ section, unit }, ui) => {
          const unitNodes = nodes.filter((n) => n.unit.id === unit.id);
          const isFirstOfSection = section.units[0].id === unit.id;
          const complete = isUnitComplete(unit.id);
          const open = openUnits[unit.id] ?? !complete; // completed units collapse
          const doneCount = unitNodes.filter((n) => completed[n.lesson.id]).length;
          return (
            <View
              key={unit.id}
              onLayout={(e: LayoutChangeEvent) => {
                // Record each unit's position so the scroll effect can park the
                // current lesson in second place.
                unitYRef.current[unit.id] = e.nativeEvent.layout.y;
              }}
            >
              {isFirstOfSection ? (
                <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              ) : null}
              <Pressable
                onPress={() => setOpenUnits((o) => ({ ...o, [unit.id]: !open }))}
                style={[styles.unitHeader, { backgroundColor: unit.color }]}
              >
                <Text style={styles.unitIcon}>{complete ? "✅" : unit.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unitTitle}>
                    {unit.title} · {unit.cefr}
                  </Text>
                  <Text style={styles.unitSubtitle}>
                    {complete ? `Complete · tap to ${open ? "hide" : "review"}` : `${doneCount}/${unitNodes.length} lessons`}
                  </Text>
                </View>
                <Text style={styles.chevron}>{open ? "▾" : "▸"}</Text>
              </Pressable>

              {open ? (
                <View style={styles.nodes}>
                  {unitNodes.map((node) => (
                    <LessonNode
                      key={node.lesson.id}
                      node={node}
                      crowns={crownLevel(course.code, node.lesson.id)}
                      state={
                        completed[node.lesson.id]
                          ? "done"
                          : node.index === currentIndex
                            ? "current"
                            : node.index < currentIndex
                              ? "available"
                              : "locked"
                      }
                      onPress={() =>
                        nav.navigate("lesson", { courseCode: course.code, lessonId: node.lesson.id })
                      }
                    />
                  ))}
                </View>
              ) : null}
              {ui === units.length - 1 && currentIndex >= nodes.length ? (
                <Text style={styles.doneAll}>🏆 You finished every lesson here!</Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      {celebrate ? (
        <View style={styles.goalCelebrate} pointerEvents="none">
          <Confetti count={50} />
          <View style={styles.goalToast}>
            <Text style={styles.goalToastText}>🎉 Daily goal reached!</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function WordOfDay({ course }: { course: ReturnType<typeof getCourse> }) {
  const vocab = useMemo(() => {
    if (!course) return [];
    const out: { target: string; en: string; pinyin?: string }[] = [];
    for (const s of course.sections) for (const u of s.units) for (const v of u.vocab ?? []) out.push(v);
    return out;
  }, [course]);
  if (!course || vocab.length === 0) return null;
  const now = new Date();
  const dayNum = Math.floor(now.getTime() / 86400000);
  const word = vocab[dayNum % vocab.length];
  return (
    <Pressable style={styles.wotd} onPress={() => speak(word.target, course.speechLocale)}>
      <Text style={styles.wotdLabel}>WORD OF THE DAY</Text>
      <View style={styles.wotdRow}>
        <Text style={styles.wotdTarget}>{word.target}</Text>
        <Text style={{ fontSize: 22 }}>🔊</Text>
      </View>
      {word.pinyin ? <Text style={styles.wotdPinyin}>{word.pinyin}</Text> : null}
      <Text style={styles.wotdEn}>{word.en}</Text>
    </Pressable>
  );
}

function LessonNode({
  node,
  state,
  crowns,
  onPress,
}: {
  node: PathNode;
  state: "done" | "current" | "available" | "locked";
  crowns: number;
  onPress: () => void;
}) {
  // zigzag offset
  const offset = [-70, 0, 70, 0][node.indexInUnit % 4];
  const locked = state === "locked";
  const isCurrent = state === "current";
  const color = node.unit.color;
  const bg =
    state === "done"
      ? theme.colors.gold
      : state === "locked"
        ? theme.colors.locked
        : color;

  // Gentle breathing pulse on the lesson you're up to, so the eye lands on it.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isCurrent) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <View style={[styles.nodeRow, { transform: [{ translateX: offset }] }]}>
      {isCurrent ? <View style={styles.startBubble}><Text style={styles.startText}>START</Text></View> : null}
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {isCurrent ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pulseRing,
              { backgroundColor: bg, opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]}
          />
        ) : null}
        <Animated.View style={isCurrent ? { transform: [{ scale }] } : undefined}>
          <Pressable
            disabled={locked}
            onPress={onPress}
            style={({ pressed }) => [
              styles.node,
              { backgroundColor: bg, opacity: locked ? 0.6 : 1 },
              isCurrent && styles.nodeCurrent,
              pressed && !locked && { transform: [{ translateY: 3 }, { scale: 0.94 }] },
            ]}
          >
            <Text style={styles.nodeIcon}>
              {state === "done" ? "✓" : state === "locked" ? "🔒" : "★"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
      <Text style={styles.nodeLabel} numberOfLines={1}>
        {node.lesson.title}
      </Text>
      {state === "done" && crowns > 0 ? (
        <View style={styles.crownRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={[styles.crownPip, { opacity: i < crowns ? 1 : 0.18 }]}>
              👑
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.spacing(2),
    paddingBottom: 10,
  },
  flagBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerStat: {},
  headerStatText: { color: theme.colors.text, fontWeight: "800", fontSize: 16 },
  goal: { paddingHorizontal: theme.spacing(2), paddingBottom: 12, gap: 6 },
  goalLabel: { color: theme.colors.textMuted, fontWeight: "700", fontSize: 13 },
  greeting: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  bubble: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(1.5),
  },
  bubbleText: { color: theme.colors.text, fontWeight: "700" },
  placementBanner: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  placementTitle: { color: theme.colors.text, fontWeight: "800", fontSize: 16 },
  placementSub: { color: theme.colors.textMuted, marginTop: 4 },
  dueBanner: {
    margin: theme.spacing(2),
    marginBottom: 0,
    padding: theme.spacing(2),
    borderRadius: theme.radius.lg,
    backgroundColor: "#2A2418",
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  wotd: {
    margin: theme.spacing(2),
    marginBottom: 0,
    padding: theme.spacing(2),
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  goalCelebrate: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  goalToast: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    ...theme.shadow,
  },
  goalToastText: { color: theme.colors.bg, fontWeight: "900", fontSize: 18 },
  voiceBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: theme.spacing(2),
    marginBottom: 0,
    padding: theme.spacing(2),
    borderRadius: theme.radius.lg,
    backgroundColor: "#172a2e",
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  voiceTitle: { color: theme.colors.accent, fontWeight: "800", fontSize: 15 },
  voiceSub: { color: theme.colors.textMuted, marginTop: 3 },
  voiceDismiss: { color: theme.colors.textMuted, fontSize: 18, fontWeight: "800" },
  wotdLabel: { color: theme.colors.accent, fontWeight: "900", letterSpacing: 1.5, fontSize: 11 },
  wotdRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  wotdTarget: { color: theme.colors.text, fontWeight: "900", fontSize: 26 },
  wotdPinyin: { color: theme.colors.accent, marginTop: 2, fontSize: 15 },
  wotdEn: { color: theme.colors.textMuted, marginTop: 4, fontSize: 15 },
  dueTitle: { color: theme.colors.gold, fontWeight: "800", fontSize: 16 },
  dueSub: { color: theme.colors.textMuted, marginTop: 4 },
  sectionTitle: {
    color: theme.colors.textMuted,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    paddingHorizontal: theme.spacing(2),
  },
  unitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: theme.spacing(2),
    marginTop: theme.spacing(1),
    padding: theme.spacing(2),
    borderRadius: theme.radius.lg,
  },
  unitIcon: { fontSize: 30 },
  chevron: { color: "#fff", fontSize: 20, fontWeight: "900", marginLeft: 8 },
  unitTitle: { color: "#fff", fontWeight: "900", fontSize: 17 },
  unitSubtitle: { color: "rgba(255,255,255,0.85)", marginTop: 2 },
  nodes: { alignItems: "center", paddingVertical: theme.spacing(2), gap: theme.spacing(2) },
  nodeRow: { alignItems: "center" },
  node: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(0,0,0,0.25)",
  },
  nodeCurrent: { borderColor: "#fff" },
  pulseRing: { position: "absolute", width: 74, height: 74, borderRadius: 37 },
  nodeIcon: { fontSize: 30, color: "#fff", fontWeight: "900" },
  nodeLabel: { color: theme.colors.textMuted, marginTop: 6, fontSize: 12, maxWidth: 120 },
  crownRow: { flexDirection: "row", gap: 1, marginTop: 3 },
  crownPip: { fontSize: 10 },
  startBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 6,
  },
  startText: { color: theme.colors.bg, fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  doneAll: { color: theme.colors.gold, textAlign: "center", fontWeight: "800", marginTop: theme.spacing(3) },
});
