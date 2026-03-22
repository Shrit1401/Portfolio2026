import { Metadata } from "next";
import { getResearchFromSlug } from "@/app/lib/server";
import { urlFor } from "@/sanity/lib/image";
import ResearchPageClient from "./ResearchPageClient";
type Params = Promise<{ singleThought: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { singleThought } = await params;
  const research = await getResearchFromSlug(singleThought);

  if (!research || research.length === 0) {
    return {
      title: "Research Not Found",
      description: "The requested research article could not be found.",
    };
  }

  const data = research[0];
  const imageUrl = urlFor(data.image).url();

  return {
    title: data.title + " | Shrit",
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description + " | Shrit",
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
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description + " | Shrit",
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

  return <ResearchPageClient research={research[0]} />;
}
