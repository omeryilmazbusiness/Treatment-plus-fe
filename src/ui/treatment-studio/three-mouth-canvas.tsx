"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { RotateCcw, Sparkles } from "lucide-react";
import type { AnimationTimelineStage } from "./types";

interface ThreeMouthCanvasProps {
  currentStage: AnimationTimelineStage;
  allStages: AnimationTimelineStage[];
  isPlaying: boolean;
  onStepComplete?: () => void;
}

// FDI Arch Lists (Standard ISO 3950 dental notation)
const UPPER_ARCH_FDI = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const;

const LOWER_ARCH_FDI = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const;

type ToothCategory = "incisor" | "canine" | "premolar" | "molar";

function getToothCategory(fdi: string): ToothCategory {
  const num = Number(fdi) % 10;
  if (num === 1 || num === 2) return "incisor";
  if (num === 3) return "canine";
  if (num === 4 || num === 5) return "premolar";
  return "molar";
}

/**
 * Anatomik diş kuron geometrileri (Kesici, Kanin, Premolar, Molar)
 * dirSign = +1 (Alt çene: oklüzal yüzey +Y), dirSign = -1 (Üst çene: oklüzal yüzey -Y)
 */
function createToothCrownGeometry(
  category: ToothCategory,
  dirSign: 1 | -1
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.5, 36, 24);
  const pos = geo.attributes.position;
  if (!pos) return geo;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const nx = vx / 0.5;
    const nyOcclusal = (vy / 0.5) * dirSign;
    const nz = vz / 0.5;

    let x = vx;
    let localY = nyOcclusal * 0.4;
    let z = vz;

    const neckFactor = nyOcclusal < 0 ? 1.0 - 0.08 * -nyOcclusal : 1.0;

    if (category === "molar") {
      const theta = Math.atan2(nz, nx);
      const squircle = 1.0 + 0.1 * Math.cos(4 * theta);
      x = vx * squircle * neckFactor * 1.12;
      z = vz * squircle * neckFactor * 1.05;

      if (nyOcclusal > 0.4) {
        localY = 0.4 + (nyOcclusal - 0.4) * 0.22;
        const w = Math.sin(nyOcclusal * Math.PI * 0.5);
        const cusps: readonly [number, number, number][] = [
          [-0.36, 0.34, 0.08],
          [0.36, 0.34, 0.07],
          [-0.34, -0.34, 0.09],
          [0.34, -0.34, 0.06],
        ];
        let cOffset = 0;
        for (const [cx, cz, ch] of cusps) {
          const d2 = Math.pow(nx - cx, 2) * 3.5 + Math.pow(nz - cz, 2) * 3.5;
          cOffset += ch * Math.exp(-d2) * w;
        }
        const pit = 0.035 * Math.exp(-(nx * nx + nz * nz) * 6.0);
        localY += cOffset - pit;
      }
    } else if (category === "premolar") {
      const squircle = 1.0 + 0.05 * Math.cos(2 * Math.atan2(nz, nx));
      x = vx * squircle * neckFactor * 0.96;
      z = vz * squircle * neckFactor * 1.04;

      if (nyOcclusal > 0.4) {
        localY = 0.4 + (nyOcclusal - 0.4) * 0.24;
        const w = Math.sin(nyOcclusal * Math.PI * 0.5);
        const buccal = 0.075 * Math.exp(-(nx * nx * 4.0 + Math.pow(nz - 0.35, 2) * 4.5));
        const lingual = 0.065 * Math.exp(-(nx * nx * 4.0 + Math.pow(nz + 0.35, 2) * 4.5));
        localY += (buccal + lingual - 0.03 * Math.exp(-nz * nz * 12.0)) * w;
      }
    } else if (category === "canine") {
      const blade =
        nyOcclusal > 0
          ? THREE.MathUtils.lerp(0.88, 0.5, Math.pow(nyOcclusal, 1.2))
          : 0.88;
      x = vx * neckFactor * 0.95;
      z = vz * blade * neckFactor * 1.0;

      if (nyOcclusal > 0.5) {
        const cusp = (nyOcclusal - 0.5) / 0.5;
        x *= 1.0 - cusp * 0.28;
        localY += cusp * 0.06;
      }
      if (vz > 0) {
        z += 0.03 * Math.exp(-nx * nx * 7.0) * Math.max(0, nyOcclusal + 0.3);
      }
    } else {
      // Incisor
      const blade =
        nyOcclusal > 0
          ? THREE.MathUtils.lerp(0.78, 0.28, Math.pow(nyOcclusal, 1.1))
          : 0.78;
      x = vx * neckFactor * 1.16;
      z = vz * blade * neckFactor;

      if (nyOcclusal > 0.45) {
        localY = 0.45 * 0.4 + (nyOcclusal - 0.45) * 0.12;
      }
      if (vz > 0 && nyOcclusal > 0) {
        z += 0.014 * Math.cos(nx * Math.PI * 2.5) * (1 - nyOcclusal * 0.45);
      }
    }

    pos.setXYZ(i, x, localY * dirSign, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Anatomik Festooned Diş Eti (Gingiva) Geometrisi
 */
function createRealisticFestoonedGingiva(isUpper: boolean): THREE.BufferGeometry {
  const rx = isUpper ? 1.42 : 1.32;
  const rz = isUpper ? 1.55 : 1.43;
  const yCenter = isUpper ? 0.54 : -0.54;
  const dirSign = isUpper ? 1 : -1;
  const maxAngle = Math.PI * 0.46;
  const steps = 64;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 - 1;
    const angle = t * maxAngle;
    const x = Math.sin(angle) * rx;
    const z = Math.cos(angle) * rz - 0.68;
    const archY = yCenter + dirSign * 0.045 * (1 - t * t);
    points.push(new THREE.Vector3(x, archY, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 96, 0.21, 24, false);
  const pos = tubeGeo.attributes.position;

  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      const angle = Math.atan2(vx, vz + 0.68);
      const tArch = angle / maxAngle;
      const toothPhase = (tArch + 1) * 7.5;
      const scallopWave = Math.cos(toothPhase * Math.PI * 2);

      const isToothFacing = isUpper ? vy < yCenter : vy > yCenter;
      let dy = 0;
      if (isToothFacing) {
        dy = -dirSign * (scallopWave * 0.024 - 0.01);
      } else {
        dy = dirSign * 0.015 * (1 - Math.abs(tArch));
      }

      const isBuccal = vz > -0.68;
      let dx = 0;
      let dz = 0;
      if (isBuccal) {
        const rootRidge = Math.max(0, scallopWave) * 0.018 * (1 - Math.abs(tArch) * 0.4);
        const radNorm = Math.sqrt(vx * vx + Math.pow(vz + 0.68, 2));
        if (radNorm > 1e-4) {
          dx = (vx / radNorm) * rootRidge;
          dz = ((vz + 0.68) / radNorm) * rootRidge;
        }
      }

      const endDist = Math.max(0, Math.abs(tArch) - 0.82) / 0.18;
      const endTaper = 1.0 - 0.25 * Math.pow(endDist, 2);

      pos.setXYZ(i, (vx + dx) * endTaper, vy + dy, vz + dz);
    }
    tubeGeo.computeVertexNormals();
  }

  return tubeGeo;
}

