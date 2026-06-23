// One news/RSS source per language. These are fetched live on-device. Feeds can
// be swapped freely; the reader degrades gracefully if one is unavailable.
export interface Feed {
  name: string;
  url: string;
  site: string;
}

const FEEDS: Record<string, Feed> = {
  de: { name: "Deutsche Welle", url: "https://rss.dw.com/xml/rss-de-all", site: "https://www.dw.com/de" },
  es: { name: "BBC Mundo", url: "https://feeds.bbci.co.uk/mundo/rss.xml", site: "https://www.bbc.com/mundo" },
  zh: { name: "BBC 中文", url: "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml", site: "https://www.bbc.com/zhongwen/simp" },
  th: { name: "BBC ไทย", url: "https://feeds.bbci.co.uk/thai/rss.xml", site: "https://www.bbc.com/thai" },
};

export function getFeed(code: string): Feed | undefined {
  return FEEDS[code];
}

export interface NewsItem {
  title: string;
  link: string;
  description: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, " ")
    .trim();
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeEntities(m[1]) : "";
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];
  for (const b of blocks) {
    const title = pick(b, "title");
    let link = pick(b, "link");
    if (!link) {
      const href = b.match(/<link[^>]*href="([^"]+)"/i);
      link = href ? href[1] : pick(b, "guid");
    }
    if (title) items.push({ title, link, description: pick(b, "description") });
  }
  return items;
}

export async function fetchNews(code: string): Promise<NewsItem[]> {
  const feed = getFeed(code);
  if (!feed) return [];
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(feed.url, { signal: ctrl.signal });
    const xml = await res.text();
    return parseRss(xml).slice(0, 25);
  } finally {
    clearTimeout(t);
  }
}
