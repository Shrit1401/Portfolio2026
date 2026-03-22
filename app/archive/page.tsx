"use client";

import BuildProofArchive from "../components/BuildProofArchive";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PastTell from "../components/PastTell";
import PastText from "../components/Pasttext";
import { Revealer } from "../components/Revealer";

export default function Past() {
  return (
    <div className="relative w-full  past">
      <Revealer />

      <div className="flex flex-col min-h-screen">
        <Navbar active="past" />
        <PastText />
      </div>
      <BuildProofArchive />
      <PastTell />
      <Footer />
    </div>
  );
}
