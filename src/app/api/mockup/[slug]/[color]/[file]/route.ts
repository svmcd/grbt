// Product images, rendered on demand. The site links to
// /products/collections/<folder>/<slug>/<colorKey>/<file> (folder memleket, hasret,
// recep_ivedik or turkish-time); next.config.ts rewrites those (fallback, so real files in public/ such as
// common1.png win) to this route. The request keeps the original URL, so the folder is read from
// its path (a direct /api/mockup/... call can pass ?collection=<folder>, default memleket).
// The response is WebP whatever the .png name says, cached for a year by browsers and
// Vercel's CDN. A new deployment starts with an empty CDN cache.

import { garmentColor } from "@/lib/garments";
import { COLLECTION_FOLDERS, MOCKUP_FILES, designHasGarment, hasDesign, renderMockup } from "@/lib/mockups/render";

export const runtime = "nodejs";

type Params = { slug: string; color: string; file: string };

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

const decode = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const p = await params;
  // sıla-yolu may arrive percent-encoded
  const slug = decode(p.slug).normalize("NFC");
  const color = decode(p.color);
  const file = decode(p.file);
  const url = new URL(req.url);
  const folder = url.pathname.match(/^\/products\/collections\/([^/]+)\//)?.[1] ?? url.searchParams.get("collection") ?? "memleket";
  const collection = Object.hasOwn(COLLECTION_FOLDERS, folder) ? COLLECTION_FOLDERS[folder] : undefined;
  if (!collection) return notFound();
  const target = MOCKUP_FILES[file];
  if (!target) return notFound();
  const garmentCol = garmentColor(target.garment, color);
  if (!garmentCol) return notFound();
  if (!hasDesign(collection, slug)) return notFound();
  if (!designHasGarment(collection, slug, target.garment)) return notFound();
  try {
    const body = await renderMockup({ collection, slug, garment: target.garment, side: target.side, colorKey: color, ink: garmentCol.printInk ?? garmentCol.ink, garmentHex: garmentCol.hex });
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (err) {
    console.error(`mockup ${collection}/${slug}/${color}/${file}:`, err);
    return new Response("Render failed", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
