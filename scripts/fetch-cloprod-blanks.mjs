// Downloads the blank garment photos from Cloprod (our producer) and saves one template per
// garment, side and colour of src/lib/garments.ts:
//
//   designs/templates/<tshirt|hoodie|sweater|longsleeve>/<front|back>-<colorKey>.png
//
// Cloprod's public product JSON lists two mockups per product (0 = front, 1 = back; for the
// long sleeve 0 is the "hanging" photo with the neck tag, 1 the "tile" photo of the back). Each has
// a light `background` photo and per colour id an `overlay`:
//   { key: "background", val: <path> }  a real photo of that colour  -> used as is
//   { key: "gray", val: g }             Cloprod tints the light photo  -> we do the same
// Cloprod's tint (their FabricMockupWorker getUnderColor + renderBackground): fill the canvas
// with under = (hex - 255 * g) / (1 - g), then draw the light photo over it. That photo is
// opaque white around the garment and ~30% opaque on the garment, so its shading lies on top
// of the colour. We do exactly that, so a tinted colour looks the way Cloprod shows it.
//
// Every image is padded (never scaled) onto a fixed square canvas per garment, so the print
// positions in src/lib/mockups/render.ts stay valid for every colour. The long-sleeve photos are
// square already but come as 2000x2000 or 2500x2500 (same framing); they are scaled to the canvas.
//
// Run: npm run blanks                (every garment)
//      npm run blanks -- longsleeve  (only these garment types)
// Only needed when Cloprod changes its photos or a colour is added to garments.ts.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { GARMENTS } from "../src/lib/garments.ts";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "designs/templates");
const API = "https://www.cloprod.com/api/public/goods-detail?spu=";
const CDN = "https://cdn.cloprod.com/";
const SIDES = ["front", "back"]; // index in data.mockups
const WHITE = { r: 255, g: 255, b: 255 };

// Square canvas per garment. Cloprod's photos are 1600 wide; we only add white margin (long
// sleeve: square photos scaled to 1600).
const CANVAS = { tshirt: 1600, hoodie: 1643, sweater: 1600, longsleeve: 1600 };
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const cache = path.join(ROOT, "node_modules/.cache/cloprod");
fs.mkdirSync(cache, { recursive: true });

async function download(p) {
  const file = path.join(cache, p.replace(/[^\w.-]/g, "_"));
  if (!fs.existsSync(file)) {
    const res = await fetch(CDN + p);
    if (!res.ok) throw new Error(`${res.status} ${CDN + p}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

const rgb = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

// Cloprod: under = (c - 255 g) / (1 - g), clamped, per channel
const underColor = (hex, g) => {
  const [r, gr, b] = rgb(hex).map((c) => Math.max(0, Math.min(255, Math.round((c - 255 * g) / (1 - g)))));
  return { r, g: gr, b };
};

async function toCanvas(input, size) {
  const meta = await sharp(input).metadata();
  if (meta.width === meta.height && meta.width !== size) {
    // Square photo at another resolution: scale it to the canvas
    input = await sharp(input).resize(size, size).png().toBuffer();
  }
  const { width, height } = await sharp(input).metadata();
  const left = Math.floor((size - width) / 2);
  const top = Math.floor((size - height) / 2);
  return sharp(input)
    .flatten({ background: WHITE })
    .extend({ left, right: size - width - left, top, bottom: size - height - top, background: WHITE })
    .removeAlpha();
}

async function main() {
  let bytes = 0;
  let count = 0;
  for (const [type, garment] of Object.entries(GARMENTS)) {
    if (only.length && !only.includes(type)) continue;
    const res = await fetch(API + garment.cloprodSpu);
    const json = await res.json();
    const mockups = json?.data?.mockups;
    if (!Array.isArray(mockups) || mockups.length < 2) throw new Error(`${garment.cloprodSpu}: no mockups`);
    const dir = path.join(OUT, type);
    fs.mkdirSync(dir, { recursive: true });
    for (const [i, side] of SIDES.entries()) {
      const m = mockups[i];
      // `overlay` is an array, or that array as a JSON string (LS0IS)
      const overlay = (typeof m.overlay === "string" ? JSON.parse(m.overlay) : m.overlay) || [];
      const base = m.background ? await download(m.background) : null;
      for (const col of garment.colors) {
        const id = String(col.cloprodColorId);
        const photo = overlay.find((o) => o.key === "background" && String(o.color) === id);
        let img;
        let how;
        if (photo) {
          img = await toCanvas(await download(photo.val), CANVAS[type]);
          how = "photo";
        } else {
          if (!base) throw new Error(`${garment.cloprodSpu} ${side}: no photo for colour ${id} and no light photo to tint`);
          const gray = parseFloat(overlay.find((o) => o.key === "gray" && String(o.color) === id)?.val ?? m.gray) || 0;
          const { width, height } = await sharp(base).metadata();
          const tinted = await sharp({ create: { width, height, channels: 3, background: underColor(col.hex, gray) } })
            .composite([{ input: base }])
            .png()
            .toBuffer();
          img = await toCanvas(tinted, CANVAS[type]);
          how = `tint ${col.hex} gray ${gray}`;
        }
        const file = path.join(dir, `${side}-${col.key}.png`);
        // Palette PNG (libimagequant, dithered): about a third of the lossless size, no visible banding
        await img.png({ palette: true, quality: 90, colours: 256, dither: 1, compressionLevel: 9, effort: 10 }).toFile(file);
        const size = fs.statSync(file).size;
        bytes += size;
        count++;
        console.log(`${type}/${side}-${col.key}.png  ${how}  ${(size / 1024).toFixed(0)} kB`);
      }
    }
  }
  console.log(`${count} templates, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
