import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function SettingsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, resetCourse } = useProgress();
  const [confirm, setConfirm] = useState(false);

  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Settings</Text>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: theme.spacing(2) }}>
        <Card>
          <Text style={styles.cardTitle}>Reset course progress</Text>
          <Text style={styles.cardSub}>
            {course
              ? `Clears all completed lessons and your placement for ${course.name}. XP and streak are kept.`
              : "Pick a course first."}
          </Text>
          {course ? (
            confirm ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: theme.spacing(2) }}>
                <Button
                  label="Yes, reset"
                  variant="danger"
                  style={{ flex: 1 }}
                  onPress={() => {
                    resetCourse(course.code);
                    setConfirm(false);
                    nav.reset("shell");
                  }}
                />
                <Button label="Cancel" variant="ghost" style={{ flex: 1 }} onPress={() => setConfirm(false)} />
              </View>
            ) : (
              <Button
                label="Reset progress"
                variant="danger"
                style={{ marginTop: theme.spacing(2) }}
                onPress={() => setConfirm(true)}
              />
            )
          ) : null}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.cardSub}>
            BlahBlah — learn languages through a guided, structured path of bite-sized lessons.
            Version 0.2.0.
          </Text>
        </Card>
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
    paddingBottom: 8,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  cardTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  cardSub: { color: theme.colors.textMuted, marginTop: 6, lineHeight: 20 },
});
