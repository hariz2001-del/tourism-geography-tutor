/**
 * Assets that belong to an interactive component rather than to a content unit or a topic.
 *
 * `contentImages` and `topicDiagrams` are keyed on database UUIDs because they are bound to
 * rows. These are not: they are part of a component's construction. They still carry full
 * attribution — the obligation follows the file, not the mechanism — and
 * `scripts/build_image_attribution.py` reads this file so they appear in ATTRIBUTION.md
 * alongside the rest.
 */
export type ComponentAsset = {
  src: string;
  width: number;
  height: number;
  creator: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
};

/**
 * Equirectangular (plate carrée) blank world map spanning exactly -180° to 180° and
 * -90° to 90°. That extent is load-bearing: the time-zone bands are positioned by
 * `(longitude + 180) / 360`, which is only correct on a full-width cylindrical projection.
 * Verified before use — the 0° line falls through the United Kingdom and Ghana, and the
 * equator through the mouth of the Amazon and Sumatra. Do not swap this file for a map
 * with a different extent without re-checking that.
 */
export const worldBaseMap: ComponentAsset = {
  src: "/diagrams/ch3-world-basemap.webp",
  width: 1920,
  height: 960,
  creator: "פרוגנתודון",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Blankmap.svg",
  license: "CC0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};

export const componentAssets: ComponentAsset[] = [worldBaseMap];
