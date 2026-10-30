"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { Maximize2, RotateCcw, Sparkles } from "lucide-react";
import type { AnimationTimelineStage } from "./types";

interface ThreeMouthCanvasProps {
  currentStage: AnimationTimelineStage;
  allStages: AnimationTimelineStage[];
  isPlaying: boolean;
  onStepComplete?: () => void;
}

// Mapping from FDI number to GLTF node names
function findToothNode(fdi: string, scene: THREE.Group): THREE.Object3D | null {
  const possibleNames = [
    `tooth_${fdi}`,
    `Tooth_${fdi}`,
    fdi === "16" ? "Tooth_Upper_Molar_16" : "",
    fdi === "36" ? "Tooth_Lower_Molar_36" : "",
  ].filter(Boolean);

  for (const name of possibleNames) {
    const found = scene.getObjectByName(name);
    if (found) return found;
  }

  // Fallback search
  let result: THREE.Object3D | null = null;
  scene.traverse((obj) => {
    if (obj.name.toLowerCase().includes(fdi.toLowerCase())) {
      result = obj;
    }
  });
  return result;
}

export function ThreeMouthCanvas({
  currentStage,
  isPlaying,
  onStepComplete,
}: ThreeMouthCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const toothMeshesMap = useRef<Map<string, THREE.Object3D>>(new Map());
  const implantMeshesRef = useRef<THREE.Group[]>([]);
  const bridgeMeshesRef = useRef<THREE.Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 4.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI / 1.7;
    controlsRef.current = controls;

    // 5. Lighting (Medical Studio Grade)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.8);
    rimLight.position.set(0, 6, -5);
    scene.add(rimLight);

    // 6. Load /mouth.glb
    const loader = new GLTFLoader();
    loader.load(
      "/mouth.glb",
      (gltf) => {
        const root = gltf.scene;
        root.scale.set(0.7, 0.7, 0.7);
        root.position.set(0, -0.2, 0);

        // Adjust materials for natural enamel and gum look
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Clone material so individual teeth can be modified
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map((m) => m.clone());
              } else {
                mesh.material = (mesh.material as THREE.Material).clone();
              }
            }
          }
        });

        // Store FDI teeth map
        const allFdi = [
          "18", "17", "16", "15", "14", "13", "12", "11",
          "21", "22", "23", "24", "25", "26", "27", "28",
          "48", "47", "46", "45", "44", "43", "42", "41",
          "31", "32", "33", "34", "35", "36", "37", "38",
        ];

        allFdi.forEach((fdi) => {
          const tooth = findToothNode(fdi, root);
          if (tooth) {
            toothMeshesMap.current.set(fdi, tooth);
          }
        });

        scene.add(root);
        modelRef.current = root;
        setLoading(false);
      },
      undefined,
      (err) => {
        console.warn("Could not load /mouth.glb, generating high-fidelity 3D jaw geometry fallback:", err);
        const fallbackGroup = buildProceduralJaw();
        scene.add(fallbackGroup);
        modelRef.current = fallbackGroup;
        setLoading(false);
      }
    );

    // 7. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // GSAP Step Animation Trigger
  useEffect(() => {
    if (!modelRef.current || !cameraRef.current) return;
    const model = modelRef.current;
    const camera = cameraRef.current;

    const ctx = gsap.context(() => {
      // 1. Camera Framing depending on treatment action
      if (currentStage.actionType === "extraction") {
        gsap.to(camera.position, {
          x: 0,
          y: 0.2,
          z: 3.4,
          duration: 1.2,
          ease: "power2.out",
        });

        // Extractions: animate target teeth lifting & disappearing
        currentStage.teeth.forEach((fdi, idx) => {
          const tooth = toothMeshesMap.current.get(fdi) || model.getObjectByName(`tooth_${fdi}`);
          if (tooth) {
            gsap.to(tooth.position, {
              y: tooth.position.y + 0.45,
              duration: 1.0,
              delay: idx * 0.1,
              ease: "power2.inOut",
            });
            tooth.traverse((c) => {
              const mesh = c as THREE.Mesh;
              if (mesh.material) {
                const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.Material | undefined;
                if (!mat) return;
                mat.transparent = true;
                gsap.to(mat, {
                  opacity: 0.1,
                  duration: 0.8,
                  delay: idx * 0.1 + 0.3,
                  ease: "power1.out",
                });
              }
            });
          }
        });
      } else if (currentStage.actionType === "implant") {
        gsap.to(camera.position, {
          x: 0.4,
          y: -0.1,
          z: 3.2,
          duration: 1.2,
          ease: "power2.out",
        });

        // Implants: spawn titanium screws into positions
        currentStage.teeth.forEach((fdi, idx) => {
          const tooth = toothMeshesMap.current.get(fdi) || model.getObjectByName(`tooth_${fdi}`);
          if (tooth) {
            // Highlight location with metallic implant fixture
            tooth.traverse((c) => {
              const mesh = c as THREE.Mesh;
              if (mesh.material) {
                const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.Material | undefined;
                if (!mat) return;
                mat.transparent = false;
                gsap.to(mat, { opacity: 1, duration: 0.5 });
                if ((mat as THREE.MeshStandardMaterial).color) {
                  (mat as THREE.MeshStandardMaterial).color.setHex(0x38bdf8);
                  (mat as THREE.MeshStandardMaterial).metalness = 0.9;
                  (mat as THREE.MeshStandardMaterial).roughness = 0.2;
                }
              }
            });
            gsap.fromTo(
              tooth.position,
              { y: tooth.position.y + 0.3 },
              { y: tooth.position.y, duration: 0.9, delay: idx * 0.12, ease: "bounce.out" }
            );
          }
        });
      } else if (currentStage.actionType === "temporary_denture" || currentStage.actionType === "permanent_bridge") {
        gsap.to(camera.position, {
          x: 0,
          y: 0.1,
          z: 3.5,
          duration: 1.2,
          ease: "power2.out",
        });

        // Restorations: glow and gleaming finish
        currentStage.teeth.forEach((fdi) => {
          const tooth = toothMeshesMap.current.get(fdi) || model.getObjectByName(`tooth_${fdi}`);
          if (tooth) {
            tooth.traverse((c) => {
              const mesh = c as THREE.Mesh;
              if (mesh.material) {
                const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.Material | undefined;
                if (!mat) return;
                mat.transparent = false;
                mat.opacity = 1;
                if ((mat as THREE.MeshStandardMaterial).color) {
                  (mat as THREE.MeshStandardMaterial).color.setHex(
                    currentStage.actionType === "permanent_bridge" ? 0xffffff : 0xfef08a
                  );
                  (mat as THREE.MeshStandardMaterial).roughness = 0.15;
                  (mat as THREE.MeshStandardMaterial).metalness = 0.1;
                }
              }
            });
          }
        });

        // Gentle rotate presentation
        gsap.to(model.rotation, {
          y: "+=0.3",
          duration: 1.5,
          ease: "power2.inOut",
        });
      } else if (currentStage.actionType === "healing") {
        // Healing period bio-pulse
        gsap.to(model.position, {
          y: -0.15,
          yoyo: true,
          repeat: 1,
          duration: 1,
          ease: "sine.inOut",
        });
      }
    });

    return () => ctx.revert();
  }, [currentStage]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current || !modelRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0.4,
      z: 4.2,
      duration: 1.0,
      ease: "power3.out",
    });
    gsap.to(modelRef.current.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.0,
      ease: "power3.out",
    });
    controlsRef.current.target.set(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden border border-slate-800 shadow-xl select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-20 text-white">
          <div className="size-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
          <span className="text-xs font-semibold tracking-wider text-slate-300">
            3D Çene ve Diş Modeli Yükleniyor...
          </span>
        </div>
      )}

      {/* Top Left: Active Step Badge (Exact style of Image 5) */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 shadow-lg">
          <div className="size-2 rounded-full bg-blue-400 animate-ping"></div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Aktif Aşama
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              {currentStage.stageName}
            </div>
          </div>
        </div>
      </div>

      {/* Center Floating Stage Title (As shown in Image 5: "EXTRACTIONS") */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-center">
        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white/90 drop-shadow-md">
          {currentStage.actionType === "extraction"
            ? "EXTRACTIONS"
            : currentStage.actionType === "implant"
            ? "IMPLANTATIONS"
            : currentStage.actionType === "abutment"
            ? "ABUTMENTS"
            : currentStage.actionType === "temporary_denture"
            ? "TEMPORARY PROSTHESIS"
            : currentStage.actionType === "healing"
            ? "HEALING PERIOD"
            : currentStage.actionType === "permanent_bridge"
            ? "ZIRCONIUM BRIDGES"
            : currentStage.stageName}
        </h3>
        {currentStage.teeth.length > 0 && (
          <div className="mt-1 flex items-center justify-center gap-1.5">
            {currentStage.teeth.map((t) => (
              <span
                key={t}
                className="rounded-md bg-slate-900/80 backdrop-blur-md border border-blue-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-200 shadow-md"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Top Right Controls (Reset View, Fullscreen) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Kamera Açısını Sıfırla"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Açıyı Sıfırla</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 z-10 text-[10px] text-slate-400">
        <span>Sol Tık + Sürükle: 360° Döndür · Sağ Tık / Çift Parmak: Kaydır · Tekerlek: Yakınlaştır</span>
      </div>
    </div>
  );
}

/**
 * Procedural fallback 3D Jaw & Teeth generator in case /mouth.glb is offline or loading
 */
function buildProceduralJaw(): THREE.Group {
  const group = new THREE.Group();

  // 1. Upper Jaw Arch (Pinkish Gingiva)
  const gumMaterial = new THREE.MeshStandardMaterial({
    color: 0xdf6f7a,
    roughness: 0.4,
    metalness: 0.1,
  });

  const upperGum = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.28, 16, 32, Math.PI),
    gumMaterial
  );
  upperGum.rotation.x = Math.PI / 2;
  upperGum.position.set(0, 0.4, 0);
  group.add(upperGum);

  // 2. Lower Jaw Arch
  const lowerGum = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.28, 16, 32, Math.PI),
    gumMaterial
  );
  lowerGum.rotation.x = -Math.PI / 2;
  lowerGum.position.set(0, -0.4, 0);
  group.add(lowerGum);

  // 3. Teeth (Anatomical ivory material)
  const toothMaterial = new THREE.MeshStandardMaterial({
    color: 0xfcfbfa,
    roughness: 0.2,
    metalness: 0.05,
  });

  const upperFdi = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
  upperFdi.forEach((fdi, i) => {
    const angle = Math.PI - (i / (upperFdi.length - 1)) * Math.PI;
    const radius = 1.4;
    const tooth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.11, 0.28, 12),
      toothMaterial.clone()
    );
    tooth.name = `tooth_${fdi}`;
    tooth.position.set(Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
    tooth.rotation.z = (Math.PI / 2) - angle;
    group.add(tooth);
  });

  const lowerFdi = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
  lowerFdi.forEach((fdi, i) => {
    const angle = Math.PI - (i / (lowerFdi.length - 1)) * Math.PI;
    const radius = 1.35;
    const tooth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.08, 0.26, 12),
      toothMaterial.clone()
    );
    tooth.name = `tooth_${fdi}`;
    tooth.position.set(Math.cos(angle) * radius, -0.4, Math.sin(angle) * radius);
    tooth.rotation.z = (Math.PI / 2) - angle;
    group.add(tooth);
  });

  return group;
}
