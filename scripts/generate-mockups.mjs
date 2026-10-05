// Local check tool for the Memleket product images. The site renders them on demand
// (src/app/api/mockup/, behind /products/collections/memleket/<slug>/<colorKey>/<file>);
// this script renders the same images to a cache folder so you can look at them.
//
//   npm run mockups                      every design, every colour, every garment
//   npm run mockups -- konya rize        only these designs
//   npm run mockups -- konya --sheet     also a contact sheet per design and garment
//   npm run mockups -- --garment hoodie  only one garment
//
// Output: .mockups/<slug>/<colorKey>/<file>.webp (exactly what the site serves) and, with
// --sheet, .mockups/<slug>-<garment>.jpg (every colour, front and back). .mockups is gitignored.
//
// Positions are in src/lib/mockups/render.ts (PLACEMENTS). Blank garments come from
// scripts/fetch-cloprod-blanks.mjs.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
process.chdir(ROOT); // render.ts finds designs/ from the working directory

const { default: sharp } = await import("sharp");
const { GARMENTS } = await import("../src/lib/garments.ts");
const { MOCKUP_FILES, listDesigns, renderMockup } = await import("../src/lib/mockups/render.ts");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const OUT = path.resolve(option("--out") ?? path.join(ROOT, ".mockups"));
const onlyGarment = option("--garment");
const named = args.filter((a, i) => !a.startsWith("--") && !["--out", "--garment"].includes(args[i - 1]));
const designs = listDesigns();
const slugs = named.length ? named : designs;
const unknown = slugs.filter((s) => !designs.includes(s));
if (unknown.length) {
  console.error(`unknown design(s): ${unknown.join(", ")} (designs/memleket/<slug>/ needs photo, name and plate)`);
  process.exit(1);
}

const files = Object.entries(MOCKUP_FILES).filter(([, f]) => !onlyGarment || f.garment === onlyGarment);
const started = Date.now();
let count = 0;
for (const slug of slugs) {
  for (const [file, { garment, side }] of files) {
    for (const color of GARMENTS[garment].colors) {
      const webp = await renderMockup({ slug, garment, side, colorKey: color.key, ink: color.ink });
      const out = path.join(OUT, slug, color.key, file.replace(/\.png$/, ".webp"));
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, webp);
      count++;
    }
  }
  if (flag("--sheet")) {
    for (const garment of new Set(files.map(([, f]) => f.garment))) {
      const colors = GARMENTS[garment].colors;
      const sides = files.filter(([, f]) => f.garment === garment);
      const tile = 400;
      const tiles = [];
      for (const [row, [file]] of sides.entries()) {
        for (const [col, color] of colors.entries()) {
          const src = path.join(OUT, slug, color.key, file.replace(/\.png$/, ".webp"));
          tiles.push({ input: await sharp(src).resize(tile, tile).toBuffer(), left: col * tile, top: row * tile });
        }
      }
      const sheet = path.join(OUT, `${slug}-${garment}.jpg`);
      await sharp({ create: { width: colors.length * tile, height: sides.length * tile, channels: 3, background: "#ffffff" } })
        .composite(tiles)
        .jpeg({ quality: 85 })
        .toFile(sheet);
      console.log(sheet);
    }
  }
}
console.log(`mockups: ${count} images for ${slugs.length} design(s) in ${((Date.now() - started) / 1000).toFixed(1)} s -> ${path.relative(ROOT, OUT)}/`);
