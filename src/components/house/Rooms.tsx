import { RoundedBox, useGLTF, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import {
  Box3,
  Group,
  Object3D,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Path,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  Vector3,
  type Material,
  type Mesh,
  type Texture,
} from "three";

// The parts of the interior seen from the 3D exterior and the doorway: an arched foyer and a
// marble dining + kitchen behind the glazing. Past the door the walkthrough switches to the
// studio's own renders (see InteriorReel). Models and PBR textures are CC0 from Poly Haven.

type V3 = [number, number, number];
export type SharedMats = Record<
  | "metal"
  | "brass"
  | "glow"
  | "paper"
  | "flame"
  | "embers"
  | "firebox"
  | "plaster"
  | "glass"
  | "marble"
  | "fluted",
  Material
>;

const TEXTURES = [
  "herringbone_parquet",
  "marble_01",
  "natural_walnut_veneer",
  "plastered_wall_04",
] as const;
type TexName = (typeof TEXTURES)[number];
const texUrls = TEXTURES.flatMap((n) => [
  `/house/textures/${n}_diff.jpg`,
  `/house/textures/${n}_nor.jpg`,
  `/house/textures/${n}_rough.jpg`,
]);

const MODEL = (id: string) => `/house/models/${id}/${id}.gltf`;
[
  "potted_plant_02",
  "anthurium_botany_01",
  "ceramic_vase_01",
  "ceramic_vase_02",
  "Chandelier_01",
  "modern_wooden_cabinet",
  "ornate_mirror_01",
  "dining_chair_02",
].forEach((id) => useGLTF.preload(MODEL(id)));

function useRoomMaterials() {
  const loaded = useTexture(texUrls);
  return useMemo(() => {
    const pbr = (n: TexName, rx: number, ry: number, withColor = true) => {
      const i = TEXTURES.indexOf(n) * 3;
      const [d, nm, r] = [0, 1, 2].map((k) => {
        const c = loaded[i + k]!.clone();
        c.wrapS = c.wrapT = RepeatWrapping;
        c.repeat.set(rx, ry);
        c.anisotropy = 8;
        if (k === 0) c.colorSpace = SRGBColorSpace;
        c.needsUpdate = true;
        return c;
      }) as [Texture, Texture, Texture];
      return withColor
        ? { map: d, normalMap: nm, roughnessMap: r }
        : { normalMap: nm, roughnessMap: r };
    };
    return {
      parquet: new MeshStandardMaterial({
        ...pbr("herringbone_parquet", 2.4, 5),
        envMapIntensity: 0.9,
      }),
      marbleFloor: new MeshStandardMaterial({
        ...pbr("marble_01", 2.3, 5),
        roughness: 0.3,
        envMapIntensity: 1.2,
      }),
      plaster: new MeshStandardMaterial({
        ...pbr("plastered_wall_04", 3, 1.2, false),
        color: "#ece3d4",
        roughness: 0.95,
      }),
      walnut: new MeshStandardMaterial({
        ...pbr("natural_walnut_veneer", 1, 1),
        color: "#8a5f3f",
        roughness: 0.4,
      }),
    };
  }, [loaded]);
}
type RM = ReturnType<typeof useRoomMaterials>;

function B({ p, s, m, r, cast = true }: { p: V3; s: V3; m: Material; r?: V3; cast?: boolean }) {
  return (
    <mesh position={p} rotation={r ?? [0, 0, 0]} castShadow={cast} receiveShadow material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function R({ p, s, m, r, radius = 0.08 }: { p: V3; s: V3; m: Material; r?: V3; radius?: number }) {
  return (
    <RoundedBox
      args={s}
      radius={radius}
      smoothness={5}
      position={p}
      rotation={r ?? [0, 0, 0]}
      castShadow
      receiveShadow
      material={m}
    />
  );
}

// Loads a Poly Haven model and normalises it: scaled to a target height (or footprint),
// centred on x/z and sat on the floor.
function Prop({
  id,
  h,
  w,
  p,
  ry = 0,
  tweak,
  single = false,
}: {
  id: string;
  h?: number;
  w?: number;
  p: V3;
  ry?: number;
  tweak?: (mesh: Mesh) => void;
  single?: boolean;
}) {
  const { scene } = useGLTF(MODEL(id));
  const obj = useMemo(() => {
    let c: Object3D = scene.clone(true);
    if (single) {
      // Some files hold several size variants side by side; keep only the tallest.
      scene.updateMatrixWorld(true);
      let roots: Object3D[] = scene.children;
      while (roots.length === 1 && roots[0]!.children.length > 1) roots = roots[0]!.children;
      let best: Object3D | undefined;
      let bestH = 0;
      for (const r of roots) {
        const hgt = new Box3().setFromObject(r).getSize(new Vector3()).y;
        if (hgt > bestH) {
          bestH = hgt;
          best = r;
        }
      }
      if (best) {
        const copy = best.clone(true);
        if (best.parent) copy.applyMatrix4(best.parent.matrixWorld);
        c = new Group().add(copy);
      }
    }
    const size = new Box3().setFromObject(c).getSize(new Vector3());
    const k = h ? h / size.y : (w ?? 1) / Math.max(size.x, size.z);
    c.scale.multiplyScalar(k);
    c.updateMatrixWorld(true);
    const b = new Box3().setFromObject(c);
    const ctr = b.getCenter(new Vector3());
    c.position.x -= ctr.x;
    c.position.z -= ctr.z;
    c.position.y -= b.min.y;
    c.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      tweak?.(mesh);
    });
    return c;
  }, [scene, h, w, tweak, single]);
  return (
    <group position={p} rotation-y={ry}>
      <primitive object={obj} />
    </group>
  );
}

// Wall with arched openings. Built in wall space (x along wall, y up) then rotated in place.
function useArchedWall(
  length: number,
  height: number,
  arches: { c: number; w: number; spring: number }[],
) {
  return useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.lineTo(length, 0);
    s.lineTo(length, height);
    s.lineTo(0, height);
    s.closePath();
    for (const a of arches) {
      const r = a.w / 2;
      const hole = new Path();
      hole.moveTo(a.c - r, 0);
      hole.lineTo(a.c + r, 0);
      hole.lineTo(a.c + r, a.spring);
      hole.absarc(a.c, a.spring, r, 0, Math.PI, false);
      hole.lineTo(a.c - r, 0);
      s.holes.push(hole);
    }
    return new ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: false, curveSegments: 40 });
  }, [length, height, arches]);
}

