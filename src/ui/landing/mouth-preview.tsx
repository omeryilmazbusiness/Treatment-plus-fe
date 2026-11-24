"use client";

import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MOUTH_MODEL_URL = "/mouth.glb";

/** Çene ve diş seti: kamera bunun etrafına yerleşir (yoksa tüm model). */
const FOCUS_NODE_NAMES = ["TeethTongueSet_midres", "TeethUpper_midres"] as const;

function invertTexture(tex: THREE.Texture): THREE.Texture {
  const img = tex.image as HTMLImageElement | HTMLCanvasElement | undefined;
  const w = img?.width ?? 0;
  const h = img?.height ?? 0;
  if (!img || !w || !h) return tex;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
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
  out.image = canvas;
  out.needsUpdate = true;
  return out;
}

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

/** Sahneyi vitrine hazırlar: ışıkları/tükürüğü kapatır, malzemeyi düzeltir, merkezler. Bir kez çalışır. */
function prepareMouthScene(scene: THREE.Group): THREE.Group {
  if (scene.userData.landingPrepared) return scene;

  scene.traverse((node) => {
    if ((node as THREE.Light).isLight) {
      node.visible = false;
      return;
    }
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    const name = (mesh.name || "").toLowerCase();
    if (name.includes("saliva")) {
      mesh.visible = false;
      return;
    }
    const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const material = source as THREE.MeshStandardMaterial | undefined;
    if (material?.isMeshStandardMaterial) {
      material.envMapIntensity = 1.15;
      material.metalness = 0;
      if (material.roughnessMap) {
        material.roughnessMap = invertTexture(material.roughnessMap);
        material.roughness = 1;
      } else {
        material.roughness = name.includes("gums") ? 0.65 : 0.45;
      }
      material.needsUpdate = true;
    }
  });

  scene.updateMatrixWorld(true);
  const focus =
    FOCUS_NODE_NAMES.map((name) => scene.getObjectByName(name)).find(Boolean) ?? scene;
  const box = new THREE.Box3().setFromObject(focus);
  scene.position.sub(box.getCenter(new THREE.Vector3()));
  scene.userData.landingPrepared = true;
  scene.userData.landingSize = box.getSize(new THREE.Vector3()).length();
  return scene;
}

function frameCamera(camera: THREE.Camera, modelSize: number, aspect: number): void {
  const perspective = camera as THREE.PerspectiveCamera;
  // Dar (dikey telefon) kadrajda ağız genişliği sığsın diye uzaklaş.
  const narrowFactor = Math.max(1, (1.5 / aspect) * 0.58);
  const distance = Math.max(modelSize * 1.08, 0.18) * narrowFactor;
  perspective.near = distance / 50;
  perspective.far = distance * 40;
  perspective.position.set(0, distance * 0.14, distance);
  perspective.lookAt(0, -distance * 0.07, 0);
  perspective.updateProjectionMatrix();
}

/** Stüdyodaki `mouth.glb` ile aynı model; yalnızca vitrin için hafifçe sallanır. */
function Mouth() {
  const gltf = useLoader(GLTFLoader, MOUTH_MODEL_URL);
  const camera = useThree((state) => state.camera);
  const groupRef = useRef<THREE.Group>(null);

  const root = useMemo(() => prepareMouthScene(gltf.scene), [gltf]);

  const aspect = useThree((state) => state.size.width / Math.max(state.size.height, 1));

  useEffect(() => {
    frameCamera(camera, Number(root.userData.landingSize) || 0.3, aspect);
  }, [camera, root, aspect]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    group.rotation.y = Math.sin(t * 0.55) * 0.5;
    group.rotation.x = Math.sin(t * 0.37) * 0.06 + 0.04;
  });

  return (
    <group ref={groupRef}>
      <primitive object={root} />
    </group>
  );
}

export interface MouthPreviewProps {
  readonly className?: string;
}

/** Hasta filminin sahnesi: stüdyodaki ağız/diş modeli, şeffaf zeminde. */
export function MouthPreview({ className = "" }: MouthPreviewProps) {
  return (
    <div aria-hidden="true" className={className}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 32, near: 0.01, far: 20, position: [0, 0, 1] }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <StudioEnvironment />
        <ambientLight intensity={0.9} />
        <directionalLight position={[-2, 3, 3]} intensity={1.1} />
        <directionalLight position={[2, 2, 4]} intensity={0.8} color="#93c5fd" />
        <Suspense fallback={null}>
          <Mouth />
        </Suspense>
      </Canvas>
    </div>
  );
}
