"use client";
import React, { useState, useEffect, useRef, type FC } from "react";
import gsap from "gsap";
import Newsletter from "./Newsletter";
import HeroDiorama from "./HeroDiorama";
import HeroDioramaScene from "./HeroDioramaScene";
import {
  LOADER_EXIT_START,
  LOADER_EXIT_FALLBACK_MS,
} from "../lib/loader-events";

// Constants
const COLORS = {
  burgundy: "#7B3737",
  olive: "#3B4F1B",
  ochre: "#B89B2B",
  purple: "#6B46C1",
  teal: "#2C7A7B",
  coral: "#E53E3E",
} as const;

const ANIMATION_DELAYS = {
  shapes: 0.06,
  text: 0.28,
  globe: 0.1,
  bottom: 0.5,
  dontClick: 0.62,
  scrollDown: 0.7,
  newsletter: 0.36,
  subtext: 0.44,
  buttons: 0.52,
} as const;

const TimeDisplay: FC = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div className="text-sm text-gray-600">--:--:--</div>;
  return (
    <div className="text-sm text-gray-600">{time.toLocaleTimeString()}</div>
  );
};

const HeroText: FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const shapesRef = useRef<(SVGSVGElement | null)[]>([]);
  const textRef = useRef<(HTMLSpanElement | null)[]>([]);
  const globeRef = useRef<SVGSVGElement>(null);
  const bottomElementsRef = useRef<HTMLDivElement>(null);
  const dontClickRef = useRef<HTMLAnchorElement>(null);
  const scrollDownRef = useRef<HTMLAnchorElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  // Parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (orb1Ref.current)
        orb1Ref.current.style.transform = `translate(${y * 0.06}px, ${-y * 0.09}px) scale(1)`;
      if (orb2Ref.current)
        orb2Ref.current.style.transform = `translate(${-y * 0.05}px, ${y * 0.07}px) scale(1)`;
      if (orb3Ref.current)
        orb3Ref.current.style.transform = `translate(${y * 0.03}px, ${-y * 0.05}px) scale(1)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const animateShapes = () => {
      shapesRef.current.forEach((shape, index) => {
        if (!shape) return;
        gsap.fromTo(
          shape,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            delay: ANIMATION_DELAYS.shapes + 0.12 + index * 0.08,
          },
        );
      });
    };

    const animateText = () => {
      textRef.current.forEach((text, index) => {
        if (!text) return;
        gsap.fromTo(
          text,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: ANIMATION_DELAYS.text + index * 0.1,
          },
        );
      });
    };

    const animateGlobe = () => {
      // Globe spin removed — was a permanent 60fps GSAP tween with no visual payoff
    };

    const animateBottomElements = () => {
      const elements = [
        { ref: bottomElementsRef, delay: ANIMATION_DELAYS.bottom },
        { ref: dontClickRef, delay: ANIMATION_DELAYS.dontClick },
        { ref: scrollDownRef, delay: ANIMATION_DELAYS.scrollDown },
        { ref: newsletterRef, delay: ANIMATION_DELAYS.newsletter },
        { ref: subtextRef, delay: ANIMATION_DELAYS.subtext },
        { ref: buttonsRef, delay: ANIMATION_DELAYS.buttons },
      ];
      elements.forEach(({ ref, delay }) => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            delay,
          },
        );
      });
    };

    let ran = false;
    const startEntrance = () => {
      if (ran) return;
      ran = true;
      window.clearTimeout(fallbackId);
      document.removeEventListener(LOADER_EXIT_START, startEntrance);
      setIsVisible(true);
      animateShapes();
      animateText();
      animateGlobe();
      animateBottomElements();
    };

    document.addEventListener(LOADER_EXIT_START, startEntrance, { once: true });
    const fallbackId = window.setTimeout(
      startEntrance,
      LOADER_EXIT_FALLBACK_MS,
    );
    return () => {
      window.clearTimeout(fallbackId);
      document.removeEventListener(LOADER_EXIT_START, startEntrance);
    };
  }, []);

  const handleNewsletterClick = () => {
    const footer = document.querySelector("footer");
    if (footer) footer.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .hero-text { font-family: 'Playfair Display', Georgia, serif; }
        .blackletter { font-family: 'UnifrakturCook', 'IM Fell English SC', serif; }

        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 24px; background: #171717; color: #f8f6f0;
          border-radius: 999px; font-size: 0.875rem; font-family: inherit;
          letter-spacing: 0.01em; transition: background 0.2s, transform 0.15s;
          border: 1.5px solid #171717; cursor: pointer; text-decoration: none;
        }
        .hero-btn-primary:hover { background: #2e2e2e; transform: translateY(-1px); }

        .hero-btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 24px; background: transparent; color: #171717;
          border-radius: 999px; font-size: 0.875rem; font-family: inherit;
          letter-spacing: 0.01em; transition: background 0.2s, transform 0.15s;
          border: 1.5px solid rgba(23,23,23,0.25); cursor: pointer; text-decoration: none;
        }
        .hero-btn-secondary:hover { background: rgba(23,23,23,0.05); transform: translateY(-1px); }
      `}</style>

      <section
        className="w-full flex-1 flex flex-col relative px-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <HeroDiorama />

        {/* Background orbs with parallax */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            ref={orb1Ref}
            style={{
              position: "absolute",
              top: "-8%",
              right: "-6%",
              width: "clamp(280px, 38vw, 560px)",
              height: "clamp(280px, 38vw, 560px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 40%, rgba(123,55,55,0.07) 0%, transparent 70%)",
              animation: "orb-drift 38s ease-in-out infinite",
            }}
          />
          <div
            ref={orb2Ref}
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "-8%",
              width: "clamp(240px, 32vw, 480px)",
              height: "clamp(240px, 32vw, 480px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 60% 60%, rgba(59,79,27,0.065) 0%, transparent 70%)",
              animation: "orb-drift 32s ease-in-out infinite reverse",
            }}
          />
          <div
            ref={orb3Ref}
            style={{
              position: "absolute",
              top: "30%",
              right: "8%",
              width: "clamp(120px, 14vw, 200px)",
              height: "clamp(120px, 14vw, 200px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 50%, rgba(184,155,43,0.06) 0%, transparent 70%)",
              animation: "orb-drift 28s ease-in-out infinite",
              animationDelay: "-14s",
            }}
          />
          <div
            className="bg-noise absolute inset-0"
            style={{ opacity: 0.035, mixBlendMode: "multiply" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 gap-8 lg:gap-0 py-16 lg:py-0">
          {/* RIGHT — Diorama scene */}
          <div
            className="lg:order-2 lg:flex-1 w-full lg:w-auto flex items-center justify-center lg:pr-8 xl:pr-16"
            style={{ position: "relative" }}
          >
            <HeroDioramaScene />
          </div>

          {/* LEFT — text */}
          <div className="lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left lg:flex-1 lg:pl-8 xl:pl-16">
            {/* Hero text */}
            <div className="hero-text text-5xl md:text-6xl lg:text-7xl text-gray-800 leading-[1.15] tracking-[-0.01em] font-normal">
              <span className="inline-flex items-center">
                <svg
                  ref={(el) => {
                    shapesRef.current[0] = el;
                  }}
                  width="48"
                  height="48"
                  className="inline-block mr-3 -mb-2"
                  viewBox="0 0 32 32"
                  style={{ opacity: 0 }}
                >
                  <path
                    d="M16 4L28 24H4L16 4Z"
                    fill={COLORS.burgundy}
                    stroke={COLORS.burgundy}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  ref={(el) => {
                    textRef.current[0] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  I <span className="italic ml-2">am</span>
                </span>
              </span>
              <br />
              <span className="inline-flex items-center">
                <span
                  ref={(el) => {
                    textRef.current[1] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <span className="blackletter text-6xl mr-2">B</span>uilding
                </span>
                <svg
                  ref={(el) => {
                    shapesRef.current[1] = el;
                  }}
                  width="48"
                  height="48"
                  className="inline-block ml-3 -mb-2"
                  viewBox="0 0 32 32"
                  style={{ opacity: 0 }}
                >
                  <rect
                    x="4"
                    y="4"
                    width="24"
                    height="24"
                    rx="6"
                    fill={COLORS.olive}
                  />
                </svg>
              </span>
              <br />
              <span className="inline-flex items-center">
                <span
                  ref={(el) => {
                    textRef.current[2] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <span className="italic underline decoration-gray-500 decoration-2 underline-offset-4">
                    cool
                  </span>
                </span>
                <svg
                  ref={(el) => {
                    shapesRef.current[2] = el;
                  }}
                  width="48"
                  height="48"
                  className="inline-block mx-3 -mb-2"
                  viewBox="0 0 32 32"
                  style={{ opacity: 0 }}
                >
                  <circle cx="16" cy="16" r="16" fill={COLORS.ochre} />
                </svg>
                <span
                  ref={(el) => {
                    textRef.current[3] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  stuff
                </span>
              </span>
            </div>

            {/* Subtext */}
            <div
              ref={subtextRef}
              style={{ opacity: 0 }}
              className="mt-5 text-sm md:text-base text-gray-500 max-w-xs leading-relaxed tracking-wide"
            >
              Products, interfaces & ideas — built with craft and curiosity.
            </div>

            {/* CTA buttons */}
            <div
              ref={buttonsRef}
              style={{ opacity: 0 }}
              className="flex items-center gap-3 mt-7"
            >
              <a href="/work" className="hero-btn-primary">
                View Projects
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
              <button
                onClick={handleNewsletterClick}
                className="hero-btn-secondary"
              >
                Newsletter
              </button>
            </div>

            {/* Divider + Newsletter */}
            <div
              ref={newsletterRef}
              style={{ opacity: 0 }}
              className="flex flex-col items-center lg:items-start"
            >
              <div className="flex items-center gap-3 mb-8 mt-8">
                <div
                  style={{
                    width: "clamp(40px, 6vw, 80px)",
                    height: "1px",
                    background: "rgba(23,23,23,0.18)",
                  }}
                />
                <div
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "rgba(23,23,23,0.3)",
                  }}
                />
                <div
                  style={{
                    width: "clamp(40px, 6vw, 80px)",
                    height: "1px",
                    background: "rgba(23,23,23,0.18)",
                  }}
                />
              </div>
              <Newsletter className="mt-0" />
            </div>
          </div>
          {/* end LEFT column */}
        </div>

        {/* Bottom-left: name + location + time */}
        <div
          ref={bottomElementsRef}
          className="absolute bottom-4 md:bottom-8 left-4 md:left-8 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-2">
            <svg
              ref={globeRef}
              className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs md:text-sm text-black/80">
              Shrit Shrivastava
            </span>
            <span className="text-xs md:text-sm text-gray-500">•</span>
            <span className="text-xs md:text-sm text-black/80">India</span>
            <TimeDisplay />
          </div>
        </div>

        {/* Bottom-right: Made To Amaze */}
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 flex flex-col items-end gap-2 md:gap-3">
          <span
            ref={dontClickRef}
            className="text-xs md:text-sm text-black/80 transition-all duration-300"
            style={{ opacity: 0 }}
          >
            Made To Amaze
          </span>
          <a
            ref={scrollDownRef}
            href="/work"
            className="md:hidden"
            aria-label="Scroll down"
            style={{ opacity: 0 }}
          >
            <svg
              className="w-6 h-6 text-gray-700 animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>

        {/* Desktop scroll arrow — centered */}
        <a
          ref={scrollDownRef}
          href="/work"
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          aria-label="Scroll down"
          style={{ opacity: 0 }}
        >
          <svg
            className="w-8 h-8 text-gray-700 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </a>
      </section>
    </>
  );
};

export default HeroText;