function Sconce({ p, ry = 0, sm }: { p: V3; ry?: number; sm: SharedMats }) {
  return (
    <group position={p} rotation-y={ry}>
      <B p={[0, 0, 0.015]} s={[0.06, 0.2, 0.03]} m={sm.brass} cast={false} />
      <B p={[0, -0.02, 0.09]} s={[0.018, 0.018, 0.14]} m={sm.brass} cast={false} />
      <mesh position={[0, 0.07, 0.16]} material={sm.paper}>
        <cylinderGeometry args={[0.07, 0.1, 0.2, 24, 1, true]} />
      </mesh>
    </group>
  );
}

// Panel mouldings: dado rail plus raised frames above it, drawn along one wall.
function Panelling({
  p,
  ry = 0,
  length,
  panels,
  sm,
}: {
  p: V3;
  ry?: number;
  length: number;
  panels: [number, number][];
  sm: SharedMats;
}) {
  const t = 0.03;
  return (
    <group position={p} rotation-y={ry}>
      <B p={[length / 2, 0.95, 0]} s={[length, 0.05, 0.04]} m={sm.plaster} cast={false} />
      <B p={[length / 2, 0.1, 0]} s={[length, 0.18, 0.03]} m={sm.plaster} cast={false} />
      {panels.map(([a, b]) => {
        const w = b - a;
        const cx = (a + b) / 2;
        return (
          <group key={a}>
            <B p={[cx, 3.0, 0]} s={[w, t, t]} m={sm.plaster} cast={false} />
            <B p={[cx, 1.25, 0]} s={[w, t, t]} m={sm.plaster} cast={false} />
            <B p={[a, 2.125, 0]} s={[t, 1.78, t]} m={sm.plaster} cast={false} />
            <B p={[b, 2.125, 0]} s={[t, 1.78, t]} m={sm.plaster} cast={false} />
            <B p={[cx, 0.52, 0]} s={[w, t, t]} m={sm.plaster} cast={false} />
          </group>
        );
      })}
    </group>
  );
}

function glowingLamps(mesh: Mesh) {
  const mat = mesh.material as MeshStandardMaterial;
  if (mat.name.includes("lamps")) {
    mat.emissive.set("#ffd7a1");
    mat.emissiveIntensity = 1.4;
  }
}

function Colonnade({ rm, sm }: { rm: RM; sm: SharedMats }) {
  // Wall on x = -0.9 running from the front door back to the rear wall, opening onto the
  // living room through two plaster arches.
  const arches = useMemo(
    () => [
      { c: 4.85, w: 2.6, spring: 1.85 },
      { c: 8.05, w: 2.6, spring: 1.85 },
    ],
    [],
  );
  const wall = useArchedWall(9.7, 3.35, arches);
  return (
    <group>
      <mesh
        geometry={wall}
        position={[-1.02, 0.15, -0.15]}
        rotation-y={Math.PI / 2}
        castShadow
        receiveShadow
        material={rm.plaster}
      />
      <Panelling
        p={[-0.77, 0, -0.2]}
        ry={Math.PI / 2}
        length={3.3}
        panels={[
          [0.2, 0.75],
          [2.65, 3.2],
        ]}
        sm={sm}
      />
      {/* foyer: fluted credenza, ornate mirror, vase */}
      <Prop id="modern_wooden_cabinet" w={1.9} p={[-0.45, 0.15, -1.7]} ry={Math.PI / 2} />
      <Prop id="ornate_mirror_01" h={1.25} p={[-0.77, 1.05, -1.7]} ry={Math.PI / 2} />
      <Prop id="anthurium_botany_01" h={0.5} p={[-0.45, 0.83, -2.35]} single />
      <Prop id="ceramic_vase_02" h={0.3} p={[-0.45, 0.83, -1.05]} />
      <Sconce p={[-0.77, 2.1, -0.75]} ry={Math.PI / 2} sm={sm} />
      <Sconce p={[-0.77, 2.1, -2.65]} ry={Math.PI / 2} sm={sm} />
      <pointLight
        position={[0.2, 2.6, -1.7]}
        intensity={3}
        distance={5}
        decay={2}
        color="#ffdcb0"
      />
    </group>
  );
}

