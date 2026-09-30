import { writeFile, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const key = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

export const DOODLE_PROMPT = `Redraw this exact photo as an MS Paint drawing, like someone drew it with a mouse in Microsoft Paint.
Keep the same composition, people, poses, objects and framing. Pure white canvas background.
Thin wobbly 1-3px black mouse lines, flat bright colors filled in with quick zig-zag scribbles that leave white gaps, simple cartoon faces (dot eyes, curved smile) that still hint at the people, stick-ish proportions, trees and grass as scribbled strokes, clouds and water as loose squiggles.
Naive, charming, imperfect, obviously hand-drawn with a mouse. No shading, no gradients, no crayon or pencil texture, no text, no signature, no border.`;

export const exists = (p) => access(p).then(() => true, () => false);

function requireKey() {
  if (!key) throw new Error("Missing OPENAI_KEY in .env");
}

/** Save base64 PNG from OpenAI as a resized web JPEG (macOS sips, no image deps). */
async function saveJpeg(b64, out, maxSize) {
  const png = out.replace(/\.jpg$/, ".png");
  await writeFile(png, Buffer.from(b64, "base64"));
  await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", "-Z", String(maxSize), png, "--out", out]);
  await run("rm", [png]);
}

export async function editImage({ image, prompt, out, maxSize = 1100, size = "auto" }) {
  requireKey();
  const form = new FormData();
  form.append("model", MODEL);
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", "medium");
  form.append("image", new Blob([image], { type: "image/jpeg" }), "photo.jpg");
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? String(res.status));
  await saveJpeg(json.data[0].b64_json, out, maxSize);
}

export async function generateImage({ prompt, out, size = "1536x1024", maxSize = 2400 }) {
  requireKey();
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, size, quality: "high" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? String(res.status));
  await saveJpeg(json.data[0].b64_json, out, maxSize);
}

/** Run `task` over `items` with a small worker pool, logging failures. */
export async function pool(items, task, size = 4) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) {
        const item = queue.shift();
        try {
          await task(item);
        } catch (e) {
          console.error("fail", e.message);
        }
      }
    }),
  );
}
