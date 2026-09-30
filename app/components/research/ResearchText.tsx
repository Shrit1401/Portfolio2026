import Image from "next/image";
import Link from "next/link";
import { articleWidthPadded } from "./articleWidth";

/** Article header: title, subtitle, wide cover still, then a mono date line. */
const ResearchText = ({
  title,
  time,
  date,
  views,
  description,
  cover,
  coverCredit,
  coverAspect,
  tag,
}: {
  title: string;
  time: string;
  date: string;
  views?: number | null;
  description?: string;
  cover?: string;
  coverCredit?: string;
  coverAspect?: string;
  tag?: { name: string; slug: string };
}) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="w-full pt-12 md:pt-16">
      <div className={`mx-auto ${articleWidthPadded}`}>
        {tag && (
          <Link
            href={`/posts/tag/${tag.slug}`}
            className="font-mono text-[11px] uppercase tracking-wide text-accent hover:underline"
          >
            {tag.name}
          </Link>
        )}
        <h1 className="mt-1 text-[2rem] font-normal leading-[1.2] tracking-[-0.015em] text-ink md:text-[2.4rem]">
          {title}
        </h1>
        {description && <p className="mt-2 text-lg leading-snug text-ink/80">{description}</p>}
      </div>

      {cover && (
        <figure className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 xl:max-w-5xl">
          <div className="relative aspect-[16/8.7] overflow-hidden bg-line" style={coverAspect ? { aspectRatio: coverAspect } : undefined}>
            <Image src={cover} alt="" fill priority sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
          </div>
          {coverCredit && <figcaption className="mt-2 text-right text-[11px] text-muted">{coverCredit}</figcaption>}
        </figure>
      )}

      <div className={`mx-auto mt-10 ${articleWidthPadded}`}>
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {formattedDate} &nbsp;•&nbsp; {time}
          {views != null && <>&nbsp;•&nbsp; {views.toLocaleString()} views</>}
        </p>
        <hr className="mt-6 border-line" />
      </div>
    </header>
  );
};

export default ResearchText;
