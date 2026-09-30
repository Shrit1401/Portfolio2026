const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Deployed env uses the NEXT_PUBLIC_ names; plain SPOTIFY_* also work (and stay server-only).
const env = (name: string) =>
  process.env[`SPOTIFY_${name}`] ?? process.env[`NEXT_PUBLIC_SPOTIFY_${name}`];

export type NowPlaying = {
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
  albumImageUrl: string;
  albumName: string;
};

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
  album: { name: string; images: { url: string }[] };
};

async function getAccessToken(): Promise<string | null> {
  const clientId = env("CLIENT_ID");
  const clientSecret = env("CLIENT_SECRET");
  const refreshToken = env("REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return ((await res.json()) as { access_token: string }).access_token;
}

/** What's playing on Spotify right now, or null (nothing playing / not configured / error). */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const res = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 204 || !res.ok) return null;

    const data = (await res.json()) as { is_playing: boolean; item: SpotifyTrack | null };
    // item is null for podcasts/ads.
    if (!data.item) return null;
    const { item } = data;
    return {
      artist: item.artists.map((a) => a.name).join(", "),
      isPlaying: data.is_playing,
      songUrl: item.external_urls.spotify,
      title: item.name,
      albumImageUrl: item.album.images[0]?.url ?? "",
      albumName: item.album.name,
    };
  } catch (e) {
    console.error("spotify now-playing:", e);
    return null;
  }
}
