"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { RotateCcw, Video } from "lucide-react";
import type { AnimationTimelineStage, ToothCondition } from "./types";
import {
  clearSceneProps,
  DEFAULT_OPEN_ANGLE,
  initMouthCinematics,
  playTreatmentStage,
  restoreMats,
  type MouthCinematicController,
  type MouthSceneContext,
} from "./treatment-cinematics";

interface ThreeMouthCanvasProps {
  currentStage: AnimationTimelineStage;
  allStages?: AnimationTimelineStage[];
  stageIndex?: number;
  conditions?: Record<string, ToothCondition>;
  isPlaying?: boolean;
  playbackSpeed?: number;
  stageElapsedSeconds?: number;
  onStepComplete?: () => void;
  isActive?: boolean;
  resetSignal?: number;
  isRecording?: boolean;
  onAfterRender?: (canvas: HTMLCanvasElement) => void;
}

const HINGE_NAME = "jaw_hinge_pivot";

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

export function ThreeMouthCanvas({
  currentStage,
  allStages = [],
  stageIndex,
  conditions,
  isPlaying = false,
  playbackSpeed = 1,
  stageElapsedSeconds,
  isActive = true,
  resetSignal,
  isRecording = false,
  onAfterRender,
}: ThreeMouthCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const pivotHingeRef = useRef<THREE.Group | null>(null);
  const cinematicsRef = useRef<MouthCinematicController | null>(null);
  const baseTimeScaleRef = useRef<number>(1);
  const defaultCamTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const defaultCamPos = useRef<THREE.Vector3>(new THREE.Vector3());

  const isActiveRef = useRef(isActive);
  const isRecordingRef = useRef(isRecording);
  const onAfterRenderRef = useRef(onAfterRender);

  useEffect(() => {
    isActiveRef.current = isActive;
    isRecordingRef.current = isRecording;
    onAfterRenderRef.current = onAfterRender;
  }, [isActive, isRecording, onAfterRender]);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [modelReadyTick, setModelReadyTick] = useState(0);

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
    const camera = new THREE.PerspectiveCamera(39.6, width / height, 0.01, 100);
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
    controls.minDistance = 0.035;
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

        // Scale down high-candela Blender lights
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

        // Setup TMJ lower jaw open hinge (first at 0 rotation so arch bounds are sampled cleanly)
        const jawLower =
          root.getObjectByName("jawLower_midres") ||
          root.getObjectByName("jawLower");
        if (jawLower) {
          const hinge = createHinge(jawLower);
          if (hinge && hinge.rotation) {
            hinge.rotation.x = 0;
            pivotHingeRef.current = hinge as THREE.Group;
          }
        }

        scene.add(root);
        root.updateMatrixWorld(true);

        // Initialize unified 3D shader & island controller (attaches shader to both Teeth and Saliva!)
        const controller = initMouthCinematics(root, pivotHingeRef.current);
        cinematicsRef.current = controller;

        if (pivotHingeRef.current) {
          pivotHingeRef.current.rotation.x = DEFAULT_OPEN_ANGLE;
          root.updateMatrixWorld(true);
        }

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
        setModelReadyTick((t) => t + 1);
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

    // 7. Render Loop with immediate post-render video capture callback (Requirement 3)
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (isActiveRef.current || isRecordingRef.current) {
        controls.enabled = !isRecordingRef.current;
        controls.update();
        renderer.render(scene, camera);
        if (onAfterRenderRef.current) {
          onAfterRenderRef.current(renderer.domElement);
        }
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
      if (cinematicsRef.current?.activeTimeline) {
        cinematicsRef.current.activeTimeline.kill();
      }
      clearSceneProps(scene, "prop_");
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

  // Execute 4-phase procedural choreography for currentStage & preserve prior stage states
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const model = modelRootRef.current;
    const controller = cinematicsRef.current;

    if (!scene || !camera || !controls || !renderer || !model || !controller) {
      return;
    }

    const resolvedStageIndex =
      stageIndex !== undefined
        ? stageIndex
        : Math.max(
            0,
            allStages.findIndex((s) => s.id === currentStage.id)
          );

    const ctx: MouthSceneContext = {
      scene,
      camera,
      controls,
      renderer,
      root: model,
      pivotHinge: pivotHingeRef.current,
      defaultCamPos: defaultCamPos.current,
      defaultCamTarget: defaultCamTarget.current,
      controller,
    };

    const tl = playTreatmentStage(
      currentStage,
      ctx,
      allStages,
      resolvedStageIndex,
      undefined,
      conditions
    );

    baseTimeScaleRef.current = tl.timeScale();
    tl.timeScale(baseTimeScaleRef.current * (playbackSpeed || 1));
  }, [currentStage, stageIndex, allStages, conditions, modelReadyTick]);

  // Keep timeline playback speed synchronized with user speed toggle (1x / 1.5x / 2x)
  useEffect(() => {
    const tl = cinematicsRef.current?.activeTimeline;
    if (!tl) return;
    tl.timeScale(baseTimeScaleRef.current * (playbackSpeed || 1));
  }, [playbackSpeed]);

  // Pause / resume active GSAP timeline when isPlaying toggles
  useEffect(() => {
    const tl = cinematicsRef.current?.activeTimeline;
    if (!tl) return;
    if (isPlaying) {
      tl.play();
    }
  }, [isPlaying]);

  // Synchronize manual scrubber jumps when paused
  useEffect(() => {
    if (isPlaying || stageElapsedSeconds === undefined) return;
    const tl = cinematicsRef.current?.activeTimeline;
    if (!tl) return;
    const dur = Math.max(0.1, currentStage.durationSeconds || 8.0);
    const ratio = Math.max(0, Math.min(1, stageElapsedSeconds / dur));
    if (ratio > 0.02) {
      tl.progress(ratio, false);
    }
  }, [stageElapsedSeconds, isPlaying, currentStage.durationSeconds]);

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

  // Full restore when resetSignal fires
  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0) {
      if (sceneRef.current && cinematicsRef.current && cameraRef.current && controlsRef.current && rendererRef.current && modelRootRef.current) {
        restoreMats(cinematicsRef.current);
        clearSceneProps(sceneRef.current, "prop_");
        const ctx: MouthSceneContext = {
          scene: sceneRef.current,
          camera: cameraRef.current,
          controls: controlsRef.current,
          renderer: rendererRef.current,
          root: modelRootRef.current,
          pivotHinge: pivotHingeRef.current,
          defaultCamPos: defaultCamPos.current,
          defaultCamTarget: defaultCamTarget.current,
          controller: cinematicsRef.current,
        };
        const tl = playTreatmentStage(
          currentStage,
          ctx,
          allStages,
          0,
          undefined,
          conditions
        );
        baseTimeScaleRef.current = tl.timeScale();
      } else {
        handleResetCamera();
      }
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
          <div
            className={`size-2 rounded-full animate-ping shrink-0 ${
              isRecording ? "bg-rose-500" : "bg-blue-400"
            }`}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isRecording ? "text-rose-400" : "text-blue-400"
                }`}
              >
                {isRecording ? "Video Kaydediliyor (1080p)" : "Aktif Aşama"}
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

      {/* Top Right Controls (Reset View & Recording Indicator) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        {isRecording && (
          <div className="flex items-center gap-1.5 rounded-xl bg-rose-500/20 backdrop-blur-md border border-rose-500/50 px-3 py-1.5 text-xs font-semibold text-rose-200">
            <Video className="size-3.5 text-rose-400 animate-pulse" />
            <span>REC 60fps</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleResetCamera}
          disabled={isRecording}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
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
