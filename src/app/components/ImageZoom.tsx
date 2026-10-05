"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ImageZoomProps {
  images: string[];
  index: number;
  alt: (index: number) => string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: { close: string; prev: string; next: string };
}

// Full-screen zoom view for the product gallery. Click the image to magnify it
// 2x around the cursor, move the mouse to pan. Arrow keys switch images,
// Escape closes.
export function ImageZoom({ images, index, alt, onIndexChange, onClose, labels }: ImageZoomProps) {
  const [magnified, setMagnified] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const count = images.length;

  const go = (delta: number) => {
    setMagnified(false);
    onIndexChange((index + delta + count) % count);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (count > 1 && e.key === "ArrowRight") go(1);
      if (count > 1 && e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count]);

  const track = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const arrow = "M9 6l6 6-6 6";

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex flex-col bg-paper text-ink">
      <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-8 lg:px-12">
        <span className="sub-xs text-subdued">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className="-mr-2 flex h-11 w-11 items-center justify-center"
          autoFocus
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>

      <div
        className={
          "relative flex-1 overflow-hidden " + (magnified ? "cursor-zoom-out" : "cursor-zoom-in")
        }
        onClick={(e) => {
          track(e);
          setMagnified((m) => !m);
        }}
        onMouseMove={magnified ? track : undefined}
      >
        <Image
          key={images[index]}
          src={images[index]}
          alt={alt(index)}
          fill
          sizes="100vw"
          className="object-contain transition-transform duration-300"
          style={{
            transform: magnified ? "scale(2)" : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        />
      </div>

      {count > 1 && (
        <div className="flex h-20 shrink-0 items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={labels.prev}
            className="flex h-11 w-11 items-center justify-center border border-solid! border-line! hover:border-ink!"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="rotate-180">
              <path d={arrow} />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={labels.next}
            className="flex h-11 w-11 items-center justify-center border border-solid! border-line! hover:border-ink!"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d={arrow} />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
