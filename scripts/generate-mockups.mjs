// Builds every Memleket product image (T-shirt, hoodie, sweater; black and white;
// front and back) from blank garment templates plus the artwork of each design.
//
//   designs/templates/logo.svg                                chest logo, printed on every garment
//   designs/templates/tshirt-{front,back}-{black,white}.svg   blank garments
//   designs/templates/{hoodie,sweater}-{front,back}-{black,white}.png
//   designs/memleket/<slug>/photo.(jpg|png)                   the photo inside the frame (back)
//   designs/memleket/<slug>/name.(svg|png)                    city name under the photo (back)
//   designs/memleket/<slug>/plate.(svg|png)                   plate number on the sleeve (front)
//
// Output (what the site loads), per <slug>/{siyah,beyaz}/:
//   front.png back.png  hoodie_front.png hoodie_back.png  sweater_front.png sweater_back.png
//
// logo/name/plate: only their shape (alpha) is used; they are printed white on black
// garments and black on white garments. Run: npm run mockups  (also runs before dev/build)

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const TEMPLATES = path.join(ROOT, "designs/templates");
const DESIGNS = path.join(ROOT, "designs/memleket");
const OUT = path.join(ROOT, "public/products/collections/memleket");
const SELF = new URL(import.meta.url).pathname;

// The back print is laid out on the T-shirt (1764x1591) and scaled onto the other garments.
const PRINT = {
  frame: { left: 529, top: 318, width: 705, height: 828, stroke: 2 },
  photo: { left: 552, top: 345, width: 659, height: 775 },
  // PNG artwork is a full crop of the print box; SVG exports from Figma are
  // tight around the letters, so they go into the tighter Figma boxes.
  name: { left: 520, top: 1152, width: 722, height: 148 },
  nameSvg: { left: 530, top: 1170, width: 703, height: 106 },
};
// Sleeve number box on the T-shirt front (1794x1628)
const PLATE = {
  png: { left: 1400, top: 420, width: 320, height: 300 },
  svg: { left: 1430, top: 455, width: 250, height: 220 },
};
const PRINT_ORIGIN = { x: 528, y: 317 }; // top-left of the frame on the T-shirt

// Per garment and template colour: where the back print goes (origin + scale), the chest
// logo (centre x, top, height), and the sleeve number (rotation relative to the T-shirt,
// scale, centre). Measured on the original Figma mockups.
const GARMENTS = {
  tshirt: {
    file: (side) => `${side}.png`,
    black: { back: { x: 528, y: 317, scale: 1 }, logo: { cx: 897, top: 401, height: 44 }, plate: null },
    white: { back: { x: 528, y: 317, scale: 1 }, logo: { cx: 897, top: 401, height: 44 }, plate: null },
  },
  hoodie: {
    file: (side) => `hoodie_${side}.png`,
    black: { back: { x: 500, y: 624, scale: 0.8958 }, logo: { cx: 823.5, top: 620, height: 44 }, plate: { rotate: 15, scale: 0.74, cx: 1405, cy: 768 } },
    white: { back: { x: 500, y: 624, scale: 0.8958 }, logo: { cx: 823.5, top: 620, height: 44 }, plate: { rotate: 15, scale: 0.74, cx: 1404.5, cy: 787.5 } },
  },
  sweater: {
    file: (side) => `sweater_${side}.png`,
    black: { back: { x: 428, y: 381, scale: 0.8958 }, logo: { cx: 744.5, top: 431, height: 44 }, plate: { rotate: 15, scale: 0.83, cx: 1305, cy: 507.5 } },
    white: { back: { x: 428, y: 355, scale: 0.8958 }, logo: { cx: 743.5, top: 462, height: 44 }, plate: { rotate: 15, scale: 0.83, cx: 1305, cy: 538.5 } },
  },
};

const COLORS = {
  siyah: { template: "black", ink: { r: 255, g: 255, b: 255 }, inkHex: "#ffffff" },
  beyaz: { template: "white", ink: { r: 0, g: 0, b: 0 }, inkHex: "#000000" },
};

const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const force = process.argv.includes("--force");

