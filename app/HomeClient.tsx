"use client";

import Loader from "./components/Loader";
import HeroText from "./components/HeroText";
import Navbar from "./components/Navbar";
import AboutMe from "./components/AboutMe";
import GridLinks from "./components/GridLinks";
import { Revealer } from "./components/Revealer";
import Footer from "./components/Footer";
import type { FC } from "react";
import BuildLog from "./components/BuildLog";
import StatsBar from "./components/StatsBar";
import FeaturedProjects from "./components/FeaturedProjects";
import type { BuildProofEntry } from "@/app/lib/buildProof";

const HomeClient: FC<{ buildProofEntries: BuildProofEntry[] }> = ({
  buildProofEntries,
}) => {
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
        <GridLinks />
      </section>

      <Footer />
    </main>
  );
};

export default HomeClient;
