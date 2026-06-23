import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/** A friendly bobbing mascot. Pure Animated, no assets. */
export function Mascot({ size = 56 }: { size?: number }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 850, useNativeDriver: true }),
      ]),
    ).start();
  }, [bob]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const rotate = bob.interpolate({ inputRange: [0, 1], outputRange: ["-5deg", "5deg"] });

  return (
    <Animated.Text style={{ fontSize: size, transform: [{ translateY }, { rotate }] }}>
      🦜
    </Animated.Text>
  );
}
