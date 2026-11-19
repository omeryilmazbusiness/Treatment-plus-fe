import * as THREE from "three";
import gsap from "gsap";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { AnimationActionType, AnimationTimelineStage } from "./types";

export const UPPER_FDI_ORDER = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const;

export const LOWER_FDI_ORDER = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const;

const EASE = "power2.inOut";
export const DEFAULT_OPEN_ANGLE = 0.16;

export type ToothCategory = "incisor" | "canine" | "premolar" | "molar";

export interface ToothIslandMeta {
  fdi: string;
  slot: number;
  upper: boolean;
  right: boolean;
  distal: number;
  category: ToothCategory;
  /** Center of full tooth+root in mesh-local coordinates */
  localCenter: THREE.Vector3;
  /** Center of visible clinical crown in mesh-local coordinates */
  localCrownCenter: THREE.Vector3;
  /** Occlusal tip in mesh-local coordinates */
  localOcclusal: THREE.Vector3;
  /** Cervical gumline socket opening in mesh-local coordinates */
  localCervical: THREE.Vector3;
  /** Deep root apex center inside alveolar bone in mesh-local coordinates */
  localApex: THREE.Vector3;
  /** Unit vector from localCervical -> localApex along natural root canal axis */
  localRootAxis: THREE.Vector3;
  /** Unit vector from localCervical -> localCrownCenter along clinical crown axis */
  localCrownAxis: THREE.Vector3;
  /** Safe root socket length from localCervical to localApex in mesh-local units */
  localRootLength: number;
  /** Tooth height (root apex to occlusal tip) in mesh-local coordinates */
  localHeight: number;
  /** Radius in mesh-local coordinates */
  localRadius: number;
  /** Radius in world meters (~0.0045 - 0.0080) */
  worldRadius: number;
  /** Exact anatomical full tooth geometry (crown + root) centered at localCenter */
  fullToothGeo?: THREE.BufferGeometry;
  /** Exact anatomical clinical crown geometry (root trimmed at gumline) centered at localCenter */
  crownOnlyGeo?: THREE.BufferGeometry;
  /** Exact ultra-thin labial porcelain veneer shell geometry centered at localCenter */
  veneerOnlyGeo?: THREE.BufferGeometry;
  /** Original un-shadered PBR tooth material from mouth.glb so new teeth match existing teeth color & texture 1:1 */
  baseToothMaterial?: THREE.MeshStandardMaterial;
}

export interface ArchShaderUniforms {
  uPulse: { value: number };
  uScan: { value: number };
  uSection: { value: number };
  uClean: { value: number };
  uFocus: { value: THREE.Vector3 };
  uRadius: { value: number };
  uPlaneN: { value: THREE.Vector3 };
  uPlaneC: { value: number };
  /** Primary target FDI center in World Space */
  uFdiCenter: { value: THREE.Vector3 };
  /** Primary target FDI radius in World Space */
  uFdiRadius: { value: number };
  /** 0..1 active extraction mask for uFdiCenter */
  uExtractMask: { value: number };
  /** 0..1 active crown/veneer preparation shrink for uFdiCenter */
  uPrepShrink: { value: number };
  /** 0..1 active caries/tartar lesion spot for uFdiCenter */
  uCariesSpot: { value: number };
  /** Active scan/highlight tint */
  uScanColor: { value: THREE.Color };
  /** Per-slot mesh-local (cx, cy, cz, localRadius) for all 16 teeth in the arch */
  uToothSphere: { value: THREE.Vector4[] };
  /** Per-slot state (extractMask, prepShrink, cariesSpot, scanGlow) for all 16 teeth */
  uToothState: { value: THREE.Vector4[] };
}

export interface ArchBinding {
  upper: boolean;
  teethMesh: THREE.Mesh;
  salivaMesh: THREE.Mesh | null;
  gumsMesh: THREE.Mesh | null;
  uniforms: ArchShaderUniforms;
  islands: Map<string, ToothIslandMeta>;
  anchorGroup: THREE.Group;
}

export interface MouthCinematicController {
  root: THREE.Object3D;
  upperArch: ArchBinding | null;
  lowerArch: ArchBinding | null;
  jawHinge: THREE.Object3D | null;
  activeTimeline: gsap.core.Timeline | null;
}

export interface MouthSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  root: THREE.Object3D;
  pivotHinge: THREE.Object3D | null;
  defaultCamPos: THREE.Vector3;
  defaultCamTarget: THREE.Vector3;
  controller: MouthCinematicController;
}

export function getToothCategory(fdi: string): ToothCategory {
  const num = Math.abs(Number(fdi)) % 10;
  if (num === 1 || num === 2) return "incisor";
  if (num === 3) return "canine";
  if (num === 4 || num === 5) return "premolar";
  return "molar";
}

export function fdiMeta(fdi: string) {
  const n = Number(fdi) || 16;
  const order = Math.max(1, Math.min(8, n % 10));
  return {
    n,
    upper: n < 30,
    right: (n >= 11 && n <= 18) || (n >= 41 && n <= 48),
    distal: Math.max(0, Math.min(1, (order - 1) / 7)),
    category: getToothCategory(fdi),
  };
}

/**
 * Procedural anatomical tooth crown geometry (shared with interactive-mouth-explorer)
 * dirSign = +1 (Lower jaw: occlusal surface +Y), dirSign = -1 (Upper jaw: occlusal surface -Y)
 */
export function createToothCrownGeometry(
  category: ToothCategory,
  dirSign: 1 | -1
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.5, 32, 24);
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
        const buccal =
          0.075 * Math.exp(-(nx * nx * 4.0 + Math.pow(nz - 0.35, 2) * 4.5));
        const lingual =
          0.065 * Math.exp(-(nx * nx * 4.0 + Math.pow(nz + 0.35, 2) * 4.5));
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
 * Snapshots original materials & transforms so full resets remain clean.
 */
export function snapshotMats(obj: THREE.Object3D) {
  obj.traverse((n) => {
    const mesh = n as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material.map((m) => m.clone())
      : mesh.material.clone();
    mesh.material = mats;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.userData.base = list.map((m) => {
      const std = m as THREE.MeshPhysicalMaterial;
      return {
        color: std.color?.clone(),
        emissive: std.emissive?.clone(),
        roughness: std.roughness,
        metalness: std.metalness,
        opacity: std.opacity,
        transparent: std.transparent,
        emissiveIntensity: std.emissiveIntensity,
      };
    });
    mesh.userData.basePos = mesh.position.clone();
    mesh.userData.baseScale = mesh.scale.clone();
    mesh.userData.baseQuat = mesh.quaternion.clone();
    mesh.userData.baseVisible = mesh.visible;
    mesh.userData.baseMat = mesh.material;
  });
}

/**
 * Restores base material colors/opacities and resets all arch shader uniforms.
 */
export function restoreMats(controller: MouthCinematicController | null) {
  if (!controller) return;
  const { root, upperArch, lowerArch } = controller;

  root.traverse((n) => {
    const mesh = n as THREE.Mesh;
    if (!mesh.isMesh || !mesh.userData.base) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    list.forEach((m, i) => {
      const b = mesh.userData.base[i];
      const std = m as THREE.MeshPhysicalMaterial;
      if (!b || !std) return;
      if (b.color && std.color) std.color.copy(b.color);
      if (b.emissive && std.emissive) std.emissive.copy(b.emissive);
      if (std.roughness != null && b.roughness != null) std.roughness = b.roughness;
      if (std.metalness != null && b.metalness != null) std.metalness = b.metalness;
      std.opacity = b.opacity;
      std.transparent = b.transparent;
      if (std.emissiveIntensity != null) {
        std.emissiveIntensity = b.emissiveIntensity ?? 0;
      }
    });
    mesh.visible = mesh.userData.baseVisible !== false;
  });

  [upperArch, lowerArch].forEach((arch) => {
    if (!arch) return;
    resetArchUniforms(arch.uniforms);
    clearGroupChildren(arch.anchorGroup);
  });
}

export function resetArchUniforms(u: ArchShaderUniforms) {
  u.uPulse.value = 0;
  u.uScan.value = 0;
  u.uSection.value = 0;
  u.uClean.value = 0;
  u.uExtractMask.value = 0;
  u.uPrepShrink.value = 0;
  u.uCariesSpot.value = 0;
  u.uScanColor.value.setHex(0x14b8a6);
  for (let i = 0; i < 16; i++) {
    u.uToothState.value[i]?.set(0, 0, 0, 0);
  }
}

export function disposeObject3D(obj: THREE.Object3D) {
  obj.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => m?.dispose());
    }
  });
}

export function clearGroupChildren(group: THREE.Group, prefix?: string) {
  const toRemove: THREE.Object3D[] = [];
  for (const child of group.children) {
    if (!prefix || child.name.startsWith(prefix)) {
      toRemove.push(child);
    }
  }
  for (const child of toRemove) {
    group.remove(child);
    disposeObject3D(child);
  }
}

export function clearSceneProps(scene: THREE.Scene, prefix = "prop_tool_") {
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((o) => {
    if (o.name && o.name.startsWith(prefix)) {
      toRemove.push(o);
    }
  });
  for (const o of toRemove) {
    o.parent?.remove(o);
    disposeObject3D(o);
  }
}

function createArchUniforms(): ArchShaderUniforms {
  return {
    uPulse: { value: 0 },
    uScan: { value: 0 },
    uSection: { value: 0 },
    uClean: { value: 0 },
    uFocus: { value: new THREE.Vector3() },
    uRadius: { value: 0.0065 },
    uPlaneN: { value: new THREE.Vector3(1, 0, 0) },
    uPlaneC: { value: 0 },
    uFdiCenter: { value: new THREE.Vector3() },
    uFdiRadius: { value: 0.0065 },
    uExtractMask: { value: 0 },
    uPrepShrink: { value: 0 },
    uCariesSpot: { value: 0 },
    uScanColor: { value: new THREE.Color(0x14b8a6) },
    uToothSphere: {
      value: Array.from({ length: 16 }, () => new THREE.Vector4(0, 0, 0, 0.55)),
    },
    uToothState: {
      value: Array.from({ length: 16 }, () => new THREE.Vector4(0, 0, 0, 0)),
    },
  };
}

/**
 * Discovers the 16 connected tooth islands inside TeethUpper_midres / TeethLower_midres,
 * assigns `aToothSlot` (0..15) vertex attributes to both the teeth mesh and the saliva mesh,
 * and populates exact local centroids & radii for zero-drift volumetric masking.
 */
function buildArchBinding(
  teethMesh: THREE.Mesh,
  salivaMesh: THREE.Mesh | null,
  gumsMesh: THREE.Mesh | null,
  upper: boolean
): ArchBinding {
  const geo = teethMesh.geometry;
  const posAttr = geo.attributes.position;
  const uvAttr = geo.attributes.uv;
  const colorAttr = geo.attributes.color;
  const indexAttr = geo.index;
  const fdiOrder = upper ? UPPER_FDI_ORDER : LOWER_FDI_ORDER;
  const uniforms = createArchUniforms();
  const islands = new Map<string, ToothIslandMeta>();

  const rawMeshMat = Array.isArray(teethMesh.material)
    ? teethMesh.material[0]
    : teethMesh.material;
  const baseToothMaterial = rawMeshMat
    ? (rawMeshMat.clone() as THREE.MeshStandardMaterial)
    : undefined;

  if (posAttr && indexAttr) {
    const vCount = posAttr.count;
    const parent = new Int32Array(vCount);
    for (let i = 0; i < vCount; i++) parent[i] = i;

    const find = (a: number): number => {
      let root = a;
      while (parent[root] !== root) root = parent[root]!;
      let curr = a;
      while (curr !== root) {
        const nxt = parent[curr]!;
        parent[curr] = root;
        curr = nxt;
      }
      return root;
    };

    const idxCount = indexAttr.count;
    for (let i = 0; i < idxCount; i += 3) {
      const a = find(indexAttr.getX(i));
      const b = find(indexAttr.getX(i + 1));
      const c = find(indexAttr.getX(i + 2));
      parent[b] = a;
      parent[c] = a;
    }

    const groups = new Map<number, number[]>();
    for (let i = 0; i < vCount; i++) {
      const r = find(i);
      let list = groups.get(r);
      if (!list) {
        list = [];
        groups.set(r, list);
      }
      list.push(i);
    }

    // Sort connected components by vertex size (top 16) then by local X (-X right to +X left)
    const sortedIslands = Array.from(groups.values())
      .sort((a, b) => b.length - a.length)
      .slice(0, 16)
      .map((verts) => {
        let sx = 0;
        let sy = 0;
        let sz = 0;
        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        for (const vi of verts) {
          const x = posAttr.getX(vi);
          const y = posAttr.getY(vi);
          const z = posAttr.getZ(vi);
          sx += x;
          sy += y;
          sz += z;
          if (x < min.x) min.x = x;
          if (y < min.y) min.y = y;
          if (z < min.z) min.z = z;
          if (x > max.x) max.x = x;
          if (y > max.y) max.y = y;
          if (z > max.z) max.z = z;
        }
        const n = verts.length || 1;
        const center = new THREE.Vector3(sx / n, sy / n, sz / n);
        const size = max.clone().sub(min);
        return { verts, center, min, max, size };
      })
      .sort((a, b) => a.center.x - b.center.x);

    const normAttr = geo.attributes.normal;
    const slotAttr = new Float32Array(vCount);
    sortedIslands.forEach((isl, slotIdx) => {
      for (const vi of isl.verts) {
        slotAttr[vi] = slotIdx;
      }
    });

    // Partition triangle indices by tooth slot so we can extract exact sculpted 1:1 geometries per tooth
    const slotTris: number[][] = Array.from({ length: 16 }, () => []);
    for (let i = 0; i < idxCount; i += 3) {
      const ia = indexAttr.getX(i);
      const ib = indexAttr.getX(i + 1);
      const ic = indexAttr.getX(i + 2);
      const s = slotAttr[ia] ?? 0;
      slotTris[s]?.push(ia, ib, ic);
    }

    sortedIslands.forEach((isl, slotIdx) => {
      const fdi = fdiOrder[slotIdx] || "16";
      const meta = fdiMeta(fdi);
      const spanZ = Math.max(0.1, isl.size.z);

      // Normalized depth t from occlusal edge (0.0 = occlusal tip, 1.0 = root apex inside gum)
      // In mouth.glb local space:
      // - Upper arch: isl.max.z is occlusal tip, isl.min.z is root apex at top of upper gum
      // - Lower arch: isl.min.z is occlusal tip, isl.max.z is root apex at bottom of lower gum
      const depthT = (z: number) =>
        upper ? (isl.max.z - z) / spanZ : (z - isl.min.z) / spanZ;

      const avgZone = (tMin: number, tMax: number, fallbackT: number): THREE.Vector3 => {
        let sx = 0;
        let sy = 0;
        let sz = 0;
        let c = 0;
        for (const vi of isl.verts) {
          const vz = posAttr.getZ(vi);
          const t = depthT(vz);
          if (t >= tMin && t <= tMax) {
            sx += posAttr.getX(vi);
            sy += posAttr.getY(vi);
            sz += vz;
            c++;
          }
        }
        if (c > 0) {
          return new THREE.Vector3(sx / c, sy / c, sz / c);
        }
        const fz = upper
          ? isl.max.z - spanZ * fallbackT
          : isl.min.z + spanZ * fallbackT;
        return new THREE.Vector3(isl.center.x, isl.center.y, fz);
      };

      const localOcclusal = avgZone(0.0, 0.18, 0.08);
      const localCrownCenter = avgZone(0.0, 0.42, 0.22);
      const localCervical = avgZone(0.45, 0.56, 0.50);
      const localApex = avgZone(0.68, 0.88, 0.78);

      const localRootAxis = localApex.clone().sub(localCervical);
      const localRootLength = Math.max(0.35, localRootAxis.length());
      if (localRootAxis.lengthSq() > 1e-6) {
        localRootAxis.normalize();
      } else {
        localRootAxis.set(0, 0, upper ? -1 : 1);
      }

      const localCrownAxis = localCrownCenter.clone().sub(localCervical);
      if (localCrownAxis.lengthSq() > 1e-6) {
        localCrownAxis.normalize();
      } else {
        localCrownAxis.copy(localRootAxis).negate();
      }

      // Extract exact 1:1 sculpted fullToothGeo, crownOnlyGeo, and veneerOnlyGeo (centered at isl.center)
      // Note: On mouth.glb incisors/canines/premolars, the labial gingival scallop margin sits at depthT ≈ 0.50..0.55.
      // Preserving the tooth neck up to depthT = 0.56 ensures the zirconia crown tucks completely into the
      // pink gum socket collar with zero gap between the tooth and gingiva!
      const vertMap = new Map<number, number>();
      const nVerts = isl.verts.length;
      const fullPos = new Float32Array(nVerts * 3);
      const crownPos = new Float32Array(nVerts * 3);
      const veneerPos = new Float32Array(nVerts * 3);
      const localUVs = uvAttr ? new Float32Array(nVerts * 2) : null;
      const colItemSize = colorAttr ? colorAttr.itemSize : 3;
      const localColors = colorAttr ? new Float32Array(nVerts * colItemSize) : null;
      const cervicalCapZ = upper
        ? isl.max.z - spanZ * 0.56
        : isl.min.z + spanZ * 0.56;
      const veneerCapZ = upper
        ? isl.max.z - spanZ * 0.52
        : isl.min.z + spanZ * 0.52;

      // Outward labial/buccal direction in arch-local XY plane (away from palatal center (0, 5.2))
      const outDir2D = new THREE.Vector2(isl.center.x, isl.center.y - 5.2);
      if (outDir2D.lengthSq() > 1e-6) {
        outDir2D.normalize();
      } else {
        outDir2D.set(0, 1);
      }

      isl.verts.forEach((vi, localIdx) => {
        vertMap.set(vi, localIdx);
        const vx = posAttr.getX(vi);
        const vy = posAttr.getY(vi);
        const vz = posAttr.getZ(vi);
        const nx = normAttr ? normAttr.getX(vi) : 0;
        const ny = normAttr ? normAttr.getY(vi) : 0;
        const nz = normAttr ? normAttr.getZ(vi) : 0;

        if (localUVs && uvAttr) {
          localUVs[localIdx * 2] = uvAttr.getX(vi);
          localUVs[localIdx * 2 + 1] = uvAttr.getY(vi);
        }
        if (localColors && colorAttr) {
          localColors[localIdx * colItemSize] = colorAttr.getX(vi);
          localColors[localIdx * colItemSize + 1] = colorAttr.getY(vi);
          localColors[localIdx * colItemSize + 2] = colorAttr.getZ(vi);
          if (colItemSize === 4) {
            localColors[localIdx * 4 + 3] = colorAttr.getW(vi);
          }
        }

        fullPos[localIdx * 3] = vx - isl.center.x;
        fullPos[localIdx * 3 + 1] = vy - isl.center.y;
        fullPos[localIdx * 3 + 2] = vz - isl.center.z;

        const t = depthT(vz);
        if (t <= 0.56) {
          // Clinical crown + subgingival cervical collar: preserve exact sculpted mouth.glb geometry + subtle 0.16mm thickness
          const swell = 0.016 * (1.0 - THREE.MathUtils.smoothstep(t, 0.42, 0.56));
          crownPos[localIdx * 3] = vx + nx * swell - isl.center.x;
          crownPos[localIdx * 3 + 1] = vy + ny * swell - isl.center.y;
          crownPos[localIdx * 3 + 2] = vz + nz * swell - isl.center.z;
        } else {
          // Deep root vertices (> 0.56): smoothly close at the subgingival socket base
          const rootFactor = THREE.MathUtils.clamp((t - 0.56) / 0.44, 0, 1);
          const cx = THREE.MathUtils.lerp(vx, localCervical.x, rootFactor * 0.9);
          const cy = THREE.MathUtils.lerp(vy, localCervical.y, rootFactor * 0.9);
          crownPos[localIdx * 3] = cx - isl.center.x;
          crownPos[localIdx * 3 + 1] = cy - isl.center.y;
          crownPos[localIdx * 3 + 2] = cervicalCapZ - isl.center.z;
        }

        // Ultra-thin labial porcelain veneer shell (front/labial face of the clinical crown)
        const relX = vx - isl.center.x;
        const relY = vy - isl.center.y;
        const labialProj = relX * outDir2D.x + relY * outDir2D.y;
        if (t <= 0.52 && labialProj >= -0.02) {
          const vSwell = 0.024 * (1.0 - THREE.MathUtils.smoothstep(t, 0.4, 0.52));
          veneerPos[localIdx * 3] = relX + nx * vSwell;
          veneerPos[localIdx * 3 + 1] = relY + ny * vSwell;
          veneerPos[localIdx * 3 + 2] = vz + nz * vSwell - isl.center.z;
        } else {
          // Tuck palatal/root vertices flush against the inner labial enamel surface
          const clampedZ = upper
            ? Math.max(vz, veneerCapZ)
            : Math.min(vz, veneerCapZ);
          const targetProj = Math.max(labialProj, 0.04);
          const deltaProj = targetProj - labialProj;
          veneerPos[localIdx * 3] = relX + outDir2D.x * deltaProj;
          veneerPos[localIdx * 3 + 1] = relY + outDir2D.y * deltaProj;
          veneerPos[localIdx * 3 + 2] = clampedZ - isl.center.z;
        }
      });

      const rawTris = slotTris[slotIdx] || [];
      const localIndices = new Uint16Array(rawTris.length);
      for (let i = 0; i < rawTris.length; i++) {
        localIndices[i] = vertMap.get(rawTris[i]!) ?? 0;
      }

      const fullToothGeo = new THREE.BufferGeometry();
      fullToothGeo.setAttribute("position", new THREE.BufferAttribute(fullPos, 3));
      if (localUVs) {
        fullToothGeo.setAttribute("uv", new THREE.BufferAttribute(localUVs, 2));
      }
      if (localColors) {
        fullToothGeo.setAttribute(
          "color",
          new THREE.BufferAttribute(localColors, colItemSize)
        );
      }
      fullToothGeo.setIndex(new THREE.BufferAttribute(localIndices, 1));
      fullToothGeo.computeVertexNormals();

      const crownOnlyGeo = new THREE.BufferGeometry();
      crownOnlyGeo.setAttribute("position", new THREE.BufferAttribute(crownPos, 3));
      if (localUVs) {
        crownOnlyGeo.setAttribute("uv", new THREE.BufferAttribute(localUVs.slice(), 2));
      }
      if (localColors) {
        crownOnlyGeo.setAttribute(
          "color",
          new THREE.BufferAttribute(localColors.slice(), colItemSize)
        );
      }
      crownOnlyGeo.setIndex(new THREE.BufferAttribute(localIndices.slice(), 1));
      crownOnlyGeo.computeVertexNormals();

      const veneerOnlyGeo = new THREE.BufferGeometry();
      veneerOnlyGeo.setAttribute("position", new THREE.BufferAttribute(veneerPos, 3));
      if (localUVs) {
        veneerOnlyGeo.setAttribute("uv", new THREE.BufferAttribute(localUVs.slice(), 2));
      }
      if (localColors) {
        veneerOnlyGeo.setAttribute(
          "color",
          new THREE.BufferAttribute(localColors.slice(), colItemSize)
        );
      }
      veneerOnlyGeo.setIndex(new THREE.BufferAttribute(localIndices.slice(), 1));
      veneerOnlyGeo.computeVertexNormals();

      const localRadius = Math.max(isl.size.x, isl.size.y) * 0.54;
      const worldRadius = THREE.MathUtils.clamp(localRadius * 0.01, 0.0042, 0.0082);

      uniforms.uToothSphere.value[slotIdx]?.set(
        localCrownCenter.x,
        localCrownCenter.y,
        localCrownCenter.z,
        localRadius
      );

      islands.set(fdi, {
        fdi,
        slot: slotIdx,
        upper: meta.upper,
        right: meta.right,
        distal: meta.distal,
        category: meta.category,
        localCenter: isl.center,
        localCrownCenter,
        localOcclusal,
        localCervical,
        localApex,
        localRootAxis,
        localCrownAxis,
        localRootLength,
        localHeight: spanZ,
        localRadius,
        worldRadius,
        fullToothGeo,
        crownOnlyGeo,
        veneerOnlyGeo,
        baseToothMaterial,
      });
    });

    geo.setAttribute("aToothSlot", new THREE.BufferAttribute(slotAttr, 1));

    // Also map Saliva mesh vertices to their nearest tooth island so saliva discards/shrinks in lockstep!
    if (salivaMesh && salivaMesh.geometry?.attributes?.position) {
      const sPos = salivaMesh.geometry.attributes.position;
      const sCount = sPos.count;
      const sSlot = new Float32Array(sCount);
      for (let i = 0; i < sCount; i++) {
        const vx = sPos.getX(i);
        const vy = sPos.getY(i);
        const vz = sPos.getZ(i);
        let bestSlot = 0;
        let bestDist = Infinity;
        sortedIslands.forEach((isl, idx) => {
          const dx = vx - isl.center.x;
          const dy = vy - isl.center.y;
          const dz = (vz - isl.center.z) * 0.5;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < bestDist) {
            bestDist = d2;
            bestSlot = idx;
          }
        });
        sSlot[i] = bestSlot;
      }
      salivaMesh.geometry.setAttribute(
        "aToothSlot",
        new THREE.BufferAttribute(sSlot, 1)
      );
    }
  }

  attachDirectorMat(teethMesh, uniforms, upper ? "arch-upper-teeth" : "arch-lower-teeth", false);
  if (salivaMesh) {
    attachDirectorMat(salivaMesh, uniforms, upper ? "arch-upper-saliva" : "arch-lower-saliva", true);
  }

  const anchorGroup = new THREE.Group();
  anchorGroup.name = upper ? "arch_anchor_upper" : "arch_anchor_lower";
  teethMesh.add(anchorGroup);

  return {
    upper,
    teethMesh,
    salivaMesh,
    gumsMesh,
    uniforms,
    islands,
    anchorGroup,
  };
}

