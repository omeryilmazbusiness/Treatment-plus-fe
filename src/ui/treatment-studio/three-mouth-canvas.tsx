"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { RotateCcw } from "lucide-react";
import type { AnimationTimelineStage } from "./types";

interface ThreeMouthCanvasProps {
  currentStage: AnimationTimelineStage;
  allStages?: AnimationTimelineStage[];
  isPlaying?: boolean;
  onStepComplete?: () => void;
  isActive?: boolean;
  resetSignal?: number;
}

const HINGE_NAME = "jaw_hinge_pivot";
const OPEN_ANGLE = 0.16;

function boxOf(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj);
  return {
    box,
    size: box.getSize(new THREE.Vector3()),
    center: box.getCenter(new THREE.Vector3()),
  };
}

function invertTexture(tex: THREE.Texture): THREE.Texture {
  if (!tex?.image) return tex;
  const img = tex.image as HTMLImageElement | HTMLCanvasElement;
  const w = img.width || 0;
  const h = img.height || 0;
  if (!w || !h) return tex;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return tex;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < data.data.length; i += 4) {
    data.data[i] = 255 - (data.data[i] ?? 0);
    data.data[i + 1] = 255 - (data.data[i + 1] ?? 0);
    data.data[i + 2] = 255 - (data.data[i + 2] ?? 0);
  }
  ctx.putImageData(data, 0, 0);
  const out = tex.clone();
  out.image = c;
  out.needsUpdate = true;
  return out;
}

function createHinge(jaw: THREE.Object3D) {
  if (jaw.userData.hinge) return jaw.userData.hinge as THREE.Group;
  if (jaw.parent?.name === HINGE_NAME) {
    jaw.userData.hinge = jaw.parent;
    return jaw.parent as THREE.Group;
  }
  const parent = jaw.parent;
  if (!parent) return jaw;

  const lower =
    jaw.getObjectByName("GumsLower_midres") ||
    jaw.getObjectByName("TeethLower_midres") ||
    jaw;
  const { box, size } = boxOf(lower);
  const hingeWorld = new THREE.Vector3(
    (box.min.x + box.max.x) * 0.5,
    box.min.y + size.y * 0.42,
    box.min.z - size.z * 0.55
  );

  const pivot = new THREE.Group();
  pivot.name = HINGE_NAME;
  parent.add(pivot);
  parent.worldToLocal(hingeWorld);
  pivot.position.copy(hingeWorld);
  pivot.attach(jaw);
  jaw.userData.hinge = pivot;
  return pivot;
}

function fdiMeta(fdi: string) {
  const n = Number(fdi) || 16;
  return {
    n,
    upper: n < 30,
    right: (n >= 11 && n <= 18) || (n >= 41 && n <= 48),
    distal: Math.max(0, Math.min(1, ((n % 10) - 1) / 7)),
  };
}

function calculateFdiPoint(mesh: THREE.Object3D, fdi: string) {
  const { box, center, size } = boxOf(mesh);
  const { upper, right, distal } = fdiMeta(fdi);
  const p = new THREE.Vector3();
  p.x = center.x + (right ? -1 : 1) * (0.18 + 0.38 * distal) * size.x;
  p.y = upper ? box.min.y + size.y * 0.12 : box.max.y - size.y * 0.12;
  p.z = box.max.z - Math.pow(distal, 0.82) * size.z * 0.96;
  return p;
}

