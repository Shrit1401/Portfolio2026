import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { RevealText } from "@/app/components/motion";
import Footer from "@/app/components/Footer";
import PostList from "@/app/components/PostList";
import { getResearchByTag } from "@/app/lib/researchData";

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const { research, tagName } = getResearchByTag(tag);
  if (!tagName) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 pt-12 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-wide text-accent">tag</p>
        <h1 className="text-[32px] leading-tight tracking-[-0.01em] text-ink"><RevealText>{tagName}</RevealText></h1>
        <div className="mt-6 border-t border-line">
          <PostList
            items={research.map((p) => ({
              href: `/posts/${p.slug.current}`,
              title: p.title,
              description: p.description,
              date: p.date,
              image: p.cover,
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
