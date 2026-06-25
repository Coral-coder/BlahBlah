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
  // French — ordered beginner→A2 grammar progression.
  fr: [
    {
      title: "Nouns have gender",
      body: "Every French noun is masculine (le) or feminine (la) — both mean \"the\". There's rarely a rule, so learn the article WITH the noun: not \"livre\" but \"le livre\".",
      examples: [
        { target: "le livre", en: "the book (m.)" },
        { target: "la table", en: "the table (f.)" },
      ],
    },
    {
      title: "a / an: un & une",
      body: "\"A/an\" is un for masculine nouns, une for feminine. Plurals use les (the) and des (some).",
      examples: [
        { target: "un homme", en: "a man" },
        { target: "une femme", en: "a woman" },
      ],
    },
    {
      title: "to be: être",
      body: "être (to be) is irregular and essential:\n\n• je suis, tu es, il/elle est\n• nous sommes, vous êtes, ils/elles sont",
      examples: [
        { target: "Je suis fatigué", en: "I am tired" },
        { target: "Nous sommes ici", en: "We are here" },
      ],
    },
    {
      title: "to have: avoir",
      body: "avoir (to have):\n\n• j'ai, tu as, il/elle a\n• nous avons, vous avez, ils/elles ont\n\nFrench uses avoir for age: J'ai vingt ans = \"I'm twenty\" (lit. I have twenty years).",
      examples: [
        { target: "J'ai faim", en: "I'm hungry (I have hunger)" },
        { target: "Tu as raison", en: "You're right" },
      ],
    },
    {
      title: "Present tense: -er verbs",
      body: "Most verbs end in -er. Drop -er and add: -e, -es, -e, -ons, -ez, -ent. The -e/-es/-ent endings are silent, so je parle, tu parles, ils parlent all sound the same.",
      examples: [
        { target: "je parle", en: "I speak" },
        { target: "nous parlons", en: "we speak" },
      ],
    },
    {
      title: "Saying no: ne … pas",
      body: "Negation wraps the verb in two parts: ne + verb + pas. In speech the ne is often dropped, but write both.",
      examples: [
        { target: "Je ne sais pas", en: "I don't know" },
        { target: "Il ne parle pas anglais", en: "He doesn't speak English" },
      ],
    },
    {
      title: "Asking questions",
      body: "Three ways, easy to hard: (1) just raise your intonation — Tu viens? (2) put Est-ce que in front — Est-ce que tu viens? (3) invert verb and subject — Viens-tu?",
      examples: [
        { target: "Est-ce que tu parles français ?", en: "Do you speak French?" },
        { target: "Où habites-tu ?", en: "Where do you live?" },
      ],
    },
    {
      title: "Adjectives agree — and usually follow",
      body: "Adjectives match the noun in gender/number (often add -e for feminine, -s for plural) and usually come AFTER the noun.",
      examples: [
        { target: "une voiture noire", en: "a black car" },
        { target: "des livres intéressants", en: "interesting books" },
      ],
    },
    {
      title: "tu vs vous",
      body: "tu is informal singular (friends, family, kids). vous is formal, and also plural for everyone. When unsure with an adult you don't know, use vous.",
      examples: [
        { target: "Comment vas-tu ?", en: "How are you? (informal)" },
        { target: "Comment allez-vous ?", en: "How are you? (formal/plural)" },
      ],
    },
    {
      title: "au, du: contractions",
      body: "à + le = au, à + les = aux, de + le = du, de + les = des. These contractions are required.",
      examples: [
        { target: "Je vais au marché", en: "I go to the market" },
        { target: "la porte du jardin", en: "the garden gate" },
      ],
    },
    {
      title: "The near future: aller + verb",
      body: "Say what's about to happen with aller (to go) + an infinitive — just like English \"going to\".",
      examples: [
        { target: "Je vais manger", en: "I'm going to eat" },
        { target: "On va voir", en: "We'll see" },
      ],
    },
    {
      title: "The past: passé composé",
      body: "Everyday past = avoir (or être for movement/change) + a past participle. -er verbs make their participle in -é.",
      examples: [
        { target: "J'ai mangé", en: "I ate" },
        { target: "Elle est partie", en: "She left" },
      ],
    },
  ],
  // Italian — ordered beginner→A2 grammar progression.
  it: [
    {
      title: "Gender & articles",
      body: "Nouns ending in -o are usually masculine (il), -a usually feminine (la). Learn the article with the noun. (il becomes lo before s+consonant or z, and l' before a vowel.)",
      examples: [
        { target: "il gatto", en: "the cat (m.)" },
        { target: "la casa", en: "the house (f.)" },
      ],
    },
    {
      title: "a / an: un, uno, una",
      body: "un for most masculine nouns, uno before s+consonant/z, una for feminine (un' before a feminine vowel).",
      examples: [
        { target: "un libro", en: "a book" },
        { target: "una mela", en: "an apple" },
      ],
    },
    {
      title: "to be: essere",
      body: "essere (to be):\n\n• io sono, tu sei, lui/lei è\n• noi siamo, voi siete, loro sono",
      examples: [
        { target: "Sono stanco", en: "I'm tired" },
        { target: "Siamo qui", en: "We're here" },
      ],
    },
    {
      title: "to have: avere",
      body: "avere (to have):\n\n• io ho, tu hai, lui/lei ha\n• noi abbiamo, voi avete, loro hanno\n\nThe h is silent. Italian uses avere for age: Ho vent'anni = \"I'm twenty\".",
      examples: [
        { target: "Ho fame", en: "I'm hungry (I have hunger)" },
        { target: "Hai ragione", en: "You're right" },
      ],
    },
    {
      title: "You can drop the subject",
      body: "The verb ending already shows who's doing it, so Italians usually omit io/tu/lui. \"Parlo italiano\" already means \"I speak Italian\".",
      examples: [
        { target: "Parlo italiano", en: "I speak Italian" },
        { target: "Dove abiti?", en: "Where do you live?" },
      ],
    },
    {
      title: "Present tense: -are verbs",
      body: "Drop -are and add: -o, -i, -a, -iamo, -ate, -ano. (parlare → parlo, parli, parla, parliamo, parlate, parlano.)",
      examples: [
        { target: "parlo", en: "I speak" },
        { target: "parliamo", en: "we speak" },
      ],
    },
    {
      title: "Saying no: non",
      body: "Just put non directly before the verb. Double negatives are normal and correct in Italian.",
      examples: [
        { target: "Non capisco", en: "I don't understand" },
        { target: "Non c'è niente", en: "There's nothing" },
      ],
    },
    {
      title: "Adjectives agree — and usually follow",
      body: "Adjectives match gender and number (-o/-a/-i/-e) and usually come after the noun.",
      examples: [
        { target: "una macchina rossa", en: "a red car" },
        { target: "i libri italiani", en: "the Italian books" },
      ],
    },
    {
      title: "there is / there are: c'è, ci sono",
      body: "c'è = there is (one thing), ci sono = there are (more than one).",
      examples: [
        { target: "C'è un problema", en: "There's a problem" },
        { target: "Ci sono molte persone", en: "There are many people" },
      ],
    },
    {
      title: "tu vs Lei",
      body: "tu is informal. For politeness with someone you don't know, use Lei (literally \"she\", capitalized) with the he/she verb form.",
      examples: [
        { target: "Come stai?", en: "How are you? (informal)" },
        { target: "Come sta?", en: "How are you? (formal)" },
      ],
    },
    {
      title: "The past: passato prossimo",
      body: "Everyday past = avere (or essere for movement/change) + past participle (-are → -ato). With essere, the participle agrees: lei è andata.",
      examples: [
        { target: "Ho mangiato", en: "I ate" },
        { target: "Siamo andati", en: "We went" },
      ],
    },
  ],
};

export function getTips(code: string): Tip[] {
  return TIPS[code] ?? [];
}
