import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate } from "@/app/lib/format";
import { Reveal } from "./motion";

export type PostListItem = {
  href: string;
  title: string;
  description?: string;
  date?: string;
  image?: string;
  external?: boolean;
};

/** Thumbnail-left list, used for /posts and the newsletter feed. */
export default function PostList({ items }: { items: PostListItem[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item, i) => {
        const body: ReactNode = (
          <>
            <div className="relative aspect-[16/9] w-28 shrink-0 overflow-hidden bg-line sm:w-40">
              {item.image && (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg leading-snug text-ink group-hover:underline group-hover:decoration-line group-hover:underline-offset-4 sm:text-xl">
                {item.title}
                {item.external && (
                  <span aria-hidden className="ml-1 text-sm text-muted">
                    ↗
                  </span>
                )}
              </h3>
              {item.description && (
                <p className="mt-1 text-sm leading-relaxed text-ink/75">
                  {item.description}
                </p>
              )}
              {item.date && (
                <p className="mt-1.5 text-xs text-accent">{formatDate(item.date)}</p>
              )}
            </div>
          </>
        );
        const className = "group press flex items-start gap-4 py-5 sm:gap-8";
        return (
          <li key={item.href}>
            <Reveal delay={Math.min(i, 6) * 0.06}>
            {item.external ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                {body}
              </a>
            ) : (
              <Link href={item.href} className={className}>
                {body}
              </Link>
            )}
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
