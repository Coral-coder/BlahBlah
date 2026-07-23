import type { CourseBlueprint } from "@/curriculum/generate";

// Swedish (Svenska) — a teaching course. Swedish is one of the friendliest
// languages for English speakers: verbs NEVER change for person, and the two
// big quirks (en/ett gender, "the" glued onto the end of the noun) are taught
// up front. Pipeline vocabulary appends to this hand-authored core.
export const swedishBlueprint: CourseBlueprint = {
  code: "sv",
  name: "Swedish",
  endonym: "Svenska",
  flag: "🇸🇪",
  fromLanguage: "English",
  speechLocale: "sv-SE",
  sections: [
    {
      id: "sv-s1",
      title: "First steps",
      subtitle: "Greetings and Swedish's friendly grammar",
      units: [
        {
          id: "sv-u1",
          title: "Hej!",
          subtitle: "Greetings — and one verb form for everyone",
          cefr: "A1",
          color: "#006AA7",
          icon: "🇸🇪",
          teach: [
            {
              title: "One verb form. For everyone.",
              body:
                "Here's Swedish's gift to learners: verbs never change for person.\n\n• jag är — I am\n• du är — you are\n• han/hon är — he/she is\n• vi är — we are\n\nOne form: är. Same with every verb — jag pratar, du pratar, vi pratar. Learn a verb once, use it for everyone.",
              examples: [
                { target: "jag är här", en: "I am here" },
                { target: "vi är här", en: "we are here" },
              ],
            },
            {
              title: "The letters å, ä, ö",
              body:
                "Three extra vowels: å (like 'o' in 'or'), ä (like 'e' in 'bear'), ö (like 'u' in 'fur'). They're separate letters, not decorations — mor (mother) and mör (tender) are different words.",
              examples: [
                { target: "hejdå", en: "goodbye ('hey-DOH')" },
                { target: "kött", en: "meat ('shut' with ch)" },
              ],
            },
          ],
          vocab: [
            { target: "hej", en: "hello" },
            { target: "hejdå", en: "goodbye" },
            { target: "tack", en: "thank you" },
            { target: "ja", en: "yes" },
            { target: "nej", en: "no" },
            { target: "jag", en: "I" },
            { target: "du", en: "you" },
            { target: "är", en: "am/is/are" },
            { target: "bra", en: "good; well" },
            { target: "varsågod", en: "you're welcome" },
            { target: "förlåt", en: "sorry" },
            { target: "god morgon", en: "good morning" },
          ],
          sentences: [
            { target: "hej hur mår du", en: "hi, how are you?" },
            { target: "jag mår bra tack", en: "I'm fine, thanks" },
            { target: "jag är här", en: "I am here" },
            { target: "tack så mycket", en: "thank you very much" },
          ],
        },
        {
          id: "sv-u2",
          title: "En hund, ett hus",
          subtitle: "Things — and 'the' glued on the end",
          cefr: "A1",
          color: "#FECC02",
          icon: "🏠",
          teach: [
            {
              title: "Two genders: en & ett",
              body:
                "Every noun is an en-word or an ett-word: en hund (a dog), ett hus (a house). About 75% are en-words, but there's no reliable rule — learn en/ett WITH the noun.",
              examples: [
                { target: "en hund", en: "a dog" },
                { target: "ett hus", en: "a house" },
              ],
            },
            {
              title: "\"The\" goes on the END",
              body:
                "Swedish has no separate word for \"the\" — it's a suffix glued to the noun, matching its gender:\n\n• en hund → hunden (the dog)\n• ett hus → huset (the house)\n\nSpot the -en/-et ending and you've found \"the\".",
              examples: [
                { target: "hunden är stor", en: "the dog is big" },
                { target: "huset är stort", en: "the house is big" },
              ],
            },
          ],
          vocab: [
            { target: "en hund", en: "a dog" },
            { target: "en katt", en: "a cat" },
            { target: "ett hus", en: "a house" },
            { target: "vatten", en: "water" },
            { target: "kaffe", en: "coffee" },
            { target: "bröd", en: "bread" },
            { target: "en vän", en: "a friend" },
            { target: "stor", en: "big" },
            { target: "liten", en: "small" },
            { target: "och", en: "and" },
            { target: "dricker", en: "drink(s)" },
            { target: "inte", en: "not" },
          ],
          sentences: [
            { target: "hunden är stor", en: "the dog is big" },
            { target: "jag dricker kaffe", en: "I drink coffee" },
            { target: "katten är liten", en: "the cat is small" },
            { target: "jag dricker inte kaffe", en: "I don't drink coffee" },
            { target: "du är en vän", en: "you are a friend" },
          ],
        },
      ],
    },
  ],
};
