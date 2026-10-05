import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    // Product images carry ?v=<MOCKUP_VERSION> so browsers reload them after a design change
    localPatterns: [{ pathname: "/**" }],
  },
  // Memleket, Hasret, Sinema and Turkish Time product images are rendered on demand by src/app/api/mockup/
  // from designs/. Fallback rewrites run after public/ files, so committed extras (common1.png)
  // still win. The route reads the collection from the original path (Next hands it the
  // original URL), or from ?collection= where a platform passes the rewritten one.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/products/collections/memleket/:slug/:color/:file",
          destination: "/api/mockup/:slug/:color/:file",
        },
        {
          source: "/products/collections/hasret/:slug/:color/:file",
          destination: "/api/mockup/:slug/:color/:file?collection=hasret",
        },
        {
          source: "/products/collections/recep_ivedik/:slug/:color/:file",
          destination: "/api/mockup/:slug/:color/:file?collection=recep_ivedik",
        },
        {
          source: "/products/collections/turkish-time/:slug/:color/:file",
          destination: "/api/mockup/:slug/:color/:file?collection=turkish-time",
        },
      ],
    };
  },
  // The route reads the blank garments and artwork from disk; ship them with it (not the
  // Hasret/Sinema source/ mockups or the Turkish Time source.png, which only the extraction
  // scripts read).
  outputFileTracingIncludes: {
    "/api/mockup/[slug]/[color]/[file]": [
      "./designs/templates/**/*",
      "./designs/memleket/**/*",
      "./designs/hasret/*/*.png",
      "./designs/hasret/*/design.json",
      "./designs/sinema/*/*.png",
      "./designs/sinema/*/design.json",
      "./designs/turkish-time/*/art.png",
      "./designs/turkish-time/*/text.png",
      "./designs/turkish-time/*/design.json",
    ],
  },
  // The file tracer follows the route's dynamic designs/ paths into everything; leave the source
  // mockups out.
  outputFileTracingExcludes: {
    "/api/mockup/[slug]/[color]/[file]": ["./designs/*/*/source/**/*", "./designs/*/*/source.png"],
  },
};

export default nextConfig;
