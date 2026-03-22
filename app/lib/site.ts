/** Canonical site origin, no trailing slash (use for sitemap, canonicals, string concat). */
export function getSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shrit.in";
  return raw.replace(/\/+$/, "");
}

/** For Next.js `metadataBase` and absolute URL resolution. */
export function getSiteOriginUrl(): URL {
  return new URL(`${getSiteBaseUrl()}/`);
}
