"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getWorks } from "@/app/lib/server";
import { Work } from "../lib/types";
import { urlFor } from "@/sanity/lib/image";
import { MdArrowOutward } from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

function projectPrimaryHref(project: Work): string {
  const first = project.usefullinks?.[0]?.link;
  return first ?? "https://github.com/Shrit1401?tab=repositories";
}

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
);

const WorkInfo = () => {
  const [projects, setProjects] = useState<Work[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const panelImgRef = useRef<HTMLImageElement>(null);
  const panelTweenRef = useRef<gsap.core.Tween | null>(null);
  const isPanelVisibleRef = useRef(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getWorks();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const count = projects.length;

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root || count === 0) return;

    const rows = root.querySelectorAll("[data-work-row]");
    if (!rows.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (imagePanelRef.current) {
        gsap.set(imagePanelRef.current, { opacity: 0, scale: 1.04 });
      }

      if (prefersReducedMotion) {
        gsap.set(rows, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        rows,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.07,
          ease: "power3.out",
          overwrite: "auto",
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [count]);

  const handleRowEnter = useCallback(
    (i: number) => {
      if (!imagePanelRef.current || !panelImgRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setHoveredIndex(i);

      const project = projects[i];
      if (!project?.image) return;

      const newSrc = urlFor(project.image).width(900).quality(80).url();

      if (panelTweenRef.current) panelTweenRef.current.kill();

      if (!isPanelVisibleRef.current) {
        panelImgRef.current.src = newSrc;
        if (prefersReducedMotion) {
          gsap.set(imagePanelRef.current, { opacity: 1, scale: 1 });
        } else {
          panelTweenRef.current = gsap.fromTo(
            imagePanelRef.current,
            { opacity: 0, scale: 1.04 },
            { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
          );
        }
        isPanelVisibleRef.current = true;
      } else {
        if (prefersReducedMotion) {
          panelImgRef.current.src = newSrc;
          return;
        }
        panelTweenRef.current = gsap.to(imagePanelRef.current, {
          opacity: 0,
          scale: 1.025,
          duration: 0.18,
          ease: "power1.in",
          onComplete: () => {
            if (!panelImgRef.current || !imagePanelRef.current) return;
            panelImgRef.current.src = newSrc;
            panelTweenRef.current = gsap.fromTo(
              imagePanelRef.current,
              { opacity: 0, scale: 1.025 },
              { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
            );
          },
        });
      }
    },
    [projects],
  );

  const handleListLeave = useCallback(() => {
    if (!imagePanelRef.current) return;
    if (panelTweenRef.current) panelTweenRef.current.kill();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(imagePanelRef.current, { opacity: 0 });
      setHoveredIndex(null);
      isPanelVisibleRef.current = false;
      return;
    }

    panelTweenRef.current = gsap.to(imagePanelRef.current, {
      opacity: 0,
      scale: 1.03,
      duration: 0.38,
      ease: "power2.in",
      onComplete: () => {
        setHoveredIndex(null);
        isPanelVisibleRef.current = false;
      },
    });
  }, []);

  if (count === 0) return null;

  return (
    <>
      <section
        ref={sectionRef}
        className="workinfo-polaroid-grid relative border-t border-black/[0.08] bg-[#ebe6dc] px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:px-[5vw] lg:pb-32 lg:pt-28"
        aria-label="Selected work"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-[88rem]">
          <div className="flex flex-col lg:flex-row lg:items-start">
            {/* Left: list column */}
            <div
              className="w-full lg:w-[55%] lg:pr-16"
              onMouseLeave={handleListLeave}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  handleListLeave();
                }
              }}
            >
              <header className="mb-12 md:mb-16">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.38em] text-neutral-700/75">
                  Selected work
                </p>
                <h3 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-900">
                  Things I&apos;ve built
                </h3>
              </header>

              <ol role="list" aria-label="Projects">
                {projects.map((project, i) => {
                  const href = projectPrimaryHref(project);
                  const isLast = i === projects.length - 1;
                  return (
                    <li key={`row-${project.title}-${i}`}>
                      <a
                        data-work-row
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title}${project.year != null ? `, ${project.year}` : ""} — visit project`}
                        className={`group/row flex items-center gap-4 sm:gap-6 border-t border-black/[0.09] py-5 sm:py-6 lg:py-7 transition-colors duration-300 hover:bg-neutral-900/[0.025] focus-visible:outline-none focus-visible:bg-neutral-900/[0.025] ${isLast ? "border-b border-black/[0.09]" : ""}`}
                        onMouseEnter={() => handleRowEnter(i)}
                        onFocus={() => handleRowEnter(i)}
                      >
                        {/* Index */}
                        <span
                          className="font-mono text-[10px] font-medium tracking-[0.28em] text-neutral-500 w-7 sm:w-9 shrink-0 text-right tabular-nums select-none"
                          aria-hidden
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        {/* Title */}
                        <span className="font-[family-name:var(--font-instrument-serif)] text-[clamp(1.35rem,2.8vw,2.15rem)] font-normal leading-[1.08] tracking-[-0.015em] text-neutral-900 flex-1 min-w-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/row:translate-x-[7px]">
                          {project.title}
                        </span>

                        {/* Year + arrow */}
                        <span className="flex items-center gap-1.5 shrink-0">
                          {project.year != null && (
                            <span className="font-mono text-[10px] font-medium tracking-[0.28em] text-neutral-500/80 tabular-nums">
                              {project.year}
                            </span>
                          )}
                          <MdArrowOutward
                            className="text-[0.95rem] text-neutral-500/70 opacity-60 transition-[transform,opacity] duration-300 group-hover/row:opacity-100 motion-safe:group-hover/row:translate-x-0.5 motion-safe:group-hover/row:-translate-y-0.5"
                            aria-hidden
                          />
                        </span>

                        {/* Mobile thumbnail */}
                        {project.image && (
                          <div className="block lg:hidden w-14 h-14 rounded-[3px] overflow-hidden shrink-0 bg-neutral-200">
                            <img
                              src={urlFor(project.image).width(120).url()}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Right: sticky image panel (desktop only) */}
            <div className="hidden lg:block lg:w-[40%]" aria-hidden="true">
              <div className="sticky top-[20vh]">
                <div
                  ref={imagePanelRef}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[4px] bg-neutral-200/60"
                  style={{ opacity: 0 }}
                >
                  <img
                    ref={panelImgRef}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    decoding="async"
                    onLoad={() => ScrollTrigger.refresh()}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
                      backgroundRepeat: "repeat",
                    }}
                  />
                  {hoveredIndex != null && projects[hoveredIndex] && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
                      <p className="font-mono text-[10px] tracking-[0.28em] text-white/60 uppercase mb-1">
                        {projects[hoveredIndex].year}
                      </p>
                      <p className="font-[family-name:var(--font-instrument-serif)] text-lg text-white leading-snug">
                        {projects[hoveredIndex].title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="workinfo-more-cta relative z-0 border-t border-black/[0.08] bg-[#e8e2d6] px-5 py-14 md:px-10 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,${GRAIN_SVG}")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="max-w-md text-sm leading-relaxed text-neutral-700/90">
            Want the full stream of experiments and repos? Everything else lives
            on GitHub.
          </p>
          <a
            href="https://github.com/Shrit1401?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-900/18 bg-neutral-900/[0.06] px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-[border-color,background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-neutral-900/40 hover:bg-neutral-900/[0.1] active:scale-[0.98]"
          >
            More projects
            <MdArrowOutward className="text-lg transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </>
  );
};

export default WorkInfo;
