// Splits the Turkish Time artwork (designs/turkish-time/<slug>/source.png: a dark red drawing
// plus white text, anti-aliased on transparency) into the two layers the mockup renderer prints:
//   - art.png:  the drawing in its own red, with alpha
//   - text.png: the text as an alpha mask (white on transparent), printed in the garment's ink
// and writes design.json (one "art-text" layer on the back, see src/lib/mockups/render.ts).
//
// Every pixel is read as white text over red art over transparency:
//   alpha = aText + aArt * (1 - aText),  colour * alpha = aText * white + aArt * (1 - aText) * red
// The white share of the colour (its position on the red-white line) gives aText, the rest aArt.
// Under fully opaque text the art is hidden in the source; there it is filled from the art
// around the letters (the tea saucer behind "me at", the wolf's legs behind "very"), which the
// renderer needs when the text is cut out of the drawing.
//
// Writes an overlay check per design to .mockups/extract/turkish-time-<slug>.png (source on
// grey, rebuilt from the layers on grey, difference x8) and prints the largest difference.
//
//   node scripts/extract-turkish-time.mjs

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(ROOT, "designs", "turkish-time");
const CHECK = path.join(ROOT, ".mockups", "extract");
const GREY = [128, 128, 128];
// Contrast (WCAG ratio) under which the red drawing is printed in the garment's ink instead
const MIN_CONTRAST = 1.7;
// Fill radius under the letters, in source pixels (about the stem width of the lettering)
const FILL_RADIUS = 7;

const hex = ([r, g, b]) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

// Box blur of a Float32Array (separable, radius r), used for the normalised fill
function blur(src, w, h, r) {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc;
      acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

async function extract(slug) {
  const dir = path.join(DIR, slug);
  const { data, info } = await sharp(path.join(dir, "source.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;

  // The red: the most common fully opaque colour that is not white
  const counts = new Map();
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    if (data[p + 3] !== 255) continue;
    const key = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
    if (key !== 0xffffff) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const redKey = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  const red = [(redKey >> 16) & 255, (redKey >> 8) & 255, redKey & 255];
  const dir3 = [255 - red[0], 255 - red[1], 255 - red[2]];
  const len2 = dir3[0] ** 2 + dir3[1] ** 2 + dir3[2] ** 2;

  const aText = new Float32Array(n);
  const aArt = new Float32Array(n);
  const known = new Float32Array(n); // 1 where the art under the pixel can be read
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const a = data[p + 3] / 255;
    if (a === 0) {
      known[i] = 1;
      continue;
    }
    const t = Math.min(1, Math.max(0, ((data[p] - red[0]) * dir3[0] + (data[p + 1] - red[1]) * dir3[1] + (data[p + 2] - red[2]) * dir3[2]) / len2));
    aText[i] = a * t;
    if (aText[i] < 0.9) {
      aArt[i] = Math.min(1, (a * (1 - t)) / (1 - aText[i]));
      known[i] = 1;
    }
  }
  // Under the letters: the mean of the readable art around them, sharpened back to solid/empty
  const num = blur(aArt.map((v, i) => v * known[i]), w, h, FILL_RADIUS);
  const den = blur(known, w, h, FILL_RADIUS);
  for (let i = 0; i < n; i++) {
    if (known[i]) continue;
    const filled = den[i] > 0 ? num[i] / den[i] : 0;
    aArt[i] = Math.min(1, Math.max(0, (filled - 0.45) / 0.1));
  }

  // Crop both layers to the union of what is drawn, so they share one box
  let left = w, top = h, right = -1, bottom = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (aText[i] > 0.004 || aArt[i] > 0.004) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  const bw = right - left + 1;
  const bh = bottom - top + 1;
  const art = Buffer.alloc(bw * bh * 4);
  const text = Buffer.alloc(bw * bh * 4);
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      const i = (y + top) * w + (x + left);
      const q = (y * bw + x) * 4;
      art.set([red[0], red[1], red[2], Math.round(aArt[i] * 255)], q);
      text.set([255, 255, 255, Math.round(aText[i] * 255)], q);
    }
  const raw = { raw: { width: bw, height: bh, channels: 4 } };
  await sharp(art, raw).png({ compressionLevel: 9 }).toFile(path.join(dir, "art.png"));
  await sharp(text, raw).png({ compressionLevel: 9 }).toFile(path.join(dir, "text.png"));

  const box = { left: 0, top: 0, width: bw, height: bh };
  const design = {
    collection: "turkish-time",
    slug: `turkish-time-${slug}`, // the product slug; the folder drops the collection prefix
    units: "pixels of source.png",
    // Sold as T-shirt and long sleeve only (src/lib/catalog.ts productTypesFor)
    garments: ["tshirt", "longsleeve"],
    front: null,
    back: {
      source: "source.png",
      area: { left, top, width: bw, height: bh },
      layers: [{ kind: "art-text", box, art: "art.png", text: "text.png", color: hex(red), minContrast: MIN_CONTRAST }],
      centerX: w / 2,
      reference: { memleketFrameWidth: w },
    },
  };
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify(design, null, 2) + "\n");

  // Check: rebuild on grey (text over art over grey) next to the source on grey
  const rebuilt = Buffer.alloc(bw * bh * 3);
  const source = Buffer.alloc(bw * bh * 3);
  const diff = Buffer.alloc(bw * bh * 3);
  let maxDiff = 0;
  let sumDiff = 0;
  for (let y = 0; y < bh; y++)
    for (let x = 0; x < bw; x++) {
      const i = (y + top) * w + (x + left);
      const q = (y * bw + x) * 3;
      const at = text[(y * bw + x) * 4 + 3] / 255;
      const ar = art[(y * bw + x) * 4 + 3] / 255;
      const sa = data[i * 4 + 3] / 255;
      for (let c = 0; c < 3; c++) {
        const under = ar * red[c] + (1 - ar) * GREY[c];
        const r = at * 255 + (1 - at) * under;
        const s = sa * data[i * 4 + c] + (1 - sa) * GREY[c];
        rebuilt[q + c] = Math.round(r);
        source[q + c] = Math.round(s);
        const d = Math.abs(r - s);
        diff[q + c] = Math.min(255, Math.round(d * 8));
        maxDiff = Math.max(maxDiff, d);
        sumDiff += d;
      }
    }
  fs.mkdirSync(CHECK, { recursive: true });
  const rgb = { raw: { width: bw, height: bh, channels: 3 } };
  const out = path.join(CHECK, `turkish-time-${slug}.png`);
  await sharp({ create: { width: bw * 3, height: bh, channels: 3, background: "#000000" } })
    .composite([
      { input: await sharp(source, rgb).png().toBuffer(), left: 0, top: 0 },
      { input: await sharp(rebuilt, rgb).png().toBuffer(), left: bw, top: 0 },
      { input: await sharp(diff, rgb).png().toBuffer(), left: bw * 2, top: 0 },
    ])
    .png()
    .toFile(out);
  console.log(`${slug}: red ${hex(red)}, box ${bw}x${bh} at ${left},${top}; rebuilt vs source on grey: max ${maxDiff.toFixed(2)}, mean ${(sumDiff / (bw * bh * 3)).toFixed(4)} (0-255) -> ${path.relative(ROOT, out)}`);
}

for (const slug of fs.readdirSync(DIR).sort()) {
  if (fs.existsSync(path.join(DIR, slug, "source.png"))) await extract(slug);
}
