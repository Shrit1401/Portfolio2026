import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WorkTell = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const titlesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const cardPositions = [
    { top: "30%", left: "55%", text: "trophies" },
    { top: "20%", left: "25%", text: "me dotty" },
    { top: "50%", left: "10%", text: "a tree lol" },
    { top: "60%", left: "40%", text: "my dog" },
    { top: "30%", left: "30%", text: "dream to reality" },
    { top: "60%", left: "60%", text: "i look cool" },
    { top: "20%", left: "50%", text: "when i was popular" },
    { top: "60%", left: "10%", text: "kiddos" },
    { top: "20%", left: "40%", text: "it will be mine" },
    { top: "45%", left: "55%", text: "sinisters" },
  ];

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize cards
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      gsap.set(card, {
        z: -50000,
        scale: 0,
      });
    });

    // Create scroll trigger animation for horizontal scroll
    const moveDist = window.innerWidth * 3;
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".sticky",
      start: "top top",
      end: `+=${window.innerHeight * 5}px`,
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        const vel = self.getVelocity();
        const normalizedVel = vel / Math.abs(vel) || 0;
        const maxOffset = 30;
        const curSpeed = Math.min(Math.abs(vel / 500), maxOffset);
        const isAtEdge = self.progress <= 0 || self.progress >= 1;

        // Direct mapping from scroll progress — avoid gsap.to on every tick (kills FPS).
        gsap.set(titlesContainerRef.current, {
          x: -moveDist * self.progress,
        });

        const titles = document.querySelectorAll(".title");
        titles.forEach((title) => {
          const title1 = title.querySelector(".title-1");
          const title2 = title.querySelector(".title-2");
          const title3 = title.querySelector(".title-3");

          if (isAtEdge) {
            if (title1 && title2) {
              gsap.set([title1, title2], {
                xPercent: -50,
                x: 0,
              });
            }
          } else {
            const baseoffset = normalizedVel * curSpeed;

            if (title1) {
              gsap.set(title1, {
                xPercent: -50,
                x: `${baseoffset * 8}px`,
              });
            }

            if (title2) {
              gsap.set(title2, {
                xPercent: -50,
                x: `${baseoffset * 4}px`,
              });
            }
          }

          gsap.set(title3, {
            xPercent: -50,
            x: 0,
          });
        });

        cards.forEach((card, index) => {
          const staggerOffset = index * 0.075;
          const scaledProgress = (self.progress - staggerOffset) * 3;
          const individualProgress = Math.max(0, Math.min(1, scaledProgress));
          const targetZ = index === cards.length - 1 ? 1500 : 2000;
          const newz = -50000 + (targetZ + 50000) * individualProgress;
          const scaleProgress = Math.min(1, individualProgress * 10);
          const scale = Math.max(0, Math.min(1, scaleProgress));

          gsap.set(card, {
            z: newz,
            scale: scale,
          });
        });
      },
    });

    // Cleanup function
    return () => {
      // Kill all GSAP animations
      gsap.killTweensOf("*");

      // Kill ScrollTrigger instance
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }

      // Clear all ScrollTrigger instances
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="sticky">
      <div ref={titlesContainerRef} className="titles">
        <div className="title text-center">
          <h1 className="title-1 text-6xl font-bold">The only way to do</h1>
          <h1 className="title-2 text-6xl font-bold">The only way to do</h1>
          <h1 className="title-3 text-6xl font-bold">The only way to do</h1>
        </div>
        <div className="title text-center">
          <h1 className="title-1 text-4xl text-gray-300 mt-2">great work</h1>
          <h1 className="title-2 text-4xl text-gray-300 mt-2">great work</h1>
          <h1 className="title-3 text-4xl text-gray-300 mt-2">great work</h1>
        </div>
        <div className="title text-center">
          <h1 className="title-1 text-2xl italic text-gray-400 mt-1">
            is to love
          </h1>
          <h1 className="title-2 text-2xl italic text-gray-400 mt-1">
            is to love
          </h1>
          <h1 className="title-3 text-2xl italic text-gray-400 mt-1">
            is to love
          </h1>
        </div>
        <div className="title text-center">
          <h1 className="title-1 text-xl text-white mt-3 font-medium">
            what you do.
          </h1>
          <h1 className="title-2 text-xl text-white mt-3 font-medium">
            what you do.
          </h1>
          <h1 className="title-3 text-xl text-white mt-3 font-medium">
            what you do.
          </h1>
          <p className="text-sm text-gray-500 mt-1">– Steve Jobs</p>
        </div>
      </div>
      <div ref={imagesContainerRef} className="images">
        {cardPositions.map((pos, index) => (
          <div
            key={index}
            className={`card card-${index + 1}`}
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            <div className="card-content">
              <img
                src={`/work/img-${index + 1}.jpeg`}
                alt={`Card ${index + 1}`}
                style={{ width: "100%", height: "auto" }}
              />
              <p className="card-text">{pos.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkTell;
