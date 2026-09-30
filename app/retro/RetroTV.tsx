"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { formatDate } from "../lib/format";
import { youtubeUrl, type YouTubeVideo } from "../lib/youtube";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, SUBSTACK_URL, TWITTER_URL, YOUTUBE_URL } from "../lib/links";
import { createTvAudio, hush, speak, type TvAudio } from "./audio";
import type { HostCopy } from "./host";
import type { Repo } from "./github";

type Entry = { href: string; title: string; description?: string; date?: string };
type Letter = { href: string; title: string; date?: string; excerpt: string; image?: string };
type Shot = { id: string; img: string; caption: string; meta?: string };
export type LifeEvent = { chapter: string; date: string; title: string; story: string; img?: string };

type Channel =
  | { kind: "guide" }
  | { kind: "video"; video: YouTubeVideo }
  | { kind: "letter"; letter: Letter }
  | { kind: "gallery" }
  | { kind: "cam" }
  | { kind: "ad" }
  | { kind: "news" }
  | { kind: "bars" }
  | { kind: "github" }
  | { kind: "life" }
  | { kind: "dreams" }
  | { kind: "screensaver" };

const POSES = ["hi", "happy", "hairflip", "thinking", "shook", "unimpressed", "stressed", "laughing", "peace", "heart"];
/** A still from the /photos inspiration board, shown on the late-night lo-fi channel. */
type Dream = { src: string; line: string };

const STATIC_MS = 380;
const POWER_OFF_MS = 520;

const rand = (n: number) => Math.floor(Math.random() * n);
const pickOne = <T,>(list: T[]) => list[rand(list.length)];
function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function channelName(c: Channel): string {
  switch (c.kind) {
    case "guide":
      return "GUIDE";
    case "video":
      return "VIDEO";
    case "letter":
      return "LETTERS";
    case "gallery":
      return "GALLERY";
    case "cam":
      return "LIVE CAM";
    case "ad":
      return "ADS";
    case "news":
      return "NEWS";
    case "bars":
      return "STAND BY";
    case "github":
      return "GITHUB";
    case "life":
      return "CARTOONS";
    case "dreams":
      return "DREAMS";
    case "screensaver":
      return "IDLE";
  }
}

