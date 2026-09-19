/**
 * A colour per chapter.
 *
 * The lecturer's note was that the site is "too plain" — but colour that means
 * nothing is just noise, so each chapter takes one of the four accents already in
 * the palette and keeps it everywhere it appears: the chapter tabs, its card on
 * the home page, its heading, and the topic you are reading. After a week a
 * student should know they are in Chapter 3 before reading a word.
 *
 * Classes are written out in full rather than built by interpolation, because
 * Tailwind only ships the class names it can see in the source.
 */
export type ChapterAccent = {
  /** The bar across the top of a card. */
  bar: string;
  /** A filled pill: the active chapter tab. */
  solid: string;
  /** The chapter's colour as text, for eyebrows and small labels. */
  text: string;
  /** A wash behind a selected row, with the colour carried in the border. */
  tint: string;
  /** Hover and focus treatment for something not currently selected. */
  hover: string;
  /** A left-hand rule down the opening unit of a chapter. */
  rule: string;
};

const ACCENTS: Record<string, ChapterAccent> = {
  CH1: {
    bar: "bg-meridian",
    solid: "bg-meridian text-chart",
    text: "text-meridian",
    tint: "border-meridian bg-meridian/10",
    hover: "hover:border-meridian hover:text-meridian focus-visible:outline-meridian",
    rule: "border-l-meridian",
  },
  CH2: {
    bar: "bg-deep",
    solid: "bg-deep text-chart",
    text: "text-deep",
    tint: "border-deep bg-deep/10",
    hover: "hover:border-deep hover:text-deep focus-visible:outline-deep",
    rule: "border-l-deep",
  },
  CH3: {
    bar: "bg-lowland",
    solid: "bg-lowland text-chart",
    text: "text-lowland",
    tint: "border-lowland bg-lowland/10",
    hover: "hover:border-lowland hover:text-lowland focus-visible:outline-lowland",
    rule: "border-l-lowland",
  },
  CH4: {
    bar: "bg-relief",
    solid: "bg-relief text-chart",
    text: "text-relief",
    tint: "border-relief bg-relief/10",
    hover: "hover:border-relief hover:text-relief focus-visible:outline-relief",
    rule: "border-l-relief",
  },
};

const FALLBACK: ChapterAccent = ACCENTS.CH1;

/** A chapter we have no colour for reads in the house navy rather than losing its styling. */
export function chapterAccent(chapterCode: string | undefined | null): ChapterAccent {
  return (chapterCode && ACCENTS[chapterCode]) || FALLBACK;
}
