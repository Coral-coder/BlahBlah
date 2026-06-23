import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { getCourse } from "@/curriculum";
import { fetchNews, getFeed, type NewsItem } from "@/news/feeds";
import { speak } from "@/lib/speech";
import { useNav } from "@/navigation";
import { useProgress } from "@/state/ProgressContext";
import { theme } from "@/theme";

export function NewsScreen() {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { state } = useProgress();
  const course = state.currentCourse ? getCourse(state.currentCourse) : undefined;
  const feed = course ? getFeed(course.code) : undefined;

  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  async function load() {
    if (!course) return;
    setStatus("loading");
    try {
      const data = await fetchNews(course.code);
      setItems(data);
      setStatus(data.length ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  return (
    <View style={styles.root}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.title}>News</Text>
          <Text style={styles.subtitle}>Real headlines in {course?.name}{feed ? ` · ${feed.name}` : ""}</Text>
        </View>
        <Button label="Done" variant="ghost" onPress={nav.goBack} />
      </View>

      {status === "loading" ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : status === "error" ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>📰</Text>
          <Text style={styles.errText}>Couldn't load the feed right now.</Text>
          <Button label="Retry" onPress={load} style={{ marginTop: 16 }} />
          {feed ? (
            <Button label="Open the site" variant="ghost" onPress={() => Linking.openURL(feed.site)} style={{ marginTop: 10 }} />
          ) : null}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.spacing(2), gap: 12, paddingBottom: insets.bottom + 20 }}>
          <Text style={styles.note}>Tap a headline to read the full article. 🔊 reads it aloud.</Text>
          {items.map((it, i) => (
            <View key={i} style={styles.card}>
              <Pressable onPress={() => it.link && Linking.openURL(it.link)}>
                <Text style={styles.headline}>{it.title}</Text>
                {it.description ? <Text style={styles.desc} numberOfLines={3}>{it.description}</Text> : null}
              </Pressable>
              <Pressable onPress={() => speak(`${it.title}. ${it.description}`)} style={styles.listen}>
                <Text style={styles.listenText}>🔊 Listen</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: theme.spacing(2), paddingBottom: 10 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.colors.textMuted, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  errText: { color: theme.colors.textMuted, marginTop: 10 },
  note: { color: theme.colors.textMuted, fontSize: 13 },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(2),
  },
  headline: { color: theme.colors.text, fontSize: 17, fontWeight: "700", lineHeight: 24 },
  desc: { color: theme.colors.textMuted, marginTop: 6, lineHeight: 20 },
  listen: { marginTop: 10, alignSelf: "flex-start" },
  listenText: { color: theme.colors.primary, fontWeight: "700" },
});
