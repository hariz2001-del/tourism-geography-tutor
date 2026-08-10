export type ContentImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  sourceFile: string;
  pageOrSlide: number;
};

/**
 * Real photos/figures extracted directly from the approved course PDFs,
 * keyed by content_unit id. Rendered inside that specific ContentUnit card
 * (unlike topicDiagrams in diagrams.ts, which is one figure per topic).
 * Populate only with images actually pulled from a source page — see
 * .claude/skills/course-content/SKILL.md's image-extraction section.
 */
export const contentImages: Record<string, ContentImage> = {
  "53ea1015-3e72-4d7f-867e-77f2ca172e82": {
    src: "/content-images/ch4-p24-atoll.png",
    alt: "Aerial photo of an atoll — a ring-shaped coral reef enclosing a pale turquoise lagoon",
    width: 300,
    height: 185,
    caption: "Atoll — chapter-4.pdf, p24",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 24,
  },
  "971fd72e-38c8-473b-96ef-b1c7c8204d53": {
    src: "/content-images/ch4-p24-island-cays.png",
    alt: "Aerial photo of a small green vegetated island fringed by white sand in turquoise shallows",
    width: 295,
    height: 180,
    caption: "Island & Cays — chapter-4.pdf, p24",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 24,
  },
  "ae492e89-3265-45c4-8d4d-838761569a4d": {
    src: "/content-images/ch4-p24-island-cays.png",
    alt: "Aerial photo of a small vegetated island fringed by sandy cays and coral reef in turquoise shallows",
    width: 295,
    height: 180,
    caption: "Island & Cays — chapter-4.pdf, p24",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 24,
  },
  "8bb2eaca-0afd-45c8-8ecb-d9a3d0209a99": {
    src: "/content-images/ch4-p24-peninsula.png",
    alt: "Aerial photo of a green peninsula jutting into dark blue sea, with a snow-capped mountain range behind it",
    width: 300,
    height: 180,
    caption: "Peninsula / Foreland — chapter-4.pdf, p24",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 24,
  },
};
