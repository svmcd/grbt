// Renders one product image (design x garment x colour x side) on demand, from the blank
// garment photos in designs/templates/<garment>/<side>-<colorKey>.png and the artwork in
// designs/<collection>/<slug>/. Server only (sharp, fs). Used by src/app/api/mockup/ and by
// scripts/generate-mockups.mjs (local pre-render for checking).
//
// Memleket designs: photo + name + plate files, laid out by PRINT/PLATE below.
// Hasret and Sinema ("flat" designs): artwork extracted from their old flat mockups, with a
// design.json that places each layer (scripts/extract-flat-artwork.mjs). Their fronts get the
// chest icon and the design's front print centred on the chest where the old wordmark sat,
// their backs the back print (if any) at the Memleket back print's size; no sleeve number.
// Turkish Time: flat designs too, a drawing plus text on the front (art-text layer,
// scripts/extract-turkish-time.mjs), the drawing in a tone of the garment colour, the text in
// the ink; no chest icon.
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
export type MockupCollection = "memleket" | "hasret" | "sinema" | "turkish-time";

// URL folder under /products/collections/ -> design collection (designs/<collection>/)
export const COLLECTION_FOLDERS: Record<string, MockupCollection> = {
  memleket: "memleket",
  hasret: "hasret",
  recep_ivedik: "sinema",
  "turkish-time": "turkish-time",
};

// The file names the site uses under /products/collections/<folder>/<slug>/<colorKey>/
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
const FLAT_COLLECTIONS: MockupCollection[] = ["hasret", "sinema", "turkish-time"];

// Per collection: chestIcon = the brand icon on the left chest (Sinema has none, only the neck
// label and its own front print); photoDuotone = the back photo toned to the garment colour
// (Memleket only; see duotoneEnds).
const COLLECTION_STYLE: Record<MockupCollection, { chestIcon: boolean; photoDuotone: boolean }> = {
  memleket: { chestIcon: true, photoDuotone: true },
  hasret: { chestIcon: true, photoDuotone: false },
  sinema: { chestIcon: false, photoDuotone: false },
  // Turkish Time: the design is the front print; no chest icon
  "turkish-time": { chestIcon: false, photoDuotone: false },
};
// The star-and-crescent brand icon: printed on the left chest and woven into the neck label
const ICON = path.join(TEMPLATES, "icon.svg");

