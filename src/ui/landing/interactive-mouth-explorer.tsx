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
import {
  Activity,
  Eye,
  Layers,
  RotateCcw,
  Sparkles,
} from "lucide-react";

/**
 * Sistemdeki FDI Diş Dizilimi (internal/output/pdf/odontogram.go ile birebir aynı)
 */
export const UPPER_ARCH_FDI = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const;

export const LOWER_ARCH_FDI = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const;

export type ToothCondition = "intact" | "filled" | "crown" | "implant" | "root_canal";

export interface ConditionMeta {
  readonly label: string;
  readonly shortLabel: string;
  readonly colorHex: string;
  readonly emissiveHex: string;
  readonly badgeClass: string;
  readonly cellClass: string;
  readonly dotClass: string;
}

export const CONDITION_META: Record<ToothCondition, ConditionMeta> = {
  intact: {
    label: "Sağlam",
    shortLabel: "Sağlam",
    colorHex: "#f8f5ee",
    emissiveHex: "#1e293b",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/35",
    cellClass:
      "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/10",
    dotClass: "bg-emerald-400",
  },
  filled: {
    label: "Kompozit / Fissür",
    shortLabel: "Kompozit",
    colorHex: "#60a5fa",
    emissiveHex: "#1d4ed8",
    badgeClass: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    cellClass:
      "border-blue-400/40 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30",
    dotClass: "bg-blue-400",
  },
  crown: {
    label: "Zirkonyum Kuron",
    shortLabel: "Zirkonyum",
    colorHex: "#38bdf8",
    emissiveHex: "#0284c7",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    cellClass:
      "border-cyan-400/40 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30",
    dotClass: "bg-cyan-400",
  },
  implant: {
    label: "İmplant + Üst Yapı",
    shortLabel: "İmplant",
    colorHex: "#818cf8",
    emissiveHex: "#4f46e5",
    badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
    cellClass:
      "border-indigo-400/40 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30",
    dotClass: "bg-indigo-400",
  },
  root_canal: {
    label: "Kanal Tedavisi",
    shortLabel: "Endodonti",
    colorHex: "#f472b6",
    emissiveHex: "#db2777",
    badgeClass: "bg-pink-500/20 text-pink-300 border-pink-400/40",
    cellClass:
      "border-pink-400/40 bg-pink-500/20 text-pink-200 hover:bg-pink-500/30",
    dotClass: "bg-pink-400",
  },
};

const INITIAL_TEETH_STATE: Record<string, ToothCondition> = {
  "16": "filled",
  "14": "root_canal",
  "11": "crown",
  "21": "crown",
  "26": "filled",
  "36": "implant",
  "46": "root_canal",
};

type ToothCategory = "incisor" | "canine" | "premolar" | "molar";

function getToothCategory(fdi: string): ToothCategory {
  const num = Number(fdi) % 10;
  if (num === 1 || num === 2) return "incisor";
  if (num === 3) return "canine";
  if (num === 4 || num === 5) return "premolar";
  return "molar";
}

function getToothAnatomicalName(fdi: string): string {
  const num = Number(fdi) % 10;
  const quadrant = Math.floor(Number(fdi) / 10);
  const jawLabel =
    quadrant === 1
      ? "Üst Sağ"
      : quadrant === 2
        ? "Üst Sol"
        : quadrant === 3
          ? "Alt Sol"
          : "Alt Sağ";
  switch (num) {
    case 1:
      return `${jawLabel} Santral Kesici (#${fdi})`;
    case 2:
      return `${jawLabel} Lateral Kesici (#${fdi})`;
    case 3:
      return `${jawLabel} Kanin / Köpek Dişi (#${fdi})`;
    case 4:
      return `${jawLabel} 1. Premolar Küçük Azı (#${fdi})`;
    case 5:
      return `${jawLabel} 2. Premolar Küçük Azı (#${fdi})`;
    case 6:
      return `${jawLabel} 1. Molar Büyük Azı (#${fdi})`;
    case 7:
      return `${jawLabel} 2. Molar Büyük Azı (#${fdi})`;
    default:
      return `${jawLabel} 3. Molar / Yirmi Yaş (#${fdi})`;
  }
}

