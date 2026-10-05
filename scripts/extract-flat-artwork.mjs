// One-off extraction of the Hasret and Sinema print artwork from their old flat Figma mockups
// (designs/<collection>/<slug>/source/), so the mockup renderer can print them on the Cloprod
// garments like Memleket. The flat mockups are clean renders on a solid black or white garment,
// so the artwork comes out exactly:
//   - photos: the exact rectangle, cropped to fully covered pixels (no garment pixels)
//   - text and line art: alpha masks from luminance against the garment colour
//     (white on black: alpha = luminance; black on white: alpha = 1 - luminance), white on
//     transparent; the red dot of sıla-yolu is un-mixed into its own colour mask
//   - the thin frame around the gurbetten-memlekete photo: measured, drawn by the renderer
// Writes the artwork and design.json into designs/<collection>/<slug>/ and an overlay check
// (extraction composited back onto the source garment, next to the source, plus the difference)
// to .mockups/extract/. Prints the largest pixel difference per layer.
//
//   node scripts/extract-flat-artwork.mjs
//
// All boxes in design.json are in pixels of the source mockup; see src/lib/mockups/render.ts
// (flat designs) for how they are scaled onto the garments.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DESIGNS = path.join(ROOT, "designs");
const CHECK = path.join(ROOT, ".mockups", "extract");

// Garment centre line on the flat mockups (collar centre; the chest logo sits on it)
const FRONT_CENTER_X = 897;
const BACK_CENTER_X = 867.5;
// The eğrikuyu chest logo on the front mockups: 46 px tall, its bottom at y 520 on yabanci.
const LOGO = { left: 826, top: 475, width: 142, height: 46 };
// gurbetten-memlekete's frame (775 px wide) is printed as wide as the Memleket frame
const BACK_REFERENCE_WIDTH = 775;

// search: a region that holds the layer and no garment outline; the found box must not touch it
const DESIGNS_SPEC = [
  {
    collection: "hasret",
    slug: "gurbetten-memlekete",
    back: {
      source: "source/siyah/back.png",
      garment: "black",
      // frame: measured from the line itself (2 px, outer edge 478..1252.75 x 325..793)
      frame: { left: 478, top: 325, width: 774.75, height: 468, stroke: 2 },
      photo: { search: { left: 482, top: 329, width: 766, height: 460 } },
      masks: [{ name: "caption", search: { left: 470, top: 800, width: 400, height: 60 } }],
    },
  },
  {
    collection: "hasret",
    slug: "sıla-yolu",
    back: {
      source: "source/beyaz/back.png",
      garment: "white",
      masks: [{ name: "art", search: { left: 430, top: 215, width: 900, height: 620 }, red: "dot" }],
    },
  },
  {
    collection: "hasret",
    slug: "yabanci",
    front: {
      source: "source/siyah/front.png",
      garment: "black",
      masks: [{ name: "caption", search: { left: 600, top: 540, width: 600, height: 70 } }],
    },
  },
  ...["devam", "sensiz_olmaz", "recep_to_my_sibel", "sibel_to_my_recep"].map((slug) => ({
    collection: "sinema",
    slug,
    front: {
      source: "source/front_black.png",
      garment: "black",
      // sensiz_olmaz's photo is black at its edges, so its rectangle shows on the white mockup
      photoSource: slug === "sensiz_olmaz" ? "source/front_white.png" : undefined,
      photoGarment: slug === "sensiz_olmaz" ? "white" : undefined,
      photo: { search: { left: 560, top: 380, width: 680, height: 360 } },
      masks: [{ name: "caption", search: { left: 600, top: 680, width: 600, height: 110 }, belowPhoto: true }],
    },
  })),
];

