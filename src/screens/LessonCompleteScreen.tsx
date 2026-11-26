import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Confetti } from "@/components/Confetti";
import { Button } from "@/components/ui";
import { playSfx } from "@/lib/sfx";
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
  const perfect = passed && mistakes === 0;

  // Animations: emoji pop, content rise, XP count-up.
  const pop = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [xpShown, setXpShown] = useState(0);

  useEffect(() => {
    if (passed) playSfx("complete");
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 4, tension: 90 }),
      Animated.timing(rise, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    if (passed) {
      const id = xpAnim.addListener(({ value }) => setXpShown(Math.round(value)));
      Animated.timing(xpAnim, {
        toValue: xp,
        duration: 1100,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      return () => xpAnim.removeListener(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passed]);

  const accuracy = total > 0 ? Math.round((total / (total + mistakes)) * 100) : 100;
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const wiggle = pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: ["-12deg", "8deg", "0deg"] });
  const riseY = rise.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      {passed ? <Confetti count={perfect ? 70 : 42} /> : null}
      <View style={styles.center}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale }, { rotate: wiggle }] }]}>
          {passed ? (perfect ? "🏆" : "🎉") : "💪"}
        </Animated.Text>

        <Animated.View style={{ opacity: rise, transform: [{ translateY: riseY }], alignItems: "center" }}>
          {perfect ? (
            <View style={styles.perfectBadge}>
              <Text style={styles.perfectText}>PERFECT LESSON</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{passed ? "Lesson complete!" : "Out of hearts"}</Text>
          <Text style={styles.subtitle}>
            {passed
              ? perfect
                ? "Flawless — no mistakes! 🌟"
                : "Great work — you're on a roll."
              : "Almost! Review and give it another go."}
          </Text>

          {passed ? (
            <View style={styles.stats}>
              <Stat label="XP" value={`+${xpShown}`} color={theme.colors.gold} />
              <Stat label="Accuracy" value={`${accuracy}%`} color={theme.colors.success} />
              <Stat label="Streak" value={`${currentStreak}🔥`} color={theme.colors.primary} />
            </View>
          ) : null}
        </Animated.View>
      </View>

      <View style={{ gap: 12 }}>
        {passed ? (
          <Button label="Continue" onPress={() => nav.reset("shell")} />
        ) : (
          <>
            <Button label="Try again" onPress={() => nav.replace("lesson", { courseCode, lessonId })} />
            <Button label="Back to path" variant="ghost" onPress={() => nav.reset("shell")} />
          </>
        )}
      </View>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.stat, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: theme.spacing(3), justifyContent: "space-between" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 88 },
  perfectBadge: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
    ...theme.shadow,
  },
  perfectText: { color: theme.colors.bg, fontWeight: "900", letterSpacing: 1.5, fontSize: 13 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: "900", marginTop: 12 },
  subtitle: { color: theme.colors.textMuted, fontSize: 16, marginTop: 8, textAlign: "center" },
  stats: { flexDirection: "row", gap: 14, marginTop: theme.spacing(4) },
  stat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing(2),
    ...theme.shadow,
  },
  statValue: { fontSize: 24, fontWeight: "900" },
  statLabel: { color: theme.colors.textMuted, marginTop: 4, fontSize: 13 },
});
