import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

const COLORS = ["#58CC02", "#FFC800", "#5B8DEF", "#E5534B", "#3DDC97", "#FF7AC6"];

/** A lightweight one-shot confetti burst that rains down and fades out. */
export function Confetti({ count = 28 }: { count?: number }) {
  const { width, height } = Dimensions.get("window");
  const pieces = useRef(
    Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      delay: Math.random() * 350,
      dur: 1500 + Math.random() * 1400,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 7 + Math.random() * 9,
      spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
      anim: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    Animated.parallel(
      pieces.map((p) =>
        Animated.timing(p.anim, {
          toValue: 1,
          duration: p.dur,
          delay: p.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, height + 50],
        });
        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${p.spin}deg`],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.85, 1],
          outputRange: [1, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              width: p.size,
              height: p.size,
              borderRadius: 2,
              backgroundColor: p.color,
              transform: [{ translateY }, { rotate }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}
