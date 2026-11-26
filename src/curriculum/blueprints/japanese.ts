import type { CourseBlueprint } from "@/curriculum/generate";

// Japanese (日本語) — a teaching course. Japanese is written with three scripts
// (hiragana, katakana, kanji) and no spaces, so every item carries a romaji
// reading (shown under tiles and accepted as typed input). Word order is
// Subject–Object–Verb and small particles mark each word's role.
//
// Sentences are written with spaces between words so the tap-the-tiles mechanic
// works; real Japanese is written without spaces.
export const japaneseBlueprint: CourseBlueprint = {
  code: "ja",
  name: "Japanese",
  endonym: "日本語 (Nihongo)",
  flag: "🇯🇵",
  fromLanguage: "English",
  speechLocale: "ja-JP",
  sections: [
    {
      id: "ja-s1",
      title: "First steps",
      subtitle: "The scripts, greetings and being polite",
      units: [
        {
          id: "ja-u1",
          title: "Hello, Japan",
          subtitle: "Greetings & the writing system",
          cefr: "A1",
          color: "#BC002D",
          icon: "🗾",
          teach: [
            {
              title: "Three scripts (+ romaji)",
              body:
                "Japanese mixes three writing systems:\n\n• hiragana (ひらがな) — flowing characters for grammar and native words\n• katakana (カタカナ) — angular characters, mostly for foreign words\n• kanji (漢字) — characters borrowed from Chinese, for meanings\n\nEach hiragana/katakana symbol is one syllable. To help you start, everything here shows romaji — the sound in our alphabet. You can type the romaji as your answer.",
              examples: [
                { target: "こんにちは", en: "hello", pinyin: "konnichiwa" },
                { target: "ありがとう", en: "thank you", pinyin: "arigatō" },
              ],
            },
            {
              title: "Pitch, not tone",
              body:
                "Good news after Chinese/Thai: Japanese is NOT tonal. It has a gentler pitch accent, but you'll be understood with even, clear syllables. Say each syllable for the same length: ko-n-ni-chi-wa.",
              examples: [{ target: "すみません", en: "excuse me / sorry", pinyin: "sumimasen" }],
            },
          ],
          vocab: [
            { target: "こんにちは", en: "hello", pinyin: "konnichiwa" },
            { target: "おはよう", en: "good morning", pinyin: "ohayō" },
            { target: "ありがとう", en: "thank you", pinyin: "arigatō" },
            { target: "すみません", en: "excuse me; sorry", pinyin: "sumimasen" },
            { target: "はい", en: "yes", pinyin: "hai" },
            { target: "いいえ", en: "no", pinyin: "iie" },
            { target: "さようなら", en: "goodbye", pinyin: "sayōnara" },
            { target: "わたし", en: "I; me", pinyin: "watashi" },
            { target: "あなた", en: "you", pinyin: "anata" },
            { target: "です", en: "to be (polite)", pinyin: "desu" },
          ],
          sentences: [
            { target: "わたし は がくせい です", en: "I am a student", pinyin: "watashi wa gakusei desu" },
            { target: "ありがとう ございます", en: "thank you (polite)", pinyin: "arigatō gozaimasu" },
            { target: "はい そう です", en: "yes, that's right", pinyin: "hai sō desu" },
          ],
        },
        {
          id: "ja-u2",
          title: "People & things",
          subtitle: "Everyday words and simple sentences",
          cefr: "A1",
          color: "#1B6CA8",
          icon: "🍵",
          vocab: [
            { target: "ねこ", en: "cat", pinyin: "neko" },
            { target: "いぬ", en: "dog", pinyin: "inu" },
            { target: "みず", en: "water", pinyin: "mizu" },
            { target: "おちゃ", en: "tea", pinyin: "ocha" },
            { target: "ともだち", en: "friend", pinyin: "tomodachi" },
            { target: "せんせい", en: "teacher", pinyin: "sensei" },
            { target: "たべる", en: "to eat", pinyin: "taberu" },
            { target: "のむ", en: "to drink", pinyin: "nomu" },
            { target: "いく", en: "to go", pinyin: "iku" },
            { target: "これ", en: "this", pinyin: "kore" },
          ],
          sentences: [
            { target: "これ は みず です", en: "this is water", pinyin: "kore wa mizu desu" },
            { target: "わたし は おちゃ を のむ", en: "I drink tea", pinyin: "watashi wa ocha o nomu" },
            { target: "ともだち は せんせい です", en: "my friend is a teacher", pinyin: "tomodachi wa sensei desu" },
          ],
        },
      ],
    },
  ],
};
