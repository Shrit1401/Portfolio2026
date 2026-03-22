import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Newsletter from "../Newsletter";
import NowPlaying from "../NowPlaying";

const TimeDisplay = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="text-sm text-white/80">--:--:--</div>;
  }

  return (
    <div className="text-sm text-white/50">{time.toLocaleTimeString()}</div>
  );
};

const ResearchText = ({
  title,
  time,
  date,
  img,
}: {
  title: string;
  time: string;
  date: string;
  img: string;
}) => {
  const [animate, setAnimate] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const shapesRef = useRef<(SVGSVGElement | null)[]>([]);
  const textRef = useRef<(HTMLSpanElement | null)[]>([]);
  const globeRef = useRef<SVGSVGElement>(null);
  const bottomElementsRef = useRef<HTMLDivElement>(null);
  const dontClickRef = useRef<HTMLDivElement>(null);
  const scrollDownRef = useRef<HTMLAnchorElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start animation immediately
    setAnimate(true);
    setIsVisible(true);

    // Animate shapes with increased delay
    shapesRef.current.forEach((shape, index) => {
      if (shape) {
        gsap.fromTo(
          shape,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.5 + index * 0.2,
          }
        );

        // Add subtle continuous rotation with different delays
        gsap.to(shape, {
          rotation: 360,
          duration: 20 + index * 5,
          repeat: -1,
          ease: "none",
          transformOrigin: "center center",
          delay: index * 2,
        });

        // Color transition animation

        gsap.to(shape, {
          fill: "white",
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: index * 1.5,
        });
      }
    });

    // Animate text with increased delay
    textRef.current.forEach((text, index) => {
      if (text) {
        gsap.fromTo(
          text,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power2.out",
            delay: 1.25 + index * 0.18,
          }
        );
      }
    });

    // Animate globe with increased delay
    if (globeRef.current) {
      gsap.to(globeRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });
    }

    // Animate bottom elements
    if (bottomElementsRef.current) {
      gsap.fromTo(
        bottomElementsRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: 1.25,
        }
      );
    }

    // Animate "Don't Click Me" link
    if (dontClickRef.current) {
      gsap.fromTo(
        dontClickRef.current,
        { x: 20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: 1.45,
        }
      );
    }

    // Animate scroll down arrow
    if (scrollDownRef.current) {
      gsap.fromTo(
        scrollDownRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: 1.65,
        }
      );
    }

    // Animate newsletter
    if (newsletterRef.current) {
      gsap.fromTo(
        newsletterRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          delay: 1.75,
        }
      );
    }
  }, []);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=UnifrakturCook:wght@700&display=swap');
          
          .hero-text {
            font-family: 'Playfair Display', Georgia, serif;
          }
          
          .blackletter {
            font-family: 'UnifrakturCook', 'IM Fell English SC', serif;
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes subtleZoom {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .animated-bg {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              45deg,
              rgba(0, 0, 0, 0.7) 0%,
              rgba(0, 0, 0, 0.5) 50%,
              rgba(0, 0, 0, 0.7) 100%
            );
            background-size: 200% 200%;
            animation: gradientShift 15s ease infinite;
          }

          .bg-image {
            animation: subtleZoom 20s ease-in-out infinite;
          }
        `}
      </style>

      <section
        className="w-full flex flex-col items-center justify-center flex-1 px-4 relative min-h-screen overflow-hidden"
        style={{
          opacity: 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <div
          className="absolute inset-0 bg-image"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="animated-bg" />
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="hero-text text-center text-4xl md:text-5xl lg:text-6xl text-white leading-snug font-normal">
            <span className="inline-flex items-center">
              <svg
                ref={(el) => {
                  shapesRef.current[0] = el;
                }}
                width="48"
                height="48"
                className="inline-block mr-3 -mb-2"
                viewBox="0 0 32 32"
                style={{ opacity: 1 }}
              >
                <path
                  d="M16 4L28 24H4L16 4Z"
                  fill="white"
                  rx="2"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                ref={(el) => {
                  textRef.current[0] = el;
                }}
                style={{ opacity: 1 }}
              >
                <span className="text-white">{title}</span>
              </span>
            </span>
          </div>

          <div className="flex flex-col text-center gap-2 mt-2 text-sm text-white/80">
            {time} •{" "}
            {new Date(date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>

        <div
          ref={bottomElementsRef}
          className="absolute bottom-4 md:bottom-8 left-4 md:left-8 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-[calc(100%-2rem)] md:w-auto"
          style={{ opacity: 0 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <svg
                ref={globeRef}
                className="w-4 h-4 md:w-5 md:h-5 text-white/50"
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
              <span className="text-xs md:text-sm text-white/80">
                Shrit Shrivastava
              </span>
              <span className="text-xs md:text-sm text-white">•</span>
              <span className="text-xs md:text-sm text-white/80">India</span>
            </div>
            <TimeDisplay />
          </div>
        </div>
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 z-20 flex max-w-[min(100vw-2rem,420px)] flex-col items-end gap-2 md:gap-3">
          <div
            ref={dontClickRef}
            className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs md:text-sm text-white/80 transition-all duration-300"
            style={{ opacity: 0 }}
          >
            <span className="whitespace-nowrap">Made To Amaze</span>
            <NowPlaying />
          </div>
          <a
            ref={scrollDownRef}
            href="/work"
            className="md:hidden"
            aria-label="Scroll down"
            style={{ opacity: 0 }}
          >
            <svg
              className="w-6 h-6 text-white animate-bounce"
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
        <a
          ref={scrollDownRef}
          href="/work"
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
          aria-label="Scroll down"
          style={{ opacity: 0 }}
        >
          <svg
            className="w-8 h-8 text-white animate-bounce"
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

export default ResearchText;
