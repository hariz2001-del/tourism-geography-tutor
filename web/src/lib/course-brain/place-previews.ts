/**
 * The photograph behind a place named in one of the Chapter 4 tables.
 *
 * Hovering a mountain or a desert in those tables shows the place itself. Every file is openly
 * licensed and carries the creator, source and licence its Commons page declares — the same
 * obligation as any other borrowed image, recorded in ATTRIBUTION.md by the same script.
 *
 * Keyed by the exact text the table prints. Where the deck gives a mountain more than one name
 * ("Mount Everest / Sagarmatha / Chomolungma") the lookup takes the part before the first
 * slash, which is the name the rest of the table and the learning note use.
 *
 * The bodies-of-water table has no previews on purpose: a photograph of open water does not
 * tell a reader which sea it is.
 */
export type PlacePhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  creator: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
};

const PLACE_PHOTOS: Record<string, PlacePhoto> = {
  "Mount Everest": {
    src: "/place-previews/mount-everest.webp",
    alt: "Mount Everest and Nuptse standing in snow and rock above the grey Khumbu Glacier",
    width: 1200,
    height: 848,
    caption: "Everest and Nuptse above the Khumbu Glacier, Nepal",
    creator: "Vyacheslav Argenberg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Everest,_Nuptse,_Khumbu_Glacier,_Nepal,_Himalayas.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  "K2": {
    src: "/place-previews/k2.webp",
    alt: "The snow-covered pyramid of K2 rising above a glacier, with base-camp tents on the moraine below",
    width: 1200,
    height: 900,
    caption: "K2 from Broad Peak base camp, Pakistan",
    creator: "Zacharie Grossen",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Chogori.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Kangchenjunga": {
    src: "/place-previews/kangchenjunga.webp",
    alt: "The snow slopes of Kangchenjunga lit orange by sunrise above dark ridges",
    width: 1200,
    height: 900,
    caption: "Kangchenjunga at sunrise, from Gangtok",
    creator: "Johannes Bahrdt",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kangchenjunga-from-Gangtok.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Lhotse": {
    src: "/place-previews/lhotse.webp",
    alt: "The steep rock and ice of Lhotse's south face above brown foreground slopes",
    width: 1200,
    height: 781,
    caption: "The south face of Lhotse, from Chukhung Ri",
    creator: "Uwe Gille",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lhotse-fromChukhungRi.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Makalu": {
    src: "/place-previews/makalu.webp",
    alt: "The snow pyramid of Makalu above a broad fluted snowfield under a dark sky",
    width: 1200,
    height: 797,
    caption: "Makalu from the south-west",
    creator: "Ben Tubby",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Makalu.jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  "Cho Oyu": {
    src: "/place-previews/cho-oyu.webp",
    alt: "The long snow wall of Cho Oyu standing above a dry brown Tibetan plain",
    width: 1200,
    height: 900,
    caption: "Cho Oyu's north face, from Old Tingri, Tibet",
    creator: "Steve Hicks",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cho_Oyu_-_North_face.jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  "Puncak Jaya": {
    src: "/place-previews/puncak-jaya.webp",
    alt: "The glaciated ridge of Puncak Jaya seen from orbit, with the pit of the Grasberg mine beside it",
    width: 1200,
    height: 716,
    caption: "Puncak Jaya from the International Space Station, West Papua",
    creator: "Original uploader was Gergyl at en.wikipedia",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Puncak_Jaya_(NASA_astronaut_photograph).jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Mauna Kea": {
    src: "/place-previews/mauna-kea.webp",
    alt: "The bare brown cinder slopes of Mauna Kea's summit under a deep blue sky",
    width: 1200,
    height: 675,
    caption: "The summit of Mauna Kea, Hawaii",
    creator: "Robert Linsdell from St. Andrews, Canada",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mauna_Kea_Summit_(503891)_(21557943710).jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  "Mount Kinabalu": {
    src: "/place-previews/mount-kinabalu.webp",
    alt: "The granite ridge of Mount Kinabalu rising above forested green hills",
    width: 1200,
    height: 795,
    caption: "Mount Kinabalu from Kundasang, Sabah",
    creator: "Angah hfz",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gunung_Kinabalu_Sabah.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Jade Mountain (Yu Shan)": {
    src: "/place-previews/yu-shan.webp",
    alt: "The snow-streaked main peak of Jade Mountain standing above forested ridges",
    width: 1200,
    height: 800,
    caption: "The main peak of Yu Shan under snow, Taiwan",
    creator: "邱文強",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:DSC04198雄偉的玉山主峰.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Mount Kerinci": {
    src: "/place-previews/mount-kerinci.webp",
    alt: "The volcanic cone of Mount Kerinci behind rows of tea bushes",
    width: 1200,
    height: 800,
    caption: "Mount Kerinci above the tea gardens, Sumatra",
    creator: "Muhamad Izzul Fiqih",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gunung_Kerinci_dari_kebun_teh.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Aconcagua": {
    src: "/place-previews/aconcagua.webp",
    alt: "Aconcagua's snow-covered summit seen between dry brown ridges",
    width: 1200,
    height: 801,
    caption: "Aconcagua from Route 7, Mendoza",
    creator: "Mauricio V. Genta",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aconcagua_(Mendoza)_2022-11_(1).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Vinson Massif": {
    src: "/place-previews/vinson-massif.webp",
    alt: "The snow dome of Mount Vinson rising above a white ice plateau",
    width: 1200,
    height: 849,
    caption: "Mount Vinson from the north-west, Antarctica",
    creator: "Christian Stangl",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mount_Vinson_from_NW_at_Vinson_Plateau_by_Christian_Stangl_(flickr).jpg",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  "Mount Kosciuszko": {
    src: "/place-previews/mount-kosciuszko.webp",
    alt: "The rounded, boulder-strewn summit of Mount Kosciuszko above alpine grass, a walkway crossing the slope",
    width: 1200,
    height: 800,
    caption: "Mount Kosciuszko from the summit walk, New South Wales",
    creator: "Ymblanter",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kosciuszko_NP_Mount_Kosciuszko_seen_from_Kosciuszko_Walk_1.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "Antarctic": {
    src: "/place-previews/antarctic-desert.webp",
    alt: "Low ridges of wind-carved snow running across the Antarctic Plateau, a tracked vehicle small on the horizon",
    width: 1200,
    height: 800,
    caption: "The surface of the Antarctic Plateau, the interior of the largest desert on Earth",
    creator: "Stephen Bannister",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Plateau-surface.jpg",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
  },
  "Sahara": {
    src: "/place-previews/sahara.webp",
    alt: "A smooth slope of wind-rippled sand running to a pale horizon",
    width: 1200,
    height: 800,
    caption: "Sand in the Sahara at Dakhla Oasis, Egypt",
    creator: "Vyacheslav Argenberg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sand_dune_in_the_desert,_Sahara_Desert,_Egypt.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  "Arabian": {
    src: "/place-previews/arabian-desert.webp",
    alt: "Rows of high red sand dunes running to the horizon",
    width: 1200,
    height: 671,
    caption: "The Rub' al Khali, the Empty Quarter",
    creator: "Nepenthes",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rub_al_Khali_002.JPG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Gobi": {
    src: "/place-previews/gobi.webp",
    alt: "A pale sand dune ridge rising above a gravel plain with scattered scrub",
    width: 1200,
    height: 733,
    caption: "The dunes of Khongoryn Els, Gobi Desert, Mongolia",
    creator: "Bernard Gagnon",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Khongoryn_Els_07.jpg",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en/",
  },
  "Kalahari": {
    src: "/place-previews/kalahari.webp",
    alt: "Red rippled sand with dry scrub and grass under a blue sky",
    width: 1200,
    height: 900,
    caption: "The Kalahari in Botswana",
    creator: "Winfried Bruenken (Amrum)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kalahari_PICT0036.JPG",
    license: "CC BY-SA 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5/",
  },
  "Patagonian": {
    src: "/place-previews/patagonian-desert.webp",
    alt: "A wide gravel plain of tufted grass running to a low escarpment",
    width: 1200,
    height: 675,
    caption: "The Patagonian steppe at first light",
    creator: "Remarksman",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Morning_on_the_Patagonian_Steppe.jpg",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  "Great Victoria": {
    src: "/place-previews/great-victoria-desert.webp",
    alt: "Red desert country seen from orbit, pale salt lakes scattered across it",
    width: 1200,
    height: 674,
    caption: "The Great Victoria Desert from the International Space Station",
    creator: "NASA",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:A_portion_of_the_Great_Victoria_Desert_in_Western_Australia.jpg",
    license: "Public domain",
  },
  "Syrian": {
    src: "/place-previews/syrian-desert.webp",
    alt: "A stony desert plain running to a flat-topped escarpment in the haze",
    width: 1200,
    height: 900,
    caption: "The Syrian desert near Palmyra",
    creator: "Vyacheslav Argenberg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Syrian_desert_near_Palmyra,_Hills,_Syria.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  "Great Basin": {
    src: "/place-previews/great-basin.webp",
    alt: "Dry sagebrush country rising to the wooded slopes of Wheeler Peak",
    width: 1200,
    height: 970,
    caption: "Wheeler Peak from the scenic drive, Great Basin National Park, Nevada",
    creator: "Famartin",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2013-07-14_09_37_43_Wheeler_Peak_viewed_from_Wheeler_Peak_Scenic_Drive_in_Great_Basin_National_Park.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
};

export const placePhotos: PlacePhoto[] = Object.values(PLACE_PHOTOS);

export function previewFor(cellText: string): PlacePhoto | null {
  const name = cellText.split(" / ")[0].trim();
  return PLACE_PHOTOS[name] ?? null;
}
