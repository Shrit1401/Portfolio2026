import Image from "next/image";
import Link from "next/link";
import type { Research } from "@/app/lib/types";
import { formatDate } from "@/app/lib/format";
import { Reveal } from "./motion";

/** Card grid with cover stills, the "Popular" look from the home page. */
export default function PostCards({ posts }: { posts: Research[] }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 sm:[&>*:first-child>a]:pl-0">
      {posts.map((post, i) => (
        <Reveal key={post.slug.current} delay={i * 0.08}>
        <Link
          href={`/posts/${post.slug.current}`}
          className="group press block h-full px-0 py-5 sm:px-4"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-line">
            {post.cover && (
              <Image
                src={post.cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            )}
          </div>
          {post.tags?.[0] && (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-accent">
              {post.tags[0].name}
            </p>
          )}
          <h3 className="mt-1 text-lg leading-snug text-ink group-hover:underline group-hover:decoration-line group-hover:underline-offset-4">
            {post.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink/75">{post.description}</p>
          <p className="mt-2 text-xs text-accent">{formatDate(post.date)}</p>
        </Link>
        </Reveal>
      ))}
    </div>
  );
}