/**
 * Upgraded `onBeforeCompile` GLSL Shader (`attachDirectorMat`):
 * Supports both per-slot island state (`uToothSphere[16]`, `uToothState[16]`)
 * AND world-space volumetric uniforms (`uFdiCenter`, `uFdiRadius`, `uExtractMask`, `uPrepShrink`, `uCariesSpot`, `uSection`, `uScan`, `uPulse`, `uClean`).
 * Applies to both Teeth*_midres and Saliva*_midres so extracted/prepped teeth leave zero ghost saliva shell.
 */
export function attachDirectorMat(
  mesh: THREE.Mesh,
  uniforms: ArchShaderUniforms,
  cacheKey: string,
  isSaliva = false
) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const upgraded = mats.map((srcMat, idx) => {
    const m = srcMat.clone() as THREE.MeshPhysicalMaterial;
    if (!isSaliva) {
      m.side = THREE.DoubleSide;
    }

    m.onBeforeCompile = (shader) => {
      shader.uniforms.uPulse = uniforms.uPulse;
      shader.uniforms.uScan = uniforms.uScan;
      shader.uniforms.uSection = uniforms.uSection;
      shader.uniforms.uClean = uniforms.uClean;
      shader.uniforms.uFocus = uniforms.uFocus;
      shader.uniforms.uRadius = uniforms.uRadius;
      shader.uniforms.uPlaneN = uniforms.uPlaneN;
      shader.uniforms.uPlaneC = uniforms.uPlaneC;
      shader.uniforms.uFdiCenter = uniforms.uFdiCenter;
      shader.uniforms.uFdiRadius = uniforms.uFdiRadius;
      shader.uniforms.uExtractMask = uniforms.uExtractMask;
      shader.uniforms.uPrepShrink = uniforms.uPrepShrink;
      shader.uniforms.uCariesSpot = uniforms.uCariesSpot;
      shader.uniforms.uScanColor = uniforms.uScanColor;
      shader.uniforms.uToothSphere = uniforms.uToothSphere;
      shader.uniforms.uToothState = uniforms.uToothState;

      shader.vertexShader =
        `
        attribute float aToothSlot;
        uniform vec4 uToothSphere[16];
        uniform vec4 uToothState[16];
        uniform vec3 uFdiCenter;
        uniform float uFdiRadius;
        uniform float uExtractMask;
        uniform float uPrepShrink;
        varying vec3 vWorldPos;
        varying vec3 vLocalPos;
        varying float vExtractMask;
        varying float vPrepShrink;
        varying float vCariesSpot;
        varying float vScanGlow;
        varying vec3 vToothCenterLocal;
        varying float vToothRadiusLocal;
        ` +
        shader.vertexShader
          .replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
            int tSlot = clamp(int(aToothSlot + 0.5), 0, 15);
            vec4 slotSphere = uToothSphere[tSlot];
            vec4 slotState = uToothState[tSlot];
            vToothCenterLocal = slotSphere.xyz;
            vToothRadiusLocal = max(slotSphere.w, 0.25);

            vec3 wpPre = (modelMatrix * vec4(transformed, 1.0)).xyz;
            float distToActiveWorld = length((wpPre - uFdiCenter) * vec3(1.25, 0.65, 1.25));
            float inActiveSphere = 1.0 - smoothstep(uFdiRadius * 0.75, uFdiRadius * 1.15, distToActiveWorld);

            float effExtract = max(slotState.x, uExtractMask * inActiveSphere);
            float effPrep = max(slotState.y, uPrepShrink * inActiveSphere);
            vExtractMask = effExtract;
            vPrepShrink = effPrep;
            vCariesSpot = slotState.z;
            vScanGlow = slotState.w;

            if (effPrep > 0.001) {
              vec3 toAxis = transformed - slotSphere.xyz;
              if (effPrep <= 0.24) {
                // Conservative labial enamel reduction for Lamina Veneer
                vec2 outDir2D = normalize(vec2(slotSphere.x, slotSphere.y - 5.2));
                float labialSide = clamp(dot(toAxis.xy, outDir2D) / max(slotSphere.w, 0.25), 0.0, 1.0);
                transformed.xy -= outDir2D * (effPrep * 0.35 * labialSide);
                transformed -= objectNormal * (effPrep * 0.12 * labialSide);
              } else {
                // 360° Radial XY contraction toward tooth axis + normal inward displacement (Crown / Bridge abutment stump)
                transformed.x -= toAxis.x * effPrep * 0.46;
                transformed.y -= toAxis.y * effPrep * 0.46;
                transformed.z -= toAxis.z * effPrep * 0.26;
                transformed -= objectNormal * (effPrep * 0.08);
              }
            }

            if (effExtract > 0.001) {
              // Collapse extracted tooth vertices toward cervical root base so shadow maps also vanish cleanly
              float collapse = smoothstep(0.25, 0.95, effExtract);
              transformed = mix(transformed, slotSphere.xyz, collapse * 0.92);
            }
            vLocalPos = transformed;
            `
          )
          .replace(
            `#include <worldpos_vertex>`,
            `#include <worldpos_vertex>
            vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
            `
          );

      shader.fragmentShader =
        `
        uniform float uPulse;
        uniform float uScan;
        uniform float uSection;
        uniform float uClean;
        uniform vec3 uFocus;
        uniform float uRadius;
        uniform vec3 uPlaneN;
        uniform float uPlaneC;
        uniform vec3 uFdiCenter;
        uniform float uFdiRadius;
        uniform float uExtractMask;
        uniform float uPrepShrink;
        uniform float uCariesSpot;
        uniform vec3 uScanColor;
        varying vec3 vWorldPos;
        varying vec3 vLocalPos;
        varying float vExtractMask;
        varying float vPrepShrink;
        varying float vCariesSpot;
        varying float vScanGlow;
        varying vec3 vToothCenterLocal;
        varying float vToothRadiusLocal;
        ` +
        shader.fragmentShader.replace(
          `#include <dithering_fragment>`,
          `#include <dithering_fragment>
          vec3 dpFdi = vWorldPos - uFdiCenter;
          float radialFdi = length(dpFdi * vec3(1.3, 0.6, 1.3));
          float inFdiTooth = 1.0 - smoothstep(uFdiRadius * 0.72, uFdiRadius * 1.05, radialFdi);

          float fragExtract = max(vExtractMask, uExtractMask * inFdiTooth);
          if (fragExtract > 0.35) {
            discard;
          }

          vec3 dpFocus = vWorldPos - uFocus;
          float radialFocus = length(dpFocus * vec3(1.35, 0.55, 1.35));
          float inFocusTooth = 1.0 - smoothstep(uRadius * 0.72, uRadius * 1.05, radialFocus);

          vec2 outDirLocal = normalize(vec2(vToothCenterLocal.x, vToothCenterLocal.y - 5.2));
          float buccalCoord = dot(vLocalPos.xy - vToothCenterLocal.xy, outDirLocal) / max(vToothRadiusLocal, 0.25);

          ${
            isSaliva
              ? `
          if (uSection > 0.05 && (vScanGlow > 0.15 || inFocusTooth > 0.25)) {
            discard;
          }
          `
              : `
          // 1a. Caries lesion spot (occlusal dark organic carious cavity for Filling / Sealant)
          float effCaries = max(vCariesSpot, uCariesSpot * inFdiTooth);
          if (effCaries > 0.01) {
            float localRadial = length((vLocalPos.xy - vToothCenterLocal.xy)) / max(vToothRadiusLocal, 0.25);
            float coreMask = 1.0 - smoothstep(0.08, 0.46, localRadial);
            float haloMask = 1.0 - smoothstep(0.28, 0.72, localRadial);
            vec3 cariesCore = vec3(0.12, 0.08, 0.05);
            vec3 cariesHalo = vec3(0.46, 0.34, 0.22);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, cariesHalo, haloMask * effCaries * 0.65);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, cariesCore, coreMask * effCaries * 0.92);
          }

          // 1b. Cervical Calculus / Tartar & Plaque stain (negative vCariesSpot for Scaling / Detertraj & Whitening)
          if (vCariesSpot < -0.01) {
            float tartarAmt = clamp(-vCariesSpot, 0.0, 1.0);
            bool isUpperArch = ${cacheKey.includes("upper") ? "true" : "false"};
            float towardGumZ = isUpperArch ? (vToothCenterLocal.z - vLocalPos.z) : (vLocalPos.z - vToothCenterLocal.z);
            float cervicalDist = max(0.0, towardGumZ) / max(vToothRadiusLocal, 0.25);
            float cervicalBand = smoothstep(0.08, 0.42, cervicalDist) * (1.0 - smoothstep(0.85, 1.25, cervicalDist));
            float interproxBand = smoothstep(0.35, 0.80, length(vLocalPos.xy - vToothCenterLocal.xy) / max(vToothRadiusLocal, 0.25)) * smoothstep(0.0, 0.32, cervicalDist);
            float plaqueMask = clamp(cervicalBand * 1.25 + interproxBand * 0.65, 0.0, 1.0);
            vec3 tartarCol = vec3(0.72, 0.58, 0.30);

            if (vCariesSpot <= -0.85) {
              // Scaling / Diş Taşı Temizliği:
              // Diş taşı sadece diş etiyle birleştiği servikal sınırda ve diş aralarında yer alır.
              // Dişin geri kalanına kesinlikle leke veya renk değişimi uygulanmaz; dişin geri kalanı doğal rengini korur.
              // Temizlenen bölge de yapay bir beyazlığa bürünmez, doğrudan dişin kendi doğal mine rengine döner.
              gl_FragColor.rgb = mix(gl_FragColor.rgb, tartarCol, plaqueMask * tartarAmt * 0.88);
            } else {
              // Whitening / Diş Beyazlatma:
              // Diş etinde kesinlikle diş taşı (tartar) bulunmaz!
              // Tedavi öncesinde dişlerin ön/labial yüzeyinde yarı saydam (transparan) çay/kahve/sigara sararması bulunur.
              // Dişin alttaki doğal dokusu ve parlaklığı saydam leke katmanının altından hissedilir.
              // Mavi LED ışık taramasıyla bu saydam koyu tabaka kademeli olarak çözülür ve dişin temiz doğal minesi ortaya çıkar.
              float stainFactor = clamp(-vCariesSpot / 0.75, 0.0, 1.0);
              vec3 darkToothStain = vec3(0.68, 0.56, 0.36);
              float labialFace = clamp(buccalCoord * 0.7 + 0.65, 0.35, 1.0);
              gl_FragColor.rgb = mix(gl_FragColor.rgb, darkToothStain, stainFactor * 0.52 * labialFace);
            }
          }

          // 2. Crown / Veneer prep dentin tint when shaved into abutment stump
          float effPrepFrag = max(vPrepShrink, uPrepShrink * inFdiTooth);
          if (effPrepFrag > 0.05) {
            vec3 prepDentin = vec3(0.89, 0.81, 0.68);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, prepDentin, clamp(effPrepFrag * 0.85, 0.0, 0.75));
          }

          // 3. Clinical scan ring / highlight pulse
          float activeScan = max(vScanGlow, uScan * max(inFocusTooth, inFdiTooth));
          if (activeScan > 0.001 && uSection < 0.05) {
            float localR = length((vLocalPos.xy - vToothCenterLocal.xy)) / max(vToothRadiusLocal, 0.25);
            float ring = smoothstep(0.18, 0.52, localR) * (1.0 - smoothstep(0.68, 0.98, localR));
            float pulseWave = 0.55 + 0.45 * abs(sin(uPulse * 6.28318));
            float glow = max(ring, 0.35) * activeScan * pulseWave;
            gl_FragColor.rgb += uScanColor * glow * 0.36;
          }

          // 4. Full-height Longitudinal Root Canal Cross-Section Slice (Crown + Root + Pulp Canal)
          if (uSection > 0.01 && (vScanGlow > 0.15 || inFocusTooth > 0.32)) {
            float cutThreshold = 0.95 - uSection * 1.02;
            if (buccalCoord > cutThreshold) discard;
            if (!gl_FrontFacing || buccalCoord > cutThreshold - 0.16) {
              float axisRadial = length(vLocalPos.xy - vToothCenterLocal.xy) / max(vToothRadiusLocal, 0.25);
              vec3 inflamedPulp = vec3(0.84, 0.16, 0.22) * (0.88 + 0.16 * sin(uPulse * 6.28318));
              vec3 cleanedCanal = vec3(0.85, 0.77, 0.66);
              vec3 pulp = mix(inflamedPulp, cleanedCanal, uClean);
              vec3 dentin = vec3(0.82, 0.71, 0.55);
              vec3 enamel = vec3(0.88, 0.82, 0.72);
              vec3 col = mix(pulp, dentin, smoothstep(0.14, 0.34, axisRadial));
              col = mix(col, enamel, smoothstep(0.62, 0.86, axisRadial));
              gl_FragColor = vec4(col, 1.0);
            }
          }
          `
          }
          `
        );
    };

    m.customProgramCacheKey = () => `${cacheKey}-${idx}`;
    m.needsUpdate = true;
    return m;
  });

  mesh.material = Array.isArray(mesh.material) ? upgraded : upgraded[0]!;
}

/**
 * Initializes the MouthCinematicController once `mouth.glb` is loaded.
 */
export function initMouthCinematics(
  root: THREE.Object3D,
  jawHinge: THREE.Object3D | null
): MouthCinematicController {
  snapshotMats(root);

  const teethUpper = root.getObjectByName("TeethUpper_midres") as THREE.Mesh | null;
  const salivaUpper = root.getObjectByName("SalivaUpper_midres") as THREE.Mesh | null;
  const gumsUpper = root.getObjectByName("GumsUpper_midres") as THREE.Mesh | null;

  const teethLower = root.getObjectByName("TeethLower_midres") as THREE.Mesh | null;
  const salivaLower = root.getObjectByName("SalivaLower_midres") as THREE.Mesh | null;
  const gumsLower = root.getObjectByName("GumsLower_midres") as THREE.Mesh | null;

  const upperArch = teethUpper
    ? buildArchBinding(teethUpper, salivaUpper, gumsUpper, true)
    : null;
  const lowerArch = teethLower
    ? buildArchBinding(teethLower, salivaLower, gumsLower, false)
    : null;

  return {
    root,
    upperArch,
    lowerArch,
    jawHinge,
    activeTimeline: null,
  };
}

