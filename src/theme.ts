// Shared visual language for BlahBlah. Kept deliberately small so screens stay
// consistent without a heavy design-system dependency.
export const theme = {
  colors: {
    bg: "#0E1116",
    surface: "#171C24",
    surfaceAlt: "#1F2630",
    border: "#2A323D",
    text: "#F2F5F9",
    textMuted: "#9AA7B6",
    primary: "#5B8DEF",
    primaryText: "#FFFFFF",
    accent: "#3DDC97",
    danger: "#E5534B",
    chipUser: "#2B3A55",
    chipTutor: "#1F2630",
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
  },
  spacing: (n: number) => n * 8,
} as const;

export type Theme = typeof theme;
