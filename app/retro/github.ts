// Public repos for Shrit TV's GITHUB channel (no token needed; cached with the page).
import { GITHUB_URL } from "../lib/links";

export type Repo = { name: string; description: string; language: string; stars: number; pushed: string; url: string };

const USER = GITHUB_URL.split("/").pop() ?? "shrit1401";

export async function getRepos(limit = 60): Promise<Repo[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    return rows
      .filter((r) => !r.fork)
      .slice(0, limit)
      .map((r) => ({
        name: String(r.name),
        description: String(r.description ?? ""),
        language: String(r.language ?? "—"),
        stars: Number(r.stargazers_count ?? 0),
        pushed: String(r.pushed_at ?? "").slice(0, 10),
        url: String(r.html_url),
      }));
  } catch {
    return [];
  }
}
