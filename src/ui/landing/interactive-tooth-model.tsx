"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Move3d } from "lucide-react";

const TOOTH_MODEL_URL = "/models/tooth.glb";

interface DragTarget {
  active: boolean;
  lastX: number;
  lastY: number;
  yaw: number;
  pitch: number;
}

const MAX_PITCH = 0.5;
const IDLE_SPIN_SPEED = 0.45;

const emptySubscribe = () => () => {};

function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function detectReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Stüdyo ışığı: arka planı değiştirmeden yalnızca yansıma/aydınlatma sağlar. */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);

  const envMap = useMemo(() => {
    const generator = new THREE.PMREMGenerator(gl);
    const texture = generator.fromScene(new RoomEnvironment(), 0.04).texture;
    generator.dispose();
    return texture;
  }, [gl]);

  useEffect(() => () => envMap.dispose(), [envMap]);

  return <primitive object={envMap} attach="environment" />;
}

function ToothMesh({
  targetRef,
  autoRotate,
}: {
  readonly targetRef: React.RefObject<DragTarget>;
  readonly autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothRef = useRef({ yaw: 0, pitch: 0, idle: 0.6 });

  const gltf = useLoader(GLTFLoader, TOOTH_MODEL_URL);
  const geometry = useMemo(() => {
    let found: THREE.BufferGeometry | null = null;
    gltf.scene.traverse((node) => {
      if (!found && (node as THREE.Mesh).isMesh) {
        found = (node as THREE.Mesh).geometry;
      }
    });
    return found as THREE.BufferGeometry | null;
  }, [gltf]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const dt = Math.min(0.05, delta);
    const target = targetRef.current;
    const smooth = smoothRef.current;
    const ease = Math.min(1, dt * 9);

    smooth.yaw += (target.yaw - smooth.yaw) * ease;
    smooth.pitch += (target.pitch - smooth.pitch) * ease;
    if (autoRotate && !target.active) {
      smooth.idle += dt * IDLE_SPIN_SPEED;
    }

    group.rotation.y = smooth.yaw + smooth.idle;
    group.rotation.x = 0.08 + smooth.pitch;
  });

  if (!geometry) return null;

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#ebe3d1"
          roughness={0.32}
          metalness={0}
          clearcoat={0.8}
          clearcoatRoughness={0.14}
        />
      </mesh>
    </group>
  );
}

export interface InteractiveToothModelProps {
  readonly ariaLabel: string;
  readonly fallbackAlt: string;
  readonly hint: string;
  readonly className?: string;
}

/**
 * Arka plansız, sürükleyerek döndürülebilir 3D diş modeli (Tooth.obj → tooth.glb).
 * WebGL yoksa statik diş görseline düşer.
 */
export function InteractiveToothModel({
  ariaLabel,
  fallbackAlt,
  hint,
  className = "",
}: InteractiveToothModelProps) {
  const webglReady = useSyncExternalStore(
    emptySubscribe,
    detectWebGLSupport,
    () => false
  );
  const reducedMotion = useSyncExternalStore(
    emptySubscribe,
    detectReducedMotion,
    () => true
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const targetRef = useRef<DragTarget>({
    active: false,
    lastX: 0,
    lastY: 0,
    yaw: 0,
    pitch: 0,
  });

  // Ekran dışındayken render döngüsünü durdur.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { threshold: 0.05 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = targetRef.current;
    target.active = true;
    target.lastX = event.clientX;
    target.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = targetRef.current;
    if (!target.active) return;
    const dx = event.clientX - target.lastX;
    const dy = event.clientY - target.lastY;
    target.lastX = event.clientX;
    target.lastY = event.clientY;
    target.yaw += dx * 0.011;
    target.pitch = THREE.MathUtils.clamp(
      target.pitch + dy * 0.006,
      -MAX_PITCH,
      MAX_PITCH
    );
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    targetRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={`relative h-[360px] w-full cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-[440px] lg:h-[520px] ${className}`}
    >
      {webglReady ? (
        <Canvas
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0, 6.4], fov: 30 }}
          gl={{ alpha: true, antialias: true }}
          style={{
            background: "transparent",
            filter: "drop-shadow(0 26px 28px rgba(15, 23, 42, 0.16))",
          }}
        >
          <Suspense fallback={null}>
            <StudioEnvironment />
          </Suspense>
          <hemisphereLight args={["#ffffff", "#cbd5e1", 0.4]} />
          <directionalLight
            position={[3.5, 4.5, 4]}
            intensity={1.5}
            color="#fffaf0"
          />
          <directionalLight
            position={[-4, 1.5, -3]}
            intensity={0.9}
            color="#bfdbfe"
          />
          <Suspense fallback={null}>
            <ToothMesh targetRef={targetRef} autoRotate={!reducedMotion} />
          </Suspense>
        </Canvas>
      ) : (
        <Image
          src="/tooth-hero.png"
          alt={fallbackAlt}
          width={360}
          height={360}
          className="mx-auto h-full w-auto object-contain"
        />
      )}

      <span className="pointer-events-none absolute bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 text-xs font-medium text-slate-400">
        <Move3d aria-hidden="true" className="h-4 w-4" />
        {hint}
      </span>
    </div>
  );
}
