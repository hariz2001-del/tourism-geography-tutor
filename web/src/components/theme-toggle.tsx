"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// The applied theme lives outside React: an inline script in the layout sets it
// on <html> before paint so there is no flash. Subscribing to it keeps the
// button label truthful without a setState-in-effect cascade.
const THEME_CHANGE_EVENT = "tgt:theme-change";

function appliedTheme(): Theme {
  const theme = document.documentElement.dataset.theme;
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  media?.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    media?.removeEventListener("change", onStoreChange);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, appliedTheme, () => "light");

  function toggleTheme() {
    const nextTheme: Theme = appliedTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("tgt-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-switch inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-graticule bg-surface text-ink transition-colors hover:border-meridian hover:bg-meridian/8 hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="theme-to-dark text-xl leading-none" aria-hidden="true">☾</span>
      <span className="theme-to-light text-lg leading-none" aria-hidden="true">☀</span>
    </button>
  );
}
