// Lists the optional extra photos of the product galleries (common1.png, common2.png, ...
// next to the T-shirt mockups) in src/app/product/[slug]/extra-photos.json, so the product
// page knows which of them exist without asking the browser to probe for them.
// The Memleket front and back images are rendered on demand (src/app/api/mockup/).
//
// Run after adding or removing an extra photo: node scripts/product-extra-photos.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PUBLIC = path.join(ROOT, "public");
const PRODUCTS = path.join(PUBLIC, "products");
const OUT = path.join(ROOT, "src/app/product/[slug]/extra-photos.json");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const photos = walk(PRODUCTS)
  .filter((file) => /^common\d+\.png$/.test(path.basename(file)))
  .map((file) => "/" + path.relative(PUBLIC, file).split(path.sep).join("/"))
  .sort();

fs.writeFileSync(OUT, JSON.stringify(photos, null, 2) + "\n");
console.log(`extra-photos.json: ${photos.length} photos`);
