import type { ComponentAsset } from "./component-assets";

/**
 * The national flags the Chapter 4 tables print beside a country, the way Wikipedia does.
 *
 * Only the countries those tables actually name are here; this is not a flag library, and a
 * country with no flag simply renders as its name. Antarctica's highest point is listed by the
 * slide as belonging to "no country", which is the honest answer and gets no flag.
 *
 * Every file is public domain and carries the creator the Commons file page declares, because
 * the credit obligation follows the file even when the licence does not demand it.
 */
export type CountryFlag = ComponentAsset & { country: string };

const FLAGS: Record<string, Omit<CountryFlag, "country">> = {
  "Indonesia": {
    src: "/flags/indonesia.svg",
    width: 900,
    height: 600,
    creator: "Jayakatwang",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Indonesia.svg",
    license: "Public domain",
  },
  "Papua New Guinea": {
    src: "/flags/papua-new-guinea.svg",
    width: 800,
    height: 600,
    creator: "User:Nightstallion",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Papua_New_Guinea.svg",
    license: "Public domain",
  },
  "United States": {
    src: "/flags/united-states.svg",
    width: 1235,
    height: 650,
    creator: "Uploaded by Dbenbenn; edited by users such as Zscout370, Jacobolus, Indolences, and Technion.",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_the_United_States.svg",
    license: "Public domain",
  },
  "Malaysia": {
    src: "/flags/malaysia.svg",
    width: 1200,
    height: 600,
    creator: "MapGrid (old version SKopp, Zscout370 and Ranking Update)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Malaysia.svg",
    license: "Public domain",
  },
  "Brunei": {
    src: "/flags/brunei.svg",
    width: 1440,
    height: 720,
    creator: "Nightstallion",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Brunei.svg",
    license: "Public domain",
  },
  "Republic of China": {
    src: "/flags/taiwan.svg",
    width: 900,
    height: 600,
    creator: "Sun Yat-sen",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_the_Republic_of_China.svg",
    license: "Public domain",
  },
  "Nepal": {
    src: "/flags/nepal.svg",
    width: 726,
    height: 885,
    creator: "Drawn by Pumbaa80, Achim1999",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Nepal.svg",
    license: "Public domain",
  },
  "China": {
    src: "/flags/china.svg",
    width: 900,
    height: 600,
    creator: "Zeng Liansong",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_the_People%27s_Republic_of_China.svg",
    license: "Public domain",
  },
  "Argentina": {
    src: "/flags/argentina.svg",
    width: 800,
    height: 500,
    creator: "Manuel Belgrano",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Argentina.svg",
    license: "Public domain",
  },
  "Australia": {
    src: "/flags/australia.svg",
    width: 1280,
    height: 640,
    creator: "Original: Ivor Evans, Leslie John Hawkins, Egbert John Nuttall, Annie Dorrington and William Stevens Vector: Ian Fieggen",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Flag_of_Australia.svg",
    license: "Public domain",
  },
};

export const countryFlags: CountryFlag[] = Object.entries(FLAGS).map(([country, flag]) => ({ ...flag, country }));

/**
 * A country cell may name more than one country — "Nepal/China" for Everest, or the slide's
 * "Brunei/Indonesia" for the rest of Borneo — so it is split before each part is looked up.
 */
export function splitCountries(cell: string): string[] {
  return cell
    .split(/\s*[\/,]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function flagFor(country: string): CountryFlag | null {
  const flag = FLAGS[country];
  return flag ? { ...flag, country } : null;
}
