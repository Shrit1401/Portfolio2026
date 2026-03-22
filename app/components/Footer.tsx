"use client";
import React from "react";
import Newsletter from "./Newsletter";
import { FaGithub, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { triggerPageTransition } from "@/app/lib/triggerPageTransition";

const Footer = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const handleNavigation =
    (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (path === pathname) {
        e.preventDefault();
        return;
      }
      router.push(path, {
        onTransitionReady: triggerPageTransition,
      });
    };

  return (
    <footer className="relative w-full min-h-[75svh] text-white bg-[#111] color-white flex flex-col items-center justify-between py-12">
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center gap-12">
        <h1 className="text-[12vw] font-bold uppercase">Shrit1401</h1>

        <div className="flex flex-col items-center gap-8 w-full">
          <Newsletter className="w-full max-w-xl" />

          <div className="flex gap-8 items-center">
            <Link
              href="https://github.com/shrit1401"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-[#37517b] transition-colors duration-300"
            >
              <FaGithub />
            </Link>
            <Link
              href="https://twitter.com/shrit1401"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-[#37517b] transition-colors duration-300"
            >
              <FaTwitter />
            </Link>
            <Link
              href="https://www.linkedin.com/in/shrit1401/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl hover:text-[#37517b] transition-colors duration-300"
            >
              <FaLinkedinIn />
            </Link>
          </div>

          <p className="text-center text-gray-300">
            Oh, if you wanna connect, send me a mail at{" "}
            <a
              href="mailto:shrit1401@gmail.com"
              className="text-white underline hover:text-gray-300 transition-colors duration-300"
            >
              shrit1401@gmail.com
            </a>{" "}
            or DM me on socials!
          </p>

          <nav className="flex gap-8 items-center">
            <span
              onClick={handleNavigation("/research")}
              className="hover:text-[#37517b] transition-colors cursor-pointer duration-300"
            >
              Research
            </span>
            <span
              onClick={handleNavigation("/work")}
              className="hover:text-[#37517b] transition-colors cursor-pointer duration-300"
            >
              Work
            </span>
            <span
              onClick={handleNavigation("/archive")}
              className="hover:text-[#37517b] transition-colors cursor-pointer duration-300"
            >
              Archive
            </span>
          </nav>
        </div>

        <div className="flex justify-between gap-4 text-sm text-gray-400">
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
