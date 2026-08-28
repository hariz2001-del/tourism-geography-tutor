"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { previewFor } from "@/lib/course-brain/place-previews";
import { ImageLightbox } from "./image-lightbox";

const CARD_WIDTH = 248;

/**
 * Only one preview card is ever on screen.
 *
 * Hover alone would guarantee that, but focus does not: a reader tabbing through the table
 * while the pointer rests on another name would leave two cards floating at once. Whoever
 * opens a card closes the one before it.
 */
let openCard: { id: string; close: () => void } | null = null;

/**
 * A place named in a table, with its photograph a hover away.
 *
 * The card is positioned `fixed` rather than absolutely: the table scrolls sideways inside its
 * own container, and a box inside that container would be clipped by it. It follows the pointer
 * only as far as the cell it belongs to, flips above the cell when there is no room below, and
 * closes on scroll rather than hanging over the page at a stale position.
 *
 * Hover is not the only way in — the name is a button, so it answers to focus and to touch,
 * where a tap opens the full-screen view directly.
 */
export default function PlacePreview({ value }: { value: string }) {
  const preview = previewFor(value);
  const [anchor, setAnchor] = useState<{ left: number; top: number; flip: boolean } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const cardId = useId();

  const hide = useCallback(() => {
    setAnchor(null);
    if (openCard?.id === cardId) openCard = null;
  }, [cardId]);

  const place = useCallback(() => {
    const element = buttonRef.current;
    if (!element) return;
    if (openCard && openCard.id !== cardId) openCard.close();
    openCard = { id: cardId, close: () => setAnchor(null) };
    const rect = element.getBoundingClientRect();
    const cardHeight = CARD_WIDTH * 0.75 + 86;
    const flip = rect.bottom + cardHeight > window.innerHeight && rect.top > cardHeight;
    setAnchor({
      left: Math.min(Math.max(8, rect.left), window.innerWidth - CARD_WIDTH - 8),
      top: flip ? rect.top - 8 : rect.bottom + 8,
      flip,
    });
  }, [cardId]);

  useEffect(() => {
    if (!anchor) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") hide();
    }
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchor, hide]);

  // A card must not outlive the row it belongs to.
  useEffect(() => () => { if (openCard?.id === cardId) openCard = null; }, [cardId]);

  if (!preview) return <>{value}</>;

  return (
    <>
      <button
        aria-describedby={anchor ? cardId : undefined}
        className="cursor-zoom-in text-left underline decoration-dotted decoration-graticule underline-offset-4 hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        onBlur={hide}
        onClick={() => setIsOpen(true)}
        onFocus={place}
        onMouseEnter={place}
        onMouseLeave={hide}
        ref={buttonRef}
        type="button"
      >
        {value}
      </button>

      {anchor ? (
        <span
          className="pointer-events-none fixed z-40 block overflow-hidden rounded-card border border-graticule bg-surface shadow-lg"
          id={cardId}
          role="tooltip"
          style={{
            left: anchor.left,
            top: anchor.top,
            width: CARD_WIDTH,
            transform: anchor.flip ? "translateY(-100%)" : undefined,
          }}
        >
          <Image
            alt={preview.alt}
            className="h-auto w-full"
            height={preview.height}
            sizes="248px"
            src={preview.src}
            width={preview.width}
          />
          <span className="block space-y-0.5 border-t border-graticule bg-chart px-2.5 py-1.5 font-mono text-[0.6875rem]/[1.4] text-ink-muted">
            <span className="block text-ink">{preview.caption}</span>
            <span className="block">
              Photo: {preview.creator} · {preview.license}
            </span>
            <span className="block">Click to enlarge</span>
          </span>
        </span>
      ) : null}

      {isOpen ? (
        <ImageLightbox
          image={{ src: preview.src, alt: preview.alt, width: preview.width, height: preview.height }}
          label={`${preview.caption} — photo: ${preview.creator}, ${preview.license}`}
          onClose={() => setIsOpen(false)}
          padded={false}
        />
      ) : null}
    </>
  );
}
