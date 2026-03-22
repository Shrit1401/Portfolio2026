"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Revealer } from "@/app/components/Revealer";
import ResearchGrid from "@/app/components/research/ResearchGrid";
import Footer from "@/app/components/Footer";
import { Research } from "@/app/lib/types";
import { client } from "@/sanity/lib/client";

export default function TagPage() {
  const params = useParams();
  const tagSlug = params.tag as string;
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagName, setTagName] = useState<string>("");

  useEffect(() => {
    const fetchResearchByTag = async () => {
      try {
        // First get the tag name
        const tagData = await client.fetch(
          `*[_type == "tag" && slug.current == "${tagSlug}"][0]`
        );

        if (!tagData) {
          setError("Tag not found");
          setLoading(false);
          return;
        }

        setTagName(tagData.name);

        // Then get all research with this tag
        const data = await client.fetch(
          `*[_type == "research" && references(*[_type == "tag" && slug.current == "${tagSlug}"]._id)] | order(date desc) {
            ...,
            "tags": tags[]-> {
              name,
              "slug": slug
            }
          }`
        );

        setResearch(data);
      } catch (err) {
        setError("Failed to load research");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchByTag();
  }, [tagSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="relative w-24 h-24">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full animate-[spin_3s_linear_infinite]"></div>
          {/* Middle ring */}
          <div className="absolute inset-2 border-4 border-gray-700 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
          {/* Inner ring */}
          <div className="absolute inset-4 border-4 border-gray-600 rounded-full animate-[spin_1s_linear_infinite]"></div>
          {/* Center dot */}
          <div className="absolute inset-[42%] bg-gray-500 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-8 text-gray-400 text-lg font-light tracking-wider animate-pulse">
          Loading thoughts..
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

  return (
    <div className="relative w-full home">
      <Revealer />

      <div className="flex flex-col">
        <Navbar active="nerd" />

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2">
            Research tagged with "{tagName}"
          </h1>
          <p className="text-gray-600 mb-8">
            {research.length} {research.length === 1 ? "article" : "articles"}{" "}
            found
          </p>
        </div>
      </div>

      <ResearchGrid research={research} />

      <Footer />
    </div>
  );
}
