"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TutorPanel from "./tutor-panel";

/**
 * The tutor, moved out of the page and into a dock.
 *
 * It used to hold a 21rem column open down the right of every chapter, which cost the reading
 * column a third of its width whether or not anyone was asking anything — photographs were
 * rendering at 180px inside cards because of it. Here it is a button in the corner until it is
 * wanted.
 *
 * The `#tutor` anchor still works: the home page and the mobile link both point at it, so the
 * dock opens itself when the hash arrives rather than leaving those links dead.
 */
export default function TutorDock({ topicTitle }: { topicTitle: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#tutor") setIsOpen(true);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        launcherRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector("textarea")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* The anchor the rest of the app links to, so #tutor lands somewhere real. */}
      <span aria-hidden="true" id="tutor" />

      {isOpen ? (
        <div
          aria-label="Tutor"
          className="fixed inset-x-3 bottom-3 z-50 flex max-h-[min(80vh,42rem)] flex-col overflow-hidden rounded-card border border-graticule bg-surface shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[26rem]"
          ref={panelRef}
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3 border-b border-graticule bg-chart px-4 py-2.5">
            <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Tutor</p>
            <button
              className="rounded-card border border-graticule px-2.5 py-1 text-[0.8125rem] font-semibold text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
              onClick={() => {
                setIsOpen(false);
                launcherRef.current?.focus();
              }}
              type="button"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TutorPanel topicTitle={topicTitle} variant="dock" />
          </div>
        </div>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide the tutor" : "Ask the tutor"}
        className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-meridian px-4 py-3 font-medium text-chart shadow-lg transition-colors hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian ${
          isOpen ? "hidden" : ""
        }`}
        onClick={open}
        ref={launcherRef}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Ask tutor
      </button>
    </>
  );
}
