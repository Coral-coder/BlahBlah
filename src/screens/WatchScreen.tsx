import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { getWatch } from "@/watch/content";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function WatchScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const items = course ? getWatch(course.code) : [];

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Watch</Text>
          <Text style={styles.subtitle}>Cartoons & immersion videos in {course?.name}</Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: 12, paddingBottom: insets.bottom + 20 }}>
        <Text style={styles.note}>Opens in YouTube. Pick something a little above your level and just enjoy it.</Text>
        {items.map((it) => (
          <Pressable key={it.title} style={styles.card} onPress={() => Linking.openURL(it.url)}>
            <Text style={{ fontSize: 38 }}>{it.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{it.title}</Text>
              <Text style={styles.cardBlurb}>{it.blurb}</Text>
              <Text style={styles.cardMeta}>{it.source} ↗</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: theme.spacing(2), paddingBottom: 10 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  note: { color: theme.colors.textMuted, fontSize: 13, marginBottom: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
  },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  cardBlurb: { color: theme.colors.textMuted, marginTop: 2 },
  cardMeta: { color: theme.colors.accent, marginTop: 4, fontWeight: "700", fontSize: 12 },
});
