// Language-specific special characters, surfaced as a tap bar above the typing
// exercise so learners can enter them without hunting in the system keyboard.
export function accentChars(locale?: string): string[] {
  const prefix = (locale ?? "").toLowerCase().split("-")[0];
  switch (prefix) {
    case "de":
      return ["ä", "ö", "ü", "ß"];
    case "es":
      return ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"];
    case "is":
      return ["á", "é", "í", "ó", "ú", "ý", "ð", "þ", "æ", "ö"];
    default:
      // Thai / Chinese use their own input methods; no accent bar needed.
      return [];
  }
}
