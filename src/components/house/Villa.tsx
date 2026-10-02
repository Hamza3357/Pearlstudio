import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  DoubleSide,
  IcosahedronGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  type BufferGeometry,
  type Group,
  type Material,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Rooms } from "./Rooms";
import { createTextures, tiled } from "./textures";

// Modern two-storey villa. Ground floor interior: x -6..6, z 0..-10, floor y 0.15, ceiling y 3.5.
// Front door sits on x -1..1 at z 0; the camera walks through it.

type V3 = [number, number, number];

function Box({ p, s, m, r, cast = true }: { p: V3; s: V3; m: Material; r?: V3; cast?: boolean }) {
  return (
    <mesh position={p} rotation={r ?? [0, 0, 0]} castShadow={cast} receiveShadow material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Soft({
  p,
  s,
  m,
  r,
  radius = 0.06,
}: {
  p: V3;
  s: V3;
  m: Material;
  r?: V3;
  radius?: number;
}) {
  return (
    <RoundedBox
      args={s}
      radius={radius}
      smoothness={4}
      position={p}
      rotation={r ?? [0, 0, 0]}
      castShadow
      receiveShadow
      material={m}
    />
  );
}

function useMaterials() {
  return useMemo(() => {
    const t = createTextures();
    const boucleTex = () => ({
      map: tiled(t.boucle, 3, 3),
      bumpMap: tiled(t.boucle, 3, 3),
      bumpScale: 2.5,
      roughness: 1,
    });
    const std = (o: ConstructorParameters<typeof MeshStandardMaterial>[0]) =>
      new MeshStandardMaterial(o);
    const stoneTex = (x: number, y: number) => ({
      map: tiled(t.stone, x, y),
      bumpMap: tiled(t.stone, x, y),
      bumpScale: 1.4,
      roughness: 0.92,
    });
    return {
      stoneFront: std(stoneTex(2.5, 1.7)),
      stoneHeader: std(stoneTex(1, 0.28)),
      stoneFin: std(stoneTex(6.5, 3.8)),
      stoneFeature: std({ ...stoneTex(1.6, 1.7), color: "#8a8378" }),
      slats: std({
        map: tiled(t.slats, 9.2, 3.2),
        bumpMap: tiled(t.slats, 9.2, 3.2),
        bumpScale: 1.2,
        roughness: 0.75,
      }),
      render: std({ color: "#e6e1d8", roughness: 0.88 }),
      plaster: std({ color: "#ebe5da", roughness: 0.95 }),
      roof: std({ color: "#2a2826", roughness: 0.7 }),
      terrace: std({ map: tiled(t.concrete, 8.5, 7.3), roughness: 0.85 }),
      paver: std({ map: tiled(t.concrete, 1, 0.45), roughness: 0.8 }),
      coping: std({ map: tiled(t.concrete, 3, 0.1), color: "#d7d1c6", roughness: 0.7 }),
      grass: std({ map: tiled(t.grass, 40, 40), roughness: 1 }),
      oak: std({ map: tiled(t.oak, 6, 5), roughness: 0.42 }),
      walnut: std({ map: tiled(t.walnut, 1, 1), roughness: 0.5 }),
      walnutTall: std({ map: tiled(t.walnut, 3, 2), roughness: 0.5 }),
      marble: std({ map: tiled(t.marble, 1.4, 0.6), roughness: 0.18 }),
      foliage: std({ map: tiled(t.foliage, 2, 2), color: "#9aa585", roughness: 1 }),
      cypress: std({ map: tiled(t.foliage, 1, 3), color: "#6f7d5f", roughness: 1 }),
      bark: std({ color: "#4a3f35", roughness: 1 }),
      hedge: std({ map: tiled(t.foliage, 6, 1), color: "#7c8a68", roughness: 1 }),
      metal: std({ color: "#1b1a19", roughness: 0.35, metalness: 0.8 }),
      brass: std({ color: "#b8975f", roughness: 0.3, metalness: 1 }),
      fabric: std({ color: "#dcd5c8", roughness: 1 }),
      fabricDark: std({ color: "#c9c0b0", roughness: 1 }),
      terracotta: std({ color: "#a65f43", roughness: 1 }),
      olive: std({ color: "#6d6a45", roughness: 1 }),
      leather: std({ color: "#8a5636", roughness: 0.55 }),
      travertine: std({ color: "#cdbea6", roughness: 0.6 }),
      ceramic: std({ color: "#2f2c29", roughness: 0.4 }),
      rug: std({ map: tiled(t.rug, 1, 1), roughness: 1 }),
      art: std({ map: tiled(t.art, 1, 1), roughness: 0.9 }),
      glow: std({ color: "#fff4e2", emissive: "#ffd9a3", emissiveIntensity: 3, toneMapped: false }),
      paper: std({ color: "#fff1dc", emissive: "#ffc27a", emissiveIntensity: 1.3, roughness: 1 }),
      flame: new MeshBasicMaterial({
        map: t.flame,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      embers: std({ color: "#1a0d06", emissive: "#ff5a14", emissiveIntensity: 0.9, roughness: 1 }),
      boucleCognac: std({ ...boucleTex(), color: "#a05a36" }),
      boucleOlive: std({ ...boucleTex(), color: "#77764a" }),
      boucleCream: std({ ...boucleTex(), color: "#efe6d6" }),
      jute: std({
        map: tiled(t.jute, 1, 1),
        bumpMap: tiled(t.jute, 1, 1),
        bumpScale: 2,
        roughness: 1,
      }),
      leaf: std({ map: t.leaf, alphaTest: 0.5, side: DoubleSide, roughness: 0.65 }),
      fluted: std({
        map: tiled(t.slats, 4, 1),
        bumpMap: tiled(t.slats, 4, 1),
        bumpScale: 1.5,
        color: "#5a5856",
        roughness: 0.45,
      }),
      niche: std({
        color: "#ead7ba",
        emissive: "#ffcf99",
        emissiveIntensity: 0.22,
        roughness: 0.95,
      }),
      firebox: std({ color: "#0b0a09", roughness: 0.9 }),
      glass: new MeshPhysicalMaterial({
        color: "#a9b8b8",
        roughness: 0.04,
        metalness: 0.15,
        transparent: true,
        opacity: 0.22,
        clearcoat: 1,
        envMapIntensity: 1.6,
        depthWrite: false,
      }),
      glassUpper: new MeshPhysicalMaterial({
        color: "#1d2226",
        roughness: 0.06,
        metalness: 0.3,
        clearcoat: 1,
        emissive: "#e8b27a",
        emissiveIntensity: 0.07,
        envMapIntensity: 1.4,
      }),
    };
  }, []);
}

type Mats = ReturnType<typeof useMaterials>;

// Organic blob geometry for tree canopies / shrubs.
function useBlob(seed: number) {
  return useMemo(() => {
    let g: BufferGeometry = new IcosahedronGeometry(1, 3);
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    g = mergeVertices(g);
    const p = g.attributes["position"]!;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const n =
        Math.sin(x * 3.1 + seed) * Math.cos(y * 2.7 + seed * 1.3) * Math.sin(z * 3.7 + seed * 0.7);
      const k = 1 + n * 0.22 + Math.sin(x * 9 + y * 7 + z * 8 + seed) * 0.05;
      p.setXYZ(i, x * k, y * k, z * k);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
}

function OliveTree({ p, s = 1, seed = 1, m }: { p: V3; s?: number; seed?: number; m: Mats }) {
  const blob = useBlob(seed);
  const puffs: [V3, number][] = [
    [[0, 3.3, 0], 1.35],
    [[1.1, 2.9, 0.3], 1.0],
    [[-1.0, 3.0, -0.4], 1.05],
    [[0.2, 3.1, 1.0], 0.95],
    [[-0.3, 3.9, -0.6], 0.9],
    [[0.6, 3.8, 0.5], 0.85],
  ];
  return (
    <group position={p} scale={s} rotation-y={seed}>
      <mesh position={[0, 1.2, 0]} rotation-z={0.08} castShadow material={m.bark}>
        <cylinderGeometry args={[0.12, 0.2, 2.4, 8]} />
      </mesh>
      <mesh position={[0.35, 2.3, 0.1]} rotation-z={-0.6} castShadow material={m.bark}>
        <cylinderGeometry args={[0.06, 0.1, 1.3, 6]} />
      </mesh>
      <mesh position={[-0.3, 2.4, -0.1]} rotation-z={0.55} castShadow material={m.bark}>
        <cylinderGeometry args={[0.05, 0.09, 1.2, 6]} />
      </mesh>
      {puffs.map(([pp, r], i) => (
        <mesh
          key={i}
          geometry={blob}
          position={pp}
          scale={[r, r * 0.78, r]}
          rotation={[i, i * 2, 0]}
          castShadow
          receiveShadow
          material={m.foliage}
        />
      ))}
    </group>
  );
}

function Cypress({ p, h = 7, seed = 1, m }: { p: V3; h?: number; seed?: number; m: Mats }) {
  const blob = useBlob(seed + 10);
  return (
    <group position={p}>
      <mesh
        geometry={blob}
        position={[0, h / 2 + 0.2, 0]}
        scale={[0.75, h / 2, 0.75]}
        castShadow
        receiveShadow
        material={m.cypress}
      />
    </group>
  );
}

function Shrub({ p, s = 0.6, seed = 1, m }: { p: V3; s?: number; seed?: number; m: Mats }) {
  const blob = useBlob(seed + 20);
  return (
    <mesh
      geometry={blob}
      position={[p[0], p[1] + s * 0.6, p[2]]}
      scale={[s, s * 0.8, s]}
      castShadow
      receiveShadow
      material={m.hedge}
    />
  );
}

// Pocket door that slides into the stone wall as the camera approaches.
function Door({ m, progress }: { m: Mats; progress: { current: number } }) {
  const leaf = useRef<Group>(null);
  useFrame(() => {
    const t = Math.min(1, Math.max(0, (progress.current - 0.1) / 0.1));
    const e = t * t * (3 - 2 * t);
    if (leaf.current) leaf.current.position.x = -0.94 - e * 1.86;
  });
  return (
    <group ref={leaf} position={[-0.94, 0.15, 0.02]}>
      <Box p={[0.93, 1.39, 0]} s={[1.86, 2.78, 0.07]} m={m.walnut} />
      <Box p={[1.62, 1.3, 0.08]} s={[0.035, 1.3, 0.035]} m={m.brass} />
      <Box p={[1.62, 1.3, -0.08]} s={[0.035, 1.3, 0.035]} m={m.brass} />
    </group>
  );
}

function Uplight({ from, to, intensity = 30 }: { from: V3; to: V3; intensity?: number }) {
  const target = useMemo(() => {
    const o = new Object3D();
    o.position.set(...to);
    return o;
  }, [to]);
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={from}
        target={target}
        angle={0.55}
        penumbra={1}
        intensity={intensity}
        distance={9}
        decay={2}
        color="#ffd6a0"
      />
    </>
  );
}

function Exterior({ m, reflect }: { m: Mats; reflect: boolean }) {
  const pavers: number[] = [];
  for (let z = 3.6; z < 19; z += 1.08) pavers.push(z);
  const bollards = [5, 8.8, 12.6, 16.4];
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={m.grass}>
        <planeGeometry args={[160, 160]} />
      </mesh>
      {/* terrace plinth */}
      <Box p={[0, 0.075, -4.25]} s={[17, 0.15, 14.5]} m={m.terrace} cast={false} />
      {/* stepping pavers */}
      {pavers.map((z) => (
        <Box key={z} p={[0, 0.03, z]} s={[2, 0.08, 0.95]} m={m.paver} cast={false} />
      ))}
      {/* path bollards */}
      {bollards.map((z) =>
        [-1.5, 1.5].map((x) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Box p={[0, 0.3, 0]} s={[0.12, 0.6, 0.12]} m={m.metal} />
            <Box p={[0, 0.5, 0.061]} s={[0.08, 0.06, 0.005]} m={m.glow} cast={false} />
          </group>
        )),
      )}
      <pointLight position={[1.5, 0.5, 8.8]} intensity={1.6} distance={4} color="#ffcf95" />
      <pointLight position={[-1.5, 0.5, 14.5]} intensity={1.6} distance={4} color="#ffcf95" />

      {/* reflecting pool */}
      <Box p={[5.4, 0.06, 4.1]} s={[6.6, 0.12, 0.3]} m={m.coping} />
      <Box p={[5.4, 0.06, 9.4]} s={[6.6, 0.12, 0.3]} m={m.coping} />
      <Box p={[2.25, 0.06, 6.75]} s={[0.3, 0.12, 5.6]} m={m.coping} />
      <Box p={[8.55, 0.06, 6.75]} s={[0.3, 0.12, 5.6]} m={m.coping} />
      <mesh position={[5.4, 0.05, 6.75]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[6, 5]} />
        {reflect ? (
          <MeshReflectorMaterial
            resolution={1024}
            blur={[60, 20]}
            mixBlur={0.6}
            mixStrength={4}
            mixContrast={1}
            mirror={0.85}
            roughness={0.15}
            metalness={0.4}
            depthScale={0}
            color="#1b2528"
          />
        ) : (
          <meshStandardMaterial color="#1b2528" roughness={0.05} metalness={0.8} />
        )}
      </mesh>

      {/* hedges + planting */}
      <Soft p={[-4.2, 0.45, 3.5]} s={[5.4, 0.6, 0.7]} m={m.hedge} radius={0.25} />
      <Soft p={[-7.8, 0.45, -3]} s={[0.7, 0.6, 11]} m={m.hedge} radius={0.25} />
      {[
        [-2.2, 0.15, 2.4, 0.45],
        [-3.6, 0.15, 2.5, 0.55],
        [9.4, 0, 3.2, 0.7],
        [9.8, 0, 9.8, 0.6],
        [-2.2, 0, 10, 0.5],
        [-2.6, 0, 13.4, 0.6],
      ].map(([x, y, z, s], i) => (
        <Shrub key={i} p={[x!, y!, z!]} s={s!} seed={i + 3} m={m} />
      ))}
      <OliveTree p={[-10.5, 0, 5.5]} s={1.15} seed={1} m={m} />
      <OliveTree p={[-13, 0, -5]} s={1.3} seed={2} m={m} />
      <OliveTree p={[11.5, 0, -2]} s={1.1} seed={3} m={m} />
      <OliveTree p={[-4, 0, -15]} s={1.4} seed={4} m={m} />
      <OliveTree p={[-8, 0, 12.5]} s={0.9} seed={5} m={m} />
      {[
        [11, -7, 8],
        [12.6, -10, 9],
        [9.2, -12.5, 7.5],
        [-9.5, -11, 8.5],
        [14, -4.5, 7],
      ].map(([x, z, h], i) => (
        <Cypress key={i} p={[x!, 0, z!]} h={h!} seed={i} m={m} />
      ))}
    </group>
  );
}

function Shell({ m, progress }: { m: Mats; progress: { current: number } }) {
  const mullionsFront = [1.03, 2.25, 3.5, 4.75, 5.97];
  const mullionsSide = [-1.5, -3, -4.5, -6];
  return (
    <group>
      {/* front: stone wall, door, glass */}
      <Box p={[-3.5, 1.825, 0]} s={[5, 3.35, 0.3]} m={m.stoneFront} />
      <Box p={[0, 3.225, 0]} s={[2, 0.55, 0.3]} m={m.stoneHeader} />
      <Box p={[-0.97, 1.55, 0]} s={[0.06, 2.8, 0.34]} m={m.metal} />
      <Box p={[0.97, 1.55, 0]} s={[0.06, 2.8, 0.34]} m={m.metal} />
      <Box p={[0, 2.92, 0]} s={[2, 0.06, 0.34]} m={m.metal} />
      <Door m={m} progress={progress} />

      <mesh position={[3.5, 1.825, 0]} material={m.glass}>
        <boxGeometry args={[5, 3.35, 0.03]} />
      </mesh>
      {mullionsFront.map((x) => (
        <Box key={x} p={[x, 1.825, 0]} s={[0.06, 3.35, 0.12]} m={m.metal} />
      ))}
      <Box p={[3.5, 0.19, 0]} s={[5, 0.08, 0.14]} m={m.metal} />

      {/* right side: corner glazing then solid */}
      <mesh position={[6, 1.825, -3]} material={m.glass}>
        <boxGeometry args={[0.03, 3.35, 6]} />
      </mesh>
      {mullionsSide.map((z) => (
        <Box key={z} p={[6, 1.825, z]} s={[0.12, 3.35, 0.06]} m={m.metal} />
      ))}
      <Box p={[6, 0.19, -3]} s={[0.14, 0.08, 6]} m={m.metal} />
      <Box p={[6, 1.825, -8]} s={[0.3, 3.35, 4]} m={m.render} />

      {/* left + back walls */}
      <Box p={[-6, 1.825, -5]} s={[0.3, 3.35, 10]} m={m.plaster} />
      <Box p={[0, 1.825, -10]} s={[12.3, 3.35, 0.3]} m={m.plaster} />

      {/* ground-floor roof slab with deep eaves */}
      <Box p={[-0.1, 3.65, -4.25]} s={[13.8, 0.3, 12.1]} m={m.render} />
      {/* soffit downlights */}
      {[-5.5, -3.5, -1.5, 0, 1.5, 3.5, 5.5].map((x) => (
        <mesh
          key={x}
          position={[x, 3.495, x > 1 ? 0.9 : 1.1]}
          rotation-x={Math.PI / 2}
          material={m.glow}
        >
          <circleGeometry args={[0.06, 20]} />
        </mesh>
      ))}

      {/* cantilevered timber upper volume */}
      <Box p={[-2.4, 5.4, -2.85]} s={[9.2, 3.2, 9.3]} m={m.slats} />
      <Box p={[-2.4, 7.1, -2.85]} s={[9.6, 0.2, 9.7]} m={m.roof} />
      <mesh position={[-2.4, 5.4, 1.515]} material={m.glassUpper}>
        <boxGeometry args={[7.6, 1.8, 0.04]} />
      </mesh>
      <Box p={[-2.4, 6.33, 1.53]} s={[7.7, 0.07, 0.08]} m={m.metal} />
      <Box p={[-2.4, 4.47, 1.53]} s={[7.7, 0.07, 0.08]} m={m.metal} />
      {[-6.2, -4.3, -2.4, -0.5, 1.4].map((x) => (
        <Box key={x} p={[x, 5.4, 1.53]} s={[0.06, 1.9, 0.08]} m={m.metal} />
      ))}
      <mesh position={[2.215, 5.4, -1.8]} material={m.glassUpper}>
        <boxGeometry args={[0.04, 1.8, 4.4]} />
      </mesh>

      {/* stone fin framing the west side */}
      <Box p={[-7.25, 3.8, -4.1]} s={[0.5, 7.6, 13]} m={m.stoneFin} />

      {/* exterior lighting */}
      <Uplight from={[-4.8, 0.2, 0.9]} to={[-4.8, 3.4, 0.05]} />
      <Uplight from={[-2.2, 0.2, 0.9]} to={[-2.2, 3.4, 0.05]} />
      <Uplight from={[-7.25, 0.2, 3]} to={[-7.25, 6.5, 2.3]} intensity={40} />
      <pointLight position={[0, 3.2, 1]} intensity={3} distance={5} color="#ffd6a0" />
    </group>
  );
}

export function Villa({ progress, mobile }: { progress: { current: number }; mobile: boolean }) {
  const m = useMaterials();
  return (
    <group>
      <Exterior m={m} reflect={!mobile} />
      <Shell m={m} progress={progress} />
      <Suspense fallback={null}>
        <Rooms sm={m} />
      </Suspense>
    </group>
  );
}
