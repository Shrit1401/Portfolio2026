import type { Metadata } from "next";
import type { ReactNode } from "react";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { getSiteBaseUrl } from "@/app/lib/site";

type Params = Promise<{ tag: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/research/tag/${tagSlug}`;

  const tagDoc = await client.fetch(
    groq`*[_type == "tag" && slug.current == $slug][0]{ name, "slug": slug.current }`,
    { slug: tagSlug },
  );

  if (!tagDoc?.name) {
    return {
      title: "Tag",
      description: "Research articles by topic.",
      alternates: { canonical },
    };
  }

  const title = `Research: ${tagDoc.name}`;
  const description = `Articles and notes tagged “${tagDoc.name}” — research by Shrit.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ResearchTagLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
