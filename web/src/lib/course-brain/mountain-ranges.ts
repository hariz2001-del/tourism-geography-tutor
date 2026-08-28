/**
 * The twenty-four mountain ranges the Chapter 4 map names, prepared for the interactive map.
 *
 * The deck's figure is a raster with a colour-coded legend: six regional groups, each range
 * printed with the countries the slide assigns it. All of that is transcribed here exactly as
 * the slide has it — including "Crystal Mountians", "Columbia" for Colombia, and Tibet listed
 * among countries. Those stay. The unit's own learning note names only six of the twenty-four,
 * which is why the map has to carry the rest.
 *
 * **Where the slide's geography is wrong, the range is still drawn where it actually is, and
 * the error is flagged rather than quietly fixed.** Drawing the Caucasus in Ukraine because the
 * slide says Ukraine would make the map say something untrue about the world; silently
 * relabelling it would hide a mistake the owner has asked to rule on. So: real position, the
 * deck's words, and a visible flag.
 *
 * Each range is a spine — the line the range actually follows — plus a width in degrees. The
 * map paints it by stroking that line, which is why no polygon data is needed and why
 * hit-testing can use `isPointInStroke`. Spines are approximations of published extents, good
 * enough to place a range on a world map and no finer; the footnote under the map says so.
 */
export type RangeRegion = "North America" | "South America" | "Europe" | "Africa" | "Asia" | "Oceania";

export type MountainRange = {
  key: string;
  /** The range's name exactly as the slide's legend prints it. */
  name: string;
  /** The countries exactly as the slide's legend prints them. */
  deckCountries: string;
  /** The slide's own regional heading. */
  region: RangeRegion;
  /** [longitude, latitude] along the range. */
  spine: [number, number][];
  /** Rough breadth of the range, in degrees, used as the stroke width. */
  width: number;
  /** A discrepancy in the slide worth a learner's attention. Never a silent correction. */
  flag?: string;
  /** Where two of the slide's entries are the same range, they share one photograph. */
  photoKey?: string;
};

export const RANGE_REGIONS: RangeRegion[] = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
];

