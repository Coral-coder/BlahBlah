import type { CourseBlueprint } from "@/curriculum/generate";

// Irish (Gaeilge) — a teaching course. Irish spelling looks impenetrable until
// you learn its (very regular) code, so EVERY item carries a pronunciation
// respelling in the reading field (shown under tiles, accepted as typed input).
// Grammar highlights taught in-flow: verb-first word order, no words for
// yes/no, tá vs is, lenition, and the famous "the language is AT me".
export const irishBlueprint: CourseBlueprint = {
  code: "ga",
  name: "Irish",
  endonym: "Gaeilge",
  flag: "🇮🇪",
  fromLanguage: "English",
  speechLocale: "ga-IE",
  sections: [
    {
      id: "ga-s1",
      title: "First steps",
      subtitle: "Greetings, the sound code, and real sentences",
      units: [
        {
          id: "ga-u1",
          title: "Dia dhuit!",
          subtitle: "Greetings & how Irish spelling works",
          cefr: "A1",
          color: "#169B62",
          icon: "☘️",
          teach: [
            {
              title: "The spelling looks wild — the code is regular",
              body:
                "Irish spelling seems impossible (\"bhfuil\"?!) but it's a consistent code:\n\n• bh / mh = \"v\" or \"w\" — bhean = \"van\"\n• ch = throaty \"kh\" as in loch\n• s before e/i = \"sh\" — sé = \"shay\"\n• dh / gh = breathy \"gh\" or \"y\"\n• fh = silent!\n\nEvery word here shows a pronunciation respelling — read that, and let the real spelling sink in over time.",
              examples: [
                { target: "dia dhuit", en: "hello (God to you)", pinyin: "DEE-a GWITCH" },
                { target: "slán", en: "goodbye", pinyin: "slawn" },
              ],
            },
            {
              title: "There's no word for yes (or no)",
              body:
                "Irish has no \"yes\" or \"no\". You answer by echoing the verb: \"Did you eat?\" → \"Ate\" (D'ith) or \"Didn't eat\" (Níor ith). For \"is it?\" questions you'll hear sea (\"it is\") — the closest thing to yes.",
              examples: [
                { target: "sea", en: "it is (≈ yes)", pinyin: "shah" },
                { target: "ní hea", en: "it isn't (≈ no)", pinyin: "nee hah" },
              ],
            },
          ],
          vocab: [
            { target: "dia dhuit", en: "hello", pinyin: "DEE-a GWITCH" },
            { target: "dia is muire dhuit", en: "hello (reply)", pinyin: "DEE-a iss MWIR-a GWITCH" },
            { target: "slán", en: "goodbye", pinyin: "slawn" },
            { target: "go raibh maith agat", en: "thank you", pinyin: "guh REV MAH a-gut" },
            { target: "le do thoil", en: "please", pinyin: "leh duh HULL" },
            { target: "fáilte", en: "welcome", pinyin: "FAWL-cheh" },
            { target: "sea", en: "it is (≈ yes)", pinyin: "shah" },
            { target: "ní hea", en: "it isn't (≈ no)", pinyin: "nee hah" },
            { target: "mé", en: "I; me", pinyin: "may" },
            { target: "tú", en: "you", pinyin: "too" },
            { target: "agus", en: "and", pinyin: "AH-gus" },
            { target: "oíche mhaith", en: "good night", pinyin: "EE-hah WAH" },
          ],
          sentences: [
            { target: "dia dhuit a chara", en: "hello, friend", pinyin: "DEE-a GWITCH a KHAR-a" },
            { target: "go raibh maith agat agus slán", en: "thank you and goodbye", pinyin: "guh REV MAH a-gut AH-gus slawn" },
            { target: "fáilte go héirinn", en: "welcome to Ireland", pinyin: "FAWL-cheh guh HAY-rin" },
          ],
        },
        {
          id: "ga-u2",
          title: "Tá mé…",
          subtitle: "Verb comes FIRST: saying how and where things are",
          cefr: "A1",
          color: "#FF883E",
          icon: "🍀",
          teach: [
            {
              title: "The verb goes FIRST",
              body:
                "Irish is Verb–Subject–Object: the verb leads every sentence. \"I am tired\" is Tá mé tuirseach — literally \"Am I tired\". It feels backwards for a week, then completely natural.",
              examples: [
                { target: "tá mé go maith", en: "I am well (am I well)", pinyin: "taw may guh MAH" },
                { target: "tá an madra mór", en: "the dog is big (is the dog big)", pinyin: "taw un MOD-ra more" },
              ],
            },
            {
              title: "tá vs is: two kinds of 'to be'",
              body:
                "tá describes states and places (tired, here, big). is declares identity (X is a Y):\n\n• Tá mé tuirseach — I'm tired (state)\n• Is múinteoir mé — I'm a teacher (identity)\n\nNotice is puts the noun before mé.",
              examples: [
                { target: "tá mé anseo", en: "I am here", pinyin: "taw may un-SHUH" },
                { target: "is cara mé", en: "I am a friend", pinyin: "iss KAH-ra may" },
              ],
            },
          ],
          vocab: [
            { target: "tá", en: "is/are (state)", pinyin: "taw" },
            { target: "níl", en: "is not", pinyin: "neel" },
            { target: "is", en: "is (identity)", pinyin: "iss" },
            { target: "fear", en: "man", pinyin: "far" },
            { target: "bean", en: "woman", pinyin: "ban" },
            { target: "páiste", en: "child", pinyin: "PAWSH-cheh" },
            { target: "cara", en: "friend", pinyin: "KAH-ra" },
            { target: "madra", en: "dog", pinyin: "MOD-ra" },
            { target: "cat", en: "cat", pinyin: "kot" },
            { target: "teach", en: "house", pinyin: "chakh" },
            { target: "mór", en: "big", pinyin: "more" },
            { target: "beag", en: "small", pinyin: "byug" },
            { target: "maith", en: "good", pinyin: "mah" },
            { target: "anseo", en: "here", pinyin: "un-SHUH" },
          ],
          sentences: [
            { target: "tá mé go maith", en: "I am well", pinyin: "taw may guh MAH" },
            { target: "tá an madra mór", en: "the dog is big", pinyin: "taw un MOD-ra more" },
            { target: "níl an cat anseo", en: "the cat is not here", pinyin: "neel un kot un-SHUH" },
            { target: "is cara mé", en: "I am a friend", pinyin: "iss KAH-ra may" },
            { target: "tá an teach beag", en: "the house is small", pinyin: "taw un chakh byug" },
          ],
        },
        {
          id: "ga-u3",
          title: "Mo mháthair",
          subtitle: "Family — and the famous softening (lenition)",
          cefr: "A1",
          color: "#009A49",
          icon: "👪",
          teach: [
            {
              title: "Words soften: lenition",
              body:
                "After little words like mo (my) and do (your), the next word's first consonant softens — in writing an h appears, and the sound changes:\n\n• máthair (MAW-hir) → mo mháthair (muh WAW-hir) — my mother\n• bean (ban) → an bhean (un VAN) — the woman\n\nThis 'mutation' is the heartbeat of Irish — hear it, don't memorize it.",
              examples: [
                { target: "mo mháthair", en: "my mother", pinyin: "muh WAW-hir" },
                { target: "an bhean", en: "the woman", pinyin: "un VAN" },
              ],
            },
          ],
          vocab: [
            { target: "athair", en: "father", pinyin: "AH-hir" },
            { target: "máthair", en: "mother", pinyin: "MAW-hir" },
            { target: "deartháir", en: "brother", pinyin: "DRAH-hawr" },
            { target: "deirfiúr", en: "sister", pinyin: "DREH-foor" },
            { target: "mac", en: "son", pinyin: "mok" },
            { target: "iníon", en: "daughter", pinyin: "in-EEN" },
            { target: "mo", en: "my", pinyin: "muh" },
            { target: "do", en: "your", pinyin: "duh" },
            { target: "clann", en: "family (children)", pinyin: "klahn" },
            { target: "seanmháthair", en: "grandmother", pinyin: "shan-WAW-hir" },
            { target: "grá", en: "love", pinyin: "graw" },
            { target: "croí", en: "heart", pinyin: "kree" },
          ],
          sentences: [
            { target: "tá mo mháthair anseo", en: "my mother is here", pinyin: "taw muh WAW-hir un-SHUH" },
            { target: "is é mo dheartháir é", en: "he is my brother", pinyin: "iss ay muh YRAH-hawr ay" },
            { target: "tá grá agam duit", en: "I love you", pinyin: "taw graw A-gum ditch" },
            { target: "mo chroí", en: "my heart (darling)", pinyin: "muh KHREE" },
          ],
        },
        {
          id: "ga-u4",
          title: "Tá Gaeilge agam",
          subtitle: "Food, drink — and having things 'at you'",
          cefr: "A1",
          color: "#0057B7",
          icon: "🫖",
          teach: [
            {
              title: "You don't have things — they're AT you",
              body:
                "Irish has no verb \"to have\". Things are at you: Tá leabhar agam = \"A book is at-me\" = I have a book. Even the language itself: Tá Gaeilge agam — \"Irish is at me\" — I speak Irish!\n\n• agam — at me\n• agat — at you\n• aige/aici — at him/her",
              examples: [
                { target: "tá tae agam", en: "I have tea", pinyin: "taw tay A-gum" },
                { target: "tá gaeilge agat", en: "you speak Irish", pinyin: "taw GWAYL-geh A-gut" },
              ],
            },
            {
              title: "Asking: an bhfuil…?",
              body:
                "Questions with tá use the form an bhfuil (\"un WILL\"): An bhfuil tae agat? — Do you have tea? Answer with the verb: Tá (I do) or Níl (I don't).",
              examples: [
                { target: "an bhfuil tú go maith", en: "are you well?", pinyin: "un WILL too guh MAH" },
              ],
            },
          ],
          vocab: [
            { target: "uisce", en: "water", pinyin: "ISH-keh" },
            { target: "tae", en: "tea", pinyin: "tay" },
            { target: "bainne", en: "milk", pinyin: "BON-yeh" },
            { target: "arán", en: "bread", pinyin: "a-RAWN" },
            { target: "leabhar", en: "book", pinyin: "LOW-er" },
            { target: "agam", en: "at me (I have)", pinyin: "A-gum" },
            { target: "agat", en: "at you (you have)", pinyin: "A-gut" },
            { target: "gaeilge", en: "Irish (language)", pinyin: "GWAYL-geh" },
            { target: "ólaim", en: "I drink", pinyin: "OHL-im" },
            { target: "ithim", en: "I eat", pinyin: "IH-him" },
            { target: "tuigim", en: "I understand", pinyin: "TIG-im" },
            { target: "ní thuigim", en: "I don't understand", pinyin: "nee HIG-im" },
            { target: "ba mhaith liom", en: "I would like", pinyin: "buh WAH lyum" },
            { target: "anois", en: "now", pinyin: "a-NISH" },
          ],
          sentences: [
            { target: "tá gaeilge agam", en: "I speak Irish", pinyin: "taw GWAYL-geh A-gum" },
            { target: "an bhfuil tae agat", en: "do you have tea?", pinyin: "un WILL tay A-gut" },
            { target: "ólaim tae le bainne", en: "I drink tea with milk", pinyin: "OHL-im tay leh BON-yeh" },
            { target: "ba mhaith liom uisce le do thoil", en: "I'd like water, please", pinyin: "buh WAH lyum ISH-keh leh duh HULL" },
            { target: "tuigim anois", en: "I understand now", pinyin: "TIG-im a-NISH" },
          ],
        },
      ],
    },
  ],
};
