"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import TutorPanel from "./tutor-panel";
import { TUTOR_OPEN_EVENT } from "@/lib/tutor/open-event";

export default function TutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    function open() { setIsOpen(true); }
    window.addEventListener(TUTOR_OPEN_EVENT, open);
    return () => window.removeEventListener(TUTOR_OPEN_EVENT, open);
  }, []);

  // The panel stays mounted while minimized so the conversation survives, which
  // means focus has to be moved by hand on each transition.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      setIsOpen(false);
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-40 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:bottom-5 print:hidden">
      <div
        id="tutor"
        role="dialog"
        aria-modal="false"
        aria-label="Tutor chat"
        hidden={!isOpen}
        onKeyDown={handleKeyDown}
        className={
          isOpen
            ? "pointer-events-auto flex h-[min(32rem,calc(100dvh-8.5rem))] w-full flex-col overflow-hidden rounded-card border border-graticule bg-surface shadow-[0_18px_48px_rgb(6_35_43_/_22%)] sm:w-[24rem]"
            : ""
        }
      >
        <div className="flex items-center justify-between gap-3 border-b border-graticule bg-meridian px-4 py-3">
          <h2 className="font-display text-[1.0625rem] font-semibold text-chart">Tutor</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize tutor"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl leading-none text-chart transition-colors hover:bg-ink-strong/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <TutorPanel inputRef={inputRef} />
      </div>

      {/* The launcher gives way to the panel so the two never stack on a phone. */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="tutor"
        hidden={isOpen}
        className={
          isOpen
            ? ""
            : "pointer-events-auto inline-flex min-h-14 items-center gap-2 rounded-full bg-meridian px-5 font-semibold text-chart shadow-[0_10px_26px_rgb(6_35_43_/_26%)] transition-transform duration-150 hover:-translate-y-0.5 hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        }
      >
        <span aria-hidden="true" className="text-lg leading-none">💬</span>
        Ask the tutor
      </button>
    </div>
  );
}
