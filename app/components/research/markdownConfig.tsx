"use client";

import React, { ReactElement, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

type CalloutType = "note" | "warning" | "tip";

export const remarkPlugins = [remarkGfm, remarkMath];
export const rehypePlugins = [rehypeRaw, rehypeSlug, rehypeHighlight, rehypeKatex];

export function buildMarkdownComponents(onImageClick?: (src: string) => void) {
  return {
    blockquote: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"blockquote">) => {
      const content = React.Children.toArray(children);
      const firstChild = content[0] as ReactElement<{ children: string }>;
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
          className="border-l-2 border-line pl-5 font-normal not-italic text-ink [&_p]:before:content-none [&_p]:after:content-none"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    a: ({
      href,
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"a">) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline-offset-2 hover:underline"
        {...props}
      >
        {children}
      </a>
    ),
    img: ({ src, alt, ...props }: React.ComponentPropsWithoutRef<"img">) => (
      <img
        src={src}
        alt={alt || ""}
        className={onImageClick ? "cursor-zoom-in" : ""}
        onClick={onImageClick && typeof src === "string" ? () => onImageClick(src) : undefined}
        {...props}
      />
    ),
    // Markdown wraps fenced code in <pre>; CodeBlock renders its own, so drop the outer one.
    pre: ({ children }: React.ComponentPropsWithoutRef<"pre">) => <>{children}</>,
    // Wide tables scroll sideways on phones instead of stretching the page.
    table: (props: React.ComponentPropsWithoutRef<"table">) => (
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" data-lenis-prevent>
        <table {...props} />
      </div>
    ),
    code: ({
      className,
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"code">) => {
      const match = /language-(\w+)/.exec(className || "");
      const text = String(children ?? "");
      // Fenced blocks either declare a language or span multiple lines.
      if (match || text.includes("\n")) {
        return (
          <CodeBlock language={match?.[1]} className={className}>
            {children}
          </CodeBlock>
        );
      }
      return (
        <code
          className="rounded bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[0.88em] font-normal text-ink"
          {...props}
        >
          {children}
        </code>
      );
    },
    input: ({
      type,
      checked,
      ...props
    }: React.ComponentPropsWithoutRef<"input">) => {
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
    sup: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<"sup">) => {
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
  };
}

export const proseClasses =
  "prose prose-neutral mx-auto max-w-2xl lg:max-w-[44rem] xl:max-w-[46rem] prose-headings:scroll-mt-20 prose-headings:font-medium prose-headings:tracking-[-0.01em] prose-h1:mt-12 prose-h1:mb-4 prose-h1:text-[1.65rem] xl:prose-h1:text-[1.8rem] prose-h2:text-[1.3rem] prose-h3:text-[1.1rem] prose-p:text-[1rem] lg:prose-p:text-[1.0625rem] prose-p:leading-[1.8] prose-li:text-[1rem] lg:prose-li:text-[1.0625rem] prose-li:leading-[1.8] prose-hr:border-line prose-strong:font-semibold prose-a:text-accent prose-a:underline prose-a:decoration-accent/30 prose-a:underline-offset-2 hover:prose-a:decoration-accent prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none";

function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

function CodeBlock({
  language,
  className,
  children,
}: {
  language?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(nodeText(children).replace(/\n$/, ""));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <figure className="not-prose my-7 overflow-hidden rounded-lg border border-line bg-[#f3f1ea] dark:bg-card">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-1.5 font-mono text-[11px] text-muted">
        <span>{language ?? "code"}</span>
        <button type="button" onClick={copy} className="transition-colors hover:text-ink">
          {copied ? "copied" : "copy"}
        </button>
      </figcaption>
      <pre className="m-0 overflow-x-auto bg-transparent px-4 py-3.5 text-[13.5px] leading-relaxed" data-lenis-prevent>
        <code className={`${className ?? ""} !bg-transparent !p-0 font-mono`}>{children}</code>
      </pre>
    </figure>
  );
}
