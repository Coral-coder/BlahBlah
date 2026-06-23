import { ScrollView, StyleSheet, Text, View } from "react-native";
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
  const { state, currentStreak, xpToday, setDailyGoal, courseProgress, weeklyXp } =
    useProgress();
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
            label="📖  Words you know"
            variant="ghost"
            onPress={() => nav.navigate("words")}
            style={{ marginTop: theme.spacing(1.5) }}
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
});

