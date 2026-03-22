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

const BuildLog = dynamic(() => import("./components/BuildLog"));
const StatsBar = dynamic(() => import("./components/StatsBar"));
const FeaturedProjects = dynamic(() => import("./components/FeaturedProjects"));
const GridLinks = dynamic(() => import("./components/GridLinks"));

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
