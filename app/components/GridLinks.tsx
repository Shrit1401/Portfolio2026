"use client";
import React from "react";
import { useTransitionRouter } from "next-transition-router";
import { usePathname } from "next/navigation";
import { wayoutZones as zones } from "@/app/lib/wayoutZones";

const GridLinks = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();

  const handleClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (href === pathname) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      router.push(href);
    };

  return (
    <div className=" w-full">
      <div className="w-full h-full p-2 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.45fr_1fr] gap-2 md:gap-4 w-full max-w-[2000px] mx-auto">
          {zones.map((zone) => (
            <a
              key={zone.href}
              href={zone.href}
              onClick={handleClick(zone.href)}
              aria-label={`${zone.title}: ${zone.subtitle}`}
              className="group relative block overflow-hidden rounded-xl md:rounded-2xl shadow-lg outline-none
                ring-offset-2 ring-offset-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-white/40
                h-[min(78vw,440px)] sm:h-[min(70vw,480px)] lg:h-[clamp(360px,58vh,780px)]
                bg-[#0a0a0a] cursor-pointer"
            >
              <img
                src={zone.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center
                  transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                draggable={false}
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10
                  transition-opacity duration-300 group-hover:via-black/45"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6 md:pb-7">
                <p
                  className="text-2xl md:text-3xl font-semibold tracking-tight text-white lowercase
                    drop-shadow-[0_2px_24px_rgba(0,0,0,0.65)] transition-transform duration-300
                    group-hover:translate-y-[-2px]"
                >
                  {zone.title}
                </p>
                <p
                  className="mt-1 text-sm md:text-[0.9375rem] text-white/80 font-normal tracking-wide
                    transition-all duration-300 lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100
                    lg:group-hover:translate-y-0 lg:group-focus-visible:opacity-100 lg:group-focus-visible:translate-y-0"
                >
                  {zone.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridLinks;
