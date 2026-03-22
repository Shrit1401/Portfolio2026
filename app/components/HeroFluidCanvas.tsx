"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { displayShader, fluidShader, vertexShader } from "../lib/fluidShaders";

/** Lower = fewer pixels shaded per frame (fluid is a soft background). */
const PIXEL_RATIO_SCALE = 0.62;
const MAX_PIXEL_RATIO = 1.35;

const FLUID_CONFIG = {
  /* Wider, stronger brush so strokes read clearly on a near-#f8f6f0 field */
  brushsize: 56.0,
  brushStrength: 0.78,
  distortionAmount: 2.35,
  fluidDecay: 0.98,
  trailLength: 0.92,
  stopDecay: 0.85,
  /* Neutral cream theme — tight around #f8f6f0 so it stays cool/off-white, not sandy */
  color1: "#f8f6f0",
  color2: "#ebe9e3",
  color3: "#f2f0ea",
  color4: "#dedbd4",
  colorIntensity: 0.94,
  softness: 2.0,
} as const;

function hexToRGB(hex: string): [number, number, number] {
  if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) {
    throw new Error("Invalid hex color format. Expected #RRGGBB.");
  }
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

/**
 * Full-viewport fluid background (ping-pong FBO + display shader).
 * Sized from the container via ResizeObserver so layout matches CSS (not window-only).
 */
