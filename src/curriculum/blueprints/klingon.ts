import type { CourseBlueprint } from "@/curriculum/generate";

// A for-fun novelty course in Klingon (tlhIngan Hol, devised by Marc Okrand for
// Star Trek). Klingon grammar is OVS with heavy verb prefixes, so this sticks to
// a curated set of canon words and iconic attested phrases rather than inventing
// sentences. Learn it for honor, not for a job at the Klingon embassy. No neural
// voice (uses the system voice). Orthography is canonical: capitals matter
// (Q vs q, H, S, D, I) and ' is the glottal stop.
export const klingonBlueprint: CourseBlueprint = {
  code: "tlh",
  name: "Klingon",
  endonym: "tlhIngan Hol",
  flag: "🖖",
  fromLanguage: "English",
  sections: [
    {
      id: "tlh-s1",
      title: "Warrior's first words",
      subtitle: "Greetings and honor",
      units: [
        {
          id: "tlh-u1",
          title: "Hail, warrior",
          subtitle: "Greet a Klingon with honor",
          cefr: "A1",
          color: "#B71C1C",
          icon: "🖖",
          vocab: [
            { target: "tlhIngan", en: "Klingon" },
            { target: "Hol", en: "language" },
            { target: "jIH", en: "I / me" },
            { target: "SoH", en: "you" },
            { target: "ghaH", en: "he / she" },
            { target: "maj", en: "good" },
            { target: "Qapla'", en: "success" },
            { target: "batlh", en: "honor" },
            { target: "HIja'", en: "yes" },
            { target: "ghobe'", en: "no" },
            { target: "jup", en: "friend" },
            { target: "jagh", en: "enemy" },
            { target: "loD", en: "man" },
            { target: "be'", en: "woman" },
            { target: "puq", en: "child" },
          ],
          sentences: [
            { target: "nuqneH", en: "what do you want? (hello)" },
            { target: "Qapla'", en: "success! (farewell)" },
            { target: "tlhIngan maH", en: "we are Klingon!" },
            { target: "tlhIngan Hol", en: "the Klingon language" },
            { target: "jIyaj", en: "I understand" },
            { target: "jIyajbe'", en: "I do not understand" },
            { target: "jup jIH", en: "I am a friend" },
            { target: "batlh", en: "with honor" },
          ],
        },
        {
          id: "tlh-u2",
          title: "Battle & the stars",
          subtitle: "Ships, war and a good day to die",
          cefr: "A1",
          color: "#37474F",
          icon: "🚀",
          vocab: [
            { target: "Duj", en: "ship" },
            { target: "yuQ", en: "planet" },
            { target: "may'", en: "battle" },
            { target: "betleH", en: "bat'leth (sword)" },
            { target: "HIq", en: "ale" },
            { target: "tlhutlh", en: "to drink" },
            { target: "Sop", en: "to eat" },
            { target: "legh", en: "to see" },
            { target: "jatlh", en: "to speak" },
            { target: "yaj", en: "to understand" },
            { target: "Hegh", en: "to die" },
            { target: "ram", en: "night" },
            { target: "pawmoH", en: "to arrive" },
            { target: "targ", en: "targ (beast)" },
            { target: "nuq", en: "what" },
          ],
          sentences: [
            { target: "Heghlu'meH QaQ jajvam", en: "today is a good day to die" },
            { target: "maj ram", en: "good night" },
            { target: "HIq vItlhutlh", en: "I drink the ale" },
            { target: "Duj vIlegh", en: "I see the ship" },
            { target: "may' QaQ", en: "a good battle" },
            { target: "jagh", en: "the enemy" },
            { target: "betleH", en: "the bat'leth" },
            { target: "batlh maj", en: "honor is good" },
          ],
        },
      ],
    },
  ],
};
