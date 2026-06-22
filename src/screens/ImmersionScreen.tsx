import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { chatReply, describeError } from "@/lib/claude";
import { speak } from "@/lib/speech";
import type { ChatMessage } from "@/lib/types";
import { useNav } from "@/navigation";
import { useApp } from "@/state/AppContext";
import { theme } from "@/theme";

export function ImmersionScreen() {
  const { settings, language, level, hasApiKey } = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    if (!hasApiKey) {
      setError("Add your Claude API key in Settings first.");
      return;
    }
    setError(null);
    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setDraft("");
    setSending(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd());
    try {
      const reply = await chatReply({
        apiKey: settings.apiKey,
        model: settings.model,
        language,
        level,
        history: next,
      });
      setMessages([...next, reply]);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd());
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        <Text style={styles.context}>
          Chatting in {language.flag} {language.name} · Level {level}
        </Text>

        {messages.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Start the conversation</Text>
            <Text style={styles.emptyBody}>
              Say hello in {language.name} — or in English. Your tutor replies in{" "}
              {language.name} with a translation, corrects you gently, and keeps
              the conversation going.
            </Text>
          </View>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}

        {sending && (
          <View style={[styles.bubble, styles.tutor]}>
            <ActivityIndicator color={theme.colors.textMuted} />
          </View>
        )}

        {error && (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{error}</Text>
            {!hasApiKey && (
              <Button
                label="Open Settings"
                variant="ghost"
                onPress={() => nav.navigate("settings")}
                style={{ marginTop: theme.spacing(1) }}
              />
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={`Message in ${language.name}…`}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          multiline
          onSubmitEditing={send}
        />
        <Button
          label="Send"
          onPress={send}
          loading={sending}
          style={styles.sendBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const [showTr, setShowTr] = useState(false);
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.tutor]}>
      <Text style={styles.bubbleText}>{message.content}</Text>
      {!isUser && (
        <View style={styles.bubbleActions}>
          <Pressable onPress={() => speak(message.content)}>
            <Text style={styles.action}>🔊 Listen</Text>
          </Pressable>
          {message.translation ? (
            <Pressable onPress={() => setShowTr((v) => !v)}>
              <Text style={styles.action}>{showTr ? "Hide" : "Translate"}</Text>
            </Pressable>
          ) : null}
        </View>
      )}
      {!isUser && showTr && message.translation ? (
        <Text style={styles.translation}>{message.translation}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  thread: { padding: theme.spacing(2), gap: theme.spacing(1.5) },
  context: {
    color: theme.colors.textMuted,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: theme.spacing(1),
  },
  empty: { padding: theme.spacing(2), alignItems: "center", gap: 8 },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "800" },
  emptyBody: {
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  bubble: {
    maxWidth: "85%",
    padding: theme.spacing(1.5),
    borderRadius: theme.radius.lg,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.chipUser,
    borderBottomRightRadius: 4,
  },
  tutor: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.chipTutor,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  bubbleActions: { flexDirection: "row", gap: theme.spacing(2), marginTop: 8 },
  action: { color: theme.colors.primary, fontWeight: "700", fontSize: 13 },
  translation: {
    color: theme.colors.textMuted,
    marginTop: 8,
    fontStyle: "italic",
    lineHeight: 20,
  },
  errorRow: { padding: theme.spacing(1) },
  errorText: { color: "#F2A8A2", fontWeight: "600" },
  composer: {
    flexDirection: "row",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: { paddingHorizontal: 20 },
});
