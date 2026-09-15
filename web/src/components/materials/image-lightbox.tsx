"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

export type LightboxImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * The full-screen view of a figure.
 *
 * Every picture in the course can be opened this way — unit photographs, topic diagrams and the
 * previews that hang off a table — so the behaviour lives in one place: Escape closes, the page
 * behind stops scrolling, a click on the backdrop closes, and a click on the picture itself
 * toggles between fitting the screen and full size for reading small print on a map.
 */
export function ImageLightbox({
  image,
  label,
  onClose,
  padded = true,
}: {
  image: LightboxImage;
  label: ReactNode;
  onClose: () => void;
  /** Diagrams and scans need a white mat behind them; photographs do not. */
  padded?: boolean;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const mat = padded ? "bg-white p-2 dark:p-3" : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof label === "string" ? label : image.alt}
      className="fixed inset-0 z-50 flex flex-col bg-[#050C0F]/96 p-4"
      onClick={onClose}
    >
      <div className="flex items-center justify-between gap-4 text-chart">
        <p className="text-sm">{label}</p>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="rounded-card border border-graticule/60 px-3 py-1 text-sm font-semibold text-chart hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Close
        </button>
      </div>
      <div className="mt-4 flex flex-1 items-center justify-center overflow-auto">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsZoomed((zoomed) => !zoomed);
          }}
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          className={isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}
        >
          <div className={`${mat} ${isZoomed ? "" : "max-h-[80vh] max-w-[90vw]"}`}>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className={isZoomed ? "max-w-none" : "h-full max-h-[calc(80vh-1.5rem)] w-full object-contain"}
              priority
            />
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * A picture that opens full screen when clicked. A button rather than a bare image, so it is
 * reachable by keyboard and announced as something that can be opened.
 */
export default function ExpandableImage({
  image,
  label,
  padded = false,
  sizes,
  priority,
  className = "h-auto w-full",
  style,
}: {
  image: LightboxImage;
  label: string;
  padded?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Per-image styling for the thumbnail only — the full-screen view always shows the whole picture. */
  style?: React.CSSProperties;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Expand: ${label}`}
        className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
      >
        <div className={padded ? "bg-white p-2 dark:p-3" : ""}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className={className}
            sizes={sizes}
            priority={priority}
            style={style}
          />
        </div>
      </button>
      {isOpen ? <ImageLightbox image={image} label={label} onClose={() => setIsOpen(false)} padded={padded} /> : null}
    </>
  );
}
