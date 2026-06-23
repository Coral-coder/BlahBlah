import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { theme } from "@/theme";

// Juicy "3D" button with a darker bottom lip that compresses when pressed —
// the tactile feel Duolingo uses to make taps feel satisfying.
export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const bg =
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
        ? theme.colors.danger
        : theme.colors.surfaceAlt;
  const lip =
    variant === "primary"
      ? theme.colors.primaryDark
      : variant === "danger"
        ? theme.colors.dangerDark
        : theme.colors.border;
  const isGhost = variant === "ghost";
  const isDisabled = disabled || loading;
  const LIP = 4;

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={style}>
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            {
              backgroundColor: bg,
              borderBottomWidth: isGhost ? 1 : LIP,
              borderWidth: isGhost ? 1 : 0,
              borderBottomColor: lip,
              borderColor: isGhost ? theme.colors.border : lip,
              opacity: isDisabled ? 0.5 : 1,
              transform: [{ translateY: pressed && !isDisabled ? LIP : 0 }],
              marginBottom: pressed && !isDisabled ? 0 : 0,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { color: isGhost ? theme.colors.text : theme.colors.primaryText },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
          borderColor: active ? theme.colors.primaryDark : theme.colors.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text
        style={{
          color: active ? theme.colors.primaryText : theme.colors.textMuted,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Progress bar whose fill springs smoothly to the target width, with a subtle
// glossy highlight stripe for a polished feel.
export function ProgressBar({
  progress,
  color = theme.colors.success,
  height = 14,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: pct,
      useNativeDriver: false,
      friction: 9,
      tension: 60,
    }).start();
  }, [pct, anim]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <Animated.View
        style={{
          width,
          height: "100%",
          backgroundColor: color,
          borderRadius: height,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 3,
            left: 6,
            right: 6,
            height: Math.max(2, height * 0.25),
            borderRadius: height,
            backgroundColor: "rgba(255,255,255,0.35)",
          }}
        />
      </Animated.View>
    </View>
  );
}

export function Hearts({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{ fontSize: 18 }}>❤️</Text>
      <Text style={{ color: theme.colors.danger, fontWeight: "800", marginLeft: 4 }}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: theme.colors.surfaceAlt,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
    ...theme.shadow,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
});
