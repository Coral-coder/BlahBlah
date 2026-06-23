import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExerciseView, type ExResponse } from "@/components/Exercise";
import { Button, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import type { Exercise, Unit } from "@/curriculum/types";
import { isCorrect } from "@/lesson/engine";
import { useNav, useRoute } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

interface Probe {
  unit: Unit;
  exercise: Exercise;
}

export function PlacementScreen() {
  const { courseCode } = useRoute<{ courseCode: string }>();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { applyPlacement } = useProgress();

  const course = getCourse(courseCode);

  const probes = useMemo<Probe[]>(() => {
    if (!course) return [];
    const out: Probe[] = [];
    for (const section of course.sections) {
      for (const unit of section.units) {
        let found: Exercise | undefined;
        for (const lesson of unit.lessons) {
          found = lesson.exercises.find((e) => e.type === "select" || e.type === "fill");
          if (found) break;
        }
        if (found) out.push({ unit, exercise: found });
      }
    }
    return out;
  }, [course]);

  const [phase, setPhase] = useState<"intro" | "quiz">("intro");
  const [i, setI] = useState(0);
  const [response, setResponse] = useState<ExResponse>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  if (!course) return null;

  function placeAt(passedUnits: number) {
    const ids: string[] = [];
    for (let u = 0; u < passedUnits; u++) {
      probes[u].unit.lessons.forEach((l) => ids.push(l.id));
    }
    applyPlacement(course!.code, ids);
    nav.reset("shell");
  }

  if (phase === "intro") {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 50, paddingBottom: insets.bottom + 20, paddingHorizontal: theme.spacing(3) }]}>
        <View style={styles.center}>
          <Text style={styles.emoji}>📊</Text>
          <Text style={styles.title}>Placement test</Text>
          <Text style={styles.body}>
            Answer up to {probes.length} quick questions. We'll figure out how much{" "}
            {course.name} you already know and start you in the right place. Miss one and
            we'll stop there.
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          <Button label="Start" onPress={() => setPhase("quiz")} />
          <Button label="Start from the beginning" variant="ghost" onPress={() => placeAt(0)} />
        </View>
      </View>
    );
  }

  const probe = probes[i];

  function check() {
    const ok = isCorrect(probe.exercise, response as number | string);
    setCorrect(ok);
    setChecked(true);
  }

  function next() {
    if (!correct) return placeAt(i); // belongs in this unit; earlier units passed
    if (i + 1 >= probes.length) return placeAt(probes.length); // aced everything
    setI((n) => n + 1);
    setResponse(null);
    setChecked(false);
    setCorrect(false);
  }

  return (
    <View style={styles.root}>
      <View style={[styles.quizTop, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.quizCount}>
          Question {i + 1} of {probes.length}
        </Text>
        <ProgressBar progress={(i + (checked ? 1 : 0)) / probes.length} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <ExerciseView
          key={`probe-${i}`}
          exercise={probe.exercise}
          revealed={checked}
          correct={checked ? correct : null}
          onChange={setResponse}
        />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {checked ? (
          <Button label="Continue" onPress={next} />
        ) : (
          <Button label="Check" onPress={check} disabled={response === null} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 64 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 10 },
  body: { color: theme.colors.textMuted, fontSize: 16, textAlign: "center", marginTop: 12, lineHeight: 24 },
  quizTop: { paddingBottom: 12, gap: 8, paddingHorizontal: theme.spacing(2) },
  quizCount: { color: theme.colors.textMuted, fontWeight: "700" },
  footer: { paddingTop: 14, paddingHorizontal: theme.spacing(2) },
});
