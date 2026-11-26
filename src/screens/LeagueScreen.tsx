import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

// A weekly XP league with simulated rivals. Everything is local and
// deterministic per week — no backend — but it climbs through the week so it
// feels alive, Duolingo-style (top promote, bottom demote).
const RIVALS = [
  { name: "Mateo", emoji: "🦊" },
  { name: "Yuki", emoji: "🐼" },
  { name: "Lena", emoji: "🦉" },
  { name: "Omar", emoji: "🦁" },
  { name: "Priya", emoji: "🐘" },
  { name: "Sven", emoji: "🐻" },
  { name: "Mei", emoji: "🐯" },
  { name: "Ana", emoji: "🦄" },
  { name: "Tom", emoji: "🐶" },
];

const LEAGUES = ["Bronze", "Silver", "Gold", "Sapphire", "Ruby", "Emerald", "Diamond"];

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function LeagueScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { weeklyXp, state } = useProgress();

  const myXp = useMemo(() => weeklyXp().reduce((s, d) => s + d.xp, 0), [weeklyXp]);

  const { rows, league } = useMemo(() => {
    const now = new Date();
    const weekIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24 * 7));
    const dayOfWeek = now.getDay(); // 0..6 — how far into the "week" we are
    const rng = mulberry(weekIndex * 7919 + 13);
    // League tier rotates slowly with your total XP milestones.
    const league = LEAGUES[Math.min(LEAGUES.length - 1, Math.floor(state.xp / 2000))];

    const bots = RIVALS.map((r) => {
      const pace = 30 + Math.floor(rng() * 90); // XP/day for this rival this week
      const noise = Math.floor(rng() * 40);
      const xp = pace * (dayOfWeek + 1) + noise;
      return { ...r, xp, you: false };
    });
    const all = [...bots, { name: "You", emoji: "⭐", xp: myXp, you: true }];
    all.sort((a, b) => b.xp - a.xp);
    return { rows: all, league };
  }, [myXp, state.xp]);

  const myRank = rows.findIndex((r) => r.you) + 1;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>{league} League</Text>
          <Text style={styles.subtitle}>
            You're #{myRank} this week · {myXp} XP
          </Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), paddingBottom: insets.bottom + 24, gap: 8 }}>
        <View style={styles.zoneLabel}>
          <Text style={[styles.zoneText, { color: theme.colors.success }]}>▲ Promotion zone</Text>
        </View>
        {rows.map((r, i) => {
          const rank = i + 1;
          const promote = rank <= 3;
          const demote = rank > rows.length - 3;
          return (
            <View key={r.name}>
              <View
                style={[
                  styles.row,
                  r.you && { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceAlt },
                ]}
              >
                <Text style={[styles.rank, promote && { color: theme.colors.success }, demote && { color: theme.colors.danger }]}>
                  {rank}
                </Text>
                <Text style={styles.avatar}>{r.emoji}</Text>
                <Text style={[styles.name, r.you && { fontWeight: "900", color: theme.colors.text }]}>
                  {r.name}
                </Text>
                <Text style={styles.xp}>{r.xp} XP</Text>
              </View>
              {rank === 3 ? (
                <View style={styles.zoneLabel}>
                  <Text style={styles.zoneText}>· · ·</Text>
                </View>
              ) : null}
              {rank === rows.length - 3 ? (
                <View style={styles.zoneLabel}>
                  <Text style={[styles.zoneText, { color: theme.colors.danger }]}>▼ Demotion zone</Text>
                </View>
              ) : null}
            </View>
          );
        })}
        <Text style={styles.footnote}>
          Earn more XP to climb. Resets every week. (Rivals are practice bots — your XP is real.)
        </Text>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rank: { color: theme.colors.textMuted, fontWeight: "900", fontSize: 16, width: 26 },
  avatar: { fontSize: 24 },
  name: { color: theme.colors.text, fontWeight: "700", fontSize: 16, flex: 1 },
  xp: { color: theme.colors.gold, fontWeight: "800" },
  zoneLabel: { alignItems: "center", paddingVertical: 2 },
  zoneText: { color: theme.colors.textMuted, fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  footnote: { color: theme.colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 12, lineHeight: 18 },
});
