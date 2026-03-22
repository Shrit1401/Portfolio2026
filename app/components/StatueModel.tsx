import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const StatueModel = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x3d3d48, 0.9);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.28);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 10, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8d4ff, 0.85);
    fillLight.position.set(-6, 4, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffe8d4, 1.1);
    rimLight.position.set(0, 2, -9);
    scene.add(rimLight);

    // Load the GLB model
    const loader = new GLTFLoader();
    let model: THREE.Group | undefined;

    loader.load(
      "/shrit.glb",
      (gltf) => {
        model = gltf.scene;

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Scale the model if needed
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.multiplyScalar(scale);

        scene.add(model);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.error("An error happened while loading the model:", error);
      },
    );

    // Camera position
    camera.position.z = 7;
    camera.position.y = 0;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;
    controls.enablePan = false;

    let rafId = 0;
    let visible = true;
    let inView = true;

    const shouldRender = () => visible && inView;

    const tick = () => {
      if (!shouldRender()) {
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
      // OrbitControls.autoRotate handles camera motion; skip extra mesh spin (saves work per frame).
      controls.update();
      renderer.render(scene, camera);
    };

    const startLoop = () => {
      if (rafId || !shouldRender()) return;
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const syncLoop = () => {
      if (shouldRender()) startLoop();
      else stopLoop();
    };

    const onVisibility = () => {
      visible = !document.hidden;
      syncLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    visible = !document.hidden;

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        syncLoop();
      },
      { root: null, rootMargin: "64px", threshold: 0 },
    );
    io.observe(mountRef.current);
    inView = true;
    syncLoop();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;

      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      stopLoop();
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      window.removeEventListener("resize", handleResize);
      const parent = renderer.domElement.parentNode;
      if (parent) parent.removeChild(renderer.domElement);
      if (model) {
        scene.remove(model);
      }
      scene.environment?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{
        background: "transparent",
        position: "relative",
        zIndex: 1,
      }}
    />
  );
};

export default StatueModel;
