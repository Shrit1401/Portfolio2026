import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-10 pt-16 text-center sm:px-6">
        <img src="/me/shook.gif" alt="me, shook" width={300} height={376} className="w-44 rounded-sm sm:w-56" />
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="mt-1 text-[32px] leading-tight tracking-[-0.01em] text-ink">this page doesn&apos;t exist.</h1>
        <p className="mt-2 text-muted">
          maybe it never did. try the <Link href="/" className="link">homepage</Link> or the{" "}
          <Link href="/posts" className="link">posts</Link>.
        </p>
      </main>
      <Footer />
    </>
  );
}
