"use client";

import React, {
  Suspense,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Sparkles } from "lucide-react";

import {
  DEFAULT_PROCEDURES,
  type ProcedurePreset,
} from "./landing-data";

export interface OdontogramMeshProps {
  readonly procedure: ProcedurePreset;
  readonly autoRotate?: boolean;
  readonly isPlaying?: boolean;
  readonly jumpRequest?: { readonly stage: number; readonly seq: number } | null;
  readonly onTick?: (phase: number, stageIdx: number) => void;
  readonly userYaw?: number;
  readonly userPitch?: number;
}

interface ProcedureStageMeta {
  readonly step: number;
  readonly shortLabel: string;
  readonly title: string;
  readonly detail: string;
}

const PROCEDURE_STAGES: Record<string, readonly ProcedureStageMeta[]> = {
  implant: [
    {
      step: 1,
      shortLabel: "1. Kemik Analizi",
      title: "Eksik Diş Boşluğu & Kemik Ölçümü",
      detail: "Komşu dişler arasındaki çene kemiği hacmi ve implant aksı belirlenir.",
    },
    {
      step: 2,
      shortLabel: "2. İmplant Vidası",
      title: "Titanyum Fikstür Yerleşimi",
      detail: "Yivli titanyum implant vidası çene kemiği yuvasına döner hareketle yerleştirilir.",
    },
    {
      step: 3,
      shortLabel: "3. Abutment",
      title: "Titanyum Dayanak (Abutment) Bağlantısı",
      detail: "İmplant ile üst kuron arasındaki diş eti çıkış profilini oluşturan dayanak takılır.",
    },
    {
      step: 4,
      shortLabel: "4. Zirkonyum Kuron",
      title: "Anatomik Molar Kuron Yüklemesi",
      detail: "4 tüberküllü zirkonyum azı dişi kuronu yerleştirilerek doğal çiğneme hattı tamamlanır.",
    },
  ],
  endodontics: [
    {
      step: 1,
      shortLabel: "1. Enfekte Pulpa",
      title: "Pulpa İltihabı & Apikal Lezyon Tespiti",
      detail: "Kesit görünümünde dişin içindeki enfekte sinir dokusu ve kök ucu lezyonu incelenir.",
    },
    {
      step: 2,
      shortLabel: "2. Kanal Temizliği",
      title: "Döner Eğe ile Kök Kanal Şekillendirme",
      detail: "Endodontik döner eğe kıvrımlı kök kanallarına inerek enfekte dokuyu temizler.",
    },
    {
      step: 3,
      shortLabel: "3. Kanal Dolumu",
      title: "Guta-Perka ile Sızdırmaz Obtürasyon",
      detail: "Temizlenen kök kanalları kök ucundan kurona doğru biyouyumlu dolgu ile mühürlenir.",
    },
    {
      step: 4,
      shortLabel: "4. Üst Restorasyon",
      title: "Koronal Dolgu & Apikal İyileşme",
      detail: "Üst giriş kavitesi kompozit dolgu ile kapatılır; kök ucu dokusu tamamen iyileşir.",
    },
  ],
  prosthetics: [
    {
      step: 1,
      shortLabel: "1. Dijital Kesim",
      title: "Minimal İnvaziv Diş Preparasyonu",
      detail: "Ön kesici dişler diş eti sınırına uyumlu basamak hattıyla hazırlanır.",
    },
    {
      step: 2,
      shortLabel: "2. CAD/CAM Prova",
      title: "Vita B1 Zirkonyum Tasarım & Prova",
      detail: "Komşu dişlerle simetrik, ışık geçirgenliği yüksek kuronlar konumlandırılır.",
    },
    {
      step: 3,
      shortLabel: "3. Simantasyon",
      title: "Hassas Oturuş & Adeziv Bağlanma",
      detail: "Estetik zirkonyum kaplamalar hazırlanan diş yüzeylerine mikron hassasiyetle oturur.",
    },
    {
      step: 4,
      shortLabel: "4. Gülüş Hattı",
      title: "Doğal Mine Parlaklığı & Estetik Uyum",
      detail: "Diş eti papilleri ve kesici kenar formuyla bütünleşen ideal ön gülüş tamamlanır.",
    },
  ],
};

/**
 * Gerçekçi 4 tüberküllü (cusp) ve derin santral fissür oluklu anatomik azı dişi (molar) kuronu.
 */
