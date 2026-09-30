"use client";

import React, { useCallback, useState } from "react";
import { useViewCount } from "@/app/lib/useViewCount";
import Navbar from "../../components/Navbar";
import ResearchText from "@/app/components/research/ResearchText";
import Footer from "@/app/components/Footer";
import ResearchSense from "@/app/components/research/ResearchSense";
import ReactMarkdown from "react-markdown";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import { Research } from "@/app/lib/types";
import Link from "next/link";
import HomeschoolingArticle from "./HomeschoolingArticle";
import ShritGPTArticle from "./ShritGPTArticle";
import ImageLightbox from "@/app/components/research/ImageLightbox";
import {
  remarkPlugins,
  rehypePlugins,
  buildMarkdownComponents,
  proseClasses,
} from "@/app/components/research/markdownConfig";

interface ResearchPageClientProps {
  research: Research;
}

function getReadingTime(markdown: string): string {
  const wordsPerMinute = 200;
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export default function ResearchPageClient({
  research,
}: ResearchPageClientProps) {
  if (research.slug.current === "homeschooling") {
    return <HomeschoolingArticle research={research} />;
  }
  if (research.slug.current === "making-ur-own-gpt") {
    return <ShritGPTArticle research={research} />;
  }

  return <GenericArticle research={research} />;
}

function GenericArticle({ research }: { research: Research }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);
  const components = buildMarkdownComponents(setLightboxSrc);
  const readingTime = getReadingTime(research.markdown || "");
  const views = useViewCount(research.slug.current);

  return (
    <div className="relative w-full home">

      <Navbar />
      <ResearchText
        title={research.title || "Untitled"}
        time={readingTime}
        date={research.date || new Date().toISOString().split("T")[0]}
      description={research.description}
      cover={research.cover}
      coverCredit={research.coverCredit}
      coverAspect={research.coverAspect}
      tag={research.tags?.[0] && { name: research.tags[0].name, slug: research.tags[0].slug.current }}
      />
      <main className="container mx-auto grow px-4 pb-8">
        {/* Posts that open with a paragraph (not a heading) still need room below the date line. */}
        <article className={`${proseClasses} [&>p:first-child]:mt-10 prose-headings:font-bold!`}>
          <ReactMarkdown
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={components as any}
          >
            {research.markdown || ""}
          </ReactMarkdown>
        </article>
      </main>

      <ResearchSense />
      <Footer />
      <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />
    </div>
  );
}