export interface ResolvedFdiFrame {
  fdi: string;
  upper: boolean;
  right: boolean;
  distal: number;
  category: ToothCategory;
  arch: ArchBinding;
  island: ToothIslandMeta;
  /** World-space occlusal point (accounts for current jaw_hinge_pivot rotation) */
  worldOcclusal: THREE.Vector3;
  /** World-space tooth center */
  worldCenter: THREE.Vector3;
  /** World-space cervical root point */
  worldCervical: THREE.Vector3;
  /** World-space outward occlusal normal (+Y for lower, -Y for upper, tilted with jaw) */
  worldOcclusalOut: THREE.Vector3;
  /** World-space apical root direction (+Y for upper, -Y for lower) */
  worldApexDir: THREE.Vector3;
  worldRadius: number;
}

/**
 * Resolves exact arch-local and dynamic world-space coordinates for any FDI tooth.
 * Because local coordinates come from the exact tooth island on `TeethUpper_midres` / `TeethLower_midres`,
 * calling `localToWorld` automatically tracks `pivotHingeRef.rotation.x` on the lower jaw!
 */
export function calculateLocalFdiFrame(
  controller: MouthCinematicController,
  fdi: string
): ResolvedFdiFrame | null {
  const { upper } = fdiMeta(fdi);
  const arch = upper ? controller.upperArch : controller.lowerArch;
  if (!arch) return null;

  arch.teethMesh.updateWorldMatrix(true, false);

  let island = arch.islands.get(fdi);
  if (!island) {
    const first = arch.islands.values().next().value as ToothIslandMeta | undefined;
    if (!first) return null;
    island = first;
  }

  const worldCenter = arch.teethMesh.localToWorld(island.localCenter.clone());
  const worldOcclusal = arch.teethMesh.localToWorld(island.localOcclusal.clone());
  const worldCervical = arch.teethMesh.localToWorld(island.localCervical.clone());

  const worldOcclusalOut = worldOcclusal
    .clone()
    .sub(worldCervical)
    .normalize();
  if (worldOcclusalOut.lengthSq() < 1e-6) {
    worldOcclusalOut.set(0, upper ? -1 : 1, 0);
  }
  const worldApexDir = worldOcclusalOut.clone().negate();

  return {
    fdi: island.fdi,
    upper: island.upper,
    right: island.right,
    distal: island.distal,
    category: island.category,
    arch,
    island,
    worldOcclusal,
    worldCenter,
    worldCervical,
    worldOcclusalOut,
    worldApexDir,
    worldRadius: island.worldRadius,
  };
}

// ============================================================================
// PROCEDURAL 3D CLINICAL TOOLS & PROSTHETIC BUILDERS
// ============================================================================

export function makeDroplet(scale: number): THREE.Mesh {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x60a5fa,
    roughness: 0.06,
    metalness: 0.0,
    transmission: 0.92,
    thickness: 0.35,
    transparent: true,
    opacity: 0.72,
    ior: 1.44,
    emissive: new THREE.Color(0x1d4ed8),
    emissiveIntensity: 0.18,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(scale, 28, 20), mat);
  mesh.name = "prop_tool_droplet";
  mesh.renderOrder = 4;
  return mesh;
}

export function makeLED(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_led_curing";
  const polymer = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.45,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.18,
    metalness: 0.9,
  });

  // Oriented in local space so the optical curing tip sits near (0, scale*0.35, 0)
  // and shines its blue curing beam along -Y (downward toward local origin (0,0,0)),
  // while the ergonomic wand handle angles upward/outward along +Y/+X.
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    emissive: new THREE.Color(0x2563eb),
    emissiveIntensity: 0.25,
    roughness: 0.12,
    metalness: 0.1,
  });
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.18, scale * 0.2, scale * 0.12, 20),
    tipMat
  );
  tip.position.set(0, scale * 0.42, 0);

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.28, scale * 0.24, scale * 0.32, 20),
    polymer
  );
  head.position.set(0, scale * 0.62, 0);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.11, scale * 0.15, scale * 1.35, 16),
    metal
  );
  neck.rotation.z = -Math.PI / 5.5;
  neck.position.set(scale * 0.35, scale * 1.22, 0);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.22, scale * 0.26, scale * 2.3, 18),
    polymer
  );
  handle.rotation.z = -Math.PI / 3.4;
  handle.position.set(scale * 1.25, scale * 2.15, 0);

  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  // Open-ended cone whose apex is at tip (y = scale*0.42) and base spreads down to y = -scale*0.78
  const beamCone = new THREE.Mesh(
    new THREE.ConeGeometry(scale * 0.62, scale * 1.2, 24, 1, true),
    coneMat
  );
  beamCone.position.set(0, -scale * 0.18, 0);

  g.add(handle, neck, head, tip, beamCone);

  const light = new THREE.SpotLight(0x60a5fa, 0, scale * 8, Math.PI / 6, 0.45, 1.5);
  light.position.set(0, scale * 0.42, 0);
  const aim = new THREE.Object3D();
  aim.position.set(0, -scale * 1.2, 0);
  g.add(light, aim);
  light.target = aim;

  g.userData.light = light;
  g.userData.tip = tip;
  g.userData.beam = beamCone;
  g.renderOrder = 5;
  return g;
}

export function makeFile(len: number, rad: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_endo_file";

  // Inner spinner group aligned along +Y:
  // y = 0 is the coronal orifice / handle junction; y = +len is the apical tip inside the root canal.
  const spinner = new THREE.Group();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 96; i++) {
    const t = i / 96;
    const r = rad * (1.0 - t * 0.52);
    pts.push(
      new THREE.Vector3(
        Math.cos(t * Math.PI * 16) * r,
        t * len,
        Math.sin(t * Math.PI * 16) * r
      )
    );
  }
  const blade = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, rad * 0.48, 8, false),
    new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
    })
  );

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(rad * 2.5, rad * 2.9, len * 0.36, 18),
    new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.32,
      metalness: 0.18,
    })
  );
  handle.position.set(0, -len * 0.18, 0);

  const gripRing = new THREE.Mesh(
    new THREE.CylinderGeometry(rad * 2.8, rad * 2.8, len * 0.05, 18),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 })
  );
  gripRing.position.set(0, -len * 0.12, 0);

  const stopper = new THREE.Mesh(
    new THREE.CylinderGeometry(rad * 3.4, rad * 3.4, len * 0.045, 18),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 })
  );
  stopper.position.set(0, len * 0.12, 0);

  spinner.add(blade, handle, gripRing, stopper);
  g.add(spinner);
  g.userData.spinner = spinner;
  g.renderOrder = 5;
  return g;
}

export function makeGutta(len: number, rad: number): THREE.Mesh {
  // Tapered pink gutta-percha cone extending along +Y from 0 (orifice) to +len (apex)
  const geo = new THREE.CylinderGeometry(rad * 0.95, rad * 0.42, len, 18);
  geo.translate(0, len * 0.5, 0);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      color: 0xf472b6,
      emissive: new THREE.Color(0xdb2777),
      emissiveIntensity: 0.22,
      roughness: 0.36,
      metalness: 0.05,
      transparent: true,
      opacity: 0,
    })
  );
  mesh.name = "prop_tool_gutta_percha";
  mesh.renderOrder = 4;
  return mesh;
}

export function makeCoreCap(
  rad: number,
  isPermanent = false,
  fdi = "16",
  isSealant = false,
  crownAxis?: THREE.Vector3
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(rad, 24, 16);
  // Flatten into a sleek anatomical occlusal inlay / fissure sealant layer
  geo.scale(1.12, isSealant ? 0.18 : 0.28, 1.04);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      color: isSealant ? 0xe8eff8 : 0xe5dbc8,
      roughness: isSealant ? 0.12 : 0.32,
      metalness: 0.0,
      clearcoat: 0.55,
      clearcoatRoughness: 0.14,
      transmission: isSealant ? 0.28 : 0.02,
      transparent: !isPermanent || isSealant,
      opacity: isPermanent ? (isSealant ? 0.92 : 0.98) : 0,
    })
  );
  if (crownAxis && crownAxis.lengthSq() > 1e-6) {
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), crownAxis);
  }
  mesh.name = isPermanent ? `prop_perm_cap_${fdi}` : "prop_tool_core_seal";
  mesh.renderOrder = 3;
  return mesh;
}

export function makeDentalBur(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_dental_bur";

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.18,
  });
  const diamond = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.32,
    emissive: new THREE.Color(0x0ea5e9),
    emissiveIntensity: 0.14,
  });

  // Handpiece turbine head at y = scale*1.25; diamond bur tip reaches down to y = 0
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.36, scale * 0.32, scale * 0.95, 20),
    chrome
  );
  head.position.set(0, scale * 1.25, 0);

  // Handpiece neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.22, scale * 0.28, scale * 2.2, 16),
    chrome
  );
  neck.rotation.z = Math.PI / 2.25;
  neck.position.set(-scale * 1.05, scale * 1.55, 0);

  // Spinning bur shaft + diamond grit head
  const burSpinner = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.065, scale * 0.065, scale * 0.85, 14),
    chrome
  );
  shaft.position.set(0, scale * 0.48, 0);

  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.11, scale * 0.08, scale * 0.38, 16),
    diamond
  );
  tip.position.set(0, scale * 0.16, 0);

  // Water mist spray ring
  const mistRing = new THREE.Mesh(
    new THREE.RingGeometry(scale * 0.12, scale * 0.42, 24),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  mistRing.rotation.x = Math.PI / 2;
  mistRing.position.set(0, scale * 0.12, 0);

  burSpinner.add(shaft, tip, mistRing);
  g.add(head, neck, burSpinner);
  g.userData.spinner = burSpinner;
  g.renderOrder = 5;
  return g;
}

export function makeForceps(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_forceps";

  const steel = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    metalness: 0.94,
    roughness: 0.16,
  });
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.82,
    roughness: 0.32,
  });

  // Oriented so y = 0 is the crown grip center; beaks wrap around y = -0.15..+0.75*scale,
  // hinge sits at y = +0.9*scale, and long surgical handles extend toward +Y (outside the crown).
  const leftBeak = new THREE.Group();
  leftBeak.position.set(0, scale * 0.9, 0);
  const leftJaw = new THREE.Mesh(
    new THREE.BoxGeometry(scale * 0.13, scale * 0.95, scale * 0.32),
    steel
  );
  leftJaw.position.set(-scale * 0.24, -scale * 0.48, 0);
  leftJaw.rotation.z = 0.14;
  const leftHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.1, scale * 0.13, scale * 2.1, 14),
    gripMat
  );
  leftHandle.position.set(-scale * 0.34, scale * 1.05, 0);
  leftHandle.rotation.z = 0.1;
  leftBeak.add(leftJaw, leftHandle);

  const rightBeak = new THREE.Group();
  rightBeak.position.set(0, scale * 0.9, 0);
  const rightJaw = new THREE.Mesh(
    new THREE.BoxGeometry(scale * 0.13, scale * 0.95, scale * 0.32),
    steel
  );
  rightJaw.position.set(scale * 0.24, -scale * 0.48, 0);
  rightJaw.rotation.z = -0.14;
  const rightHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.1, scale * 0.13, scale * 2.1, 14),
    gripMat
  );
  rightHandle.position.set(scale * 0.34, scale * 1.05, 0);
  rightHandle.rotation.z = -0.1;
  rightBeak.add(rightJaw, rightHandle);

  const hingePin = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.18, scale * 0.18, scale * 0.38, 18),
    steel
  );
  hingePin.rotation.x = Math.PI / 2;
  hingePin.position.set(0, scale * 0.9, 0);

  g.add(leftBeak, rightBeak, hingePin);
  g.userData.leftBeak = leftBeak;
  g.userData.rightBeak = rightBeak;
  g.renderOrder = 5;
  return g;
}

export function makeSurgicalDrill(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_surgical_drill";

  const titanium = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.94,
    roughness: 0.18,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.16,
  });
  const depthBand = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
  });

  // Oriented so +Y points along `localRootAxis` (into alveolar bone),
  // while the contra-angle surgical handpiece head sits at y = -scale*0.35 (outside socket).
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.34, scale * 0.3, scale * 0.65, 20),
    chrome
  );
  head.position.set(0, -scale * 0.32, 0);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.18, scale * 0.22, scale * 1.8, 16),
    chrome
  );
  neck.rotation.z = Math.PI / 2.15;
  neck.position.set(-scale * 0.88, -scale * 0.45, 0);

  const spinner = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.14, scale * 0.075, scale * 1.35, 18),
    titanium
  );
  body.position.set(0, scale * 0.68, 0);
  spinner.add(body);

  // Helical flute rings + black laser depth markings
  [0.28, 0.52, 0.76, 1.0].forEach((t, idx) => {
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.145, scale * 0.13, scale * 0.055, 18),
      idx % 2 === 0 ? depthBand : chrome
    );
    ring.position.set(0, scale * t, 0);
    spinner.add(ring);
  });

  const mistRing = new THREE.Mesh(
    new THREE.RingGeometry(scale * 0.14, scale * 0.42, 24),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.36,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  mistRing.rotation.x = Math.PI / 2;
  mistRing.position.set(0, scale * 0.08, 0);
  spinner.add(mistRing);

  g.add(head, neck, spinner);
  g.userData.spinner = spinner;
  g.renderOrder = 5;
  return g;
}

export function makeHexDriver(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_hex_driver";

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.94,
    roughness: 0.16,
  });
  const goldBand = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.88,
    roughness: 0.2,
  });

  // Oriented along +Y (`localCrownAxis`): tip at y = 0 engages abutment screw channel;
  // knurled torque driver body sits at y = scale*0.4..1.6.
  const spinner = new THREE.Group();
  const hexTip = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.09, scale * 0.07, scale * 0.55, 6),
    chrome
  );
  hexTip.position.set(0, scale * 0.28, 0);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.18, scale * 0.13, scale * 0.85, 18),
    chrome
  );
  shaft.position.set(0, scale * 0.92, 0);

  const torqueRing = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.21, scale * 0.21, scale * 0.14, 18),
    goldBand
  );
  torqueRing.position.set(0, scale * 1.15, 0);

  spinner.add(hexTip, shaft, torqueRing);
  g.add(spinner);
  g.userData.spinner = spinner;
  g.renderOrder = 5;
  return g;
}

export function makeImplantFixture(
  island: ToothIslandMeta,
  isPermanent = true
): THREE.Group {
  const g = new THREE.Group();
  g.name = isPermanent
    ? `prop_perm_implant_${island.fdi}`
    : `prop_tool_implant_${island.fdi}`;

  // Constrain radius and length strictly inside the natural root volume inside the gum
  const r = Math.min(island.localRadius * 0.27, 0.16);
  const len = Math.min(island.localRadius * 0.95, island.localRootLength * 0.72);

  const tiMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.2,
    emissive: new THREE.Color(0x334155),
    emissiveIntensity: 0.2,
  });
  const threadMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.95,
    roughness: 0.14,
  });
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.96,
    roughness: 0.12,
  });

  // Align +Y with island.localRootAxis (from subgingival cervical seat toward root apex inside bone)
  g.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    island.localRootAxis
  );

  const spinner = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.65, r * 0.9, len * 0.86, 20),
    tiMat
  );
  // Starts at y = +0.02*len (inside subgingival socket) to y = +0.88*len (inside alveolar bone)
  core.position.set(0, len * 0.45, 0);
  spinner.add(core);

  // Machined titanium crestal platform + internal hex connection visible at the socket entrance
  // when no crown is seated over the implant
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.96, r * 1.02, len * 0.14, 20),
    platformMat
  );
  platform.position.set(0, -len * 0.04, 0);
  spinner.add(platform);

  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const tr = THREE.MathUtils.lerp(r * 0.94, r * 0.66, t);
    const thread = new THREE.Mesh(
      new THREE.TorusGeometry(tr, r * 0.095, 10, 22),
      threadMat
    );
    thread.rotation.x = Math.PI / 2;
    thread.position.set(0, len * (0.1 + t * 0.64), 0);
    spinner.add(thread);
  }

  g.add(spinner);
  g.userData.spinner = spinner;
  return g;
}

export function makeAbutment(
  island: ToothIslandMeta,
  isPermanent = true
): THREE.Group {
  const g = new THREE.Group();
  g.name = isPermanent
    ? `prop_perm_abutment_${island.fdi}`
    : `prop_tool_abutment_${island.fdi}`;

  const r = Math.min(island.localRadius * 0.28, 0.165);
  const h = island.localRadius * 0.78;

  const goldTi = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.88,
    roughness: 0.18,
  });
  const silverTi = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.16,
  });

  // Align +Y with island.localCrownAxis (emerging from socket opening into the clinical crown space)
  g.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    island.localCrownAxis
  );

  const spinner = new THREE.Group();
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.12, r * 0.9, h * 0.38, 20),
    goldTi
  );
  collar.position.set(0, h * 0.18, 0);

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 0.78, r * 0.98, h * 0.62, 20),
    silverTi
  );
  post.position.set(0, h * 0.62, 0);

  spinner.add(collar, post);
  g.add(spinner);
  g.userData.spinner = spinner;
  return g;
}

/**
 * Builds an anatomical single-tooth crown/prosthetic (or extraction proxy with root, or labial veneer shell)
 * in `TeethUpper_midres` / `TeethLower_midres` local space using the exact sculpted
 * geometry from `mouth.glb` (`crownOnlyGeo` for crowns/bridges, `veneerOnlyGeo` for veneer, `fullToothGeo` for extraction).
 */
export function makeAnatomicalToothMesh(
  island: ToothIslandMeta,
  mode: "extraction_proxy" | "crown" | "veneer" | "temp",
  isPermanent = false
): THREE.Group {
  const g = new THREE.Group();
  g.name = isPermanent
    ? `prop_perm_prosthetic_${island.fdi}`
    : `prop_tool_tooth_${island.fdi}`;

  const isProxy = mode === "extraction_proxy";
  const isVeneer = mode === "veneer";
  let crownMat: THREE.MeshStandardMaterial;

  if (island.baseToothMaterial) {
    // Clone the exact native PBR tooth material (with map, normalMap, roughnessMap) from mouth.glb
    // so newly placed teeth/crowns/bridges match the existing teeth in the mouth 1:1!
    crownMat = island.baseToothMaterial.clone();
    crownMat.side = THREE.DoubleSide;
    crownMat.transparent = isProxy;
    crownMat.opacity = 1.0;
    crownMat.color = new THREE.Color(
      mode === "temp" ? 0xf6ebd4 : isVeneer ? 0xffffff : 0xfdfaf4
    );
    crownMat.emissive = new THREE.Color(0x0f172a);
    crownMat.emissiveIntensity = 0.0;
    crownMat.needsUpdate = true;
  } else {
    crownMat = new THREE.MeshPhysicalMaterial({
      color:
        mode === "temp"
          ? 0xeee2c8
          : isVeneer
            ? 0xeae1cf
            : mode === "crown"
              ? 0xe6dcc8
              : 0xe4dac6,
      roughness: mode === "temp" ? 0.34 : isVeneer ? 0.24 : 0.3,
      metalness: 0.0,
      clearcoat: isVeneer ? 0.65 : 0.5,
      clearcoatRoughness: 0.14,
      emissive: new THREE.Color(0x0f172a),
      emissiveIntensity: 0.0,
      transparent: isProxy,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });
  }

  const srcGeo = isProxy
    ? island.fullToothGeo
    : isVeneer
      ? island.veneerOnlyGeo ?? island.crownOnlyGeo
      : island.crownOnlyGeo;
  if (srcGeo) {
    const mesh = new THREE.Mesh(srcGeo.clone(), crownMat);
    g.add(mesh);
    g.userData.crownMat = crownMat;
    return g;
  }

  // Fallback procedural crown if island geometry is unavailable
  const dirSign: 1 | -1 = island.upper ? -1 : 1;
  const crownGeo = createToothCrownGeometry(island.category, dirSign);
  crownGeo.rotateX(-Math.PI / 2);
  const crownMesh = new THREE.Mesh(crownGeo, crownMat);
  const s = island.localRadius * 1.9;
  crownMesh.scale.set(s, s * 0.95, s * 1.05);
  crownMesh.position.copy(island.localCrownCenter).sub(island.localCenter);
  g.add(crownMesh);
  g.userData.crownMat = crownMat;
  return g;
}

/**
 * Creates a monolithic zirconia interproximal connector strut between two adjacent
 * bridge units (`islA` and `islB`) so a multi-unit bridge (`permanent_bridge` / `temporary_denture`)
 * visually forms a single rigid 1-piece block rather than separate individual crowns.
 */
