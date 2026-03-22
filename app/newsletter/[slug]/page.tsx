"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import { Revealer } from "../../components/Revealer";
import Footer from "@/app/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/vs2015.css";

interface NewsletterPost {
  title: string;
  description: string;
  content: string;
  pubDate: string;
  link: string;
  image?: string;
}

export default function NewsletterPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<NewsletterPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log("Fetching feed for slug:", slug);
        const response = await fetch("/api/feed");
        const xmlText = await response.text();
        console.log("Feed response:", xmlText.substring(0, 200) + "...");

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
        console.log("Number of items found:", items.length);

        let foundPost = false;
        // Find the post that matches the slug
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const link = item.getElementsByTagName("link")[0]?.textContent || "";
          console.log("Checking item link:", link);

          // Extract the slug from the URL
          const urlSlug = link.split("/p/")[1];
          console.log("Extracted URL slug:", urlSlug);
          console.log("Comparing with requested slug:", slug);

          if (urlSlug === slug) {
            console.log("Found matching post!");
            const content =
              item.getElementsByTagName("content:encoded")[0]?.textContent ||
              "";

            // Try to find a higher quality image in the content
            let highQualityImage: string | undefined = undefined;
            const imgMatch = content.match(/src="([^"]+)"/);
            if (imgMatch && imgMatch[1]) {
              highQualityImage = imgMatch[1];
            }

            // Fall back to enclosure image if no high quality image found
            const enclosure = item.getElementsByTagName("enclosure")[0];
            const enclosureImage = enclosure?.getAttribute("url") || undefined;

            const postData: NewsletterPost = {
              title: item.getElementsByTagName("title")[0]?.textContent || "",
              description:
                item.getElementsByTagName("description")[0]?.textContent || "",
              content: content,
              pubDate:
                item.getElementsByTagName("pubDate")[0]?.textContent || "",
              link: link,
              image: highQualityImage || enclosureImage,
            };
            console.log("Post data:", postData);
            setPost(postData);
            foundPost = true;
            break;
          }
        }

        if (!foundPost) {
          console.log("No post found for slug:", slug);
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-2 border-4 border-gray-700 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 border-4 border-gray-600 rounded-full animate-[spin_1s_linear_infinite]"></div>
          <div className="absolute inset-[42%] bg-gray-500 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-8 text-gray-400 text-lg font-light tracking-wider animate-pulse">
          Loading newsletter...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-xl">Post not found</div>
      </div>
    );
  }

  return (
    <div className="relative w-full home">
      <Revealer />

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="text-gray-500 mb-8">
              {new Date(post.pubDate).toLocaleDateString()}
            </div>
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto rounded-lg mb-8"
              />
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="prose lg:prose-xl mx-auto prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 prose-headings:scroll-mt-20">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
            components={{
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
              img: ({ src, alt, ...props }) => (
                <img
                  src={src}
                  alt={alt}
                  className="rounded-lg my-4"
                  {...props}
                />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>

      {/* Floating Substack — above Navbar’s fixed NowPlaying (bottom-4 / md:bottom-8) */}
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-[#FF6719] px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:px-8 sm:py-4 md:bottom-24 md:right-8"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
        >
          <path
            d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"
            fill="currentColor"
          />
        </svg>
        <span className="font-semibold text-lg">Read on Substack</span>
      </a>

      <Footer />
    </div>
  );
}
