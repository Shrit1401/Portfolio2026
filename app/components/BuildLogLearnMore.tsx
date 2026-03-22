"use client";

import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";

function isExternalHref(href: string) {
  return (
    /^https?:\/\//i.test(href) ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

type Props = {
  href: string;
  className?: string;
};

/** “Learn more”: internal paths use the app transition router; absolute URLs and mailto/tel use a normal link. */
export function BuildLogLearnMore({ href, className }: Props) {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const trimmed = href.trim();
  if (!trimmed) return null;

  const external = isExternalHref(trimmed);
  const path = external
    ? trimmed
    : trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;

  const defaultClass =
    "inline-flex items-center justify-center text-xs font-medium tracking-tight lowercase transition-colors underline underline-offset-2";

  const merged = className ?? `${defaultClass} text-white/90 decoration-white/40 hover:decoration-white/80`;

  if (external) {
    const openInNewTab =
      /^https?:\/\//i.test(trimmed) || trimmed.startsWith("//");
    return (
      <a
        href={path}
        onClick={(e) => e.stopPropagation()}
        {...(openInNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={merged}
      >
        learn more
      </a>
    );
  }

  const [pathBase, pathHash] = path.split("#");
  const normalizedBase = pathBase || "/";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (pathname === normalizedBase) {
          if (pathHash) {
            document
              .getElementById(pathHash)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }
        router.push(path);
      }}
      className={merged}
    >
      learn more
    </button>
  );
}
