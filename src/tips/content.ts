// Bite-sized grammar notes per language. Short, high-value rules a beginner
// keeps tripping on. Shown in the Tips screen.

export interface Tip {
  title: string;
  body: string;
  examples?: { target: string; en: string; pinyin?: string }[];
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
  // Spanish — ordered beginner→A2 grammar progression.
  es: [
    {
      title: "Nouns have gender",
      body: "Most nouns ending in -o are masculine (el), most ending in -a are feminine (la) — both mean \"the\". Learn the article with the noun.",
      examples: [
        { target: "el gato", en: "the cat (m.)" },
        { target: "la casa", en: "the house (f.)" },
      ],
    },
    {
      title: "a / an: un & una",
      body: "un for masculine nouns, una for feminine. Plurals: los/las (the) and unos/unas (some).",
      examples: [
        { target: "un libro", en: "a book" },
        { target: "una mesa", en: "a table" },
      ],
    },
    {
      title: "to be: ser",
      body: "ser (to be) for identity and traits:\n\n• yo soy, tú eres, él/ella es\n• nosotros somos, vosotros sois, ellos son",
      examples: [
        { target: "Soy estudiante", en: "I am a student" },
        { target: "Somos amigos", en: "We are friends" },
      ],
    },
    {
      title: "ser vs estar",
      body: "Both mean \"to be\". Use ser for identity/permanent traits; use estar for location and temporary states/feelings.",
      examples: [
        { target: "Soy alto", en: "I am tall (trait)" },
        { target: "Estoy cansado", en: "I am tired (state)" },
      ],
    },
    {
      title: "to have: tener",
      body: "tener (to have): tengo, tienes, tiene, tenemos, tenéis, tienen. Spanish uses it for age: Tengo veinte años = \"I'm twenty\".",
      examples: [
        { target: "Tengo hambre", en: "I'm hungry (I have hunger)" },
        { target: "¿Tienes tiempo?", en: "Do you have time?" },
      ],
    },
    {
      title: "Present tense: -ar verbs",
      body: "Drop -ar and add: -o, -as, -a, -amos, -áis, -an. (hablar → hablo, hablas, habla, hablamos, habláis, hablan.)",
      examples: [
        { target: "hablo", en: "I speak" },
        { target: "hablamos", en: "we speak" },
      ],
    },
    {
      title: "You usually drop the subject",
      body: "The verb ending already shows who's doing it, so yo, tú, él are usually left out. \"Hablo español\" already means \"I speak Spanish\".",
      examples: [{ target: "Hablo español", en: "I speak Spanish" }],
    },
    {
      title: "Saying no",
      body: "Just put no before the verb. Double negatives are normal: No tengo nada = \"I don't have anything\".",
      examples: [
        { target: "No entiendo", en: "I don't understand" },
        { target: "No hay problema", en: "No problem" },
      ],
    },
    {
      title: "Questions: ¿ … ? and ¡ … !",
      body: "Questions and exclamations open with an inverted mark: ¿…? and ¡…!. Word order can stay the same — intonation (and the marks) do the work.",
      examples: [
        { target: "¿Cómo estás?", en: "How are you?" },
        { target: "¿Hablas inglés?", en: "Do you speak English?" },
      ],
    },
    {
      title: "Adjectives agree — and usually follow",
      body: "Adjectives match the noun in gender and number, and usually come AFTER it.",
      examples: [
        { target: "el gato negro", en: "the black cat" },
        { target: "las casas blancas", en: "the white houses" },
      ],
    },
    {
      title: "tú vs usted",
      body: "tú is informal. usted is formal (and takes the he/she verb form). Use usted with strangers and elders to be respectful.",
      examples: [
        { target: "¿Cómo estás?", en: "How are you? (informal)" },
        { target: "¿Cómo está usted?", en: "How are you? (formal)" },
      ],
    },
    {
      title: "The near future: ir a + verb",
      body: "Say what's about to happen with ir (to go) + a + infinitive — like English \"going to\". voy, vas, va, vamos, vais, van.",
      examples: [
        { target: "Voy a comer", en: "I'm going to eat" },
        { target: "Vamos a ver", en: "We'll see" },
      ],
    },
    {
      title: "me gusta works backwards",
      body: "\"To like\" is built like \"is pleasing to me\": me gusta + singular, me gustan + plural. The thing liked is the subject.",
      examples: [
        { target: "Me gusta el café", en: "I like coffee" },
        { target: "Me gustan los gatos", en: "I like cats" },
      ],
    },
  ],
  // Chinese — ordered beginner progression (script/tones taught in unit 1).
  zh: [
    {
      title: "The four tones",
      body: "Mandarin is tonal — the same syllable means different things by pitch:\n\n• mā (high & flat) — mother\n• má (rising) — hemp\n• mǎ (dip then rise) — horse\n• mà (sharp fall) — scold\n\nAlways learn a word WITH its tone; copy the audio, not the letters.",
      examples: [
        { target: "妈", en: "mother (mā)" },
        { target: "马", en: "horse (mǎ)" },
      ],
    },
    {
      title: "Word order is like English",
      body: "Mandarin is Subject–Verb–Object, so simple sentences map straight across: 我爱你 = I love you, word for word. No conjugation, no gender, no plurals.",
      examples: [
        { target: "我 爱 你", en: "I love you (wǒ ài nǐ)" },
        { target: "我 喝 茶", en: "I drink tea (wǒ hē chá)" },
      ],
    },
    {
      title: "No verb conjugation",
      body: "Verbs never change form — 吃 (chī, eat) is the same for I/you/she, past or future. Time comes from context words: 了 (le, completed), 昨天 (yesterday), 明天 (tomorrow).",
      examples: [
        { target: "我 吃 了", en: "I ate (wǒ chī le)" },
        { target: "明天 我 去", en: "tomorrow I go (míngtiān wǒ qù)" },
      ],
    },
    {
      title: "Questions with 吗",
      body: "Turn any statement into a yes/no question by adding 吗 (ma) at the end. No word-order change.",
      examples: [
        { target: "你 喝 茶 吗", en: "Do you drink tea? (nǐ hē chá ma)" },
      ],
    },
    {
      title: "Measure words",
      body: "Counting needs a measure word between the number and the noun — like \"two SHEETS of paper\" for everything. The all-purpose one is 个 (gè); books use 本 (běn).",
      examples: [
        { target: "三 个 人", en: "three people (sān gè rén)" },
        { target: "一 本 书", en: "one book (yì běn shū)" },
      ],
    },
    {
      title: "的 makes possession",
      body: "Add 的 (de) after a person to say \"'s\": 我的 = my/mine, 你的 = your. It also links descriptions to nouns.",
      examples: [
        { target: "我 的 朋友", en: "my friend (wǒ de péngyou)" },
        { target: "你 的 书", en: "your book (nǐ de shū)" },
      ],
    },
    {
      title: "Negation: 不 and 没",
      body: "不 (bù) negates most verbs; 没 (méi) negates 有 (have) and completed actions. 我不喝 = I don't drink; 我没有 = I don't have.",
      examples: [
        { target: "我 不 喝 咖啡", en: "I don't drink coffee (wǒ bù hē kāfēi)" },
        { target: "我 没有 时间", en: "I don't have time (wǒ méiyǒu shíjiān)" },
      ],
    },
  ],
  // Thai — ordered beginner progression (script/tones taught in unit 1).
  th: [
    {
      title: "Politeness particles",
      body: "End sentences with ครับ (khráp, men) or ค่ะ (khâ, women) to sound polite — Thais use them constantly, and they soften everything you say. When in doubt, add it.",
      examples: [
        { target: "สวัสดี ครับ", en: "hello (male speaker)" },
        { target: "ขอบคุณ ค่ะ", en: "thank you (female speaker)" },
      ],
    },
    {
      title: "Five tones",
      body: "Thai has five tones: mid, low, falling, high, rising. The romanization marks them (à low, â falling, á high, ǎ rising, plain mid). The same sounds with different tones are different words — mǎa (dog) vs máa (horse). Copy the audio closely.",
      examples: [
        { target: "หมา", en: "dog (mǎa — rising)" },
        { target: "ม้า", en: "horse (máa — high)" },
      ],
    },
    {
      title: "No conjugation, no plurals",
      body: "Verbs never change and nouns have no plural form. Time comes from context words: จะ (jà) = will, แล้ว (láew) = already. กิน (gin, eat) works for everyone, any time.",
      examples: [
        { target: "ฉัน จะ ไป", en: "I will go (chǎn jà bpai)" },
        { target: "กิน แล้ว", en: "(I) ate already (gin láew)" },
      ],
    },
    {
      title: "Adjectives follow the noun",
      body: "The describing word comes AFTER the noun — \"house big\", not \"big house\". There's also no \"is\" before adjectives: บ้านใหญ่ already means \"the house is big\".",
      examples: [
        { target: "บ้าน ใหญ่", en: "big house (bâan yài)" },
        { target: "อาหาร อร่อย", en: "the food is delicious (aa-hǎan à-ròi)" },
      ],
    },
    {
      title: "Questions with ไหม",
      body: "Add ไหม (mái) to the end of a statement to make it a yes/no question. Answer by repeating the verb (yes) or ไม่ + verb (no) — Thai has no single word for yes/no.",
      examples: [
        { target: "อร่อย ไหม", en: "is it tasty? (à-ròi mái)" },
        { target: "ไม่ อร่อย", en: "not tasty (mâi à-ròi)" },
      ],
    },
    {
      title: "I and you (politely)",
      body: "ผม (phǒm) = I for men; ฉัน (chǎn) = I for women; คุณ (khun) = you (polite, works for everyone). Thais often drop pronouns entirely once context is clear.",
      examples: [
        { target: "ผม ชื่อ จอห์น", en: "my name is John (male)" },
        { target: "คุณ ชื่อ อะไร", en: "what's your name?" },
      ],
    },
  ],
  // Icelandic — ordered beginner progression.
  is: [
    {
      title: "Special letters",
      body: "Icelandic keeps two letters English lost: þ (thorn) sounds like 'th' in 'thing'; ð (eth) like 'th' in 'this'. Also æ = 'eye' and ö like German ö. Once you know these, spelling is quite regular.",
      examples: [
        { target: "þú", en: "you ('thoo')" },
        { target: "það", en: "it / that ('thath')" },
      ],
    },
    {
      title: "to be: að vera",
      body: "The essential irregular verb:\n\n• ég er — I am\n• þú ert — you are\n• hann/hún er — he/she is\n• við erum — we are\n• þið eruð — you (pl.) are\n• þeir/þær eru — they are",
      examples: [
        { target: "Ég er þreyttur", en: "I am tired" },
        { target: "Við erum hér", en: "We are here" },
      ],
    },
    {
      title: "The article goes on the END",
      body: "Icelandic has no word for \"a\" — hundur is \"a dog\" by itself. \"The\" is a suffix glued onto the noun: hundur → hundurinn, hús → húsið.",
      examples: [
        { target: "hundur → hundurinn", en: "a dog → the dog" },
        { target: "hús → húsið", en: "a house → the house" },
      ],
    },
    {
      title: "Three genders",
      body: "Nouns are masculine, feminine or neuter, and adjectives agree. Typical endings: -ur masculine (hestur), -a feminine (kona), neuter often bare (barn). Learn each noun with its gender.",
      examples: [
        { target: "hestur", en: "horse (m.)" },
        { target: "kona", en: "woman (f.)" },
        { target: "barn", en: "child (n.)" },
      ],
    },
    {
      title: "Four cases",
      body: "Nouns change form for their role: nominative (subject), accusative (object), dative (receiver / after certain prepositions), genitive (possession). Don't memorize tables first — meet nouns in sentences and the patterns start to stick.",
      examples: [
        { target: "Ég sé hundinn", en: "I see the dog (accusative)" },
        { target: "Ég gef hundinum mat", en: "I give the dog food (dative)" },
      ],
    },
    {
      title: "Verb second, like German",
      body: "In statements the conjugated verb sits in second position, even when something else comes first.",
      examples: [
        { target: "Ég tala íslensku", en: "I speak Icelandic" },
        { target: "Núna tala ég íslensku", en: "Now speak I Icelandic" },
      ],
    },
    {
      title: "Asking questions",
      body: "Yes/no questions put the verb first: Talar þú íslensku? Question words: hvað (what), hver (who), hvar (where), hvenær (when), af hverju (why).",
      examples: [
        { target: "Talar þú ensku?", en: "Do you speak English?" },
        { target: "Hvar er hótelið?", en: "Where is the hotel?" },
      ],
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
  // Japanese — beginner grammar progression (after the script intro in unit 1).
  ja: [
    {
      title: "Word order: verb goes last",
      body: "Japanese is Subject–Object–Verb: the verb comes at the END. \"I drink tea\" is literally \"I tea drink\".",
      examples: [
        { target: "わたし は おちゃ を のむ", en: "I drink tea (I tea drink)", pinyin: "watashi wa ocha o nomu" },
      ],
    },
    {
      title: "Particles mark each word's job",
      body: "Tiny words AFTER a noun show its role: は (wa) marks the topic, を (o) marks the object, が (ga) marks the subject. They're like little labels, so word order is flexible.",
      examples: [
        { target: "わたし は", en: "as for me… (topic)", pinyin: "watashi wa" },
        { target: "みず を", en: "water (object)", pinyin: "mizu o" },
      ],
    },
    {
      title: "です and ‑masu = polite",
      body: "End a sentence with です (desu, \"is/are\") or a verb in the ‑masu form to sound polite — the everyday register for strangers. のむ (nomu) → のみます (nomimasu).",
      examples: [
        { target: "がくせい です", en: "(I) am a student", pinyin: "gakusei desu" },
        { target: "みず を のみます", en: "(I) drink water", pinyin: "mizu o nomimasu" },
      ],
    },
    {
      title: "No articles, no plurals",
      body: "There's no a/the, and nouns don't change for plural — ねこ (neko) is \"cat\" or \"cats\" depending on context. The subject is also often dropped when it's obvious.",
      examples: [{ target: "ねこ です", en: "it's a cat / they're cats", pinyin: "neko desu" }],
    },
    {
      title: "Asking: just add か",
      body: "Turn any statement into a question by adding か (ka) at the end — no word-order change, no question mark needed.",
      examples: [
        { target: "がくせい です か", en: "Are you a student?", pinyin: "gakusei desu ka" },
        { target: "みず を のみます か", en: "Do you drink water?", pinyin: "mizu o nomimasu ka" },
      ],
    },
  ],
};

export function getTips(code: string): Tip[] {
  return TIPS[code] ?? [];
}

// Russian — ordered beginner progression (Cyrillic taught in unit 1).
TIPS.ru = [
  {
    title: "No 'a', no 'the'",
    body: "Russian has no articles at all. дом means \"house\", \"a house\" and \"the house\" — context does the work. One less thing to learn.",
    examples: [{ target: "это дом", en: "this is a/the house (eto dom)" }],
  },
  {
    title: "\"To be\" disappears",
    body: "In the present tense Russian drops \"am/is/are\" entirely. Я студент = \"I (am a) student\". Just put the words next to each other.",
    examples: [
      { target: "я студент", en: "I am a student (ya studyent)" },
      { target: "он друг", en: "he is a friend (on drug)" },
    ],
  },
  {
    title: "Three genders",
    body: "Nouns are masculine, feminine or neuter — and the ending usually tells you: consonant = masculine (дом), -а/-я = feminine (вода), -о/-е = neuter (окно).",
    examples: [
      { target: "дом", en: "house (m.)" },
      { target: "вода", en: "water (f.)" },
      { target: "окно", en: "window (n.)" },
    ],
  },
  {
    title: "Verbs: the -ть family",
    body: "Infinitives end in -ть. Present tense endings for знать (to know): я знаю, ты знаешь, он знает, мы знаем, вы знаете, они знают.",
    examples: [
      { target: "я знаю", en: "I know (ya znayu)" },
      { target: "ты знаешь", en: "you know (ty znayesh)" },
    ],
  },
  {
    title: "Saying no: не",
    body: "Put не directly before the word you're negating. Double negatives are required, not wrong: Я ничего не знаю = \"I don't know anything\".",
    examples: [
      { target: "я не знаю", en: "I don't know (ya nye znayu)" },
      { target: "это не дом", en: "this is not a house" },
    ],
  },
  {
    title: "Questions by intonation",
    body: "Yes/no questions keep the same word order — just raise your voice at the end. Question words: что (what), кто (who), где (where), когда (when), почему (why).",
    examples: [
      { target: "ты студент?", en: "are you a student? (ty studyent?)" },
      { target: "где дом?", en: "where is the house? (gdye dom?)" },
    ],
  },
  {
    title: "Cases: the big idea",
    body: "Russian nouns change endings for their role in the sentence (6 cases). Start by noticing the accusative: feminine -а becomes -у — я люблю воду (I love water). Meet cases in sentences; don't memorize tables first.",
    examples: [
      { target: "я люблю воду", en: "I love water (vodu ← voda)" },
    ],
  },
  {
    title: "ты vs вы",
    body: "ты is informal (friends, family); вы is formal AND plural — like French tu/vous. With strangers and elders, use вы: Как вы?",
    examples: [
      { target: "как ты?", en: "how are you? (informal)" },
      { target: "как вы?", en: "how are you? (formal)" },
    ],
  },
];

// Irish — ordered beginner progression (sound code + core grammar taught in units).
TIPS.ga = [
  {
    title: "Crack the spelling code",
    body: "Irish spelling is a consistent code, not chaos:\n\n• bh/mh = \"v\" or \"w\" (an bhean = un VAN)\n• ch = throaty \"kh\" (loch)\n• s before e or i = \"sh\" (Seán = SHAWN)\n• fh = completely silent\n• aoi = \"ee\", ao = \"ay/ee\"\n\nEvery word in this course shows a pronunciation respelling until you don't need it.",
    examples: [
      { target: "bhfuil", en: "(is) — sounds like 'will'", pinyin: "will" },
      { target: "oíche", en: "night", pinyin: "EE-hah" },
    ],
  },
  {
    title: "Verb first, always",
    body: "Irish is Verb–Subject–Object. The verb opens the sentence: Tá mé anseo = \"Am I here\" = I am here. Ólaim tae = \"Drink-I tea\".",
    examples: [
      { target: "tá mé anseo", en: "I am here", pinyin: "taw may un-SHUH" },
      { target: "ólaim tae", en: "I drink tea", pinyin: "OHL-im tay" },
    ],
  },
  {
    title: "No yes. No no.",
    body: "Irish has no words for yes/no. Echo the verb instead: An bhfuil tú tuirseach? (Are you tired?) → Tá (am) or Níl (am not). This is why Irish English says \"I am, sure\" instead of \"yes\".",
    examples: [
      { target: "tá", en: "(yes,) I am / it is", pinyin: "taw" },
      { target: "níl", en: "(no,) I'm not / it isn't", pinyin: "neel" },
    ],
  },
  {
    title: "tá vs is",
    body: "Two verbs 'to be': tá for states, feelings and places; is for identity (X is a Y). Tá mé fuar = I'm cold. Is múinteoir mé = I'm a teacher.",
    examples: [
      { target: "tá mé fuar", en: "I am cold", pinyin: "taw may FOO-ar" },
      { target: "is múinteoir mé", en: "I am a teacher", pinyin: "iss MOON-chore may" },
    ],
  },
  {
    title: "Lenition: words go soft",
    body: "After mo (my), do (your), and many little words, the next consonant softens — an h appears in writing and the sound changes: cara → mo chara (KHAR-a), bean → an bhean (VAN). Listen for it; it becomes second nature.",
    examples: [
      { target: "mo chara", en: "my friend", pinyin: "muh KHAR-a" },
      { target: "an bhean", en: "the woman", pinyin: "un VAN" },
    ],
  },
  {
    title: "Things are AT you",
    body: "No verb 'to have': things are at you. Tá leabhar agam = \"A book is at-me\" = I have a book. And famously: Tá Gaeilge agam = \"Irish is at me\" = I speak Irish.",
    examples: [
      { target: "tá leabhar agam", en: "I have a book", pinyin: "taw LOW-er A-gum" },
      { target: "tá gaeilge agam", en: "I speak Irish", pinyin: "taw GWAYL-geh A-gum" },
    ],
  },
  {
    title: "Negation with ní",
    body: "Put ní before the verb to negate (it lenites the verb): Tuigim (I understand) → Ní thuigim (I don't understand — the t goes silent: nee HIG-im).",
    examples: [
      { target: "ní thuigim", en: "I don't understand", pinyin: "nee HIG-im" },
      { target: "níl mé tuirseach", en: "I'm not tired", pinyin: "neel may TIR-shukh" },
    ],
  },
  {
    title: "Questions with an",
    body: "Yes/no questions start with an (+ a changed verb form): An bhfuil tú go maith? = Are you well? Question words: cad (what), cé (who), cá (where), cathain (when), cén fáth (why).",
    examples: [
      { target: "an bhfuil tú go maith", en: "are you well?", pinyin: "un WILL too guh MAH" },
      { target: "cad é sin", en: "what is that?", pinyin: "kod ay shin" },
    ],
  },
];