function createSculptedMolarCrownGeometry(
  widthScale = 1.0,
  heightScale = 1.0
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.56, 64, 48);
  const pos = geo.attributes.position;
  if (!pos) return geo;

  const cuspPeaks: readonly [number, number, number][] = [
    [-0.42, 0.36, 0.32],
    [0.42, 0.36, 0.29],
    [-0.40, -0.36, 0.31],
    [0.40, -0.36, 0.27],
  ];

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const nx = vx / 0.56;
    const ny = vy / 0.56;
    const nz = vz / 0.56;

    const theta = Math.atan2(nz, nx);
    const squircle = 1 + 0.09 * Math.cos(4 * theta);

    let radial = 1.0;
    if (ny < -0.1) {
      const t = Math.min(1, (-0.1 - ny) / 0.9);
      radial = 1.0 - 0.38 * Math.pow(t, 1.3);
    } else {
      radial = 1.05 - 0.1 * Math.pow(ny, 2);
    }

    const midGroove =
      1 - 0.065 * Math.exp(-Math.pow(nx * 4.2, 2)) * Math.max(0, 1 - Math.abs(ny * 0.8));

    const x = vx * squircle * radial * midGroove * 1.14 * widthScale;
    const z = vz * squircle * radial * 0.92 * widthScale;
    let y = vy * 0.76 * heightScale;

    if (ny > 0.08) {
      const topBlend = Math.min(1, (ny - 0.08) / 0.92);
      const baseTableY = 0.22 * heightScale;
      let cuspLift = 0;
      for (const [cx, cz, ch] of cuspPeaks) {
        const distSq = Math.pow(nx - cx, 2) + Math.pow(nz - cz, 2);
        cuspLift += ch * heightScale * Math.exp(-distSq / 0.18);
      }

      const grooveX = Math.exp(-Math.pow(nx * 4.2, 2));
      const grooveZ = Math.exp(-Math.pow(nz * 4.2, 2));
      const valley = 0.14 * heightScale * Math.max(grooveX, grooveZ);

      const targetY = baseTableY + cuspLift - valley;
      y = THREE.MathUtils.lerp(y, targetY, Math.pow(topBlend, 0.7));
    }

    if (ny < -0.68) {
      y = THREE.MathUtils.lerp(y, -0.36 * heightScale, (-0.68 - ny) / 0.32);
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Çatallanan 2 anatomik kök (Mezial ve Distal) + furkasyon gövdesi geometrisi.
 */
function createBifurcatedRootTrunkGeometry(): {
  mesialRoot: THREE.BufferGeometry;
  distalRoot: THREE.BufferGeometry;
  rootTrunk: THREE.BufferGeometry;
} {
  const makeRoot = (dirSign: number) => {
    const length = 0.92;
    const geo = new THREE.CylinderGeometry(1, 1, length, 32, 28, false);
    geo.translate(0, -length / 2, 0);
    const pos = geo.attributes.position;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const t = Math.max(0, Math.min(1, -vy / length));
        const rx = THREE.MathUtils.lerp(0.21, 0.055, Math.pow(t, 0.85));
        const rz = THREE.MathUtils.lerp(0.26, 0.065, Math.pow(t, 0.85));
        const tipCap =
          t > 0.88 ? Math.cos(((t - 0.88) / 0.12) * (Math.PI / 2)) * 0.65 + 0.35 : 1;

        const curveOffset =
          dirSign * (0.22 * t + 0.06 * Math.sin(t * Math.PI));

        pos.setXYZ(i, vx * rx * tipCap + curveOffset, vy, vz * rz * tipCap);
      }
      geo.computeVertexNormals();
    }
    return geo;
  };

  const trunk = new THREE.CylinderGeometry(0.42, 0.38, 0.28, 40, 12);
  const tPos = trunk.attributes.position;
  if (tPos) {
    for (let i = 0; i < tPos.count; i++) {
      const vx = tPos.getX(i);
      const vy = tPos.getY(i);
      const vz = tPos.getZ(i);
      tPos.setXYZ(i, vx * 1.12, vy, vz * 0.82);
    }
    trunk.computeVertexNormals();
  }

  return {
    mesialRoot: makeRoot(-1),
    distalRoot: makeRoot(1),
    rootTrunk: trunk,
  };
}

/**
 * Üst ön kesici diş (Santral / Lateral Incisor) anatomik kuron geometrisi.
 */
function createSculptedIncisorGeometry(
  widthScale = 1,
  heightScale = 1
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.36, 48, 40);
  const pos = geo.attributes.position;
  if (!pos) return geo;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const nx = vx / 0.36;
    const ny = vy / 0.36;

    const widthFactor =
      ny > 0.15
        ? 0.94 - 0.28 * Math.pow((ny - 0.15) / 0.85, 1.35)
        : 0.98 - 0.04 * Math.pow(ny, 2);

    const thicknessFactor =
      ny < 0
        ? THREE.MathUtils.lerp(0.5, 0.15, Math.min(1, -ny))
        : 0.5 + 0.1 * Math.sin(ny * Math.PI);

    const x = vx * widthFactor * widthScale;
    let y = vy * 1.26 * heightScale;
    let z = vz * thicknessFactor;

    if (vz > 0) {
      z += 0.028 * (1 - nx * nx) * (1 - ny * ny * 0.7);
    }

    if (ny < -0.76) {
      y = THREE.MathUtils.lerp(y, -0.39 * heightScale, (-0.76 - ny) / 0.24);
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  return geo;
}

