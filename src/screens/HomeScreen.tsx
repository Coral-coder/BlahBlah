import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Card, Chip } from "@/components/ui";
import {
  CEFR_LEVELS,
  LANGUAGES,
  customLanguage,
  type Language,
} from "@/lib/languages";
import { useNav } from "@/navigation";
import { useApp } from "@/state/AppContext";
import { theme } from "@/theme";

export function HomeScreen() {
  const { ready, language, level, setLanguage, setLevel, hasApiKey } = useApp();
  const nav = useNav();
  const [custom, setCustom] = useState("");
  const insets = useSafeAreaInsets();

  if (!ready) return null;

  const featured = LANGUAGES.filter((l) => l.featured);
  const others = LANGUAGES.filter((l) => !l.featured);
  const isSelected = (l: Language) => l.code === language.code;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.tagline}>
        Learn by immersion. Pick a language, dive into a lesson, then chat your
        way to fluency.
      </Text>

      {!hasApiKey && (
        <Pressable onPress={() => nav.navigate("settings")}>
          <Card style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️  Add your Claude API key in Settings to generate lessons and
              chat. Tap here.
            </Text>
          </Card>
        </Pressable>
      )}

      <Text style={styles.section}>Featured</Text>
      <View style={styles.langRow}>
        {featured.map((l) => (
          <LanguageTile
            key={l.code}
            lang={l}
            active={isSelected(l)}
            onPress={() => setLanguage(l)}
          />
        ))}
      </View>

      <Text style={styles.section}>More languages</Text>
      <View style={styles.chips}>
        {others.map((l) => (
          <Chip
            key={l.code}
            label={`${l.flag} ${l.name}`}
            active={isSelected(l)}
            onPress={() => setLanguage(l)}
          />
        ))}
      </View>

      <Card style={{ marginBottom: theme.spacing(2) }}>
        <Text style={styles.label}>Any language</Text>
        <View style={styles.customRow}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="e.g. Swahili, Dutch, Hindi…"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          <Button
            label="Set"
            variant="ghost"
            onPress={() => {
              const name = custom.trim();
              if (name) {
                setLanguage(customLanguage(name));
                setCustom("");
              }
            }}
          />
        </View>
      </Card>

      <Text style={styles.section}>Your level</Text>
      <View style={styles.chips}>
        {CEFR_LEVELS.map((lvl) => (
          <Chip
            key={lvl.id}
            label={lvl.label}
            active={level === lvl.id}
            onPress={() => setLevel(lvl.id)}
          />
        ))}
      </View>

      <Card style={styles.current}>
        <Text style={styles.currentLabel}>Studying</Text>
        <Text style={styles.currentValue}>
          {language.flag} {language.name} · {level}
        </Text>
      </Card>

      <Button
        label="📖  Generate a lesson"
        onPress={() => nav.navigate("lesson")}
        style={{ marginBottom: theme.spacing(1.5) }}
      />
      <Button
        label="💬  Practice conversation"
        variant="ghost"
        onPress={() => nav.navigate("immersion")}
        style={{ marginBottom: theme.spacing(1.5) }}
      />
      <Button
        label="⚙️  Settings"
        variant="ghost"
        onPress={() => nav.navigate("settings")}
      />

      <View style={{ height: insets.bottom + theme.spacing(2) }} />
    </ScrollView>
  );
}

function LanguageTile({
  lang,
  active,
  onPress,
}: {
  lang: Language;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tile,
        {
          borderColor: active ? theme.colors.primary : theme.colors.border,
          backgroundColor: active
            ? theme.colors.surfaceAlt
            : theme.colors.surface,
        },
      ]}
    >
      <Text style={styles.tileFlag}>{lang.flag}</Text>
      <Text style={styles.tileName}>{lang.name}</Text>
      <Text style={styles.tileEndonym}>{lang.endonym}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing(2), gap: theme.spacing(0.5) },
  tagline: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: theme.spacing(2),
  },
  warning: {
    backgroundColor: "#2A2418",
    borderColor: "#5C4B1F",
    marginBottom: theme.spacing(2),
  },
  warningText: { color: "#F2D98B", fontWeight: "600" },
  section: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
  },
  langRow: { flexDirection: "row", gap: theme.spacing(1.5) },
  tile: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    padding: theme.spacing(2),
    alignItems: "center",
  },
  tileFlag: { fontSize: 40 },
  tileName: { color: theme.colors.text, fontWeight: "800", marginTop: 6 },
  tileEndonym: { color: theme.colors.textMuted, marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  label: { color: theme.colors.textMuted, fontWeight: "700", marginBottom: 8 },
  customRow: { flexDirection: "row", gap: theme.spacing(1), alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  current: {
    marginVertical: theme.spacing(2),
    backgroundColor: theme.colors.surfaceAlt,
  },
  currentLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  currentValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
});
