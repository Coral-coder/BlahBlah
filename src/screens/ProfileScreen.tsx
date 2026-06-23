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
  const { state, currentStreak, xpToday, setDailyGoal, courseProgress } = useProgress();

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
});