async function load(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const GARMENT_RGB = { black: [0, 0, 0], white: [255, 255, 255] };

// RGB of a pixel with the transparent outside of the garment read as garment colour
function rgb(img, x, y, garment) {
  const i = (y * img.width + x) * 4;
  if (img.data[i + 3] < 255) return GARMENT_RGB[garment];
  return [img.data[i], img.data[i + 1], img.data[i + 2]];
}

const inside = (b, x, y) => x >= b.left && x < b.left + b.width && y >= b.top && y < b.top + b.height;

// Tight box of pixels that differ from the garment, then drop edge rows/cols that are only
// partly covered (anti-aliased photo edge), so the crop holds photo pixels only.
function findPhoto(img, garment, search) {
  const g = GARMENT_RGB[garment];
  const diff = (x, y) => {
    const p = rgb(img, x, y, garment);
    return Math.max(Math.abs(p[0] - g[0]), Math.abs(p[1] - g[1]), Math.abs(p[2] - g[2]));
  };
  let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
  for (let y = search.top; y < search.top + search.height; y++)
    for (let x = search.left; x < search.left + search.width; x++)
      if (diff(x, y) > 6) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  // the photo is the big block: the rows/cols where most pixels differ (text below is sparse)
  const rowCover = (y) => { let n = 0; for (let x = x0; x <= x1; x++) n += diff(x, y) > 6; return n / (x1 - x0 + 1); };
  while (rowCover(y1) < 0.6) y1--;
  const lineSum = (horizontal, k, a, b) => { let s = 0; for (let t = a; t <= b; t++) s += horizontal ? diff(t, k) : diff(k, t); return s / (b - a + 1); };
  // partial edge: much weaker than the line just inside it
  const trim = () => {
    let changed = false;
    if (lineSum(true, y0, x0, x1) < 0.85 * lineSum(true, y0 + 1, x0, x1)) { y0++; changed = true; }
    if (lineSum(true, y1, x0, x1) < 0.85 * lineSum(true, y1 - 1, x0, x1)) { y1--; changed = true; }
    if (lineSum(false, x0, y0, y1) < 0.85 * lineSum(false, x0 + 1, y0, y1)) { x0++; changed = true; }
    if (lineSum(false, x1, y0, y1) < 0.85 * lineSum(false, x1 - 1, y0, y1)) { x1--; changed = true; }
    return changed;
  };
  let guard = 0;
  while (trim() && guard++ < 4);
  const box = { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
  if (!inside(search, x0 - 1, y0 - 1) || !inside(search, x1 + 1, y1 + 1)) throw new Error("photo touches its search box");
  return box;
}

// Alpha of the ink (and of the red colour when asked) per pixel, from un-mixing the pixel
// against the garment colour. Ink is white on a black garment, black on a white one.
function unmix(img, garment, x, y, red) {
  const [r, g, b] = rgb(img, x, y, garment);
  if (garment === "black") {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return { ink: lum / 255, red: 0 };
  }
  if (!red) {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return { ink: 1 - lum / 255, red: 0 };
  }
  // pixel = k*black + q*red + (1-k-q)*white
  const aRed = Math.max(0, Math.min(1, (r - g) / (red[0] - red[1])));
  const aInk = Math.max(0, Math.min(1, 1 - (r - aRed * red[0] + 255 * aRed) / 255));
  void b;
  return { ink: aInk, red: aRed };
}

function findMask(img, garment, search, red, exclude) {
  let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
  for (let y = search.top; y < search.top + search.height; y++)
    for (let x = search.left; x < search.left + search.width; x++) {
      if (exclude && inside(exclude, x, y)) continue;
      const a = unmix(img, garment, x, y, red);
      if (a.ink > 0.03 || a.red > 0.03) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
    }
  if (x1 < 0) throw new Error("no mask found");
  const box = { left: x0 - 1, top: y0 - 1, width: x1 - x0 + 3, height: y1 - y0 + 3 }; // 1 px clear ring
  if (!inside(search, box.left - 1, box.top - 1) || !inside(search, box.left + box.width, box.top + box.height))
    throw new Error("mask touches its search box");
  return box;
}

async function writeMask(img, garment, box, file, channel, red) {
  const out = Buffer.alloc(box.width * box.height * 4);
  let maxA = 0;
  for (let y = 0; y < box.height; y++)
    for (let x = 0; x < box.width; x++) {
      const a = unmix(img, garment, box.left + x, box.top + y, red)[channel];
      const i = (y * box.width + x) * 4;
      out[i] = out[i + 1] = out[i + 2] = 255;
      out[i + 3] = Math.round(a * 255);
      maxA = Math.max(maxA, a);
    }
  await sharp(out, { raw: { width: box.width, height: box.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
  return maxA;
}

// Composite the extracted layers onto the plain garment colour at their source positions and
// compare with the source mockup inside the print area.
async function overlayCheck(img, garment, side, layers, dir, label) {
  const area = side.area;
  const pad = 12;
  const region = { left: Math.floor(area.left) - pad, top: Math.floor(area.top) - pad, width: Math.ceil(area.width) + 2 * pad, height: Math.ceil(area.height) + 2 * pad };
  const base = sharp({ create: { width: region.width, height: region.height, channels: 3, background: garment === "black" ? "#000" : "#fff" } });
  const comps = [];
  const inkHex = garment === "black" ? "#ffffff" : "#000000";
  for (const l of layers) {
    const left = area.left + l.box.left - region.left;
    const top = area.top + l.box.top - region.top;
    if (l.kind === "photo") comps.push({ input: path.join(dir, l.file), left: Math.round(left), top: Math.round(top) });
    if (l.kind === "mask" || l.kind === "color-mask") {
      const color = l.kind === "mask" ? inkHex : l.color;
      const alpha = await sharp(path.join(dir, l.file)).extractChannel(3).toBuffer();
      const meta = await sharp(path.join(dir, l.file)).metadata();
      const tinted = await sharp({ create: { width: meta.width, height: meta.height, channels: 3, background: color } }).joinChannel(alpha).png().toBuffer();
      comps.push({ input: tinted, left: Math.round(left), top: Math.round(top) });
    }
    if (l.kind === "frame") {
      const s = l.stroke;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${region.width}" height="${region.height}"><rect x="${left + s / 2}" y="${top + s / 2}" width="${l.box.width - s}" height="${l.box.height - s}" fill="none" stroke="${inkHex}" stroke-width="${s}"/></svg>`;
      comps.push({ input: Buffer.from(svg), left: 0, top: 0 });
    }
  }
  const rebuilt = await base.composite(comps).removeAlpha().raw().toBuffer();
  const src = Buffer.alloc(region.width * region.height * 3);
  for (let y = 0; y < region.height; y++)
    for (let x = 0; x < region.width; x++) {
      const p = rgb(img, region.left + x, region.top + y, garment);
      src.set(p, (y * region.width + x) * 3);
    }
  const diff = Buffer.alloc(src.length);
  // the photo's anti-aliased edge (1 px ring around the crop) is left out of the crop on purpose
  const rings = layers.filter((l) => l.kind === "photo").map((l) => ({ left: area.left + l.box.left - region.left, top: area.top + l.box.top - region.top, width: l.box.width, height: l.box.height }));
  const onRing = (x, y) => rings.some((r) => inside({ left: r.left - 1, top: r.top - 1, width: r.width + 2, height: r.height + 2 }, x, y) && !inside(r, x, y));
  let max = 0, sum = 0, over8 = 0, ring = 0;
  for (let i = 0; i < src.length; i += 3) {
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(src[i + c] - rebuilt[i + c]));
    diff[i] = diff[i + 1] = diff[i + 2] = Math.min(255, d * 4);
    const px = (i / 3) % region.width, py = Math.floor(i / 3 / region.width);
    if (onRing(px, py)) { if (d > 8) ring++; continue; }
    max = Math.max(max, d); sum += d; if (d > 8) over8++;
  }
  const raw = { raw: { width: region.width, height: region.height, channels: 3 } };
  fs.mkdirSync(CHECK, { recursive: true });
  const w = region.width;
  await sharp({ create: { width: w * 3 + 20, height: region.height, channels: 3, background: "#ff00ff" } })
    .composite([
      { input: await sharp(src, raw).png().toBuffer(), left: 0, top: 0 },
      { input: await sharp(rebuilt, raw).png().toBuffer(), left: w + 10, top: 0 },
      { input: await sharp(diff, raw).png().toBuffer(), left: 2 * w + 20, top: 0 },
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(CHECK, `${label}.jpg`));
  console.log(`  check ${label}: max diff ${max}, mean ${(sum / (src.length / 3)).toFixed(3)}, pixels > 8: ${over8} (photo edge ring: ${ring})`);
}

// Offset of the photo `box` of image a inside image b (exhaustive search, mean abs difference)
function register(a, box, b, garment) {
  let best = { err: Infinity, dx: 0, dy: 0 };
  for (let dy = -60; dy <= 60; dy++)
    for (let dx = -20; dx <= 20; dx++) {
      let err = 0, n = 0;
      for (let y = box.top + 2; y < box.top + box.height - 2; y += 3)
        for (let x = box.left + 2; x < box.left + box.width - 2; x += 3) {
          const p = rgb(a, x, y, garment), q = rgb(b, x + dx, y + dy, garment);
          err += Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
          n++;
        }
      err /= n;
      if (err < best.err) best = { err, dx, dy };
    }
  console.log(`  registered photo: dx ${best.dx}, dy ${best.dy}, mean abs error ${best.err.toFixed(2)}`);
  return { ...box, left: box.left + best.dx, top: box.top + best.dy };
}

const rel = (box, area) => ({ left: +(box.left - area.left).toFixed(2), top: +(box.top - area.top).toFixed(2), width: +box.width.toFixed(2), height: +box.height.toFixed(2) });

for (const spec of DESIGNS_SPEC) {
  const dir = path.join(DESIGNS, spec.collection, spec.slug);
  console.log(`${spec.collection}/${spec.slug}`);
  const json = { collection: spec.collection, slug: spec.slug, units: "pixels of the source mockup" };
  for (const sideName of ["front", "back"]) {
    const side = spec[sideName];
    if (!side) {
      json[sideName] = null;
      continue;
    }
    const img = await load(path.join(dir, side.source));
    const boxes = []; // absolute source boxes, with layer info
    let photoBox = null;
    if (side.frame) boxes.push({ kind: "frame", abs: side.frame, stroke: side.frame.stroke });
    if (side.photo) {
      const pimg = side.photoSource ? await load(path.join(dir, side.photoSource)) : img;
      const pg = side.photoGarment ?? side.garment;
      const found = findPhoto(pimg, pg, side.photo.search);
      const { data, width, height } = pimg;
      await sharp(data, { raw: { width, height, channels: 4 } }).extract(found).removeAlpha().png({ compressionLevel: 9 }).toFile(path.join(dir, "photo.png"));
      // measured on another mockup: find where the same photo sits on this one
      photoBox = pimg === img ? found : register(pimg, found, img, side.garment);
      boxes.push({ kind: "photo", file: "photo.png", abs: photoBox, from: side.photoSource ?? side.source });
      console.log(`  photo ${JSON.stringify(found)} from ${side.photoSource ?? side.source}${pimg === img ? "" : `, at ${JSON.stringify(photoBox)} on ${side.source}`}`);
    }
    for (const m of side.masks ?? []) {
      let red = null;
      if (m.red) {
        // the dot's colour: the most saturated pixel in the search box
        let best = -1;
        for (let y = m.search.top; y < m.search.top + m.search.height; y++)
          for (let x = m.search.left; x < m.search.left + m.search.width; x++) {
            const p = rgb(img, x, y, side.garment);
            if (p[0] - p[1] > best) { best = p[0] - p[1]; red = p; }
          }
      }
      const search = m.belowPhoto && photoBox ? { ...m.search, top: Math.max(m.search.top, photoBox.top + photoBox.height + 5) } : m.search;
      const box = findMask(img, side.garment, search, red, photoBox);
      const maxInk = await writeMask(img, side.garment, box, path.join(dir, `${m.name}.png`), "ink", red);
      boxes.push({ kind: "mask", file: `${m.name}.png`, abs: box });
      console.log(`  ${m.name} ${JSON.stringify(box)} max alpha ${maxInk.toFixed(3)}`);
      if (red) {
        // the red part as its own mask, tight around the dot
        let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
        for (let y = box.top; y < box.top + box.height; y++)
          for (let x = box.left; x < box.left + box.width; x++)
            if (unmix(img, side.garment, x, y, red).red > 0.03) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        const dot = { left: x0 - 1, top: y0 - 1, width: x1 - x0 + 3, height: y1 - y0 + 3 };
        const maxRed = await writeMask(img, side.garment, dot, path.join(dir, `${m.red}.png`), "red", red);
        const hex = "#" + red.map((v) => v.toString(16).padStart(2, "0")).join("");
        boxes.push({ kind: "color-mask", file: `${m.red}.png`, abs: dot, color: hex });
        console.log(`  ${m.red} ${JSON.stringify(dot)} colour ${hex} max alpha ${maxRed.toFixed(3)}`);
      }
    }
    const l0 = Math.min(...boxes.map((b) => b.abs.left));
    const t0 = Math.min(...boxes.map((b) => b.abs.top));
    const r0 = Math.max(...boxes.map((b) => b.abs.left + b.abs.width));
    const b0 = Math.max(...boxes.map((b) => b.abs.top + b.abs.height));
    const area = { left: l0, top: t0, width: +(r0 - l0).toFixed(2), height: +(b0 - t0).toFixed(2) };
    const layers = boxes.map((b) => {
      const l = { kind: b.kind, box: rel(b.abs, area) };
      if (b.file) l.file = b.file;
      if (b.stroke) l.stroke = b.stroke;
      if (b.color) l.color = b.color;
      if (b.from) l.measuredOn = b.from;
      return l;
    });
    const out = { source: side.source, garment: side.garment === "black" ? "black (white ink)" : "white (black ink)", area, layers };
    if (sideName === "front") {
      out.centerX = FRONT_CENTER_X;
      // scale: the chest logo is LOGO.height px on the source mockup; the print starts this far
      // under the logo (yabanci's measured gap; the Sinema mockups have no logo, they use the same)
      out.reference = { logoHeight: LOGO.height, logoGap: spec.slug === "yabanci" ? area.top - (LOGO.top + LOGO.height) : 37 };
    } else {
      out.centerX = BACK_CENTER_X;
      // scale: this many source px are printed as wide as the Memleket back frame
      out.reference = { memleketFrameWidth: BACK_REFERENCE_WIDTH };
    }
    json[sideName] = out;
    await overlayCheck(img, side.garment, out, layers, dir, `${spec.collection}-${spec.slug}-${sideName}`);
  }
  fs.writeFileSync(path.join(dir, "design.json"), JSON.stringify(json, null, 2) + "\n");
}
