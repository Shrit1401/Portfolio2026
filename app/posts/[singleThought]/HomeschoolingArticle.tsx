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
import ImageLightbox from "@/app/components/research/ImageLightbox";
import {
  remarkPlugins,
  rehypePlugins,
  buildMarkdownComponents,
  proseClasses,
} from "@/app/components/research/markdownConfig";
import { articleWidth } from "@/app/components/research/articleWidth";

import MonthlyActivityChart from "@/app/components/research/MonthlyActivityChart";
import StatComparison from "@/app/components/research/StatComparison";
import PathCards from "@/app/components/research/PathCards";
import ProblemCards from "@/app/components/research/ProblemCards";
import SurveyStatCards from "@/app/components/research/SurveyStatCards";

function getReadingTime(markdown: string): string {
  const wordsPerMinute = 200;
  const words = markdown.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function splitAtH1(markdown: string): string[] {
  const lines = markdown.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^# /.test(line) && current.length > 0) {
      sections.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) sections.push(current.join("\n"));
  return sections;
}

function stripLines(md: string, patterns: RegExp[]): string {
  return md
    .split("\n")
    .filter((line) => !patterns.some((p) => p.test(line)))
    .join("\n");
}

export default function HomeschoolingArticle({ research }: { research: Research }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);
  const components = buildMarkdownComponents(setLightboxSrc);

  const views = useViewCount(research.slug.current);
  const readingTime = getReadingTime(research.markdown || "");
  const raw = research.markdown || "";
  const sections = splitAtH1(raw);

  const surveySplitIndex = sections[3]?.indexOf("## surveys?") ?? -1;
  let helpSection = sections[3] || "";
  let surveySection = "";
  if (surveySplitIndex > 0) {
    helpSection = sections[3].slice(0, surveySplitIndex);
    surveySection = sections[3].slice(surveySplitIndex);
  }

  const cleanedSurvey = stripLines(surveySection, [
    /^- August and March/,
    /^- December usually/,
    /^- Homeschooling is still/,
  ]);

  const howToSection = sections[4] || "";
  const howToSplitIndex = howToSection.indexOf("**For classes 1 to 8,**");
  let howToIntro = howToSection;
  let howToPathContent = "";
  if (howToSplitIndex > 0) {
    howToIntro = howToSection.slice(0, howToSplitIndex);
    howToPathContent = howToSection.slice(howToSplitIndex);
  }

  const keepAfterPaths = howToPathContent
    .split("\n")
    .filter((l) => /^And if my kid/.test(l))
    .join("\n");

  const problemsSection = sections[5] || "";
  const problemIntroMatch = problemsSection.match(
    /^([\s\S]*?)(- parents trying[\s\S]*?)(this is something[\s\S]*)$/,
  );
  let problemIntro = problemsSection;
  let problemOutro = "";
  if (problemIntroMatch) {
    problemIntro = problemIntroMatch[1];
    problemOutro = problemIntroMatch[3];
  }

  function Prose({ content }: { content: string }) {
    if (!content.trim()) return null;
    return (
      <article className={proseClasses}>
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components as any}
        >
          {content}
        </ReactMarkdown>
      </article>
    );
  }

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
      tag={research.tags?.[0] && { name: research.tags[0].name, slug: research.tags[0].slug.current }}
      />

      <main className="container mx-auto grow px-4 pb-8">
        <div className={`mx-auto ${articleWidth}`}>

          <Prose content={sections[0] || ""} />
          <Prose content={sections[1] || ""} />
          <Prose content={sections[2] || ""} />
          <Prose content={helpSection} />

          <StatComparison className="my-14" />

          <Prose content={cleanedSurvey} />

          <SurveyStatCards className="my-10" />
          <MonthlyActivityChart className="my-14" />

          <Prose content={howToIntro} />

          <PathCards className="my-14" />

          <Prose content={keepAfterPaths} />

          <Prose content={problemIntro} />

          <ProblemCards className="my-14" />

          <Prose content={problemOutro} />

          <Prose content={sections[6] || ""} />
        </div>
      </main>

      <ResearchSense />
      <Footer />
      <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />
    </div>
  );
}
