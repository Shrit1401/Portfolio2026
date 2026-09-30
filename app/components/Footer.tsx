import Link from "next/link";
import NowPlaying from "./NowPlaying";
import ThemeToggle from "./ThemeToggle";
import RetroButton from "./RetroButton";
import ShritTvTeaser from "./ShritTvTeaser";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  SUBSTACK_URL,
  TWITTER_URL,
  YOUTUBE_URL,
} from "@/app/lib/links";

const LINKS = [
  { label: "Newsletter", href: SUBSTACK_URL },
  { label: "YouTube", href: YOUTUBE_URL },
  { label: "Twitter", href: TWITTER_URL },
  { label: "GitHub", href: GITHUB_URL },
  { label: "LinkedIn", href: LINKEDIN_URL },
  { label: "Email", href: `mailto:${EMAIL}` },
];

export default function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-[1440px] px-4 pb-12 sm:px-8">
      <ShritTvTeaser />
      <div className="flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Link href="/" className="font-serif text-base text-ink">
            Shrit Shrivastava
          </Link>
          <NowPlaying />
        </div>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="press inline-block hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
          <li>
            <RetroButton />
          </li>
        </ul>
      </div>
    </footer>
  );
}