export function ThreeMouthCanvas({
  currentStage,
  isActive = true,
  resetSignal,
}: ThreeMouthCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const pivotHingeRef = useRef<THREE.Group | null>(null);
  const defaultCamTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const defaultCamPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Initialize Three.js scene & load mouth.glb
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(39.6, width / height, 0.05, 100);
    cameraRef.current = camera;

    // 3. Renderer with high clinical quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.05;
    controls.maxDistance = 3.0;
    controlsRef.current = controls;

    // 5. Environment & Lights (Authored in Blender for mouth.glb)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.82;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
    fillLight.position.set(-2, 3, 3);
    scene.add(fillLight);

    const fillLight2 = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fillLight2.position.set(2, 2, 4);
    scene.add(fillLight2);

    // 6. Load mouth.glb model
    const loader = new GLTFLoader();
    let isCancelled = false;

    loader.load(
      "/mouth.glb",
      (gltf) => {
        if (isCancelled) return;
        const root = gltf.scene;
        modelRootRef.current = root;

        // Process authored lights inside the GLB: Blender lights are calibrated
        // for distant cameras and have huge candela (54,000+). Scale them down
        // so they don't blow out / overexpose the teeth.
        root.traverse((o) => {
          if ((o as THREE.Light).isLight) {
            const light = o as THREE.Light;
            if (light.intensity > 100) {
              light.intensity *= 0.0032;
            } else if (light.intensity > 10) {
              light.intensity = 1.2;
            }
          }
        });

        root.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = (mesh.name || "").toLowerCase();
            // Saliva translucency
            if (name.includes("saliva")) {
              const salivaMat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xdbeafe),
                roughness: 0.03,
                metalness: 0,
                transmission: 0.95,
                ior: 1.33,
                transparent: true,
                opacity: 0.85,
                depthWrite: false,
              });
              mesh.material = salivaMat;
              mesh.renderOrder = 3;
            } else if (mesh.material) {
              const srcMat = (
                Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
              ) as THREE.MeshStandardMaterial;

              if (srcMat.isMeshStandardMaterial) {
                srcMat.envMapIntensity = 1.15;
                srcMat.metalness = 0.0;

                // Blender exports glossiness in the roughness slot for this model.
                // Invert gloss map to true perceptual roughness so it doesn't create blinding white specular blowout.
                if (srcMat.roughnessMap && !srcMat.userData.glossInverted) {
                  srcMat.roughnessMap = invertTexture(srcMat.roughnessMap);
                  srcMat.roughness = 1.0;
                  srcMat.userData.glossInverted = true;
                } else if (!srcMat.roughnessMap) {
                  srcMat.roughness = name.includes("gums") ? 0.65 : 0.45;
                }

                srcMat.needsUpdate = true;
              }
            }
          }
        });

        // Setup TMJ lower jaw open hinge
        const jawLower =
          root.getObjectByName("jawLower_midres") ||
          root.getObjectByName("jawLower");
        if (jawLower) {
          const hinge = createHinge(jawLower);
          if (hinge && hinge.rotation) {
            hinge.rotation.x = OPEN_ANGLE;
            pivotHingeRef.current = hinge as THREE.Group;
          }
        }

        scene.add(root);

        // Frame camera cleanly on mouth
        const focus =
          root.getObjectByName("TeethTongueSet_midres") ||
          root.getObjectByName("TeethUpper_midres") ||
          root;
        const { center, size } = boxOf(focus);
        const dist = Math.max(size.length() * 1.55, 0.28);

        const targetPos = new THREE.Vector3(
          center.x + dist * 0.38,
          center.y + dist * 0.18,
          center.z + dist * 0.95
        );

        camera.position.copy(targetPos);
        controls.target.copy(center);
        camera.lookAt(center);

        defaultCamPos.current.copy(targetPos);
        defaultCamTarget.current.copy(center);

        setLoading(false);
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (err) => {
        console.error("Failed to load /mouth.glb", err);
        setLoading(false);
      }
    );

    // 7. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isActiveRef.current) {
        controls.update();
        renderer.render(scene, camera);
      }
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      pmrem.dispose();
    };
  }, []);

  // Update active state ref & resize canvas when tab becomes active
  useEffect(() => {
    isActiveRef.current = isActive;
    if (isActive) {
      const container = mountRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      if (container && renderer && camera) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    }
  }, [isActive]);

  // React to currentStage changes and frame camera towards active teeth
  useEffect(() => {
    const camera = cameraRef.current;
    const model = modelRootRef.current;
    if (!camera || !model || !controlsRef.current) return;

    const activeTeeth = currentStage.teeth || [];
    const teethUpper = model.getObjectByName("TeethUpper_midres");
    const teethLower = model.getObjectByName("TeethLower_midres");

    if (activeTeeth.length > 0 && activeTeeth[0] && (teethUpper || teethLower)) {
      const firstFdi = activeTeeth[0];
      const isUpper = Number(firstFdi) < 30;
      const hostMesh = isUpper ? teethUpper : teethLower;

      if (hostMesh) {
        const pt = calculateFdiPoint(hostMesh, firstFdi);
        const { upper, right } = fdiMeta(firstFdi);
        const buccalX = right ? -1 : 1;
        const occlusalY = upper ? 1 : -1;

        const elev = THREE.MathUtils.degToRad(38);
        const yaw = THREE.MathUtils.degToRad(34);
        const dir = new THREE.Vector3(
          buccalX * Math.cos(elev) * 0.88,
          occlusalY * Math.sin(elev),
          Math.cos(elev) * Math.sin(yaw)
        ).normalize();

        const camPos = pt.clone().addScaledVector(dir, 0.08);

        gsap.to(camera.position, {
          x: camPos.x,
          y: camPos.y,
          z: camPos.z,
          duration: 1.1,
          ease: "power2.out",
        });

        gsap.to(controlsRef.current.target, {
          x: pt.x,
          y: pt.y,
          z: pt.z,
          duration: 1.1,
          ease: "power2.out",
        });
      }
    } else {
      // Return to overall natural clinical view
      gsap.to(camera.position, {
        x: defaultCamPos.current.x,
        y: defaultCamPos.current.y,
        z: defaultCamPos.current.z,
        duration: 1.0,
        ease: "power2.out",
      });
      gsap.to(controlsRef.current.target, {
        x: defaultCamTarget.current.x,
        y: defaultCamTarget.current.y,
        z: defaultCamTarget.current.z,
        duration: 1.0,
        ease: "power2.out",
      });
    }
  }, [currentStage]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: defaultCamPos.current.x,
      y: defaultCamPos.current.y,
      z: defaultCamPos.current.z,
      duration: 0.9,
      ease: "power3.out",
    });
    gsap.to(controlsRef.current.target, {
      x: defaultCamTarget.current.x,
      y: defaultCamTarget.current.y,
      z: defaultCamTarget.current.z,
      duration: 0.9,
      ease: "power3.out",
    });
  };

  // Reset camera when external resetSignal triggers
  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0) {
      handleResetCamera();
    }
  }, [resetSignal]);

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden border border-slate-800 shadow-xl select-none">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md z-20 text-white">
          <div className="size-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3"></div>
          <span className="text-xs font-semibold tracking-wider text-slate-300">
            Fotogerçekçi Klinik Ağız Modeli Yükleniyor...
          </span>
          {loadProgress > 0 && (
            <span className="text-[11px] font-mono text-blue-400 mt-1 font-bold">
              %{loadProgress}
            </span>
          )}
        </div>
      )}

      {/* Top Left: Active Step Badge & Tooth Numbers */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 shadow-lg">
          <div className="size-2 rounded-full bg-blue-400 animate-ping shrink-0"></div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Aktif Aşama
              </span>
              {currentStage.teeth && currentStage.teeth.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {currentStage.teeth.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-blue-500/20 border border-blue-500/40 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-200 shadow-xs"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs font-bold text-white tracking-wide mt-0.5">
              {currentStage.stageName}
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Controls (Reset View) */}
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

      {/* Bottom Model Badge */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 text-[10px] text-slate-400">
        <span className="rounded bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-slate-300 font-medium">
          Anatomik Model (GLTF)
        </span>
        <span className="hidden sm:inline">
          Sol Tık: 360° Döndür · Sağ Tık: Kaydır · Tekerlek: Yakınlaştır
        </span>
      </div>
    </div>
  );
}