function getProcedureMoves(condition: ToothCondition): {
  title: string;
  moves: readonly string[];
} {
  switch (condition) {
    case "filled":
      return {
        title: "Fissür Örtücü & Kompozit Restorasyon",
        moves: [
          "1. Kavite & Fissür Temizliği",
          "2. Nano-Hibrit Kompozit Uygulaması",
          "3. LED Polimerizasyon & Polisaj",
        ],
      };
    case "root_canal":
      return {
        title: "Endodontik Kök Kanal Tedavisi",
        moves: [
          "1. Pulpa Odası Erişimi",
          "2. Ni-Ti Döner Eğe Şekillendirme",
          "3. Guta-Perka Kanal Obtürasyonu",
        ],
      };
    case "crown":
      return {
        title: "Estetik Zirkonyum Kuron",
        moves: [
          "1. Minimal İnvaziv Preparasyon",
          "2. 3D CAD/CAM Dijital Tasarım",
          "3. Monolitik Zirkonyum Simantasyonu",
        ],
      };
    case "implant":
      return {
        title: "Cerrahi Diş İmplantı & Abutment",
        moves: [
          "1. Alveoler Kemik Yuvası Hazırlığı",
          "2. Grade-4 Titanyum Fikstür Yerleşimi",
          "3. Abutment & Zirkonyum Kuron Yükleme",
        ],
      };
    default:
      return {
        title: "Sağlıklı Mine & Periodonsiyum",
        moves: [
          "1. Doğal Mine Bütünlüğü",
          "2. Sağlıklı Diş Eti Adaptasyonu",
          "3. 6 Aylık Rutin Klinik Kontrol",
        ],
      };
  }
}

/**
 * Doğal anatomik diş kuron geometrileri üretir.
 * - Kesici (Incisor): Düz keski kenar (chisel), düz labial yüzey, silindirik boyun.
 * - Kanin (Canine): Tüberkül tepesi, fasial labial sırt.
 * - Premolar: Çift tüberküllü, düz oklüzal masa.
 * - Molar: 4 tüberküllü, santral çukurlu oklüzal masa.
 * Boyun bölgesi silindirik tutulur, asla sivri elmas şeklinde daraltılmaz.
 * dirSign = +1 (Alt çene: çiğneme yüzeyi +Y), dirSign = -1 (Üst çene: çiğneme yüzeyi -Y)
 */
function createToothCrownGeometry(
  category: ToothCategory,
  dirSign: 1 | -1
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.5, 40, 30);
  const pos = geo.attributes.position;
  if (!pos) return geo;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    const nx = vx / 0.5;
    const nyOcclusal = (vy / 0.5) * dirSign; // -1 (boyun / cervical) .. +1 (oklüzal / incisal)
    const nz = vz / 0.5;

    let x = vx;
    let localY = nyOcclusal * 0.4;
    let z = vz;

    // Boyun bölgesi (nyOcclusal < 0): Asla sivriltilmez, silindirik gövde olarak diş etine oturur
    const neckFactor = nyOcclusal < 0 ? 1.0 - 0.08 * -nyOcclusal : 1.0;

    if (category === "molar") {
      const theta = Math.atan2(nz, nx);
      const squircle = 1.0 + 0.1 * Math.cos(4 * theta);
      x = vx * squircle * neckFactor * 1.12;
      z = vz * squircle * neckFactor * 1.05;

      // Oklüzal çiğneme masası: tepeyi düzleştir ve 4 tüberkül ekle
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
        const buccal =
          0.075 * Math.exp(-(nx * nx * 4.0 + Math.pow(nz - 0.35, 2) * 4.5));
        const lingual =
          0.065 * Math.exp(-(nx * nx * 4.0 + Math.pow(nz + 0.35, 2) * 4.5));
        localY += (buccal + lingual - 0.03 * Math.exp(-nz * nz * 12.0)) * w;
      }
    } else if (category === "canine") {
      // Kanin: Sivri tüberkül ucu ve belirgin fasial sırt
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
      // Kesici Diş (Incisor): Kürek/keski formu. Düz kesici kenar, düz labial yüzey
      const blade =
        nyOcclusal > 0
          ? THREE.MathUtils.lerp(0.78, 0.28, Math.pow(nyOcclusal, 1.1))
          : 0.78;
      // Ön dişler daha geniş ve belirgin
      x = vx * neckFactor * 1.16;
      z = vz * blade * neckFactor;

      // Kesici kenarı düzleştir (düz keski kenar - sivri tepe olmasın)
      if (nyOcclusal > 0.45) {
        localY = 0.45 * 0.4 + (nyOcclusal - 0.45) * 0.12;
      }
      // Hafif labial gelişim olukları
      if (vz > 0 && nyOcclusal > 0) {
        z += 0.014 * Math.cos(nx * Math.PI * 2.5) * (1 - nyOcclusal * 0.45);
      }
    }

    pos.setXYZ(i, x, localY * dirSign, z);
  }

  geo.computeVertexNormals();
  return geo;
}

