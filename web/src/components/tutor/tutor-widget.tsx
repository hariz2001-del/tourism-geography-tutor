"use client";

import { KeyboardEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import TutorPanel from "./tutor-panel";
import { TUTOR_OPEN_EVENT } from "@/lib/tutor/open-event";

/**
 * The tutor, in one of two places.
 *
 * On a chapter page on a wide screen it is docked down the right-hand side, the way it sat
 * before it became a floating chat — the reading column needs something beside it, and a
 * learner reading a chapter is exactly who is about to have a question. It collapses to a slim
 * tab on the edge and the site remembers that choice. Everywhere else, and on phones, it is the
 * floating chat in the corner.
 *
 * It is always the same element, only restyled, so a conversation survives moving between a
 * chapter and any other page: the panel is never unmounted, just hidden.
 *
 * The page learns how much room the dock takes from `data-tutor-dock` on <html> ("open",
 * "collapsed" or "none"), which globals.css turns into padding on `.tutor-dock-space`. The
 * layout's inline script sets it before first paint, so the reading column does not jump.
 */
type DockState = "open" | "collapsed";

const DOCK_KEY = "tgt-tutor-dock";
const DOCK_CHANGE = "tgt:tutor-dock-change";
const WIDE = "(min-width: 1024px)";

// Where the choice lives when storage is unavailable (private browsing), so collapse still works.
let dockInMemory: DockState | null = null;

function readDock(): DockState {
  if (dockInMemory) return dockInMemory;
  try {
    return localStorage.getItem(DOCK_KEY) === "collapsed" ? "collapsed" : "open";
  } catch {
    return "open";
  }
}

function writeDock(value: DockState) {
  dockInMemory = value;
  try {
    localStorage.setItem(DOCK_KEY, value);
  } catch {
    // storage refused; the in-memory copy keeps the choice for this visit
  }
  window.dispatchEvent(new Event(DOCK_CHANGE));
}

function subscribeDock(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(DOCK_CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DOCK_CHANGE, onChange);
  };
}

function subscribeWide(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function isWideNow(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(WIDE).matches;
}

const DOCKED_PANEL =
  "pointer-events-auto flex h-full w-full flex-col overflow-hidden rounded-card border border-graticule bg-surface shadow-[0_14px_40px_rgb(6_35_43_/_14%)]";
const FLOATING_PANEL =
  "pointer-events-auto flex h-[min(32rem,calc(100dvh-8.5rem))] w-full flex-col overflow-hidden rounded-card border border-graticule bg-surface shadow-[0_18px_48px_rgb(6_35_43_/_22%)] sm:w-[24rem]";

export default function TutorWidget() {
  const pathname = usePathname() ?? "";
  const isWide = useSyncExternalStore(subscribeWide, isWideNow, () => false);
  const dock = useSyncExternalStore(subscribeDock, readDock, () => "open" as DockState);
  const docked = isWide && pathname.startsWith("/chapters/");

  // Only the floating chat has its own open state; the dock's lives in `dock`.
  const [isOpen, setIsOpen] = useState(false);
  const visible = docked ? dock === "open" : isOpen;

  const launcherRef = useRef<HTMLButtonElement>(null);
  const dockTabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visibleRef = useRef(visible);
  // Focus moves only when the learner asked for a change — never on page load, when the dock
  // simply appears open.
  const focusNext = useRef<"input" | "launcher" | "tab" | null>(null);

  useEffect(() => {
    visibleRef.current = visible;
    const target = focusNext.current;
    focusNext.current = null;
    if (target === "input") inputRef.current?.focus();
    else if (target === "launcher") launcherRef.current?.focus();
    else if (target === "tab") dockTabRef.current?.focus();
  }, [visible]);

  // Tell the page how much room to leave on the right.
  useEffect(() => {
    document.documentElement.dataset.tutorDock = docked ? dock : "none";
  }, [docked, dock]);

  // The header scrolls away; the dock sits just below it while it is on screen, and near the
  // top of the window once it has gone.
  useEffect(() => {
    if (!docked) return;
    function place() {
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      document.documentElement.style.setProperty("--tutor-dock-top", `${Math.max(16, headerBottom + 16)}px`);
    }
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [docked]);

  useEffect(() => {
    function open() {
      if (visibleRef.current) {
        inputRef.current?.focus();
        return;
      }
      focusNext.current = "input";
      if (docked) writeDock("open");
      else setIsOpen(true);
    }
    window.addEventListener(TUTOR_OPEN_EVENT, open);
    return () => window.removeEventListener(TUTOR_OPEN_EVENT, open);
  }, [docked]);

  function openFloating() {
    focusNext.current = "input";
    setIsOpen(true);
  }

  function minimizeFloating() {
    focusNext.current = "launcher";
    setIsOpen(false);
  }

  function collapseDock() {
    focusNext.current = "tab";
    writeDock("collapsed");
  }

  function expandDock() {
    focusNext.current = "input";
    writeDock("open");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Escape closes a floating chat; a docked panel is part of the page and stays put.
    if (docked || event.key !== "Escape") return;
    event.stopPropagation();
    minimizeFloating();
  }

  return (
    <>
      <div
        className={
          docked
            ? "pointer-events-none fixed right-4 bottom-4 z-30 flex w-[22rem] flex-col print:hidden"
            : "pointer-events-none fixed inset-x-3 bottom-3 z-40 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:bottom-5 print:hidden"
        }
        style={docked ? { top: "var(--tutor-dock-top, 5.25rem)" } : undefined}
      >
        <div
          id="tutor"
          role={docked ? "complementary" : "dialog"}
          aria-modal={docked ? undefined : false}
          aria-label="Tutor chat"
          hidden={!visible}
          onKeyDown={handleKeyDown}
          className={visible ? (docked ? DOCKED_PANEL : FLOATING_PANEL) : ""}
        >
          <div className="flex items-center justify-between gap-3 border-b border-graticule bg-meridian px-4 py-3">
            <h2 className="font-display text-[1.0625rem] font-semibold text-chart">Tutor</h2>
            {docked ? (
              <button
                type="button"
                onClick={collapseDock}
                aria-label="Collapse tutor"
                aria-expanded
                aria-controls="tutor"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-chart transition-colors hover:bg-ink-strong/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart"
              >
                <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" width="18">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={minimizeFloating}
                aria-label="Minimize tutor"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl leading-none text-chart transition-colors hover:bg-ink-strong/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chart"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
          <TutorPanel inputRef={inputRef} />
        </div>

        {/* The launcher gives way to the panel so the two never stack on a phone. */}
        {docked ? null : (
          <button
            ref={launcherRef}
            type="button"
            onClick={openFloating}
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
        )}
      </div>

      {docked && !visible ? (
        <button
          ref={dockTabRef}
          type="button"
          onClick={expandDock}
          aria-label="Expand tutor"
          aria-expanded={false}
          aria-controls="tutor"
          className="fixed right-0 z-30 flex w-11 flex-col items-center gap-2 rounded-l-card bg-meridian py-4 font-semibold text-chart shadow-[0_10px_26px_rgb(6_35_43_/_22%)] transition-colors hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian print:hidden"
          style={{ top: "var(--tutor-dock-top, 5.25rem)" }}
        >
          <span aria-hidden="true" className="text-lg leading-none">💬</span>
          <span aria-hidden="true" className="text-[0.875rem] tracking-[0.08em]" style={{ writingMode: "vertical-rl" }}>
            Tutor
          </span>
        </button>
      ) : null}
    </>
  );
}
