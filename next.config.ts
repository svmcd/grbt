import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
  },
  // Memleket product images are rendered on demand by src/app/api/mockup/ from designs/.
  // Fallback rewrites run after public/ files, so committed extras (common1.png) still win.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/products/collections/memleket/:slug/:color/:file",
          destination: "/api/mockup/:slug/:color/:file",
        },
      ],
    };
  },
  // The route reads the blank garments and artwork from disk; ship them with it.
  outputFileTracingIncludes: {
    "/api/mockup/[slug]/[color]/[file]": ["./designs/templates/**/*", "./designs/memleket/**/*"],
  },
};

export default nextConfig;
