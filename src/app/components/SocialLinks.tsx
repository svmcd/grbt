import Link from "next/link";

export function SocialLinks() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-white font-light text-lg mb-6 font-serif">
          BİZİ TAKİP EDİN
        </h3>
        <p className="text-white/70 text-sm mb-6">
          En yeni tasarımlarımızı ve memleket hikayelerimizi sosyal medyada
          keşfedin
        </p>

        <div className="flex justify-center gap-6">
          <Link
            href="https://instagram.com/studio.grbt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium text-sm rounded-none hover:bg-white/90 transition-all duration-300"
            style={{ backgroundColor: "var(--white)", color: "var(--black)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32">
              <path d="M20.445 5h-8.891A6.559 6.559 0 0 0 5 11.554v8.891A6.559 6.559 0 0 0 11.554 27h8.891a6.56 6.56 0 0 0 6.554-6.555v-8.891A6.557 6.557 0 0 0 20.445 5zm4.342 15.445a4.343 4.343 0 0 1-4.342 4.342h-8.891a4.341 4.341 0 0 1-4.341-4.342v-8.891a4.34 4.34 0 0 1 4.341-4.341h8.891a4.342 4.342 0 0 1 4.341 4.341l.001 8.891z" />
              <path d="M16 10.312c-3.138 0-5.688 2.551-5.688 5.688s2.551 5.688 5.688 5.688 5.688-2.551 5.688-5.688-2.55-5.688-5.688-5.688zm0 9.163a3.475 3.475 0 1 1-.001-6.95 3.475 3.475 0 0 1 .001 6.95zM21.7 8.991a1.363 1.363 0 1 1-1.364 1.364c0-.752.51-1.364 1.364-1.364z" />
            </svg>
            Instagram
          </Link>

          <Link
            href="https://tiktok.com/@grbt.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium text-sm rounded-none hover:bg-white/90 transition-all duration-300"
            style={{ backgroundColor: "var(--white)", color: "var(--black)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            TikTok
          </Link>
        </div>
      </div>
    </div>
  );
}
