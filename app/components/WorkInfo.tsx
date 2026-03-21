"use client";
import React, { useEffect, useRef, useState } from "react";
import { getWorks } from "@/app/lib/server";
import { Work } from "../lib/types";
import { urlFor } from "@/sanity/lib/image";
import { MdArrowOutward } from "react-icons/md";

const WorkInfo = () => {
  const [projects, setProjects] = useState<Work[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getWorks();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  return (
    <div className="workinfo-section flex py-10 items-center justify-center">
      <div className="w-full px-4 z-20">
        <h2 className="workinfo-title text-3xl md:text-5xl font-bold text-neutral-900 mb-10 tracking-tight text-left">
          Cool Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project, idx) => {
            return (
              <div
                key={project.title}
                className="relative flex flex-col items-start gap-4 pb-10"
                style={{
                  background: "#FAF8F2",
                  borderRadius: "2.5rem",
                  padding: "2.5rem",
                  boxShadow: "none",
                  border: "none",
                }}
              >
                {/* Image box */}
                <div
                  className="flex items-center justify-center w-full mb-6"
                  style={{
                    background: "#D9D9D9",
                    borderRadius: "1.2rem",
                    width: "100%",
                    height: "320px",
                    maxWidth: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {project.image ? (
                    <img
                      src={urlFor(project.image).url()}
                      alt={project.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "1.2rem",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "#222",
                        fontWeight: 700,
                        fontSize: "2rem",
                      }}
                    >
                      image
                    </span>
                  )}
                </div>
                {/* Title and year */}
                <div className="flex w-full items-center justify-between mb-2">
                  <h2 className="text-5xl font-black text-neutral-900 tracking-tight">
                    {project.title}
                  </h2>
                  <span className="text-3xl font-bold text-neutral-400">
                    {project.year}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-lg text-neutral-900">
                    {project.description}
                  </p>
                </div>
                {/* Links */}
                <div className="flex flex-col gap-2 mt-2">
                  {project.usefullinks?.slice(0, 2).map((link: any) => (
                    <a
                      key={link.name}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sky-600 font-bold text-lg leading-tight hover:text-sky-800 transition-all relative w-fit"
                    >
                      <span className="flex items-center">
                        {link.name}
                        <MdArrowOutward className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </span>
                      <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-sky-600 transition-all duration-300 group-hover:w-0" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-12">
          <a
            href="https://github.com/Shrit1401?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 rounded-full bg-black/5 text-neutral-700 font-semibold text-base tracking-wide border border-black/10 shadow-sm backdrop-blur-md"
          >
            More Projects
          </a>
        </div>
      </div>
    </div>
  );
};

export default WorkInfo;
