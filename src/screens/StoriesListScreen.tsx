import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { getStories } from "@/stories";
import { useNav, useRoute } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function StoriesListScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { mode } = useRoute<{ mode?: "roleplay" }>();
  const roleplay = mode === "roleplay";
  const { state, isCompleted } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const stories = course ? getStories(course.code) : [];

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>{roleplay ? "Role-play" : "Stories"}</Text>
          <Text style={styles.subtitle}>
            {roleplay ? `Act out a ${course?.name} dialogue aloud` : `Read & listen to short ${course?.name} tales`}
          </Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      {stories.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>📖</Text>
          <Text style={styles.emptyText}>No stories for this language yet — coming soon!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: 12, paddingBottom: insets.bottom + 20 }}>
          {stories.map((s) => {
            const done = isCompleted(s.courseCode, `story:${s.id}`);
            return (
              <Pressable
                key={s.id}
                style={styles.card}
                onPress={() => nav.navigate(roleplay ? "roleplay" : "story", { storyId: s.id })}
              >
                <Text style={{ fontSize: 40 }}>{s.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{s.title}</Text>
                  <Text style={styles.cardBlurb}>{s.blurb}</Text>
                  <Text style={styles.cardMeta}>{s.cefr}</Text>
                </View>
                {done ? <Text style={styles.done}>✓</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
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
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 30 },
  emptyText: { color: theme.colors.textMuted, textAlign: "center" },
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
  done: { color: theme.colors.success, fontSize: 22, fontWeight: "900" },
});
