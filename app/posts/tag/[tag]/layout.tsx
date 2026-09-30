import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteBaseUrl } from "@/app/lib/site";
import { getResearchByTag } from "@/app/lib/researchData";

type Params = Promise<{ tag: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/posts/tag/${tagSlug}`;

  const { tagName } = getResearchByTag(tagSlug);

  if (!tagName) {
    return {
      title: "Tag",
      description: "Posts by topic.",
      alternates: { canonical },
    };
  }

  const title = `Posts: ${tagName}`;
  const description = `Articles and notes tagged "${tagName}" — posts by Shrit.`;

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
