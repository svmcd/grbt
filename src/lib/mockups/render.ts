// Renders one Memleket product image (design x garment x colour x side) on demand, from the
// blank garment photos in designs/templates/<garment>/<side>-<colorKey>.png and the artwork in
// designs/memleket/<slug>/. Server only (sharp, fs). Used by src/app/api/mockup/ and by
// scripts/generate-mockups.mjs (local pre-render for checking).
//
// Keep this file free of imports other than node built-ins and sharp, and free of TypeScript
// that Node cannot strip (enums, namespaces, parameter properties): the local script runs it
// with Node's built-in type stripping.
//
// logo/name/plate artwork: only its shape (alpha) is used; it is printed in the garment
// colour's ink (src/lib/garments.ts `ink`).

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type MockupGarment = "tshirt" | "hoodie" | "sweater" | "longsleeve";
export type MockupSide = "front" | "back";
export type MockupInk = "white" | "black";

// The file names the site uses under /products/collections/memleket/<slug>/<colorKey>/
export const MOCKUP_FILES: Record<string, { garment: MockupGarment; side: MockupSide }> = {
  "front.png": { garment: "tshirt", side: "front" },
  "back.png": { garment: "tshirt", side: "back" },
  "hoodie_front.png": { garment: "hoodie", side: "front" },
  "hoodie_back.png": { garment: "hoodie", side: "back" },
  "sweater_front.png": { garment: "sweater", side: "front" },
  "sweater_back.png": { garment: "sweater", side: "back" },
  "longsleeve_front.png": { garment: "longsleeve", side: "front" },
  "longsleeve_back.png": { garment: "longsleeve", side: "back" },
};

export const OUTPUT_SIZE = 1600;

const DESIGNS_DIR = path.join(process.cwd(), "designs");
const TEMPLATES = path.join(DESIGNS_DIR, "templates");
const MEMLEKET = path.join(DESIGNS_DIR, "memleket");
const LOGO = path.join(TEMPLATES, "logo.svg");

type Box = { left: number; top: number; width: number; height: number };
type Point = [number, number];
// Our neck label over the supplier's tag. `clip` (canvas coordinates) is the part of the tag
// that is visible in the photo, where the hood folds over it; wordX/wordY place the wordmark
// centre (0 = top/left, 1 = bottom/right of the box) and wordW its width (fraction of the box).
type Tag = Box & { clip?: Point[]; wordX?: number; wordY?: number; wordW?: number };
type Placement = {
  canvas: number; // templates are square, this many pixels
  back: { x: number; y: number; scale: number }; // print origin (frame top-left) and scale
  logo: { cx: number; top: number; height: number }; // chest logo
  // Sleeve number on the wearer's left sleeve (image right). rotate = degrees clockwise from
  // upright: the number stands upright along the arm with its top toward the shoulder, so it
  // is minus the sleeve's angle from vertical.
  plate: { rotate: number; scale: number; cx: number; cy: number };
  tag?: Tag;
  tagByColor?: Record<string, Tag>;
};

// The back print is laid out in T-shirt units (from the original Figma file) and scaled.
const PRINT = {
  frame: { left: 529, top: 318, width: 705, height: 828, stroke: 2 },
  photo: { left: 552, top: 345, width: 659, height: 775 },
  // PNG artwork is a full crop of the print box; SVG exports from Figma are
  // tight around the letters, so they go into the tighter Figma boxes.
  name: { left: 520, top: 1152, width: 722, height: 148 },
  nameSvg: { left: 530, top: 1170, width: 703, height: 106 },
};
const PLATE = {
  png: { left: 1400, top: 420, width: 320, height: 300 },
  svg: { left: 1430, top: 455, width: 250, height: 220 },
};
const PRINT_ORIGIN = { x: 528, y: 317 }; // top-left of the frame in PRINT units

