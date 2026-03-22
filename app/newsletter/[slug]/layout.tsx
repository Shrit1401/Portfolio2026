import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSubstackPostBySlug } from "@/app/lib/substackFeed";
import { getSiteBaseUrl } from "@/app/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/newsletter/${slug}`;

  const post = await getSubstackPostBySlug(slug);

  if (!post) {
    return {
      title: "Newsletter",
      description: "Newsletter posts from Shrit.",
      alternates: { canonical },
    };
  }

  const title = post.title;
  const description =
    post.description || `Newsletter post: ${post.title}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.pubDate,
      images: post.image
        ? [{ url: post.image, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default function NewsletterSlugLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