type Box = { left: number; top: number; width: number; height: number };
type Point = [number, number];
// Our neck label over the supplier's tag. `clip` (canvas coordinates) is the part of the tag
// that is visible in the photo, where the hood folds over it; wordX/wordY place the wordmark
// centre (0 = top/left, 1 = bottom/right of the box) and wordW its width (fraction of the box).
type Tag = Box & { clip?: Point[]; wordX?: number; wordY?: number; wordW?: number };
type Placement = {
  canvas: number; // templates are square, this many pixels
  back: { x: number; y: number; scale: number }; // print origin (frame top-left) and scale
  // The old centred chest wordmark box. No longer printed; the Hasret/Sinema front prints are
  // still laid out from it (centred on the chest, under where the wordmark was).
  logo: { cx: number; top: number; height: number };
  // The brand icon on the wearer's left chest (image right), like a Nike swoosh: about 4.2 cm
  // tall (px per cm from Cloprod's size M chest or shoulder width against the photo), centred
  // halfway between the centre line and the side seam, its top about 8 cm under the front
  // collar seam.
  icon: { cx: number; top: number; height: number };
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
    // body 362..1222 px = 60 cm chest: 14.3 px/cm; collar seam at y 420
    icon: { cx: 1007, top: 535, height: 60 },
    plate: { rotate: -64, scale: 0.46, cx: 1335, cy: 578 },
    tag: { left: 771, top: 337, width: 56, height: 60 },
  },
  // HD0C4, front 1600x1643 and back 1600x1625 padded to 1643x1643
  hoodie: {
    canvas: 1643,
    back: { x: 649, y: 650, scale: 0.47 },
    logo: { cx: 821, top: 585, height: 28 },
    // shoulder seams 450..1195 px = 61.5 cm: 12.1 px/cm; clear of the hood edge (y ~500)
    icon: { cx: 1008, top: 600, height: 51 },
    plate: { rotate: -14, scale: 0.4, cx: 1195, cy: 665 },
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
    // shoulder seams 400..1200 px = 61.5 cm: 13 px/cm; collar seam at y 378
    icon: { cx: 993, top: 482, height: 55 },
    plate: { rotate: -15, scale: 0.42, cx: 1218, cy: 595 },
    tag: { left: 764, top: 298, width: 54, height: 52 },
  },
  // LS0IS, 2000x2000 and 2500x2500 photos scaled to 1600x1600. Front = Cloprod's "hanging"
  // photo, back = "tile". The supplier tag sits a few pixels apart per colour; on kahverengi and
  // gri the front collar covers its lower part, so the label covers only what shows.
  longsleeve: {
    canvas: 1600,
    back: { x: 556, y: 478, scale: 0.69 },
    logo: { cx: 800, top: 486, height: 32 },
    // body 353..1245 px = 63 cm chest: 14.2 px/cm; collar seam at y 435
    icon: { cx: 1022, top: 548, height: 59 },
    plate: { rotate: -11, scale: 0.4, cx: 1262, cy: 600 },
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

// ---------- flat designs (Hasret, Sinema) ----------

// Boxes in pixels of the source mockup the artwork was extracted from; layer boxes are relative
// to the side's print area. See scripts/extract-flat-artwork.mjs.
type FlatLayer =
  | { kind: "photo"; file: string; box: Box }
  | { kind: "mask"; file: string; box: Box; text?: boolean } // printed in the garment's ink (text: in the text ink)
  | { kind: "color-mask"; file: string; box: Box; color: string } // printed in its own colour
  | { kind: "frame"; box: Box; stroke: number } // outline in the garment's ink
  // A drawing in `color` (art: RGBA, only its alpha is used) with text (alpha mask) over it,
  // both cropped to the same box. See artTextLayer.
  | { kind: "art-text"; box: Box; art: string; text: string; color: string; minContrast: number };
type FlatSide = {
  area: Box;
  centerX: number; // garment centre line on the source mockup
  // front: the chest logo is logoHeight px tall on the source, the print starts logoGap px under it.
  // back: memleketFrameWidth source px are printed as wide as the Memleket back frame.
  reference: { logoHeight?: number; logoGap?: number; memleketFrameWidth?: number };
  layers: FlatLayer[];
};
// garments: the garment types the design is sold on (all when absent)
export type FlatDesign = { collection: MockupCollection; slug: string; front: FlatSide | null; back: FlatSide | null; garments?: MockupGarment[] };

const flatCache = new Map<string, { mtimeMs: number; design: FlatDesign }>();

// Product slugs keep Turkish letters (sıla-yolu) and underscores (sensiz_olmaz)
const SLUG_RE = /^[\p{Ll}\p{Nd}_-]+$/u;

// Product slugs that carry their collection in front of the design folder's name:
// "turkish-time-cay" is designs/turkish-time/cay/
const SLUG_PREFIX: Partial<Record<MockupCollection, string>> = { "turkish-time": "turkish-time-" };

// The design's folder under designs/<collection>/ for a product slug (null: not this collection's)
function designFolder(collection: MockupCollection, slug: string): string | null {
  const prefix = SLUG_PREFIX[collection];
  if (!prefix) return slug;
  return slug.startsWith(prefix) ? slug.slice(prefix.length) : null;
}

export function findFlatDesign(collection: MockupCollection, slug: string): FlatDesign | null {
  if (!FLAT_COLLECTIONS.includes(collection) || !SLUG_RE.test(slug)) return null;
  const folder = designFolder(collection, slug);
  if (!folder) return null;
  const file = path.join(DESIGNS_DIR, collection, folder, "design.json");
  let stat: fs.Stats;
  try {
    stat = fs.statSync(file);
  } catch {
    return null;
  }
  const hit = flatCache.get(file);
  if (hit && hit.mtimeMs === stat.mtimeMs) return hit.design;
  const design = JSON.parse(fs.readFileSync(file, "utf8")) as FlatDesign;
  flatCache.set(file, { mtimeMs: stat.mtimeMs, design });
  return design;
}

// True when designs/ has artwork for this design (Memleket: photo, name, plate; flat: design.json)
export function hasDesign(collection: MockupCollection, slug: string): boolean {
  return collection === "memleket" ? findArtwork(slug) !== null : findFlatDesign(collection, slug) !== null;
}

// True when the design is sold (and rendered) on this garment type
export function designHasGarment(collection: MockupCollection, slug: string, garment: MockupGarment): boolean {
  const garments = collection === "memleket" ? undefined : findFlatDesign(collection, slug)?.garments;
  return !garments || garments.includes(garment);
}

// Every renderable design, Memleket first
export function listAllDesigns(): { collection: MockupCollection; slug: string }[] {
  const out: { collection: MockupCollection; slug: string }[] = listDesigns().map((slug) => ({ collection: "memleket", slug }));
  for (const collection of FLAT_COLLECTIONS) {
    const dir = path.join(DESIGNS_DIR, collection);
    if (!fs.existsSync(dir)) continue;
    for (const folder of fs.readdirSync(dir).sort()) {
      const slug = `${SLUG_PREFIX[collection] ?? ""}${folder}`;
      if (findFlatDesign(collection, slug)) out.push({ collection, slug });
    }
  }
  return out;
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

async function backLayers(art: { photo: string; name: string }, t: Placement["back"], ink: MockupInk, duotone: { dark: Rgb; light: Rgb } | null, textInk: MockupInk = ink): Promise<Layer[]> {
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
    { input: await photoLayer(art.photo, p.width, p.height, duotone), left: p.left, top: p.top },
    { input: await colorize(await maskOf(art.name, n.width, n.height), INK[textInk]), left: n.left, top: n.top },
  ];
}

// The back photo, as it is or toned: its luminance (0..1, same curve) mapped onto the straight
// line from `dark` to `light`.
async function photoLayer(file: string, width: number, height: number, duotone: { dark: Rgb; light: Rgb } | null): Promise<Buffer> {
  const resized = sharp(file).resize(width, height, { fit: "cover" });
  if (!duotone) return resized.png().toBuffer();
  const grey = await resized.greyscale().raw().toBuffer();
  const { dark, light } = duotone;
  const lut = Array.from({ length: 256 }, (_, v) => [dark.r, dark.g, dark.b].map((d, c) => Math.round(d + (v / 255) * ([light.r, light.g, light.b][c] - d))));
  const out = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) out.set(lut[grey[i]], i * 3);
  return sharp(out, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

async function iconLayer(icon: Placement["icon"], ink: MockupInk): Promise<Layer> {
  const meta = await sharp(ICON).metadata();
  const width = Math.round((icon.height * meta.width!) / meta.height!);
  const mask = await maskOf(ICON, width, icon.height);
  return { input: await colorize(mask, INK[ink]), left: Math.round(icon.cx - width / 2), top: icon.top };
}

// A woven-look white label with the black brand icon, the same on every garment colour.
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
  const iconSize = Math.round(Math.min(w, h) * 0.62);
  const word = await sharp(ICON, { density: 600 })
    .resize(iconSize, iconSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
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
  // Icon only where the label is (the clip polygon may cut the box)
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

const hexRgb = (hex: string) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });

// WCAG 2 contrast ratio of two colours (1 = same luminance, 21 = black on white)
type Rgb = { r: number; g: number; b: number };
const luminance = ({ r, g, b }: Rgb) => {
  const lin = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(hexRgb(a)), luminance(hexRgb(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const rgbHsl = ({ r, g, b }: Rgb) => {
  const [x, y, z] = [r / 255, g / 255, b / 255];
  const max = Math.max(x, y, z);
  const min = Math.min(x, y, z);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === x ? ((y - z) / d + 6) % 6 : max === y ? (z - x) / d + 2 : (x - y) / d + 4;
  return { h: h * 60, s, l };
};
const hslRgb = (h: number, s: number, l: number): Rgb => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
};
const mix = (a: Rgb, b: Rgb, t: number): Rgb => ({ r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) });

// Duotone ends for the Memleket back photo on a garment colour. Dark garments (white ink): the
// photo's black is the garment colour itself (it melts into the fabric), its white a near-white
// with a touch of the garment's hue. Light garments (black ink): the photo's white is the garment
// colour, its black a deep shade of the garment's hue. The tint grows with the garment's
// saturation, so black and white garments keep a plain black-and-white photo.
const DUOTONE = { tint: 0.14, deepLightness: 0.14, fullAt: 0.15 };
export function duotoneEnds(garmentHex: string, ink: MockupInk): { dark: Rgb; light: Rgb } {
  const garment = hexRgb(garmentHex);
  const { h, s } = rgbHsl(garment);
  const strength = Math.min(1, s / DUOTONE.fullAt);
  // Dark or light by the garment itself, not the print ink (light blue and pink print white
  // but are light garments)
  void ink;
  if (luminance(garment) < 0.3) return { dark: garment, light: mix(INK.white, hslRgb(h, s, 0.5), DUOTONE.tint * strength) };
  return { dark: hslRgb(h, s, DUOTONE.deepLightness * strength), light: garment };
}

// The colour an art-text drawing prints in on a garment: a tone of the garment colour itself
// (tone on tone): lighter on dark garments, darker on light ones, same hue and saturation.
// Without a garment colour the drawing keeps its own colour.
const ART_TONE = { lighten: 0.3, darkScale: 0.6, maxL: 0.9, minL: 0.1, maxS: 0.5 };
export function artColorOn(layer: { color: string; minContrast: number }, garmentHex: string | undefined, ink: MockupInk): string {
  if (!garmentHex) return layer.color;
  const garment = hexRgb(garmentHex);
  const { h, s, l } = rgbHsl(garment);
  // Lighter or darker by the garment itself, not the ink (pink and light blue print white text)
  void ink;
  const tone =
    // Darker tone on every garment that has room for it (red, khaki, pink, grey, light blue,
    // white); lighter only on the really dark ones (black, navy, charcoal, brown)
    // The darker tone keeps 60 % of the garment's lightness: red becomes a deep red, never black
    l < 0.4 ? Math.min(ART_TONE.maxL, l + ART_TONE.lighten) : Math.max(ART_TONE.minL, l * ART_TONE.darkScale);
  // Capped saturation: a darker tone of a pastel (pink) stays muted instead of turning neon
  const { r, g, b } = hslRgb(h, Math.min(s, ART_TONE.maxS), tone);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Drawing + text as one layer, the text always in the ink. Where the text crosses the drawing
// and the ink stands out well against the drawing as printed (contrast 3:1 or more: white over
// the red on dark garments, like the artwork), the text simply prints over it. Otherwise (black
// text over the red, or the drawing itself printed in the ink) the drawing is cut back around
// the letters, so they keep a thin gap in the garment colour and stay readable.
const TEXT_OVER_ART_CONTRAST = 3;
async function artTextLayer(dir: string, l: Extract<FlatLayer, { kind: "art-text" }>, width: number, height: number, ink: MockupInk, garmentHex: string | undefined, textInk: MockupInk = ink): Promise<Buffer> {
  const alphaOf = (file: string) =>
    sharp(path.join(dir, file)).resize(width, height, { fit: "fill" }).ensureAlpha().extractChannel("alpha");
  const artHex = artColorOn(l, garmentHex, ink);
  const inkHex = INK_HEX[textInk];
  const gap = contrastRatio(inkHex, artHex) < TEXT_OVER_ART_CONTRAST;
  const [art, text, halo] = await Promise.all([
    alphaOf(l.art).raw().toBuffer(),
    alphaOf(l.text).raw().toBuffer(),
    // The letters grown by about 0.4 % of the print width (2 px on the T-shirt back)
    gap ? alphaOf(l.text).blur(Math.max(0.6, width * 0.004)).linear(3, 0).raw().toBuffer() : null,
  ]);
  const a = hexRgb(artHex);
  const k = hexRgb(inkHex);
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const at = text[i] / 255;
    const ar = (art[i] / 255) * (halo ? 1 - Math.max(at, halo[i] / 255) : 1);
    // text over drawing
    const wa = ar * (1 - at);
    const alpha = at + wa;
    if (alpha <= 0) continue;
    const p = i * 4;
    out[p] = Math.round((wa * a.r + at * k.r) / alpha);
    out[p + 1] = Math.round((wa * a.g + at * k.g) / alpha);
    out[p + 2] = Math.round((wa * a.b + at * k.b) / alpha);
    out[p + 3] = Math.round(Math.min(1, alpha) * 255);
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

// Lays a flat design's side onto a garment: scale `s` (canvas px per source px) and the canvas
// position of the print area's top-left.
async function flatLayers(dir: string, side: FlatSide, s: number, originX: number, originY: number, ink: MockupInk, garmentHex?: string, textInk: MockupInk = ink): Promise<Layer[]> {
  const layers: Layer[] = [];
  for (const l of side.layers) {
    const left = Math.round(originX + l.box.left * s);
    const top = Math.round(originY + l.box.top * s);
    const width = Math.max(1, Math.round(l.box.width * s));
    const height = Math.max(1, Math.round(l.box.height * s));
    if (l.kind === "photo") {
      layers.push({ input: await sharp(path.join(dir, l.file)).resize(width, height, { fit: "fill" }).removeAlpha().png().toBuffer(), left, top });
    } else if (l.kind === "mask" || l.kind === "color-mask") {
      const color = l.kind === "mask" ? INK[l.text ? textInk : ink] : hexRgb(l.color);
      layers.push({ input: await colorize(await maskOf(path.join(dir, l.file), width, height), color), left, top });
    } else if (l.kind === "frame") {
      const stroke = PRINT.frame.stroke; // same line as the Memleket frame
      const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
        `<rect x="${stroke / 2}" y="${stroke / 2}" width="${width - stroke}" height="${height - stroke}" fill="none" stroke="${INK_HEX[ink]}" stroke-width="${stroke}"/></svg>`;
      layers.push({ input: Buffer.from(svg), left, top });
    } else if (l.kind === "art-text") {
      layers.push({ input: await artTextLayer(dir, l, width, height, ink, garmentHex, textInk), left, top });
    }
  }
  return layers;
}

// Back print: as wide as (reference) and level with the Memleket back frame on this garment
function flatBackLayers(dir: string, side: FlatSide, t: Placement["back"], ink: MockupInk, garmentHex?: string, textInk: MockupInk = ink): Promise<Layer[]> {
  const frame = scaleBox(PRINT.frame, t);
  const s = frame.width / (side.reference.memleketFrameWidth ?? side.area.width);
  const centre = frame.left + frame.width / 2;
  return flatLayers(dir, side, s, centre + (side.area.left - side.centerX) * s, frame.top, ink, garmentHex, textInk);
}

// Front print: where it sat under the old centred chest wordmark (placement.logo), scaled with
// that wordmark (it had the same height relative to the print as on the source mockup), on the
// garment's centre line. The chest icon itself sits on the left chest, clear of the print.
function flatFrontLayers(dir: string, side: FlatSide, logo: Placement["logo"], ink: MockupInk, garmentHex?: string, textInk: MockupInk = ink): Promise<Layer[]> {
  const s = logo.height / (side.reference.logoHeight ?? 46);
  const top = logo.top + logo.height + (side.reference.logoGap ?? 0) * s;
  return flatLayers(dir, side, s, logo.cx + (side.area.left - side.centerX) * s, top, ink, garmentHex, textInk);
}

// Canvas box of a front print (see flatFrontLayers)
function flatFrontBox(side: FlatSide, logo: Placement["logo"]): Box {
  const s = logo.height / (side.reference.logoHeight ?? 46);
  return {
    left: logo.cx + (side.area.left - side.centerX) * s,
    top: logo.top + logo.height + (side.reference.logoGap ?? 0) * s,
    width: side.area.width * s,
    height: side.area.height * s,
  };
}

// The chest icon where the placement puts it, unless that is within one icon height (sideways)
// or half an icon height (up and down) of the front print (yabanci's line of text runs into it
// on some garments): then it moves down to start 0.6 icon heights under the print.
function iconClearOf(icon: Placement["icon"], print: Box | null): Placement["icon"] {
  if (!print) return icon;
  const half = (icon.height * 1.03) / 2; // half the icon's width (icon.svg is 1856 x 1802)
  const near =
    icon.cx + half + icon.height > print.left &&
    icon.cx - half - icon.height < print.left + print.width &&
    icon.top + icon.height + icon.height / 2 > print.top &&
    icon.top - icon.height / 2 < print.top + print.height;
  return near ? { ...icon, top: Math.max(icon.top, Math.round(print.top + print.height + icon.height * 0.6)) } : icon;
}

// Layers whose look depends on the garment colour itself, not only on its ink
const dependsOnGarment = (side: FlatSide | null) => !!side?.layers.some((l) => l.kind === "art-text");

async function cachedLayers(key: string, make: () => Promise<Layer[]>): Promise<Layer[]> {
  const hit = layerCache.get(key);
  if (hit) return hit;
  const layers = await make();
  layerCache.set(key, layers);
  return layers;
}

// ---------- render ----------

export type MockupRequest = {
  collection?: MockupCollection; // default memleket
  slug: string;
  garment: MockupGarment;
  side: MockupSide;
  colorKey: string;
  ink: MockupInk; // icon, sleeve number, frame, line art
  textInk?: MockupInk; // words (city name, captions, quotes); default ink (garments.ts printInk)
  garmentHex?: string; // the garment colour (garments.ts hex), for art-text designs
};

// Composite at the template's size (PNG, lossless). Callers that serve it use renderMockup.
export async function composeMockup(req: MockupRequest): Promise<{ data: Buffer; width: number; height: number }> {
  const collection = req.collection ?? "memleket";
  const art = collection === "memleket" ? findArtwork(req.slug) : null;
  const flat = collection === "memleket" ? null : findFlatDesign(collection, req.slug);
  if (!art && !flat) throw new Error(`no artwork for ${collection}/${req.slug}`);
  const template = templateFile(req.garment, req.side, req.colorKey);
  if (!fs.existsSync(template)) throw new Error(`no template ${path.relative(process.cwd(), template)}`);
  const spec = PLACEMENTS[req.garment];
  const textInk = req.textInk ?? req.ink;
  const base = `${collection}|${req.slug}|${req.garment}|${req.ink}|${textInk}`;
  const dir = path.join(DESIGNS_DIR, collection, designFolder(collection, req.slug) ?? req.slug);
  let layers: Layer[];
  const style = COLLECTION_STYLE[collection];
  const hex = (side: FlatSide | null) => (dependsOnGarment(side) ? `|${req.garmentHex ?? ""}` : "");
  if (req.side === "back") {
    if (art) {
      const duotone = style.photoDuotone && req.garmentHex ? duotoneEnds(req.garmentHex, req.ink) : null;
      layers = await cachedLayers(`${base}|back${duotone ? `|${req.garmentHex}` : ""}`, () => backLayers(art, spec.back, req.ink, duotone, textInk));
    } else layers = flat!.back ? await cachedLayers(`${base}|back${hex(flat!.back)}`, () => flatBackLayers(dir, flat!.back!, spec.back, req.ink, req.garmentHex, textInk)) : [];
  } else {
    const front = await cachedLayers(`${base}|front${flat ? hex(flat.front) : ""}`, async () => {
      const print = flat?.front ? await flatFrontLayers(dir, flat.front, spec.logo, req.ink, req.garmentHex, textInk) : [];
      const icon = style.chestIcon ? [await iconLayer(iconClearOf(spec.icon, flat?.front ? flatFrontBox(flat.front, spec.logo) : null), req.ink)] : [];
      if (art) return [...icon, await plateLayer(art.plate, spec.plate, req.ink)];
      return [...icon, ...print];
    });
    const tag = spec.tagByColor?.[req.colorKey] ?? spec.tag;
    const tagLayers = tag ? await cachedLayers(`tag|${req.garment}|${req.colorKey}`, async () => [await tagLayer(tag, req.ink === "black")]) : [];
    layers = [...tagLayers, ...front];
  }
  const { data, info } = await sharp(template).removeAlpha().composite(layers).raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// The served image: WebP, OUTPUT_SIZE square. Rendered once per process and kept in an LRU.
export async function renderMockup(req: MockupRequest): Promise<Buffer> {
  const key = `${req.collection ?? "memleket"}|${req.slug}|${req.garment}|${req.side}|${req.colorKey}|${req.ink}|${req.textInk ?? req.ink}|${req.garmentHex ?? ""}`;
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
