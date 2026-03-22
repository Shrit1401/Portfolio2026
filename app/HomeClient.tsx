"use client";

import dynamic from "next/dynamic";
import type { FC } from "react";
import Loader from "./components/Loader";
import HeroText from "./components/HeroText";
import Navbar from "./components/Navbar";
import AboutMe from "./components/AboutMe";
import { Revealer } from "./components/Revealer";
import Footer from "./components/Footer";
import type { BuildProofEntry } from "@/app/lib/buildProof";
import type { WorkGalleryItem } from "@/app/lib/workGallery";

const BuildLog = dynamic(() => import("./components/BuildLog"));
const StatsBar = dynamic(() => import("./components/StatsBar"));
const FeaturedProjects = dynamic(() => import("./components/FeaturedProjects"));
const RopePolaroidGallery = dynamic(
  () => import("./components/RopePolaroidGallery"),
);
const GridLinks = dynamic(() => import("./components/GridLinks"));

const HomeClient: FC<{
  buildProofEntries: BuildProofEntry[];
  ropeGalleryItems: WorkGalleryItem[];
}> = ({ buildProofEntries, ropeGalleryItems }) => {
  return (
    <main className="relative w-full home">
      <Loader />
      <Revealer waitForLoader />

      <div className="flex flex-col min-h-screen">
        <Navbar />

        <HeroText />
      </div>

      <section className="content-sections">
        <AboutMe />
        <BuildLog entries={buildProofEntries} />
        <StatsBar />
        <FeaturedProjects />
        <RopePolaroidGallery items={ropeGalleryItems} />
        <GridLinks />
      </section>

      <Footer />
    </main>
  );
};

export default HomeClient;
