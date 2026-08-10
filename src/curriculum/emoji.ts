// Maps an English meaning to an illustrative emoji for word cards. This keeps
// "pictures" fully offline (no image assets/network). Returns undefined when no
// good match exists, in which case the card shows a lettered tile instead.

const MAP: Record<string, string> = {
  // greetings / social
  hello: "👋", hi: "👋", goodbye: "👋", bye: "👋", "thank you": "🙏", thanks: "🙏",
  please: "🙏", yes: "✅", no: "❌", sorry: "😔", welcome: "🤗", friend: "🧑‍🤝‍🧑",
  // people / family
  man: "👨", woman: "👩", boy: "👦", girl: "👧", child: "🧒", baby: "👶",
  mother: "👩‍🍼", mom: "👩‍🍼", father: "👨", dad: "👨", parents: "👪", family: "👪",
  brother: "👦", sister: "👧", son: "👦", daughter: "👧", grandmother: "👵",
  grandfather: "👴", teacher: "🧑‍🏫", student: "🧑‍🎓", doctor: "🧑‍⚕️", people: "👥",
  // food / drink
  water: "💧", coffee: "☕", tea: "🍵", milk: "🥛", juice: "🧃", beer: "🍺",
  wine: "🍷", bread: "🍞", rice: "🍚", egg: "🥚", apple: "🍎", banana: "🍌",
  orange: "🍊", fish: "🐟", meat: "🥩", chicken: "🍗", soup: "🍲", cheese: "🧀",
  food: "🍽️", fruit: "🍓", vegetable: "🥦", sugar: "🍬", salt: "🧂", noodles: "🍜",
  // animals
  dog: "🐕", cat: "🐈", bird: "🐦", horse: "🐎", cow: "🐄", pig: "🐖", duck: "🦆",
  // home / places
  house: "🏠", home: "🏠", door: "🚪", window: "🪟", table: "🪑", chair: "🪑",
  bed: "🛏️", kitchen: "🍳", school: "🏫", city: "🏙️", town: "🏘️", street: "🛣️",
  store: "🏬", shop: "🏬", market: "🛒", restaurant: "🍴", hospital: "🏥",
  bank: "🏦", hotel: "🏨", station: "🚉", airport: "✈️", park: "🏞️", church: "⛪",
  // travel / transport
  car: "🚗", bus: "🚌", train: "🚆", plane: "✈️", bicycle: "🚲", boat: "⛵",
  ticket: "🎫", map: "🗺️", road: "🛣️", travel: "🧳", trip: "🧳",
  // time / nature
  sun: "☀️", moon: "🌙", star: "⭐", rain: "🌧️", snow: "❄️", cloud: "☁️",
  day: "📅", night: "🌃", morning: "🌅", today: "📆", time: "⏰", week: "🗓️",
  year: "📆", hour: "⏰", tree: "🌳", flower: "🌸", mountain: "⛰️", sea: "🌊",
  // body / health
  head: "🧠", hand: "✋", eye: "👁️", heart: "❤️", foot: "🦶", mouth: "👄",
  sick: "🤒", medicine: "💊", health: "💪",
  // verbs / actions
  eat: "🍽️", drink: "🥤", sleep: "😴", run: "🏃", walk: "🚶", read: "📖",
  write: "✍️", speak: "🗣️", talk: "🗣️", listen: "👂", see: "👀", look: "👀",
  buy: "🛍️", sell: "💰", work: "💼", play: "🎮", sing: "🎤", dance: "💃",
  study: "📚", learn: "🎓", drive: "🚗", cook: "🍳", love: "❤️", live: "🏠",
  // money / shopping
  money: "💵", price: "🏷️", cheap: "💸", expensive: "💎", card: "💳",
  // misc nouns
  book: "📖", phone: "📱", computer: "💻", music: "🎵", movie: "🎬", game: "🎮",
  job: "💼", language: "💬", word: "🔤", name: "🏷️", clothes: "👕", shoes: "👟",
  // colors
  red: "🔴", blue: "🔵", green: "🟢", yellow: "🟡", black: "⚫", white: "⚪",
  // numbers
  one: "1️⃣", two: "2️⃣", three: "3️⃣", four: "4️⃣", five: "5️⃣",
  six: "6️⃣", seven: "7️⃣", eight: "8️⃣", nine: "9️⃣", ten: "🔟",
};

function normalize(en: string): string {
  return en
    .toLowerCase()
    .replace(/^(the|a|an|to|i)\s+/i, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
}

export function emojiFor(en: string): string | undefined {
  const n = normalize(en);
  if (MAP[n]) return MAP[n];
  // try the first significant word
  const first = n.split(/\s+/)[0];
  if (first && MAP[first]) return MAP[first];
  // try the last word (e.g. "red apple" -> apple)
  const parts = n.split(/\s+/);
  const last = parts[parts.length - 1];
  if (last && MAP[last]) return MAP[last];
  return undefined;
}
