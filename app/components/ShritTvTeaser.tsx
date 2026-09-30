/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const STILLS = ["hi", "shook", "laughing", "peace", "thinking"];

/** Footer teaser for /retro: a little CRT flipping channels on its own, with static between. Pure CSS. */
export default function ShritTvTeaser() {
  return (
    <Link href="/retro" className="tv-teaser group press mb-8 flex items-center gap-5 sm:gap-7">
      <span className="tv-teaser-set relative block w-36 shrink-0 sm:w-44">
        <span className="tv-teaser-antenna" aria-hidden />
        <span className="tv-teaser-screen relative block aspect-[4/3] overflow-hidden">
          {STILLS.map((s, i) => (
            <img
              key={s}
              src={`/me/${s}.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className="tv-teaser-still absolute inset-0 h-full w-full object-cover"
              style={{ animationDelay: `${i * 1.6}s` }}
            />
          ))}
          <span className="tv-teaser-static absolute inset-0" aria-hidden />
          <span className="tv-teaser-lines absolute inset-0" aria-hidden />
          <span className="tv-teaser-onair absolute left-1.5 top-1 font-mono text-[9px] font-bold tracking-wider">● ON AIR</span>
        </span>
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-accent">new · shrit tv</span>
        <span className="mt-1 block text-[22px] leading-tight text-ink sm:text-[26px]">
          there&apos;s a tv in here.{" "}
          <span className="font-instrument italic">it has opinions.</span>
        </span>
        <span className="mt-1 block text-sm text-muted">
          my whole life on one old crt: vlogs, letters, cartoons, fake ads. it talks.
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink underline decoration-line underline-offset-4 group-hover:decoration-ink">
          turn it on <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">→</span>
        </span>
      </span>
    </Link>
  );
}
