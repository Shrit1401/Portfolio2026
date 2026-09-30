"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SUBSTACK_URL, YOUTUBE_URL } from "@/app/lib/links";
import { RollText } from "./motion";
import { FaYoutube } from "react-icons/fa";
import { SiSubstack } from "react-icons/si";

const INTERNAL = [
  { label: "Posts", href: "/posts" },
  { label: "Inspiration", href: "/photos" },
  { label: "Past", href: "/past" },
];

const EXTERNAL = [
  { label: "Newsletter", href: SUBSTACK_URL, Icon: SiSubstack, color: "text-[#ff6719]" },
  { label: "YouTube", href: YOUTUBE_URL, Icon: FaYoutube, color: "text-[#ff0033]" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="mx-auto w-full max-w-[1440px] px-4 pt-6 sm:px-8 sm:pt-8">
      <Link
        href="/"
        className="block text-center font-serif text-[28px] leading-none tracking-[-0.01em] text-ink sm:text-[32px]"
      >
        Shrit Shrivastava
      </Link>

      <nav
        aria-label="Main"
        className="mt-5 grid grid-cols-5 border-y border-line text-[13px] sm:text-[15px]"
      >
        {INTERNAL.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group press py-2.5 text-center ${
                active ? "text-ink font-medium" : "text-ink/75 hover:text-ink"
              }`}
            >
              <RollText>{item.label}</RollText>
            </Link>
          );
        })}
        {EXTERNAL.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group press inline-flex items-center justify-center gap-1.5 py-2.5 text-ink/75 hover:text-ink"
          >
            <item.Icon aria-hidden className={`hidden h-3.5 w-3.5 shrink-0 sm:block ${item.color}`} />
            <RollText>{item.label}</RollText>
            <span aria-hidden className="ml-0.5 hidden text-[0.8em] sm:inline">
              ↗
            </span>
          </a>
        ))}
      </nav>
    </header>
  );
}
