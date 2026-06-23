import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useNav, useRoute } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

interface Params {
  courseCode: string;
  lessonId: string;
  passed: boolean;
  xp: number;
  mistakes: number;
  total: number;
}

export function LessonCompleteScreen() {
  const { courseCode, lessonId, passed, xp, mistakes, total } = useRoute<Params>();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { currentStreak } = useProgress();

  const accuracy =
    total > 0 ? Math.round((total / (total + mistakes)) * 100) : 100;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.center}>
        <Text style={styles.emoji}>{passed ? "🎉" : "💪"}</Text>
        <Text style={styles.title}>{passed ? "Lesson complete!" : "Out of hearts"}</Text>
        <Text style={styles.subtitle}>
          {passed
            ? "Great work — you've got this."
            : "Almost! Review and give it another go."}
        </Text>

        {passed ? (
          <View style={styles.stats}>
            <Stat label="XP" value={`+${xp}`} color={theme.colors.gold} />
            <Stat label="Accuracy" value={`${accuracy}%`} color={theme.colors.success} />
            <Stat label="Streak" value={`${currentStreak}🔥`} color={theme.colors.primary} />
          </View>
        ) : null}
      </View>

      <View style={{ gap: 12 }}>
        {passed ? (
          <Button label="Continue" onPress={() => nav.reset("shell")} />
        ) : (
          <>
            <Button
              label="Try again"
              onPress={() => nav.replace("lesson", { courseCode, lessonId })}
            />
            <Button label="Back to path" variant="ghost" onPress={() => nav.reset("shell")} />
          </>
        )}
      </View>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: theme.spacing(3), justifyContent: "space-between" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 72 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "900", marginTop: 12 },
  subtitle: { color: theme.colors.textMuted, fontSize: 16, marginTop: 8, textAlign: "center" },
  stats: { flexDirection: "row", gap: 14, marginTop: theme.spacing(4) },
  stat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(2),
  },
  statValue: { fontSize: 22, fontWeight: "900" },
  statLabel: { color: theme.colors.textMuted, marginTop: 4, fontSize: 13 },
});
