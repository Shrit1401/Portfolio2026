// Shrit TV's "announcer": a pool of odd late-night TV copy written by OpenAI.
// Runs only on the server while the page (re)builds, never per visitor; each
// visitor's TV shuffles through the pool on its own. Falls back to canned copy.

export type HostCopy = {
  bumpers: string[];
  headlines: string[];
  ads: { product: string; pitch: string }[];
};

const FALLBACK: HostCopy = {
  bumpers: [
    "You're watching Shrit TV. Please do not adjust your set. Actually, adjust it. Press the buttons.",
    "Coming up next: a guy who loves creating things, creating things.",
    "This broadcast is powered by one laptop and zero sleep.",
    "If you can hear this, the static is working as intended.",
    "Stay tuned. Or don't. The knob is right there.",
    "Shrit TV. Broadcasting from a college hostel since whenever.",
  ],
  headlines: [
    "LOCAL DEVELOPER SHIPS THING, IMMEDIATELY STARTS NEXT THING",
    "SCIENTISTS CONFIRM: THE NEWSLETTER IS, IN FACT, WEEKLY",
    "HACKATHON JUDGES STILL RECOVERING",
    "LAPTOP FAN REACHES CRUISING ALTITUDE",
  ],
  ads: [
    { product: "THE WEEKLY LETTER", pitch: "Trauma dumping, delivered. Every week. No refunds." },
    { product: "SHIPPING, ON VIDEO", pitch: "Watch a man build things in real time. Now in color." },
    { product: "HEYTAPPR", pitch: "A voice assistant that lives inside your product. Just talk to it." },
  ],
};

// Bump when the prompt changes so a warm server doesn't keep serving old copy.
const PROMPT_VERSION = 2;
type Cache = { at: number; version: number; copy: HostCopy };
const TTL = 60 * 60 * 1000;
const g = globalThis as typeof globalThis & { __shritTvHost?: Cache };

export async function getHostCopy(context: string): Promise<HostCopy> {
  const key = process.env.OPENAI_KEY ?? process.env.OPENAI_API_KEY;
  if (!key) return FALLBACK;
  const cached = g.__shritTvHost;
  if (cached && cached.version === PROMPT_VERSION && Date.now() - cached.at < TTL) return cached.copy;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.95,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write copy for SHRIT TV, a fake 1990s late-night public-access channel that lives on Shrit's personal site. Tone: deadpan, warm, a little absurd, with a childlike Studio Ghibli / MS Paint / Saturday-morning-cartoon sense of wonder. Rules: every line must name something real and specific from the context (a repo, a post, a vlog, a letter, a life moment, a film he loves). Exaggerate for comedy, but never invent hobbies, events or achievements that aren't in the context. Affectionate, never mocking or self-deprecating about his talent. No emojis.",
          },
          {
            role: "user",
            content: `Context about Shrit:\n${context}\n\nReturn JSON: {"bumpers": [14 announcer lines to be read aloud, under 22 words each], "headlines": [8 ALL CAPS absurd breaking-news headlines about Shrit, under 11 words], "ads": [5 fake commercials {"product": short ALL CAPS name tied to his real stuff, "pitch": one line under 16 words}]}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Partial<HostCopy>;
    const copy: HostCopy = {
      bumpers: clean(parsed.bumpers, FALLBACK.bumpers),
      headlines: clean(parsed.headlines, FALLBACK.headlines),
      ads: Array.isArray(parsed.ads)
        ? parsed.ads.filter((a) => a?.product && a?.pitch).slice(0, 6)
        : FALLBACK.ads,
    };
    if (!copy.ads.length) copy.ads = FALLBACK.ads;
    g.__shritTvHost = { at: Date.now(), version: PROMPT_VERSION, copy };
    return copy;
  } catch (e) {
    console.error("shrit tv host:", e);
    return FALLBACK;
  }
}

function clean(list: unknown, fallback: string[]): string[] {
  const out = Array.isArray(list) ? list.filter((s): s is string => typeof s === "string" && s.trim().length > 0) : [];
  return out.length ? out.slice(0, 16) : fallback;
}
