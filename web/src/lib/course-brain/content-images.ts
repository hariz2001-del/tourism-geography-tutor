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
export const contentImages: Record<string, ContentImage> = {};
