import { Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { Villa } from "./house/Villa";

// Camera keyframes: [progress, position, lookAt]. Joined by Catmull-Rom splines so the
// camera flows continuously instead of pausing at every key.
type Key = [number, [number, number, number], [number, number, number]];
const KEYS: Key[] = [
  [0, [12.5, 3.4, 21], [-3.4, 2.6, -2]],
  [0.08, [7, 2.6, 13], [-0.8, 2.1, -1]],
  [0.16, [1.4, 1.75, 5.6], [0, 1.7, 0]],
  [0.225, [0.1, 1.65, 1.2], [0, 1.6, -4]],
  // push through the doorway; the render walkthrough takes over from here
  [0.29, [0.2, 1.62, -1.4], [-0.4, 1.5, -6]],
  [1, [0.3, 1.62, -2.2], [-0.5, 1.5, -7]],
];
const MOBILE_START: Key = [0, [9, 4.2, 25], [0.8, 2.2, -3]];


const smooth = (t: number) => t * t * (3 - 2 * t);
const look = new Vector3();

function CameraRig({
  progress,
  smoothed,
  mobile,
}: {
  progress: MutableRefObject<number>;
  smoothed: MutableRefObject<number>;
  mobile: boolean;
}) {
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const { posCurve, lookCurve } = useMemo(() => {
    const keys = mobile ? [MOBILE_START, ...KEYS.slice(1)] : KEYS;
    return {
      posCurve: new CatmullRomCurve3(
        keys.map((k) => new Vector3(...k[1])),
        false,
        "centripetal",
      ),
      lookCurve: new CatmullRomCurve3(
        keys.map((k) => new Vector3(...k[2])),
        false,
        "centripetal",
      ),
    };
  }, [mobile]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    smoothed.current += (progress.current - smoothed.current) * (1 - Math.exp(-4 * dt));
    const p = smoothed.current;

    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1]![0]) i++;
    const p0 = KEYS[i]![0];
    const p1 = KEYS[i + 1]![0];
    // Ease only at the very start and end; linear through the middle keeps momentum.
    let local = Math.min(1, Math.max(0, (p - p0) / (p1 - p0)));
    if (i === 0) local = local * local * 0.5 + local * 0.5;
    if (i === KEYS.length - 2) local = smooth(local);
    const u = (i + local) / (KEYS.length - 1);

    posCurve.getPoint(u, camera.position);
    lookCurve.getPoint(u, look);

    // Gentle pointer parallax on the exterior shot, fading once inside.
    const ptr = pointer.current;
    ptr.sx += (ptr.x - ptr.sx) * (1 - Math.exp(-3 * dt));
    ptr.sy += (ptr.y - ptr.sy) * (1 - Math.exp(-3 * dt));
    const amt = 1 - smooth(Math.min(1, p / 0.3));
    camera.position.x += ptr.sx * 0.9 * amt;
    camera.position.y -= ptr.sy * 0.4 * amt;
    camera.lookAt(look);
  });
  return null;
}

export default function HouseJourneyScene({
  progress,
  mobile,
  paused = false,
}: {
  progress: MutableRefObject<number>;
  mobile: boolean;
  paused?: boolean;
}) {
  const smoothed = useRef(progress.current);
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      shadows={!mobile}
      dpr={mobile ? 1 : [1, 1.75]}
      gl={{ antialias: true, toneMappingExposure: 1.05 }}
      camera={{ position: KEYS[0]![1], fov: mobile ? 60 : 42, near: 0.08, far: 160 }}
    >
      <color attach="background" args={["#0f0f0e"]} />
      <fog attach="fog" args={["#0f0f0e", 26, 75]} />
      <hemisphereLight args={["#aeb6c4", "#1c1a16", 0.55]} />
      {/* low evening sun raking across the facade */}
      <directionalLight
        position={[16, 10, 12]}
        intensity={2.1}
        color="#ffe0bd"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      {/* cool moon-ish rim from behind */}
      <directionalLight position={[-12, 8, -14]} intensity={0.5} color="#9fb2d0" />
      <CameraRig progress={progress} smoothed={smoothed} mobile={mobile} />
      <Suspense fallback={null}>
        <Villa progress={smoothed} mobile={mobile} />
        {/* real interior light probe for reflections on marble, brass, glass and velvet */}
        <Environment files="/house/hdri/lythwood_room.hdr" environmentIntensity={0.55} />
      </Suspense>
    </Canvas>
  );
}
