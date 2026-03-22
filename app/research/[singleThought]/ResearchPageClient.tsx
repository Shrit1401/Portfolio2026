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
import { urlFor } from "@/sanity/lib/image";
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

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <ResearchText
          title={research.title || "Untitled"}
          time={readingTime}
          date={research.date || new Date().toISOString().split("T")[0]}
          img={urlFor(research.image).url()}
        />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="prose lg:prose-xl mx-auto prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 prose-headings:scroll-mt-20">
          {research.tags && research.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {research.tags.map((tag) => (
                <Link
                  key={tag.slug.current}
                  href={`/thoughts/tag/${tag.slug.current}`}
                  className="inline-block px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors duration-200"
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
                    /\[!(.*?)\]/
                  )?.[1] as CalloutType;
                  const message = firstChild.props.children
                    .replace(/\[!.*?\]/, "")
                    .trim();

                  const bgColor =
                    {
                      note: "bg-blue-100 border-blue-500",
                      warning: "bg-yellow-100 border-yellow-500",
                      tip: "bg-green-100 border-green-500",
                    }[type] || "bg-gray-100 border-gray-500";

                  return (
                    <div
                      className={`p-4 my-4 rounded-lg border-l-4 ${bgColor}`}
                    >
                      <div className="font-bold mb-2">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                      <div>{message}</div>
                    </div>
                  );
                }
                return (
                  <blockquote
                    className="border-l-4 border-gray-300 pl-4 italic"
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
                  className="text-blue-500 hover:underline"
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
                    <div className="absolute right-2 top-2 text-xs text-gray-400">
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
                  <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
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
                      className="h-4 w-4 mr-2"
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
                      <sup className="text-sm text-gray-600">
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
