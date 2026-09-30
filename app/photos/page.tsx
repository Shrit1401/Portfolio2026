import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { RevealText } from "../components/motion";
import Board from "./Board";
import { getInspirationPins } from "../lib/inspiration";

export const metadata: Metadata = {
  title: "Inspiration",
  description:
    "Things that keep Shrit building: people, books, films, music, quotes and posts.",
  openGraph: {
    title: "Inspiration | Shrit",
    description: "Things that keep Shrit building: people, books, films, music, quotes and posts.",
  },
};

export default async function InspirationPage() {
  const pins = await getInspirationPins();
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] px-4 pt-12 sm:px-8">
        <h1 className="text-[32px] leading-tight tracking-[-0.015em] text-ink">
          <RevealText>Inspiration</RevealText>
        </h1>
        <p className="mt-1 text-[16px] text-muted">Things that keep me building. Keep scrolling.</p>
        <div className="mt-10">
          <Board pins={pins} />
        </div>
        <p className="mt-8 text-center text-[13px] text-muted">that&apos;s all for now. more soon.</p>
      </main>
      <Footer />
    </>
  );
}
