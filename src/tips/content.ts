// Bite-sized grammar notes per language. Short, high-value rules a beginner
// keeps tripping on. Shown in the Tips screen.

export interface Tip {
  title: string;
  body: string;
  examples?: { target: string; en: string }[];
}

const TIPS: Record<string, Tip[]> = {
  de: [
    {
      title: "Three genders & their articles",
      body: "German nouns are der (masculine), die (feminine), or das (neuter). Always learn the article WITH the noun — there's no reliable shortcut.",
      examples: [
        { target: "der Mann", en: "the man" },
        { target: "die Frau", en: "the woman" },
        { target: "das Kind", en: "the child" },
      ],
    },
    {
      title: "Verb goes second",
      body: "In a normal statement the conjugated verb is always the 2nd element — even if something else comes first.",
      examples: [
        { target: "Ich trinke heute Kaffee", en: "I drink coffee today" },
        { target: "Heute trinke ich Kaffee", en: "Today I drink coffee" },
      ],
    },
    {
      title: "The accusative case",
      body: "The direct object changes 'der' → 'den' (masculine only). Feminine/neuter/plural stay the same.",
      examples: [{ target: "Ich sehe den Mann", en: "I see the man" }],
    },
    {
      title: "Capitalize every noun",
      body: "All nouns are capitalized in German, not just names. Hund, Stadt, Liebe — always uppercase.",
    },
    {
      title: "Subordinate clauses kick the verb to the end",
      body: "After weil, dass, wenn… the verb jumps to the end of the clause.",
      examples: [{ target: "Ich bleibe, weil es regnet", en: "I'm staying because it's raining" }],
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
