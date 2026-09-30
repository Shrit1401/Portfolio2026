import Navbar from "../components/Navbar";
import { RevealText } from "@/app/components/motion";
import Footer from "../components/Footer";
import PostList from "../components/PostList";
import { getAllResearch } from "../lib/researchData";
import { SUBSTACK_URL } from "../lib/links";

export default function PostsPage() {
  const posts = getAllResearch();

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 pt-12 sm:px-6">
        <h1 className="text-[32px] leading-tight tracking-[-0.01em] text-ink"><RevealText>Posts</RevealText></h1>
        <p className="mt-1 text-sm text-muted">
          Small posts, written whenever something is worth writing down. The weekly stuff
          lives on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="link">
            Substack
          </a>
          .
        </p>
        <div className="mt-6 border-t border-line">
          <PostList
            items={posts.map((p) => ({
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
