"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  radius: number;
  phase: number;
  period: number;
  warm: boolean;
}

export default function HeroDiorama() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let w = 0;
    let h = 0;
    const particles: Particle[] = [];
    let cachedGrad: CanvasGradient | null = null;
    let lastW = 0;
    let lastH = 0;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      cachedGrad = null; // invalidate cached gradient
      for (const p of particles) {
        if (p.x > w) p.x = Math.random() * w;
        if (p.y > h) p.y = Math.random() * h;
      }
    };

    const initParticles = () => {
      particles.length = 0;
      // 20 particles instead of 38 — imperceptible difference, halves per-frame cost
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -(0.04 + Math.random() * 0.1),
          baseAlpha: 0.04 + Math.random() * 0.08,
          alpha: 0,
          radius: 0.8 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
          period: 4000 + Math.random() * 4000,
          warm: Math.random() > 0.4,
        });
      }
    };

    let startTime = performance.now();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const elapsed = now - startTime;

      // Rebuild gradient only when size changes
      if (!cachedGrad || w !== lastW || h !== lastH) {
        const cx = w * 0.6;
        const cy = h * 0.4;
        const radius = Math.min(Math.max(400, w * 0.55), 800);
        cachedGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        cachedGrad.addColorStop(0, "rgba(255,248,230,0.07)");
        cachedGrad.addColorStop(0.45, "rgba(255,245,215,0.035)");
        cachedGrad.addColorStop(1, "rgba(255,248,230,0)");
        lastW = w;
        lastH = h;
      }

      // Subtle breathing: just alpha variation, no gradient rebuild
      const breatheAlpha = 0.065 + Math.sin((elapsed / 6000) * Math.PI * 2) * 0.025;
      ctx.globalAlpha = breatheAlpha / 0.07; // normalize around 1
      ctx.fillStyle = cachedGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;

        const shimmer = Math.sin((elapsed / p.period) * Math.PI * 2 + p.phase);
        p.alpha = p.baseAlpha + shimmer * 0.02;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? `rgba(184,155,43,${p.alpha})`
          : `rgba(255,245,220,${p.alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    rafId = requestAnimationFrame(draw);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        initParticles();
      }, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
      <div
        className="bg-noise absolute inset-0"
        style={{ opacity: 0.028, mixBlendMode: "soft-light" }}
      />
    </div>
  );
}