interface ArchToothPose {
  readonly fdi: string;
  readonly isUpper: boolean;
  readonly category: ToothCategory;
  readonly position: [number, number, number];
  readonly rotationY: number;
  readonly scale: [number, number, number];
}

function computeArchPose(fdi: string, isUpper: boolean): ArchToothPose {
  const list = isUpper ? UPPER_ARCH_FDI : LOWER_ARCH_FDI;
  const idx = list.indexOf(fdi as never);
  const t = (idx - 7.5) / 7.5;
  const angle = t * (Math.PI * 0.44);

  const radiusX = isUpper ? 1.42 : 1.32;
  const radiusZ = isUpper ? 1.55 : 1.43;

  const x = Math.sin(angle) * radiusX;
  const z = Math.cos(angle) * radiusZ - 0.68;

  const toothOrder = Number(fdi) % 10;
  const category = getToothCategory(fdi);

  const isAnterior = toothOrder <= 3;
  const y = isUpper ? (isAnterior ? 0.27 : 0.32) : (isAnterior ? -0.27 : -0.32);

  let scaleX = 0.28;
  let scaleY = 0.35;
  let scaleZ = 0.28;

  if (toothOrder === 1) {
    scaleX = isUpper ? 0.38 : 0.26;
    scaleY = isUpper ? 0.47 : 0.42;
    scaleZ = isUpper ? 0.28 : 0.24;
  } else if (toothOrder === 2) {
    scaleX = isUpper ? 0.31 : 0.25;
    scaleY = isUpper ? 0.44 : 0.4;
    scaleZ = isUpper ? 0.26 : 0.24;
  } else if (toothOrder === 3) {
    scaleX = 0.33;
    scaleY = 0.45;
    scaleZ = 0.32;
  } else if (toothOrder === 4 || toothOrder === 5) {
    scaleX = 0.28;
    scaleY = 0.34;
    scaleZ = 0.29;
  } else {
    const mFactor = toothOrder === 6 ? 1.0 : toothOrder === 7 ? 0.88 : 0.78;
    scaleX = 0.31 * mFactor;
    scaleY = 0.33 * mFactor;
    scaleZ = 0.32 * mFactor;
  }

  return {
    fdi,
    isUpper,
    category,
    position: [x, y, z],
    rotationY: angle,
    scale: [scaleX, scaleY, scaleZ],
  };
}

