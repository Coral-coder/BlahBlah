import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCourseSummaries } from "@/curriculum";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function CourseSelectScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { setCurrentCourse, courseProgress, state } = useProgress();

  function pick(code: string) {
    setCurrentCourse(code);
    const placed = courseProgress(code).placed;
    if (placed) nav.reset("shell");
    else nav.replace("placement", { courseCode: code });
  }

  return (
    <View style={styles.root}>
      <View style={{ paddingTop: insets.top + 16 }}>
        <Text style={styles.title}>Choose a language</Text>
        <Text style={styles.subtitle}>Structured courses that guide you lesson by lesson.</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: theme.spacing(2), gap: 14 }}>
        {getCourseSummaries().map((course) => {
          const cp = courseProgress(course.code);
          const done = Object.keys(cp.completed).length;
          return (
            <Pressable key={course.code} style={styles.card} onPress={() => pick(course.code)}>
              <Text style={styles.flag}>{course.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{course.name}</Text>
                <Text style={styles.endonym}>{course.endonym}</Text>
                <Text style={styles.meta}>
                  {course.sections} sections · {course.lessons} lessons
                  {done > 0 ? ` · ${done} done` : ""}
                </Text>
              </View>
              {state.currentCourse === course.code ? (
                <Text style={styles.current}>current</Text>
              ) : null}
            </Pressable>
          );
        })}
        <Text style={styles.note}>More languages coming soon.</Text>
      </ScrollView>

      {nav.canGoBack ? (
        <Pressable onPress={nav.goBack} style={[styles.back, { paddingBottom: insets.bottom + 10 }]}>
          <Text style={{ color: theme.colors.textMuted, fontWeight: "700" }}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: theme.spacing(2) },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 6, fontSize: 15 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
  },
  flag: { fontSize: 44 },
  name: { color: theme.colors.text, fontSize: 20, fontWeight: "800" },
  endonym: { color: theme.colors.textMuted, marginTop: 2 },
  meta: { color: theme.colors.textMuted, marginTop: 6, fontSize: 13 },
  current: { color: theme.colors.success, fontWeight: "800", fontSize: 12 },
  note: { color: theme.colors.textMuted, textAlign: "center", marginTop: theme.spacing(2) },
  back: { alignItems: "center", paddingTop: 12 },
});
