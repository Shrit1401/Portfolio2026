// Gets a fresh Spotify refresh token for the now-playing widget.
// 1. In the Spotify developer dashboard, add this Redirect URI to your app: http://127.0.0.1:8888/callback
// 2. Run: npm run spotify:auth   (then open the printed link and approve)
// The new token is written to .env.local; copy it to Vercel as SPOTIFY_REFRESH_TOKEN.
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";

const id = process.env.SPOTIFY_CLIENT_ID ?? process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET ?? process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
if (!id || !secret) throw new Error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first");

const REDIRECT = "http://127.0.0.1:8888/callback";
const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({
    client_id: id,
    response_type: "code",
    redirect_uri: REDIRECT,
    scope: "user-read-currently-playing user-read-playback-state",
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") return res.end();
  const code = url.searchParams.get("code");
  if (!code) return res.end(`Spotify said: ${url.searchParams.get("error")}`);

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT }),
  });
  const json = await tokenRes.json();
  if (!json.refresh_token) {
    res.end(`Failed: ${JSON.stringify(json)}`);
    return server.close();
  }

  const envPath = ".env.local";
  const current = await readFile(envPath, "utf8").catch(() => "");
  const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(current)
    ? current.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, `SPOTIFY_REFRESH_TOKEN=${json.refresh_token}`)
    : `${current.trimEnd()}\nSPOTIFY_REFRESH_TOKEN=${json.refresh_token}\n`;
  await writeFile(envPath, next);

  res.end("Done! You can close this tab. The new refresh token is in .env.local.");
  console.log("\nSaved the new SPOTIFY_REFRESH_TOKEN to .env.local. Put the same value on Vercel.");
  server.close();
});

server.listen(8888, "127.0.0.1", () => {
  console.log("Open this link and approve:\n\n" + authUrl + "\n");
});