function createAllArchGeometries() {
  const createRootGeo = (dirSign: 1 | -1) => {
    const geo = new THREE.CylinderGeometry(
      dirSign === 1 ? 0.22 : 0.06,
      dirSign === 1 ? 0.06 : 0.22,
      0.52,
      20,
      10
    );
    geo.translate(0, -dirSign * 0.42, 0);
    return geo;
  };

  return {
    upper: {
      molar: createToothCrownGeometry("molar", -1),
      premolar: createToothCrownGeometry("premolar", -1),
      canine: createToothCrownGeometry("canine", -1),
      incisor: createToothCrownGeometry("incisor", -1),
      root: createRootGeo(-1),
    },
    lower: {
      molar: createToothCrownGeometry("molar", 1),
      premolar: createToothCrownGeometry("premolar", 1),
      canine: createToothCrownGeometry("canine", 1),
      incisor: createToothCrownGeometry("incisor", 1),
      root: createRootGeo(1),
    },
  };
}

/**
 * Anatomik Festooned Diş Eti (Gingiva):
 * - Ön bölgede diş eti yukarı/kök yönüne açılarak ön dişlere tam açıklık tanır
 * - Yan bölgelerde daha derli toplu kret formuyla molarları destekler
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
    // Ön bölgede (t=0) diş eti kök yönüne çekilerek ön dişlerin kuron boyunu açar
    const archY = yCenter + dirSign * 0.045 * (1 - t * t);
    points.push(new THREE.Vector3(x, archY, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  // Doğal, orantılı alveoler kret tüpü (radius 0.21)
  const tubeGeo = new THREE.TubeGeometry(curve, 110, 0.21, 28, false);
  const pos = tubeGeo.attributes.position;

  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);

      const angle = Math.atan2(vx, vz + 0.68);
      const tArch = angle / maxAngle;

      // 16 dişin servikal kavis dalgası ve 15 interdental papilla
      const toothPhase = (tArch + 1) * 7.5;
      const scallopWave = Math.cos(toothPhase * Math.PI * 2);

      const isToothFacing = isUpper ? vy < yCenter : vy > yCenter;
      let dy = 0;
      if (isToothFacing) {
        dy = -dirSign * (scallopWave * 0.024 - 0.01);
      } else {
        dy = dirSign * 0.015 * (1 - Math.abs(tArch));
      }

      // Juga alveolaria (Kök kabartıları)
      const isBuccal = vz > -0.68;
      let dx = 0;
      let dz = 0;
      if (isBuccal) {
        const rootRidge =
          Math.max(0, scallopWave) * 0.018 * (1 - Math.abs(tArch) * 0.4);
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

  // Ön dişler (1, 2, 3) oklüzal düzleme doğru daha açık ve belirgin çıkar
  // Yan ve arka dişler (4..8) derli toplu oturur
  const isAnterior = toothOrder <= 3;
  const y = isUpper
    ? isAnterior
      ? 0.27
      : 0.32
    : isAnterior
      ? -0.27
      : -0.32;

  let scaleX = 0.28;
  let scaleY = 0.35;
  let scaleZ = 0.28;

  if (toothOrder === 1) {
    // Santral Kesici (Central Incisor) - Ön planda, geniş, uzun ve estetik
    scaleX = isUpper ? 0.38 : 0.26;
    scaleY = isUpper ? 0.47 : 0.42;
    scaleZ = isUpper ? 0.28 : 0.24;
  } else if (toothOrder === 2) {
    // Lateral Kesici (Lateral Incisor)
    scaleX = isUpper ? 0.31 : 0.25;
    scaleY = isUpper ? 0.44 : 0.4;
    scaleZ = isUpper ? 0.26 : 0.24;
  } else if (toothOrder === 3) {
    // Kanin / Köpek Dişi (Canine) - Güçlü köşe dişi
    scaleX = 0.33;
    scaleY = 0.45;
    scaleZ = 0.32;
  } else if (toothOrder === 4 || toothOrder === 5) {
    // Premolar (Küçük Azı) - Yanlarda zarif ve orantılı
    scaleX = 0.28;
    scaleY = 0.34;
    scaleZ = 0.29;
  } else {
    // Molar (Büyük Azı) - Geriye doğru küçülen anatomik oran (M1 > M2 > M3)
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

interface MouthArchSceneProps {
  readonly selectedTooth: string;
  readonly hoveredTooth: string | null;
  readonly onSelectTooth: (fdi: string) => void;
  readonly onHoverTooth: (fdi: string | null) => void;
  readonly teethMap: Record<string, ToothCondition>;
  readonly jawOpen: boolean;
  readonly xrayMode: boolean;
  readonly userYaw: number;
  readonly userPitch: number;
}

function MouthArchScene({
  selectedTooth,
  hoveredTooth,
  onSelectTooth,
  onHoverTooth,
  teethMap,
  jawOpen,
  xrayMode,
  userYaw,
  userPitch,
}: MouthArchSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const lowerJawRef = useRef<THREE.Group>(null);

  const dentalGeos = useMemo(() => createAllArchGeometries(), []);
  const upperGingivaGeo = useMemo(() => createRealisticFestoonedGingiva(true), []);
  const lowerGingivaGeo = useMemo(() => createRealisticFestoonedGingiva(false), []);

  const upperTeethPoses = useMemo(
    () => UPPER_ARCH_FDI.map((fdi) => computeArchPose(fdi, true)),
    []
  );

  const lowerTeethPoses = useMemo(
    () => LOWER_ARCH_FDI.map((fdi) => computeArchPose(fdi, false)),
    []
  );

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const clampedDelta = Math.min(0.1, delta);

    rootRef.current.rotation.x = THREE.MathUtils.lerp(
      rootRef.current.rotation.x,
      0.16 + userPitch,
      clampedDelta * 7
    );
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      userYaw,
      clampedDelta * 7
    );

    if (lowerJawRef.current) {
      const targetJawAngle = jawOpen ? 0.3 : 0.03;
      lowerJawRef.current.rotation.x = THREE.MathUtils.lerp(
        lowerJawRef.current.rotation.x,
        targetJawAngle,
        clampedDelta * 6
      );
      lowerJawRef.current.position.y = THREE.MathUtils.lerp(
        lowerJawRef.current.position.y,
        jawOpen ? -0.16 : 0.03,
        clampedDelta * 6
      );
    }
  });

  const renderSingleTooth = (pose: ArchToothPose) => {
    const { fdi, isUpper, category, position, rotationY, scale } = pose;
    const dirSign: 1 | -1 = isUpper ? -1 : 1;
    const cond = teethMap[fdi] ?? "intact";
    const meta = CONDITION_META[cond];
    const isSelected = selectedTooth === fdi;
    const isHovered = hoveredTooth === fdi;

    const jawGeos = isUpper ? dentalGeos.upper : dentalGeos.lower;
    const crownGeometry =
      category === "molar"
        ? jawGeos.molar
        : category === "premolar"
          ? jawGeos.premolar
          : category === "canine"
            ? jawGeos.canine
            : jawGeos.incisor;

    const scaleBoost = isSelected ? 1.15 : isHovered ? 1.07 : 1.0;
    const effectiveScale: [number, number, number] = [
      scale[0] * scaleBoost,
      scale[1] * scaleBoost,
      scale[2] * scaleBoost,
    ];

    const isImplant = cond === "implant";
    const isRootCanal = cond === "root_canal";
    const isFilled = cond === "filled";
    const isCrown = cond === "crown";

    const crownColor = isSelected
      ? "#e0f2fe"
      : isCrown
        ? "#f8fafc"
        : cond === "intact"
          ? "#fcf9f2"
          : isFilled || isRootCanal
            ? "#faf6ed"
            : meta.colorHex;

    const crownEmissive = isSelected
      ? "#0284c7"
      : isHovered
        ? "#0369a1"
        : isCrown
          ? "#0284c7"
          : isImplant
            ? "#4338ca"
            : isRootCanal
              ? "#be185d"
              : isFilled
                ? "#1d4ed8"
                : "#0f172a";

    const crownEmissiveIntensity = isSelected
      ? 0.48
      : isHovered
        ? 0.28
        : cond === "intact"
          ? 0.02
          : 0.22;

    return (
      <group
        key={fdi}
        position={position}
        rotation={[0, rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectTooth(fdi);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverTooth(fdi);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverTooth(null);
        }}
      >
        {/* 1. KÖK VEYA TİTANYUM İMPLANT FİKSTÜRÜ */}
        {isImplant ? (
          <group scale={effectiveScale}>
            <mesh position={[0, -dirSign * 0.42, 0]}>
              <cylinderGeometry
                args={[
                  dirSign === 1 ? 0.22 : 0.14,
                  dirSign === 1 ? 0.14 : 0.22,
                  0.52,
                  20,
                ]}
              />
              <meshStandardMaterial
                color="#818cf8"
                emissive="#4f46e5"
                emissiveIntensity={0.55}
                metalness={0.92}
                roughness={0.16}
              />
            </mesh>
            {[0.26, 0.38, 0.5].map((offset) => (
              <mesh
                key={offset}
                position={[0, -dirSign * offset, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[0.19, 0.028, 10, 24]} />
                <meshStandardMaterial
                  color="#c7d2fe"
                  emissive="#6366f1"
                  emissiveIntensity={0.5}
                  metalness={0.95}
                  roughness={0.14}
                />
              </mesh>
            ))}
            <mesh position={[0, -dirSign * 0.14, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.12, 20]} />
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.88}
                roughness={0.2}
              />
            </mesh>
          </group>
        ) : (
          <mesh
            geometry={jawGeos.root}
            scale={[
              effectiveScale[0] * 0.85,
              effectiveScale[1] * 0.9,
              effectiveScale[2] * 0.85,
            ]}
          >
            <meshPhysicalMaterial
              color={isRootCanal ? "#fbcfe8" : "#e5dccb"}
              roughness={0.34}
              transparent={xrayMode || isRootCanal}
              opacity={xrayMode || isRootCanal ? 0.45 : 0.9}
            />
          </mesh>
        )}

        {/* 2. KANAL TEDAVİSİ İÇ ENDODONTİK PULPA & KÖK KANALI */}
        {isRootCanal && (
          <group scale={effectiveScale}>
            <mesh position={[0, dirSign * 0.06, 0]}>
              <sphereGeometry args={[0.16, 16, 16]} />
              <meshStandardMaterial
                color="#f472b6"
                emissive="#ec4899"
                emissiveIntensity={1.3}
              />
            </mesh>
            <mesh position={[0, -dirSign * 0.28, 0]}>
              <cylinderGeometry args={[0.065, 0.04, 0.62, 14]} />
              <meshStandardMaterial
                color="#f472b6"
                emissive="#db2777"
                emissiveIntensity={1.25}
              />
            </mesh>
          </group>
        )}

        {/* 3. GERÇEKÇİ ANATOMİK DİŞ KURONU (Mine Işığı & Doğal Translüsensi) */}
        <mesh geometry={crownGeometry} scale={effectiveScale}>
          <meshPhysicalMaterial
            color={crownColor}
            emissive={crownEmissive}
            emissiveIntensity={crownEmissiveIntensity}
            roughness={isCrown ? 0.08 : 0.14}
            metalness={isCrown ? 0.04 : 0.01}
            clearcoat={1}
            clearcoatRoughness={0.04}
            transmission={cond === "intact" && !xrayMode ? 0.2 : 0}
            ior={isCrown ? 2.15 : 1.63}
            thickness={0.45}
            attenuationColor="#ffe8d1"
            attenuationDistance={0.8}
            sheen={cond === "intact" ? 0.3 : 0}
            sheenColor="#e0e7ff"
            transparent={isRootCanal || xrayMode}
            opacity={isRootCanal ? 0.58 : xrayMode ? 0.78 : 1}
          />
        </mesh>

        {/* 4. KOMPOZİT DOLGU / FİSSÜR ÖRTÜCÜ DETAYI */}
        {isFilled && (
          <mesh
            position={[0, dirSign * effectiveScale[1] * 0.26, 0]}
            scale={[
              effectiveScale[0] * 0.52,
              effectiveScale[1] * 0.18,
              effectiveScale[2] * 0.48,
            ]}
          >
            <sphereGeometry args={[0.42, 20, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#2563eb"
              emissiveIntensity={0.95}
              roughness={0.12}
            />
          </mesh>
        )}

        {/* 5. ZİRKONYUM KURON SERVİKAL MARJİN HALKASI */}
        {isCrown && (
          <mesh
            position={[0, -dirSign * effectiveScale[1] * 0.28, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[effectiveScale[0], effectiveScale[2], 1]}
          >
            <torusGeometry args={[0.34, 0.032, 12, 28]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.1}
            />
          </mesh>
        )}

        {/* 6. SEÇİLİ VEYA HOVER DİŞ VURGU HALKASI */}
        {(isSelected || isHovered) && (
          <mesh
            position={[0, dirSign * 0.22, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry
              args={[
                isSelected ? 0.18 : 0.15,
                isSelected ? 0.018 : 0.012,
                12,
                32,
              ]}
            />
            <meshStandardMaterial
              color={isSelected ? "#38bdf8" : "#93c5fd"}
              emissive={isSelected ? "#38bdf8" : "#60a5fa"}
              emissiveIntensity={isSelected ? 1.5 : 0.9}
            />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group ref={rootRef} position={[0, 0.02, 0]}>
      {/* ÜST ÇENE (Diş Eti & 16 FDI Diş) */}
      <group name="UpperJaw">
        {/* Anatomik Diş Eti (Sağlıklı Mercan Pembe) */}
        <mesh geometry={upperGingivaGeo}>
          <meshPhysicalMaterial
            color="#c46670"
            emissive="#450a0a"
            emissiveIntensity={0.08}
            roughness={0.42}
            metalness={0.02}
            clearcoat={0.52}
            clearcoatRoughness={0.16}
            transparent
            opacity={xrayMode ? 0.2 : 0.96}
            depthWrite={!xrayMode}
          />
        </mesh>

        {upperTeethPoses.map(renderSingleTooth)}
      </group>

      {/* ALT ÇENE (Çene Hareketi ile Dinamik Açılır) */}
      <group ref={lowerJawRef} name="jaw_hinge_pivot">
        {/* Anatomik Alt Diş Eti */}
        <mesh geometry={lowerGingivaGeo}>
          <meshPhysicalMaterial
            color="#ba5d67"
            emissive="#450a0a"
            emissiveIntensity={0.08}
            roughness={0.44}
            metalness={0.02}
            clearcoat={0.52}
            clearcoatRoughness={0.16}
            transparent
            opacity={xrayMode ? 0.2 : 0.96}
            depthWrite={!xrayMode}
          />
        </mesh>

        {lowerTeethPoses.map(renderSingleTooth)}
      </group>
    </group>
  );
}

const emptySubscribe = () => () => {};

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

export function InteractiveMouthExplorer() {
  const [selectedTooth, setSelectedTooth] = useState<string>("16");
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);
  const [teethMap, setTeethMap] =
    useState<Record<string, ToothCondition>>(INITIAL_TEETH_STATE);
  const [jawOpen, setJawOpen] = useState<boolean>(true);
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [userRotation, setUserRotation] = useState<{ yaw: number; pitch: number }>({
    yaw: 0,
    pitch: 0,
  });

  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
  }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const webglReady = useSyncExternalStore(
    emptySubscribe,
    detectWebGLSupport,
    () => false
  );

  const inspectedTooth = hoveredTooth ?? selectedTooth;
  const activeCondition: ToothCondition = teethMap[selectedTooth] ?? "intact";
  const procedureInfo = getProcedureMoves(activeCondition);

  const treatedCount = useMemo(
    () =>
      Object.values(teethMap).filter((c) => c && c !== "intact").length,
    [teethMap]
  );

  const handleConditionChange = (nextCond: ToothCondition) => {
    setTeethMap((prev) => ({
      ...prev,
      [selectedTooth]: nextCond,
    }));
  };

  const handleResetAllHealthy = () => {
    setTeethMap({});
    setUserRotation({ yaw: 0, pitch: 0 });
    setXrayMode(false);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      lastX: e.clientX,
      lastY: e.clientY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    setUserRotation((prev) => ({
      yaw: prev.yaw + dx * 0.009,
      pitch: Math.max(-0.55, Math.min(0.55, prev.pitch + dy * 0.007)),
    }));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const renderFdiRow = (
    archList: readonly string[],
    leftLabel: string,
    rightLabel: string
  ) => {
    const rightHalf = archList.slice(0, 8);
    const leftHalf = archList.slice(8, 16);

    const renderCell = (fdi: string) => {
      const cond = teethMap[fdi] ?? "intact";
      const meta = CONDITION_META[cond];
      const isSelected = selectedTooth === fdi;
      const isHovered = hoveredTooth === fdi;

      return (
        <button
          key={fdi}
          type="button"
          onClick={() => setSelectedTooth(fdi)}
          onMouseEnter={() => setHoveredTooth(fdi)}
          onMouseLeave={() => setHoveredTooth(null)}
          title={`${getToothAnatomicalName(fdi)} — ${meta.label}`}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border py-1.5 font-mono text-[10px] font-bold transition-all ${
            isSelected
              ? "border-cyan-300 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-cyan-300/60"
              : isHovered
                ? "border-cyan-400/50 bg-white/15 text-white"
                : meta.cellClass
          }`}
        >
          <span
            className={`mb-1 h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125 ${
              isSelected ? "bg-white" : meta.dotClass
            }`}
          />
          <span>{fdi}</span>
        </button>
      );
    };

    return (
      <div>
        <div className="mb-1 flex items-center justify-between px-0.5 text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
          <span>{leftLabel}</span>
          <span>Orta Hat</span>
          <span>{rightLabel}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
          <div className="grid grid-cols-8 gap-1">{rightHalf.map(renderCell)}</div>
          <div className="h-7 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent" />
          <div className="grid grid-cols-8 gap-1">{leftHalf.map(renderCell)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[2.25rem] border border-slate-800/90 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-5 text-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.65)] ring-1 ring-white/10">
      {/* Medikal Arka Plan Işıması */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
      />

      {/* 1. Üst Kontrol Çubuğu (Sadece Çene Açık/Kapalı, X-Ray ve Tümünü Sıfırla) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-extrabold tracking-wider text-white uppercase">
                3D Ağız & 32 Diş FDI Modeli
              </p>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                {treatedCount} Planlı Diş
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-300">
              {getToothAnatomicalName(inspectedTooth)}
            </p>
          </div>
        </div>

        {/* Üst Sağ Kontroller: Çene Açık/Kapalı, X-Ray ve Sıfırla */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setJawOpen((prev) => !prev)}
            className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              jawOpen
                ? "border-cyan-400/35 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {jawOpen ? "Çene: Açık" : "Çene: Kapalı"}
          </button>

          <button
            type="button"
            onClick={() => setXrayMode((prev) => !prev)}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
              xrayMode
                ? "border-indigo-400/45 bg-indigo-500/20 text-indigo-200"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
            title="Diş eti saydamlığını açarak kökleri ve implantları inceleyin"
          >
            <Layers className="h-3 w-3 text-indigo-300" />
            <span>X-Ray</span>
          </button>

          <button
            type="button"
            onClick={handleResetAllHealthy}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/15 hover:text-emerald-200"
            title="Tüm dişleri sağlıklı (sağlam) duruma sıfırla"
          >
            <RotateCcw className="h-3 w-3 text-emerald-400" />
            <span>Sıfırla</span>
          </button>
        </div>
      </div>

      {/* 2. 3D Anatomik Ağız ve Çene Sahnesi (Üst köşe etiketleri kaldırıldı) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative my-3 h-[290px] w-full cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.28)_0%,rgba(2,6,23,0.92)_75%)] active:cursor-grabbing"
      >
        {webglReady ? (
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.22, 3.6], fov: 38 }}
            className="h-full w-full"
          >
            <ambientLight intensity={0.9} />
            <directionalLight
              position={[4, 5.5, 4.5]}
              intensity={2.1}
              color="#fffcf5"
            />
            <directionalLight
              position={[-4, 2.5, 3.5]}
              intensity={1.1}
              color="#e0f2fe"
            />
            <pointLight
              position={[0, 0.3, 3.2]}
              intensity={1.3}
              color="#f8fafc"
            />
            <pointLight
              position={[0, -2.4, 2.8]}
              intensity={0.8}
              color="#38bdf8"
            />
            <Suspense fallback={null}>
              <MouthArchScene
                selectedTooth={selectedTooth}
                hoveredTooth={hoveredTooth}
                onSelectTooth={setSelectedTooth}
                onHoverTooth={setHoveredTooth}
                teethMap={teethMap}
                jawOpen={jawOpen}
                xrayMode={xrayMode}
                userYaw={userRotation.yaw}
                userPitch={userRotation.pitch}
              />
            </Suspense>
          </Canvas>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            3D Ağız Modeli Yükleniyor...
          </div>
        )}
      </div>

      {/* 3. İnteraktif FDI Odontogram Şeması (Q1/Q2 Üst Çene & Q4/Q3 Alt Çene) */}
      <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-900/85 p-3.5 backdrop-blur-md">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200">
              İnteraktif FDI Odontogram Şeması
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(Object.keys(CONDITION_META) as ToothCondition[]).map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-[10px] text-slate-300"
              >
                <span
                  className={`h-2 w-2 rounded-full ${CONDITION_META[key].dotClass}`}
                />
                <span>{CONDITION_META[key].shortLabel}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {renderFdiRow(UPPER_ARCH_FDI, "Üst Sağ (Q1)", "Üst Sol (Q2)")}
          {renderFdiRow(LOWER_ARCH_FDI, "Alt Sağ (Q4)", "Alt Sol (Q3)")}
        </div>
      </div>

      {/* 4. Seçili Dişin Tedavi Durumu ve Kısa Adımlar */}
      <div className="relative z-10 mt-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-extrabold text-white">
              Diş #{selectedTooth}: {procedureInfo.title}
            </span>
          </div>

          {/* Seçili Dişe Tedavi Ata / Değiştir */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(CONDITION_META) as ToothCondition[]).map((condKey) => {
              const active = activeCondition === condKey;
              const meta = CONDITION_META[condKey];
              return (
                <button
                  key={condKey}
                  type="button"
                  onClick={() => handleConditionChange(condKey)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition ${
                    active
                      ? meta.badgeClass
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kısa, Sade 3 Adımlı Klinik Özeti */}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {procedureInfo.moves.map((m) => (
            <div
              key={m}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-slate-200"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
