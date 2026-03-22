"use client";

import Navbar from "../components/Navbar";
import { Revealer } from "../components/Revealer";
import NerdText from "../components/NerdText";
import ResearchGrid from "../components/research/ResearchGrid";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { Research } from "../lib/types";
import { getResearchs } from "../lib/server";

export default function Home() {
  const [research, setResearch] = useState<Research[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log(research);

  useEffect(() => {
    const fetchResearches = async () => {
      try {
        const projectsData = await getResearchs();
        console.log(projectsData);

        setResearch(projectsData);
      } catch (err) {
        setError("Failed to fetch projects.");
        console.error(err);
      }
    };

    fetchResearches();
  }, []);

  if (error || research == undefined) return <div>{error}</div>;
  return (
    <div className="relative w-full home">
      <Revealer />

      <div className="flex flex-col min-h-screen">
        <Navbar active="nerd" />
        <NerdText />
      </div>

      <ResearchGrid key={research.length} research={research} />

      <Footer />
    </div>
  );
}
