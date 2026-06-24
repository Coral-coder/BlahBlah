import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Chip, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { flattenCourse } from "@/curriculum/types";
import { speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const GOALS = [10, 20, 30, 50];

// Colorful tile menu for the practice & play modes.
const PLAY_TILES: {
  label: string;
  emoji: string;
  color: string;
  route: string;
  params?: Record<string, unknown>;
}[] = [
  { label: "Review", emoji: "🧠", color: "#5B8DEF", route: "review" },
  { label: "Mistakes", emoji: "🎯", color: "#E5534B", route: "review", params: { mistakesOnly: true } },
  { label: "Dictation", emoji: "👂", color: "#3DDC97", route: "dictation" },
  { label: "Grammar", emoji: "💡", color: "#FFC800", route: "tips" },
  { label: "Stories", emoji: "📚", color: "#A36BFE", route: "stories" },
  { label: "Role-play", emoji: "🎭", color: "#FF7AC6", route: "stories", params: { mode: "roleplay" } },
  { label: "Watch", emoji: "🎬", color: "#FF9F1C", route: "watch" },
  { label: "News", emoji: "📰", color: "#4DB6AC", route: "news" },
  { label: "AI Story", emoji: "✨", color: "#7C4DFF", route: "aistory" },
  { label: "Words", emoji: "📖", color: "#58CC02", route: "words" },
  { label: "Flashcards", emoji: "🃏", color: "#EC407A", route: "flashcards" },
  { label: "Match Blitz", emoji: "⚡", color: "#FFB300", route: "game" },
  { label: "Writing", emoji: "✍️", color: "#26C6DA", route: "trace" },
];

function PlayTile({
  label,
  emoji,
  color,
  onPress,
}: {
  label: string;
  emoji: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { borderColor: color, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: color + "22" }]}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

export function ProfileScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const {
    state,
    currentStreak,
    xpToday,
    setDailyGoal,
    courseProgress,
    weeklyXp,
    todayQuests,
    claimQuest,
    buyStreakFreeze,
    wagerState,
    startWager,
    claimWager,
  } = useProgress();
  const wager = wagerState();
  const week = weeklyXp();
  const weekMax = Math.max(1, ...week.map((d) => d.xp));
  const weekTotal = week.reduce((s, d) => s + d.xp, 0);

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const totalLessons = course ? flattenCourse(course).length : 0;
  const doneLessons = course ? Object.keys(courseProgress(course.code).completed).length : 0;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: theme.spacing(2),
          gap: theme.spacing(2),
        }}
      >
        <Text style={styles.title}>Your progress</Text>

        <View style={styles.statRow}>
          <BigStat value={currentStreak} label="day streak" emoji="🔥" />
          <BigStat value={state.xp} label="total XP" emoji="⭐" />
        </View>

        <Button
          label="🏅  Achievements"
          variant="ghost"
          onPress={() => nav.navigate("achievements")}
        />
        <Button
          label="🏆  League"
          variant="ghost"
          onPress={() => nav.navigate("league")}
        />

        <Card>
          <Text style={styles.cardTitle}>This week</Text>
          <Text style={styles.cardSub}>{weekTotal} XP over the last 7 days</Text>
          <View style={styles.chart}>
            {week.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <Text style={styles.chartVal}>{d.xp || ""}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={{
                      height: `${Math.round((d.xp / weekMax) * 100)}%`,
                      backgroundColor: d.today ? theme.colors.gold : theme.colors.primary,
                      borderRadius: 6,
                      minHeight: d.xp > 0 ? 6 : 0,
                    }}
                  />
                </View>
                <Text style={[styles.chartLabel, d.today && { color: theme.colors.gold }]}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <PracticeCalendar history={state.xpHistory} />

        <Card>
          <View style={styles.questHead}>
            <Text style={styles.cardTitle}>Daily quests</Text>
            <Text style={styles.gemPill}>💎 {state.gems}</Text>
          </View>
          <Text style={styles.cardSub}>Fresh challenges every day — earn gems</Text>
          {todayQuests.items.map((q, i) => {
            const pct = q.goal ? q.progress / q.goal : 0;
            const ready = q.progress >= q.goal && !q.claimed;
            return (
              <View key={`${q.kind}-${i}`} style={styles.quest}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.questLabel}>
                    {q.claimed ? "✅ " : ""}
                    {q.label}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <ProgressBar
                      progress={pct}
                      height={10}
                      color={q.claimed ? theme.colors.success : theme.colors.accent}
                    />
                  </View>
                  <Text style={styles.questMeta}>
                    {Math.min(q.progress, q.goal)}/{q.goal} · 💎 {q.reward}
                  </Text>
                </View>
                {ready ? (
                  <Pressable style={styles.claim} onPress={() => claimQuest(i)}>
                    <Text style={styles.claimText}>Claim</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Power-ups</Text>
          <Text style={styles.cardSub}>
            🧊 Streak Freeze protects your streak if you miss a day
          </Text>
          <View style={styles.freezeRow}>
            <Text style={styles.freezeCount}>
              {"🧊".repeat(Math.max(1, state.streakFreezes))}{" "}
              <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>
                {state.streakFreezes}/{2} equipped
              </Text>
            </Text>
          </View>
          <Button
            label={
              state.streakFreezes >= 2
                ? "Freezes full"
                : state.gems < 50
                  ? `Need 💎 50 (you have ${state.gems})`
                  : "Buy a Streak Freeze · 💎 50"
            }
            onPress={() => buyStreakFreeze()}
            disabled={state.streakFreezes >= 2 || state.gems < 50}
            style={{ marginTop: theme.spacing(1.5) }}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>🎲 Double or Nothing</Text>
          {wager.kind === "none" ? (
            <>
              <Text style={styles.cardSub}>
                Wager 💎 50 that you'll practice every day for 7 days. Win 💎 100.
              </Text>
              <Button
                label={state.gems < 50 ? `Need 💎 50 (you have ${state.gems})` : "Start the wager · 💎 50"}
                onPress={() => startWager()}
                disabled={state.gems < 50}
                style={{ marginTop: theme.spacing(1.5) }}
              />
            </>
          ) : wager.kind === "active" ? (
            <>
              <Text style={styles.cardSub}>
                Day {wager.done}/{wager.target} ·{" "}
                {wager.todayDone ? "✓ done today — keep it up!" : "practice today to stay in!"}
              </Text>
              <View style={{ marginTop: 12 }}>
                <ProgressBar progress={wager.done / wager.target} color={theme.colors.gold} />
              </View>
            </>
          ) : wager.kind === "won" ? (
            <>
              <Text style={styles.cardSub}>🎉 You did it! Claim your 💎 {wager.reward}.</Text>
              <Button label={`Claim 💎 ${wager.reward}`} onPress={() => claimWager()} style={{ marginTop: theme.spacing(1.5) }} />
            </>
          ) : (
            <>
              <Text style={styles.cardSub}>💔 You missed a day — the wager is lost.</Text>
              <Button label="Clear" variant="ghost" onPress={() => claimWager()} style={{ marginTop: theme.spacing(1.5) }} />
            </>
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Daily goal</Text>
          <Text style={styles.cardSub}>
            {Math.min(xpToday, state.dailyGoal)} / {state.dailyGoal} XP today
          </Text>
          <View style={{ marginVertical: 12 }}>
            <ProgressBar
              progress={state.dailyGoal ? xpToday / state.dailyGoal : 0}
              color={theme.colors.gold}
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {GOALS.map((g) => (
              <Chip
                key={g}
                label={`${g} XP`}
                active={state.dailyGoal === g}
                onPress={() => setDailyGoal(g)}
              />
            ))}
          </View>
        </Card>

        {course ? (
          <Card>
            <Text style={styles.cardTitle}>
              {course.flag} {course.name}
            </Text>
            <Text style={styles.cardSub}>
              {doneLessons} of {totalLessons} lessons complete
            </Text>
            <View style={{ marginTop: 12 }}>
              <ProgressBar progress={totalLessons ? doneLessons / totalLessons : 0} />
            </View>
            <Button
              label="Switch language"
              variant="ghost"
              onPress={() => nav.navigate("courseSelect")}
              style={{ marginTop: theme.spacing(2) }}
            />
          </Card>
        ) : null}

        {course ? (
          <TrickyWords
            stats={state.wordStats[course.code] ?? {}}
            vocab={state.learnedVocab[course.code] ?? {}}
            locale={course.speechLocale}
          />
        ) : null}

        <Text style={[styles.cardTitle, { marginTop: theme.spacing(1) }]}>Practice & play</Text>
        <View style={styles.tileGrid}>
          {PLAY_TILES.map((t) => (
            <PlayTile key={t.label} {...t} onPress={() => nav.navigate(t.route as any, t.params)} />
          ))}
        </View>

        <Button
          label="📣  Share my progress"
          variant="ghost"
          onPress={() => {
            const streakBit = currentStreak > 0 ? `on a ${currentStreak}-day streak 🔥 ` : "";
            const langBit = course ? ` learning ${course.name} ${course.flag}` : "";
            Share.share({
              message: `I'm ${streakBit}with ${state.xp} XP${langBit} on BlahBlah — better than Duolingo! 🗣️`,
            }).catch(() => {});
          }}
        />

        <Button label="Settings" variant="ghost" onPress={() => nav.navigate("settings")} />
      </ScrollView>
    </View>
  );
}

// Your lowest-accuracy words, surfaced from the recall stats already tracked.
function TrickyWords({
  stats,
  vocab,
  locale,
}: {
  stats: Record<string, { c: number; w: number; t: number }>;
  vocab: Record<string, { target: string; en: string; pinyin?: string }>;
  locale?: string;
}) {
  const tricky = Object.entries(stats)
    .map(([target, s]) => ({ target, w: s.w, total: s.c + s.w, acc: s.c + s.w ? s.c / (s.c + s.w) : 1 }))
    .filter((x) => x.w > 0)
    .sort((a, b) => a.acc - b.acc || b.w - a.w)
    .slice(0, 5);
  if (tricky.length === 0) return null;
  return (
    <Card>
      <Text style={styles.cardTitle}>Tricky words</Text>
      <Text style={styles.cardSub}>The words you miss most — tap to hear them</Text>
      <View style={{ marginTop: theme.spacing(1.5), gap: 10 }}>
        {tricky.map((t) => (
          <Pressable key={t.target} style={styles.trickyRow} onPress={() => speak(t.target, locale)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trickyTarget}>{t.target}</Text>
              {vocab[t.target]?.en ? <Text style={styles.trickyEn}>{vocab[t.target].en}</Text> : null}
            </View>
            <Text style={styles.trickyAcc}>{Math.round(t.acc * 100)}%</Text>
            <Text style={{ fontSize: 18 }}>🔊</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// 5-week heatmap of practice days, built from the persisted XP history.
function PracticeCalendar({ history }: { history: Record<string, number> }) {
  const WEEKS = 5;
  const today = new Date();
  // Build columns (weeks) of 7 days, ending with today in the last column.
  const cells: { key: string; xp: number; today: boolean }[] = [];
  const total = WEEKS * 7;
  let active = 0;
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const xp = history[key] ?? 0;
    if (xp > 0) active++;
    cells.push({ key, xp, today: i === 0 });
  }
  const shade = (xp: number) => {
    if (xp <= 0) return theme.colors.surfaceAlt;
    if (xp < 15) return "#1E4620";
    if (xp < 30) return "#2E7D32";
    if (xp < 60) return "#43A047";
    return theme.colors.success;
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Practice calendar</Text>
      <Text style={styles.cardSub}>{active} active day{active === 1 ? "" : "s"} in the last 5 weeks</Text>
      <View style={styles.calGrid}>
        {cells.map((c) => (
          <View
            key={c.key}
            style={[
              styles.calCell,
              { backgroundColor: shade(c.xp) },
              c.today && { borderColor: theme.colors.gold, borderWidth: 2 },
            ]}
          />
        ))}
      </View>
      <View style={styles.calLegend}>
        <Text style={styles.calLegendText}>Less</Text>
        {[theme.colors.surfaceAlt, "#1E4620", "#2E7D32", "#43A047", theme.colors.success].map((c, i) => (
          <View key={i} style={[styles.calCell, { backgroundColor: c, margin: 0 }]} />
        ))}
        <Text style={styles.calLegendText}>More</Text>
      </View>
    </Card>
  );
}

function BigStat({ value, label, emoji }: { value: number; label: string; emoji: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(Math.round(v)));
    Animated.timing(anim, {
      toValue: value,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, anim]);
  return (
    <View style={styles.bigStat}>
      <Text style={styles.bigStatValue}>
        {emoji} {shown}
      </Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: "900" },
  statRow: { flexDirection: "row", gap: theme.spacing(2) },
  bigStat: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
  },
  bigStatValue: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  bigStatLabel: { color: theme.colors.textMuted, marginTop: 4 },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  cardSub: { color: theme.colors.textMuted, marginTop: 4 },
  questHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gemPill: {
    color: theme.colors.accent,
    fontWeight: "900",
    fontSize: 16,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  quest: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: theme.spacing(2) },
  questLabel: { color: theme.colors.text, fontWeight: "700" },
  questMeta: { color: theme.colors.textMuted, marginTop: 4, fontSize: 12, fontWeight: "700" },
  claim: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  claimText: { color: theme.colors.bg, fontWeight: "900" },
  freezeRow: { marginTop: theme.spacing(1.5) },
  freezeCount: { fontSize: 20, fontWeight: "900", color: theme.colors.text },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 130,
    marginTop: theme.spacing(2),
    gap: 6,
  },
  chartCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  chartVal: { color: theme.colors.textMuted, fontSize: 10, marginBottom: 2 },
  barTrack: { flex: 1, width: "70%", justifyContent: "flex-end" },
  chartLabel: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4, fontWeight: "700" },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: theme.spacing(2),
    width: 7 * 28,
    alignSelf: "center",
  },
  calCell: { width: 22, height: 22, borderRadius: 5, margin: 0 },
  calLegend: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12, justifyContent: "center" },
  calLegendText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "700" },
  trickyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  trickyTarget: { color: theme.colors.text, fontWeight: "800", fontSize: 16 },
  trickyEn: { color: theme.colors.textMuted, marginTop: 2, fontSize: 13 },
  trickyAcc: { color: theme.colors.danger, fontWeight: "800" },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: theme.spacing(1.5) },
  tile: {
    width: "31%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(1.5),
    ...theme.shadow,
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: { color: theme.colors.text, fontWeight: "800", fontSize: 12, textAlign: "center" },
});

