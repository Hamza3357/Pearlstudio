import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";

// Scroll-driven interior "walkthrough" built from Pearl Studio's own renders: frame sequences
// extracted from the studio's walkthrough films plus slow camera moves over still renders.
// It takes over from the 3D exterior once the camera passes through the front door.

type Seq = {
  kind: "seq";
  dir: string;
  count: number;
  start: number;
  end: number;
  zoom?: [number, number];
};
type Still = {
  kind: "still";
  src: string;
  start: number;
  end: number;
  zoom: [number, number];
  pan: [number, number, number, number];
  focusY?: number;
};
type Shot = Seq | Still;

const FADE = 0.012;
const REEL_IN: [number, number] = [0.245, 0.285];

const SHOTS: Shot[] = [
  { kind: "seq", dir: "living", count: 96, start: 0.265, end: 0.44, zoom: [1.06, 1] },
  {
    kind: "still",
    src: "living-cognac",
    start: 0.44,
    end: 0.53,
    zoom: [1.0, 1.14],
    pan: [0, 0, -0.03, -0.015],
  },
  { kind: "seq", dir: "kitchen", count: 96, start: 0.53, end: 0.68 },
  {
    kind: "still",
    src: "kitchen-noir",
    start: 0.68,
    end: 0.755,
    zoom: [1.12, 1.0],
    pan: [0.03, 0, -0.02, 0],
  },
  {
    kind: "still",
    src: "bedroom-navy",
    start: 0.755,
    end: 0.83,
    zoom: [1.0, 1.12],
    pan: [0, 0.02, 0.02, -0.01],
    focusY: 0.55,
  },
  {
    kind: "still",
    src: "bedroom-arched",
    start: 0.83,
    end: 0.895,
    zoom: [1.1, 1.0],
    pan: [0, -0.02, 0, 0.02],
    focusY: 0.45,
  },
  { kind: "seq", dir: "dressing", count: 56, start: 0.895, end: 1.001, zoom: [1, 1.05] },
];

const url = (shot: Shot, i = 0) =>
  shot.kind === "seq"
    ? `/interiors/${shot.dir}/${String(i).padStart(3, "0")}.webp`
    : `/interiors/${shot.src}.webp`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function InteriorReel({
  progress,
  exterior,
}: {
  progress: MutableRefObject<number>;
  exterior: RefObject<HTMLDivElement | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const images = new Map<string, HTMLImageElement>();
    const ready = (u: string) => {
      const im = images.get(u);
      return im && im.complete && im.naturalWidth > 0 ? im : undefined;
    };

    // Progressive preload: stills first, then each sequence in viewing order.
    const queue: string[] = [];
    SHOTS.filter((s) => s.kind === "still").forEach((s) => queue.push(url(s)));
    SHOTS.forEach((s) => {
      if (s.kind === "seq") {
        // Coarse pass (every 8th frame) so scrubbing works early, then fill in.
        for (let i = 0; i < s.count; i += 8) queue.push(url(s, i));
      }
    });
    SHOTS.forEach((s) => {
      if (s.kind === "seq") for (let i = 0; i < s.count; i++) queue.push(url(s, i));
    });
    let active = 0;
    let cancelled = false;
    let started = false;
    const pump = () => {
      started = true;
      while (!cancelled && active < 6 && queue.length) {
        const u = queue.shift()!;
        if (images.has(u)) continue;
        const im = new Image();
        im.decoding = "async";
        active++;
        im.onload = im.onerror = () => {
          active--;
          pump();
        };
        im.src = u;
        images.set(u, im);
      }
    };
    // Let the 3D exterior load first, unless the visitor is already heading for the door.
    const startLoad = window.setTimeout(pump, 3500);

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
    };
    size();
    window.addEventListener("resize", size);

    const frameFor = (s: Seq, f: number) => {
      // Nearest loaded frame, searching outward, so a partially loaded sequence still plays.
      for (let d = 0; d < s.count; d++) {
        const a = ready(url(s, f - d));
        if (a && f - d >= 0) return a;
        const b = f + d < s.count ? ready(url(s, f + d)) : undefined;
        if (b) return b;
      }
      return undefined;
    };

    const draw = (
      im: HTMLImageElement,
      alpha: number,
      zoom: number,
      px: number,
      py: number,
      focusY = 0.5,
    ) => {
      const cw = cv.width;
      const ch = cv.height;
      const k = Math.max(cw / im.naturalWidth, ch / im.naturalHeight) * zoom;
      const w = im.naturalWidth * k;
      const h = im.naturalHeight * k;
      const x = (cw - w) / 2 + px * cw;
      const y = (ch - h) * focusY + py * ch;
      g.globalAlpha = alpha;
      g.drawImage(im, x, y, w, h);
    };

    let smooth = progress.current;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(cv);

    const tick = (): void => {
      raf = 0;
      if (!visible) return;
      smooth += (progress.current - smooth) * 0.14;
      const p = smooth;
      if (!started && p > 0.1) pump();

      // Hand-off: the 3D exterior pushes through the doorway and dissolves into the renders.
      const k = ease(clamp01((p - REEL_IN[0]) / (REEL_IN[1] - REEL_IN[0])));
      const ext = exterior.current;
      if (ext) {
        ext.style.opacity = String(1 - k);
        ext.style.transform = `scale(${1 + k * 0.35})`;
      }
      cv.style.opacity = String(k);

      if (k > 0) {
        g.globalAlpha = 1;
        g.fillStyle = "#0f0f0e";
        g.fillRect(0, 0, cv.width, cv.height);
        for (const s of SHOTS) {
          if (p < s.start - FADE || p > s.end + FADE) continue;
          const t = clamp01((p - s.start) / (s.end - s.start));
          const alpha = Math.min(
            clamp01((p - (s.start - FADE)) / (2 * FADE)),
            clamp01((s.end + FADE - p) / (2 * FADE)),
          );
          if (alpha <= 0) continue;
          if (s.kind === "seq") {
            const im = frameFor(s, Math.round(t * (s.count - 1)));
            const z = s.zoom ? lerp(s.zoom[0], s.zoom[1], t) : 1;
            if (im) draw(im, alpha, z, 0, 0);
          } else {
            const im = ready(url(s));
            const e = ease(t);
            if (im)
              draw(
                im,
                alpha,
                lerp(s.zoom[0], s.zoom[1], e),
                lerp(s.pan[0], s.pan[2], e),
                lerp(s.pan[1], s.pan[3], e),
                s.focusY,
              );
          }
        }
        g.globalAlpha = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.clearTimeout(startLoad);
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
    };
  }, [progress, exterior]);

  return <canvas ref={canvas} className="journey__reel" aria-hidden="true" />;
}
