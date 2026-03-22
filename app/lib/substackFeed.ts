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

export async function getSubstackPostBySlug(
  slug: string,
): Promise<SubstackPostMeta | null> {
  const res = await fetch(FEED_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ShritSite/1.0; +https://www.shrit.in)",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const xmlText = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
    attributeNamePrefix: "@_",
  });
  const doc = parser.parse(xmlText);
  const rawItems = doc?.rss?.channel?.item;
  const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  for (const item of items) {
    const link = String(item?.link ?? "").trim();
    if (slugFromPostLink(link) !== slug) continue;

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

    const image = imgMatch?.[1] || enclosureUrl || undefined;
    const pubDate =
      typeof item?.pubDate === "string" ? item.pubDate : undefined;

    return { title, description, image, link, pubDate };
  }

  return null;
}
