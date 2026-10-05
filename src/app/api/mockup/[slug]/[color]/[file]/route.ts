// Memleket product images, rendered on demand. The site links to
// /products/collections/memleket/<slug>/<colorKey>/<file>; next.config.ts rewrites those
// (fallback, so real files in public/ such as common1.png win) to this route.
// The response is WebP whatever the .png name says, cached for a year by browsers and
// Vercel's CDN. A new deployment starts with an empty CDN cache.

import { garmentColor } from "@/lib/garments";
import { MOCKUP_FILES, findArtwork, renderMockup } from "@/lib/mockups/render";

export const runtime = "nodejs";

type Params = { slug: string; color: string; file: string };

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { slug, color, file } = await params;
  const target = MOCKUP_FILES[file];
  if (!target) return notFound();
  const garmentCol = garmentColor(target.garment, color);
  if (!garmentCol) return notFound();
  if (!findArtwork(slug)) return notFound();
  try {
    const body = await renderMockup({ slug, garment: target.garment, side: target.side, colorKey: color, ink: garmentCol.ink });
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (err) {
    console.error(`mockup ${slug}/${color}/${file}:`, err);
    return new Response("Render failed", { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
