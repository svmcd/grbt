"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMessages } from "@/i18n/LocaleProvider";
import productPageMessages from "@/i18n/messages/productPage";
import { ImageZoom } from "@/app/components/ImageZoom";

// Product image slider: square slides on white, swipe/scroll-snap on touch,
// dash indicators, "+" button that opens the full-screen zoom view.
// `images` only lists images that exist (decided on the server, see gallery-images.ts),
// so the first slide renders right away; an image that still fails to load is dropped.
export function Gallery({ images, city }: { images: string[]; city: string }) {
  const t = useMessages(productPageMessages).gallery;
  const [broken, setBroken] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const key = images.join("|");
  const validImages = images.filter((src) => src && !broken.includes(src));

  // New variant (color / product type): back to the first image
  useEffect(() => {
    setIndex(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [key]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(i);
  };

  const altFor = (i: number) => t.thumbAlt(city, (validImages[i] ?? "").includes("back"));

  return (
    <div className="relative w-full bg-paper lg:border lg:border-line">
      <div
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && index < validImages.length - 1) goTo(index + 1);
          if (e.key === "ArrowLeft" && index > 0) goTo(index - 1);
        }}
        className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {validImages.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setIndex(i);
              setZoomOpen(true);
            }}
            className="relative aspect-square w-full shrink-0 snap-center cursor-zoom-in"
            aria-label={t.zoom}
          >
            <Image
              src={src}
              alt={altFor(i)}
              fill
              priority={i === 0}
              sizes="(max-width: 1023px) 100vw, 50vw"
              onError={() => setBroken((b) => (b.includes(src) ? b : [...b, src]))}
              className="object-contain px-[6%] pt-[5%] pb-[10%]"
            />
          </button>
        ))}
      </div>

      {validImages.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2 sm:bottom-8">
          {validImages.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t.goTo(i + 1)}
              aria-current={i === index}
              className="flex h-6 items-center"
            >
              <span
                className={
                  "block h-[2px] transition-all duration-300 " +
                  (i === index ? "w-5 bg-ink" : "w-3 bg-line-strong")
                }
              />
            </button>
          ))}
        </div>
      )}

      {validImages.length > 0 && (
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label={t.zoom}
          className="absolute right-3 bottom-3 flex h-11 w-11 items-center justify-center text-ink sm:right-6 sm:bottom-6 lg:right-10 lg:bottom-8"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 3v18M3 12h18" />
          </svg>
        </button>
      )}

      {zoomOpen && validImages.length > 0 && (
        <ImageZoom
          images={validImages}
          index={Math.min(index, validImages.length - 1)}
          alt={altFor}
          onIndexChange={(i) => {
            setIndex(i);
            const track = trackRef.current;
            if (track) track.scrollTo({ left: i * track.clientWidth });
          }}
          onClose={() => setZoomOpen(false)}
          labels={{ close: t.close, prev: t.prev, next: t.next }}
        />
      )}
    </div>
  );
}
