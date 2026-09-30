import Image from "next/image";
import { Tweet } from "react-tweet";
import { Reveal } from "../components/motion";
import type { Pin } from "../lib/inspiration";
import Masonry from "./Masonry";
import LiveMedia from "./LiveMedia";

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
        <LiveMedia>
          <div className="inspo-tweet">
            <Tweet id={pin.id} />
          </div>
        </LiveMedia>
      );
    case "video":
      return (
        <Frame href={pin.href}>
          <LiveMedia>
            <div className="relative overflow-hidden rounded-[10px] bg-[#f0ede5] dark:bg-card">
              <video
                src={pin.src}
                poster={pin.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={pin.caption}
                className="block h-auto w-full"
              />
            </div>
          </LiveMedia>
          <Caption>{pin.caption}</Caption>
        </Frame>
      );
    case "words":
      return (
        <Frame href={pin.href}>
          <div className="rounded-[10px] bg-[#f0ede5] px-3.5 pb-4 pt-4 transition-colors duration-300 group-hover:bg-[#ebe7dd] sm:px-5 sm:pb-5 sm:pt-6 dark:bg-card dark:group-hover:bg-neutral-100">
            <blockquote className="font-instrument text-[19px] leading-[1.2] tracking-[-0.005em] text-ink sm:text-[22px] lg:text-[25px]">
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

/** Rough height of a pin relative to its width, so the masonry can balance columns before anything loads. */
function weight(pin: Pin): number {
  switch (pin.type) {
    case "image":
      return pin.h / pin.w + 0.15;
    case "video":
      return (pin.w && pin.h ? pin.h / pin.w : 0.75) + 0.15;
    case "words":
      return 0.3 + Math.ceil(pin.text.length / 26) * 0.14;
    case "tweet":
      return 1.6;
  }
}

/** Pinterest-style board: masonry columns, each pin rises in as it scrolls into view. */
export default function Board({ pins }: { pins: Pin[] }) {
  return (
    <Masonry
      weights={pins.map(weight)}
      items={pins.map((pin, i) => (
        <Reveal key={pin.key} delay={(i % 5) * 0.05}>
          <PinView pin={pin} index={i} />
        </Reveal>
      ))}
    />
  );
}