export function makeBridgeConnectorMesh(
  islA: ToothIslandMeta,
  islB: ToothIslandMeta,
  mode: "crown" | "temp" = "crown",
  isPermanent = true
): THREE.Mesh {
  const pA = islA.localCrownCenter;
  const pB = islB.localCrownCenter;
  const delta = pB.clone().sub(pA);
  const spanLen = Math.max(0.01, delta.length() * 0.72);
  const radius = Math.min(islA.localRadius, islB.localRadius) * 0.36;

  const geo = new THREE.CylinderGeometry(radius, radius, spanLen, 14);
  geo.scale(1.0, 1.0, 0.78);

  let mat: THREE.MeshStandardMaterial;
  if (islA.baseToothMaterial) {
    mat = islA.baseToothMaterial.clone();
    mat.side = THREE.DoubleSide;
    mat.color = new THREE.Color(mode === "temp" ? 0xf6ebd4 : 0xfdfaf4);
    mat.needsUpdate = true;
  } else {
    mat = new THREE.MeshPhysicalMaterial({
      color: mode === "temp" ? 0xeee2c8 : 0xe6dcc8,
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.14,
      side: THREE.DoubleSide,
    });
  }

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pA).lerp(pB, 0.5);
  if (delta.lengthSq() > 1e-6) {
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.clone().normalize()
    );
  }
  mesh.name = isPermanent
    ? `prop_perm_bridge_conn_${islA.fdi}_${islB.fdi}`
    : `prop_tool_bridge_conn_${islA.fdi}_${islB.fdi}`;
  mesh.renderOrder = 3;
  return mesh;
}

export function makeUltrasonicScaler(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_ultrasonic_scaler";

  const steel = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.94,
    roughness: 0.14,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.28,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });

  // Oriented so the curved piezo scaler tip touches (0, 0, 0) (the cervical gumline margin)
  // while the ergonomic handpiece extends along +Y (toward the labial/buccal exterior).
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.17, scale * 0.22, scale * 2.1, 18),
    handleMat
  );
  handle.position.set(0, scale * 1.45, 0);

  const ledRing = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.18, scale * 0.18, scale * 0.12, 18),
    collarMat
  );
  ledRing.position.set(0, scale * 0.42, 0);

  const curvePts = [
    new THREE.Vector3(0, scale * 0.4, 0),
    new THREE.Vector3(scale * 0.16, scale * 0.18, 0),
    new THREE.Vector3(0, 0, 0),
  ];
  const tip = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(curvePts),
      20,
      scale * 0.042,
      10,
      false
    ),
    steel
  );

  // Water cavitation spray mist around tip
  const spray = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.32, 16, 12),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    })
  );
  spray.position.set(0, scale * 0.04, 0);

  g.add(handle, ledRing, tip, spray);
  g.userData.spray = spray;
  g.renderOrder = 5;
  return g;
}

export function makeGingivalBarrierMesh(
  frames: ResolvedFdiFrame[]
): THREE.Mesh | null {
  if (frames.length < 2) return null;
  const sorted = [...frames].sort(
    (a, b) => a.island.localCenter.x - b.island.localCenter.x
  );
  const pts: THREE.Vector3[] = [];
  sorted.forEach((f) => {
    const out = new THREE.Vector3(
      f.island.localCervical.x,
      f.island.localCervical.y - 5.2,
      0
    ).normalize();
    const pt = f.island.localCervical
      .clone()
      .addScaledVector(out, f.island.localRadius * 0.18);
    pts.push(pt);
  });
  if (pts.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(
    curve,
    frames.length * 8,
    frames[0]!.island.localRadius * 0.08,
    10,
    false
  );
  const mat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Dental blue gingival dam
    roughness: 0.28,
    metalness: 0.12,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "prop_tool_gingival_barrier";
  mesh.renderOrder = 4;
  return mesh;
}

export function makeBleachingGelMesh(isl: ToothIslandMeta): THREE.Mesh {
  const geo = isl.veneerOnlyGeo;
  const gelMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.84,
    transparent: true,
    opacity: 0.76,
    roughness: 0.08,
    metalness: 0.02,
    ior: 1.35,
    thickness: 0.35,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.1,
  });
  const mesh = new THREE.Mesh(geo, gelMat);
  mesh.name = `prop_tool_bleach_gel_${isl.fdi}`;
  mesh.position.copy(isl.localCenter);
  mesh.scale.set(1.035, 1.035, 1.05);
  mesh.renderOrder = 4;
  mesh.userData.gelMat = gelMat;
  return mesh;
}

export function makeGelSyringe(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_gel_syringe";

  const barrelMat = new THREE.MeshPhysicalMaterial({
    color: 0xf1f5f9,
    transmission: 0.88,
    transparent: true,
    opacity: 0.65,
    roughness: 0.12,
    metalness: 0.05,
    ior: 1.42,
  });
  const plungerMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.18,
  });

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.14, scale * 0.14, scale * 1.8, 16),
    barrelMat
  );
  barrel.position.set(0, scale * 1.1, 0);

  const gelInside = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.12, scale * 0.12, scale * 1.2, 14),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 })
  );
  gelInside.position.set(0, scale * 0.9, 0);

  const plunger = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.08, scale * 0.08, scale * 1.6, 12),
    plungerMat
  );
  plunger.position.set(0, scale * 2.2, 0);

  const tipCurve = [
    new THREE.Vector3(0, scale * 0.32, 0),
    new THREE.Vector3(scale * 0.08, scale * 0.14, 0),
    new THREE.Vector3(0, 0, 0),
  ];
  const tip = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(tipCurve),
      16,
      scale * 0.032,
      8,
      false
    ),
    steelMat
  );

  g.add(barrel, gelInside, plunger, tip);
  g.renderOrder = 5;
  return g;
}

export function makeBleachingArcLamp(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_bleaching_arc_lamp";

  const casingMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.65,
  });
  const emitterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 1.4,
    roughness: 0.1,
  });

  // Wide curved head spanning the anterior smile arch
  const arcBody = new THREE.Mesh(
    new THREE.TorusGeometry(scale * 1.7, scale * 0.26, 12, 32, Math.PI * 0.65),
    casingMat
  );
  arcBody.rotation.z = -Math.PI * 0.825;
  arcBody.rotation.y = Math.PI;
  arcBody.position.set(0, 0, -scale * 0.35);

  // 4 circular LED emitter lenses inside the arc
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(scale * 0.18, scale * 0.18, scale * 0.08, 16),
      emitterMat
    );
    const angle = i * 0.28;
    lens.position.set(
      Math.sin(angle) * scale * 1.6,
      0,
      Math.cos(angle) * scale * 0.35
    );
    lens.rotation.x = Math.PI / 2;
    g.add(lens);
  }

  // Broad conical blue light beam fan pointing at the smile arch
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(scale * 2.2, scale * 3.2, 32, 1, true),
    beamMat
  );
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, 0, -scale * 1.5);

  const light = new THREE.SpotLight(0x38bdf8, 0, scale * 14, Math.PI / 3, 0.45, 1.2);
  light.position.set(0, 0, 0);

  g.add(arcBody, beam, light);
  g.userData.beam = beam;
  g.userData.light = light;
  g.renderOrder = 5;
  return g;
}

export function makeSuctionCannula(scale: number): THREE.Group {
  const g = new THREE.Group();
  g.name = "prop_tool_suction_cannula";

  const plasticMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.1,
  });
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.4,
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.12, scale * 0.16, scale * 2.8, 16),
    plasticMat
  );
  body.position.set(0, scale * 1.5, 0);

  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(scale * 0.08, scale * 0.12, scale * 0.45, 14),
    gripMat
  );
  tip.position.set(0, scale * 0.22, 0);

  g.add(body, tip);
  g.renderOrder = 5;
  return g;
}

// ============================================================================
// PERSISTENT STATE SYNCHRONIZER ACROSS STAGES (Requirement 1)
// ============================================================================

export function normalizeActionType(
  actionType: AnimationActionType | string,
  stageName = ""
): AnimationActionType {
  const raw = `${actionType} ${stageName}`.toLowerCase();
  if (raw.includes("extract") || raw.includes("çekim") || raw.includes("cekim")) {
    return "extraction";
  }
  if (raw.includes("abutment") || raw.includes("dayanak")) {
    return "abutment";
  }
  if (raw.includes("implant") || raw.includes("fikstür")) {
    return "implant";
  }
  if (raw.includes("root_canal") || raw.includes("kanal") || raw.includes("endo")) {
    return "root_canal";
  }
  if (raw.includes("sealant") || raw.includes("fissür") || raw.includes("fissur")) {
    return "sealant";
  }
  if (raw.includes("filling") || raw.includes("dolgu") || raw.includes("kompozit") || raw.includes("bonding")) {
    return "filling";
  }
  if (raw.includes("temporary") || raw.includes("geçici") || raw.includes("gecici")) {
    return "temporary_denture";
  }
  if (raw.includes("veneer") || raw.includes("lamina") || raw.includes("yaprak")) {
    return "veneer";
  }
  if (
    raw.includes("permanent_bridge") ||
    raw.includes("crown") ||
    raw.includes("zirkon") ||
    raw.includes("köprü") ||
    raw.includes("kuron") ||
    raw.includes("kaplama")
  ) {
    return actionType === "permanent_bridge" || raw.includes("köprü") || raw.includes("bridge")
      ? "permanent_bridge"
      : "crown";
  }
  if (
    raw.includes("whitening") ||
    raw.includes("bleach") ||
    raw.includes("beyazlatma")
  ) {
    return "whitening";
  }
  if (
    raw.includes("xray") ||
    raw.includes("röntgen") ||
    raw.includes("rontgen") ||
    raw.includes("panoramik") ||
    raw.includes("tomografi")
  ) {
    return "xray";
  }
  if (
    raw.includes("sinus") ||
    raw.includes("sinüs") ||
    raw.includes("greft") ||
    raw.includes("graft") ||
    raw.includes("kemik tozu")
  ) {
    return "sinus_graft";
  }
  if (
    raw.includes("scaling") ||
    raw.includes("cleaning") ||
    raw.includes("detertraj") ||
    raw.includes("diş taşı") ||
    raw.includes("temiz") ||
    raw.includes("polisaj")
  ) {
    return "scaling";
  }
  if (raw.includes("healing") || raw.includes("iyileşme") || raw.includes("osteointegrasyon")) {
    return "healing";
  }
  return "custom";
}

/**
 * When a multi-unit bridge (`permanent_bridge` or `temporary_denture`) spans across
 * an arch (e.g. #16..#26 or #46..#36), automatically include any extracted edentulous
 * pontic slots between the bridge's terminal abutments so no empty gaps remain inside the bridge.
 */
function expandBridgeSpanTeeth(
  rawTeeth: string[],
  action: AnimationActionType,
  extractedSoFar: Set<string>
): string[] {
  if (action !== "permanent_bridge" && action !== "temporary_denture") {
    return rawTeeth;
  }
  const result = new Set<string>(rawTeeth);

  const expandArch = (order: readonly string[]) => {
    const indices: number[] = [];
    order.forEach((fdi, idx) => {
      if (result.has(fdi)) indices.push(idx);
    });
    if (indices.length < 2) return;
    const minIdx = Math.min(...indices);
    const maxIdx = Math.max(...indices);
    for (let i = minIdx; i <= maxIdx; i++) {
      const fdi = order[i];
      if (fdi && extractedSoFar.has(fdi)) {
        result.add(fdi);
      }
    }
  };

  expandArch(UPPER_FDI_ORDER);
  expandArch(LOWER_FDI_ORDER);
  return Array.from(result);
}

/**
 * Reconstructs the exact persistent clinical state on both arches from baseline diagnosis
 * (`conditions` from Teşhis tab) plus all prior completed stages (< currentStageIndex).
 * Missing/extracted teeth stay hidden (`uExtractMask = 1.0`), prepped teeth stay prepped,
 * and placed implants/abutments/crowns remain locked to their arch-local anchor groups!
 */
export function syncCompletedStateBeforeStage(
  context: MouthSceneContext,
  allStages: AnimationTimelineStage[],
  currentStageIndex: number,
  conditions?: Record<string, string>,
  activeStage?: AnimationTimelineStage
): Set<string> {
  const { controller, scene } = context;
  clearSceneProps(scene, "prop_tool_");

  [controller.upperArch, controller.lowerArch].forEach((arch) => {
    if (!arch) return;
    resetArchUniforms(arch.uniforms);
    clearGroupChildren(arch.anchorGroup);
    if (arch.gumsMesh) {
      const gMat = arch.gumsMesh.material as THREE.MeshPhysicalMaterial | undefined;
      if (gMat && "opacity" in gMat) {
        gMat.opacity = 1.0;
        gMat.transparent = false;
      }
    }
  });

  const extracted = new Set<string>();
  const preppedAmount = new Map<string, number>();
  const cariesAmount = new Map<string, number>();
  const implanted = new Set<string>();
  const abutted = new Set<string>();
  const prostheticMode = new Map<string, "temp" | "crown" | "veneer">();
  const cappedMode = new Map<string, boolean>(); // true = sealant, false = filling/endo cap

  const activeAction = activeStage
    ? normalizeActionType(activeStage.actionType, activeStage.stageName)
    : null;
  const activeStageTeeth = new Set<string>(
    (activeStage?.teeth ?? []).map((t) => String(t).trim())
  );

  // 1. Seed initial clinical findings from Diagnosis (Teşhis) tab (`conditions`)
  if (conditions) {
    Object.entries(conditions).forEach(([rawFdi, cond]) => {
      const fdi = rawFdi.trim();
      if (!fdi || !cond || cond === "intact") return;

      if (cond === "missing") {
        // If the current active stage is explicitly extracting this tooth right now,
        // keep it visible at t=0 so the forceps extraction animation can pull it out;
        // otherwise it is already missing from the arch!
        if (!(activeAction === "extraction" && activeStageTeeth.has(fdi))) {
          extracted.add(fdi);
        }
      } else if (cond === "caries") {
        if (!(activeAction === "sealant" && activeStageTeeth.has(fdi))) {
          cariesAmount.set(fdi, 0.85);
        }
      } else if (cond === "filled" || cond === "root_canal") {
        cariesAmount.delete(fdi);
      } else if (cond === "implant") {
        extracted.add(fdi);
        if (!(activeAction === "implant" && activeStageTeeth.has(fdi))) {
          implanted.add(fdi);
          if (!(activeAction === "abutment" && activeStageTeeth.has(fdi))) {
            abutted.add(fdi);
            prostheticMode.set(fdi, "crown");
          }
        }
      } else if (cond === "crown" || cond === "bridge") {
        if (!activeStageTeeth.has(fdi)) {
          preppedAmount.set(fdi, 0.45);
          prostheticMode.set(fdi, "crown");
        }
      }
    });
  }

  // 2. Apply cumulative treatment stages completed before currentStageIndex
  for (let i = 0; i < currentStageIndex && i < allStages.length; i++) {
    const st = allStages[i];
    if (!st) continue;
    const act = normalizeActionType(st.actionType, st.stageName);
    const teeth = expandBridgeSpanTeeth(st.teeth || [], act, extracted);

    for (const fdi of teeth) {
      if (act === "extraction") {
        extracted.add(fdi);
        preppedAmount.delete(fdi);
        cariesAmount.delete(fdi);
        cappedMode.delete(fdi);
        prostheticMode.delete(fdi);
      } else if (act === "implant") {
        extracted.add(fdi);
        implanted.add(fdi);
        if (!(activeAction === "abutment" && activeStageTeeth.has(fdi))) {
          abutted.add(fdi);
          prostheticMode.set(fdi, "crown");
        } else {
          prostheticMode.delete(fdi);
        }
      } else if (act === "abutment") {
        extracted.add(fdi);
        implanted.add(fdi);
        abutted.add(fdi);
        prostheticMode.set(fdi, "crown");
      } else if (act === "temporary_denture") {
        cariesAmount.delete(fdi);
        prostheticMode.set(fdi, "temp");
      } else if (act === "veneer") {
        cariesAmount.delete(fdi);
        if (!extracted.has(fdi)) preppedAmount.set(fdi, 0.18);
        prostheticMode.set(fdi, "veneer");
      } else if (act === "crown" || act === "permanent_bridge") {
        cariesAmount.delete(fdi);
        if (!extracted.has(fdi)) preppedAmount.set(fdi, 0.45);
        prostheticMode.set(fdi, "crown");
      } else if (act === "filling" || act === "sealant" || act === "root_canal") {
        cariesAmount.delete(fdi);
      } else if (act === "scaling" || act === "cleaning" || act === "whitening") {
        cariesAmount.delete(fdi);
      }
    }
  }

  // 3. Apply cumulative per-tooth shader masks & spawn persistent prosthetic meshes
  const applyToArch = (arch: ArchBinding | null) => {
    if (!arch) return;
    arch.islands.forEach((isl, fdi) => {
      const isExt = extracted.has(fdi);
      const prepVal = isExt ? 0.0 : (preppedAmount.get(fdi) ?? 0.0);
      const cariesVal = isExt ? 0.0 : (cariesAmount.get(fdi) ?? 0.0);
      arch.uniforms.uToothState.value[isl.slot]?.set(
        isExt ? 1.0 : 0.0,
        prepVal,
        cariesVal,
        0.0
      );

      const pMode = prostheticMode.get(fdi);
      if (implanted.has(fdi)) {
        const imp = makeImplantFixture(isl, true);
        imp.position.copy(isl.localCervical);
        imp.visible = !pMode;
        arch.anchorGroup.add(imp);
      }
      if (abutted.has(fdi)) {
        const abut = makeAbutment(isl, true);
        abut.position.copy(isl.localCervical);
        abut.visible = !pMode;
        arch.anchorGroup.add(abut);
      }
      if (pMode) {
        const crown = makeAnatomicalToothMesh(isl, pMode, true);
        crown.position.copy(isl.localCenter);
        arch.anchorGroup.add(crown);
      } else if (cappedMode.has(fdi)) {
        const isSealant = cappedMode.get(fdi) ?? false;
        const cap = makeCoreCap(
          isl.localRadius * 0.48,
          true,
          fdi,
          isSealant,
          isl.localCrownAxis
        );
        cap.position.copy(isl.localOcclusal);
        arch.anchorGroup.add(cap);
      }
    });
  };

  applyToArch(controller.upperArch);
  applyToArch(controller.lowerArch);
  return extracted;
}

// ============================================================================
// CAMERA & JAW CHOREOGRAPHY HELPERS
// ============================================================================

export type StageCameraMode =
  | "occlusal"
  | "extraction"
  | "section"
  | "facial"
  | "arch"
  | "sinus";

