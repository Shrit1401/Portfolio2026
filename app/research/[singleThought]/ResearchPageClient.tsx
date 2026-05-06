"use client";

import React, { ReactElement } from "react";
import Navbar from "../../components/Navbar";
import { Revealer } from "../../components/Revealer";
import ResearchText from "@/app/components/research/ResearchText";
import Footer from "@/app/components/Footer";
import ResearchSense from "@/app/components/research/ResearchSense";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/vs2015.css";
import "katex/dist/katex.min.css";
import { Research } from "@/app/lib/types";
import Link from "next/link";

type CalloutType = "note" | "warning" | "tip";

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
  const readingTime = getReadingTime(research.markdown || "");
  return (
    <div className="relative w-full home">
      <Revealer />

      <Navbar />
      <ResearchText
        title={research.title || "Untitled"}
        time={readingTime}
        date={research.date || new Date().toISOString().split("T")[0]}
      />
      <main className="container mx-auto flex-grow px-4 pb-8">
        <article className="prose prose-neutral mx-auto max-w-3xl prose-headings:scroll-mt-20 prose-headings:font-semibold prose-p:text-[1.02rem] prose-p:leading-8 prose-li:text-[1.01rem] prose-li:leading-8 prose-hr:border-neutral-200 prose-strong:font-semibold prose-a:no-underline hover:prose-a:underline prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 lg:prose-lg">
          {research.tags && research.tags.length > 0 && (
            <div className="mb-7 flex flex-wrap gap-2">
              {research.tags.map((tag) => (
                <Link
                  key={tag.slug.current}
                  href={`/research/tag/${tag.slug.current}`}
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-100"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              rehypeRaw,
              rehypeSlug,
              rehypeHighlight,
              rehypeKatex,
            ]}
            components={{
              // Style callouts
              blockquote: ({ children, ...props }) => {
                const content = React.Children.toArray(children);
                const firstChild = content[0] as ReactElement<{
                  children: string;
                }>;
                if (
                  React.isValidElement(firstChild) &&
                  typeof firstChild.props.children === "string" &&
                  firstChild.props.children.includes("[!")
                ) {
                  const type = firstChild.props.children.match(
                    /\[!(.*?)\]/,
                  )?.[1] as CalloutType;
                  const message = firstChild.props.children
                    .replace(/\[!.*?\]/, "")
                    .trim();

                  const bgColor =
                    {
                      note: "bg-blue-50 border-blue-300",
                      warning: "bg-amber-50 border-amber-300",
                      tip: "bg-emerald-50 border-emerald-300",
                    }[type] || "bg-neutral-50 border-neutral-300";

                  return (
                    <div
                      className={`my-6 rounded-md border-l-[3px] px-4 py-3 ${bgColor}`}
                    >
                      <div className="mb-1 text-sm font-semibold">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                      <div className="text-sm text-neutral-700">{message}</div>
                    </div>
                  );
                }
                return (
                  <blockquote
                    className="border-l-2 border-neutral-300 pl-4 italic text-neutral-700"
                    {...props}
                  >
                    {children}
                  </blockquote>
                );
              },
              // Make all links open in new tab
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-800 underline-offset-2 hover:underline"
                  {...props}
                >
                  {children}
                </a>
              ),
              // Style code blocks
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <div className="relative">
                    <div className="absolute right-2 top-2 text-xs text-neutral-500">
                      {match[1]}
                    </div>
                    <pre
                      className={`${className} bg-transparent m-0 p-0 rounded-lg overflow-x-auto`}
                    >
                      <code className="bg-transparent m-0 p-0" {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="rounded bg-neutral-100 px-1 py-0.5 text-[0.9em]" {...props}>
                    {children}
                  </code>
                );
              },
              // Style task lists
              input: ({ type, checked, ...props }) => {
                if (type === "checkbox") {
                  return (
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="mr-2 h-4 w-4"
                      {...props}
                    />
                  );
                }
                return <input type={type} {...props} />;
              },
              // Style footnotes
              sup: ({ children, ...props }) => {
                if (typeof children === "string") {
                  const id = children.match(/\[(.*?)\]/)?.[1];
                  if (id) {
                    return (
                      <sup className="text-sm text-neutral-600">
                        <a
                          href={`#footnote-${id}`}
                          className="no-underline hover:underline"
                        >
                          [{id}]
                        </a>
                      </sup>
                    );
                  }
                }
                return <sup {...props}>{children}</sup>;
              },
            }}
          >
            {research.markdown || ""}
          </ReactMarkdown>
        </article>
      </main>

      <ResearchSense />

      <Footer />
    </div>
  );
}