function smoothRange(value: number, start: number, end: number): number {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

/**
 * 1) İMPLANT CERRAHİSİ (#36) — 4 AŞAMALI SAHNE
 */
function ImplantProcedureScene({
  phaseRef,
}: {
  readonly phaseRef: React.MutableRefObject<number>;
}) {
  const implantGroupRef = useRef<THREE.Group>(null);
  const abutmentGroupRef = useRef<THREE.Group>(null);
  const crownGroupRef = useRef<THREE.Group>(null);
  const guideRingRef = useRef<THREE.Mesh>(null);
  const crownMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const abutmentMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const mainCrownGeo = useMemo(() => createSculptedMolarCrownGeometry(1.0, 1.0), []);
  const neighborCrownGeo = useMemo(() => createSculptedMolarCrownGeometry(0.84, 0.92), []);
  const rootGeo = useMemo(() => createBifurcatedRootTrunkGeometry(), []);

  useFrame((_, delta) => {
    const phaseProgress = phaseRef.current;
    const screwProgress = smoothRange(phaseProgress, 0.6, 1.85);
    const abutmentProgress = smoothRange(phaseProgress, 1.85, 2.85);
    const crownProgress = smoothRange(phaseProgress, 2.85, 3.75);

    if (implantGroupRef.current) {
      const targetY = THREE.MathUtils.lerp(0.35, -0.42, screwProgress);
      implantGroupRef.current.position.y = THREE.MathUtils.lerp(
        implantGroupRef.current.position.y,
        targetY,
        delta * 7
      );
      const targetRotY = (1 - screwProgress) * Math.PI * 4;
      implantGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        implantGroupRef.current.rotation.y,
        targetRotY,
        delta * 7
      );
    }

    if (abutmentGroupRef.current) {
      const targetY = THREE.MathUtils.lerp(0.68, 0.08, abutmentProgress);
      abutmentGroupRef.current.position.y = THREE.MathUtils.lerp(
        abutmentGroupRef.current.position.y,
        targetY,
        delta * 7
      );
      const scaleVal = THREE.MathUtils.lerp(0.01, 1, smoothRange(phaseProgress, 1.6, 2.1));
      abutmentGroupRef.current.scale.setScalar(scaleVal);
    }

    if (crownGroupRef.current) {
      const targetY = THREE.MathUtils.lerp(0.76, 0.44, crownProgress);
      crownGroupRef.current.position.y = THREE.MathUtils.lerp(
        crownGroupRef.current.position.y,
        targetY,
        delta * 7
      );
    }

    if (crownMatRef.current) {
      const targetOpacity = THREE.MathUtils.lerp(0.18, 1.0, smoothRange(phaseProgress, 2.6, 3.3));
      crownMatRef.current.opacity = THREE.MathUtils.lerp(
        crownMatRef.current.opacity,
        targetOpacity,
        delta * 7
      );
    }

    if (abutmentMatRef.current) {
      abutmentMatRef.current.opacity = THREE.MathUtils.lerp(
        0.15,
        1.0,
        smoothRange(phaseProgress, 1.7, 2.2)
      );
    }

    if (guideRingRef.current) {
      guideRingRef.current.rotation.z += delta * 1.2;
      const pulse = 1 + Math.sin(phaseProgress * Math.PI * 2) * 0.06;
      guideRingRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, -0.04, 0]}>
      {/* Komşu Doğal Dişler (#35 ve #37) */}
      <group position={[-1.22, 0.38, -0.06]} rotation={[0, 0.12, -0.03]}>
        <mesh geometry={neighborCrownGeo}>
          <meshPhysicalMaterial color="#f4efe6" roughness={0.18} clearcoat={0.85} />
        </mesh>
        <mesh geometry={rootGeo.mesialRoot} position={[0, -0.25, 0]} scale={[0.85, 0.72, 0.85]}>
          <meshStandardMaterial color="#e2d9c5" roughness={0.35} transparent opacity={0.55} />
        </mesh>
      </group>

      <group position={[1.22, 0.38, -0.06]} rotation={[0, -0.12, 0.03]}>
        <mesh geometry={neighborCrownGeo}>
          <meshPhysicalMaterial color="#f4efe6" roughness={0.18} clearcoat={0.85} />
        </mesh>
        <mesh geometry={rootGeo.distalRoot} position={[0, -0.25, 0]} scale={[0.85, 0.72, 0.85]}>
          <meshStandardMaterial color="#e2d9c5" roughness={0.35} transparent opacity={0.55} />
        </mesh>
      </group>

      {/* Çene Kemiği ve Diş Eti Kesit Bloğu */}
      <group position={[0, -0.42, 0]}>
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[2.9, 0.24, 0.92]} />
          <meshPhysicalMaterial
            color="#f472b6"
            roughness={0.36}
            clearcoat={0.4}
            transparent
            opacity={0.52}
            depthWrite={false}
          />
        </mesh>

        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[2.9, 0.82, 0.88]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            emissive="#1e293b"
            emissiveIntensity={0.15}
            roughness={0.5}
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>

        <mesh
          ref={guideRingRef}
          position={[0, 0.57, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.38, 0.016, 14, 48]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.4}
          />
        </mesh>
      </group>

      {/* Titanyum İmplant Fikstür (Vida) */}
      <group ref={implantGroupRef} position={[0, -0.42, 0]}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.15, 0.88, 36]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#1d4ed8"
            emissiveIntensity={0.3}
            metalness={0.88}
            roughness={0.18}
          />
        </mesh>

        {[-0.32, -0.2, -0.08, 0.04, 0.16, 0.28].map((yPos, idx) => {
          const r = THREE.MathUtils.lerp(0.16, 0.26, (yPos + 0.35) / 0.7);
          return (
            <mesh
              key={idx}
              position={[0, yPos, 0]}
              rotation={[Math.PI / 2 + 0.09, 0, 0]}
            >
              <torusGeometry args={[r, 0.024, 12, 36]} />
              <meshStandardMaterial
                color="#93c5fd"
                emissive="#2563eb"
                emissiveIntensity={0.4}
                metalness={0.92}
                roughness={0.14}
              />
            </mesh>
          );
        })}

        <mesh position={[0, -0.44, 0]}>
          <sphereGeometry args={[0.15, 24, 16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Titanyum Abutment */}
      <group ref={abutmentGroupRef} position={[0, 0.08, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.21, 0.28, 0.28, 6]} />
          <meshStandardMaterial
            ref={abutmentMatRef}
            color="#e2e8f0"
            metalness={0.9}
            roughness={0.16}
            transparent
          />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.3, 0.24, 0.1, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Anatomik 4 Tüberküllü Zirkonyum Kuron */}
      <group ref={crownGroupRef} position={[0, 0.44, 0]}>
        <mesh geometry={mainCrownGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            ref={crownMatRef}
            color="#fffdf9"
            emissive="#0284c7"
            emissiveIntensity={0.08}
            roughness={0.12}
            metalness={0.03}
            clearcoat={1}
            clearcoatRoughness={0.06}
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 2) KANAL TEDAVİSİ (#14 / Molar Kesit) — 4 AŞAMALI SAHNE
 */
function RootCanalProcedureScene({
  phaseRef,
}: {
  readonly phaseRef: React.MutableRefObject<number>;
}) {
  const fileGroupRef = useRef<THREE.Group>(null);
  const sealCapRef = useRef<THREE.Mesh>(null);
  const pulpChamberMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const mesialCanalMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const distalCanalMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const mesialLesionRef = useRef<THREE.Mesh>(null);
  const distalLesionRef = useRef<THREE.Mesh>(null);

  const crownGeo = useMemo(() => createSculptedMolarCrownGeometry(1.06, 1.05), []);
  const rootParts = useMemo(() => createBifurcatedRootTrunkGeometry(), []);

  const canals = useMemo(() => {
    const makeCanal = (dirSign: number) => {
      const pts = [
        new THREE.Vector3(dirSign * 0.12, 0.28, 0.04),
        new THREE.Vector3(dirSign * 0.16, 0.02, 0.04),
        new THREE.Vector3(dirSign * 0.29, -0.38, 0.04),
        new THREE.Vector3(dirSign * 0.38, -0.76, 0.04),
      ];
      return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts),
        40,
        0.042,
        14,
        false
      );
    };
    return {
      mesial: makeCanal(-1),
      distal: makeCanal(1),
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const phaseProgress = phaseRef.current;

    const cleanProgress = smoothRange(phaseProgress, 1.1, 2.1);
    const obturationProgress = smoothRange(phaseProgress, 2.1, 3.0);
    const sealProgress = smoothRange(phaseProgress, 3.0, 3.75);

    if (fileGroupRef.current) {
      fileGroupRef.current.rotation.y += delta * 12;
      const inPhase2 =
        smoothRange(phaseProgress, 0.85, 1.45) *
        (1 - smoothRange(phaseProgress, 2.05, 2.45));
      const targetFileY = THREE.MathUtils.lerp(0.62, 0.06, inPhase2);
      fileGroupRef.current.position.y = THREE.MathUtils.lerp(
        fileGroupRef.current.position.y,
        targetFileY,
        delta * 8
      );
      fileGroupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(0.001, 1, smoothRange(inPhase2, 0.02, 0.2))
      );
    }

    const infectedColor = new THREE.Color("#ef4444");
    const cleanedColor = new THREE.Color("#38bdf8");
    const guttaColor = new THREE.Color("#fb7185");

    const currentColor = infectedColor
      .clone()
      .lerp(cleanedColor, cleanProgress)
      .lerp(guttaColor, obturationProgress);

    if (pulpChamberMatRef.current) {
      pulpChamberMatRef.current.color.copy(currentColor);
      pulpChamberMatRef.current.emissive.copy(currentColor);
      pulpChamberMatRef.current.emissiveIntensity =
        0.55 + (1 - cleanProgress) * 0.35 * Math.sin(t * 5);
    }

    if (mesialCanalMatRef.current) {
      mesialCanalMatRef.current.color.copy(currentColor);
      mesialCanalMatRef.current.emissive.copy(currentColor);
      mesialCanalMatRef.current.emissiveIntensity = 0.65;
    }

    if (distalCanalMatRef.current) {
      distalCanalMatRef.current.color.copy(currentColor);
      distalCanalMatRef.current.emissive.copy(currentColor);
      distalCanalMatRef.current.emissiveIntensity = 0.65;
    }

    const healFactor = 1 - obturationProgress * 0.65;
    const pulse = 1 + (1 - cleanProgress) * 0.18 * Math.sin(t * 4);
    if (mesialLesionRef.current) {
      mesialLesionRef.current.scale.setScalar(healFactor * pulse);
    }
    if (distalLesionRef.current) {
      distalLesionRef.current.scale.setScalar(healFactor * pulse);
    }

    if (sealCapRef.current) {
      const targetY = THREE.MathUtils.lerp(0.86, 0.62, sealProgress);
      sealCapRef.current.position.y = THREE.MathUtils.lerp(
        sealCapRef.current.position.y,
        targetY,
        delta * 7
      );
      const s = Math.max(0.001, smoothRange(phaseProgress, 2.7, 3.2));
      sealCapRef.current.scale.set(1.1 * s, 0.34 * s, 0.95 * s);
    }
  });

  return (
    <group position={[0, 0.04, 0]}>
      {/* 1. Yekpare Anatomik Diş (Kuron + Kök Gövdesi + Mezial & Distal Kökler) */}
      <group>
        <mesh geometry={crownGeo} position={[0, 0.42, 0]}>
          <meshPhysicalMaterial
            color="#fffdf8"
            roughness={0.14}
            metalness={0.02}
            clearcoat={1}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>

        <mesh geometry={rootParts.rootTrunk} position={[0, 0.06, 0]}>
          <meshPhysicalMaterial
            color="#f3ead8"
            roughness={0.24}
            transparent
            opacity={0.46}
            depthWrite={false}
          />
        </mesh>

        <mesh geometry={rootParts.mesialRoot} position={[-0.14, 0.04, 0]}>
          <meshPhysicalMaterial
            color="#efe4ce"
            roughness={0.26}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>
        <mesh geometry={rootParts.distalRoot} position={[0.14, 0.04, 0]}>
          <meshPhysicalMaterial
            color="#efe4ce"
            roughness={0.26}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. Pulpa Odası ve Kök Kanalları */}
      <group>
        <mesh position={[0, 0.32, 0.04]} scale={[1.35, 0.85, 0.7]}>
          <sphereGeometry args={[0.16, 28, 20]} />
          <meshStandardMaterial
            ref={pulpChamberMatRef}
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={0.65}
            roughness={0.25}
          />
        </mesh>

        <mesh geometry={canals.mesial}>
          <meshStandardMaterial
            ref={mesialCanalMatRef}
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>

        <mesh geometry={canals.distal}>
          <meshStandardMaterial
            ref={distalCanalMatRef}
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>

        <mesh ref={mesialLesionRef} position={[-0.38, -0.78, 0.04]}>
          <sphereGeometry args={[0.085, 20, 20]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            transparent
            opacity={0.85}
          />
        </mesh>

        <mesh ref={distalLesionRef} position={[0.38, -0.78, 0.04]}>
          <sphereGeometry args={[0.085, 20, 20]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* 3. Döner Endodontik Eğe */}
      <group ref={fileGroupRef} position={[-0.18, 0.25, 0.04]} rotation={[0, 0, -0.14]}>
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.16, 20]} />
          <meshStandardMaterial color="#0284c7" metalness={0.75} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.33, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.035, 20]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.028, 0.006, 0.78, 16]} />
          <meshStandardMaterial
            color="#e2e8f0"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
            metalness={0.95}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 4. Üst Oklüzal Kompozit Restorasyon */}
      <mesh ref={sealCapRef} position={[0, 0.62, 0]} scale={[1.1, 0.34, 0.95]}>
        <sphereGeometry args={[0.25, 28, 20]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.4}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>

      {/* 5. Diş Eti ve Alveoler Kemik Kesit Çerçevesi */}
      <group position={[0, -0.38, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[1.65, 0.2, 0.78]} />
          <meshPhysicalMaterial
            color="#f472b6"
            roughness={0.38}
            transparent
            opacity={0.36}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[1.65, 0.78, 0.74]} />
          <meshPhysicalMaterial
            color="#94a3b8"
            roughness={0.5}
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Estetik Zirkonyum sahnesi için tam simetrik Üst Diş Eti Arkı + Üst ve Alt Dudak Gülüş Çerçevesi üretir.
 */
