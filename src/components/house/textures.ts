import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

// Procedural, seeded canvas textures so the villa needs no external image assets.

type Draw = (g: CanvasRenderingContext2D, r: () => number, s: number) => void;

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(size: number, seed: number, draw: Draw, h = size): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = h;
  const g = c.getContext("2d")!;
  draw(g, rng(seed), size);
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function speckle(g: CanvasRenderingContext2D, r: () => number, s: number, n: number, a: number) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = r() < 0.5 ? `rgba(0,0,0,${a * r()})` : `rgba(255,255,255,${a * r()})`;
    const d = 1 + r() * 2;
    g.fillRect(r() * s, r() * s, d, d);
  }
}

// Draw a rect that wraps horizontally so the tile is seamless.
function wrapRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  s: number,
) {
  g.fillRect(x, y, w, h);
  if (x + w > s) g.fillRect(x - s, y, w, h);
  if (x < 0) g.fillRect(x + s, y, w, h);
}

// Stacked ledgestone, tile = 2m
const stone: Draw = (g, r, s) => {
  g.fillStyle = "#2e2a25";
  g.fillRect(0, 0, s, s);
  const rows: number[] = [];
  let total = 0;
  while (total < s) {
    const h = 14 + r() * 26;
    rows.push(h);
    total += h;
  }
  const k = s / total;
  let y = 0;
  for (const rh of rows) {
    const h = rh * k;
    const start = r() * s;
    let x = start;
    while (x < start + s) {
      const w = 60 + r() * 190;
      const l = 44 + r() * 26;
      g.fillStyle = `hsl(${30 + r() * 12}, ${7 + r() * 12}%, ${l}%)`;
      wrapRect(g, (x % s) + 1.5, y + 1.5, Math.min(w, start + s - x) - 3, h - 3, s);
      g.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.12})`;
      wrapRect(g, (x % s) + 1.5, y + h - 4, Math.min(w, start + s - x) - 3, 2.5, s);
      x += w;
    }
    y += h;
  }
  speckle(g, r, s, 9000, 0.25);
};

// Vertical timber slats, tile = 1m
const slats: Draw = (g, r, s) => {
  const n = 8;
  const w = s / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = `hsl(${24 + r() * 8}, ${38 + r() * 12}%, ${27 + r() * 10}%)`;
    g.fillRect(i * w, 0, w, s);
    for (let j = 0; j < 26; j++) {
      g.strokeStyle = `rgba(${r() < 0.5 ? "20,10,4" : "255,220,180"},${0.05 + r() * 0.1})`;
      g.lineWidth = 0.5 + r() * 1.5;
      g.beginPath();
      const x0 = i * w + 3 + r() * (w - 6);
      g.moveTo(x0, 0);
      for (let yy = 0; yy <= s; yy += 32) g.lineTo(x0 + Math.sin(yy * 0.02 + j) * 1.5, yy);
      g.stroke();
    }
    g.fillStyle = "#120c08";
    g.fillRect(i * w, 0, 5, s);
  }
};

// Wide oak planks, tile = 2m
const oak: Draw = (g, r, s) => {
  const rows = 10;
  const h = s / rows;
  for (let i = 0; i < rows; i++) {
    let x = -r() * s * 0.5;
    while (x < s) {
      const w = s * (0.45 + r() * 0.5);
      g.fillStyle = `hsl(${30 + r() * 6}, ${28 + r() * 10}%, ${56 + r() * 10}%)`;
      wrapRect(g, x, i * h, w, h, s);
      for (let j = 0; j < 14; j++) {
        g.strokeStyle = `rgba(90,55,25,${0.04 + r() * 0.08})`;
        g.lineWidth = 0.5 + r();
        g.beginPath();
        const y0 = i * h + 2 + r() * (h - 4);
        g.moveTo(Math.max(0, x), y0);
        g.bezierCurveTo(
          x + w * 0.3,
          y0 + r() * 4 - 2,
          x + w * 0.6,
          y0 + r() * 4 - 2,
          Math.min(s, x + w),
          y0,
        );
        g.stroke();
      }
      g.fillStyle = "rgba(40,25,10,.45)";
      wrapRect(g, x, i * h, 1.5, h, s);
      x += w;
    }
    g.fillStyle = "rgba(40,25,10,.5)";
    g.fillRect(0, i * h, s, 1.5);
  }
};

const walnut: Draw = (g, r, s) => {
  g.fillStyle = "#3a2618";
  g.fillRect(0, 0, s, s);
  for (let j = 0; j < 260; j++) {
    g.strokeStyle = `rgba(${r() < 0.6 ? "15,8,3" : "140,95,60"},${0.06 + r() * 0.14})`;
    g.lineWidth = 0.5 + r() * 2;
    g.beginPath();
    const x0 = r() * s;
    g.moveTo(x0, 0);
    for (let yy = 0; yy <= s; yy += 16) g.lineTo(x0 + Math.sin(yy * 0.012 + j) * 4, yy);
    g.stroke();
  }
};

const grass: Draw = (g, r, s) => {
  g.fillStyle = "#262c1c";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 14000; i++) {
    g.strokeStyle = `hsla(${70 + r() * 30}, ${20 + r() * 25}%, ${12 + r() * 18}%, .8)`;
    g.lineWidth = 1;
    const x = r() * s;
    const y = r() * s;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + r() * 3 - 1.5, y - 3 - r() * 5);
    g.stroke();
  }
};

const concrete: Draw = (g, r, s) => {
  g.fillStyle = "#b3aea4";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 60; i++) {
    const x = r() * s;
    const y = r() * s;
    const rad = 20 + r() * 90;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    const dark = r() < 0.5;
    gr.addColorStop(0, dark ? "rgba(70,65,58,.10)" : "rgba(255,255,250,.10)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  }
  speckle(g, r, s, 12000, 0.18);
};

const marble: Draw = (g, r, s) => {
  g.fillStyle = "#ebe7df";
  g.fillRect(0, 0, s, s);
  g.filter = "blur(1px)";
  for (let i = 0; i < 18; i++) {
    g.strokeStyle = `rgba(110,105,98,${0.12 + r() * 0.25})`;
    g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath();
    g.moveTo(r() * s, 0);
    g.bezierCurveTo(r() * s, s * 0.33, r() * s, s * 0.66, r() * s, s);
    g.stroke();
  }
  g.filter = "none";
};

const foliage: Draw = (g, r, s) => {
  g.fillStyle = "#3e4a30";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `hsla(${75 + r() * 25}, ${20 + r() * 25}%, ${16 + r() * 26}%, .9)`;
    g.beginPath();
    g.ellipse(r() * s, r() * s, 1.5 + r() * 3, 1 + r() * 1.5, r() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
};

const art: Draw = (g, r, s) => {
  g.fillStyle = "#d8cdb9";
  g.fillRect(0, 0, s, s);
  g.fillStyle = "#b5694a";
  g.beginPath();
  g.arc(s * 0.38, s * 0.46, s * 0.22, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#c79b52";
  g.fillRect(s * 0.55, s * 0.18, s * 0.26, s * 0.52);
  g.strokeStyle = "#1d1b18";
  g.lineWidth = s * 0.018;
  g.beginPath();
  g.arc(s * 0.6, s * 0.72, s * 0.3, Math.PI * 1.05, Math.PI * 1.75);
  g.stroke();
  speckle(g, r, s, 6000, 0.12);
};

const rug: Draw = (g, r, s) => {
  g.fillStyle = "#8c8274";
  g.fillRect(0, 0, s, s);
  speckle(g, r, s, 30000, 0.2);
  g.strokeStyle = "rgba(40,34,28,.5)";
  g.lineWidth = 6;
  g.strokeRect(s * 0.05, s * 0.05, s * 0.9, s * 0.9);
};

const flame: Draw = (g, r, s) => {
  g.clearRect(0, 0, s, s);
  for (let i = 0; i < 9; i++) {
    const x = s * (0.08 + i * 0.105 + (r() - 0.5) * 0.04);
    const h = s * (0.45 + r() * 0.45);
    const w = s * (0.05 + r() * 0.04);
    const gr = g.createLinearGradient(0, s, 0, s - h);
    gr.addColorStop(0, "rgba(255,170,60,1)");
    gr.addColorStop(0.35, "rgba(255,120,30,.85)");
    gr.addColorStop(1, "rgba(200,40,0,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x - w, s);
    g.quadraticCurveTo(x - w * 1.2, s - h * 0.5, x + (r() - 0.5) * w, s - h);
    g.quadraticCurveTo(x + w * 1.2, s - h * 0.5, x + w, s);
    g.fill();
  }
  const core = g.createLinearGradient(0, s, 0, s * 0.7);
  core.addColorStop(0, "rgba(255,235,180,.9)");
  core.addColorStop(1, "rgba(255,200,120,0)");
  g.fillStyle = core;
  g.fillRect(0, s * 0.7, s, s * 0.3);
};

// Looped bouclé pile, used as a bump + tint map for upholstery.
const boucle: Draw = (g, r, s) => {
  g.fillStyle = "#b0aaa2";
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 5200; i++) {
    const x = r() * s;
    const y = r() * s;
    const rad = 2 + r() * 3.5;
    const l = 55 + r() * 35;
    g.strokeStyle = `hsl(0,0%,${l}%)`;
    g.lineWidth = 1 + r();
    g.beginPath();
    g.arc(x, y, rad, 0, Math.PI * 2);
    g.stroke();
  }
};

// Chunky woven jute.
const jute: Draw = (g, r, s) => {
  g.fillStyle = "#9c8660";
  g.fillRect(0, 0, s, s);
  const step = 8;
  for (let y = 0; y < s; y += step) {
    for (let x = 0; x < s; x += step) {
      const on = ((x + y) / step) % 2 === 0;
      g.fillStyle = `hsl(${36 + r() * 6}, ${28 + r() * 10}%, ${on ? 52 + r() * 10 : 40 + r() * 8}%)`;
      if (on) g.fillRect(x, y + 1, step, step - 2);
      else g.fillRect(x + 1, y, step - 2, step);
    }
  }
  g.strokeStyle = "rgba(60,45,25,.35)";
  g.lineWidth = 10;
  g.strokeRect(12, 12, s - 24, s - 24);
};

// Bird-of-paradise leaf with transparent background.
const leaf: Draw = (g, r, s) => {
  g.clearRect(0, 0, s, s);
  const gr = g.createLinearGradient(0, 0, s, 0);
  gr.addColorStop(0, "#2f4a25");
  gr.addColorStop(0.5, "#4d7038");
  gr.addColorStop(1, "#2b4322");
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(s / 2, s);
  g.bezierCurveTo(s * 0.02, s * 0.75, s * 0.05, s * 0.2, s / 2, 0);
  g.bezierCurveTo(s * 0.95, s * 0.2, s * 0.98, s * 0.75, s / 2, s);
  g.fill();
  g.strokeStyle = "rgba(190,210,150,.55)";
  g.lineWidth = s * 0.012;
  g.beginPath();
  g.moveTo(s / 2, s);
  g.lineTo(s / 2, s * 0.03);
  g.stroke();
  g.strokeStyle = "rgba(20,35,15,.35)";
  g.lineWidth = 1.5;
  for (let y = s * 0.1; y < s * 0.95; y += s * 0.035) {
    g.beginPath();
    g.moveTo(s / 2, y);
    g.lineTo(s * 0.12, y - s * 0.08);
    g.moveTo(s / 2, y);
    g.lineTo(s * 0.88, y - s * 0.08);
    g.stroke();
  }
};

export type HouseTextures = Record<
  | "stone"
  | "slats"
  | "oak"
  | "walnut"
  | "grass"
  | "concrete"
  | "marble"
  | "foliage"
  | "art"
  | "rug"
  | "flame"
  | "boucle"
  | "jute"
  | "leaf",
  Texture
>;

export function createTextures(): HouseTextures {
  return {
    stone: make(1024, 11, stone),
    slats: make(512, 12, slats),
    oak: make(1024, 13, oak),
    walnut: make(512, 14, walnut),
    grass: make(512, 15, grass),
    concrete: make(512, 16, concrete),
    marble: make(512, 17, marble),
    foliage: make(256, 18, foliage),
    art: make(512, 19, art),
    rug: make(512, 20, rug),
    flame: make(256, 21, flame),
    boucle: make(512, 22, boucle),
    jute: make(512, 23, jute),
    leaf: make(256, 24, leaf),
  };
}

export function tiled(t: Texture, x: number, y: number): Texture {
  const c = t.clone();
  c.repeat.set(x, y);
  c.needsUpdate = true;
  return c;
}
