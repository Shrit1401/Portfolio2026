import Image from "next/image";
import { Tweet } from "react-tweet";
import { Reveal } from "../components/motion";
import type { Pin } from "../lib/inspiration";

function Frame({ href, children }: { href?: string; children: React.ReactNode }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
      {children}
    </a>
  ) : (
    <div className="group">{children}</div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 px-0.5 text-[13px] leading-snug text-muted transition-colors duration-300 group-hover:text-ink">
      {children}
    </p>
  );
}

function PinView({ pin, index }: { pin: Pin; index: number }) {
  switch (pin.type) {
    case "tweet":
      return (
        <div className="inspo-tweet">
          <Tweet id={pin.id} />
        </div>
      );
    case "words":
      return (
        <Frame href={pin.href}>
          <div className="rounded-[10px] bg-[#f0ede5] px-5 pb-5 pt-6 transition-colors duration-300 group-hover:bg-[#ebe7dd] dark:bg-card dark:group-hover:bg-neutral-100">
            <blockquote className="font-instrument text-[25px] leading-[1.2] tracking-[-0.005em] text-ink">
              {pin.text}
            </blockquote>
          </div>
          <Caption>{pin.by}</Caption>
        </Frame>
      );
    case "image":
      return (
        <Frame href={pin.href}>
          <div className="overflow-hidden rounded-[10px] bg-[#f0ede5] dark:bg-card">
            <Image
              src={pin.src}
              alt={pin.caption}
              width={pin.w}
              height={pin.h}
              sizes="(min-width: 1400px) 280px, (min-width: 1100px) 25vw, (min-width: 760px) 33vw, 50vw"
              priority={index < 6}
              className="h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
            />
          </div>
          <Caption>{pin.caption}</Caption>
        </Frame>
      );
  }
}

/** Pinterest-style board: CSS columns for masonry, each pin rises in as it scrolls into view. */
export default function Board({ pins }: { pins: Pin[] }) {
  return (
    <div className="columns-2 gap-3.5 sm:gap-4 md:columns-3 lg:columns-4 2xl:columns-5">
      {pins.map((pin, i) => (
        <Reveal
          key={pin.key}
          delay={(i % 5) * 0.05}
          className="mb-6 break-inside-avoid"
        >
          <PinView pin={pin} index={i} />
        </Reveal>
      ))}
    </div>
  );
}
