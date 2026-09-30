import { XMLParser } from "fast-xml-parser";

const FEED_URL = "https://shrit.substack.com/feed";

export type SubstackPostMeta = {
  title: string;
  description: string;
  image?: string;
  link: string;
  pubDate?: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function slugFromPostLink(link: string): string | null {
  const part = link.split("/p/")[1];
  if (!part) return null;
  return part.split(/[?#]/)[0] ?? null;
}

async function fetchFeedItems(): Promise<Record<string, unknown>[]> {
  const res = await fetch(FEED_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ShritSite/1.0; +https://www.shrit.in)",
    },
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    attributeNamePrefix: "@_",
  });
  const doc = parser.parse(await res.text());
  const rawItems = doc?.rss?.channel?.item;
  return Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
}

function toMeta(item: Record<string, unknown>): SubstackPostMeta {
  const link = String(item?.link ?? "").trim();
  const title = String(item?.title ?? "Newsletter").trim();
  const descRaw = item?.description;
  const description =
    typeof descRaw === "string" ? stripHtml(descRaw).slice(0, 160) : "";

  const contentRaw = item?.encoded ?? item?.["content:encoded"] ?? "";
  const contentStr =
    typeof contentRaw === "string"
      ? contentRaw
      : typeof contentRaw === "object" && contentRaw !== null && "#text" in contentRaw
        ? String((contentRaw as { "#text": string })["#text"])
        : "";

  const imgMatch = contentStr.match(/src="([^"]+)"/);
  const enc = item?.enclosure;
  const enclosureUrl =
    typeof enc === "object" && enc !== null
      ? String((enc as { "@_url"?: string; url?: string })["@_url"] ?? (enc as { url?: string }).url ?? "")
      : "";

  const image = enclosureUrl || imgMatch?.[1] || undefined;
  const pubDate = typeof item?.pubDate === "string" ? item.pubDate : undefined;

  return { title, description, image, link, pubDate };
}

export async function getSubstackPosts(limit = 6): Promise<SubstackPostMeta[]> {
  try {
    return (await fetchFeedItems()).slice(0, limit).map(toMeta);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getSubstackPostBySlug(
  slug: string,
): Promise<SubstackPostMeta | null> {
  const items = await fetchFeedItems();
  const item = items.find(
    (i) => slugFromPostLink(String(i?.link ?? "").trim()) === slug,
  );
  return item ? toMeta(item) : null;
}

export type SubstackExcerpt = SubstackPostMeta & { excerpt: string };

/** Posts with the opening of each letter as plain text (used by Shrit TV's "on air" reading). */
export async function getSubstackExcerpts(limit = 6, chars = 900): Promise<SubstackExcerpt[]> {
  try {
    return (await fetchFeedItems()).slice(0, limit).map((item) => {
      const raw = item?.encoded ?? item?.["content:encoded"] ?? "";
      const html =
        typeof raw === "string"
          ? raw
          : typeof raw === "object" && raw !== null && "#text" in raw
            ? String((raw as { "#text": string })["#text"])
            : "";
      const text = html
        .replace(/<(figure|figcaption|img|picture|button)[\s\S]*?(<\/\1>|\/?>)/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&#8217;|&rsquo;/g, "’")
        .replace(/&#8220;|&#8221;|&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();
      return { ...toMeta(item), excerpt: text.slice(0, chars) };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}
