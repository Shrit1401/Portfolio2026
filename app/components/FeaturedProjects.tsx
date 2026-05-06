"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdArrowOutward } from "react-icons/md";
import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";
import { getWorks } from "@/app/lib/server";
import { Work } from "@/app/lib/types";
import { urlFor } from "@/sanity/lib/image";

const ProjectCard = ({
  project,
  idx,
  large,
}: {
  project: Work;
  idx: number;
  large?: boolean;
}) => {
  const links = project.usefullinks?.filter((item) => item?.link) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.1 }}
      className="group relative h-full w-full cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-neutral-900 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_26px_48px_-26px_rgba(0,0,0,0.62)]"
      style={{ background: "#111" }}
    >
      {project.image && (
        <img
          src={urlFor(project.image).width(960).quality(82).auto("format").url()}
          alt={project.title}
          className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
          draggable="false"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/58 to-black/15" aria-hidden="true" />
      <div className="absolute bottom-5 left-5 right-5 z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            {project.year}
          </span>
        </div>
        <p
          className={`text-white font-bold leading-tight tracking-tight ${large ? "text-xl" : "text-base"}`}
        >
          {project.title}
        </p>
        <p className="mt-1 text-sm text-white/72 truncate">
          {project.description}
        </p>
        {links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((link, linkIdx) => (
              <a
                key={`${project.title}-link-${linkIdx}`}
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/20 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {link.name || "Visit"}
                <MdArrowOutward className="text-xs" />
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FeaturedProjects = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Work[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getWorks();
      setProjects(data.slice(0, 3));
    };
    fetchProjects();
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="relative bg-background px-4 py-16 md:px-12 md:py-20">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10 md:mb-14"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight lowercase">
          featured projects.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
          Cleaner snapshots of recent builds, with all related project links from CMS.
        </p>
        <div className="mt-4 h-px w-full" style={{ background: "rgba(23,23,23,0.18)" }} />
      </motion.div>

      {/* Grid — single column on small screens, bento on md+ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:h-[70vh] md:[grid-template-areas:'a_a_b'_'a_a_c']">
        {projects[0] && (
          <div className="min-h-[min(52vw,300px)] md:min-h-0 h-full md:[grid-area:a]">
            <ProjectCard project={projects[0]} idx={0} large />
          </div>
        )}
        {projects[1] && (
          <div className="min-h-[min(42vw,220px)] md:min-h-0 h-full md:[grid-area:b]">
            <ProjectCard project={projects[1]} idx={1} />
          </div>
        )}
        {projects[2] && (
          <div className="min-h-[min(42vw,220px)] md:min-h-0 h-full md:[grid-area:c]">
            <ProjectCard project={projects[2]} idx={2} />
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={() => {
            if (pathname === "/work") return;
            router.push("/work");
          }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/5 text-neutral-700 font-semibold text-base tracking-wide border border-black/10 shadow-sm backdrop-blur-md hover:bg-black/10 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#37517b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          View all work
          <MdArrowOutward />
        </button>
      </div>
    </section>
  );
};

export default FeaturedProjects;