// Measured on the Cloprod photos (designs/templates, see scripts/fetch-cloprod-blanks.mjs).
// All colours of a garment share one photo geometry, except where the neck label sits.
export const PLACEMENTS: Record<MockupGarment, Placement> = {
  // TS0CI, 1600x1594 padded to 1600x1600
  tshirt: {
    canvas: 1600,
    back: { x: 545, y: 474, scale: 0.7 },
    logo: { cx: 792, top: 470, height: 32 },
    plate: { rotate: -64, scale: 0.46, cx: 1335, cy: 578 },
    tag: { left: 771, top: 337, width: 56, height: 60 },
  },
  // HD0C4, front 1600x1643 and back 1600x1625 padded to 1643x1643
  hoodie: {
    canvas: 1643,
    back: { x: 649, y: 650, scale: 0.47 },
    logo: { cx: 821, top: 585, height: 28 },
    plate: { rotate: -14, scale: 0.4, cx: 1241, cy: 830 },
    tagByColor: {
      siyah: { left: 797, top: 443, width: 44, height: 40, wordY: 0.36, clip: [[797, 443], [841, 443], [841, 464], [820, 482], [797, 468]] },
      "gece-mavisi": { left: 797, top: 443, width: 44, height: 40, wordY: 0.36, clip: [[797, 443], [841, 443], [841, 464], [820, 482], [797, 468]] },
      antrasit: { left: 797, top: 443, width: 44, height: 40, wordY: 0.36, clip: [[797, 443], [841, 443], [841, 462], [819, 482], [797, 461]] },
      "gri-melanj": { left: 799, top: 439, width: 42, height: 43, wordY: 0.36, clip: [[799, 439], [841, 439], [841, 469], [828, 482], [799, 466]] },
      krem: { left: 804, top: 449, width: 32, height: 26, wordY: 0.33, clip: [[804, 449], [836, 449], [836, 459], [820, 475], [804, 475]] },
      yulaf: { left: 805, top: 449, width: 36, height: 32, wordY: 0.3, wordX: 0.6, wordW: 0.7, clip: [[805, 449], [841, 449], [841, 481], [829, 481], [805, 457]] },
    },
  },
  // SS0C3, 1600x1593 padded to 1600x1600
  sweater: {
    canvas: 1600,
    back: { x: 565, y: 419, scale: 0.664 },
    logo: { cx: 796, top: 429, height: 30 },
    plate: { rotate: -15, scale: 0.42, cx: 1245, cy: 705 },
    tag: { left: 764, top: 298, width: 54, height: 52 },
  },
  // LS0IS, 2000x2000 and 2500x2500 photos scaled to 1600x1600. Front = Cloprod's "hanging"
  // photo, back = "tile". The supplier tag sits a few pixels apart per colour; on kahverengi and
  // gri the front collar covers its lower part, so the label covers only what shows.
  longsleeve: {
    canvas: 1600,
    back: { x: 556, y: 478, scale: 0.69 },
    logo: { cx: 800, top: 486, height: 32 },
    plate: { rotate: -11, scale: 0.4, cx: 1300, cy: 770 },
    tagByColor: {
      siyah: { left: 783, top: 349, width: 44, height: 44 },
      kirmizi: { left: 776, top: 350, width: 46, height: 46 },
      lacivert: { left: 776, top: 352, width: 44, height: 44 },
      haki: { left: 783, top: 353, width: 47, height: 45 },
      kahverengi: { left: 773, top: 354, width: 45, height: 44 },
      pembe: { left: 772, top: 350, width: 47, height: 47 },
      gri: { left: 775, top: 351, width: 43, height: 41 },
      antrasit: { left: 780, top: 350, width: 46, height: 50 },
    },
  },
};

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const INK = { white: { r: 255, g: 255, b: 255 }, black: { r: 0, g: 0, b: 0 } } as const;
const INK_HEX = { white: "#ffffff", black: "#000000" } as const;

type Layer = { input: Buffer; left: number; top: number };

// ---------- small caches ----------

