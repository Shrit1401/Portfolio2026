"use client";
import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";

interface ResearchCardProps {
  title: string;
  slug: string;
  preview: string;
  date: string;
  tags?: Array<{
    name: string;
    slug: { current: string };
  }>;
}

export default function ResearchCard({
  title,
  slug,
  preview,
  date,
  tags,
}: ResearchCardProps) {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const handleNavigation = (e: React.MouseEvent) => {
    if (`/research/${slug}` === pathname) { e.preventDefault(); return; }
    e.preventDefault();
    router.push(`/research/${slug}`);
  };

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      onClick={handleNavigation}
      className="cursor-pointer group py-7 border-b border-neutral-200 first:border-t"
      style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h2
            className="text-xl md:text-2xl font-bold text-neutral-900 leading-snug group-hover:text-neutral-500 transition-colors duration-200"
          >
            {title}
          </h2>
          {preview && (
            <p className="mt-2 text-base text-neutral-500 leading-relaxed line-clamp-2 italic">
              {preview}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <time className="text-sm text-neutral-400 not-italic" style={{ fontFamily: "inherit" }}>
              {formattedDate}
            </time>
            {tags && tags.length > 0 && (
              <>
                <span className="text-neutral-300 text-sm">·</span>
                {tags.map((tag) => (
                  <span
                    key={tag.slug.current}
                    className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded not-italic"
                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    {tag.name}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
        <span className="shrink-0 mt-1 text-neutral-300 group-hover:text-neutral-500 transition-colors duration-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M7 7h10v10" />
          </svg>
        </span>
      </div>
    </article>
  );
}