function createSmileArchGeometries(): {
  gingivaGeo: THREE.BufferGeometry;
  upperLipGeo: THREE.BufferGeometry;
  lowerLipGeo: THREE.BufferGeometry;
} {
  // 1. Simetrik Üst Diş Eti Arkı (Sol köşeden sağ köşeye tam simetrik)
  const gingivaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.12, 0.34, -0.22),
    new THREE.Vector3(-0.58, 0.42, -0.06),
    new THREE.Vector3(0, 0.44, 0.0),
    new THREE.Vector3(0.58, 0.42, -0.06),
    new THREE.Vector3(1.12, 0.34, -0.22),
  ]);
  const gingivaGeo = new THREE.TubeGeometry(gingivaCurve, 64, 0.19, 24, false);

  // Diş eti uçlarını ve alt diş boynu girintilerini (scalloping) yumuşat
  const gPos = gingivaGeo.attributes.position;
  if (gPos) {
    for (let i = 0; i < gPos.count; i++) {
      const vx = gPos.getX(i);
      const vy = gPos.getY(i);
      const vz = gPos.getZ(i);
      const edgeTaper = 1 - 0.35 * Math.pow(Math.min(1, Math.abs(vx) / 1.12), 2.2);
      // Diş aralarında (x = -0.54, 0, +0.54) aşağı doğru doğal diş eti papili uzantısı
      const papillaWave =
        vy < 0.38
          ? -0.045 * Math.cos((vx / 0.55) * Math.PI * 2) * edgeTaper
          : 0;
      gPos.setXYZ(i, vx, vy + papillaWave, vz * 0.85);
    }
    gingivaGeo.computeVertexNormals();
  }

  // 2. Tam Simetrik Üst Dudak (Cupid's Bow / Eros Yaylı Gülüş Çerçevesi)
  const upperLipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.38, -0.06, -0.26),
    new THREE.Vector3(-0.88, 0.48, -0.04),
    new THREE.Vector3(-0.28, 0.62, 0.08),
    new THREE.Vector3(0, 0.58, 0.1),
    new THREE.Vector3(0.28, 0.62, 0.08),
    new THREE.Vector3(0.88, 0.48, -0.04),
    new THREE.Vector3(1.38, -0.06, -0.26),
  ]);
  const upperLipGeo = new THREE.TubeGeometry(upperLipCurve, 72, 0.135, 24, false);
  const uPos = upperLipGeo.attributes.position;
  if (uPos) {
    for (let i = 0; i < uPos.count; i++) {
      const vx = uPos.getX(i);
      const vy = uPos.getY(i);
      const vz = uPos.getZ(i);
      // Dudak köşelerine (komissürlere) doğru incelme
      const cornerFactor = Math.max(0, Math.min(1, Math.abs(vx) / 1.38));
      const scale = 1 - 0.52 * Math.pow(cornerFactor, 1.8);
      const centerLineY =
        0.6 * (1 - Math.pow(cornerFactor, 1.65)) - 0.06 * Math.pow(cornerFactor, 1.65);
      uPos.setXYZ(
        i,
        vx,
        centerLineY + (vy - centerLineY) * scale,
        vz
      );
    }
    upperLipGeo.computeVertexNormals();
  }

  // 3. Tam Simetrik Alt Dudak (Gülüş Hattı Alt Kavisi)
  const lowerLipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.38, -0.06, -0.26),
    new THREE.Vector3(-0.86, -0.48, -0.04),
    new THREE.Vector3(0, -0.64, 0.08),
    new THREE.Vector3(0.86, -0.48, -0.04),
    new THREE.Vector3(1.38, -0.06, -0.26),
  ]);
  const lowerLipGeo = new THREE.TubeGeometry(lowerLipCurve, 72, 0.145, 24, false);
  const lPos = lowerLipGeo.attributes.position;
  if (lPos) {
    for (let i = 0; i < lPos.count; i++) {
      const vx = lPos.getX(i);
      const vy = lPos.getY(i);
      const vz = lPos.getZ(i);
      const cornerFactor = Math.max(0, Math.min(1, Math.abs(vx) / 1.38));
      const scale = 1 - 0.55 * Math.pow(cornerFactor, 1.8);
      const centerLineY =
        -0.62 * (1 - Math.pow(cornerFactor, 1.6)) - 0.06 * Math.pow(cornerFactor, 1.6);
      lPos.setXYZ(
        i,
        vx,
        centerLineY + (vy - centerLineY) * scale,
        vz
      );
    }
    lowerLipGeo.computeVertexNormals();
  }

  return { gingivaGeo, upperLipGeo, lowerLipGeo };
}