class Lru<V> {
  private map = new Map<string, V>();
  private bytes = 0;
  private maxEntries: number;
  private maxBytes: number;
  private size: (v: V) => number;
  constructor(maxEntries: number, maxBytes: number, size: (v: V) => number) {
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
    this.size = size;
  }
  get(key: string): V | undefined {
    const v = this.map.get(key);
    if (v !== undefined) {
      this.map.delete(key);
      this.map.set(key, v);
    }
    return v;
  }
  set(key: string, v: V) {
    const old = this.map.get(key);
    if (old !== undefined) {
      this.bytes -= this.size(old);
      this.map.delete(key);
    }
    this.map.set(key, v);
    this.bytes += this.size(v);
    while (this.map.size > this.maxEntries || this.bytes > this.maxBytes) {
      const first = this.map.keys().next().value as string;
      this.bytes -= this.size(this.map.get(first) as V);
      this.map.delete(first);
    }
  }
}

const layerSize = (layers: Layer[]) => layers.reduce((n, l) => n + l.input.length, 0);
const outputs = new Lru<Buffer>(400, 96 * 1024 * 1024, (b) => b.length); // rendered WebP files
const layerCache = new Lru<Layer[]>(300, 64 * 1024 * 1024, layerSize); // artwork layers per design/garment/ink
const pending = new Map<string, Promise<Buffer>>(); // one render per key at a time

// ---------- inputs ----------

export function findArtwork(slug: string): { photo: string; name: string; plate: string } | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const dir = path.join(MEMLEKET, slug);
  const find = (base: string, exts: string[]) => {
    for (const ext of exts) {
      const file = path.join(dir, `${base}.${ext}`);
      if (fs.existsSync(file)) return file;
    }
    return null;
  };
  const photo = find("photo", ["jpg", "jpeg", "png", "webp"]);
  const name = find("name", ["svg", "png"]);
  const plate = find("plate", ["svg", "png"]);
  return photo && name && plate ? { photo, name, plate } : null;
}

export function listDesigns(): string[] {
  if (!fs.existsSync(MEMLEKET)) return [];
  return fs
    .readdirSync(MEMLEKET)
    .filter((d) => fs.statSync(path.join(MEMLEKET, d)).isDirectory() && findArtwork(d))
    .sort();
}

export const templateFile = (garment: MockupGarment, side: MockupSide, colorKey: string) =>
  path.join(TEMPLATES, garment, `${side}-${colorKey}.png`);

// ---------- layers ----------

// Alpha channel of a logo/name/plate file, fitted (centred) into width x height
async function maskOf(file: string, width: number, height: number): Promise<Buffer> {
  return sharp(file, { density: 300 })
    .resize(width, height, { fit: "contain", background: CLEAR })
    .ensureAlpha()
    .extractChannel("alpha")
    .png()
    .toBuffer();
}

async function colorize(mask: Buffer, ink: { r: number; g: number; b: number }): Promise<Buffer> {
  const { width, height } = await sharp(mask).metadata();
  return sharp({ create: { width: width!, height: height!, channels: 3, background: ink } })
    .joinChannel(mask)
    .png()
    .toBuffer();
}

const scaleBox = (box: Box, t: { x: number; y: number; scale: number }): Box => ({
  left: Math.round(t.x + (box.left - PRINT_ORIGIN.x) * t.scale),
  top: Math.round(t.y + (box.top - PRINT_ORIGIN.y) * t.scale),
  width: Math.round(box.width * t.scale),
  height: Math.round(box.height * t.scale),
});

