"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdArrowOutward } from "react-icons/md";
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
  const firstLink = project.usefullinks?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.1 }}
      className="group relative w-full h-full rounded-2xl overflow-hidden shadow-lg cursor-pointer ring-1 ring-[#37517b]/30 hover:ring-[#37517b]/70 transition-all duration-400"
      style={{ background: "#111" }}
    >
      {project.image && (
        <img
          src={urlFor(project.image).url()}
          alt={project.title}
          className="w-full h-full object-cover object-center group-hover:brightness-110 group-hover:scale-[1.02] transition-all duration-500"
          draggable="false"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
        aria-hidden="true"
      />
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
        <p className="text-white/70 text-sm mt-1 truncate">
          {project.description}
        </p>
        {firstLink && (
          <a
            href={firstLink.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-white/80 hover:text-white text-xs font-semibold transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {firstLink.name}
            <MdArrowOutward className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

const FeaturedProjects = () => {
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
    <section className="relative px-4 md:px-12 py-16 md:py-20 bg-[#f8f6f0]">
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
        <div
          className="mt-4 h-px w-full"
          style={{ background: "rgba(23,23,23,0.18)" }}
        />
      </motion.div>

      {/* Grid — single-col on mobile, asymmetric bento on desktop */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gridTemplateAreas: `
            "a a b"
            "a a c"
          `,
          height: "70vh",
        }}
      >
        {projects[0] && (
          <div className="h-full" style={{ gridArea: "a" }}>
            <ProjectCard project={projects[0]} idx={0} large />
          </div>
        )}
        {projects[1] && (
          <div className="h-full" style={{ gridArea: "b" }}>
            <ProjectCard project={projects[1]} idx={1} />
          </div>
        )}
        {projects[2] && (
          <div className="h-full" style={{ gridArea: "c" }}>
            <ProjectCard project={projects[2]} idx={2} />
          </div>
        )}
      </div>

      {/* View all link */}
      <div className="flex justify-end mt-8">
        <a
          href="/work"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/5 text-neutral-700 font-semibold text-base tracking-wide border border-black/10 shadow-sm backdrop-blur-md hover:bg-black/10 transition-colors"
        >
          View all work
          <MdArrowOutward />
        </a>
      </div>
    </section>
  );
};

export default FeaturedProjects;
