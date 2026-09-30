// Turns every photo in app/lib/photos.json into a hand-drawn doodle via OpenAI.
// Skips photos whose drawing already exists. Run: npm run draw
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DOODLE_PROMPT, editImage, exists, pool } from "./lib/openai-image.mjs";

const root = process.cwd();
const photos = JSON.parse(await readFile(path.join(root, "app/lib/photos.json"), "utf8"));

await pool(photos, async (photo) => {
  const out = path.join(root, "public", photo.drawing);
  if (await exists(out)) return console.log("skip", photo.id);
  const image = await readFile(path.join(root, "public", photo.src));
  await editImage({ image, prompt: DOODLE_PROMPT, out });
  console.log("drew", photo.id);
});
