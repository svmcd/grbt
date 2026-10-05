"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ImageZoomProps {
  images: string[];
  index: number;
  alt: (index: number) => string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: { close: string; prev: string; next: string };
}

const MAGNIFY = 2.5;

// Full-screen zoom view for the product gallery.
// Mouse: click magnifies around the cursor, moving the mouse pans, click again to zoom out.
// Touch: tap magnifies around the finger, drag to pan (native scrolling), tap again to zoom out,
// swipe left/right (when not magnified) to change image. Arrow keys switch images, Escape closes.
export function ImageZoom({ images, index, alt, onIndexChange, onClose, labels }: ImageZoomProps) {
  const [magnified, setMagnified] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [touch, setTouch] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const count = images.length;

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

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

  // Point under the cursor/finger as a percentage of the viewport
  const pointAt = (clientX: number, clientY: number) => {
    const rect = viewport.current!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  // Touch: after magnifying, scroll so the tapped point stays under the finger
  useEffect(() => {
    const el = viewport.current;
    if (!touch || !el) return;
    if (magnified) {
      el.scrollLeft = (origin.x / 100) * el.scrollWidth - el.clientWidth / 2;
      el.scrollTop = (origin.y / 100) * el.scrollHeight - el.clientHeight / 2;
    } else {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  }, [magnified, touch, origin]);

  const toggle = (clientX: number, clientY: number) => {
    if (!magnified) setOrigin(pointAt(clientX, clientY));
    setMagnified((m) => !m);
  };

  const arrow = "M9 6l6 6-6 6";
  const image = (
    <Image
      key={images[index]}
      src={images[index]}
      alt={alt(index)}
      fill
      // The renders are 1600px: load them at full size so magnified detail stays sharp
      sizes="(max-width: 768px) 250vw, 100vw"
      quality={90}
      loading="eager"
      className={"object-contain " + (touch ? "" : "transition-transform duration-300")}
      style={
        touch
          ? undefined
          : { transform: magnified ? `scale(${MAGNIFY})` : "scale(1)", transformOrigin: `${origin.x}% ${origin.y}%` }
      }
      draggable={false}
    />
  );

  // Rendered on <body>: an ancestor of the gallery creates a containing block (transform/contain),
  // which would trap a fixed overlay inside the photo column
  if (typeof document === "undefined") return null;
  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex flex-col bg-paper text-ink">
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
        ref={viewport}
        className={
          "relative flex-1 " +
          (touch ? (magnified ? "overflow-auto" : "overflow-hidden") : "overflow-hidden") +
          (magnified ? " cursor-zoom-out" : " cursor-zoom-in")
        }
        onClick={(e) => toggle(e.clientX, e.clientY)}
        onMouseMove={!touch && magnified ? (e) => setOrigin(pointAt(e.clientX, e.clientY)) : undefined}
        onTouchStart={(e) => {
          const t = e.touches[0];
          swipe.current = { x: t.clientX, y: t.clientY, moved: false };
        }}
        onTouchEnd={(e) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start || magnified || count < 2) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - start.x;
          const dy = t.clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            e.preventDefault(); // no tap-to-zoom after a swipe
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        {touch ? (
          // Touch: a larger box inside a scrolling viewport, panned with the finger
          <div
            className="relative"
            style={{ width: magnified ? `${MAGNIFY * 100}%` : "100%", height: magnified ? `${MAGNIFY * 100}%` : "100%" }}
          >
            {image}
          </div>
        ) : (
          image
        )}
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
    </div>,
    document.body
  );
}
