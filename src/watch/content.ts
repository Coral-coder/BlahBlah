// Curated, public video content for immersion ("Watch", Muzzy-style). We link
// out to YouTube (search/channel URLs are stable) rather than embedding, so
// there's no third-party player dependency and links don't rot.

export interface WatchItem {
  title: string;
  source: string;
  emoji: string;
  blurb: string;
  url: string;
}

const yt = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const WATCH: Record<string, WatchItem[]> = {
  de: [
    { title: "Peppa Wutz", source: "YouTube", emoji: "🐷", blurb: "Peppa Pig in simple German — great for beginners.", url: yt("peppa wutz deutsch ganze folgen") },
    { title: "Easy German", source: "YouTube", emoji: "🗣️", blurb: "Real street interviews with German + subtitles.", url: yt("easy german") },
    { title: "Muzzy in Gondoland (German)", source: "YouTube", emoji: "🟢", blurb: "The classic BBC animated language course.", url: yt("muzzy in gondoland german") },
    { title: "Nico's Weg (DW)", source: "YouTube", emoji: "🎬", blurb: "Deutsche Welle's A1–B1 drama series for learners.", url: yt("nicos weg dw a1") },
  ],
  es: [
    { title: "Dreaming Spanish", source: "YouTube", emoji: "💭", blurb: "Comprehensible input — understandable from day one.", url: yt("dreaming spanish superbeginner") },
    { title: "Peppa Pig en Español", source: "YouTube", emoji: "🐷", blurb: "Simple, slow Spanish for beginners.", url: yt("peppa pig español capítulos") },
    { title: "Pocoyó", source: "YouTube", emoji: "🦖", blurb: "Gentle narration, perfect for new ears.", url: yt("pocoyo español") },
    { title: "Easy Spanish", source: "YouTube", emoji: "🗣️", blurb: "Street interviews with dual subtitles.", url: yt("easy spanish") },
  ],
  zh: [
    { title: "Comprehensible Chinese", source: "YouTube", emoji: "💭", blurb: "Beginner input with visuals — no English.", url: yt("comprehensible chinese beginner") },
    { title: "小猪佩奇 (Peppa Pig)", source: "YouTube", emoji: "🐷", blurb: "Peppa in Mandarin with characters on screen.", url: yt("小猪佩奇 中文") },
    { title: "Mandarin Corner", source: "YouTube", emoji: "🗣️", blurb: "Real conversations with pinyin + subtitles.", url: yt("mandarin corner beginner") },
    { title: "Pingu / 天线宝宝", source: "YouTube", emoji: "📺", blurb: "Slow kids' shows dubbed in Mandarin.", url: yt("天线宝宝 中文") },
  ],
  th: [
    { title: "Comprehensible Thai", source: "YouTube", emoji: "💭", blurb: "Understandable Thai input for beginners.", url: yt("comprehensible thai beginner") },
    { title: "Peppa Pig ภาษาไทย", source: "YouTube", emoji: "🐷", blurb: "Peppa Pig dubbed in Thai.", url: yt("peppa pig ภาษาไทย") },
    { title: "Learn Thai with Mod", source: "YouTube", emoji: "🗣️", blurb: "Friendly lessons and slow Thai.", url: yt("learn thai with mod") },
    { title: "Thai cartoons for kids", source: "YouTube", emoji: "📺", blurb: "Simple animated stories in Thai.", url: yt("การ์ตูน ภาษาไทย เด็ก") },
  ],
};

export function getWatch(code: string): WatchItem[] {
  return WATCH[code] ?? [];
}
