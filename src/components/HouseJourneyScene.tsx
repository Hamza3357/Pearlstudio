import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, type MutableRefObject } from "react";
import { Vector3 } from "three";

// Camera keyframes: [progress, position, lookAt]
const KEYS: [number, [number, number, number], [number, number, number]][] = [
  [0, [9, 4.2, 20], [0, 2, -3]],
  [0.3, [1.5, 2.2, 8], [0, 1.6, 0]],
  [0.5, [0, 1.6, 1.4], [0, 1.5, -4]],
  [0.72, [0, 1.6, -3], [-1.5, 1.2, -8]],
  [1, [2.6, 1.7, -4.2], [-3, 1, -8.5]],
];
const smooth = (t: number) => t * t * (3 - 2 * t);
const pos = new Vector3();
const look = new Vector3();
const a = new Vector3();
const b = new Vector3();

function CameraRig({ progress }: { progress: MutableRefObject<number> }) {
  const { camera } = useThree();
  const cur = { v: 0 };
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    cur.v = (camera.userData["p"] ?? 0) as number;
    cur.v += (progress.current - cur.v) * (1 - Math.exp(-6 * dt));
    camera.userData["p"] = cur.v;
    const p = cur.v;
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1]![0]) i++;
    const [p0, c0, l0] = KEYS[i]!;
    const [p1, c1, l1] = KEYS[i + 1]!;
    const t = smooth(Math.min(1, Math.max(0, (p - p0) / (p1 - p0))));
    pos.copy(a.set(c0[0], c0[1], c0[2])).lerp(b.set(c1[0], c1[1], c1[2]), t);
    look.copy(a.set(l0[0], l0[1], l0[2])).lerp(b.set(l1[0], l1[1], l1[2]), t);
    camera.position.copy(pos);
    camera.lookAt(look);
  });
  return null;
}

const concrete = { color: "#a19d95", roughness: 0.85 };
const stone = { color: "#d8d2c4", roughness: 0.55 };

function Box({ p, s, m = concrete, cast = true }: { p: [number, number, number]; s: [number, number, number]; m?: { color: string; roughness: number; metalness?: number }; cast?: boolean }) {
  return (
    <mesh position={p} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial {...m} />
    </mesh>
  );
}

function House() {
  // Footprint: x -6..6, z 0..-10, height 4. Door gap at x -0.8..0.8, height 2.8
  return (
    <group>
      {/* ground + reflecting pool */}
      <Box p={[0, -0.05, -2]} s={[60, 0.1, 60]} m={{ color: "#2c2b28", roughness: 0.95 }} cast={false} />
      <mesh position={[-5, 0.02, 5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#39413f" roughness={0.05} metalness={0.6} />
      </mesh>
      {/* path to door */}
      <Box p={[0, 0.03, 5]} s={[1.8, 0.06, 10]} m={stone} cast={false} />
      {/* interior floor */}
      <Box p={[0, 0.05, -5]} s={[12, 0.1, 10]} m={{ color: "#bfb6a5", roughness: 0.4 }} cast={false} />
      {/* front wall with door opening */}
      <Box p={[-3.4, 2, 0]} s={[5.2, 4, 0.3]} m={stone} />
      <Box p={[3.4, 2, 0]} s={[5.2, 4, 0.3]} m={stone} />
      <Box p={[0, 3.4, 0]} s={[1.6, 1.2, 0.3]} m={stone} />
      {/* door frame accent */}
      <Box p={[0, 2.85, 0.18]} s={[2, 0.08, 0.1]} m={{ color: "#6b6760", roughness: 0.3, metalness: 0.7 }} />
      {/* side + back walls */}
      <Box p={[-6, 2, -5]} s={[0.3, 4, 10]} />
      <Box p={[6, 2, -5]} s={[0.3, 4, 10]} />
      <Box p={[0, 2, -10]} s={[12, 4, 0.3]} />
      {/* cantilevered roof slab */}
      <Box p={[0.8, 4.15, -4.2]} s={[14, 0.3, 12]} m={{ color: "#57544f", roughness: 0.7 }} />
      {/* glass band on front */}
      <mesh position={[3.4, 2.1, 0.17]}>
        <boxGeometry args={[4, 1.6, 0.04]} />
        <meshPhysicalMaterial color="#9fa9a6" roughness={0.05} metalness={0.3} transparent opacity={0.55} />
      </mesh>
      {/* upper volume */}
      <Box p={[-2.5, 5.6, -5]} s={[6, 2.6, 7]} m={{ color: "#8d8981", roughness: 0.8 }} />

      {/* ---- interior living room ---- */}
      <Box p={[-3, 0.12, -7.5]} s={[5, 0.04, 3.4]} m={{ color: "#6f675c", roughness: 1 }} cast={false} />
      {/* sofa */}
      <Box p={[-3, 0.4, -9.1]} s={[3.6, 0.5, 1]} m={{ color: "#e9e3d6", roughness: 0.9 }} />
      <Box p={[-3, 0.9, -9.55]} s={[3.6, 0.6, 0.25]} m={{ color: "#e9e3d6", roughness: 0.9 }} />
      {/* coffee table */}
      <Box p={[-3, 0.35, -7.5]} s={[1.6, 0.1, 0.9]} m={{ color: "#2b2a27", roughness: 0.3, metalness: 0.4 }} />
      <Box p={[-3, 0.18, -7.5]} s={[0.4, 0.3, 0.4]} m={{ color: "#2b2a27", roughness: 0.3 }} />
      {/* lounge chair */}
      <Box p={[-0.2, 0.4, -7.4]} s={[1, 0.5, 1]} m={{ color: "#8b6f55", roughness: 0.7 }} />
      {/* art panel + shelf */}
      <Box p={[-5.8, 2, -7.5]} s={[0.05, 1.6, 2.4]} m={{ color: "#c9bfae", roughness: 0.6 }} />
      <Box p={[-5.7, 1, -4.5]} s={[0.3, 0.06, 2.6]} m={{ color: "#3a3835", roughness: 0.5 }} />
      {/* pendant */}
      <mesh position={[-3, 2.9, -7.5]}>
        <sphereGeometry args={[0.28, 24, 16]} />
        <meshStandardMaterial color="#f4f1ea" emissive="#f4e3c4" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[-3, 2.6, -7.5]} intensity={6} distance={10} color="#f4e3c4" />
      <pointLight position={[2, 3, -4]} intensity={3} distance={9} color="#e8ded0" />
    </group>
  );
}

export default function HouseJourneyScene({ progress, mobile }: { progress: MutableRefObject<number>; mobile: boolean }) {
  return (
    <Canvas shadows={!mobile} dpr={mobile ? 1 : [1, 1.5]} camera={{ position: [9, 4.2, 20], fov: mobile ? 62 : 45, near: 0.1, far: 120 }}>
      <color attach="background" args={["#0f0f0e"]} />
      <fog attach="fog" args={["#0f0f0e", 22, 60]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 12, 10]} intensity={2.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} />
      <CameraRig progress={progress} />
      <Suspense fallback={null}>
        <House />
        <Environment>
          <Lightformer intensity={1.6} position={[0, 6, 4]} scale={[10, 6, 1]} />
          <Lightformer intensity={0.8} color="#d8d2c4" position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
