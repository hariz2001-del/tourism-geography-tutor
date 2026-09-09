// The floating tutor lives in the root layout, so any page can ask it to open
// without prop-drilling or a context provider. Kept as a DOM event so server
// components can render a small client button next to their own content.
export const TUTOR_OPEN_EVENT = "tgt:open-tutor";

export function requestTutor() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TUTOR_OPEN_EVENT));
}
