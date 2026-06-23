import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, ProgressBar } from "@/components/ui";
import { computeAchievements } from "@/lib/achievements";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function AchievementsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state } = useProgress();
  const items = computeAchievements(state);
  const earned = items.filter((a) => a.earned).length;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {earned} of {items.length} unlocked
          </Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing(2),
          paddingBottom: insets.bottom + 24,
          gap: 12,
        }}
      >
        {items.map((a) => (
          <View key={a.id} style={[styles.card, !a.earned && styles.cardLocked]}>
            <View style={[styles.badge, a.earned ? styles.badgeOn : styles.badgeOff]}>
              <Text style={[styles.emoji, !a.earned && { opacity: 0.4 }]}>{a.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                {a.earned ? <Text style={styles.check}>✓</Text> : null}
              </View>
              <Text style={styles.cardDesc}>{a.desc}</Text>
              {a.earned ? (
                <Text style={styles.earnedText}>Unlocked!</Text>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <ProgressBar progress={a.progress} height={8} color={theme.colors.primary} />
                  <Text style={styles.progressText}>
                    {Math.min(a.value, a.goal).toLocaleString()} / {a.goal.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
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
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
    ...theme.shadow,
  },
  cardLocked: { opacity: 0.85 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeOn: { backgroundColor: "#2A2418", borderColor: theme.colors.gold },
  badgeOff: { backgroundColor: theme.colors.surfaceAlt, borderColor: theme.colors.border },
  emoji: { fontSize: 28 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: theme.colors.text, fontSize: 17, fontWeight: "800" },
  check: { color: theme.colors.success, fontSize: 20, fontWeight: "900" },
  cardDesc: { color: theme.colors.textMuted, marginTop: 2 },
  earnedText: { color: theme.colors.gold, fontWeight: "800", marginTop: 6 },
  progressText: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: "700" },
});
