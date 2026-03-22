"use client";
import React from "react";
import Newsletter from "./Newsletter";
import { FaGithub, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";
import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";

const Footer = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const goTo = (path: string) => () => {
    if (pathname === path) return;
    router.push(path);
  };

  return (
    <footer className="relative w-full min-h-[75svh] text-white bg-[#111] flex flex-col items-center justify-between py-14 sm:py-16">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-12 sm:gap-14">
        <h1 className="text-[clamp(2.5rem,12vw,8rem)] font-bold uppercase tracking-tight text-center leading-none">
          Shrit1401
        </h1>

        <div className="flex flex-col items-center gap-8 w-full">
          <Newsletter className="w-full max-w-xl" />

          <div className="flex gap-8 items-center">
            <Link
              href="https://github.com/shrit1401"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-2xl p-2 -m-2 rounded-md hover:text-[#5a7aad] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              <FaGithub />
            </Link>
            <Link
              href="https://twitter.com/shrit1401"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-2xl p-2 -m-2 rounded-md hover:text-[#5a7aad] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              <FaTwitter />
            </Link>
            <Link
              href="https://www.linkedin.com/in/shrit1401/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-2xl p-2 -m-2 rounded-md hover:text-[#5a7aad] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              <FaLinkedinIn />
            </Link>
          </div>

          <p className="text-center text-gray-300 max-w-lg leading-relaxed text-[0.95rem]">
            Oh, if you wanna connect, send me a mail at{" "}
            <a
              href="mailto:shrit1401@gmail.com"
              className="text-white underline decoration-white/35 underline-offset-2 hover:decoration-white/60 hover:text-white transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] rounded-sm"
            >
              shrit1401@gmail.com
            </a>{" "}
            or DM me on socials!
          </p>

          <nav
            className="flex flex-wrap justify-center gap-x-8 gap-y-2 items-center"
            aria-label="Site sections"
          >
            <button
              type="button"
              onClick={goTo("/research")}
              className="bg-transparent border-0 p-0 m-0 font-inherit text-inherit cursor-pointer rounded-sm hover:text-[#5a7aad] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              Research
            </button>
            <button
              type="button"
              onClick={goTo("/work")}
              className="bg-transparent border-0 p-0 m-0 font-inherit text-inherit cursor-pointer rounded-sm hover:text-[#5a7aad] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              Work
            </button>
            <button
              type="button"
              onClick={goTo("/archive")}
              className="bg-transparent border-0 p-0 m-0 font-inherit text-inherit cursor-pointer rounded-sm hover:text-[#5a7aad] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111]"
            >
              Archive
            </button>
          </nav>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-4 w-full max-w-6xl text-sm text-gray-400 pt-4 border-t border-white/[0.08]">
          <p>&copy; {new Date().getFullYear()} shrit1401</p>
          <p>
            All Rights Reserved <span className="text-xs">(I hope)</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