async function backLayers(art: { photo: string; name: string }, t: Placement["back"], ink: MockupInk): Promise<Layer[]> {
  const f = scaleBox(PRINT.frame, t);
  const stroke = PRINT.frame.stroke;
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f.width + stroke}" height="${f.height + stroke}">` +
      `<rect x="${stroke / 2}" y="${stroke / 2}" width="${f.width}" height="${f.height}" fill="none" stroke="${INK_HEX[ink]}" stroke-width="${stroke}"/></svg>`
  );
  const p = scaleBox(PRINT.photo, t);
  const n = scaleBox(art.name.endsWith(".svg") ? PRINT.nameSvg : PRINT.name, t);
  return [
    { input: frame, left: Math.round(f.left - stroke / 2), top: Math.round(f.top - stroke / 2) },
    { input: await sharp(art.photo).resize(p.width, p.height, { fit: "cover" }).png().toBuffer(), left: p.left, top: p.top },
    { input: await colorize(await maskOf(art.name, n.width, n.height), INK[ink]), left: n.left, top: n.top },
  ];
}

async function logoLayer(logo: Placement["logo"], ink: MockupInk): Promise<Layer> {
  const meta = await sharp(LOGO).metadata();
  const width = Math.round((logo.height * meta.width!) / meta.height!);
  const mask = await maskOf(LOGO, width, logo.height);
  return { input: await colorize(mask, INK[ink]), left: Math.round(logo.cx - width / 2), top: logo.top };
}

