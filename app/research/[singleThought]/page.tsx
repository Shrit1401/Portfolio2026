import { Metadata } from "next";
import { getResearchFromSlug } from "@/app/lib/server";
import { urlFor } from "@/sanity/lib/image";
import type { Research } from "@/app/lib/types";
import ResearchPageClient from "./ResearchPageClient";
import { getSiteBaseUrl } from "@/app/lib/site";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

type Params = Promise<{ singleThought: string }>;

type ResearchDoc = Omit<Research, "image"> & {
  image: SanityImageSource;
  _updatedAt?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { singleThought } = await params;
  const research = await getResearchFromSlug(singleThought);
  const baseUrl = getSiteBaseUrl();

  if (!research || research.length === 0) {
    return {
      title: "Research Not Found",
      description: "The requested research article could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const data = research[0] as ResearchDoc;
  const imageUrl = urlFor(data.image).url();
  const canonical = `${baseUrl}/research/${singleThought}`;
  const updatedAt =
    "_updatedAt" in data && typeof data._updatedAt === "string"
      ? data._updatedAt
      : undefined;

  return {
    title: data.title,
    description: data.description,
    alternates: { canonical },
    openGraph: {
      title: data.title,
      description: data.description,
      url: canonical,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
      type: "article",
      publishedTime: data.date,
      modifiedTime: updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      site: "@shrit1401",
      creator: "@shrit1401",
      title: data.title,
      description: data.description,
      images: [imageUrl],
    },
  };
}

export default async function ResearchPage({ params }: { params: Params }) {
  const { singleThought } = await params;
  const research = await getResearchFromSlug(singleThought);

  if (!research || research.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-xl">Research not found</div>
      </div>
    );
  }

  const data = research[0] as ResearchDoc;
  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/research/${singleThought}`;
  const imageUrl = urlFor(data.image).url();
  const updatedAt =
    "_updatedAt" in data && typeof data._updatedAt === "string"
      ? data._updatedAt
      : data.date;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    image: imageUrl,
    datePublished: data.date,
    dateModified: updatedAt,
    author: {
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
      <ResearchPageClient research={data as Research} />
    </>
  );
}