export default function HeroFluidCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const cfg = FLUID_CONFIG;
    let bufW = 0;
    let bufH = 0;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    if (!renderer.getContext()) {
      renderer.dispose();
      return;
    }

    const canvas = renderer.domElement;
    canvas.style.display = "block";
    renderer.setClearColor(new THREE.Color("#f8f6f0"), 1);
    container.appendChild(canvas);

    /* Half-float color RTs are much more reliable than full FloatType on mobile GPUs. */
    const rtOpts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    } as const;

    const fluidTarget1 = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    const fluidTarget2 = new THREE.WebGLRenderTarget(1, 1, rtOpts);

    let currentFloatTarget = fluidTarget1;
    let previousFloatTarget = fluidTarget2;
    let frameCount = 0;

    const fluidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        iFrame: { value: 0 },
        iPreviousFrame: { value: null },
        uBrushSize: { value: cfg.brushsize },
        uBrushStrength: { value: cfg.brushStrength },
        uFluidDecay: { value: cfg.fluidDecay },
        uTrailLength: { value: cfg.trailLength },
        uStopDecay: { value: cfg.stopDecay },
      },
      vertexShader,
      fragmentShader: fluidShader,
    });

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        iFluid: { value: null },
        uDistortionAmount: { value: cfg.distortionAmount },
        uColor1: { value: new THREE.Color(...hexToRGB(cfg.color1)) },
        uColor2: { value: new THREE.Color(...hexToRGB(cfg.color2)) },
        uColor3: { value: new THREE.Color(...hexToRGB(cfg.color3)) },
        uColor4: { value: new THREE.Color(...hexToRGB(cfg.color4)) },
        uColorIntensity: { value: cfg.colorIntensity },
        uSoftness: { value: cfg.softness },
      },
      vertexShader,
      fragmentShader: displayShader,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const fluidPlane = new THREE.Mesh(geometry, fluidMaterial);
    const displayPlane = new THREE.Mesh(geometry, displayMaterial);

    let mx = 0;
    let my = 0;
    let pmx = 0;
    let pmy = 0;
    let lastMoveTime = 0;

    const syncBuffersToContainer = (cssW: number, cssH: number) => {
      const w = Math.floor(cssW);
      const h = Math.floor(cssH);
      if (w < 2 || h < 2) {
        bufW = 0;
        bufH = 0;
        return;
      }
      if (w === bufW && h === bufH) return;
      bufW = w;
      bufH = h;
      const pr = Math.min(
        (window.devicePixelRatio || 1) * PIXEL_RATIO_SCALE,
        MAX_PIXEL_RATIO,
      );
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      fluidTarget1.setSize(
        renderer.domElement.width,
        renderer.domElement.height,
      );
      fluidTarget2.setSize(
        renderer.domElement.width,
        renderer.domElement.height,
      );
      fluidMaterial.uniforms.iResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
      );
      displayMaterial.uniforms.iResolution.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
      );
      frameCount = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pmx = mx;
      pmy = my;
      if (rect.width > 0 && rect.height > 0) {
        const scaleX = renderer.domElement.width / rect.width;
        const scaleY = renderer.domElement.height / rect.height;
        mx = (e.clientX - rect.left) * scaleX;
        my = (rect.height - (e.clientY - rect.top)) * scaleY;
        lastMoveTime = performance.now();
        fluidMaterial.uniforms.iMouse.value.set(mx, my, pmx, pmy);
      }
    };

    const onMouseLeave = () => {
      fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
    };

    let rafId = 0;
    let paused = true;
    let heroInView = true;

    const tick = () => {
      if (paused) return;
      rafId = window.requestAnimationFrame(tick);
      if (bufW < 2 || bufH < 2) return;

      const time = performance.now() * 0.001;
      fluidMaterial.uniforms.iTime.value = time;
      displayMaterial.uniforms.iTime.value = time;
      fluidMaterial.uniforms.iFrame.value = frameCount;

      if (performance.now() - lastMoveTime > 100) {
        fluidMaterial.uniforms.iMouse.value.set(0, 0, 0, 0);
      }

      fluidMaterial.uniforms.uBrushSize.value = cfg.brushsize;
      fluidMaterial.uniforms.uBrushStrength.value = cfg.brushStrength;
      fluidMaterial.uniforms.uFluidDecay.value = cfg.fluidDecay;
      fluidMaterial.uniforms.uTrailLength.value = cfg.trailLength;
      fluidMaterial.uniforms.uStopDecay.value = cfg.stopDecay;
      displayMaterial.uniforms.uDistortionAmount.value = cfg.distortionAmount;
      displayMaterial.uniforms.uColorIntensity.value = cfg.colorIntensity;
      displayMaterial.uniforms.uSoftness.value = cfg.softness;
      displayMaterial.uniforms.uColor1.value.set(...hexToRGB(cfg.color1));
      displayMaterial.uniforms.uColor2.value.set(...hexToRGB(cfg.color2));
      displayMaterial.uniforms.uColor3.value.set(...hexToRGB(cfg.color3));
      displayMaterial.uniforms.uColor4.value.set(...hexToRGB(cfg.color4));

      fluidMaterial.uniforms.iPreviousFrame.value = previousFloatTarget.texture;
      renderer.setRenderTarget(currentFloatTarget);
      renderer.render(fluidPlane, camera);
      displayMaterial.uniforms.iFluid.value = currentFloatTarget.texture;
      renderer.setRenderTarget(null);
      renderer.render(displayPlane, camera);

      const temp = currentFloatTarget;
      currentFloatTarget = previousFloatTarget;
      previousFloatTarget = temp;
      frameCount++;
    };

    const syncRunningState = () => {
      const shouldRun = !document.hidden && heroInView;
      if (shouldRun) {
        if (paused) {
          paused = false;
          rafId = window.requestAnimationFrame(tick);
        }
      } else {
        if (!paused) {
          paused = true;
          window.cancelAnimationFrame(rafId);
        }
      }
    };

    const onVisibility = () => {
      syncRunningState();
    };

    const io = new IntersectionObserver(
      (entries) => {
        heroInView = entries.some((e) => e.isIntersecting);
        syncRunningState();
      },
      { root: null, rootMargin: "80px 0px", threshold: 0 },
    );
    io.observe(container);

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      syncBuffersToContainer(cr.width, cr.height);
    });
    ro.observe(container);
    syncBuffersToContainer(container.clientWidth, container.clientHeight);

    document.addEventListener("visibilitychange", onVisibility);
    syncRunningState();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      paused = true;
      window.cancelAnimationFrame(rafId);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);

      fluidTarget1.dispose();
      fluidTarget2.dispose();
      geometry.dispose();
      fluidMaterial.dispose();
      displayMaterial.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return <div ref={containerRef} className="gradient-canvas" aria-hidden />;
}
