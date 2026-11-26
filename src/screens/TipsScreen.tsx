import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { getTips } from "@/tips/content";
import { speak } from "@/lib/speech";
import { setSpeechLocale } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function TipsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  if (course) setSpeechLocale(course.speechLocale);
  const tips = course ? getTips(course.code) : [];

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>Grammar tips</Text>
          <Text style={styles.subtitle}>Key {course?.name} rules, kept short</Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: 14, paddingBottom: insets.bottom + 20 }}>
        {tips.map((t, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{t.title}</Text>
            <Text style={styles.body}>{t.body}</Text>
            {t.examples?.map((ex, j) => (
              <Pressable key={j} style={styles.example} onPress={() => speak(ex.target)}>
                <Text style={styles.exTarget}>{ex.target}  🔊</Text>
                <Text style={styles.exEn}>{ex.en}</Text>
              </Pressable>
            ))}
          </View>
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
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
  },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  body: { color: theme.colors.textMuted, marginTop: 8, lineHeight: 21 },
  example: {
    marginTop: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing(1.5),
  },
  exTarget: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
  exEn: { color: theme.colors.textMuted, marginTop: 2 },
});
