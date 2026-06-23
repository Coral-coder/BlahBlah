import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Mascot } from "@/components/Mascot";
import { ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { flattenCourse, type PathNode } from "@/curriculum/types";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function PathScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, courseProgress, currentStreak, xpToday } = useProgress();

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const cp = course ? courseProgress(course.code) : undefined;

  const nodes = useMemo(() => (course ? flattenCourse(course) : []), [course]);
  const completed = cp?.completed ?? {};
  const currentIndex = useMemo(() => {
    const idx = nodes.findIndex((n) => !completed[n.lesson.id]);
    return idx === -1 ? nodes.length : idx;
  }, [nodes, completed]);

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

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
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

        {!cp?.placed ? (
          <Pressable style={styles.placementBanner} onPress={() => nav.navigate("placement", { courseCode: course.code })}>
            <Text style={styles.placementTitle}>📊  Already know some {course.name}?</Text>
            <Text style={styles.placementSub}>Take a 2-minute placement test to skip ahead →</Text>
          </Pressable>
        ) : null}

        {units.map(({ section, unit }, ui) => {
          const unitNodes = nodes.filter((n) => n.unit.id === unit.id);
          const isFirstOfSection = section.units[0].id === unit.id;
          return (
            <View key={unit.id}>
              {isFirstOfSection ? (
                <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
              ) : null}
              <View style={[styles.unitHeader, { backgroundColor: unit.color }]}>
                <Text style={styles.unitIcon}>{unit.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unitTitle}>
                    {unit.title} · {unit.cefr}
                  </Text>
                  <Text style={styles.unitSubtitle}>{unit.subtitle}</Text>
                </View>
              </View>

              <View style={styles.nodes}>
                {unitNodes.map((node) => (
                  <LessonNode
                    key={node.lesson.id}
                    node={node}
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
              {ui === units.length - 1 && currentIndex >= nodes.length ? (
                <Text style={styles.doneAll}>🏆 You finished every lesson here!</Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function LessonNode({
  node,
  state,
  onPress,
}: {
  node: PathNode;
  state: "done" | "current" | "available" | "locked";
  onPress: () => void;
}) {
  // zigzag offset
  const offset = [-70, 0, 70, 0][node.indexInUnit % 4];
  const locked = state === "locked";
  const color = node.unit.color;
  const bg =
    state === "done"
      ? theme.colors.gold
      : state === "locked"
        ? theme.colors.locked
        : color;
  return (
    <View style={[styles.nodeRow, { transform: [{ translateX: offset }] }]}>
      {state === "current" ? <View style={styles.startBubble}><Text style={styles.startText}>START</Text></View> : null}
      <Pressable
        disabled={locked}
        onPress={onPress}
        style={[
          styles.node,
          { backgroundColor: bg, opacity: locked ? 0.6 : 1 },
          state === "current" && styles.nodeCurrent,
        ]}
      >
        <Text style={styles.nodeIcon}>
          {state === "done" ? "✓" : state === "locked" ? "🔒" : "★"}
        </Text>
      </Pressable>
      <Text style={styles.nodeLabel} numberOfLines={1}>
        {node.lesson.title}
      </Text>
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
  nodeIcon: { fontSize: 30, color: "#fff", fontWeight: "900" },
  nodeLabel: { color: theme.colors.textMuted, marginTop: 6, fontSize: 12, maxWidth: 120 },
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
