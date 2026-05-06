"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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

function projectLinks(project: Work): Array<{ name: string; link: string }> {
  return (project.usefullinks ?? []).filter((item) => Boolean(item?.link));
}

const GRAIN_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`,
);

const WorkInfo = () => {
  const [projects, setProjects] = useState<Work[]>([]);
  const polaroidSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getWorks();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const count = projects.length;

  useLayoutEffect(() => {
    const root = polaroidSectionRef.current;
    if (!root || count === 0) return;

    const cards = root.querySelectorAll("[data-polaroid]");
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 44, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.88,
          stagger: 0.09,
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
  }, [count, projects]);

  if (count === 0) return null;

  return (
    <>
      <section
        ref={polaroidSectionRef}
        className="workinfo-polaroid-grid relative border-t border-black/[0.08] bg-[#ebe6dc] px-4 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24 lg:px-[5vw] lg:pb-32 lg:pt-28"
        aria-label="Project gallery"
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
          <header className="mb-12 max-w-2xl md:mb-16">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.38em] text-neutral-700/75">
              Selected work
            </p>
            <h3 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-900">
              Things I&apos;ve built
            </h3>
          </header>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
            {projects.map((project, i) => {
              const href = projectPrimaryHref(project);
              const links = projectLinks(project);
              return (
                <article
                  key={`polaroid-${project.title}-${i}`}
                  data-polaroid
                  className="flex w-full justify-center"
                >
                  <div className="group/polaroid w-full max-w-[22rem] transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.2)] sm:max-w-none">
                    <div className="rounded-[3px] border border-white/90 bg-white p-3 pb-10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06]">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-[1px] bg-neutral-200 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900/35"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-200">
                          {project.image ? (
                            <img
                              src={urlFor(project.image).url()}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/polaroid:scale-[1.03]"
                              loading="lazy"
                              decoding="async"
                              onLoad={() => ScrollTrigger.refresh()}
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
                          )}
                        </div>
                      </a>
                      <div className="mt-5 min-h-[4.5rem] px-1 text-center">
                        {project.year != null && (
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-neutral-500">
                            {project.year}
                          </p>
                        )}
                        <p className="font-[family-name:var(--font-instrument-serif)] text-[1.05rem] leading-snug text-neutral-900 md:text-lg">
                          {project.title}
                        </p>
                        {links.length > 0 ? (
                          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            {links.map((item, linkIndex) => (
                              <a
                                key={`${project.title}-link-${linkIndex}`}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-neutral-900/15 bg-neutral-900/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-700 transition-colors duration-300 hover:bg-neutral-900/[0.08] hover:text-neutral-900"
                              >
                                {item.name || "Visit"}
                                <MdArrowOutward className="text-xs" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 transition-colors duration-300 hover:text-neutral-900"
                            >
                              Visit
                              <MdArrowOutward className="ml-0.5 inline align-[-2px] text-sm" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
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
