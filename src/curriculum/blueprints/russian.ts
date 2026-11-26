import type { CourseBlueprint } from "@/curriculum/generate";

// Russian (Русский) — a teaching course. Russian uses the Cyrillic alphabet, so
// unit 1 teaches the letters before anything else, and every item carries a
// romanization (shown under tiles and accepted as typed input).
export const russianBlueprint: CourseBlueprint = {
  code: "ru",
  name: "Russian",
  endonym: "Русский",
  flag: "🇷🇺",
  fromLanguage: "English",
  speechLocale: "ru-RU",
  sections: [
    {
      id: "ru-s1",
      title: "First steps",
      subtitle: "The Cyrillic alphabet and first words",
      units: [
        {
          id: "ru-u1",
          title: "Привет!",
          subtitle: "Greetings & the Cyrillic alphabet",
          cefr: "A1",
          color: "#C8102E",
          icon: "🪆",
          teach: [
            {
              title: "Cyrillic: friend, faker, stranger",
              body:
                "Russian uses the Cyrillic alphabet — 33 letters, and easier than it looks. Three groups:\n\n• friends — look and sound like ours: А, К, М, О, Т\n• fakers — look familiar but sound different: В = \"v\", Н = \"n\", Р = \"r\", С = \"s\", Е = \"ye\"\n• strangers — new shapes: Ж \"zh\", Ш \"sh\", Ч \"ch\", Я \"ya\", Ю \"yu\"\n\nEvery word here shows its sound in our alphabet until you're reading on your own.",
              examples: [
                { target: "да", en: "yes", pinyin: "da" },
                { target: "нет", en: "no", pinyin: "nyet" },
                { target: "спасибо", en: "thank you", pinyin: "spasibo" },
              ],
            },
            {
              title: "No 'a', no 'is'",
              body:
                "Two gifts to beginners: Russian has no articles (a/the), and drops \"to be\" in the present. \"I am a student\" is just Я студент — literally \"I student\".",
              examples: [
                { target: "я студент", en: "I am a student", pinyin: "ya studyent" },
                { target: "это дом", en: "this is a house", pinyin: "eto dom" },
              ],
            },
          ],
          vocab: [
            { target: "привет", en: "hi", pinyin: "privyet" },
            { target: "здравствуйте", en: "hello (formal)", pinyin: "zdravstvuytye" },
            { target: "да", en: "yes", pinyin: "da" },
            { target: "нет", en: "no", pinyin: "nyet" },
            { target: "спасибо", en: "thank you", pinyin: "spasibo" },
            { target: "пожалуйста", en: "please; you're welcome", pinyin: "pozhaluysta" },
            { target: "пока", en: "bye", pinyin: "poka" },
            { target: "я", en: "I", pinyin: "ya" },
            { target: "ты", en: "you (informal)", pinyin: "ty" },
            { target: "это", en: "this (is)", pinyin: "eto" },
          ],
          sentences: [
            { target: "привет как дела", en: "hi, how are you?", pinyin: "privyet kak dyela" },
            { target: "я студент", en: "I am a student", pinyin: "ya studyent" },
            { target: "это дом", en: "this is a house", pinyin: "eto dom" },
            { target: "спасибо пока", en: "thanks, bye", pinyin: "spasibo poka" },
          ],
        },
        {
          id: "ru-u2",
          title: "People & things",
          subtitle: "Everyday words and tiny sentences",
          cefr: "A1",
          color: "#0039A6",
          icon: "🫖",
          vocab: [
            { target: "дом", en: "house", pinyin: "dom" },
            { target: "кот", en: "cat", pinyin: "kot" },
            { target: "собака", en: "dog", pinyin: "sobaka" },
            { target: "вода", en: "water", pinyin: "voda" },
            { target: "чай", en: "tea", pinyin: "chai" },
            { target: "хлеб", en: "bread", pinyin: "khlyeb" },
            { target: "друг", en: "friend", pinyin: "drug" },
            { target: "хорошо", en: "good; okay", pinyin: "khorosho" },
            { target: "очень", en: "very", pinyin: "ochen" },
            { target: "люблю", en: "(I) love", pinyin: "lyublyu" },
          ],
          sentences: [
            { target: "я люблю чай", en: "I love tea", pinyin: "ya lyublyu chai" },
            { target: "это очень хорошо", en: "that's very good", pinyin: "eto ochen khorosho" },
            { target: "кот дома", en: "the cat is at home", pinyin: "kot doma" },
            { target: "это мой друг", en: "this is my friend", pinyin: "eto moy drug" },
          ],
        },
      ],
    },
  ],
};
