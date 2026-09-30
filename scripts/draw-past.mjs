// Doodle versions of every image on the Past timeline (Sanity + local fallback).
// Writes public/past/drawings/*.jpg and app/lib/pastDrawings.json ({ "<date>|<title>": "/past/drawings/x.jpg" }).
// Run: npm run draw:past  (re-run after adding timeline events; existing drawings are skipped)
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { DOODLE_PROMPT, editImage, exists, pool } from "./lib/openai-image.mjs";

const root = process.cwd();
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

const query = `*[_id == "pastLifeTimeline"][0].chapters[].events[]{date, title, "url": coalesce(image.asset->url, imageUrl)}`;
const res = await fetch(
  `https://${projectId}.apicdn.sanity.io/v2025-05-27/data/query/${dataset}?query=${encodeURIComponent(query)}`,
);
const events = ((await res.json()).result ?? []).filter((e) => e?.url && e.title);

const mapPath = path.join(root, "app/lib/pastDrawings.json");
const map = JSON.parse(await readFile(mapPath, "utf8").catch(() => "{}"));

await pool(events, async (ev) => {
  const key = `${ev.date?.trim() ?? ""}|${ev.title.trim()}`;
  const name = createHash("sha1").update(ev.url).digest("hex").slice(0, 12);
  const rel = `/past/drawings/${name}.jpg`;
  const out = path.join(root, "public", rel);
  if (!(await exists(out))) {
    const src = ev.url.startsWith("/") ? await readFile(path.join(root, "public", ev.url)) : Buffer.from(await (await fetch(`${ev.url}?w=1200&fm=jpg`)).arrayBuffer());
    await editImage({ image: src, prompt: DOODLE_PROMPT, out });
    console.log("drew", key);
  }
  map[key] = rel;
});

await writeFile(mapPath, JSON.stringify(map, null, 2) + "\n");
console.log(Object.keys(map).length, "drawings mapped");
