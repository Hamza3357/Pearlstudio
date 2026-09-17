import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group } from "three";

function Sculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);

  useFrame(({ pointer }, rawDelta) => {
    if (!group.current || reducedMotion) return;
    const delta = Math.min(rawDelta, 0.05);
    group.current.rotation.y += delta * 0.09;
    group.current.rotation.x += (pointer.y * 0.06 - group.current.rotation.x) * (1 - Math.exp(-2 * delta));
    group.current.position.x += (pointer.x * 0.18 - group.current.position.x) * (1 - Math.exp(-2 * delta));
  });

  return (
    <group ref={group} rotation={[0.08, -0.5, 0]}>
      <mesh castShadow position={[-0.85, 0.15, 0]}>
        <boxGeometry args={[1.8, 3.5, 1.8]} />
        <meshStandardMaterial color="#9b978f" roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh castShadow position={[0.65, -0.45, 0.3]}>
        <boxGeometry args={[2.7, 0.55, 2.5]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0.75, 0.75, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[2.7, 0.24, 1.25]} />
        <meshStandardMaterial color="#67645f" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0.75, 0.1, 0.72]}>
        <boxGeometry args={[1.5, 1.55, 0.07]} />
        <meshPhysicalMaterial color="#b8c0bd" transparent opacity={0.3} roughness={0.08} metalness={0.15} transmission={0.45} />
      </mesh>
      <mesh castShadow position={[0.05, -1.42, -0.1]}>
        <boxGeometry args={[4.4, 0.12, 3.4]} />
        <meshStandardMaterial color="#3b3a37" roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function ArchitecturalScene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [5.8, 3.2, 7.2], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.42} />
      <directionalLight position={[5, 7, 4]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Suspense fallback={null}>
        <Sculpture reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2.8} far={4} />
        <Environment>
          <Lightformer intensity={2.2} position={[0, 5, 2]} scale={[8, 8, 1]} />
          <Lightformer intensity={1.2} color="#d8d2c4" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}