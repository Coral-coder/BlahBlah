import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Confetti } from "@/components/Confetti";
import { Button, ProgressBar } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { shuffle } from "@/lesson/engine";
import { speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

// Classic flashcard self-test over the words you've learned: tap to flip,
// then mark "Got it" or "Again". Cards you miss come back until the deck is clear.
export function FlashcardsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state, learnedWords } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;

  const initial = useMemo(
    () => (course ? shuffle(learnedWords(course.code)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [course?.code],
  );
  const [deck, setDeck] = useState(initial);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const total = initial.length;

  if (!course || total === 0) {
    return (
      <View style={[styles.root, styles.center, { padding: theme.spacing(4) }]}>
        <Text style={{ fontSize: 56 }}>🃏</Text>
        <Text style={styles.title}>No cards yet</Text>
        <Text style={styles.sub}>Finish a few lessons to build your flashcard deck.</Text>
        <Button label="Back" variant="ghost" onPress={nav.goBack} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (deck.length === 0) {
    return (
      <View style={[styles.root, styles.center, { padding: theme.spacing(4) }]}>
        <Confetti />
        <Text style={{ fontSize: 64 }}>🎉</Text>
        <Text style={styles.title}>Deck cleared!</Text>
        <Text style={styles.sub}>You reviewed {total} words.</Text>
        <Button label="Done" onPress={nav.goBack} style={{ marginTop: 24, alignSelf: "stretch" }} />
      </View>
    );
  }

  const card = deck[0];
  const advance = (gotIt: boolean) => {
    setFlipped(false);
    if (gotIt) {
      setDone((d) => d + 1);
      setDeck((q) => q.slice(1));
    } else {
      setDeck((q) => [...q.slice(1), q[0]]);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={nav.goBack} hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <ProgressBar progress={total ? done / total : 0} />
        </View>
      </View>

      <Pressable
        style={styles.cardArea}
        onPress={() => {
          if (!flipped) speak(card.target, course.speechLocale);
          setFlipped((f) => !f);
        }}
      >
        <View style={styles.card}>
          {!flipped ? (
            <>
              <Text style={styles.cardTarget}>{card.target}</Text>
              {card.pinyin ? <Text style={styles.cardPinyin}>{card.pinyin}</Text> : null}
              <Text style={styles.hint}>tap to flip · 🔊</Text>
            </>
          ) : (
            <>
              <Text style={styles.cardEn}>{card.en}</Text>
              <Text style={styles.hint}>tap to flip back</Text>
            </>
          )}
        </View>
      </Pressable>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {flipped ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button label="Again" variant="danger" style={{ flex: 1 }} onPress={() => advance(false)} />
            <Button label="Got it" style={{ flex: 1 }} onPress={() => advance(true)} />
          </View>
        ) : (
          <Button label="Flip card" variant="ghost" onPress={() => { speak(card.target, course.speechLocale); setFlipped(true); }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  center: { alignItems: "center", justifyContent: "center" },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: theme.spacing(2), paddingBottom: 8 },
  close: { color: theme.colors.textMuted, fontSize: 24, fontWeight: "700" },
  cardArea: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing(3) },
  card: {
    width: "100%",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(3),
    ...theme.shadow,
  },
  cardTarget: { color: theme.colors.text, fontSize: 38, fontWeight: "900", textAlign: "center" },
  cardPinyin: { color: theme.colors.accent, fontSize: 18 },
  cardEn: { color: theme.colors.text, fontSize: 28, fontWeight: "800", textAlign: "center" },
  hint: { color: theme.colors.textMuted, fontSize: 13, marginTop: 8 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: "900", marginTop: 10 },
  sub: { color: theme.colors.textMuted, fontSize: 15, marginTop: 6, textAlign: "center" },
  footer: { paddingHorizontal: theme.spacing(2), paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
