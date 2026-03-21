"use client";

import { useRef } from "react";
import { useRevealer } from "../hooks/useRevealer";

type RevealerProps = {
  /** Set on the home page only — coordinates with `<Loader />`. Other routes use the black route wipe. */
  waitForLoader?: boolean;
};

export function Revealer({ waitForLoader = false }: RevealerProps) {
  const revealerRef = useRef<HTMLDivElement>(null);
  useRevealer({ waitForLoader, revealerRef });

  return (
    <div
      ref={revealerRef}
      className={waitForLoader ? "revealer" : "revealer revealer--route"}
      style={waitForLoader ? undefined : { backgroundColor: "#111" }}
    />
  );
}