function findFile(dir, base, exts) {
  for (const ext of exts) {
    const file = path.join(dir, `${base}.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

// Alpha channel of a logo/name/plate file, fitted (centered) into width x height
async function maskOf(file, width, height) {
  return sharp(file, { density: 300 })
    .resize(width, height, { fit: "contain", background: CLEAR })
    .ensureAlpha()
    .extractChannel("alpha")
    .png()
    .toBuffer();
}

async function colorize(mask, ink) {
  const { width, height } = await sharp(mask).metadata();
  return sharp({ create: { width, height, channels: 3, background: ink } }).joinChannel(mask).png().toBuffer();
}

const scaleBox = (box, t) => ({
  left: Math.round(t.x + (box.left - PRINT_ORIGIN.x) * t.scale),
  top: Math.round(t.y + (box.top - PRINT_ORIGIN.y) * t.scale),
  width: Math.round(box.width * t.scale),
  height: Math.round(box.height * t.scale),
});

async function backLayers(art, t, ink, inkHex) {
  const f = scaleBox(PRINT.frame, t);
  const stroke = PRINT.frame.stroke;
  const frame = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f.width + stroke}" height="${f.height + stroke}">` +
      `<rect x="${stroke / 2}" y="${stroke / 2}" width="${f.width}" height="${f.height}" fill="none" stroke="${inkHex}" stroke-width="${stroke}"/></svg>`
  );
  const p = scaleBox(PRINT.photo, t);
  const n = scaleBox(art.name.endsWith(".svg") ? PRINT.nameSvg : PRINT.name, t);
  return [
    { input: frame, left: f.left - stroke / 2, top: f.top - stroke / 2 },
    { input: await sharp(art.photo).resize(p.width, p.height, { fit: "cover" }).png().toBuffer(), left: p.left, top: p.top },
    { input: await colorize(await maskOf(art.name, n.width, n.height), ink), left: n.left, top: n.top },
  ];
}

async function logoLayer(logo, ink) {
  const meta = await sharp(path.join(TEMPLATES, "logo.svg")).metadata();
  const width = Math.round((logo.height * meta.width) / meta.height);
  const mask = await maskOf(path.join(TEMPLATES, "logo.svg"), width, logo.height);
  return { input: await colorize(mask, ink), left: Math.round(logo.cx - width / 2), top: logo.top };
}

async function plateLayer(plateFile, placement, ink) {
  const box = plateFile.endsWith(".svg") ? PLATE.svg : PLATE.png;
  const mask = await maskOf(plateFile, box.width, box.height);
  if (!placement) return { input: await colorize(mask, ink), left: box.left, top: box.top };
  // Other garments: turn to the sleeve angle, scale, centre the digits on the sleeve
  const turned = await sharp(mask).rotate(placement.rotate, { background: { r: 0, g: 0, b: 0 } }).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const width = Math.round(turned.info.width * placement.scale);
  const height = Math.round(turned.info.height * placement.scale);
  const scaled = await sharp(turned.data).resize(width, height).extractChannel(0).png().toBuffer();
  return { input: await colorize(scaled, ink), left: Math.round(placement.cx - width / 2), top: Math.round(placement.cy - height / 2) };
}

async function loadTemplates() {
  const templates = {};
  for (const garment of Object.keys(GARMENTS)) {
    for (const side of ["front", "back"]) {
      for (const color of ["black", "white"]) {
        const base = path.join(TEMPLATES, `${garment}-${side}-${color}`);
        const file = fs.existsSync(`${base}.svg`) ? `${base}.svg` : `${base}.png`;
        templates[`${garment}-${side}-${color}`] = await sharp(file).png().toBuffer();
      }
    }
  }
  return templates;
}

function isFresh(outputs, inputs) {
  if (force || !outputs.every((f) => fs.existsSync(f))) return false;
  const newestInput = Math.max(...inputs.map((f) => fs.statSync(f).mtimeMs));
  return outputs.every((f) => fs.statSync(f).mtimeMs >= newestInput);
}

async function buildDesign(slug, templates) {
  const dir = path.join(DESIGNS, slug);
  const art = {
    photo: findFile(dir, "photo", ["jpg", "jpeg", "png", "webp"]),
    name: findFile(dir, "name", ["svg", "png"]),
    plate: findFile(dir, "plate", ["svg", "png"]),
  };
  const missing = Object.keys(art).filter((k) => !art[k]);
  if (missing.length) {
    console.warn(`  ! ${slug}: missing ${missing.join(", ")}, skipped`);
    return "skipped";
  }

  const outputs = Object.keys(COLORS).flatMap((color) =>
    Object.values(GARMENTS).flatMap((g) => ["front", "back"].map((side) => path.join(OUT, slug, color, g.file(side))))
  );
  const templateFiles = fs.readdirSync(TEMPLATES).map((f) => path.join(TEMPLATES, f));
  if (isFresh(outputs, [...Object.values(art), ...templateFiles, SELF])) return "fresh";

  for (const [color, { template, ink, inkHex }] of Object.entries(COLORS)) {
    const outDir = path.join(OUT, slug, color);
    fs.mkdirSync(outDir, { recursive: true });
    for (const [garment, g] of Object.entries(GARMENTS)) {
      const spec = g[template];
      await sharp(templates[`${garment}-back-${template}`])
        .composite(await backLayers(art, spec.back, ink, inkHex))
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, g.file("back")));
      await sharp(templates[`${garment}-front-${template}`])
        .composite([await logoLayer(spec.logo, ink), await plateLayer(art.plate, spec.plate, ink)])
        .png({ compressionLevel: 9 })
        .toFile(path.join(outDir, g.file("front")));
    }
  }
  return "built";
}

async function main() {
  if (!fs.existsSync(DESIGNS)) return;
  const templates = await loadTemplates();
  const slugs = fs.readdirSync(DESIGNS).filter((d) => fs.statSync(path.join(DESIGNS, d)).isDirectory());
  const counts = { built: 0, fresh: 0, skipped: 0 };
  for (const slug of slugs) counts[await buildDesign(slug, templates)]++;
  console.log(`mockups: ${counts.built} built, ${counts.fresh} up to date, ${counts.skipped} skipped`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
