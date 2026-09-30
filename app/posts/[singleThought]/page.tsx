import { Metadata } from "next";
import { getResearchBySlug } from "@/app/lib/researchData";
import ResearchPageClient from "./ResearchPageClient";
import { getSiteBaseUrl } from "@/app/lib/site";

type Params = Promise<{ singleThought: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { singleThought } = await params;
  const data = getResearchBySlug(singleThought);
  const baseUrl = getSiteBaseUrl();

  if (!data) {
    return {
      title: "Research Not Found",
      description: "The requested research article could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const canonical = `${baseUrl}/posts/${singleThought}`;
  // Share previews use the post's cover still when it has one.
  const ogImage = data.cover ? `${baseUrl}${data.cover}` : `${baseUrl}/opengraph-image.png`;
  const keywords = data.tags?.map((t) => t.name) ?? [];

  return {
    title: data.title,
    description: data.description,
    keywords,
    authors: [{ name: "Shrit", url: baseUrl }],
    alternates: { canonical },
    openGraph: {
      title: data.title,
      description: data.description,
      url: canonical,
      type: "article",
      publishedTime: data.date,
      authors: ["Shrit"],
      tags: keywords,
      images: [
        {
          url: ogImage,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@shrit1401",
      creator: "@shrit1401",
      title: data.title,
      description: data.description,
      images: [{ url: ogImage, alt: data.title }],
    },
  };
}

export default async function ResearchPage({ params }: { params: Params }) {
  const { singleThought } = await params;
  const data = getResearchBySlug(singleThought);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-xl">Research not found</div>
      </div>
    );
  }

  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/posts/${singleThought}`;
  // Share previews use the post's cover still when it has one.
  const ogImage = data.cover ? `${baseUrl}${data.cover}` : `${baseUrl}/opengraph-image.png`;
  const keywords = data.tags?.map((t) => t.name) ?? [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    keywords: keywords.join(", "),
    datePublished: data.date,
    dateModified: data.date,
    url: canonical,
    image: ogImage,
    author: {
      "@type": "Person",
      name: "Shrit",
      url: baseUrl,
      sameAs: ["https://twitter.com/Shrit1401"],
    },
    publisher: {
      "@type": "Person",
      name: "Shrit",
      url: baseUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <ResearchPageClient research={data} />
    </>
  );
}
