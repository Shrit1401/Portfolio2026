"use client";

import { useEffect, useState } from "react";
import { SUBSTACK_URL } from "@/app/lib/links";

const PLACEHOLDERS = [
  "naruto@konoha.com",
  "luffy@grandline.com",
  "goku@capsulecorp.com",
  "tanjiro@demonslayer.corps",
  "gojo@jujutsu.high",
  "light@deathnote.com",
];

/**
 * Plain GET form into Substack's subscribe page (email prefilled), so signups
 * land straight in the newsletter with no third-party form service.
 */
export default function SubscribeForm({
  className = "",
  buttonClassName = "bg-accent",
}: {
  className?: string;
  buttonClassName?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % PLACEHOLDERS.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={className}>
      <form
        action={`${SUBSTACK_URL}/subscribe`}
        method="get"
        target="_blank"
        className="flex w-full max-w-md gap-2"
        aria-label="Subscribe to the newsletter"
      >
        <input
          type="email"
          name="email"
          required
          placeholder={PLACEHOLDERS[i]}
          autoComplete="email"
          className="min-w-0 flex-1 rounded-md border border-line bg-card/70 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent"
        />
        <button
          type="submit"
          className={`rounded-md ${buttonClassName} px-4 py-2 text-sm text-on-accent transition-transform hover:-rotate-2 active:scale-95`}
        >
          Let&apos;s Go
        </button>
      </form>
      <p className="mt-1.5 text-xs text-muted">Trauma dumping every week.</p>
    </div>
  );
}