/** Full-screen analogue noise, drawn small and scaled up so the grain stays chunky. */
function Static({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = ctx.createImageData(canvas.width, canvas.height);
    let raf = 0;
    const draw = () => {
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <canvas
      ref={ref}
      width={160}
      height={120}
      aria-hidden
      className={`retro-static pointer-events-none absolute inset-0 z-30 h-full w-full ${active ? "opacity-100" : "opacity-0"}`}
    />
  );
}

function useClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", " "));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Cycles through a list on a timer (slideshows, the live cam). */
function useCycle(length: number, ms: number) {
  const [i, setI] = useState(() => rand(Math.max(length, 1)));
  useEffect(() => {
    if (length < 2) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [length, ms]);
  return i;
}

/* ------------------------------------------------------------------ */
/* Channels                                                            */
/* ------------------------------------------------------------------ */

function VideoChannel({ video, muted }: { video: YouTubeVideo; muted: boolean }) {
  // A random point in, like flicking onto a show mid-episode.
  const [start] = useState(() => 20 + rand(160));
  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    controls: "0",
    rel: "0",
    playsinline: "1",
    modestbranding: "1",
    iv_load_policy: "3",
    disablekb: "1",
    start: String(start),
  });
  return (
    <div className="absolute inset-0 bg-black">
      <iframe
        key={muted ? "m" : "s"}
        src={`https://www.youtube-nocookie.com/embed/${video.id}?${params}`}
        title={video.title}
        allow="autoplay; encrypted-media; picture-in-picture"
        className="retro-video pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 border-0"
      />
      <div className="retro-lower-third absolute inset-x-4 bottom-5 z-10 sm:inset-x-8 sm:bottom-8">
        <p className="text-[var(--crt-dim)]">NOW SHOWING</p>
        <p className="retro-glow text-[26px] leading-tight sm:text-[32px]">{video.title}</p>
        <a
          href={youtubeUrl(video.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="retro-link pointer-events-auto mt-1 inline-block"
        >
          WATCH ON YOUTUBE ↗
        </a>
      </div>
    </div>
  );
}

function LetterChannel({ letter }: { letter: Letter }) {
  return (
    <div className="retro-teletext absolute inset-0 overflow-hidden px-5 pb-6 pt-16 sm:px-10">
      <div className="mb-4 flex items-center justify-between bg-[var(--tt-cyan)] px-2 text-[#001018]">
        <span>P104 LETTERS</span>
        <span>ON AIR ●</span>
      </div>
      <p className="text-[var(--tt-yellow)]">{formatDate(letter.date).toUpperCase()}</p>
      <h2 className="text-[34px] leading-[1.05] text-white sm:text-[44px]">{letter.title}</h2>
      <div className="relative mt-4 h-[45%] overflow-hidden sm:h-[52%]">
        <p className="retro-crawl text-[22px] leading-snug text-[var(--tt-green)]">{letter.excerpt}…</p>
      </div>
      <a href={letter.href} target="_blank" rel="noopener noreferrer" className="retro-link mt-4 inline-block">
        READ THE WHOLE LETTER ↗
      </a>
    </div>
  );
}

function GalleryChannel({ gallery }: { gallery: Shot[] }) {
  const i = useCycle(gallery.length, 3800);
  const shot = gallery[i];
  const next = gallery[(i + 1) % gallery.length];
  if (!shot) return null;
  return (
    <div className="absolute inset-0 bg-black">
      <img key={shot.id} src={shot.img} alt={shot.caption} className="retro-img retro-kenburns absolute inset-0 h-full w-full object-cover" />
      {/* Warm the next slide so the cut is instant. */}
      {next && <link rel="preload" as="image" href={next.img} />}
      <div className="retro-lower-third absolute inset-x-4 bottom-5 z-10 sm:inset-x-8 sm:bottom-8">
        <p className="text-[var(--crt-dim)]">GALLERY OF THINGS</p>
        <p className="retro-glow text-[26px] leading-tight sm:text-[30px]">{shot.caption}</p>
        {shot.meta && <p className="text-[var(--crt-dim)]">{shot.meta}</p>}
      </div>
    </div>
  );
}

function CamChannel({ clock }: { clock: string | null }) {
  const i = useCycle(POSES.length, 3200);
  return (
    <div className="absolute inset-0 bg-black">
      <img key={POSES[i]} src={`/me/${POSES[i]}.gif`} alt="Shrit, live" className="retro-cam absolute inset-0 h-full w-full object-cover" />
      <div className="absolute left-5 top-14 z-10 flex items-center gap-2 text-[24px] sm:left-8">
        <span className="retro-blink text-[#ff4040]">●</span>
        <span className="retro-glow">REC</span>
      </div>
      <div className="retro-glow absolute bottom-5 left-5 z-10 text-[22px] sm:bottom-8 sm:left-8">
        CAM 2 · SHRIT&apos;S ROOM · {clock}
      </div>
    </div>
  );
}

function AdChannel({ ad }: { ad: HostCopy["ads"][number] }) {
  const [pose] = useState(() => pickOne(POSES));
  return (
    <div className="retro-ad absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="retro-blink text-[20px] tracking-[0.3em]">★ COMMERCIAL BREAK ★</p>
      <img src={`/me/${pose}.jpg`} alt="" className="h-28 w-28 rounded-full border-4 border-[#ffe14d] object-cover sm:h-36 sm:w-36" />
      <h2 className="retro-ad-title text-[44px] leading-none sm:text-[64px]">{ad.product}</h2>
      <p className="max-w-[28ch] text-[24px] leading-snug sm:text-[28px]">{ad.pitch}</p>
      <p className="text-[18px] opacity-80">OPERATORS ARE STANDING BY · shrit.substack.com</p>
    </div>
  );
}

function NewsChannel({ headline, ticker }: { headline: string; ticker: string[] }) {
  return (
    <div className="retro-news absolute inset-0 flex flex-col justify-end">
      <div className="flex-1" />
      <div className="px-5 pb-3 sm:px-8">
        <span className="retro-blink bg-[#e11d2a] px-2 text-[26px] text-white">BREAKING</span>
        <h2 className="mt-2 text-[34px] leading-[1.05] text-white sm:text-[48px]">{headline}</h2>
      </div>
      <div className="overflow-hidden whitespace-nowrap bg-[#ffe14d] py-1 text-[22px] text-[#111]">
        <div className="retro-ticker inline-block">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="mx-6">
              ◆ {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarsChannel() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="retro-bars flex-[7]" />
      <div className="retro-bars-low flex-[1]" />
      <div className="absolute inset-0 grid place-items-center">
        <p className="bg-black/80 px-4 py-1 text-[28px] tracking-[0.2em] text-white">PLEASE STAND BY</p>
      </div>
    </div>
  );
}

/**
 * Saturday morning cartoons: the /past timeline as MS Paint doodles, narrated in Shrit's own words.
 * Starts at a random chapter so nobody sees the same episode twice.
 */
function LifeChannel({ life, say }: { life: LifeEvent[]; say: (text: string, opts?: { caption?: boolean }) => number }) {
  const [i, setI] = useState(() => rand(life.length));
  const ev = life[i];

  useEffect(() => {
    if (!ev) return;
    const ms = say(`${i === 0 ? "Previously, on Shrit. " : ""}${ev.date}. ${ev.title}. ${ev.story}`, { caption: false });
    const id = window.setTimeout(() => setI((x) => (x + 1) % life.length), ms + 900);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  if (!ev) return null;
  const next = life[(i + 1) % life.length];
  return (
    <div className="retro-paper absolute inset-0 flex flex-col items-center gap-2 px-4 pb-4 pt-12 sm:gap-3 sm:px-10 sm:pb-8 sm:pt-16">
      <p className="retro-paper-ink w-full truncate text-center text-[15px] tracking-[0.18em] sm:text-[19px]">
        CARTOONS · {ev.chapter.toUpperCase()}
      </p>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        {ev.img && (
          <img key={ev.img} src={ev.img} alt={ev.title} className="retro-doodle max-h-full max-w-[92%] rounded-md object-contain" />
        )}
      </div>
      {next?.img && <link rel="preload" as="image" href={next.img} />}
      <div className="w-full shrink-0 text-center">
        <p className="retro-paper-ink text-[16px] sm:text-[18px]">{ev.date}</p>
        <h2 className="retro-paper-title text-[30px] leading-none sm:text-[50px]">{ev.title}</h2>
        <p className="retro-paper-ink mx-auto mt-1.5 line-clamp-3 max-w-[46ch] text-[17px] leading-snug sm:text-[20px]">{ev.story}</p>
      </div>
    </div>
  );
}

function DreamsChannel({ dreams }: { dreams: Dream[] }) {
  const i = useCycle(dreams.length, 5200);
  const d = dreams[i];
  return (
    <div className="absolute inset-0 bg-black">
      <img key={d.src} src={d.src} alt={d.line} className="retro-dream absolute inset-0 h-full w-full object-cover" />
      <link rel="preload" as="image" href={dreams[(i + 1) % dreams.length].src} />
      <div className="absolute inset-x-0 bottom-6 z-10 text-center sm:bottom-9">
        <p className="text-[18px] tracking-[0.3em] text-white/70">THINGS THAT MADE ME · LO-FI</p>
        <p className="text-[30px] leading-tight text-white sm:text-[38px]" style={{ textShadow: "0 0 12px rgba(0,0,0,0.9)" }}>
          {d.line}
        </p>
      </div>
    </div>
  );
}

function GithubChannel({ repos }: { repos: Repo[] }) {
  const hackathons = repos.filter((r) => /hack/i.test(r.name)).length;
  return (
    <div data-lenis-prevent className="retro-terminal retro-scroll absolute inset-0 overflow-y-auto px-5 pb-10 pt-16 sm:px-10">
      <p className="text-[var(--crt-dim)]">shrit@tv:~$ ls ~/github --sort=recent</p>
      <p className="retro-glow mt-1">
        {repos.length} repos · {hackathons}+ hackathon builds · 0 regrets
      </p>
      <ul className="mt-4 space-y-2">
        {repos.map((r, i) => (
          <li key={r.name} className="retro-type" style={{ animationDelay: `${Math.min(i, 24) * 70}ms` }}>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="retro-row group block">
              <span className="text-[var(--crt-dim)]">{r.pushed} </span>
              <span className="retro-glow group-hover:underline">{r.name}</span>
              <span className="text-[var(--crt-dim)]"> [{r.language}]{r.stars ? ` ★${r.stars}` : ""}</span>
              {r.description && <span className="block pl-4 text-[var(--crt-ink)]/80">↳ {r.description}</span>}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[var(--crt-dim)]">
        shrit@tv:~$ <span className="retro-cursor">█</span>
      </p>
    </div>
  );
}

/** The DVD logo. Changes colour on every wall hit; the corner hit is left to fate. */
function ScreensaverChannel() {
  const box = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const [hue, setHue] = useState(() => rand(360));
  const [pose] = useState(() => pickOne(POSES));

  useEffect(() => {
    const el = logo.current;
    const area = box.current;
    if (!el || !area) return;
    let x = rand(100);
    let y = rand(100);
    let dx = 1.6;
    let dy = 1.2;
    let raf = 0;
    const step = () => {
      const maxX = area.clientWidth - el.offsetWidth;
      const maxY = area.clientHeight - el.offsetHeight;
      x += dx;
      y += dy;
      if (x <= 0 || x >= maxX) {
        dx = -dx;
        x = Math.max(0, Math.min(x, maxX));
        setHue((h) => (h + 70 + rand(80)) % 360);
      }
      if (y <= 0 || y >= maxY) {
        dy = -dy;
        y = Math.max(0, Math.min(y, maxY));
        setHue((h) => (h + 70 + rand(80)) % 360);
      }
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-black">
      <div ref={logo} className="absolute left-0 top-0 flex items-center gap-3 will-change-transform" style={{ color: `hsl(${hue} 90% 65%)` }}>
        <img src={`/me/${pose}.gif`} alt="" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" style={{ boxShadow: `0 0 0 3px hsl(${hue} 90% 65%)` }} />
        <span className="text-[40px] leading-none sm:text-[52px]" style={{ textShadow: `0 0 14px hsl(${hue} 90% 55%)` }}>
          SHRIT
          <span className="block text-[18px] tracking-[0.35em]">TV · IDLE</span>
        </span>
      </div>
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="retro-glow mb-4 text-[34px] leading-none sm:text-[42px]">{children}</h2>;
}

function GuideChannel({
  story,
  posts,
  letters,
  lineup,
  onTune,
  idle,
}: {
  story: string[];
  posts: Entry[];
  letters: Letter[];
  lineup: Channel[];
  onTune: (i: number) => void;
  idle: () => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Left alone, the guide drifts up and down on its own, like a cable listings channel.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dir = 1;
    let pos = el.scrollTop;
    let raf = 0;
    const step = () => {
      if (idle()) {
        const max = el.scrollHeight - el.clientHeight;
        pos += dir * 0.6;
        if (pos >= max || pos <= 0) {
          dir = -dir;
          pos = Math.max(0, Math.min(pos, max));
        }
        el.scrollTop = pos;
      } else {
        pos = el.scrollTop;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [idle]);

  return (
    <div ref={ref} data-lenis-prevent className="retro-scroll absolute inset-0 overflow-y-auto overscroll-contain px-5 pb-10 pt-16 sm:px-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <img src="/me/hi.gif" alt="Shrit waving" className="retro-img w-32 shrink-0 rounded-md sm:w-40" />
        <div>
          <h1 className="retro-glow text-[44px] leading-[0.95] sm:text-[60px]">SHRIT TV</h1>
          <p className="text-[var(--crt-dim)]">tonight&apos;s lineup. click anything to tune in.</p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
        {lineup.map((c, i) =>
          c.kind === "guide" ? null : (
            <li key={i}>
              <button type="button" onClick={() => onTune(i)} className="retro-row group flex w-full gap-3 text-left">
                <span className="text-[var(--crt-dim)]">CH{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate group-hover:underline">
                  {c.kind === "video" ? c.video.title : c.kind === "letter" ? c.letter.title : channelName(c)}
                </span>
              </button>
            </li>
          ),
        )}
      </ul>

      <Divider />
      <Heading>ABOUT</Heading>
      <div className="retro-copy max-w-[62ch] space-y-4">
        {story.map((html, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
        ))}
      </div>

      <Divider />
      <Heading>POSTS</Heading>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="retro-row group block">
              <span className="text-[var(--crt-dim)]">{formatDate(p.date).toUpperCase()}</span>
              <span className="retro-glow block text-[24px] leading-tight group-hover:underline">{p.title}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Divider />
      <Heading>LETTERS</Heading>
      <ol className="space-y-1.5">
        {letters.map((l, i) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="retro-row group flex gap-3">
              <span className="text-[var(--crt-dim)]">{String(i + 1).padStart(2, "0")}.</span>
              <span className="group-hover:underline">{l.title}</span>
            </a>
          </li>
        ))}
      </ol>

      <Divider />
      <Heading>CONTACT</Heading>
      <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5">
        {[
          ["TWITTER", TWITTER_URL],
          ["YOUTUBE", YOUTUBE_URL],
          ["SUBSTACK", SUBSTACK_URL],
          ["GITHUB", GITHUB_URL],
          ["LINKEDIN", LINKEDIN_URL],
          ["EMAIL", `mailto:${EMAIL}`],
        ].map(([label, href]) => (
          <li key={label}>
            <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="retro-link">
              &gt; {label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center text-[var(--crt-dim)]">— END OF GUIDE —</p>
    </div>
  );
}

const KEYS: [string, string][] = [
  ["1", "∞"],
  ["2", "abc"],
  ["3", "def"],
  ["4", "ghi"],
  ["5", "jkl"],
  ["6", "mno"],
  ["7", "pqrs"],
  ["8", "tuv"],
  ["9", "wxyz"],
  ["*", "mute"],
  ["0", "+"],
  ["#", "guide"],
];

/** The phone version of the controls: soft keys, a D-pad, call/end, and a number pad that dials channels. */
function PhoneKeypad({
  on,
  muted,
  onPower,
  onPrev,
  onNext,
  onSurprise,
  onGuide,
  onMute,
  onDigit,
}: {
  on: boolean;
  muted: boolean;
  onPower: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSurprise: () => void;
  onGuide: () => void;
  onMute: () => void;
  onDigit: (channelIndex: number) => void;
}) {
  const press = (k: string) => {
    if (!on) return onPower();
    if (k === "*") return onMute();
    if (k === "#") return onGuide();
    onDigit(k === "0" ? 9 : Number(k) - 1);
  };
  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col gap-2">
          <button type="button" disabled={!on} onClick={onGuide} className="retro-phone-key">
            GUIDE
          </button>
          <button type="button" onClick={on ? onSurprise : onPower} className="retro-phone-key retro-phone-call" aria-label={on ? "Surprise me" : "Turn on"}>
            {on ? "✦ SURPRISE" : "☎ CALL"}
          </button>
        </div>
        <div className="retro-dpad" role="group" aria-label="Channels">
          <button type="button" disabled={!on} onClick={onNext} className="retro-dpad-up" aria-label="Next channel">
            ▲
          </button>
          <button type="button" disabled={!on} onClick={onPrev} className="retro-dpad-left" aria-label="Previous channel">
            ◀
          </button>
          <button type="button" onClick={on ? onSurprise : onPower} className="retro-dpad-ok" aria-label={on ? "Surprise me" : "Turn on"}>
            OK
          </button>
          <button type="button" disabled={!on} onClick={onNext} className="retro-dpad-right" aria-label="Next channel">
            ▶
          </button>
          <button type="button" disabled={!on} onClick={onPrev} className="retro-dpad-down" aria-label="Previous channel">
            ▼
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" disabled={!on} onClick={onMute} className="retro-phone-key" aria-pressed={muted}>
            {muted ? "SOUND" : "MUTE"}
          </button>
          <button type="button" onClick={onPower} className="retro-phone-key retro-phone-end" aria-label={on ? "Hang up and go back" : "Turn on"}>
            {on ? "END" : "ON"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map(([k, sub]) => (
          <button key={k} type="button" onClick={() => press(k)} className="retro-phone-key retro-phone-num" aria-label={k === "*" ? "Mute" : k === "#" ? "Guide" : `Channel ${k === "0" ? 10 : k}`}>
            <span className="text-[26px] leading-none">{k}</span>
            <span className="text-[12px] leading-none opacity-70">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div aria-hidden className="my-9 overflow-hidden whitespace-nowrap text-[var(--crt-dim)]">
      {"· ".repeat(120)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The set                                                             */
/* ------------------------------------------------------------------ */

export default function RetroTV({
  className = "",
  story,
  posts,
  letters,
  videos,
  gallery,
  repos,
  life,
  dreams,
  host,
}: {
  className?: string;
  story: string[];
  posts: Entry[];
  letters: Letter[];
  videos: YouTubeVideo[];
  gallery: Shot[];
  repos: Repo[];
  life: LifeEvent[];
  dreams: Dream[];
  host: HostCopy;
}) {
  const router = useRouter();
  const clock = useClock();
  const audio = useRef<TvAudio | null>(null);

  const [power, setPower] = useState<"off" | "on" | "shutting">("off");
  const [lineup, setLineup] = useState<Channel[]>([]);
  const [idx, setIdx] = useState(0);
  const [visit, setVisit] = useState(0); // bumps on every tune: re-randomises picks, re-shows OSD
  const [noise, setNoise] = useState(false);
  const [glitch, setGlitch] = useState<null | "flash" | "roll">(null);
  const [muted, setMuted] = useState(false);
  const [subtitle, setSubtitle] = useState<string | null>(null);

  const lastInteraction = useRef(0);
  const lastMove = useRef("");
  const enteredAt = useRef(0);
  const timers = useRef(new Set<number>());
  const returnTimer = useRef<number | null>(null);
  const subtitleTimer = useRef<number | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    const all = timers.current;
    return () => {
      all.forEach((id) => window.clearTimeout(id));
      hush();
      audio.current?.close();
    };
  }, []);

  const say = useCallback(
    /** Speaks a line. `caption: false` when the channel already shows the words on screen. */
    (text: string, { caption = true }: { caption?: boolean } = {}) => {
      setSubtitle(caption ? text : null);
      if (!mutedRef.current) speak(text);
      if (subtitleTimer.current) window.clearTimeout(subtitleTimer.current);
      const ms = Math.max(3200, text.split(" ").length * 400);
      subtitleTimer.current = later(() => setSubtitle(null), ms);
      return ms;
    },
    [later],
  );

  const tune = useCallback(
    (next: number, opts: { returnAfter?: number; quiet?: boolean } = {}) => {
      if (!lineup.length) return;
      const target = (next + lineup.length) % lineup.length;
      hush();
      setSubtitle(null);
      if (returnTimer.current) window.clearTimeout(returnTimer.current);
      returnTimer.current = null;
      audio.current?.static(STATIC_MS, opts.quiet ? 0.18 : 0.32);
      setNoise(true);
      const prev = idxRef.current;
      if (opts.returnAfter) returnTimer.current = later(() => tuneRef.current(prev, { quiet: true }), opts.returnAfter);
      later(() => {
        setIdx(target);
        setVisit((v) => v + 1);
        enteredAt.current = Date.now();
      }, STATIC_MS / 2);
      later(() => setNoise(false), STATIC_MS);
    },
    [lineup.length, later],
  );
  const tuneRef = useRef(tune);
  tuneRef.current = tune;

  const userTune = (next: number) => {
    lastInteraction.current = Date.now();
    audio.current?.click();
    tune(next);
  };

  const channel = lineup[idx];
  const isIdle = useCallback(() => Date.now() - lastInteraction.current > 6000, []);

  // What each channel does when you land on it.
  const [pick, setPick] = useState(0);
  useEffect(() => {
    if (power !== "on" || !channel) return;
    setPick(rand(1000));
    audio.current?.setHiss(channel.kind !== "video" && channel.kind !== "dreams");
    audio.current?.setPad(channel.kind === "dreams");
    if (channel.kind === "letter") {
      const firstBit = channel.letter.excerpt.split(/(?<=[.!?])\s/).slice(0, 2).join(" ");
      later(() => say(`Now reading, from the weekly letter: ${channel.letter.title}. ${firstBit}`, { caption: false }), 500);
    } else if (channel.kind === "bars") {
      audio.current?.tone(2400);
    } else if ((channel.kind === "cam" || channel.kind === "gallery") && Math.random() < 0.5) {
      later(() => say(pickOne(host.bumpers)), 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit, power]);

  // News and ads speak their randomly picked copy.
  const headline = host.headlines[pick % host.headlines.length];
  const ad = host.ads[pick % host.ads.length];
  useEffect(() => {
    if (power !== "on" || !channel) return;
    if (channel.kind === "news") later(() => say(`Breaking news. ${headline}`), 500);
    if (channel.kind === "ad") later(() => say(`${ad.product}. ${ad.pitch}`), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);

  /** The unpredictable part: something different every time, only while you're idle. */
  const surprise = useCallback(
    (forced = false) => {
      if (!lineup.length) return;
      const indexOf = (kind: Channel["kind"]) => {
        const matches = lineup.map((c, i) => (c.kind === kind ? i : -1)).filter((i) => i >= 0 && i !== idx);
        return matches.length ? pickOne(matches) : -1;
      };
      const flash = () => {
        setGlitch("flash");
        audio.current?.static(220, 0.2);
        later(() => setGlitch(null), 420);
      };
      // Vertical hold slips: the picture rolls up and down, then catches.
      const roll = () => {
        setGlitch("roll");
        audio.current?.static(900, 0.12);
        later(() => setGlitch(null), 1400);
      };

      const has = (kind: Channel["kind"]) => indexOf(kind) >= 0;
      const moves: { id: string; weight: number; ok: boolean; run: () => void }[] = [
        { id: "video", weight: 34, ok: has("video"), run: () => tune(indexOf("video")) },
        { id: "life", weight: 14, ok: has("life"), run: () => tune(indexOf("life")) },
        { id: "letter", weight: 9, ok: has("letter"), run: () => tune(indexOf("letter")) },
        { id: "news", weight: 8, ok: has("news"), run: () => tune(indexOf("news"), { returnAfter: 9000 }) },
        { id: "ad", weight: 7, ok: has("ad"), run: () => tune(indexOf("ad"), { returnAfter: 9000 }) },
        { id: "roll", weight: 6, ok: true, run: roll },
        { id: "bars", weight: 5, ok: has("bars"), run: () => tune(indexOf("bars"), { returnAfter: 3200 }) },
        {
          id: "bumper",
          weight: 5,
          ok: channel?.kind !== "video" || forced,
          run: () => {
            flash();
            later(() => say(pickOne(host.bumpers)), 300);
          },
        },
        { id: "dreams", weight: 6, ok: has("dreams"), run: () => tune(indexOf("dreams")) },
        { id: "cam", weight: 4, ok: has("cam"), run: () => tune(indexOf("cam")) },
        { id: "github", weight: 3, ok: has("github"), run: () => tune(indexOf("github")) },
        {
          id: "surf",
          weight: 4,
          ok: true,
          run: () => {
            flash();
            later(() => tune(rand(lineup.length)), 350);
          },
        },
        { id: "screensaver", weight: 3, ok: !forced && has("screensaver"), run: () => tune(indexOf("screensaver"), { returnAfter: 14_000 }) },
      ];
      // Weighted pick, never the same move twice in a row.
      const pool = moves.filter((m) => m.ok && m.id !== lastMove.current);
      let ticket = Math.random() * pool.reduce((t, m) => t + m.weight, 0);
      const move = pool.find((m) => (ticket -= m.weight) < 0) ?? pool[0];
      if (!move) return;
      lastMove.current = move.id;
      move.run();
    },
    [lineup, idx, channel, tune, later, say, host.bumpers],
  );
  const surpriseRef = useRef(surprise);
  surpriseRef.current = surprise;

  useEffect(() => {
    if (power !== "on") return;
    let id = 0;
    const loop = () => {
      id = window.setTimeout(() => {
        const idle = Date.now() - lastInteraction.current > 9000;
        const onVideo = lineup[idxRef.current]?.kind === "video";
        const settled = Date.now() - enteredAt.current > (onVideo ? 50_000 : 16_000);
        if (!document.hidden && idle && settled) surpriseRef.current();
        loop();
      }, 7000 + rand(14_000));
    };
    loop();
    return () => window.clearTimeout(id);
  }, [power, lineup]);
  const idxRef = useRef(idx);
  idxRef.current = idx;

  // Guide scrolling counts as "busy": no surprises mid-read.
  useEffect(() => {
    const mark = () => (lastInteraction.current = Date.now());
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
    };
  }, []);

  const powerOn = () => {
    if (power !== "off") return;
    try {
      audio.current ??= createTvAudio();
      audio.current.powerOn();
    } catch {}
    const rest: Channel[] = shuffle([
      ...shuffle(videos).slice(0, 6).map((video) => ({ kind: "video", video }) as Channel),
      ...shuffle(letters).slice(0, 3).map((letter) => ({ kind: "letter", letter }) as Channel),
      ...(gallery.length ? [{ kind: "gallery" } as Channel] : []),
      { kind: "cam" },
      { kind: "ad" },
      { kind: "news" },
      { kind: "bars" },
      ...(repos.length ? [{ kind: "github" } as Channel] : []),
      ...(life.length ? [{ kind: "life" } as Channel] : []),
      ...(dreams.length ? [{ kind: "dreams" } as Channel] : []),
      { kind: "screensaver" },
    ]);
    const next: Channel[] = [{ kind: "guide" }, ...rest];
    setLineup(next);
    // Land somewhere random, but make it a show.
    const start = next.findIndex((c) => c.kind === "video");
    setIdx(start > 0 ? start : 1);
    setVisit((v) => v + 1);
    enteredAt.current = Date.now();
    lastInteraction.current = Date.now();
    setPower("on");
    setNoise(true);
    later(() => setNoise(false), 700);
    later(() => say("You're watching Shrit TV. Don't touch that dial. Or do. We can't stop you."), 900);
  };

  const powerOff = () => {
    if (power !== "on") return;
    hush();
    audio.current?.click();
    audio.current?.setHiss(false);
    audio.current?.setPad(false);
    setPower("shutting");
    window.setTimeout(() => router.push("/"), POWER_OFF_MS);
  };

  const toggleMute = () => {
    lastInteraction.current = Date.now();
    const next = !muted;
    setMuted(next);
    audio.current?.setMuted(next);
    if (next) hush();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (power === "off" && (e.key === "Enter" || e.key === " ")) return powerOn();
      if (power !== "on") return;
      lastInteraction.current = Date.now();
      if (e.key === "ArrowRight" || e.key === "ArrowUp") userTune(idx + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") userTune(idx - 1);
      else if (e.key.toLowerCase() === "s") surprise(true);
      else if (e.key.toLowerCase() === "m") toggleMute();
      else if (e.key.toLowerCase() === "g") userTune(0);
      else if (/^[0-9]$/.test(e.key)) {
        const n = e.key === "0" ? 9 : Number(e.key) - 1;
        if (n < lineup.length) userTune(n);
      }
      else if (e.key === "Escape") powerOff();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const ticker = [...posts.map((p) => p.title), ...letters.map((l) => l.title)].slice(0, 8);

  return (
    <div data-lenis-prevent className={`retro fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-3 sm:p-6 ${className}`}>
      <div className="retro-room pointer-events-none fixed inset-0" aria-hidden />

      {/* Phones get a retro keypad phone; bigger screens get the TV. Same channels inside. */}
      <div className="retro-cabinet relative my-auto flex w-full max-w-[420px] flex-col gap-3 rounded-[46px] px-4 pb-6 pt-4 md:max-w-[1180px] md:flex-row md:gap-6 md:rounded-[36px] md:p-5">
        <div className="flex flex-col items-center gap-1.5 md:hidden" aria-hidden>
          <span className="retro-earpiece" />
          <span className="retro-badge text-[16px] leading-none">SHRIT · 3310-ISH</span>
        </div>
        {/* Screen */}
        <div className="retro-bezel relative min-w-0 flex-1 rounded-[18px] p-2 md:rounded-[30px] md:p-4">
          <div
            className={`retro-screen relative h-[min(50dvh,460px)] overflow-hidden rounded-[10px] md:h-[min(76dvh,720px)] md:rounded-[26px] ${
              power === "shutting" ? "retro-power-off" : ""
            } ${glitch === "flash" ? "retro-glitch" : glitch === "roll" ? "retro-roll" : ""}`}
          >
            {power === "off" ? (
              <button
                type="button"
                onClick={powerOn}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-center"
              >
                <span className="retro-glow retro-blink text-[40px] leading-none sm:text-[56px]">▶ TURN ON</span>
                <span className="text-[var(--crt-dim)]">sound on for the full experience</span>
              </button>
            ) : (
              <div key={visit} className={`absolute inset-0 ${power === "on" && visit === 1 ? "retro-power-on" : ""}`}>
                {channel?.kind === "guide" && (
                  <GuideChannel story={story} posts={posts} letters={letters} lineup={lineup} onTune={userTune} idle={isIdle} />
                )}
                {channel?.kind === "video" && <VideoChannel video={channel.video} muted={muted} />}
                {channel?.kind === "letter" && <LetterChannel letter={channel.letter} />}
                {channel?.kind === "gallery" && <GalleryChannel gallery={gallery} />}
                {channel?.kind === "cam" && <CamChannel clock={clock} />}
                {channel?.kind === "ad" && <AdChannel ad={ad} />}
                {channel?.kind === "news" && <NewsChannel headline={headline} ticker={ticker} />}
                {channel?.kind === "bars" && <BarsChannel />}
                {channel?.kind === "github" && <GithubChannel repos={repos} />}
                {channel?.kind === "life" && <LifeChannel life={life} say={say} />}
                {channel?.kind === "dreams" && <DreamsChannel dreams={dreams} />}
                {channel?.kind === "screensaver" && <ScreensaverChannel />}
              </div>
            )}

            {/* On-screen display */}
            {power !== "off" && channel && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between gap-2 px-3 pt-2 text-[19px] sm:px-8 sm:pt-4 sm:text-[26px]">
                <span key={visit} className="retro-osd retro-glow retro-osd-chip truncate">
                  CH{String(idx + 1).padStart(2, "0")} {channelName(channel)}
                </span>
                <span className="retro-glow retro-osd-chip shrink-0">
                  {muted ? "MUTE " : ""}
                  {clock}
                </span>
              </div>
            )}

            {subtitle && (
              <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4 sm:bottom-6 sm:px-6">
                <p className="retro-subtitle line-clamp-3 max-w-[40ch] bg-black/80 px-3 py-1 text-center text-[18px] leading-snug text-white sm:text-[23px]">
                  {subtitle}
                </p>
              </div>
            )}

            <Static active={noise} />
            <div className="retro-scanlines pointer-events-none absolute inset-0 z-40" aria-hidden />
            <div className="retro-glass pointer-events-none absolute inset-0 z-40" aria-hidden />
          </div>
        </div>

        {/* Phone keypad */}
        <PhoneKeypad
          on={power === "on"}
          muted={muted}
          onPower={power === "off" ? powerOn : powerOff}
          onPrev={() => userTune(idx - 1)}
          onNext={() => userTune(idx + 1)}
          onSurprise={() => {
            lastInteraction.current = Date.now();
            audio.current?.click();
            surprise(true);
          }}
          onGuide={() => userTune(0)}
          onMute={toggleMute}
          onDigit={(n) => n < lineup.length && userTune(n)}
        />

        {/* TV control panel: big, labelled */}
        <div className="hidden shrink-0 flex-col gap-3 md:flex md:w-40 md:py-3">
          <div className="retro-badge hidden text-center text-[18px] leading-none md:block">
            SHRIT
            <span className="block text-[12px] tracking-[0.3em]">TRINITRON-ISH</span>
          </div>

          <div className="grid grid-cols-4 gap-2 md:mt-3 md:grid-cols-2">
            <button type="button" disabled={power !== "on"} onClick={() => userTune(idx - 1)} className="retro-key" aria-label="Previous channel">
              ◀ CH
            </button>
            <button type="button" disabled={power !== "on"} onClick={() => userTune(idx + 1)} className="retro-key" aria-label="Next channel">
              CH ▶
            </button>
            <button
              type="button"
              disabled={power !== "on"}
              onClick={() => {
                lastInteraction.current = Date.now();
                audio.current?.click();
                surprise(true);
              }}
              className="retro-key retro-key-hot col-span-2 md:col-span-2"
            >
              ✦ SURPRISE
            </button>
            <button type="button" disabled={power !== "on"} onClick={() => userTune(0)} className="retro-key col-span-2 md:col-span-1">
              GUIDE
            </button>
            <button type="button" disabled={power !== "on"} onClick={toggleMute} className="retro-key col-span-2 md:col-span-1" aria-pressed={muted}>
              {muted ? "SOUND" : "MUTE"}
            </button>
          </div>

          <div className="hidden items-center justify-center md:flex md:py-2">
            <button
              type="button"
              disabled={power !== "on"}
              onClick={() => userTune(idx + 1)}
              aria-label="Next channel"
              className="retro-knob"
              style={{ rotate: `${idx * 36}deg` }}
            >
              <span className="retro-knob-mark" />
            </button>
          </div>

          <div className="retro-grille hidden flex-1 md:block" aria-hidden />

          <div className="flex items-center justify-between gap-3 md:flex-col">
            <p className="text-[15px] leading-tight text-[var(--cab-ink)] md:text-center">
              ← → channels · S surprise · M mute
            </p>
            <button
              type="button"
              onClick={power === "off" ? powerOn : powerOff}
              aria-label={power === "off" ? "Turn on" : "Turn off and go back"}
              className="retro-power"
            >
              <span className={`retro-led ${power === "on" ? "retro-led-on" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