export const mountainRanges: MountainRange[] = [
  {
    key: "alaska-range",
    name: "Alaska Range",
    deckCountries: "United States",
    region: "North America",
    spine: [[-155, 62.3], [-152, 62.8], [-148.5, 63.2], [-144.5, 63.3], [-141.5, 62.8]],
    width: 1.1,
  },
  {
    key: "appalachians",
    name: "Appalachian Mountains",
    deckCountries: "United States",
    region: "North America",
    spine: [[-86.5, 33.6], [-83.5, 35.4], [-80.5, 37.2], [-78, 39], [-75, 41], [-72, 43.5], [-69.5, 45.8]],
    width: 1.9,
  },
  {
    key: "brooks-range",
    name: "Brooks Range",
    deckCountries: "United States",
    region: "North America",
    spine: [[-161, 68.2], [-156, 68.1], [-151, 68.3], [-146, 68.6], [-142, 68.9]],
    width: 1.1,
  },
  {
    key: "coastal-mountains",
    name: "Coastal Mountains",
    deckCountries: "United States, Canada",
    region: "North America",
    spine: [[-137.5, 59.5], [-132, 57], [-127.5, 53.5], [-124, 50], [-122.5, 46], [-123, 41.5], [-121.5, 36.5]],
    width: 1.2,
  },
  {
    key: "rockies",
    name: "Rocky Mountains",
    deckCountries: "United States, Canada",
    region: "North America",
    spine: [[-124.5, 58.5], [-120.5, 54.5], [-116.5, 51], [-113, 47], [-110, 43.5], [-106.5, 39.5], [-105.5, 35.5]],
    width: 2.4,
  },
  {
    key: "sierra-madre",
    name: "Sierra Madre",
    deckCountries: "Mexico",
    region: "North America",
    spine: [[-109, 30.5], [-107, 27], [-104.5, 23.5], [-102.5, 20.5], [-99.5, 18.5]],
    width: 1.5,
  },
  {
    key: "andes",
    name: "Andes",
    deckCountries: "Argentina, Chile, Bolivia, Peru, Ecuador, Columbia",
    region: "South America",
    spine: [
      [-73, 10],
      [-75.5, 5],
      [-78.5, -1],
      [-77.5, -8],
      [-72, -15],
      [-68, -21],
      [-69.5, -27],
      [-70.5, -33],
      [-71.5, -40],
      [-72.5, -46],
      [-73.5, -52],
    ],
    width: 2.1,
    flag: "The slide spells Colombia “Columbia”.",
  },
  {
    key: "alps",
    name: "Alps",
    deckCountries: "Central Europe",
    region: "Europe",
    spine: [[6, 44.2], [7.2, 45.6], [9.5, 46.4], [12, 46.9], [14.5, 47.3]],
    width: 1.1,
  },
  {
    key: "caucasus",
    name: "Caucasus Mountains",
    deckCountries: "Ukraine",
    region: "Europe",
    spine: [[37.5, 44.5], [41, 43.5], [44.5, 42.7], [47.5, 41.5]],
    width: 1,
    flag: "The slide gives Ukraine. The Caucasus run between the Black Sea and the Caspian, through Russia, Georgia, Azerbaijan and Armenia — none of them Ukraine.",
  },
  {
    key: "kjolen",
    name: "Kjolen Mountains",
    deckCountries: "Norway",
    region: "Europe",
    spine: [[6.5, 58.8], [8, 61], [12, 64], [15.5, 66.5], [19, 68.5], [22, 69.8]],
    width: 1.4,
  },
  {
    key: "pyrenees",
    name: "Pyrenees",
    deckCountries: "France, Spain",
    region: "Europe",
    spine: [[-1.7, 43.3], [0.5, 42.8], [2.6, 42.4]],
    width: 0.6,
  },
  {
    key: "taurus",
    name: "Taurus Mountains",
    deckCountries: "Turkey",
    region: "Europe",
    spine: [[29, 37], [32.5, 37], [35.5, 37.4], [38.5, 38.2]],
    width: 0.8,
    flag: "The slide files the Taurus under Europe. They are in southern Turkey, which is in Asia.",
  },
  {
    key: "thian",
    photoKey: "tian-shan",
    name: "Thian Mountains",
    deckCountries: "Eastern Europe",
    region: "Europe",
    spine: [[70, 42.4], [74.5, 42.5], [79, 42.6], [83.5, 42.9], [88, 43.2]],
    width: 1.2,
    flag: "The slide lists this range twice: here under Europe as the “Thian Mountains” in Eastern Europe, and again under Asia as the Tian Shan. They are the same range, and it is in Central Asia. Both entries are kept, and both point at the real range.",
  },
  {
    key: "urals",
    name: "Ural Mountains",
    deckCountries: "Russia",
    region: "Europe",
    spine: [[59.5, 68], [60.5, 64], [59.5, 60], [58.5, 56], [58.5, 52]],
    width: 1.1,
  },
  {
    key: "atlas",
    name: "Atlas Mountains",
    deckCountries: "Morocco, Algeria",
    region: "Africa",
    spine: [[-9, 30.8], [-6, 31.8], [-2, 33.4], [3, 35], [8, 36.3], [10, 36.5]],
    width: 1.2,
  },
  {
    key: "crystal-mountains",
    name: "Crystal Mountians",
    deckCountries: "Gabon, Congo, Zambia, Angola",
    region: "Africa",
    spine: [[10.4, 0.8], [11.6, -0.6], [13, -2.6], [14.2, -4.6]],
    width: 1,
    flag: "Spelled “Crystal Mountians” on the slide. The range runs through Gabon and the Republic of the Congo towards Angola; Zambia is some 1,500 km further east.",
  },
  {
    key: "drakensberg",
    name: "Drakensberg Mountains",
    deckCountries: "South Africa",
    region: "Africa",
    spine: [[27.6, -31.4], [29, -29.7], [30, -27.9], [30.8, -26], [30.5, -24.3]],
    width: 0.8,
  },
  {
    key: "mitumba",
    name: "Mitumba Mountains",
    deckCountries: "Zambia",
    region: "Africa",
    spine: [[29.2, -2.5], [28.9, -5.5], [28.6, -8.5], [28.4, -11]],
    width: 0.8,
    flag: "The slide gives Zambia. The Mitumba run down the western side of Lake Tanganyika, in the Democratic Republic of the Congo.",
  },
  {
    key: "altay",
    name: "Altay Mountains",
    deckCountries: "Mongolia",
    region: "Asia",
    spine: [[85, 49.8], [88.5, 48.6], [92, 47], [95.5, 45.6], [98, 44.5]],
    width: 1.2,
  },
  {
    key: "himalaya",
    name: "Himalayan Mountains",
    deckCountries: "Afghanistan, Pakistan, India, Tibet, Nepal, Kashmir, China",
    region: "Asia",
    spine: [[74, 35.4], [78, 32.8], [82, 30.3], [86, 28.3], [90, 28], [94, 29.2], [96, 29.5]],
    width: 1.5,
    flag: "The slide lists Tibet and Kashmir among countries. Tibet is an autonomous region of China; Kashmir is a disputed territory.",
  },
  {
    key: "tian-shan",
    name: "Tian Shan",
    deckCountries: "Tajikistan, Kyrgyzstan",
    region: "Asia",
    spine: [[70, 42.4], [74.5, 42.5], [79, 42.6], [83.5, 42.9], [88, 43.2]],
    width: 1.2,
    flag: "The same range as the “Thian Mountains” the slide also lists under Europe. It runs mainly through Kyrgyzstan, Kazakhstan and China; the slide names Tajikistan and Kyrgyzstan.",
  },
  {
    key: "zagros",
    name: "Zagros Mountains",
    deckCountries: "Iran",
    region: "Asia",
    spine: [[45.5, 37], [47.5, 34], [50, 31.5], [53, 29.5], [56, 27.5], [58, 26.5]],
    width: 1.5,
  },
  {
    key: "great-dividing",
    name: "Great Dividing Range",
    deckCountries: "Australia",
    region: "Oceania",
    spine: [[145, -16], [146.8, -20], [148.5, -24], [151.5, -28], [151.5, -32], [149, -36], [146.5, -37.6]],
    width: 1.4,
  },
  {
    key: "southern-alps",
    name: "Southern Alps",
    deckCountries: "New Zealand",
    region: "Oceania",
    spine: [[167.4, -45.4], [169, -44.2], [170.8, -43.3], [172.6, -42.3]],
    width: 0.7,
  },
];

export const rangesByRegion: { region: RangeRegion; ranges: MountainRange[] }[] = RANGE_REGIONS.map(
  (region) => ({ region, ranges: mountainRanges.filter((range) => range.region === region) }),
);

/** Equirectangular, matching every other map in the app: -180..180 by -90..90. */
export function projectRange(lon: number, lat: number, width: number, height: number): [number, number] {
  return [((lon + 180) / 360) * width, ((90 - lat) / 180) * height];
}
