import type { ReactNode } from "react";
import { Reveal, RevealText } from "./motion";

/** Big section title with an optional right-side link, e.g. "all posts →". */
export default function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
      <h2 className="text-[28px] leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">
        <RevealText>{children}</RevealText>
      </h2>
      {action && (
        <Reveal delay={0.15} className="shrink-0 pb-1 text-sm text-accent">
          {action}
        </Reveal>
      )}
    </div>
  );
}