function DiningKitchen({ rm, sm }: { rm: RM; sm: SharedMats }) {
  const chairs: [number, number, number][] = [];
  for (const x of [2.85, 3.65, 4.45]) {
    chairs.push([x, -1.72, Math.PI]);
    chairs.push([x, -3.08, 0]);
  }
  return (
    <group>
      {/* dining: walnut table under a classic chandelier */}
      <R p={[3.65, 0.91, -2.4]} s={[2.5, 0.06, 1.05]} m={rm.walnut} radius={0.025} />
      <B p={[2.75, 0.53, -2.4]} s={[0.1, 0.72, 0.75]} m={rm.walnut} />
      <B p={[4.55, 0.53, -2.4]} s={[0.1, 0.72, 0.75]} m={rm.walnut} />
      {chairs.map(([x, z, ry]) => (
        <Prop key={`${x}${z}`} id="dining_chair_02" h={0.97} p={[x, 0.15, z]} ry={ry} />
      ))}
      <Prop id="ceramic_vase_01" h={0.34} p={[3.65, 0.94, -2.4]} />
      <group position={[3.65, 2.45, -2.4]}>
        <Prop id="Chandelier_01" h={0.8} p={[0, 0, 0]} tweak={glowingLamps} />
        <mesh position={[0, 0.95, 0]} material={sm.metal}>
          <cylinderGeometry args={[0.006, 0.006, 0.3, 4]} />
        </mesh>
      </group>
      <pointLight
        position={[3.65, 2.5, -2.4]}
        intensity={7}
        distance={7}
        decay={2}
        color="#ffdcb0"
      />

      {/* kitchen: dark joinery along the east wall with marble splashback + island */}
      <B p={[5.55, 1.45, -8.0]} s={[0.6, 2.6, 3.6]} m={sm.fluted} />
      <B p={[5.24, 1.28, -8.0]} s={[0.02, 0.55, 3.0]} m={sm.marble} cast={false} />
      <B p={[5.23, 1.57, -8.0]} s={[0.02, 0.02, 3.0]} m={sm.glow} cast={false} />
      <B p={[5.2, 0.98, -8.0]} s={[0.1, 0.04, 3.6]} m={sm.marble} />
      <B p={[3.9, 0.6, -7.9]} s={[1.0, 0.9, 2.6]} m={sm.fluted} />
      <B p={[3.9, 1.08, -7.9]} s={[1.12, 0.06, 2.75]} m={sm.marble} />
      <B p={[3.32, 0.6, -7.9]} s={[0.06, 0.96, 2.75]} m={sm.marble} />
      {[3.1, 3.9, 4.7].map((z, i) => (
        <group key={z}>
          <mesh position={[3.9, 3.5 - 0.55, -7.9 + (i - 1) * 0.9]} material={sm.metal}>
            <cylinderGeometry args={[0.004, 0.004, 1.1, 4]} />
          </mesh>
          <mesh position={[3.9, 2.32, -7.9 + (i - 1) * 0.9]} material={sm.glow}>
            <sphereGeometry args={[0.1, 24, 16]} />
          </mesh>
        </group>
      ))}
      <pointLight
        position={[3.9, 2.1, -7.9]}
        intensity={5}
        distance={6}
        decay={2}
        color="#ffdcb0"
      />
      <Prop id="potted_plant_02" h={0.7} p={[5.35, 0.15, -2.2]} />
    </group>
  );
}

export function Rooms({ sm }: { sm: SharedMats }) {
  const rm = useRoomMaterials();
  return (
    <group>
      {/* floors: herringbone oak in living + foyer, marble in dining/kitchen */}
      <B p={[-2.3, 0.16, -5]} s={[7.1, 0.02, 9.7]} m={rm.parquet} cast={false} />
      <B p={[3.5, 0.16, -5]} s={[4.7, 0.02, 9.7]} m={rm.marbleFloor} cast={false} />
      <Colonnade rm={rm} sm={sm} />
      <DiningKitchen rm={rm} sm={sm} />
    </group>
  );
}