function computeStageCameraFrame(
  frames: ResolvedFdiFrame[],
  defaultPos: THREE.Vector3,
  defaultTarget: THREE.Vector3,
  mode: StageCameraMode
) {
  if (!frames.length || mode === "arch") {
    return {
      pos: defaultPos.clone(),
      target: defaultTarget.clone(),
      jawAngle: 0.22,
    };
  }

  // Maxillary sinus lift & bone graft: always frame from lateral buccal cheek profile
  if (mode === "sinus" && frames.length) {
    const allSameSide = frames.every((f) => f.right === frames[0]!.right);
    const primary = frames[0]!;
    const buccalX = primary.right ? -1 : 1;
    // Predominantly lateral (94%), slightly inferior looking upward into the sinus floor (-0.08), slightly anterior looking posteromedially (0.34)
    const sideDir = new THREE.Vector3(buccalX * 0.94, -0.08, 0.34).normalize();

    if (frames.length === 1 || !allSameSide) {
      return {
        pos: primary.worldCervical.clone().addScaledVector(sideDir, 0.068),
        target: primary.worldCervical.clone(),
        jawAngle: 0.32,
      };
    }

    const box = new THREE.Box3();
    for (const f of frames) {
      box.expandByPoint(f.worldCervical);
    }
    const center = box.getCenter(new THREE.Vector3());
    const span = box.getSize(new THREE.Vector3()).length();
    const dist = THREE.MathUtils.clamp(span * 1.35 + 0.058, 0.068, 0.098);

    return {
      pos: center.clone().addScaledVector(sideDir, dist),
      target: center,
      jawAngle: 0.32,
    };
  }

  if (frames.length === 1) {
    const f = frames[0]!;
    const buccalX = f.right ? -1 : 1;
    const occlusalY = f.upper ? -1 : 1; // -1 for upper (camera below looking up), +1 for lower
    const toothIdx = Math.abs(Number(f.fdi)) % 10;
    const isPosteriorSide = toothIdx >= 4;
    const elev = THREE.MathUtils.degToRad(
      mode === "extraction"
        ? f.upper
          ? 36
          : 12
        : mode === "section"
          ? 28
          : mode === "facial"
            ? 14
            : 30
    );
    const yaw = THREE.MathUtils.degToRad(
      isPosteriorSide
        ? 78
        : mode === "facial"
          ? 18
          : mode === "extraction"
            ? 28
            : 34
    );
    const verticalSign =
      mode === "extraction" ? (f.upper ? -1 : -0.35) : occlusalY;
    const lateralWeight = isPosteriorSide ? 0.98 : 0.82;
    const dir = new THREE.Vector3(
      buccalX * Math.cos(elev) * lateralWeight,
      verticalSign * Math.sin(elev),
      Math.cos(elev) * Math.cos(yaw)
    ).normalize();
    const dist =
      mode === "section"
        ? 0.068
        : mode === "facial"
          ? 0.074
          : mode === "extraction"
            ? 0.074
            : 0.072;
    return {
      pos: f.worldCenter.clone().addScaledVector(dir, dist),
      target: f.worldCenter.clone(),
      jawAngle: mode === "facial" ? 0.16 : 0.34,
    };
  }

  // Multi-tooth stage framing: compute bounding center & span of active teeth
  const box = new THREE.Box3();
  for (const f of frames) {
    box.expandByPoint(f.worldCenter);
  }
  const center = box.getCenter(new THREE.Vector3());
  const span = box.getSize(new THREE.Vector3()).length();
  const isUpper = frames[0]!.upper;

  // Check if all teeth in this stage are on one lateral side (e.g. 14-15-16 bridge on the right)
  const allSameSide = frames.every((f) => f.right === frames[0]!.right);
  const avgToothIdx =
    frames.reduce((sum, f) => sum + (Math.abs(Number(f.fdi)) % 10), 0) /
    frames.length;

  if (allSameSide && avgToothIdx >= 3) {
    const buccalX = frames[0]!.right ? -1 : 1;
    const sideDist = THREE.MathUtils.clamp(span * 1.45 + 0.056, 0.078, 0.118);
    const verticalTilt =
      mode === "extraction"
        ? isUpper
          ? -0.38
          : -0.14
        : isUpper
          ? -0.18
          : 0.18;
    const sideDir = new THREE.Vector3(
      buccalX * 0.97,
      verticalTilt,
      0.18
    ).normalize();

    return {
      pos: center.clone().addScaledVector(sideDir, sideDist),
      target: center,
      jawAngle: 0.34,
    };
  }

  const dist = THREE.MathUtils.clamp(span * 1.65 + 0.055, 0.078, 0.135);
  const yOffset =
    mode === "extraction"
      ? isUpper
        ? -dist * 0.46
        : -dist * 0.14
      : isUpper
        ? -dist * 0.38
        : dist * 0.32;

  return {
    pos: new THREE.Vector3(
      center.x * 1.35,
      center.y + yOffset,
      center.z + dist * 0.92
    ),
    target: center,
    jawAngle: 0.32,
  };
}

// ============================================================================
// MASTER STAGE CHOREOGRAPHY DISPATCHER (Task 2)
// ============================================================================

export function playTreatmentStage(
  stage: AnimationTimelineStage,
  context: MouthSceneContext,
  allStages: AnimationTimelineStage[] = [],
  stageIndex = 0,
  onComplete?: () => void,
  conditions?: Record<string, string>
): gsap.core.Timeline {
  const { controller, camera, controls, pivotHinge, defaultCamPos, defaultCamTarget } =
    context;

  if (controller.activeTimeline) {
    controller.activeTimeline.kill();
    controller.activeTimeline = null;
  }

  // 1. Apply baseline diagnosis (`conditions`) and persistent state from prior stages (< stageIndex)
  const extractedSoFar = syncCompletedStateBeforeStage(
    context,
    allStages,
    stageIndex,
    conditions,
    stage
  );

  const action = normalizeActionType(stage.actionType, stage.stageName);
  const defaultActionTeeth =
    action === "healing" || action === "xray"
      ? []
      : action === "veneer" || action === "whitening"
        ? ["13", "12", "11", "21", "22", "23"]
        : action === "scaling" || action === "cleaning"
          ? ["33", "32", "31", "41", "42", "43"]
          : action === "permanent_bridge" || action === "temporary_denture"
            ? ["14", "15", "16"]
            : action === "sinus_graft"
              ? ["16"]
              : ["16"];

  const baseTeeth =
    stage.teeth && stage.teeth.length > 0 ? stage.teeth : defaultActionTeeth;
  const rawTeeth = expandBridgeSpanTeeth(baseTeeth, action, extractedSoFar);

  // Ensure jaw is at target angle before sampling world-space camera targets so lower jaw points match!
  const targetJawAngle =
    action === "healing" || action === "xray"
      ? 0.22
      : action === "veneer" ||
          action === "whitening" ||
          action === "scaling" ||
          action === "cleaning"
        ? 0.18
        : action === "crown"
          ? 0.24
          : 0.34;

  const prevJawAngle = pivotHinge ? pivotHinge.rotation.x : DEFAULT_OPEN_ANGLE;
  if (pivotHinge) {
    pivotHinge.rotation.x = targetJawAngle;
    controller.root.updateMatrixWorld(true);
  }

  const frames = rawTeeth
    .map((t) => calculateLocalFdiFrame(controller, t))
    .filter((f): f is ResolvedFdiFrame => f !== null);

  if (pivotHinge) {
    pivotHinge.rotation.x = prevJawAngle;
    controller.root.updateMatrixWorld(true);
  }

  const camMode: StageCameraMode =
    action === "extraction"
      ? "extraction"
      : action === "root_canal"
        ? "section"
        : action === "veneer" ||
            action === "whitening" ||
            action === "scaling" ||
            action === "cleaning"
          ? "facial"
          : action === "healing" || action === "xray"
            ? "arch"
            : action === "sinus_graft"
              ? "sinus"
              : "occlusal";

  const camFrame = computeStageCameraFrame(
    frames,
    defaultCamPos,
    defaultCamTarget,
    camMode
  );

  const tl = gsap.timeline({
    defaults: { ease: EASE },
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });

  // Phase 0: Smooth dynamic jaw opening & clinical camera framing
  if (pivotHinge) {
    tl.to(
      pivotHinge.rotation,
      {
        x: targetJawAngle,
        duration: 0.75,
        onUpdate: () => {
          controller.root.updateMatrixWorld(true);
        },
      },
      0
    );
  }

  tl.to(
    camera.position,
    {
      x: camFrame.pos.x,
      y: camFrame.pos.y,
      z: camFrame.pos.z,
      duration: 0.9,
    },
    0
  );
  tl.to(
    controls.target,
    {
      x: camFrame.target.x,
      y: camFrame.target.y,
      z: camFrame.target.z,
      duration: 0.9,
    },
    0
  );

  const primary = frames[0] ?? null;

  if (primary) {
    const u = primary.arch.uniforms;
    u.uFocus.value.copy(primary.worldCenter);
    u.uRadius.value = primary.worldRadius * 1.15;
    u.uFdiCenter.value.copy(primary.worldCenter);
    u.uFdiRadius.value = primary.worldRadius * 1.1;
  }

  // Dispatch 4-phase sequential tooth-by-tooth clinical animation by actionType
  switch (action) {
    case "extraction":
      buildExtractionChoreography(tl, frames, controller, camera, controls, camMode);
      break;
    case "implant":
      buildImplantChoreography(tl, frames, camera, controls, camMode);
      break;
    case "abutment":
      buildAbutmentChoreography(tl, frames, camera, controls, camMode);
      break;
    case "root_canal":
      buildRootCanalChoreography(tl, frames, camera, controls);
      break;
    case "filling":
    case "sealant":
      buildFillingChoreography(
        tl,
        frames,
        action === "sealant",
        camera,
        controls,
        camMode
      );
      break;
    case "veneer":
      buildVeneerChoreography(tl, frames, camera, controls);
      break;
    case "crown":
    case "permanent_bridge":
    case "temporary_denture":
      buildProstheticChoreography(tl, frames, action, camera, controls, camMode);
      break;
    case "scaling":
    case "cleaning":
      buildScalingChoreography(tl, frames, camera, controls);
      break;
    case "whitening":
      buildWhiteningChoreography(tl, frames, controller, camera, controls);
      break;
    case "xray":
      buildXRayChoreography(tl, controller, camera, defaultCamPos);
      break;
    case "sinus_graft":
      buildSinusGraftChoreography(tl, frames, camera, controls, camMode);
      break;
    case "healing":
    default:
      buildHealingChoreography(tl, controller, camera, defaultCamPos);
      break;
  }

  // If multiple teeth were treated sequentially, smoothly pull the camera back to frame all treated teeth together
  const seqEnd = tl.duration();
  if (frames.length > 1 && seqEnd > 1.0 && action !== "sinus_graft") {
    tl.to(
      camera.position,
      {
        x: camFrame.pos.x,
        y: camFrame.pos.y,
        z: camFrame.pos.z,
        duration: 0.65,
        ease: "power2.out",
      },
      seqEnd
    );
    tl.to(
      controls.target,
      {
        x: camFrame.target.x,
        y: camFrame.target.y,
        z: camFrame.target.z,
        duration: 0.65,
        ease: "power2.out",
      },
      seqEnd
    );
  }

  // Final clinical inspection hold so the completed stage result stays visible before advancing
  tl.to({}, { duration: 0.9 });

  // Scale timeline to match stage.durationSeconds so audio/scrubber stays in lockstep
  const targetDuration = Math.max(5.5, stage.durationSeconds || 8.0);
  const rawDuration = tl.duration();
  if (rawDuration > 0.1) {
    tl.timeScale(rawDuration / targetDuration);
  }

  controller.activeTimeline = tl;
  return tl;
}

/**
 * Smoothly pans/tracks the camera to focus on the currently active tooth `f` during a multi-tooth sequential stage.
 */
function focusCameraOnTooth(
  tl: gsap.core.Timeline,
  f: ResolvedFdiFrame,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  mode: StageCameraMode,
  at: number,
  dur = 0.38
) {
  if (mode === "sinus") {
    const buccalX = f.right ? -1 : 1;
    const sideDir = new THREE.Vector3(buccalX * 0.94, -0.08, 0.34).normalize();
    const targetPos = f.worldCervical.clone().addScaledVector(sideDir, 0.068);

    tl.to(
      camera.position,
      {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: dur,
        ease: "power2.out",
      },
      at
    );
    tl.to(
      controls.target,
      {
        x: f.worldCervical.x,
        y: f.worldCervical.y,
        z: f.worldCervical.z,
        duration: dur,
        ease: "power2.out",
      },
      at
    );
    return;
  }

  const buccalX = f.right ? -1 : 1;
  const occlusalY = f.upper ? -1 : 1;
  const toothIdx = Math.abs(Number(f.fdi)) % 10;
  const isPosteriorSide = toothIdx >= 4;
  const elev = THREE.MathUtils.degToRad(
    mode === "extraction"
      ? f.upper
        ? 36
        : 12
      : mode === "section"
        ? 26
        : mode === "facial"
          ? 14
          : 28
  );
  const yaw = THREE.MathUtils.degToRad(
    isPosteriorSide
      ? 78
      : mode === "facial"
        ? 18
        : mode === "extraction"
          ? 28
          : 32
  );
  const verticalSign =
    mode === "extraction" ? (f.upper ? -1 : -0.35) : occlusalY;
  const lateralWeight = isPosteriorSide ? 0.98 : 0.8;
  const dir = new THREE.Vector3(
    buccalX * Math.cos(elev) * lateralWeight,
    verticalSign * Math.sin(elev),
    Math.cos(elev) * Math.cos(yaw)
  ).normalize();
  const dist =
    mode === "section"
      ? 0.072
      : mode === "facial"
        ? 0.082
        : mode === "extraction"
          ? 0.078
          : 0.08;
  const targetPos = f.worldCenter.clone().addScaledVector(dir, dist);

  tl.to(
    camera.position,
    {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: dur,
      ease: "power2.out",
    },
    at
  );
  tl.to(
    controls.target,
    {
      x: f.worldCenter.x,
      y: f.worldCenter.y,
      z: f.worldCenter.z,
      duration: dur,
      ease: "power2.out",
    },
    at
  );
}

// ============================================================================
// INDIVIDUAL TREATMENT CHOREOGRAPHY BUILDERS (All 10 Clinical Treatments)
// Sequential Tooth-by-Tooth Execution
// ============================================================================

/**
 * 1. EXTRACTION (Diş Çekimi - Sıralı Tek Tek Diş Çekimi):
 * For each selected tooth `f` in `frames` sequentially:
 * Camera focuses on `f` -> red scan pulse -> swap unified arch tooth + saliva shell to sculpted 1:1 `fullToothGeo` proxy ->
 * surgical forceps (`makeForceps`) approach `f`, open beaks, clamp crown, luxate bucco-lingually, and extract `f`
 * before moving to the next tooth `f+1`.
 */
function buildExtractionChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  controller: MouthCinematicController,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  camMode: StageCameraMode
) {
  if (!frames.length) return;

  const primary = frames[0]!;
  const forceps = makeForceps(primary.island.localRadius * 1.45);
  forceps.visible = false;
  primary.arch.anchorGroup.add(forceps);

  const toothStep = frames.length === 1 ? 2.4 : Math.max(0.85, Math.min(1.65, 9.0 / frames.length));

  frames.forEach((f, idx) => {
    const seqStart = 0.5 + idx * toothStep;
    f.arch.uniforms.uScanColor.value.setHex(0xef4444);

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        camMode,
        seqStart,
        Math.min(0.35, toothStep * 0.3)
      );
    }

    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      tl.to(st, { w: 1.0, duration: toothStep * 0.18 }, seqStart);
    }
    tl.to(
      f.arch.uniforms.uPulse,
      { value: 2.0, duration: toothStep * 0.25, ease: "sine.inOut" },
      seqStart
    );

    const proxy = makeAnatomicalToothMesh(f.island, "extraction_proxy", false);
    proxy.position.copy(f.island.localCenter);
    proxy.visible = false;
    f.arch.anchorGroup.add(proxy);

    const gripAt = seqStart + toothStep * 0.18;
    const luxateAt = seqStart + toothStep * 0.38;
    const pullAt = seqStart + toothStep * 0.65;

    const approachPos = f.island.localCrownCenter
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 2.3);
    const gripPos = f.island.localCrownCenter.clone();
    const pullVec = f.island.localCrownAxis
      .clone()
      .multiplyScalar(f.island.localRadius * 3.1);
    const extractPos = gripPos
      .clone()
      .add(pullVec)
      .add(new THREE.Vector3(0, f.island.localRadius * 0.6, 0));

    const leftBeak = forceps.userData.leftBeak as THREE.Object3D | undefined;
    const rightBeak = forceps.userData.rightBeak as THREE.Object3D | undefined;

    tl.add(() => {
      proxy.visible = true;
      if (st) {
        st.x = 1.0; // Hide unified arch tooth + saliva shell as sculpted proxy takes over
        st.w = 0.0;
      }
      if (forceps.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(forceps);
      }
      forceps.visible = true;
      forceps.rotation.set(0, 0, 0);
      forceps.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        f.island.localCrownAxis
      );
      forceps.position.copy(approachPos);
      if (leftBeak && rightBeak) {
        leftBeak.rotation.z = -0.26;
        rightBeak.rotation.z = 0.26;
      }
    }, gripAt);

    // Forceps descend onto tooth `f` and clamp beaks
    tl.to(
      forceps.position,
      {
        x: gripPos.x,
        y: gripPos.y,
        z: gripPos.z,
        duration: toothStep * 0.18,
        ease: "power2.out",
      },
      gripAt
    );

    if (leftBeak && rightBeak) {
      tl.to(leftBeak.rotation, { z: 0.04, duration: toothStep * 0.1 }, gripAt + toothStep * 0.1);
      tl.to(rightBeak.rotation, { z: -0.04, duration: toothStep * 0.1 }, gripAt + toothStep * 0.1);
    }

    // Luxation (bucco-lingual loosening rock on tooth `f`)
    tl.to(
      proxy.rotation,
      {
        y: 0.15,
        x: 0.08,
        duration: toothStep * 0.08,
        yoyo: true,
        repeat: 3,
        ease: "sine.inOut",
      },
      luxateAt
    );

    // Extract tooth `f` along anatomical crown axis and fade out
    tl.to(
      proxy.position,
      {
        x: f.island.localCenter.x + pullVec.x,
        y: f.island.localCenter.y + pullVec.y + f.island.localRadius * 0.6,
        z: f.island.localCenter.z + pullVec.z,
        duration: toothStep * 0.28,
        ease: "power2.in",
      },
      pullAt
    );
    tl.to(
      forceps.position,
      {
        x: extractPos.x,
        y: extractPos.y,
        z: extractPos.z,
        duration: toothStep * 0.28,
        ease: "power2.in",
      },
      pullAt
    );

    proxy.traverse((child) => {
      const m = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial | undefined;
      if (m && "opacity" in m) {
        tl.to(m, { opacity: 0, duration: toothStep * 0.16 }, pullAt + toothStep * 0.12);
      }
    });

    tl.add(() => {
      proxy.visible = false;
      if (idx === frames.length - 1) {
        forceps.visible = false;
      }
    }, seqStart + toothStep * 0.96);
  });

  void controller;
}

/**
 * 2. DENTAL IMPLANT (İmplant Yerleştirimi - Sıralı Tek Tek İmplant + Abutment + Üst Kuron Diş Uygulaması):
 * For each selected tooth `f` in `frames` sequentially:
 * Camera focuses on `f` -> surgical osteotomy drill (`makeSurgicalDrill`) drills `f`'s socket along `localRootAxis` ->
 * drill withdraws -> titanium implant fixture (`makeImplantFixture`) threads into `f`'s socket ->
 * titanium abutment (`makeAbutment`) connects -> anatomical implant crown (`makeAnatomicalToothMesh`) seats on top
 * so the tooth is fully restored at the end of the stage -> moves to next tooth `f+1`.
 */
function buildImplantChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  camMode: StageCameraMode
) {
  if (!frames.length) return;

  const gums = new Set<THREE.Mesh>();
  for (const f of frames) {
    f.arch.uniforms.uScanColor.value.setHex(0x38bdf8);
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      st.x = 1.0;
    }
    if (f.arch.gumsMesh) {
      gums.add(f.arch.gumsMesh);
    }
  }

  const primary = frames[0]!;
  const drill = makeSurgicalDrill(primary.island.localRadius * 1.35);
  drill.visible = false;
  primary.arch.anchorGroup.add(drill);
  const drillSpinner = drill.userData.spinner as THREE.Object3D | undefined;

  const toothStep =
    frames.length === 1 ? 3.2 : Math.max(1.45, Math.min(2.4, 10.5 / frames.length));
  const totalSeqDur = 0.55 + frames.length * toothStep;

  gums.forEach((gumMesh) => {
    const mat = gumMesh.material as THREE.MeshPhysicalMaterial | undefined;
    if (mat && "opacity" in mat) {
      mat.transparent = true;
      tl.to(mat, { opacity: 0.48, duration: 0.45 }, 0.25);
      tl.to(
        mat,
        {
          opacity: 1.0,
          duration: 0.45,
          onComplete: () => {
            mat.transparent = false;
          },
        },
        totalSeqDur
      );
    }
  });

  frames.forEach((f, idx) => {
    const seqStart = 0.55 + idx * toothStep;
    const st = f.arch.uniforms.uToothState.value[f.island.slot];

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        camMode,
        seqStart,
        Math.min(0.35, toothStep * 0.22)
      );
    }

    if (st) {
      tl.to(st, { w: 0.9, duration: toothStep * 0.12 }, seqStart);
    }

    // Clean up any prior implant/abutment/crown on this tooth before starting
    for (const prefix of [
      "prop_perm_implant_",
      "prop_perm_abutment_",
      "prop_perm_prosthetic_",
    ]) {
      const prev = f.arch.anchorGroup.getObjectByName(`${prefix}${f.fdi}`);
      if (prev) {
        f.arch.anchorGroup.remove(prev);
        disposeObject3D(prev);
      }
    }

    // Sub-step A (0% -> 34%): Surgical osteotomy drill prepares socket on tooth `f`
    const entryPos = f.island.localCervical
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 1.45);
    const depthPos = f.island.localCervical
      .clone()
      .addScaledVector(f.island.localRootAxis, f.island.localRadius * 0.28);

    tl.add(() => {
      if (drill.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(drill);
      }
      drill.visible = true;
      drill.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        f.island.localRootAxis
      );
      drill.position.copy(entryPos);
    }, seqStart);

    if (drillSpinner) {
      tl.to(
        drillSpinner.rotation,
        {
          y: `+=${Math.PI * 14}`,
          duration: toothStep * 0.34,
          ease: "none",
        },
        seqStart
      );
    }

    tl.to(
      drill.position,
      {
        x: depthPos.x,
        y: depthPos.y,
        z: depthPos.z,
        duration: toothStep * 0.16,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      },
      seqStart + toothStep * 0.02
    );

    // Sub-step B (35% -> 68%): Titanium implant fixture threads into tooth `f`'s prepared socket + abutment seats
    const fixtureAt = seqStart + toothStep * 0.35;
    const fixture = makeImplantFixture(f.island, true);
    const startPos = f.island.localCervical
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 1.75);
    fixture.position.copy(startPos);
    fixture.visible = false;
    f.arch.anchorGroup.add(fixture);

    tl.add(() => {
      drill.visible = false;
      fixture.visible = true;
    }, fixtureAt);

    tl.to(
      fixture.position,
      {
        x: f.island.localCervical.x,
        y: f.island.localCervical.y,
        z: f.island.localCervical.z,
        duration: toothStep * 0.3,
        ease: "power2.out",
      },
      fixtureAt
    );

    const spinner = fixture.userData.spinner as THREE.Object3D | undefined;
    if (spinner) {
      tl.to(
        spinner.rotation,
        {
          y: Math.PI * 6,
          duration: toothStep * 0.3,
          ease: "power2.out",
        },
        fixtureAt
      );
    }

    const abutAt = seqStart + toothStep * 0.56;
    const abut = makeAbutment(f.island, true);
    const abutStartPos = f.island.localCervical
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 1.35);
    abut.position.copy(abutStartPos);
    abut.visible = false;
    f.arch.anchorGroup.add(abut);

    tl.add(() => {
      abut.visible = true;
    }, abutAt);
    tl.to(
      abut.position,
      {
        x: f.island.localCervical.x,
        y: f.island.localCervical.y,
        z: f.island.localCervical.z,
        duration: toothStep * 0.16,
        ease: "back.out(1.2)",
      },
      abutAt
    );

    // Sub-step C (72% -> 98%): Implant-supported anatomical tooth crown seats onto the abutment
    const crownAt = seqStart + toothStep * 0.72;
    const crownDur = toothStep * 0.24;
    const sign = f.upper ? 1 : -1;
    const crown = makeAnatomicalToothMesh(f.island, "crown", true);
    const offsetZ = sign * f.island.localRadius * 2.1;
    crown.position.set(
      f.island.localCenter.x,
      f.island.localCenter.y,
      f.island.localCenter.z + offsetZ
    );
    crown.visible = false;
    f.arch.anchorGroup.add(crown);

    tl.add(() => {
      crown.visible = true;
    }, crownAt);

    tl.to(
      crown.position,
      {
        x: f.island.localCenter.x,
        y: f.island.localCenter.y,
        z: f.island.localCenter.z,
        duration: crownDur,
        ease: "power3.out",
      },
      crownAt
    );

    tl.add(() => {
      fixture.visible = false;
      abut.visible = false;
    }, crownAt + crownDur * 0.78);

    const crownMat = crown.userData.crownMat as THREE.MeshPhysicalMaterial | undefined;
    if (crownMat) {
      tl.to(
        crownMat,
        {
          emissiveIntensity: 0.4,
          duration: toothStep * 0.06,
          yoyo: true,
          repeat: 1,
        },
        crownAt + crownDur * 0.85
      );
    }

    if (st) {
      tl.to(st, { w: 0.0, duration: toothStep * 0.12 }, seqStart + toothStep * 0.88);
    }
  });
}

/**
 * 3. ABUTMENT (İmplant Abutment / Dayanak Bağlantısı + Üst Yapı Diş Yerleşimi):
 * For each selected tooth `f` in `frames` sequentially:
 * Camera focuses on `f` -> gold/titanium abutment (`makeAbutment`) + spinning surgical hex driver (`makeHexDriver`)
 * descend onto `f`'s implant platform and torque it into place -> hex driver withdraws ->
 * anatomical tooth crown (`makeAnatomicalToothMesh`) seats onto the abutment so the tooth is restored at the end ->
 * moves to next tooth `f+1`.
 */
function buildAbutmentChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  camMode: StageCameraMode
) {
  if (!frames.length) return;

  const gums = new Set<THREE.Mesh>();
  frames.forEach((f) => {
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      st.x = 1.0;
    }
    if (f.arch.gumsMesh) gums.add(f.arch.gumsMesh);

    const prevCrown = f.arch.anchorGroup.getObjectByName(`prop_perm_prosthetic_${f.fdi}`);
    if (prevCrown) {
      f.arch.anchorGroup.remove(prevCrown);
      disposeObject3D(prevCrown);
    }

    let imp = f.arch.anchorGroup.getObjectByName(`prop_perm_implant_${f.fdi}`);
    if (!imp) {
      imp = makeImplantFixture(f.island, true);
      imp.position.copy(f.island.localCervical);
      f.arch.anchorGroup.add(imp);
    }
    imp.visible = true;
  });

  const primary = frames[0]!;
  const hexDriver = makeHexDriver(primary.island.localRadius * 1.25);
  hexDriver.visible = false;
  primary.arch.anchorGroup.add(hexDriver);
  const driverSpinner = hexDriver.userData.spinner as THREE.Object3D | undefined;

  const toothStep =
    frames.length === 1 ? 2.7 : Math.max(1.25, Math.min(2.1, 9.5 / frames.length));
  const totalSeqDur = 0.55 + frames.length * toothStep;

  gums.forEach((gumMesh) => {
    const mat = gumMesh.material as THREE.MeshPhysicalMaterial | undefined;
    if (mat && "opacity" in mat) {
      mat.transparent = true;
      tl.to(mat, { opacity: 0.58, duration: 0.4 }, 0.25);
      tl.to(
        mat,
        {
          opacity: 1.0,
          duration: 0.45,
          onComplete: () => {
            mat.transparent = false;
          },
        },
        totalSeqDur
      );
    }
  });

  frames.forEach((f, idx) => {
    const seqStart = 0.55 + idx * toothStep;
    const st = f.arch.uniforms.uToothState.value[f.island.slot];

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        camMode,
        seqStart,
        Math.min(0.32, toothStep * 0.24)
      );
    }

    if (st) {
      tl.to(st, { w: 0.75, duration: toothStep * 0.14 }, seqStart);
    }

    const prevAbut = f.arch.anchorGroup.getObjectByName(`prop_perm_abutment_${f.fdi}`);
    if (prevAbut) {
      f.arch.anchorGroup.remove(prevAbut);
      disposeObject3D(prevAbut);
    }

    // Sub-step A (0% -> 58%): Multi-Unit Abutment + spinning hex driver torque onto implant
    const abut = makeAbutment(f.island, true);
    const startPos = f.island.localCervical
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 1.65);
    const driverStartPos = startPos
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 0.55);
    const driverSeatedPos = f.island.localCervical
      .clone()
      .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 0.55);

    abut.position.copy(startPos);
    abut.visible = false;
    f.arch.anchorGroup.add(abut);

    tl.add(() => {
      abut.visible = true;
      if (hexDriver.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(hexDriver);
      }
      hexDriver.visible = true;
      hexDriver.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        f.island.localCrownAxis
      );
      hexDriver.position.copy(driverStartPos);
    }, seqStart);

    if (driverSpinner) {
      tl.to(
        driverSpinner.rotation,
        {
          y: `+=${Math.PI * 10}`,
          duration: toothStep * 0.55,
          ease: "none",
        },
        seqStart
      );
    }

    tl.to(
      abut.position,
      {
        x: f.island.localCervical.x,
        y: f.island.localCervical.y,
        z: f.island.localCervical.z,
        duration: toothStep * 0.48,
        ease: "back.out(1.2)",
      },
      seqStart
    );

    tl.to(
      hexDriver.position,
      {
        x: driverSeatedPos.x,
        y: driverSeatedPos.y,
        z: driverSeatedPos.z,
        duration: toothStep * 0.48,
        ease: "power2.out",
      },
      seqStart
    );

    const spinner = abut.userData.spinner as THREE.Object3D | undefined;
    if (spinner) {
      tl.to(
        spinner.rotation,
        {
          y: Math.PI * 5,
          duration: toothStep * 0.48,
        },
        seqStart
      );
    }

    // Sub-step B (60% -> 96%): Hex driver withdraws and anatomical prosthetic tooth crown seats onto the abutment
    const crownAt = seqStart + toothStep * 0.6;
    const crownDur = toothStep * 0.32;
    const sign = f.upper ? 1 : -1;
    const crown = makeAnatomicalToothMesh(f.island, "crown", true);
    const offsetZ = sign * f.island.localRadius * 2.1;
    crown.position.set(
      f.island.localCenter.x,
      f.island.localCenter.y,
      f.island.localCenter.z + offsetZ
    );
    crown.visible = false;
    f.arch.anchorGroup.add(crown);

    tl.add(() => {
      hexDriver.visible = false;
      crown.visible = true;
    }, crownAt);

    tl.to(
      crown.position,
      {
        x: f.island.localCenter.x,
        y: f.island.localCenter.y,
        z: f.island.localCenter.z,
        duration: crownDur,
        ease: "power3.out",
      },
      crownAt
    );

    tl.add(() => {
      const imp = f.arch.anchorGroup.getObjectByName(`prop_perm_implant_${f.fdi}`);
      if (imp) imp.visible = false;
      abut.visible = false;
    }, crownAt + crownDur * 0.78);

    const crownMat = crown.userData.crownMat as THREE.MeshPhysicalMaterial | undefined;
    if (crownMat) {
      tl.to(
        crownMat,
        {
          emissiveIntensity: 0.4,
          duration: toothStep * 0.07,
          yoyo: true,
          repeat: 1,
        },
        crownAt + crownDur * 0.85
      );
    }

    if (st) {
      tl.to(st, { w: 0.0, duration: toothStep * 0.14 }, seqStart + toothStep * 0.86);
    }
  });
}

/**
 * 4. ROOT CANAL / ENDODONTICS (Kanal Tedavisi - Sıralı Tek Tek Kök Kanal Tedavisi):
 * For each selected tooth `f` in `frames` sequentially:
 * Camera focuses on `f` -> longitudinal cross-section opens on `f` (`uSection: 0 -> 1`) ->
 * crimson inflamed pulp pulses -> rotary Ni-Ti file (`makeFile`) enters `f`'s root canal, spins, and disinfects ->
 * gutta-percha cone (`makeGutta`) obturates `f`'s canal -> coronal composite seal (`makeCoreCap`) places ->
 * cross-section closes before moving to the next tooth `f+1`.
 */
function buildRootCanalChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 }
) {
  if (!frames.length) return;

  const gums = new Set<THREE.Mesh>();
  for (const f of frames) {
    if (f.arch.gumsMesh) {
      gums.add(f.arch.gumsMesh);
    }
  }

  const toothStep = frames.length === 1 ? 3.6 : Math.max(2.1, Math.min(3.2, 11.0 / frames.length));
  const totalSeqDur = 0.45 + frames.length * toothStep;

  // Make gingiva semi-transparent during endodontics so the full root canal inside the gum is clearly visible!
  gums.forEach((gumMesh) => {
    const mat = gumMesh.material as THREE.MeshPhysicalMaterial | undefined;
    if (mat && "opacity" in mat) {
      mat.transparent = true;
      tl.to(mat, { opacity: 0.36, duration: 0.45 }, 0.3);
      tl.to(mat, { opacity: 1.0, duration: 0.45 }, totalSeqDur);
    }
  });

  frames.forEach((f, idx) => {
    const seqStart = 0.45 + idx * toothStep;
    const u = f.arch.uniforms;
    const isl = f.island;
    const st = u.uToothState.value[isl.slot];

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        "section",
        seqStart,
        Math.min(0.38, toothStep * 0.2)
      );
    }

    const canalVec = isl.localApex.clone().sub(isl.localOcclusal);
    const canalLen = Math.max(0.55, canalVec.length() * 0.92);
    const canalAxis = canalVec.clone().normalize();

    const file = makeFile(canalLen, isl.localRadius * 0.085);
    file.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), canalAxis);
    const fileHoverPos = isl.localOcclusal
      .clone()
      .addScaledVector(canalAxis, -canalLen * 0.85);
    const fileOrificePos = isl.localOcclusal
      .clone()
      .addScaledVector(canalAxis, -canalLen * 0.18);
    const fileDeepPos = isl.localOcclusal
      .clone()
      .addScaledVector(canalAxis, canalLen * 0.05);

    file.position.copy(fileHoverPos);
    file.visible = false;
    f.arch.anchorGroup.add(file);

    const gutta = makeGutta(canalLen * 0.88, isl.localRadius * 0.15);
    gutta.position.copy(isl.localApex);
    gutta.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      canalAxis.clone().negate()
    );
    gutta.scale.set(1, 0.001, 1);
    f.arch.anchorGroup.add(gutta);

    // Step 1 on tooth `f`: Activate longitudinal cross-section & pulse crimson pulp
    tl.add(() => {
      if (st) st.w = 1.0;
      u.uClean.value = 0.0;
    }, seqStart);
    tl.to(u.uSection, { value: 1.0, duration: toothStep * 0.14 }, seqStart);
    tl.to(
      u.uPulse,
      { value: 1.0, duration: toothStep * 0.08, yoyo: true, repeat: 3, ease: "sine.inOut" },
      seqStart + toothStep * 0.08
    );

    // Step 2 on tooth `f`: Rotary Ni-Ti file shapes and disinfects canal (`uClean: 0 -> 1`)
    const fileEnterAt = seqStart + toothStep * 0.25;
    tl.add(() => {
      file.visible = true;
    }, fileEnterAt);
    tl.to(
      file.position,
      {
        x: fileOrificePos.x,
        y: fileOrificePos.y,
        z: fileOrificePos.z,
        duration: toothStep * 0.08,
      },
      fileEnterAt
    );
    const fileSpinner = file.userData.spinner as THREE.Object3D | undefined;
    if (fileSpinner) {
      tl.to(
        fileSpinner.rotation,
        { y: Math.PI * 18, duration: toothStep * 0.36, ease: "none" },
        fileEnterAt
      );
    }
    tl.to(
      file.position,
      {
        x: fileDeepPos.x,
        y: fileDeepPos.y,
        z: fileDeepPos.z,
        duration: toothStep * 0.09,
        yoyo: true,
        repeat: 2,
        ease: "sine.inOut",
      },
      fileEnterAt + toothStep * 0.08
    );
    tl.to(
      u.uClean,
      { value: 1.0, duration: toothStep * 0.22 },
      fileEnterAt + toothStep * 0.12
    );
    tl.to(
      file.position,
      {
        x: fileHoverPos.x,
        y: fileHoverPos.y,
        z: fileHoverPos.z,
        duration: toothStep * 0.08,
      },
      seqStart + toothStep * 0.62
    );
    tl.add(() => {
      file.visible = false;
    }, seqStart + toothStep * 0.7);

    // Step 3 on tooth `f`: Gutta-percha obturation + close cross-section back to natural tooth anatomy
    const obturateAt = seqStart + toothStep * 0.68;
    tl.to(
      gutta.scale,
      { y: 1.0, duration: toothStep * 0.16, ease: "power2.out" },
      obturateAt
    );
    tl.to(gutta.material, { opacity: 0.96, duration: toothStep * 0.12 }, obturateAt);

    tl.add(() => {
      const prevCap = f.arch.anchorGroup.getObjectByName(`prop_perm_cap_${f.fdi}`);
      if (prevCap) {
        f.arch.anchorGroup.remove(prevCap);
        disposeObject3D(prevCap);
      }
    }, seqStart + toothStep * 0.82);

    tl.to(
      u.uSection,
      { value: 0.0, duration: toothStep * 0.12 },
      seqStart + toothStep * 0.85
    );
    tl.to(
      gutta.material,
      { opacity: 0.0, duration: toothStep * 0.1 },
      seqStart + toothStep * 0.86
    );
    tl.add(() => {
      gutta.visible = false;
      if (st) {
        st.z = 0.0;
        st.w = 0.0;
      }
    }, seqStart + toothStep * 0.98);
  });
}

/**
 * 5. KOMPOZİT DOLGU (`filling`) & 6. FİSSÜR ÖRTÜCÜ (`sealant`) - Sıralı Tek Tek Dolgu/Sealant:
 * For each selected tooth `f` in `frames` sequentially:
 * Camera focuses on `f` -> high-speed diamond bur (`makeDentalBur`) excavates caries/fissure on `f` (`st.z -> 0.0`) ->
 * resin droplet (`makeDroplet`) flows into `f`'s occlusal fossa -> blue LED curing wand (`makeLED`) shines onto `f`
 * and polymerizes the restoration (`makeCoreCap`) -> moves to next tooth `f+1`.
 */
function buildFillingChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  isSealant: boolean,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  camMode: StageCameraMode
) {
  if (!frames.length) return;
  const primary = frames[0]!;

  // Show initial caries lesions only for composite filling (`!isSealant`);
  // Fissure sealant (`isSealant`) starts on a healthy, intact, caries-free tooth (`st.z = 0.0`).
  for (const f of frames) {
    f.arch.uniforms.uScanColor.value.setHex(isSealant ? 0x38bdf8 : 0xf59e0b);
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      st.z = isSealant ? 0.0 : 0.96;
    }
  }

  const bur = makeDentalBur(primary.island.localRadius * 1.15);
  bur.visible = false;
  primary.arch.anchorGroup.add(bur);

  const led = makeLED(primary.island.localRadius * 1.35);
  led.visible = false;
  primary.arch.anchorGroup.add(led);

  const toothStep = frames.length === 1 ? 3.2 : Math.max(1.5, Math.min(2.6, 10.5 / frames.length));

  frames.forEach((f, idx) => {
    const seqStart = 0.5 + idx * toothStep;
    const isl = f.island;
    const r = isl.localRadius;
    const st = f.arch.uniforms.uToothState.value[isl.slot];

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        camMode,
        seqStart,
        Math.min(0.35, toothStep * 0.22)
      );
    }

    if (st) {
      tl.to(st, { w: 0.85, duration: toothStep * 0.12 }, seqStart);
    }

    // Sub-step 1 on tooth `f`: High-speed diamond bur excavates caries on `f`
    const burHover = isl.localOcclusal
      .clone()
      .addScaledVector(isl.localCrownAxis, r * 2.0);

    tl.add(() => {
      if (bur.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(bur);
      }
      bur.visible = true;
      bur.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), isl.localCrownAxis);
      bur.position.copy(burHover);
    }, seqStart);

    if (bur.userData.spinner) {
      tl.to(
        bur.userData.spinner.rotation,
        { y: `+=${Math.PI * 18}`, duration: toothStep * 0.34, ease: "none" },
        seqStart
      );
    }

    tl.to(
      bur.position,
      {
        x: isl.localOcclusal.x,
        y: isl.localOcclusal.y,
        z: isl.localOcclusal.z,
        duration: toothStep * 0.16,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      },
      seqStart + toothStep * 0.02
    );

    if (st) {
      tl.to(
        st,
        { z: 0.0, w: 0.25, duration: toothStep * 0.18 },
        seqStart + toothStep * 0.16
      );
    }

    // Sub-step 2 on tooth `f`: Composite / Sealant droplet flows into `f`'s occlusal fossa
    const dropAt = seqStart + toothStep * 0.36;
    const drop = makeDroplet(r * 0.26);
    const dStart = isl.localOcclusal
      .clone()
      .addScaledVector(isl.localCrownAxis, r * 1.9);
    drop.position.copy(dStart);
    drop.scale.setScalar(0.01);
    drop.visible = false;
    f.arch.anchorGroup.add(drop);

    tl.add(() => {
      bur.visible = false;
      drop.visible = true;
    }, dropAt);
    tl.to(drop.scale, { x: 1, y: 1, z: 1, duration: toothStep * 0.1 }, dropAt);
    tl.to(
      drop.position,
      {
        x: isl.localOcclusal.x,
        y: isl.localOcclusal.y,
        z: isl.localOcclusal.z,
        duration: toothStep * 0.16,
        ease: "power2.out",
      },
      dropAt + toothStep * 0.02
    );
    tl.to(
      drop.scale,
      { x: 1.55, y: 0.24, z: 1.45, duration: toothStep * 0.12 },
      dropAt + toothStep * 0.16
    );

    // Sub-step 3 on tooth `f`: Blue LED curing wand shines directly onto `f` and cures composite
    const cureAt = seqStart + toothStep * 0.62;
    const ledEntry = isl.localOcclusal
      .clone()
      .addScaledVector(isl.localCrownAxis, r * 2.1);
    const ledHover = isl.localOcclusal
      .clone()
      .addScaledVector(isl.localCrownAxis, r * 0.85);

    tl.add(() => {
      if (led.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(led);
      }
      led.visible = true;
      led.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), isl.localCrownAxis);
      led.position.copy(ledEntry);
      led.userData.light.intensity = 0;
      led.userData.tip.material.emissiveIntensity = 0.25;
      led.userData.beam.material.opacity = 0;
    }, cureAt);

    tl.to(
      led.position,
      {
        x: ledHover.x,
        y: ledHover.y,
        z: ledHover.z,
        duration: toothStep * 0.12,
        ease: "power2.out",
      },
      cureAt
    );
    tl.to(
      led.userData.light,
      { intensity: 1.6, duration: toothStep * 0.08 },
      cureAt + toothStep * 0.1
    );
    tl.to(
      led.userData.tip.material,
      { emissiveIntensity: 1.4, duration: toothStep * 0.08 },
      cureAt + toothStep * 0.1
    );
    tl.to(
      led.userData.beam.material,
      { opacity: 0.34, duration: toothStep * 0.08 },
      cureAt + toothStep * 0.1
    );

    const dropMat = drop.material as THREE.MeshPhysicalMaterial;
    tl.to(
      dropMat.color,
      {
        r: isSealant ? 0.86 : 0.84,
        g: isSealant ? 0.81 : 0.77,
        b: isSealant ? 0.71 : 0.66,
        duration: toothStep * 0.14,
      },
      cureAt + toothStep * 0.12
    );
    tl.to(
      dropMat,
      {
        opacity: 0.0,
        duration: toothStep * 0.12,
        ease: "power1.out",
      },
      cureAt + toothStep * 0.2
    );

    tl.add(() => {
      drop.visible = false;
      led.visible = false;
      if (st) {
        st.z = 0;
        st.w = 0;
      }
      const prevCap = f.arch.anchorGroup.getObjectByName(`prop_perm_cap_${f.fdi}`);
      if (prevCap) {
        f.arch.anchorGroup.remove(prevCap);
        disposeObject3D(prevCap);
      }
    }, seqStart + toothStep * 0.95);
  });
}

/**
 * 7. ZİRKONYUM KURON (`crown`) & 9. KALICI ZİRKONYUM KÖPRÜ (`permanent_bridge` / `temporary_denture`):
 * - For `crown` (1 or multiple teeth): Each selected tooth `f` is prepared with the spinning diamond bur (`st.y: 0 -> 0.45`)
 *   and immediately receives its custom 1:1 zirconia crown **one by one sequentially**!
 * - For `permanent_bridge` / `temporary_denture`: Each intact abutment tooth is prepped sequentially by the diamond bur,
 *   then each bridge unit seats sequentially along the arch (`idx * unitStep`).
 */
function buildProstheticChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  action: AnimationActionType,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  camMode: StageCameraMode
) {
  if (!frames.length) return;
  const mode = action === "temporary_denture" ? "temp" : "crown";

  // Clean up any previous prosthetics on target teeth and reveal underlying implants/abutments before seating
  frames.forEach((f) => {
    const prevProsthetic = f.arch.anchorGroup.getObjectByName(
      `prop_perm_prosthetic_${f.fdi}`
    );
    if (prevProsthetic) {
      f.arch.anchorGroup.remove(prevProsthetic);
      disposeObject3D(prevProsthetic);
    }
    const imp = f.arch.anchorGroup.getObjectByName(`prop_perm_implant_${f.fdi}`);
    const abut = f.arch.anchorGroup.getObjectByName(`prop_perm_abutment_${f.fdi}`);
    if (imp) imp.visible = true;
    if (abut) abut.visible = true;
  });

  const primary = frames[0]!;
  const bur = makeDentalBur(primary.island.localRadius * 1.15);
  bur.visible = false;
  primary.arch.anchorGroup.add(bur);

  // If `crown` (individual zirconia/porcelain crowns on 1..N selected teeth):
  // Perform full Prep -> Crown placement sequentially on each tooth one by one!
  if (action === "crown" && frames.length <= 8) {
    const toothStep = frames.length === 1 ? 2.5 : Math.max(1.2, Math.min(2.1, 9.5 / frames.length));

    frames.forEach((f, idx) => {
      const seqStart = 0.5 + idx * toothStep;
      const st = f.arch.uniforms.uToothState.value[f.island.slot];
      const isIntact = Boolean(st && st.x < 0.5);

      if (frames.length > 1) {
        focusCameraOnTooth(
          tl,
          f,
          camera,
          controls,
          camMode,
          seqStart,
          Math.min(0.35, toothStep * 0.25)
        );
      }

      if (isIntact && st) {
        // Sub-step A: Diamond bur preps tooth `f` into an abutment stump (`st.y: 0 -> 0.45`)
        tl.add(() => {
          if (bur.parent !== f.arch.anchorGroup) {
            f.arch.anchorGroup.add(bur);
          }
          bur.visible = true;
          bur.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            f.island.localCrownAxis
          );
          bur.position
            .copy(f.island.localCrownCenter)
            .addScaledVector(f.island.localCrownAxis, f.island.localRadius * 1.4);
        }, seqStart);

        if (bur.userData.spinner) {
          tl.to(
            bur.userData.spinner.rotation,
            { y: `+=${Math.PI * 16}`, duration: toothStep * 0.42, ease: "none" },
            seqStart
          );
        }

        tl.to(
          bur.position,
          {
            x: f.island.localCrownCenter.x,
            y: f.island.localCrownCenter.y,
            z: f.island.localCrownCenter.z,
            duration: toothStep * 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          },
          seqStart + toothStep * 0.02
        );

        tl.to(
          st,
          { y: 0.45, w: 0.75, duration: toothStep * 0.36 },
          seqStart + toothStep * 0.06
        );
      }

      // Sub-step B: Custom 1:1 zirconia crown descends onto tooth `f`
      const crownAt = isIntact ? seqStart + toothStep * 0.46 : seqStart + toothStep * 0.15;
      const crownDur = isIntact ? toothStep * 0.46 : toothStep * 0.72;
      const sign = f.upper ? 1 : -1;
      const crown = makeAnatomicalToothMesh(f.island, mode, true);
      const offsetZ = sign * f.island.localRadius * 2.3;

      crown.position.set(
        f.island.localCenter.x,
        f.island.localCenter.y,
        f.island.localCenter.z + offsetZ
      );
      crown.visible = false;
      f.arch.anchorGroup.add(crown);

      tl.add(() => {
        bur.visible = false;
        crown.visible = true;
      }, crownAt);

      tl.to(
        crown.position,
        {
          x: f.island.localCenter.x,
          y: f.island.localCenter.y,
          z: f.island.localCenter.z,
          duration: crownDur,
          ease: "power3.out",
        },
        crownAt
      );

      tl.add(() => {
        const imp = f.arch.anchorGroup.getObjectByName(`prop_perm_implant_${f.fdi}`);
        const abut = f.arch.anchorGroup.getObjectByName(`prop_perm_abutment_${f.fdi}`);
        if (imp) imp.visible = false;
        if (abut) abut.visible = false;
      }, crownAt + crownDur * 0.72);

      const mat = crown.userData.crownMat as THREE.MeshPhysicalMaterial | undefined;
      if (mat) {
        tl.to(
          mat,
          {
            emissiveIntensity: 0.45,
            duration: toothStep * 0.1,
            yoyo: true,
            repeat: 1,
          },
          crownAt + crownDur * 0.85
        );
      }

      if (st) {
        tl.to(st, { w: 0.0, duration: toothStep * 0.15 }, crownAt + crownDur * 0.88);
      }
    });
    return;
  }

  // Multi-unit Bridge (`permanent_bridge` / `temporary_denture`):
  // Clinically, a bridge spans across one or more MISSING (extracted) teeth (pontics)
  // supported by intact abutment teeth on the ends.
  // If none of the teeth in a given arch span are currently extracted (`st.x < 0.5`),
  // automatically set the interior tooth/teeth (pontics) to missing (`st.x = 1.0`) at t=0
  // while keeping the outer pillar teeth intact (`st.x = 0.0`) as abutment teeth!
  const upperBridgeFrames = frames.filter((f) => f.upper);
  const lowerBridgeFrames = frames.filter((f) => !f.upper);

  [upperBridgeFrames, lowerBridgeFrames].forEach((archFrames) => {
    if (archFrames.length < 2) return;
    const anyAlreadyMissing = archFrames.some((f) => {
      const st = f.arch.uniforms.uToothState.value[f.island.slot];
      return Boolean(st && st.x >= 0.5);
    });
    if (!anyAlreadyMissing) {
      archFrames.forEach((f, idx) => {
        const isTerminalAbutment =
          idx === 0 ||
          idx === archFrames.length - 1 ||
          (archFrames.length >= 6 &&
            (idx === Math.floor(archFrames.length / 2) - 1 ||
              idx === Math.floor(archFrames.length / 2)));
        if (!isTerminalAbutment && archFrames.length >= 3) {
          const st = f.arch.uniforms.uToothState.value[f.island.slot];
          if (st) {
            st.x = 1.0; // Missing pontic gap in the middle of the bridge
            st.y = 0.0;
            st.z = 0.0;
          }
        }
      });
    }
  });

  // Phase 1: Diamond bur sequentially preps ONLY the intact supporting abutment teeth
  const intactFrames = frames.filter((f) => {
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    return Boolean(st && st.x < 0.5 && st.y < 0.35);
  });

  let bridgeStartAt = 0.65;
  if (intactFrames.length > 0) {
    const prepStep = Math.max(0.32, Math.min(0.75, 2.6 / intactFrames.length));
    tl.add(() => {
      bur.visible = true;
    }, 0.4);

    if (bur.userData.spinner) {
      tl.to(
        bur.userData.spinner.rotation,
        {
          y: Math.PI * 28,
          duration: intactFrames.length * prepStep,
          ease: "none",
        },
        0.4
      );
    }

    intactFrames.forEach((f, idx) => {
      const at = 0.42 + idx * prepStep;
      const st = f.arch.uniforms.uToothState.value[f.island.slot];
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        camMode,
        at,
        Math.min(0.32, prepStep * 0.45)
      );
      tl.add(() => {
        if (bur.parent !== f.arch.anchorGroup) {
          f.arch.anchorGroup.add(bur);
        }
        bur.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          f.island.localCrownAxis
        );
      }, at);
      tl.to(
        bur.position,
        {
          x: f.island.localCrownCenter.x,
          y: f.island.localCrownCenter.y,
          z: f.island.localCrownCenter.z,
          duration: prepStep * 0.85,
          ease: "power2.inOut",
        },
        at
      );
      if (st) {
        tl.to(st, { y: 0.45, w: 0.75, duration: prepStep * 0.9 }, at);
      }
    });

    bridgeStartAt = 0.55 + intactFrames.length * prepStep;
    tl.add(() => {
      bur.visible = false;
    }, bridgeStartAt - 0.05);
  }

  // Pull camera to lateral/buccal view of the bridge span right as the 1-piece bridge seats
  const bridgeCamFrame = computeStageCameraFrame(
    frames,
    camera.position,
    controls.target,
    camMode
  );
  tl.to(
    camera.position,
    {
      x: bridgeCamFrame.pos.x,
      y: bridgeCamFrame.pos.y,
      z: bridgeCamFrame.pos.z,
      duration: 0.38,
      ease: "power2.out",
    },
    Math.max(0, bridgeStartAt - 0.12)
  );
  tl.to(
    controls.target,
    {
      x: bridgeCamFrame.target.x,
      y: bridgeCamFrame.target.y,
      z: bridgeCamFrame.target.z,
      duration: 0.38,
      ease: "power2.out",
    },
    Math.max(0, bridgeStartAt - 0.12)
  );

  // Phase 2: Seat the ENTIRE multi-unit bridge as ONE single monolithic connected block (`at = bridgeStartAt`)!
  const seatDur = 1.05;
  [upperBridgeFrames, lowerBridgeFrames].forEach((archFrames) => {
    if (!archFrames.length) return;
    const sign = archFrames[0]!.upper ? 1 : -1;
    const avgRadius =
      archFrames.reduce((s, f) => s + f.island.localRadius, 0) / archFrames.length;
    const offsetZ = sign * avgRadius * 2.35;

    // 2a. Spawn interproximal zirconia connectors between adjacent bridge units so they form a 1-piece block
    for (let i = 0; i < archFrames.length - 1; i++) {
      const curr = archFrames[i]!;
      const next = archFrames[i + 1]!;
      const prevConn = curr.arch.anchorGroup.getObjectByName(
        `prop_perm_bridge_conn_${curr.fdi}_${next.fdi}`
      );
      if (prevConn) {
        curr.arch.anchorGroup.remove(prevConn);
        disposeObject3D(prevConn);
      }
      const distBetween = curr.island.localCrownCenter.distanceTo(
        next.island.localCrownCenter
      );
      if (distBetween <= Math.max(curr.island.localRadius, next.island.localRadius) * 4.2) {
        const conn = makeBridgeConnectorMesh(curr.island, next.island, mode, true);
        const targetPos = conn.position.clone();
        conn.position.set(targetPos.x, targetPos.y, targetPos.z + offsetZ);
        conn.visible = false;
        curr.arch.anchorGroup.add(conn);

        tl.add(() => {
          conn.visible = true;
        }, bridgeStartAt);

        tl.to(
          conn.position,
          {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: seatDur,
            ease: "power3.out",
          },
          bridgeStartAt
        );
      }
    }

    // 2b. All bridge units descend TOGETHER simultaneously at `bridgeStartAt` as one solid connected bridge
    archFrames.forEach((f) => {
      const crown = makeAnatomicalToothMesh(f.island, mode, true);
      crown.position.set(
        f.island.localCenter.x,
        f.island.localCenter.y,
        f.island.localCenter.z + offsetZ
      );
      crown.visible = false;
      f.arch.anchorGroup.add(crown);

      tl.add(() => {
        crown.visible = true;
      }, bridgeStartAt);

      tl.to(
        crown.position,
        {
          x: f.island.localCenter.x,
          y: f.island.localCenter.y,
          z: f.island.localCenter.z,
          duration: seatDur,
          ease: "power3.out",
        },
        bridgeStartAt
      );

      tl.add(() => {
        const imp = f.arch.anchorGroup.getObjectByName(`prop_perm_implant_${f.fdi}`);
        const abut = f.arch.anchorGroup.getObjectByName(`prop_perm_abutment_${f.fdi}`);
        if (imp) imp.visible = false;
        if (abut) abut.visible = false;
      }, bridgeStartAt + seatDur * 0.72);

      const mat = crown.userData.crownMat as THREE.MeshPhysicalMaterial | undefined;
      if (mat) {
        tl.to(
          mat,
          {
            emissiveIntensity: 0.45,
            duration: 0.22,
            yoyo: true,
            repeat: 1,
          },
          bridgeStartAt + seatDur * 0.88
        );
      }

      const st = f.arch.uniforms.uToothState.value[f.island.slot];
      if (st) {
        tl.to(st, { w: 0.0, duration: 0.3 }, bridgeStartAt + seatDur * 0.9);
      }
    });
  });
}

/**
 * 8. LAMİNA VENEER (`veneer` / Yaprak Porselen - Sıralı Tek Tek Veneer Uygulaması):
 * For each selected tooth `f` in `frames` sequentially:
 * Camera focuses on `f` -> diamond bur performs 0.3mm labial enamel prep (`st.y: 0 -> 0.18`) on `f` ->
 * ultra-thin E-max labial veneer (`veneerOnlyGeo`) glides in from the front onto `f` ->
 * blue LED curing wand (`makeLED`) cures `f`'s veneer before moving to `f+1`.
 */
function buildVeneerChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 }
) {
  if (!frames.length) return;
  const primary = frames[0]!;

  frames.forEach((f) => {
    const prevProsthetic = f.arch.anchorGroup.getObjectByName(
      `prop_perm_prosthetic_${f.fdi}`
    );
    if (prevProsthetic) {
      f.arch.anchorGroup.remove(prevProsthetic);
      disposeObject3D(prevProsthetic);
    }
    f.arch.uniforms.uScanColor.value.setHex(0x38bdf8);
  });

  const bur = makeDentalBur(primary.island.localRadius * 1.05);
  bur.visible = false;
  primary.arch.anchorGroup.add(bur);

  const led = makeLED(primary.island.localRadius * 1.25);
  led.visible = false;
  primary.arch.anchorGroup.add(led);

  const toothStep = frames.length === 1 ? 2.6 : Math.max(1.05, Math.min(1.85, 9.5 / frames.length));

  frames.forEach((f, idx) => {
    const seqStart = 0.5 + idx * toothStep;
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    const outDir = new THREE.Vector3(
      f.island.localCenter.x,
      f.island.localCenter.y - 5.2,
      0
    ).normalize();
    const labialSurface = f.island.localCrownCenter
      .clone()
      .addScaledVector(outDir, f.island.localRadius * 0.78);

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        "facial",
        seqStart,
        Math.min(0.32, toothStep * 0.25)
      );
    }

    // Sub-step 1 on tooth `f`: Labial enamel preparation (`st.y: 0 -> 0.18`)
    tl.add(() => {
      if (bur.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(bur);
      }
      bur.visible = true;
      bur.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outDir);
      bur.position
        .copy(labialSurface)
        .addScaledVector(outDir, f.island.localRadius * 0.9);
    }, seqStart);

    if (bur.userData.spinner) {
      tl.to(
        bur.userData.spinner.rotation,
        { y: `+=${Math.PI * 14}`, duration: toothStep * 0.34, ease: "none" },
        seqStart
      );
    }

    tl.to(
      bur.position,
      {
        x: labialSurface.x,
        y: labialSurface.y,
        z: labialSurface.z,
        duration: toothStep * 0.26,
        ease: "power2.inOut",
      },
      seqStart + toothStep * 0.02
    );

    if (st && st.x < 0.5) {
      tl.to(
        st,
        { y: 0.18, w: 0.7, duration: toothStep * 0.3 },
        seqStart + toothStep * 0.05
      );
    }

    // Sub-step 2 on tooth `f`: Ultra-thin labial porcelain veneer glides onto `f` from the front
    const veneerAt = seqStart + toothStep * 0.36;
    const veneer = makeAnatomicalToothMesh(f.island, "veneer", true);
    const startOffset = outDir.clone().multiplyScalar(f.island.localRadius * 2.2);
    veneer.position.copy(f.island.localCenter).add(startOffset);
    veneer.visible = false;
    f.arch.anchorGroup.add(veneer);

    tl.add(() => {
      bur.visible = false;
      veneer.visible = true;
    }, veneerAt);

    tl.to(
      veneer.position,
      {
        x: f.island.localCenter.x,
        y: f.island.localCenter.y,
        z: f.island.localCenter.z,
        duration: toothStep * 0.34,
        ease: "power3.out",
      },
      veneerAt
    );

    // Sub-step 3 on tooth `f`: Blue LED curing light polymerizes `f`'s veneer cement
    const cureAt = seqStart + toothStep * 0.7;
    const ledFrontPos = f.island.localCrownCenter
      .clone()
      .addScaledVector(outDir, f.island.localRadius * 1.35);

    tl.add(() => {
      if (led.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(led);
      }
      led.visible = true;
      led.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outDir);
      led.position.copy(ledFrontPos);
      led.userData.light.intensity = 1.5;
      led.userData.tip.material.emissiveIntensity = 1.35;
      led.userData.beam.material.opacity = 0.32;
    }, cureAt);

    const mat = veneer.userData.crownMat as THREE.MeshPhysicalMaterial | undefined;
    if (mat) {
      tl.to(
        mat,
        {
          emissiveIntensity: 0.45,
          duration: toothStep * 0.1,
          yoyo: true,
          repeat: 1,
        },
        cureAt + toothStep * 0.05
      );
    }

    if (st) {
      tl.to(st, { w: 0.0, duration: toothStep * 0.16 }, cureAt + toothStep * 0.1);
    }

    tl.add(() => {
      led.visible = false;
    }, seqStart + toothStep * 0.96);
  });
}