/**
 * 3) ESTETİK ZİRKONYUM (#11–#21) — 4 AŞAMALI SAHNE
 */
function ZirconiaProstheticsScene({
  phaseRef,
}: {
  readonly phaseRef: React.MutableRefObject<number>;
}) {
  const crownsGroupRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const leftCrownMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const rightCrownMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const centralCrownGeo = useMemo(() => createSculptedIncisorGeometry(1.06, 1.05), []);
  const lateralCrownGeo = useMemo(() => createSculptedIncisorGeometry(0.84, 0.9), []);
  const prepStumpGeo = useMemo(() => createSculptedIncisorGeometry(0.72, 0.78), []);
  const smileGeos = useMemo(() => createSmileArchGeometries(), []);

  useFrame((_, delta) => {
    const phaseProgress = phaseRef.current;
    const appearProgress = smoothRange(phaseProgress, 0.75, 1.65);
    const seatProgress = smoothRange(phaseProgress, 1.9, 2.95);

    if (crownsGroupRef.current) {
      const targetY = THREE.MathUtils.lerp(-0.42, 0.0, seatProgress);
      const targetZ = THREE.MathUtils.lerp(0.32, 0.02, seatProgress);

      crownsGroupRef.current.position.y = THREE.MathUtils.lerp(
        crownsGroupRef.current.position.y,
        targetY,
        delta * 7
      );
      crownsGroupRef.current.position.z = THREE.MathUtils.lerp(
        crownsGroupRef.current.position.z,
        targetZ,
        delta * 7
      );
    }

    const targetOpacity = THREE.MathUtils.lerp(0.22, 1.0, appearProgress);
    if (leftCrownMatRef.current) {
      leftCrownMatRef.current.opacity = THREE.MathUtils.lerp(
        leftCrownMatRef.current.opacity,
        targetOpacity,
        delta * 7
      );
    }
    if (rightCrownMatRef.current) {
      rightCrownMatRef.current.opacity = THREE.MathUtils.lerp(
        rightCrownMatRef.current.opacity,
        targetOpacity,
        delta * 7
      );
    }

    if (scanLineRef.current) {
      const showScan = 1 - seatProgress;
      scanLineRef.current.scale.setScalar(Math.max(0.001, showScan));
    }
  });

  return (
    <group position={[0, 0.06, 0]}>
      {/* 1. Tam Simetrik Üst Diş Eti Arkı (Gingiva) */}
      <mesh geometry={smileGeos.gingivaGeo}>
        <meshPhysicalMaterial
          color="#f48fb1"
          roughness={0.34}
          metalness={0.02}
          clearcoat={0.55}
        />
      </mesh>

      {/* 1B. Tam Simetrik Üst ve Alt Dudak Gülüş Hattı Çerçevesi */}
      <mesh geometry={smileGeos.upperLipGeo}>
        <meshPhysicalMaterial
          color="#e15b87"
          roughness={0.28}
          metalness={0.02}
          clearcoat={0.65}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh geometry={smileGeos.lowerLipGeo}>
        <meshPhysicalMaterial
          color="#e15b87"
          roughness={0.28}
          metalness={0.02}
          clearcoat={0.65}
          transparent
          opacity={0.78}
        />
      </mesh>
      {/* Sol ve Sağ Dudak Köşesi (Komissür) Birleşim Küreleri */}
      {[-1.38, 1.38].map((cx) => (
        <mesh key={cx} position={[cx, -0.06, -0.26]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshPhysicalMaterial
            color="#e15b87"
            roughness={0.28}
            clearcoat={0.65}
            transparent
            opacity={0.78}
          />
        </mesh>
      ))}

      {/* 2. Komşu Yan Kesici Dişler (#12 ve #22) */}
      <mesh
        geometry={lateralCrownGeo}
        position={[-0.78, 0.02, -0.1]}
        rotation={[0.05, -0.2, -0.04]}
      >
        <meshPhysicalMaterial color="#f6f1e7" roughness={0.16} clearcoat={0.9} />
      </mesh>
      <mesh
        geometry={lateralCrownGeo}
        position={[0.78, 0.02, -0.1]}
        rotation={[0.05, 0.2, 0.04]}
      >
        <meshPhysicalMaterial color="#f6f1e7" roughness={0.16} clearcoat={0.9} />
      </mesh>

      {/* 3. Kesilmiş Ön Santral Dişler (#11 ve #21 Preparasyon) */}
      <group>
        <mesh
          geometry={prepStumpGeo}
          position={[-0.28, 0.06, -0.02]}
          rotation={[0.04, -0.05, -0.02]}
        >
          <meshStandardMaterial
            color="#fde68a"
            emissive="#d97706"
            emissiveIntensity={0.22}
            roughness={0.32}
          />
        </mesh>
        <mesh
          geometry={prepStumpGeo}
          position={[0.28, 0.06, -0.02]}
          rotation={[0.04, 0.05, 0.02]}
        >
          <meshStandardMaterial
            color="#fde68a"
            emissive="#d97706"
            emissiveIntensity={0.22}
            roughness={0.32}
          />
        </mesh>

        <mesh
          ref={scanLineRef}
          position={[0, 0.28, 0.02]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.56, 0.012, 12, 48]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>

      {/* 4. Estetik Zirkonyum Kuronlar (#11 ve #21 — Her Mesh İçin Ayrı Materyal Örneği) */}
      <group ref={crownsGroupRef} position={[0, -0.35, 0.26]}>
        <mesh
          geometry={centralCrownGeo}
          position={[-0.28, 0, 0]}
          rotation={[0.04, -0.05, -0.02]}
          castShadow
        >
          <meshPhysicalMaterial
            ref={leftCrownMatRef}
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={0.14}
            roughness={0.09}
            metalness={0.03}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transparent
          />
        </mesh>
        <mesh
          geometry={centralCrownGeo}
          position={[0.28, 0, 0]}
          rotation={[0.04, 0.05, 0.02]}
          castShadow
        >
          <meshPhysicalMaterial
            ref={rightCrownMatRef}
            color="#ffffff"
            emissive="#38bdf8"
            emissiveIntensity={0.14}
            roughness={0.09}
            metalness={0.03}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3D Sahne Döndürücü ve Aşama Zamanlayıcısı (React re-render tetiklemeden 60 FPS çalışır).
 */
export function RotatingOdontogramPlaceholderMesh({
  procedure,
  isPlaying = true,
  jumpRequest = null,
  onTick,
  userYaw = 0,
  userPitch = 0,
}: OdontogramMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const internalPhaseRef = useRef<number>(0);
  const lastProcIdRef = useRef<string>(procedure.id);
  const lastJumpSeqRef = useRef<number>(0);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(0.1, delta);

    if (lastProcIdRef.current !== procedure.id) {
      lastProcIdRef.current = procedure.id;
      internalPhaseRef.current = 0;
    }

    if (jumpRequest && jumpRequest.seq !== lastJumpSeqRef.current) {
      lastJumpSeqRef.current = jumpRequest.seq;
      internalPhaseRef.current = jumpRequest.stage;
    } else if (isPlaying) {
      internalPhaseRef.current = (internalPhaseRef.current + clampedDelta * 0.42) % 4;
    }

    const currentPhase = internalPhaseRef.current;
    const stageIdx = Math.min(3, Math.floor(currentPhase));

    onTick?.(currentPhase, stageIdx);

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        userYaw,
        clampedDelta * 8
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        0.12 + userPitch,
        clampedDelta * 8
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {procedure.id === "implant" && (
        <ImplantProcedureScene phaseRef={internalPhaseRef} />
      )}
      {procedure.id === "endodontics" && (
        <RootCanalProcedureScene phaseRef={internalPhaseRef} />
      )}
      {procedure.id === "prosthetics" && (
        <ZirconiaProstheticsScene phaseRef={internalPhaseRef} />
      )}
    </group>
  );
}

export interface OdontogramCanvasProps {
  readonly procedures?: readonly ProcedurePreset[];
  readonly renderCustomModel?: (
    procedure: ProcedurePreset,
    autoRotate: boolean
  ) => React.ReactNode;
}

const emptySubscribe = () => () => {};

// WebGL desteğini yalnızca BİR KEZ kontrol edip önbelleğe al!
let cachedWebGLSupport: boolean | null = null;

function detectWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  try {
    const canvas = document.createElement("canvas");
    cachedWebGLSupport = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
}

export function OdontogramCanvas({
  procedures = DEFAULT_PROCEDURES,
  renderCustomModel,
}: OdontogramCanvasProps) {
  const [selectedId, setSelectedId] = useState<string>(
    procedures[0]?.id ?? "implant"
  );
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [jumpRequest, setJumpRequest] = useState<{
    readonly stage: number;
    readonly seq: number;
  } | null>(null);
  const [userRotation, setUserRotation] = useState<{ yaw: number; pitch: number }>({
    yaw: 0,
    pitch: 0,
  });

  const lastStageRef = useRef<number>(0);
  const progressBarRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const webglReady = useSyncExternalStore(
    emptySubscribe,
    detectWebGLSupport,
    () => false
  );

  const activeProcedure =
    procedures.find((item) => item.id === selectedId) ?? procedures[0];

  if (!activeProcedure) {
    return null;
  }

  const stages =
    PROCEDURE_STAGES[activeProcedure.id] ?? PROCEDURE_STAGES.implant ?? [];
  const currentStage = stages[activeStageIndex] ?? stages[0];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    setUserRotation((prev) => ({
      yaw: prev.yaw + dx * 0.01,
      pitch: Math.max(-0.5, Math.min(0.5, prev.pitch + dy * 0.008)),
    }));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const handleTick = (phase: number, stageIdx: number) => {
    if (stageIdx !== lastStageRef.current) {
      lastStageRef.current = stageIdx;
      setActiveStageIndex(stageIdx);
    }
    for (let i = 0; i < 4; i++) {
      const barEl = progressBarRefs.current[i];
      if (!barEl) continue;
      const pct =
        i < stageIdx
          ? 100
          : i === stageIdx
            ? Math.min(100, Math.max(0, (phase - i) * 100))
            : 0;
      barEl.style.width = `${pct}%`;
    }
  };

  const handleSelectStage = (idx: number) => {
    setJumpRequest((prev) => ({ stage: idx, seq: (prev?.seq ?? 0) + 1 }));
    lastStageRef.current = idx;
    setActiveStageIndex(idx);
  };

  return (
    <div className="relative flex h-[540px] w-full flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-5 shadow-[0_32px_80px_-20px_rgba(15,23,42,0.65)] ring-1 ring-white/10">
      {/* Dekoratif Medikal Grid & Işıma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-cyan-500/15 blur-3xl"
      />

      {/* 3D Sahne Alanı */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative mb-2 flex-1 cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing"
      >
        {webglReady ? (
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.06, 4.15], fov: 36 }}
            className="h-full w-full"
          >
            <ambientLight intensity={1.05} />
            <directionalLight position={[4, 6, 5]} intensity={2.1} />
            <directionalLight
              position={[-4, 2, 3]}
              intensity={0.95}
              color="#e0f2fe"
            />
            <pointLight
              position={[0, -3, 2]}
              intensity={1.15}
              color={activeProcedure.ringHex}
            />
            <Suspense fallback={null}>
              {renderCustomModel ? (
                renderCustomModel(activeProcedure, false)
              ) : (
                <RotatingOdontogramPlaceholderMesh
                  procedure={activeProcedure}
                  autoRotate={false}
                  isPlaying={true}
                  jumpRequest={jumpRequest}
                  onTick={handleTick}
                  userYaw={userRotation.yaw}
                  userPitch={userRotation.pitch}
                />
              )}
            </Suspense>
          </Canvas>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-200">
              3D Odontogram Önizlemesi ({activeProcedure.label})
            </p>
            <p className="max-w-xs text-xs text-slate-400">
              {activeProcedure.description}
            </p>
          </div>
        )}

        {/* Alt Bant: 4 Aşamalı İnteraktif Tedavi Zaman Çizelgesi */}
        <div className="absolute right-2.5 bottom-2 left-2.5 z-10 rounded-xl border border-white/10 bg-slate-950/80 p-2 backdrop-blur-md">
          <div className="grid grid-cols-4 gap-1.5">
            {stages.map((st, idx) => {
              const isCurrent = idx === activeStageIndex;
              return (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => handleSelectStage(idx)}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border px-2 py-1.5 text-left transition ${
                    isCurrent
                      ? "border-cyan-400/50 bg-blue-950/70 text-white"
                      : "border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-slate-200"
                  }`}
                >
                  <span className="relative z-10 block truncate text-[10px] font-bold">
                    {st.shortLabel}
                  </span>
                  <div className="relative z-10 mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      ref={(el) => {
                        progressBarRefs.current[idx] = el;
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: idx < activeStageIndex ? "100%" : "0%" }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          {currentStage && (
            <p className="mt-1.5 truncate px-1 text-[10px] text-slate-300">
              {currentStage.detail}
            </p>
          )}
        </div>
      </div>

      {/* Alt Prosedür Seçici ve Bilgi Alanı */}
      <div className="relative z-10 space-y-2 rounded-2xl border border-white/10 bg-slate-900/85 p-3 backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1.5">
          {procedures.map((proc) => {
            const isSelected = proc.id === activeProcedure.id;
            return (
              <button
                key={proc.id}
                type="button"
                onClick={() => {
                  setSelectedId(proc.id);
                  setJumpRequest(null);
                  lastStageRef.current = 0;
                  setActiveStageIndex(0);
                  setUserRotation({ yaw: 0, pitch: 0 });
                }}
                className={`cursor-pointer rounded-xl px-2.5 py-2.5 text-center text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="block truncate">{proc.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
          <span className="truncate">{activeProcedure.description}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-cyan-300">
            <Sparkles className="h-3 w-3" />
            <span>{activeProcedure.clinicalMetricValue}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