/**
 * Builds the complete 3D Anatomical Dental Model with Gingiva & 32 Teeth
 */
function buildSystemAnatomicalModel(): {
  model: THREE.Group;
  toothMap: Map<string, THREE.Mesh>;
} {
  const root = new THREE.Group();
  root.name = "AnatomicalDentalModel";
  const toothMap = new Map<string, THREE.Mesh>();

  // Cached Geometries
  const upperGeos: Record<ToothCategory, THREE.BufferGeometry> = {
    incisor: createToothCrownGeometry("incisor", -1),
    canine: createToothCrownGeometry("canine", -1),
    premolar: createToothCrownGeometry("premolar", -1),
    molar: createToothCrownGeometry("molar", -1),
  };

  const lowerGeos: Record<ToothCategory, THREE.BufferGeometry> = {
    incisor: createToothCrownGeometry("incisor", 1),
    canine: createToothCrownGeometry("canine", 1),
    premolar: createToothCrownGeometry("premolar", 1),
    molar: createToothCrownGeometry("molar", 1),
  };

  // Materials
  const gumMaterialUpper = new THREE.MeshStandardMaterial({
    color: 0xdf6f7a,
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.FrontSide,
  });

  const gumMaterialLower = new THREE.MeshStandardMaterial({
    color: 0xdf6f7a,
    roughness: 0.45,
    metalness: 0.05,
    side: THREE.FrontSide,
  });

  // 1. Upper Arch
  const upperArch = new THREE.Group();
  upperArch.name = "UpperArch_Maxilla";
  const upperGingiva = new THREE.Mesh(createRealisticFestoonedGingiva(true), gumMaterialUpper);
  upperGingiva.name = "GumsUpper";
  upperGingiva.castShadow = true;
  upperGingiva.receiveShadow = true;
  upperArch.add(upperGingiva);

  UPPER_ARCH_FDI.forEach((fdi) => {
    const pose = computeArchPose(fdi, true);
    const toothMat = new THREE.MeshStandardMaterial({
      color: 0xfcfaf6,
      roughness: 0.22,
      metalness: 0.02,
    });
    const toothMesh = new THREE.Mesh(upperGeos[pose.category], toothMat);
    toothMesh.name = `tooth_${fdi}`;
    toothMesh.position.set(...pose.position);
    toothMesh.rotation.y = pose.rotationY;
    toothMesh.scale.set(...pose.scale);
    toothMesh.castShadow = true;
    toothMesh.receiveShadow = true;
    toothMesh.userData = { fdi, initialY: pose.position[1], isUpper: true };

    upperArch.add(toothMesh);
    toothMap.set(fdi, toothMesh);
  });

  // 2. Lower Arch
  const lowerArch = new THREE.Group();
  lowerArch.name = "LowerArch_Mandible";
  const lowerGingiva = new THREE.Mesh(createRealisticFestoonedGingiva(false), gumMaterialLower);
  lowerGingiva.name = "GumsLower";
  lowerGingiva.castShadow = true;
  lowerGingiva.receiveShadow = true;
  lowerArch.add(lowerGingiva);

  LOWER_ARCH_FDI.forEach((fdi) => {
    const pose = computeArchPose(fdi, false);
    const toothMat = new THREE.MeshStandardMaterial({
      color: 0xfcfaf6,
      roughness: 0.22,
      metalness: 0.02,
    });
    const toothMesh = new THREE.Mesh(lowerGeos[pose.category], toothMat);
    toothMesh.name = `tooth_${fdi}`;
    toothMesh.position.set(...pose.position);
    toothMesh.rotation.y = pose.rotationY;
    toothMesh.scale.set(...pose.scale);
    toothMesh.castShadow = true;
    toothMesh.receiveShadow = true;
    toothMesh.userData = { fdi, initialY: pose.position[1], isUpper: false };

    lowerArch.add(toothMesh);
    toothMap.set(fdi, toothMesh);
  });

  root.add(upperArch);
  root.add(lowerArch);

  // Position whole model centered and facing front camera
  root.position.set(0, 0, 0.4);
  root.scale.set(0.95, 0.95, 0.95);

  return { model: root, toothMap };
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
  const toothMeshesMap = useRef<Map<string, THREE.Mesh>>(new Map());
  const [loading, setLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1020);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.45, 3.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.6;
    controls.maxDistance = 6.5;
    controls.maxPolarAngle = Math.PI / 1.75;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting (Clinical Dental Studio setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(0, 5, -4);
    scene.add(rimLight);

    // 6. Assemble System 3D Anatomical Model
    const { model, toothMap } = buildSystemAnatomicalModel();
    scene.add(model);
    modelRef.current = model;
    toothMeshesMap.current = toothMap;
    setLoading(false);

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
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0 && camera && renderer) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        }
      });
      resizeObserver.observe(container);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // GSAP Step Animation Trigger
  useEffect(() => {
    if (!modelRef.current || !cameraRef.current) return;
    const model = modelRef.current;
    const camera = cameraRef.current;

    // Reset teeth visual states
    const resetTeethVisuals = () => {
      toothMeshesMap.current.forEach((tooth) => {
        if (tooth.userData.initialY !== undefined) {
          tooth.position.y = tooth.userData.initialY;
        }
        const mat = tooth.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.transparent = false;
          mat.opacity = 1;
          mat.color.setHex(0xfcfaf6);
          mat.roughness = 0.22;
          mat.metalness = 0.02;
          mat.emissive.setHex(0x000000);
        }
      });
    };

    resetTeethVisuals();

    const ctx = gsap.context(() => {
      const activeTeeth = currentStage.teeth || [];
      const hasActive = activeTeeth.length > 0;

      // 1. Camera positioning according to treatment focus
      if (hasActive) {
        // Calculate average position of active teeth to smoothly frame them
        let avgX = 0;
        let avgY = 0;
        let count = 0;
        activeTeeth.forEach((fdi) => {
          const t = toothMeshesMap.current.get(fdi);
          if (t) {
            avgX += t.position.x;
            avgY += t.position.y;
            count++;
          }
        });
        if (count > 0) {
          avgX /= count;
          avgY /= count;
          gsap.to(camera.position, {
            x: avgX * 0.45,
            y: avgY + 0.35,
            z: 3.1,
            duration: 1.1,
            ease: "power2.out",
          });
          if (controlsRef.current) {
            gsap.to(controlsRef.current.target, {
              x: avgX * 0.3,
              y: avgY * 0.5,
              z: 0.1,
              duration: 1.1,
              ease: "power2.out",
            });
          }
        }
      } else {
        // Broad clinical view
        gsap.to(camera.position, {
          x: 0,
          y: 0.45,
          z: 3.8,
          duration: 1.1,
          ease: "power2.out",
        });
        if (controlsRef.current) {
          gsap.to(controlsRef.current.target, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1.1,
            ease: "power2.out",
          });
        }
      }

      // 2. Action Animation
      if (currentStage.actionType === "filling") {
        // Kompozit Dolgu / Restorasyon: LED polimerizasyon flaşı ve parlak mine bitişi
        activeTeeth.forEach((fdi, idx) => {
          const tooth = toothMeshesMap.current.get(fdi);
          if (tooth) {
            const mat = tooth.material as THREE.MeshStandardMaterial;
            // LED mavi polimerizasyon nabzı
            gsap.fromTo(
              mat.emissive,
              { r: 0.1, g: 0.4, b: 0.95 },
              {
                r: 0,
                g: 0,
                b: 0,
                duration: 1.4,
                delay: idx * 0.15,
                ease: "power2.out",
              }
            );
            // Mine parlatma
            mat.color.setHex(0xffffff);
            mat.roughness = 0.12;
            gsap.fromTo(
              tooth.scale,
              { x: tooth.scale.x * 0.94, z: tooth.scale.z * 0.94 },
              { x: tooth.scale.x, z: tooth.scale.z, duration: 0.6, delay: idx * 0.15, ease: "back.out(1.5)" }
            );
          }
        });
      } else if (currentStage.actionType === "root_canal") {
        // Endodonti: Pulpa odası erişimi ve guta-perka dolgusu
        activeTeeth.forEach((fdi, idx) => {
          const tooth = toothMeshesMap.current.get(fdi);
          if (tooth) {
            const mat = tooth.material as THREE.MeshStandardMaterial;
            gsap.fromTo(
              mat.emissive,
              { r: 0.95, g: 0.25, b: 0.65 },
              { r: 0, g: 0, b: 0, duration: 1.3, delay: idx * 0.15, ease: "power2.out" }
            );
          }
        });
      } else if (currentStage.actionType === "extraction") {
        // Çekim: Diş hafifçe yukarı/aşağı çekilerek opasitesi kaybolur
        activeTeeth.forEach((fdi, idx) => {
          const tooth = toothMeshesMap.current.get(fdi);
          if (tooth) {
            const isUpper = tooth.userData.isUpper;
            const dir = isUpper ? 0.35 : -0.35;
            gsap.to(tooth.position, {
              y: tooth.position.y + dir,
              duration: 1.0,
              delay: idx * 0.1,
              ease: "power2.inOut",
            });
            const mat = tooth.material as THREE.MeshStandardMaterial;
            mat.transparent = true;
            gsap.to(mat, {
              opacity: 0.08,
              duration: 0.8,
              delay: idx * 0.1 + 0.3,
              ease: "power1.out",
            });
          }
        });
      } else if (currentStage.actionType === "implant") {
        // İmplant: Titanyum fikstür metalik yerleşimi
        activeTeeth.forEach((fdi, idx) => {
          const tooth = toothMeshesMap.current.get(fdi);
          if (tooth) {
            const mat = tooth.material as THREE.MeshStandardMaterial;
            mat.color.setHex(0x94a3b8);
            mat.metalness = 0.88;
            mat.roughness = 0.22;
            gsap.fromTo(
              tooth.position,
              { y: tooth.position.y + (tooth.userData.isUpper ? -0.2 : 0.2) },
              { y: tooth.position.y, duration: 0.8, delay: idx * 0.12, ease: "bounce.out" }
            );
          }
        });
      } else if (
        currentStage.actionType === "permanent_bridge" ||
        currentStage.actionType === "temporary_denture"
      ) {
        // Zirkonyum Kuron / Köprü: Parlak monolitik zirkonya bitişi
        activeTeeth.forEach((fdi) => {
          const tooth = toothMeshesMap.current.get(fdi);
          if (tooth) {
            const mat = tooth.material as THREE.MeshStandardMaterial;
            mat.color.setHex(currentStage.actionType === "permanent_bridge" ? 0xffffff : 0xfef08a);
            mat.roughness = 0.1;
            mat.metalness = 0.06;
          }
        });
      } else if (currentStage.actionType === "healing") {
        // İyileşme süreci: Hafif biyolojik nabız
        gsap.to(model.position, {
          y: -0.06,
          yoyo: true,
          repeat: 1,
          duration: 0.8,
          ease: "sine.inOut",
        });
      }
    });

    return () => {
      ctx.revert();
      resetTeethVisuals();
    };
  }, [currentStage]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current || !modelRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0.45,
      z: 3.8,
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
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
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
            3D Çene ve Diş Modeli Hazırlanıyor...
          </span>
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

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 z-10 text-[10px] text-slate-400">
        <span>Sol Tık + Sürükle: 360° Döndür · Sağ Tık / Çift Parmak: Kaydır · Tekerlek: Yakınlaştır</span>
      </div>
    </div>
  );
}
