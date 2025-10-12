"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function Gallery({ images, city }: { images: string[]; city: string }) {
  const [validImages, setValidImages] = useState<string[]>([]);
  const [active, setActive] = useState<string>("");

  // Check which images actually exist
  useEffect(() => {
    const checkImages = async () => {
      const existingImages: string[] = [];

      for (const imageSrc of images) {
        if (!imageSrc) continue;

        try {
          const response = await fetch(imageSrc, { method: "HEAD" });
          if (response.ok) {
            existingImages.push(imageSrc);
          }
        } catch {
          // Image doesn't exist, skip it
        }
      }

      setValidImages(existingImages);
      if (existingImages.length > 0 && !active) {
        setActive(existingImages[0]);
      }
    };

    checkImages();
  }, [images, active]);

  // Update active image when images prop changes (color selection)
  useEffect(() => {
    if (validImages.length > 0) {
      // Only update if the current active image is not in the new images array
      if (!validImages.includes(active)) {
        setActive(validImages[0]);
      }
    }
  }, [validImages, active]);

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative w-full aspect-square">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-none blur-sm" />
        {active && (
          <Image
            src={active}
            alt={`Memleket ${city}`}
            fill
            className="object-contain relative z-10"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {validImages.map((src) => {
          const isBack = src.includes("back.png");
          const isFront = src.includes("front.png");
          const isActive = active === src;
          const showLabel = isBack || isFront;

          return (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className={
                "relative aspect-square border rounded-none overflow-hidden transition-all " +
                (isActive
                  ? "border-white/80 bg-white/5"
                  : "border-white/20 hover:border-white/40")
              }
              aria-label={`View ${city} ${isBack ? "back" : "front"} image`}
            >
              <Image
                src={src}
                alt={`${city} ${isBack ? "back" : "front"}`}
                fill
                className="object-contain p-2"
              />
              {/* Image label - only for front/back/shirt images */}
              {showLabel && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-none">
                  {isBack ? "Arka" : "Ön"}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
