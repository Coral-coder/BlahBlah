import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Chip, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { flattenCourse } from "@/curriculum/types";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

const GOALS = [10, 20, 30, 50];

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
          <BigStat value={`${currentStreak}`} label="day streak" emoji="🔥" />
          <BigStat value={`${state.xp}`} label="total XP" emoji="⭐" />
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

        <Card>
          <Text style={styles.cardTitle}>Practice & play</Text>
          <Button
            label="🧠  Review (recall your weak words)"
            variant="ghost"
            onPress={() => nav.navigate("review")}
            style={{ marginTop: theme.spacing(1.5) }}
          />
          <Button
            label="🎯  Practice your mistakes"
            variant="ghost"
            onPress={() => nav.navigate("review", { mistakesOnly: true })}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="👂  Dictation"
            variant="ghost"
            onPress={() => nav.navigate("dictation")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="💡  Grammar tips"
            variant="ghost"
            onPress={() => nav.navigate("tips")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="📚  Stories"
            variant="ghost"
            onPress={() => nav.navigate("stories")}
            style={{ marginTop: theme.spacing(1.5) }}
          />
          <Button
            label="🎭  Role-play (speak a scene)"
            variant="ghost"
            onPress={() => nav.navigate("stories", { mode: "roleplay" })}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="🎬  Watch"
            variant="ghost"
            onPress={() => nav.navigate("watch")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="📰  News"
            variant="ghost"
            onPress={() => nav.navigate("news")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="✨  AI Story"
            variant="ghost"
            onPress={() => nav.navigate("aistory")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="📖  Words you know"
            variant="ghost"
            onPress={() => nav.navigate("words")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="⚡  Match Blitz"
            variant="ghost"
            onPress={() => nav.navigate("game")}
            style={{ marginTop: theme.spacing(1) }}
          />
          <Button
            label="✍️  Practice writing"
            variant="ghost"
            onPress={() => nav.navigate("trace")}
            style={{ marginTop: theme.spacing(1) }}
          />
        </Card>

        <Button label="Settings" variant="ghost" onPress={() => nav.navigate("settings")} />
      </ScrollView>
    </View>
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

function BigStat({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <View style={styles.bigStat}>
      <Text style={styles.bigStatValue}>
        {emoji} {value}
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
});

