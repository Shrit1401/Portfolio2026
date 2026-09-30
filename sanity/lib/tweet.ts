/** Pulls the numeric id out of an x.com / twitter.com status URL. */
export function tweetIdFromUrl(url: string | undefined): string | null {
  return url?.match(/(?:twitter|x)\.com\/[^/]+\/status(?:es)?\/(\d+)/)?.[1] ?? null;
}