// A woven-look white label with the black wordmark, the same on every garment colour.
// Built from the brand files, so a new logo also updates the label.
async function tagLayer(tag: Tag, lightGarment: boolean): Promise<Layer> {
  const k = 6; // draw large, then scale down for clean edges
  const w = tag.width * k;
  const h = tag.height * k;
  const shape = tag.clip
    ? `<polygon points="${tag.clip.map(([x, y]) => `${(x - tag.left) * k},${(y - tag.top) * k}`).join(" ")}"`
    : `<rect width="${w}" height="${h}" rx="6"`;
  const edge = lightGarment ? `${shape} fill="none" stroke="#cfcfcf" stroke-width="3"/>` : "";
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${shape} fill="#f7f7f5"/>${edge}</svg>`);
  const word = await sharp(LOGO, { density: 600 })
    .resize({ width: Math.round(w * (tag.wordW ?? 0.82)) })
    .png()
    .toBuffer({ resolveWithObject: true });
  const wordMask = await sharp(word.data).ensureAlpha().extractChannel("alpha").png().toBuffer();
  const label = await sharp(base)
    .composite([
      {
        input: await colorize(wordMask, INK.black),
        left: Math.max(0, Math.round(w * (tag.wordX ?? 0.5) - word.info.width / 2)),
        top: Math.max(0, Math.round(h * (tag.wordY ?? 0.5) - word.info.height / 2)),
      },
    ])
    .png()
    .toBuffer();
  // Wordmark only where the label is (the clip polygon may cut the box)
  const clipped = await sharp(label).composite([{ input: base, blend: "dest-in" }]).png().toBuffer();
  return { input: await sharp(clipped).resize(tag.width, tag.height).png().toBuffer(), left: tag.left, top: tag.top };
}

// The plate artwork comes out of Figma at different angles per design. Find the angle that
// sets the digits upright (smallest height of the trimmed shape), so every garment can turn
// them to its own sleeve angle.
const ARTWORK_TILT = 26; // degrees clockwise that straighten the usual plate export
const uprightCache = new Map<string, number>();
async function uprightAngle(key: string, mask: Buffer): Promise<number> {
  const cached = uprightCache.get(key);
  if (cached !== undefined) return cached;
  const heightAt = async (angle: number) => {
    const { info } = await sharp(mask).rotate(angle, { background: { r: 0, g: 0, b: 0 } }).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
    return info.height;
  };
  let best = 0;
  let bestHeight = Infinity;
  for (let a = -45; a <= 45; a += 1.5) {
    const h = await heightAt(a);
    if (h < bestHeight) [best, bestHeight] = [a, h];
  }
  for (let a = best - 1.5; a <= best + 1.5; a += 0.25) {
    const h = await heightAt(a);
    if (h < bestHeight) [best, bestHeight] = [a, h];
  }
  // Figures with descenders (the 9 in "09") fool the height test. The artwork is drawn at about
  // 26° counter-clockwise, so a result far from that falls back to the common tilt.
  if (Math.abs(best - ARTWORK_TILT) > 10) best = ARTWORK_TILT;
  uprightCache.set(key, best);
  return best;
}

async function plateLayer(plateFile: string, placement: Placement["plate"], ink: MockupInk): Promise<Layer> {
  const box = plateFile.endsWith(".svg") ? PLATE.svg : PLATE.png;
  const mask = await maskOf(plateFile, box.width, box.height);
  const stat = fs.statSync(plateFile);
  const angle = (await uprightAngle(`${plateFile}:${stat.mtimeMs}`, mask)) + placement.rotate;
  const turned = await sharp(mask).rotate(angle, { background: { r: 0, g: 0, b: 0 } }).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const width = Math.round(turned.info.width * placement.scale);
  const height = Math.round(turned.info.height * placement.scale);
  const scaled = await sharp(turned.data).resize(width, height).extractChannel(0).png().toBuffer();
  return { input: await colorize(scaled, INK[ink]), left: Math.round(placement.cx - width / 2), top: Math.round(placement.cy - height / 2) };
}

async function cachedLayers(key: string, make: () => Promise<Layer[]>): Promise<Layer[]> {
  const hit = layerCache.get(key);
  if (hit) return hit;
  const layers = await make();
  layerCache.set(key, layers);
  return layers;
}

// ---------- render ----------

export type MockupRequest = {
  slug: string;
  garment: MockupGarment;
  side: MockupSide;
  colorKey: string;
  ink: MockupInk;
};

// Composite at the template's size (PNG, lossless). Callers that serve it use renderMockup.
export async function composeMockup(req: MockupRequest): Promise<{ data: Buffer; width: number; height: number }> {
  const art = findArtwork(req.slug);
  if (!art) throw new Error(`no artwork for ${req.slug}`);
  const template = templateFile(req.garment, req.side, req.colorKey);
  if (!fs.existsSync(template)) throw new Error(`no template ${path.relative(process.cwd(), template)}`);
  const spec = PLACEMENTS[req.garment];
  const base = `${req.slug}|${req.garment}|${req.ink}`;
  let layers: Layer[];
  if (req.side === "back") {
    layers = await cachedLayers(`${base}|back`, () => backLayers(art, spec.back, req.ink));
  } else {
    const front = await cachedLayers(`${base}|front`, async () => [await logoLayer(spec.logo, req.ink), await plateLayer(art.plate, spec.plate, req.ink)]);
    const tag = spec.tagByColor?.[req.colorKey] ?? spec.tag;
    const tagLayers = tag ? await cachedLayers(`tag|${req.garment}|${req.colorKey}`, async () => [await tagLayer(tag, req.ink === "black")]) : [];
    layers = [...tagLayers, ...front];
  }
  const { data, info } = await sharp(template).removeAlpha().composite(layers).raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// The served image: WebP, OUTPUT_SIZE square. Rendered once per process and kept in an LRU.
export async function renderMockup(req: MockupRequest): Promise<Buffer> {
  const key = `${req.slug}|${req.garment}|${req.side}|${req.colorKey}|${req.ink}`;
  const hit = outputs.get(key);
  if (hit) return hit;
  const running = pending.get(key);
  if (running) return running;
  const job = (async () => {
    const { data, width, height } = await composeMockup(req);
    let img = sharp(data, { raw: { width, height, channels: 3 } });
    if (width !== OUTPUT_SIZE || height !== OUTPUT_SIZE) img = img.resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: "contain", background: "#ffffff" });
    const out = await img.webp({ quality: 88, effort: 4 }).toBuffer();
    outputs.set(key, out);
    return out;
  })();
  pending.set(key, job);
  try {
    return await job;
  } finally {
    pending.delete(key);
  }
}
