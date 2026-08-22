export type TopicDiagram = {
  src: string;
  alt: string;
  caption: string;
  sourceFile: string;
  pageOrSlide: number;
};

/**
 * Diagrams from the approved course PDFs, keyed by topic id. Rendered
 * alongside a topic's published content units. Extracted directly from the
 * same source pages already cited by that topic's content.
 */
export const topicDiagrams: Record<string, TopicDiagram> = {
  "c8cb74d2-3ca2-4b46-8a48-5e2e22b58426": {
    src: "/diagrams/ch1-push-pull-model.jpg",
    alt: "Push-Pull Model diagram: push factors (escape, self-discovery, rest and relaxation, prestige, challenge, adventure, excitement, family togetherness, health and fitness) pointing away from the tourist, and pull factors (scenic beauty, historical areas, cultural attractions and events, sporting events, beaches, parks, recreation facilities, shopping) pointing toward the destination.",
    caption: "The Push-Pull Model",
    sourceFile: "chapter-1-candidate-a.pdf",
    pageOrSlide: 20,
  },
  "68393419-9a3c-4502-b0c9-96ca3977b86e": {
    src: "/diagrams/ch2-seven-continents.jpg",
    alt: "World map labelling the seven continents: North America, South America, Europe, Africa, Asia, Australia/Oceania, and Antarctica.",
    caption: "The seven continents",
    sourceFile: "chapter-2.pdf",
    pageOrSlide: 2,
  },
  "f066f2b3-0b04-4b25-b361-a6778088b21b": {
    src: "/diagrams/ch2-major-oceans.jpg",
    alt: "World map labelling the five major oceans: Arctic, Atlantic, Pacific, Indian, and Southern.",
    caption: "The five major oceans",
    sourceFile: "chapter-2.pdf",
    pageOrSlide: 7,
  },
  "dbb97956-1265-459d-9a60-b0b324d28855": {
    src: "/diagrams/ch2-climate-types.jpg",
    alt: "World map with a legend for major climate and vegetation zones: tropical rainforest, grasslands, desert, deciduous, tundra, coniferous forest, chaparral, savanna, and alpine.",
    caption: "World climate and vegetation zones",
    sourceFile: "chapter-2.pdf",
    pageOrSlide: 12,
  },
  "57682698-9d12-499a-a76f-063216c35b7f": {
    src: "/diagrams/ch4-tourist-attraction-wheel.jpg",
    alt: "Diagram grouping physical tourist attractions into natural landscape, hills and mountains, rivers and lakes, seas and oceans, islands and beaches, deserts and valleys, and plateaus.",
    caption: "Physical tourist attractions around the world",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 8,
  },
  "85c5385c-86ff-4ec1-930c-c94910db0ce8": {
    src: "/diagrams/ch4-mountain-ranges.jpg",
    alt: "World map showing major mountain ranges by continent, including the Rocky Mountains, Andes, Alps, Himalayan Mountains, Atlas Mountains, and Great Dividing Range.",
    caption: "Mountain ranges of the world",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 16,
  },
  "c5a8827e-c9e5-4b96-a85c-a9f060638849": {
    src: "/diagrams/ch4-hydrosphere-lithosphere-floor-plan.png",
    alt: "Labelled schematic \"floor plan\" of a coastline showing a continent, island, cays, atoll, peninsula/foreland, coral/reef, gulf, bay, fiord, river, glacier, waterfall, lagoon, and springs all in one landscape.",
    caption: "The forms of hydrosphere and lithosphere: floor plan",
    sourceFile: "chapter-4.pdf",
    pageOrSlide: 23,
  },
  "a457ad66-58e3-41cb-922c-1c9966c9a988": {
    src: "/diagrams/ch3-latitude-longitude-comparison.png",
    alt: "Two globes side by side. The left globe, labelled Latitude, shows parallels at 30, 60 and 90 degrees with the Equator at 0, North marked (+) and South marked (-). The right globe, labelled Longitude, shows meridians converging at the poles at 30, 60, 90, 120, 150 and 180 degrees, with the Prime meridian at 0, East marked (+) and West marked (-).",
    caption: "Latitude and longitude compared",
    sourceFile: "chapter-3.pdf",
    pageOrSlide: 5,
  },
  "343da11d-e89d-485c-9024-c8bba3d5f042": {
    src: "/diagrams/ch2-mid-latitude-climate-table.png",
    alt: "Mid-Latitude Climates comparison table: Humid Continental (30 to 55 N/S, to 60 N in Europe; north central North America, north central Asia/China, Korea, Japan, central and eastern Europe; mixed coniferous and deciduous forest; warm summers, cold winters, moderate rainfall throughout the year) and Marine-West Coast (30 to 60 N/S; west coast of North America, west coast of southern Chile, and northwestern Europe; mixed coniferous and deciduous forests; cool summers, mild winters, high rainfall year round).",
    caption: "Mid-latitude climates compared",
    sourceFile: "chapter-2.pdf",
    pageOrSlide: 18,
  },
};