/**
 * 10. DİŞ TAŞI TEMİZLİĞİ / DETERTRAJ (`scaling` / `cleaning` - Sıralı Tek Tek Diş Taşı Temizliği):
 * For each selected tooth `f` in `frames` sequentially:
 * Camera tracks to `f` -> ultrasonic piezo scaler (`makeUltrasonicScaler`) sweeps across the mesial, central,
 * and distal cervical gumline of `f` with water cavitation mist -> dissolves `f`'s yellow tartar (`st.z: -0.95 -> 0.0`)
 * before advancing to the next tooth `f+1`.
 */
function buildScalingChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 }
) {
  if (!frames.length) return;
  const primary = frames[0]!;

  for (const f of frames) {
    f.arch.uniforms.uScanColor.value.setHex(0x38bdf8);
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      st.z = -0.95; // Negative vCariesSpot renders localized cervical tartar/calculus at gingival margin
      st.w = 0.0;   // Keep scan glow off so teeth strictly preserve their natural shade
    }
  }

  const scaler = makeUltrasonicScaler(primary.island.localRadius * 1.3);
  scaler.visible = false;
  primary.arch.anchorGroup.add(scaler);

  const toothStep = frames.length === 1 ? 2.2 : Math.max(0.75, Math.min(1.35, 8.5 / frames.length));

  tl.add(() => {
    scaler.visible = true;
  }, 0.48);

  frames.forEach((f, idx) => {
    const seqStart = 0.5 + idx * toothStep;
    const outDir = new THREE.Vector3(
      f.island.localCervical.x,
      f.island.localCervical.y - 5.2,
      0
    ).normalize();
    const tangent = new THREE.Vector3(-outDir.y, outDir.x, 0).normalize();
    const basePos = f.island.localCervical
      .clone()
      .addScaledVector(outDir, f.island.localRadius * 0.72);
    const mesialPos = basePos
      .clone()
      .addScaledVector(tangent, -f.island.localRadius * 0.45);
    const distalPos = basePos
      .clone()
      .addScaledVector(tangent, f.island.localRadius * 0.45);

    if (frames.length > 1) {
      focusCameraOnTooth(
        tl,
        f,
        camera,
        controls,
        "facial",
        seqStart,
        Math.min(0.28, toothStep * 0.3)
      );
    }

    tl.add(() => {
      if (scaler.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(scaler);
      }
      scaler.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outDir);
    }, seqStart);

    // Move to mesial margin of tooth `f`, then sweep across cervical gumline to distal margin
    tl.to(
      scaler.position,
      {
        x: mesialPos.x,
        y: mesialPos.y,
        z: mesialPos.z,
        duration: toothStep * 0.28,
        ease: "power2.out",
      },
      seqStart
    );
    tl.to(
      scaler.position,
      {
        x: distalPos.x,
        y: distalPos.y,
        z: distalPos.z,
        duration: toothStep * 0.55,
        ease: "sine.inOut",
      },
      seqStart + toothStep * 0.28
    );

    const spray = scaler.userData.spray as THREE.Mesh | undefined;
    if (spray) {
      tl.to(
        spray.scale,
        {
          x: 1.5,
          y: 1.5,
          z: 1.5,
          duration: toothStep * 0.25,
          yoyo: true,
          repeat: 2,
        },
        seqStart + toothStep * 0.1
      );
    }

    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      tl.to(
        st,
        { z: 0.0, w: 0.0, duration: toothStep * 0.65 },
        seqStart + toothStep * 0.25
      );
    }
  });

  tl.add(() => {
    scaler.visible = false;
  }, 0.55 + frames.length * toothStep);
}

/**
 * HEALING / OSTEOINTEGRATION:
 * Gentle panoramic arch camera sweep + biological turquoise healing wave across the arches.
 */
function buildHealingChoreography(
  tl: gsap.core.Timeline,
  controller: MouthCinematicController,
  camera: THREE.PerspectiveCamera,
  defaultCamPos: THREE.Vector3
) {
  [controller.upperArch, controller.lowerArch].forEach((arch) => {
    if (!arch) return;
    arch.uniforms.uScanColor.value.setHex(0x2dd4bf);
    arch.islands.forEach((isl) => {
      const st = arch.uniforms.uToothState.value[isl.slot];
      if (st) {
        tl.to(
          st,
          { w: 0.65, duration: 0.8, yoyo: true, repeat: 1, ease: "sine.inOut" },
          0.4 + isl.slot * 0.06
        );
      }
    });
    tl.to(
      arch.uniforms.uPulse,
      { value: 2.0, duration: 2.2, ease: "sine.inOut" },
      0.4
    );
  });

  tl.to(
    camera.position,
    {
      x: defaultCamPos.x * 0.65,
      y: defaultCamPos.y * 1.02,
      z: defaultCamPos.z * 0.96,
      duration: 1.4,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    },
    0.5
  );
}

/**
 * 11. OFİS TİPİ DİŞ BEYAZLATMA (`whitening` / 3-Fazlı Klinik Bleaching Protokolü):
 * Faz 1: Diş eti sınırına koruyucu gingival barrier (mavi sıvı baraj) çekilir ve
 *        ön dişlerin yüzeyine şeffaf/parıltılı hidrojen peroksit beyazlatma jeli sürülür.
 * Faz 2: Geniş açılı ark tipi mavi LED bleaching lambası devreye girerek jeli aktive eder,
 *        jel oksijen köpürmesiyle ışıldarken alttaki sarı lekeler çözülür (st.z: -0.75 -> 0.0).
 * Faz 3: Cerrahi aspiratör kanülü jeli aspire ederek temizler, koruyucu baraj sökülür ve
 *        dişlerin tertemiz, doğal ve ışıltılı mine tonu ortaya çıkar.
 */
function buildWhiteningChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  controller: MouthCinematicController,
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 }
) {
  const targetFrames =
    frames.length > 0
      ? frames
      : ["13", "12", "11", "21", "22", "23"]
          .map((t) => calculateLocalFdiFrame(controller, t))
          .filter((f): f is ResolvedFdiFrame => f !== null);
  if (!targetFrames.length) return;

  const sortedFrames = [...targetFrames].sort(
    (a, b) => a.island.localCenter.x - b.island.localCenter.x
  );
  const primary = sortedFrames[0]!;

  // 1. Initial State: Pre-treatment warm yellowish tea/coffee stain baseline
  for (const f of sortedFrames) {
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      st.z = -0.75;
      st.w = 0.0;
    }
  }

  // Local center for lamp positioning
  const localBox = new THREE.Box3();
  sortedFrames.forEach((f) => localBox.expandByPoint(f.island.localCenter));
  const smileCenterLocal = localBox.getCenter(new THREE.Vector3());

  // =========================================================================
  // FAZ 1a: Diş Eti Koruyucu Barajı (Gingival Barrier) Uygulaması
  // =========================================================================
  const barrier = makeGingivalBarrierMesh(sortedFrames);
  if (barrier) {
    barrier.visible = false;
    primary.arch.anchorGroup.add(barrier);

    tl.add(() => {
      if (barrier) barrier.visible = true;
    }, 0.45);

    tl.fromTo(
      barrier.scale,
      { x: 1, y: 0.01, z: 0.01 },
      { x: 1, y: 1, z: 1, duration: 0.6, ease: "power2.out" },
      0.45
    );
  }

  // =========================================================================
  // FAZ 1b: Hidrojen Peroksit Beyazlatma Jelinin Sürülmesi
  // =========================================================================
  const gelMeshes: THREE.Mesh[] = [];
  sortedFrames.forEach((f) => {
    const gel = makeBleachingGelMesh(f.island);
    gel.scale.set(0.01, 0.01, 0.01);
    gel.visible = false;
    f.arch.anchorGroup.add(gel);
    gelMeshes.push(gel);
  });

  const syringe = makeGelSyringe(primary.island.localRadius * 1.15);
  syringe.visible = false;
  primary.arch.anchorGroup.add(syringe);

  tl.add(() => {
    syringe.visible = true;
  }, 1.1);

  const applyStep = 2.4 / sortedFrames.length;
  sortedFrames.forEach((f, idx) => {
    const at = 1.15 + idx * applyStep;
    const gel = gelMeshes[idx];
    const outDir = new THREE.Vector3(
      f.island.localCrownCenter.x,
      f.island.localCrownCenter.y - 5.2,
      0
    ).normalize();
    const tipPos = f.island.localCrownCenter
      .clone()
      .addScaledVector(outDir, f.island.localRadius * 0.32);

    tl.add(() => {
      syringe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), outDir);
    }, at);

    tl.to(
      syringe.position,
      {
        x: tipPos.x,
        y: tipPos.y,
        z: tipPos.z,
        duration: applyStep * 0.72,
        ease: "power2.out",
      },
      at
    );

    if (gel) {
      tl.add(() => {
        gel.visible = true;
      }, at + applyStep * 0.15);
      tl.to(
        gel.scale,
        {
          x: 1.035,
          y: 1.035,
          z: 1.05,
          duration: applyStep * 0.68,
          ease: "back.out(1.2)",
        },
        at + applyStep * 0.15
      );
    }
  });

  const syringeEndAt = 1.15 + sortedFrames.length * applyStep + 0.1;
  tl.add(() => {
    syringe.visible = false;
  }, syringeEndAt);

  // =========================================================================
  // FAZ 2: Geniş Ark Tipi Mavi Bleaching Lambası Aktivasyonu
  // =========================================================================
  const lamp = makeBleachingArcLamp(primary.island.localRadius * 1.25);
  lamp.visible = false;
  primary.arch.anchorGroup.add(lamp);

  const lampInPos = smileCenterLocal
    .clone()
    .add(new THREE.Vector3(0, 0, primary.island.localRadius * 3.6));
  const lampOutPos = smileCenterLocal
    .clone()
    .add(new THREE.Vector3(0, 0, primary.island.localRadius * 7.5));
  lamp.position.copy(lampOutPos);

  const lampStartAt = syringeEndAt + 0.15;
  tl.add(() => {
    lamp.visible = true;
  }, lampStartAt);

  tl.to(
    lamp.position,
    {
      x: lampInPos.x,
      y: lampInPos.y,
      z: lampInPos.z,
      duration: 0.6,
      ease: "power3.out",
    },
    lampStartAt
  );

  const activateAt = lampStartAt + 0.6;
  const lampDur = 2.6;

  tl.add(() => {
    lamp.userData.light.intensity = 2.8;
    lamp.userData.beam.material.opacity = 0.36;
  }, activateAt);

  // Gel active oxygen effervescence shimmer under blue light
  gelMeshes.forEach((gel) => {
    const mat = gel.userData.gelMat as THREE.MeshPhysicalMaterial | undefined;
    if (mat) {
      tl.to(
        mat,
        {
          emissiveIntensity: 0.52,
          duration: lampDur * 0.45,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        },
        activateAt
      );
    }
  });

  // Dissolve dark yellow stain simultaneously across all teeth under the blue light
  sortedFrames.forEach((f) => {
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      tl.to(
        st,
        { z: 0.0, w: 0.0, duration: lampDur * 0.78, ease: "power2.inOut" },
        activateAt + 0.15
      );
    }
  });

  const lampEndAt = activateAt + lampDur;
  tl.add(() => {
    lamp.userData.light.intensity = 0.0;
    lamp.userData.beam.material.opacity = 0.0;
  }, lampEndAt);

  tl.to(
    lamp.position,
    {
      x: lampOutPos.x,
      y: lampOutPos.y,
      z: lampOutPos.z,
      duration: 0.5,
      ease: "power2.in",
    },
    lampEndAt
  );

  tl.add(() => {
    lamp.visible = false;
  }, lampEndAt + 0.5);

  // =========================================================================
  // FAZ 3: Jelin Aspiratörle Temizlenmesi & Estetik Gülüşün Açığa Çıkması
  // =========================================================================
  const suction = makeSuctionCannula(primary.island.localRadius * 1.15);
  suction.visible = false;
  primary.arch.anchorGroup.add(suction);

  const suctionStartAt = lampEndAt + 0.55;
  tl.add(() => {
    suction.visible = true;
  }, suctionStartAt);

  const suctionStep = 1.6 / sortedFrames.length;
  sortedFrames.forEach((f, idx) => {
    const at = suctionStartAt + idx * suctionStep;
    const gel = gelMeshes[idx];
    const outDir = new THREE.Vector3(
      f.island.localCrownCenter.x,
      f.island.localCrownCenter.y - 5.2,
      0
    ).normalize();
    const suctionPos = f.island.localCrownCenter
      .clone()
      .addScaledVector(outDir, f.island.localRadius * 0.36);

    tl.to(
      suction.position,
      {
        x: suctionPos.x,
        y: suctionPos.y,
        z: suctionPos.z,
        duration: suctionStep * 0.72,
        ease: "power2.out",
      },
      at
    );

    if (gel) {
      tl.to(
        gel.scale,
        {
          x: 0.01,
          y: 0.01,
          z: 0.01,
          duration: suctionStep * 0.55,
          ease: "power2.in",
        },
        at + suctionStep * 0.15
      );
      tl.add(() => {
        gel.visible = false;
      }, at + suctionStep * 0.72);
    }
  });

  const cleanEndAt = suctionStartAt + sortedFrames.length * suctionStep + 0.1;
  tl.add(() => {
    suction.visible = false;
  }, cleanEndAt);

  // Peel off / remove gingival barrier
  if (barrier) {
    tl.to(
      barrier.scale,
      { x: 1, y: 0.01, z: 0.01, duration: 0.45, ease: "power2.in" },
      cleanEndAt
    );
    tl.add(() => {
      if (barrier) barrier.visible = false;
    }, cleanEndAt + 0.45);
  }
}

/**
 * 12. PANORAMİK RÖNTGEN (`xray` / Dijital Radyografi Tarama):
 * Full-arch digital X-Ray scan wave across upper and lower arches, temporarily revealing
 * longitudinal internal root canal & bone cross-sections across the dentition.
 */
function buildXRayChoreography(
  tl: gsap.core.Timeline,
  controller: MouthCinematicController,
  camera: THREE.PerspectiveCamera,
  defaultCamPos: THREE.Vector3
) {
  [controller.upperArch, controller.lowerArch].forEach((arch) => {
    if (!arch) return;
    arch.uniforms.uScanColor.value.setHex(0x38bdf8);
    arch.uniforms.uClean.value = 1.0;

    tl.to(
      arch.uniforms.uSection,
      { value: 0.85, duration: 1.2, ease: "power2.inOut" },
      0.5
    );
    arch.islands.forEach((isl) => {
      const st = arch.uniforms.uToothState.value[isl.slot];
      if (st) {
        tl.to(
          st,
          { w: 0.95, duration: 0.65, yoyo: true, repeat: 1, ease: "sine.inOut" },
          0.55 + isl.slot * 0.14
        );
      }
    });
    tl.to(
      arch.uniforms.uPulse,
      { value: 3.0, duration: 3.6, ease: "sine.inOut" },
      0.5
    );
    tl.to(
      arch.uniforms.uSection,
      { value: 0.0, duration: 1.1, ease: "power2.inOut" },
      3.8
    );
  });

  tl.to(
    camera.position,
    {
      x: defaultCamPos.x * 0.55,
      y: defaultCamPos.y * 0.98,
      z: defaultCamPos.z * 0.92,
      duration: 2.1,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    },
    0.5
  );
}

/**
 * 13. SİNÜS LİFTİNG & KEMİK GREFTİ (`sinus_graft` / Kemik Tozu Uygulaması):
 * Posterior upper molar site is prepared with osteotomy drill, then bio-active bone graft
 * granules (`makeDroplet` warm ivory matrix) are packed into the maxillary sinus floor / alveolar socket.
 */
function buildSinusGraftChoreography(
  tl: gsap.core.Timeline,
  frames: ResolvedFdiFrame[],
  camera: THREE.PerspectiveCamera,
  controls: { target: THREE.Vector3 },
  camMode: StageCameraMode
) {
  if (!frames.length) return;
  const primary = frames[0]!;

  // Mark target posterior sites as edentulous sockets needing sinus floor augmentation
  for (const f of frames) {
    f.arch.uniforms.uScanColor.value.setHex(0x2dd4bf);
    const st = f.arch.uniforms.uToothState.value[f.island.slot];
    if (st) {
      st.x = 1.0;
      st.w = 0.7;
    }
  }

  const drill = makeSurgicalDrill(primary.island.localRadius * 1.2);
  drill.visible = false;
  primary.arch.anchorGroup.add(drill);

  const toothStep = frames.length === 1 ? 3.4 : Math.max(2.0, Math.min(3.2, 9.5 / frames.length));

  frames.forEach((f, idx) => {
    const seqStart = 0.5 + idx * toothStep;
    const isl = f.island;
    const r = isl.localRadius;

    // Always orient camera smoothly to active tooth's lateral sinus floor site
    focusCameraOnTooth(
      tl,
      f,
      camera,
      controls,
      camMode,
      seqStart,
      Math.min(0.42, toothStep * 0.22)
    );

    // Step 1: Sinus floor window / osteotomy preparation
    const drillStart = isl.localCervical
      .clone()
      .addScaledVector(isl.localCrownAxis, r * 2.1);
    const drillDepth = isl.localCervical
      .clone()
      .addScaledVector(isl.localCrownAxis, -r * 0.45);

    tl.add(() => {
      if (drill.parent !== f.arch.anchorGroup) {
        f.arch.anchorGroup.add(drill);
      }
      drill.visible = true;
      drill.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), isl.localCrownAxis);
      drill.position.copy(drillStart);
    }, seqStart);

    if (drill.userData.spinner) {
      tl.to(
        drill.userData.spinner.rotation,
        { y: `+=${Math.PI * 16}`, duration: toothStep * 0.34, ease: "none" },
        seqStart
      );
    }

    tl.to(
      drill.position,
      {
        x: drillDepth.x,
        y: drillDepth.y,
        z: drillDepth.z,
        duration: toothStep * 0.17,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      },
      seqStart + toothStep * 0.02
    );

    // Step 2: Bio-active bone graft granules (`graft`) packed into the sinus / alveolar socket
    const graftAt = seqStart + toothStep * 0.38;
    const graft = makeDroplet(r * 0.38);
    const graftMat = graft.material as THREE.MeshPhysicalMaterial;
    graftMat.color.setHex(0xe8dec8);
    graftMat.roughness = 0.48;

    const gStart = isl.localCervical
      .clone()
      .addScaledVector(isl.localCrownAxis, r * 1.8);
    graft.position.copy(gStart);
    graft.scale.setScalar(0.01);
    graft.visible = false;
    f.arch.anchorGroup.add(graft);

    tl.add(() => {
      drill.visible = false;
      graft.visible = true;
    }, graftAt);

    tl.to(
      graft.scale,
      { x: 1.45, y: 0.55, z: 1.35, duration: toothStep * 0.22, ease: "power2.out" },
      graftAt
    );
    tl.to(
      graft.position,
      {
        x: isl.localCervical.x,
        y: isl.localCervical.y,
        z: isl.localCervical.z,
        duration: toothStep * 0.24,
        ease: "power2.out",
      },
      graftAt + toothStep * 0.02
    );
    tl.to(
      graftMat,
      { opacity: 0.0, duration: toothStep * 0.2, ease: "power1.out" },
      seqStart + toothStep * 0.76
    );
    tl.add(() => {
      graft.visible = false;
      const st = f.arch.uniforms.uToothState.value[isl.slot];
      if (st) st.w = 0.0;
    }, seqStart + toothStep * 0.96);
  });
}
