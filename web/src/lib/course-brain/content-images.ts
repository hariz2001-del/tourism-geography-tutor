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
  "ab312ce7-5f79-4740-a227-ac4c0e3bc6ef": {
    src: "/content-images/ch3-p3-latitude-globe.jpg",
    alt: "Labelled globe diagram showing the North Pole, Arctic Circle, Tropic of Cancer, Equator, Tropic of Capricorn, Antarctic Circle, and South Pole",
    width: 550,
    height: 384,
    caption: "Latitude — chapter-3.pdf, p3",
    sourceFile: "chapter-3.pdf",
    pageOrSlide: 3,
  },
  "04c61a82-dd00-40f8-a954-3bce4182d47c": {
    src: "/content-images/ch3-p4-longitude-globe.jpg",
    alt: "Globe diagram showing longitude meridian lines converging at the poles, labelled with degrees east and west and the Prime Meridian",
    width: 320,
    height: 312,
    caption: "Longitude — chapter-3.pdf, p4",
    sourceFile: "chapter-3.pdf",
    pageOrSlide: 4,
  },
  "2aa381ff-f92f-4fcd-8dec-43674a4f0903": {
    src: "/content-images/ch3-p6-gmt-clock.jpg",
    alt: "Photo of the Royal Observatory Greenwich clock and plaque mounted on a brick wall",
    width: 220,
    height: 262,
    caption: "Royal Observatory Greenwich — chapter-3.pdf, p6",
    sourceFile: "chapter-3.pdf",
    pageOrSlide: 6,
  },
  "6fd79ae0-63ed-4a1c-972d-091ac7e688cb": {
    src: "/content-images/ch3-p7-prime-meridian.jpg",
    alt: "First-person photo of two feet straddling the Prime Meridian line embedded in the pavement at the Royal Observatory, Greenwich, with brass plaques giving real longitudes for cities on each side",
    width: 500,
    height: 375,
    caption: "Standing on the Prime Meridian — chapter-3.pdf, p7",
    sourceFile: "chapter-3.pdf",
    pageOrSlide: 7,
  },
  "a6943945-1c7c-4ea8-a5b2-2552428119bc": {
    src: "/content-images/ch3-p10-time-zone-map.jpg",
    alt: "World time zone map with a row of clock faces from noon to midnight, colour-banded time zones, the Greenwich Meridian, and the International Date Line marked between Sunday and Monday",
    width: 839,
    height: 495,
    caption: "World time zones and the International Date Line — chapter-3.pdf, p10",
    sourceFile: "chapter-3.pdf",
    pageOrSlide: 10,
  },
  "3868dc9c-a755-441c-9920-c385a6b86634": {
    src: "/content-images/ch1-p13-plaza-de-espana.jpg",
    alt: "Plaza de España, Seville — a semicircular brick-and-ceramic palace with towers, a canal, and an ornate tiled bridge",
    width: 900,
    height: 600,
    caption: "Plaza de España, Seville — chapter-1.pdf, p13",
    sourceFile: "chapter-1-candidate-a.pdf",
    pageOrSlide: 13,
  },
  "25f51ac3-0193-4428-a2a7-a1031cfdef6e": {
    src: "/content-images/ch1-p14-kl-skyline.jpg",
    alt: "Kuala Lumpur skyline at night, with the illuminated Petronas Twin Towers at centre",
    width: 900,
    height: 521,
    caption: "Kuala Lumpur skyline — chapter-1.pdf, p14",
    sourceFile: "chapter-1-candidate-a.pdf",
    pageOrSlide: 14,
  },
  "a92b84df-02e5-4635-872c-507863427545": {
    src: "/content-images/ch1-p15-travel-route.jpg",
    alt: "An empty straight two-lane road running to a vanishing point between golden crop fields",
    width: 960,
    height: 659,
    caption: "Travel routes — chapter-1.pdf, p15",
    sourceFile: "chapter-1-candidate-a.pdf",
    pageOrSlide: 15,
  },
  "571f3d66-5474-4ad0-8479-56c06e609134": {
    src: "/content-images/ch1-p30-hagia-sophia.jpg",
    alt: "Hagia Sophia and the Sultanahmet district, Istanbul, at dusk, with a tree-lined promenade in the foreground",
    width: 795,
    height: 445,
    caption: "Hagia Sophia, Istanbul — chapter-1.pdf, p30 (photo credit: CrescentRating)",
    sourceFile: "chapter-1-candidate-a.pdf",
    pageOrSlide: 30,
  },
};
