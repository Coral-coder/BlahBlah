// Bite-sized grammar notes per language. Short, high-value rules a beginner
// keeps tripping on. Shown in the Tips screen.

export interface Tip {
  title: string;
  body: string;
  examples?: { target: string; en: string }[];
}

const TIPS: Record<string, Tip[]> = {
  // German — an ordered grammar progression. Each note opens one of the early
  // units (in order), so the course teaches grammar step by step, not as a
  // side reference. Beginner → A2.
  de: [
    {
      title: "Every noun is capitalized",
      body: "Before anything else: in German ALL nouns are written with a capital letter, not just names. Hund (dog), Stadt (city), Liebe (love) — always uppercase. This actually helps you spot the nouns in a sentence.",
      examples: [
        { target: "der Hund", en: "the dog" },
        { target: "die Stadt", en: "the city" },
      ],
    },
    {
      title: "Three genders & their articles",
      body: "German nouns are der (masculine), die (feminine), or das (neuter) — all meaning \"the\". There's no reliable rule for which is which, so always learn the article TOGETHER with the noun: not \"Tisch\" but \"der Tisch\".",
      examples: [
        { target: "der Mann", en: "the man" },
        { target: "die Frau", en: "the woman" },
        { target: "das Kind", en: "the child" },
      ],
    },
    {
      title: "a / an: ein & eine",
      body: "\"A/an\" is ein for der- and das-words, and eine for die-words. So it mirrors the gender you learned with the noun.",
      examples: [
        { target: "ein Mann", en: "a man" },
        { target: "eine Frau", en: "a woman" },
        { target: "ein Kind", en: "a child" },
      ],
    },
    {
      title: "I am, you are: sein",
      body: "sein (to be) is irregular and everywhere — memorize it:\n\n• ich bin — I am\n• du bist — you are\n• er/sie/es ist — he/she/it is\n• wir sind — we are\n• ihr seid — you (plural) are\n• sie/Sie sind — they / you (formal) are",
      examples: [
        { target: "Ich bin müde", en: "I am tired" },
        { target: "Wir sind hier", en: "We are here" },
      ],
    },
    {
      title: "I have: haben",
      body: "The other essential verb, haben (to have):\n\n• ich habe, du hast, er/sie/es hat\n• wir haben, ihr habt, sie/Sie haben",
      examples: [
        { target: "Ich habe Zeit", en: "I have time" },
        { target: "Hast du Hunger?", en: "Are you hungry? (lit. have you hunger)" },
      ],
    },
    {
      title: "Present tense: regular verbs",
      body: "Take the stem (drop -en) and add the ending:\n\n• ich -e, du -st, er/sie/es -t\n• wir -en, ihr -t, sie/Sie -en\n\nGerman has no \"am ...-ing\": ich spiele means both \"I play\" and \"I am playing\".",
      examples: [
        { target: "ich spiele", en: "I play / I'm playing" },
        { target: "du spielst", en: "you play" },
        { target: "wir spielen", en: "we play" },
      ],
    },
    {
      title: "The verb goes second",
      body: "In a normal statement the conjugated verb is always the SECOND element — even when something else comes first, the verb stays in slot 2 and the subject moves after it.",
      examples: [
        { target: "Ich trinke heute Kaffee", en: "I drink coffee today" },
        { target: "Heute trinke ich Kaffee", en: "Today drink I coffee" },
      ],
    },
    {
      title: "Asking questions",
      body: "Yes/no questions: put the verb FIRST. Information questions: start with a question word (wer who, was what, wo where, wann when, warum why, wie how), then the verb.",
      examples: [
        { target: "Trinkst du Kaffee?", en: "Do you drink coffee?" },
        { target: "Wo wohnst du?", en: "Where do you live?" },
      ],
    },
    {
      title: "Saying no: nicht & kein",
      body: "Use nicht to negate a verb or whole idea. Use kein/keine to say \"no / not a\" before a noun (it's the negative of ein).",
      examples: [
        { target: "Ich verstehe nicht", en: "I don't understand" },
        { target: "Ich habe keine Zeit", en: "I have no time" },
      ],
    },
    {
      title: "The accusative case",
      body: "When a der-word is the direct object (the thing being acted on), der → den and ein → einen. Feminine, neuter and plural articles don't change. This is why \"the man\" can be der Mann OR den Mann.",
      examples: [
        { target: "Der Mann ist hier", en: "The man is here (subject)" },
        { target: "Ich sehe den Mann", en: "I see the man (object)" },
      ],
    },
    {
      title: "Possessives: mein, dein…",
      body: "mein (my), dein (your), sein (his), ihr (her), unser (our), euer (your pl.), ihr/Ihr (their/your formal). They take the same endings as ein/eine.",
      examples: [
        { target: "mein Bruder", en: "my brother" },
        { target: "meine Schwester", en: "my sister" },
      ],
    },
    {
      title: "Modal verbs send the action to the end",
      body: "With können (can), wollen (want), müssen (must), the modal is conjugated in slot 2 and the OTHER verb goes to the very end in its plain -en form.",
      examples: [
        { target: "Ich kann Deutsch sprechen", en: "I can speak German" },
        { target: "Wir müssen jetzt gehen", en: "We must go now" },
      ],
    },
    {
      title: "Separable verbs",
      body: "Many verbs have a prefix that detaches and jumps to the end of the sentence: aufstehen (to get up) → ich stehe um sieben auf. Look for that stranded prefix at the end!",
      examples: [
        { target: "Ich stehe früh auf", en: "I get up early" },
        { target: "Der Zug kommt an", en: "The train arrives" },
      ],
    },
    {
      title: "The dative case",
      body: "The indirect object (the receiver) takes the dative: der/das → dem, die → der, plural → den (+n). It also follows mit, zu, von, bei, aus, nach.",
      examples: [
        { target: "Ich gebe dem Kind den Ball", en: "I give the child the ball" },
        { target: "Ich fahre mit dem Bus", en: "I go by bus" },
      ],
    },
    {
      title: "Subordinate clauses send the verb to the end",
      body: "After weil (because), dass (that), wenn (if/when), ob (whether), the conjugated verb moves to the very end of that clause.",
      examples: [
        { target: "Ich bleibe, weil es regnet", en: "I'm staying because it's raining" },
        { target: "Ich weiß, dass du Recht hast", en: "I know that you're right" },
      ],
    },
    {
      title: "Talking about the past: the perfect",
      body: "Everyday past = haben (or sein for motion) + a past participle at the end. Many participles look like ge-…-t (regular) or ge-…-en (strong).",
      examples: [
        { target: "Ich habe Kaffee getrunken", en: "I drank coffee" },
        { target: "Wir sind nach Berlin gefahren", en: "We went to Berlin" },
      ],
    },
  ],
  es: [
    {
      title: "ser vs estar",
      body: "Both mean 'to be'. Use ser for identity/permanent traits, estar for location and temporary states/feelings.",
      examples: [
        { target: "Soy alto", en: "I am tall (trait)" },
        { target: "Estoy cansado", en: "I am tired (state)" },
      ],
    },
    {
      title: "Nouns have gender",
      body: "Most -o words are masculine (el), most -a words feminine (la). Adjectives must agree.",
      examples: [
        { target: "el gato negro", en: "the black cat" },
        { target: "la casa blanca", en: "the white house" },
      ],
    },
    {
      title: "Upside-down ¿ and ¡",
      body: "Questions and exclamations open with an inverted mark: ¿…? and ¡…!",
      examples: [{ target: "¿Cómo estás?", en: "How are you?" }],
    },
    {
      title: "You usually drop the subject",
      body: "The verb ending already shows who's doing it, so 'yo', 'tú' etc. are often omitted.",
      examples: [{ target: "Hablo español", en: "I speak Spanish" }],
    },
  ],
  zh: [
    {
      title: "The four tones",
      body: "Mandarin is tonal — the same syllable means different things by pitch. mā (mother), má (hemp), mǎ (horse), mà (scold).",
    },
    {
      title: "Measure words",
      body: "Counting needs a measure word between number and noun. The general one is 个 (gè).",
      examples: [
        { target: "三个人", en: "three people (sān gè rén)" },
        { target: "一本书", en: "one book (yì běn shū)" },
      ],
    },
    {
      title: "No verb conjugation",
      body: "Verbs never change form. Time is shown with words like 了 (le), 昨天 (yesterday), 明天 (tomorrow).",
      examples: [{ target: "我吃了", en: "I ate (wǒ chī le)" }],
    },
    {
      title: "Questions with 吗",
      body: "Turn a statement into a yes/no question by adding 吗 (ma) at the end.",
      examples: [{ target: "你好吗？", en: "How are you? (nǐ hǎo ma)" }],
    },
  ],
  th: [
    {
      title: "Politeness particles",
      body: "End sentences with ครับ (men) or ค่ะ (women) to sound polite. Use them generously.",
      examples: [{ target: "สวัสดี ครับ", en: "Hello (polite, male)" }],
    },
    {
      title: "Five tones",
      body: "Thai has mid, low, falling, high, and rising tones. The same letters change meaning with tone — listen closely and copy.",
    },
    {
      title: "No spaces, no plurals",
      body: "Written Thai has no spaces between words, and nouns don't change for plural. Context (and number words) tells you how many.",
    },
    {
      title: "Adjectives come after the noun",
      body: "Unlike English, the describing word follows the noun.",
      examples: [{ target: "บ้าน ใหญ่", en: "big house (lit. house big)" }],
    },
  ],
  is: [
    {
      title: "Three genders",
      body: "Icelandic nouns are masculine, feminine, or neuter, and the article is tacked on the END of the word.",
      examples: [
        { target: "hundur → hundurinn", en: "a dog → the dog" },
      ],
    },
    {
      title: "Four cases",
      body: "Nouns change form for nominative, accusative, dative and genitive. Learn nouns in context to absorb the patterns.",
    },
    {
      title: "Special letters",
      body: "þ sounds like 'th' in 'thing'; ð like 'th' in 'this'; æ like 'eye'; ö like German ö.",
      examples: [{ target: "þú", en: "you (thoo)" }],
    },
  ],
};

export function getTips(code: string): Tip[] {
  return TIPS[code] ?? [];
}
