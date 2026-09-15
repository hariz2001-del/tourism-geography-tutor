import Image from "next/image";
import ExpandableImage from "./image-lightbox";
import MountainRangeExplorer from "./mountain-range-explorer";
import AttractionWheel from "./attraction-wheel";
import { attractionCategories, type AttractionCategory } from "@/lib/course-brain/attraction-categories";
import BookmarkToggle from "./bookmark-toggle";
import TimeZoneExplorer from "./time-zone-explorer";
import ContinentExplorer from "./continent-explorer";
import OceanExplorer from "./ocean-explorer";
import ClimateMapTabs from "./climate-map-tabs";
import GlobeExplorer from "./globe-explorer";
import { principalNamesFrom } from "@/lib/course-brain/graticule";
import { toContinents } from "@/lib/course-brain/continents";
import { toOceans } from "@/lib/course-brain/oceans";
import { topicDiagrams } from "@/lib/course-brain/diagrams";
import { contentImages } from "@/lib/course-brain/content-images";
import type { PublishedContentUnit } from "@/lib/course-brain/types";
import type { Continent } from "@/lib/course-brain/continents";
import type { Ocean } from "@/lib/course-brain/oceans";

const PUSH_PULL_TOPIC_ID = "c8cb74d2-3ca2-4b46-8a48-5e2e22b58426";
const FORMS_OF_TOURISM_TOPIC_ID = "254db3b5-6355-49b0-8435-fc4ab3dcd4ba";

const PUSH_PULL_UNIT_IDS = {
  relationship: "68fb52c1-6420-4e3b-917f-dedc31108e5a",
  generatingArea: "b64ba9e3-b0a5-40b5-9b59-2cb8ebccfd6f",
  destinationArea: "132c9f68-2e16-430e-b7eb-4ab458b6408b",
  model: "c403af77-976f-4270-b218-ee724aec10ff",
} as const;

const FORMS_OF_TOURISM_UNIT_IDS = {
  domestic: "ec537a47-6ab6-43b2-8858-f4ba52f37108",
  international: "05319d3a-482d-4e50-a956-d3ac86458d25",
  inbound: "c020c1b6-9695-4ca0-92a6-09f62bdb228f",
  outbound: "641ede37-cc81-4a9b-9d8e-6579d33135db",
} as const;

const MIDDLE_LATITUDE_TOPIC_ID = "343da11d-e89d-485c-9024-c8bba3d5f042";
const LATITUDE_LONGITUDE_TOPIC_ID = "a457ad66-58e3-41cb-922c-1c9966c9a988";
const SEVEN_CONTINENTS_TOPIC_ID = "68393419-9a3c-4502-b0c9-96ca3977b86e";
const MAJOR_OCEANS_TOPIC_ID = "f066f2b3-0b04-4b25-b361-a6778088b21b";
const CLIMATE_CLASSIFICATION_TOPIC_ID = "dbb97956-1265-459d-9a60-b0b324d28855";
const CLIMATE_TYPES_UNIT_ID = "b7d73dcb-1993-41bc-830e-47714203f344"; // p12, with the deck's map
const CLIMATE_BANDS_UNIT_ID = "0e07433e-b0f7-442f-a49a-0e2515a3f401"; // p13, the latitude bands
const MAJOR_OCEAN_UNIT_IDS = [
  "c36b6047-aee5-495b-8680-36b0cac6440f", // Pacific
  "101d077c-9874-4b17-ac49-4cd36d5a200d", // Atlantic
  "1bba0e1f-4cdb-4632-b456-43baeea40fe8", // Indian
  "bdd6f07c-7806-47b0-beb1-87b4e9802c49", // Southern
  "86f2cfbc-bed9-436f-bdb3-8bb384f1cf82", // Arctic
] as const;
const SEVEN_CONTINENT_UNIT_IDS = [
  "0ddca5b3-8e97-4559-9975-17cdffd9cc5f", // Asia
  "b5c0b7d5-c392-4809-9937-552328ebe7a8", // Africa
  "023fe353-c974-4892-831f-284e589f0abc", // North America
  "8327f8a6-26ff-4000-9092-087e912e610a", // South America
  "9522cf38-b327-4391-acd2-5d9cfe0d8bc6", // Europe
  "57d9d29e-91ec-424c-b0f0-b6ba84ddf31d", // Antarctica
  "8c116a1f-28a3-4d2c-a4ad-4a71e6a0de78", // Australia
] as const;
const TIME_ZONES_UNIT_ID = "a6943945-1c7c-4ea8-a5b2-2552428119bc";
const LATITUDE_UNIT_ID = "ab312ce7-5f79-4740-a227-ac4c0e3bc6ef";  // p3, the principal parallels
const LONGITUDE_UNIT_ID = "04c61a82-dd00-40f8-a954-3bce4182d47c"; // p4, the meridians
const MID_LATITUDE_TABLE_UNIT_ID = "d18c0a11-7b3e-4c6f-9a52-8f1d4e2b7c30";
const MOUNTAIN_RANGES_TOPIC_ID = "85c5385c-86ff-4ec1-930c-c94910db0ce8";
const MOUNTAIN_RANGES_UNIT_ID = "c91a07a5-dd5b-4db2-9f5d-3d4e8b56d8ad";
const ATTRACTIONS_TOPIC_ID = "57682698-9d12-499a-a76f-063216c35b7f";
const ATTRACTION_CATEGORIES_UNIT_ID = "23711d5a-04c4-44e2-98bd-4626331eeb85";

/**
 * A leading model replaces the whole topic: it is the first thing on the page and
 * the units it consumes do not appear again below. A trailing model consolidates
 * a topic that has already been read — it renders after the ordinary cards, which
 * is the only sensible place for a comparison of entries the learner has just met.
 */
const LEADING_MODEL_UNIT_IDS: Record<string, readonly string[]> = {
  [PUSH_PULL_TOPIC_ID]: Object.values(PUSH_PULL_UNIT_IDS),
  [FORMS_OF_TOURISM_TOPIC_ID]: Object.values(FORMS_OF_TOURISM_UNIT_IDS),
  [CLIMATE_CLASSIFICATION_TOPIC_ID]: [CLIMATE_TYPES_UNIT_ID, CLIMATE_BANDS_UNIT_ID],
  [LATITUDE_LONGITUDE_TOPIC_ID]: [LATITUDE_UNIT_ID, LONGITUDE_UNIT_ID],
};

const TRAILING_MODEL_UNIT_IDS: Record<string, readonly string[]> = {
  [MIDDLE_LATITUDE_TOPIC_ID]: [MID_LATITUDE_TABLE_UNIT_ID],
  [LATITUDE_LONGITUDE_TOPIC_ID]: [TIME_ZONES_UNIT_ID],
  [SEVEN_CONTINENTS_TOPIC_ID]: SEVEN_CONTINENT_UNIT_IDS,
  [MAJOR_OCEANS_TOPIC_ID]: MAJOR_OCEAN_UNIT_IDS,
  [MOUNTAIN_RANGES_TOPIC_ID]: [MOUNTAIN_RANGES_UNIT_ID],
  [ATTRACTIONS_TOPIC_ID]: [ATTRACTION_CATEGORIES_UNIT_ID],
};

/**
 * Topics whose model absorbs the deck's own figure. The page must then not render it
 * again above the cards — the model shows it, one click away, inside itself.
 */
const MODELS_CLAIMING_THE_TOPIC_DIAGRAM: ReadonlySet<string> = new Set([
  SEVEN_CONTINENTS_TOPIC_ID,
  MAJOR_OCEANS_TOPIC_ID,
  CLIMATE_CLASSIFICATION_TOPIC_ID,
  LATITUDE_LONGITUDE_TOPIC_ID,
  MOUNTAIN_RANGES_TOPIC_ID,
  ATTRACTIONS_TOPIC_ID,
]);

export function modelClaimsTopicDiagram(topicId: string): boolean {
  return MODELS_CLAIMING_THE_TOPIC_DIAGRAM.has(topicId);
}

export type ModelPlacement = "leading" | "trailing";

function claimedUnitIds(
  source: Record<string, readonly string[]>,
  topicId: string,
  units: PublishedContentUnit[],
): Set<string> {
  const requiredIds = source[topicId];
  if (!requiredIds) return new Set();
  const availableIds = new Set(units.map((unit) => unit.id));
  return requiredIds.every((id) => availableIds.has(id)) ? new Set(requiredIds) : new Set();
}

export function topicModelUnitIds(
  placement: ModelPlacement,
  topicId: string,
  units: PublishedContentUnit[],
): Set<string> {
  return claimedUnitIds(placement === "leading" ? LEADING_MODEL_UNIT_IDS : TRAILING_MODEL_UNIT_IDS, topicId, units);
}

/** Every unit a model on this topic has taken over, so the page can leave them out of the ordinary sections. */
export function integratedTopicUnitIds(topicId: string, units: PublishedContentUnit[]): Set<string> {
  return new Set([
    ...topicModelUnitIds("leading", topicId, units),
    ...topicModelUnitIds("trailing", topicId, units),
  ]);
}

export default function TopicLearningModel({
  topicId,
  units,
  bookmarkedUnitIds,
  placement = "leading",
  chapterUnits,
  topicNames,
}: {
  topicId: string;
  units: PublishedContentUnit[];
  bookmarkedUnitIds?: Set<string>;
  /** Every unit in the chapter. Only the attraction wheel needs it: it indexes other topics. */
  chapterUnits?: PublishedContentUnit[];
  topicNames?: Record<string, string>;
  /** A topic may have both a leading and a trailing model; this says which one to render. */
  placement?: ModelPlacement;
}) {
  const byId = new Map(units.map((unit) => [unit.id, unit]));

  if (topicId === PUSH_PULL_TOPIC_ID) {
    const relationship = byId.get(PUSH_PULL_UNIT_IDS.relationship);
    const generatingArea = byId.get(PUSH_PULL_UNIT_IDS.generatingArea);
    const destinationArea = byId.get(PUSH_PULL_UNIT_IDS.destinationArea);
    const model = byId.get(PUSH_PULL_UNIT_IDS.model);
    if (!relationship || !generatingArea || !destinationArea || !model) return null;
    return (
      <PushPullModel
        relationship={relationship}
        generatingArea={generatingArea}
        destinationArea={destinationArea}
        model={model}
        bookmarkedUnitIds={bookmarkedUnitIds}
      />
    );
  }

  if (topicId === SEVEN_CONTINENTS_TOPIC_ID) {
    const continents = toContinents(units);
    if (continents.length !== SEVEN_CONTINENT_UNIT_IDS.length) return null;
    return <SevenContinentsModel continents={continents} topicId={topicId} bookmarkedUnitIds={bookmarkedUnitIds} />;
  }

  if (topicId === CLIMATE_CLASSIFICATION_TOPIC_ID) {
    const types = byId.get(CLIMATE_TYPES_UNIT_ID);
    const bands = byId.get(CLIMATE_BANDS_UNIT_ID);
    if (!types || !bands) return null;
    return <ClimateClassificationModel bands={bands} types={types} topicId={topicId} bookmarkedUnitIds={bookmarkedUnitIds} />;
  }

  if (topicId === MAJOR_OCEANS_TOPIC_ID) {
    const oceans = toOceans(units);
    if (oceans.length !== MAJOR_OCEAN_UNIT_IDS.length) return null;
    return <MajorOceansModel oceans={oceans} topicId={topicId} bookmarkedUnitIds={bookmarkedUnitIds} />;
  }

  if (topicId === LATITUDE_LONGITUDE_TOPIC_ID) {
    if (placement === "leading") {
      const latitude = byId.get(LATITUDE_UNIT_ID);
      const longitude = byId.get(LONGITUDE_UNIT_ID);
      if (!latitude || !longitude) return null;
      // The Equator has its own card in the other Chapter 3 topic; the globe quotes it beside the
      // added description. Found by its title, and simply left out if that card ever changes.
      const equator = (chapterUnits ?? units).find((unit) => unit.title === "The Equator");
      return <GlobeModel latitude={latitude} longitude={longitude} equator={equator} topicId={topicId} bookmarkedUnitIds={bookmarkedUnitIds} />;
    }
    const timeZones = byId.get(TIME_ZONES_UNIT_ID);
    if (!timeZones) return null;
    return <TimeZoneModel unit={timeZones} bookmarkedUnitIds={bookmarkedUnitIds} />;
  }

  if (topicId === ATTRACTIONS_TOPIC_ID) {
    const categoriesUnit = byId.get(ATTRACTION_CATEGORIES_UNIT_ID);
    const categories = categoriesUnit ? attractionCategories(categoriesUnit.body) : null;
    if (!categoriesUnit || !categories) return null;
    return (
      <AttractionWheelModel
        unit={categoriesUnit}
        categories={categories}
        chapterUnits={chapterUnits ?? units}
        topicNames={topicNames ?? {}}
        topicId={topicId}
        bookmarkedUnitIds={bookmarkedUnitIds}
      />
    );
  }

  if (topicId === MOUNTAIN_RANGES_TOPIC_ID) {
    const ranges = byId.get(MOUNTAIN_RANGES_UNIT_ID);
    if (!ranges) return null;
    return <MountainRangesModel unit={ranges} topicId={topicId} bookmarkedUnitIds={bookmarkedUnitIds} />;
  }

  if (topicId === MIDDLE_LATITUDE_TOPIC_ID) {
    const table = byId.get(MID_LATITUDE_TABLE_UNIT_ID);
    if (!table) return null;
    return <MidLatitudeComparison table={table} bookmarkedUnitIds={bookmarkedUnitIds} />;
  }

  if (topicId === FORMS_OF_TOURISM_TOPIC_ID) {
    const domestic = byId.get(FORMS_OF_TOURISM_UNIT_IDS.domestic);
    const international = byId.get(FORMS_OF_TOURISM_UNIT_IDS.international);
    const inbound = byId.get(FORMS_OF_TOURISM_UNIT_IDS.inbound);
    const outbound = byId.get(FORMS_OF_TOURISM_UNIT_IDS.outbound);
    if (!domestic || !international || !inbound || !outbound) return null;
    return (
      <FormsOfTourismModel
        domestic={domestic}
        international={international}
        inbound={inbound}
        outbound={outbound}
        bookmarkedUnitIds={bookmarkedUnitIds}
      />
    );
  }

  return null;
}

function AttractionWheelModel({
  unit,
  categories,
  chapterUnits,
  topicNames,
  topicId,
  bookmarkedUnitIds,
}: {
  unit: PublishedContentUnit;
  categories: AttractionCategory[];
  chapterUnits: PublishedContentUnit[];
  topicNames: Record<string, string>;
  topicId: string;
  bookmarkedUnitIds?: Set<string>;
}) {
  const sourceDiagram = topicDiagrams[topicId];

  return (
    <section aria-labelledby="attraction-wheel-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <UnitAnchor unit={unit} bookmarkedUnitIds={bookmarkedUnitIds} className="px-5 pt-5 sm:px-6 sm:pt-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Explore the categories</p>
        <h2 id="attraction-wheel-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          {unit.title}
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-[1.0625rem]/[1.7] text-ink">{unit.body}</p>
        <p className="mt-2 text-[1rem]/[1.6] text-ink-muted">
          Each of the seven is taught elsewhere in this chapter. Choose one to see its cards, and
          choose a card to jump straight to it.
        </p>
      </UnitAnchor>

      <AttractionWheel categories={categories} chapterUnits={chapterUnits} topicNames={topicNames} />

      {sourceDiagram ? (
        <details className="border-t border-graticule px-5 py-3 sm:px-6">
          <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
            The slide&apos;s own diagram
          </summary>
          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <ExpandableImage
              image={{ src: sourceDiagram.src, alt: sourceDiagram.alt, width: 900, height: 520 }}
              label={sourceDiagram.caption ?? sourceDiagram.alt}
              padded
              sizes="(min-width: 1024px) 720px, 100vw"
            />
            <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
              {sourceDiagram.caption} — {sourceDiagram.sourceFile}, p{sourceDiagram.pageOrSlide}
            </figcaption>
          </figure>
        </details>
      ) : null}
    </section>
  );
}

function MountainRangesModel({
  unit,
  topicId,
  bookmarkedUnitIds,
}: {
  unit: PublishedContentUnit;
  topicId: string;
  bookmarkedUnitIds?: Set<string>;
}) {
  const sourceDiagram = topicDiagrams[topicId];

  return (
    <section aria-labelledby="mountain-ranges-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <UnitAnchor unit={unit} bookmarkedUnitIds={bookmarkedUnitIds} className="p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Explore the map</p>
        <h2 id="mountain-ranges-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          {unit.title}
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-[1.0625rem]/[1.7] text-ink">{unit.body}</p>
        <p className="mt-2 text-[1rem]/[1.6] text-ink-muted">
          The learning note names six ranges; the slide&apos;s map legend names twenty-four. All
          twenty-four are here. Pick one, or point at the map, to see where it runs and what it
          looks like on the ground.
        </p>
      </UnitAnchor>

      <MountainRangeExplorer />

      <p className="border-t border-graticule px-5 py-3 text-[0.8125rem]/[1.55] text-ink-muted sm:px-6">
        Each range is drawn along its published extent, close enough to place it on a world map
        and no finer. The topography inside it is NASA&apos;s elevation data, tinted and shaded;
        the countries beside each name are the slide&apos;s own words, and where the slide places
        a range in the wrong country the panel says so rather than correcting it silently.
      </p>

      {sourceDiagram ? (
        <details className="border-t border-graticule px-5 py-3 sm:px-6">
          <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
            The slide&apos;s own map
          </summary>
          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <ExpandableImage
              image={{ src: sourceDiagram.src, alt: sourceDiagram.alt, width: 900, height: 520 }}
              label={sourceDiagram.caption ?? sourceDiagram.alt}
              padded
              sizes="(min-width: 1024px) 720px, 100vw"
            />
            <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
              {sourceDiagram.caption} — {sourceDiagram.sourceFile}, p{sourceDiagram.pageOrSlide}
            </figcaption>
          </figure>
        </details>
      ) : null}
    </section>
  );
}

function PushPullModel({
  relationship,
  generatingArea,
  destinationArea,
  model,
  bookmarkedUnitIds,
}: {
  relationship: PublishedContentUnit;
  generatingArea: PublishedContentUnit;
  destinationArea: PublishedContentUnit;
  model: PublishedContentUnit;
  bookmarkedUnitIds?: Set<string>;
}) {
  const factors = parseFactorLists(model.body);

  return (
    <section aria-labelledby="push-pull-learning-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <UnitAnchor unit={relationship} bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Study model</p>
        <h2 id="push-pull-learning-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          Push starts the journey. Pull shapes the destination choice.
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-[1.0625rem]/[1.65] text-ink">{relationship.body}</p>
      </UnitAnchor>

      <div className="grid items-stretch gap-0 lg:grid-cols-[1fr_5rem_1fr]">
        <UnitAnchor unit={generatingArea} bookmarkedUnitIds={bookmarkedUnitIds} className="bg-relief/6 p-5 sm:p-6">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-relief">Generating area · leave</p>
          <h3 className="mt-1 font-display text-[1.25rem]/[1.3] font-semibold text-ink-strong">{generatingArea.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{generatingArea.body}</p>
        </UnitAnchor>

        <div aria-hidden="true" className="flex items-center justify-center border-y border-graticule bg-chart px-3 py-2 text-meridian lg:border-x lg:border-y-0">
          <span className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] lg:hidden">Tourist journey ↓</span>
          <span className="hidden text-3xl lg:inline">→</span>
        </div>

        <UnitAnchor unit={destinationArea} bookmarkedUnitIds={bookmarkedUnitIds} className="bg-meridian/6 p-5 sm:p-6">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Destination area · choose</p>
          <h3 className="mt-1 font-display text-[1.25rem]/[1.3] font-semibold text-ink-strong">{destinationArea.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{destinationArea.body}</p>
        </UnitAnchor>
      </div>

      <UnitAnchor unit={model} bookmarkedUnitIds={bookmarkedUnitIds} className="border-t border-graticule p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Compare the factors</p>
        <h3 className="mt-1 font-display text-[1.25rem]/[1.3] font-semibold text-ink-strong">{model.title}</h3>
        <p className="mt-2 text-[1rem]/[1.65] text-ink">{factors.introduction}</p>
        <div className="mt-4 overflow-hidden rounded-card border border-graticule">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">Push factors compared with pull factors</caption>
            <thead>
              <tr>
                <th scope="col" className="border-r border-graticule bg-relief/10 px-3 py-2 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-relief sm:px-4">Push factors</th>
                <th scope="col" className="bg-meridian/10 px-3 py-2 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-meridian sm:px-4">Pull factors</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="border-r border-graticule bg-relief/4 px-3 py-3 sm:px-4">
                  <FactorList factors={factors.push} markerClass="bg-relief" />
                </td>
                <td className="bg-meridian/4 px-3 py-3 sm:px-4">
                  <FactorList factors={factors.pull} markerClass="bg-meridian" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UnitAnchor>

      <ModelSource units={[relationship, generatingArea, destinationArea, model]} />
    </section>
  );
}

function FormsOfTourismModel({
  domestic,
  international,
  inbound,
  outbound,
  bookmarkedUnitIds,
}: {
  domestic: PublishedContentUnit;
  international: PublishedContentUnit;
  inbound: PublishedContentUnit;
  outbound: PublishedContentUnit;
  bookmarkedUnitIds?: Set<string>;
}) {
  return (
    <section aria-labelledby="forms-learning-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <div className="border-b border-graticule p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Study model</p>
        <h2 id="forms-learning-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">Forms of tourism from one country&apos;s viewpoint</h2>
        <p className="mt-2 text-[1rem]/[1.6] text-ink-muted">Use Country A as the reference point, then compare who travels and whether the trip stays inside or crosses its border.</p>
      </div>

      <UnitAnchor unit={international} bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule bg-deep/6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-deep">The border-crossing category</p>
            <h3 className="mt-1 font-display text-[1.25rem]/[1.3] font-semibold text-deep">{international.title}</h3>
          </div>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{international.body}</p>
      </UnitAnchor>

      <div className="grid sm:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,1fr)]" aria-describedby="forms-matrix-note">
        <div className="hidden border-b border-r border-graticule bg-chart sm:block" aria-hidden="true" />
        <div className="hidden border-b border-r border-graticule bg-chart px-4 py-3 text-center font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:block">Inside Country A</div>
        <div className="hidden border-b border-graticule bg-chart px-4 py-3 text-center font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:block">Outside Country A</div>

        <div className="hidden items-center border-b border-r border-graticule bg-chart px-4 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:flex">Residents of Country A</div>
        <FormCell unit={domestic} context="Residents of Country A · inside Country A" bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule sm:border-r" />
        <FormCell unit={outbound} context="Residents of Country A · outside Country A" isInternational bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule" />

        <div className="hidden items-center border-r border-graticule bg-chart px-4 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-muted sm:flex">Non-residents</div>
        <FormCell unit={inbound} context="Non-residents · inside Country A" isInternational bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule sm:border-b-0 sm:border-r" />
        <div className="border-b border-graticule bg-chart p-5 text-ink-muted sm:border-b-0 sm:p-6">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em]">Non-residents · outside Country A</p>
          <p className="mt-2 text-[0.9375rem]/[1.6]">Country A is not part of this trip, so the matrix leaves this position unnamed.</p>
        </div>
      </div>

      <p id="forms-matrix-note" className="border-t border-graticule bg-lowland/6 px-5 py-3 text-[0.9375rem]/[1.6] text-ink sm:px-6">
        <span className="font-semibold text-lowland">Read the matrix by perspective:</span> domestic stays inside; outbound leaves; inbound arrives.
      </p>
      <ModelSource units={[domestic, international, inbound, outbound]} />
    </section>
  );
}

/**
 * The source deck presents this as a screenshot of a table: two sub-types as rows,
 * four attributes as columns, at a resolution that is unreadable on a phone. The
 * stored unit body is a faithful transcription of that screenshot, so the cells are
 * PARSED OUT OF THE BODY rather than retyped — the table cannot drift from the text
 * it claims to render, and if the body is ever reworded the parse fails closed and
 * the prose renders instead.
 *
 * The axes are transposed against the source: attributes become rows and the two
 * climates become columns. Reading down a column gives one climate's profile;
 * reading across a row gives the contrast, which is the comparison the table exists
 * to make. Column headings are the deck's own ("Latitude Range", "World Location",
 * "Vegetation", "Seasons/Rainfall").
 */
const MID_LATITUDE_ATTRIBUTES = [
  { key: "latitude", label: "Latitude range" },
  { key: "location", label: "World location" },
  { key: "vegetation", label: "Vegetation" },
  { key: "seasons", label: "Seasons / rainfall" },
] as const;

type MidLatitudeRow = { latitude: string; location: string; vegetation: string; seasons: string };
type MidLatitudeTable = { introduction: string; humidContinental: MidLatitudeRow; marineWestCoast: MidLatitudeRow };

/**
 * The deck's own time-zone figure is a flat raster: colour bands, a row of clock faces, and
 * type too small to read on a phone. Everything it shows is a *relationship* — which zone a
 * place sits in, how far that is from Greenwich, what time it makes there — and a picture can
 * only assert those, never let a learner test one. This replaces it with the same map made
 * interactive, plus a converter, which is the exercise the unit implies but the slide cannot set.
 *
 * The unit's own words are untouched and render above the tool. The cities and offsets inside
 * it are reference data, not course content, and the interface says so — see the header note in
 * `time-zones.ts`.
 */
/**
 * The deck names the seven continents on one slide and gives each a sentence on the next
 * three, with a flat world map alongside. Read as cards, the map and the sentences never
 * meet: nothing tells a learner which shape "the third-largest, 24.71 million km²" refers
 * to. Here the map answers that directly — point at a continent and its own sentence,
 * size and ranking appear.
 *
 * Not one word is written here. The size and ranking are parsed out of the stored bodies,
 * and the two continents whose slides give no area say so rather than borrowing a figure
 * from anywhere else.
 */
/**
 * The oceans slide is the continents slide's twin — five names, a sentence each, one flat
 * map — and it has the same problem: the map cannot tell you which water it is talking
 * about. Same treatment, with one difference worth knowing. Continents are separated by
 * land, so their outlines are facts; oceans are one body of water, so every boundary here
 * is a convention drawn across it. The footnote says which conventions.
 */
/**
 * This topic carries two maps that answer different questions — the deck's climate-and-
 * vegetation map on p12 and its latitude-band map on p13 — and as separate cards they read
 * as two unrelated pictures. They share one window here, with tabs, so a learner compares
 * them instead of scrolling between them.
 *
 * Only the latitude tab is made interactive, and that asymmetry is deliberate: the bands are
 * defined by latitude, which is knowable, while the p12 map's legend mixes the five climate
 * types with a nine-part vegetation key the deck never reconciles. Making that one clickable
 * would mean inventing which colour belongs to which type.
 */
function ClimateClassificationModel({
  bands,
  types,
  topicId,
  bookmarkedUnitIds,
}: {
  bands: PublishedContentUnit;
  types: PublishedContentUnit;
  topicId: string;
  bookmarkedUnitIds?: Set<string>;
}) {
  const sourceDiagram = topicDiagrams[topicId];
  const bandsImage = contentImages[bands.id];

  return (
    <section aria-labelledby="climate-classification-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <UnitAnchor unit={types} bookmarkedUnitIds={bookmarkedUnitIds} className="p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Explore the maps</p>
        <h2 id="climate-classification-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          World climate classification
        </h2>
        <p className="mt-2 text-[1rem]/[1.6] text-ink-muted">
          Two maps, one window: the zones the world is divided into by latitude, and the deck&apos;s own climate and
          vegetation map. Switch between them with the tabs.
        </p>
      </UnitAnchor>

      <span className="sr-only" id={`unit-${bands.id}`} />

      <ClimateMapTabs
        bandsUnit={{ id: bands.id, body: bands.body, pageOrSlide: bands.citation.pageOrSlide }}
        typesUnit={{ id: types.id, body: types.body, pageOrSlide: types.citation.pageOrSlide }}
        sourceMap={{
          src: sourceDiagram?.src ?? bandsImage?.src ?? "",
          alt: sourceDiagram?.alt ?? bandsImage?.alt ?? "",
          caption: sourceDiagram?.caption,
          pageOrSlide: sourceDiagram?.pageOrSlide ?? types.citation.pageOrSlide,
        }}
      />

      <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
        Interactive study tool built from the published learning notes · chapter-2.pdf, pages/slides{" "}
        {types.citation.pageOrSlide}–{bands.citation.pageOrSlide} · base map CC0
      </p>
    </section>
  );
}

function MajorOceansModel({
  oceans,
  topicId,
  bookmarkedUnitIds,
}: {
  oceans: Ocean[];
  topicId: string;
  bookmarkedUnitIds?: Set<string>;
}) {
  const sourceDiagram = topicDiagrams[topicId];
  const pages = [...new Set(oceans.map((ocean) => ocean.pageOrSlide))].sort((a, b) => a - b);

  return (
    <section aria-labelledby="major-oceans-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <div className="p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Explore the map</p>
        <h2 id="major-oceans-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          The five major oceans on the map
        </h2>
        <p className="mt-2 text-[1rem]/[1.6] text-ink-muted">
          Point at an ocean — or pick one below the map — to read what the course says about it.
        </p>
      </div>

      <OceanExplorer oceans={oceans} bookmarkedUnitIds={bookmarkedUnitIds} />

      {sourceDiagram ? (
        <details className="border-t border-graticule px-5 py-3 sm:px-6">
          <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
            The slide&apos;s own map
          </summary>
          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <Image alt={sourceDiagram.alt} className="h-auto w-full" height={520} src={sourceDiagram.src} width={900} />
            {sourceDiagram.caption ? (
              <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
                {sourceDiagram.caption} — {sourceDiagram.sourceFile}, p{sourceDiagram.pageOrSlide}
              </figcaption>
            ) : null}
          </figure>
        </details>
      ) : null}

      <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
        Interactive study tool built from the published learning notes · chapter-2.pdf, pages/slides {pages[0]}–{pages.at(-1)} · base map CC0
      </p>
    </section>
  );
}

function SevenContinentsModel({
  continents,
  topicId,
  bookmarkedUnitIds,
}: {
  continents: Continent[];
  topicId: string;
  bookmarkedUnitIds?: Set<string>;
}) {
  const sourceDiagram = topicDiagrams[topicId];
  const pages = [...new Set(continents.map((continent) => continent.pageOrSlide))].sort((a, b) => a - b);

  return (
    <section aria-labelledby="seven-continents-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <div className="p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Explore the map</p>
        <h2 id="seven-continents-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          The seven continents on the map
        </h2>
        <p className="mt-2 text-[1rem]/[1.6] text-ink-muted">
          Point at a continent — or pick one below the map — to read what the course says about it.
        </p>
      </div>

      <ContinentExplorer continents={continents} bookmarkedUnitIds={bookmarkedUnitIds} />

      {sourceDiagram ? (
        <details className="border-t border-graticule px-5 py-3 sm:px-6">
          <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
            The slide&apos;s own map
          </summary>
          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <Image alt={sourceDiagram.alt} className="h-auto w-full" height={520} src={sourceDiagram.src} width={900} />
            {sourceDiagram.caption ? (
              <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
                {sourceDiagram.caption} — {sourceDiagram.sourceFile}, p{sourceDiagram.pageOrSlide}
              </figcaption>
            ) : null}
          </figure>
        </details>
      ) : null}

      <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
        Interactive study tool built from the published learning notes · chapter-2.pdf, pages/slides {pages[0]}–{pages.at(-1)} · base map CC0
      </p>
    </section>
  );
}

/**
 * The globe, in place of the two flat pictures of one. Both units keep their own words above
 * it — the parallels and their five principal lines, and the meridians with the deck's
 * 15-degrees-an-hour arithmetic — because the globe illustrates them rather than replacing
 * them.
 */
function GlobeModel({
  latitude,
  longitude,
  equator,
  topicId,
  bookmarkedUnitIds,
}: {
  latitude: PublishedContentUnit;
  longitude: PublishedContentUnit;
  equator?: PublishedContentUnit;
  topicId: string;
  bookmarkedUnitIds?: Set<string>;
}) {
  const sourceDiagram = topicDiagrams[topicId];

  return (
    <section aria-labelledby="globe-model" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <div className="p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Turn the globe</p>
        <h2 id="globe-model" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">
          Latitude and longitude
        </h2>
      </div>

      <UnitAnchor unit={latitude} bookmarkedUnitIds={bookmarkedUnitIds} className="border-t border-graticule px-5 pb-4 sm:px-6">
        <h3 className="font-display text-[1.125rem]/[1.3] font-semibold text-ink-strong">{latitude.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{latitude.body}</p>
      </UnitAnchor>

      <UnitAnchor unit={longitude} bookmarkedUnitIds={bookmarkedUnitIds} className="px-5 pb-4 sm:px-6">
        <h3 className="font-display text-[1.125rem]/[1.3] font-semibold text-ink-strong">{longitude.title}</h3>
        <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{longitude.body}</p>
      </UnitAnchor>

      <GlobeExplorer principalNames={principalNamesFrom(latitude.body)} equatorFromCourse={equator?.body} />

      {sourceDiagram ? (
        <details className="border-t border-graticule px-5 py-3 sm:px-6">
          <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
            The slide&apos;s own diagram
          </summary>
          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <ExpandableImage
              image={{ src: sourceDiagram.src, alt: sourceDiagram.alt, width: 900, height: 520 }}
              label={sourceDiagram.caption ?? sourceDiagram.alt}
              padded
              sizes="(min-width: 1024px) 720px, 100vw"
            />
            {sourceDiagram.caption ? (
              <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
                {sourceDiagram.caption} — {sourceDiagram.sourceFile}, p{sourceDiagram.pageOrSlide}
              </figcaption>
            ) : null}
          </figure>
        </details>
      ) : null}

      <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
        Interactive study tool built from the published learning notes · {latitude.citation.sourceFile}, pages/slides{" "}
        {latitude.citation.pageOrSlide}–{longitude.citation.pageOrSlide}
      </p>
    </section>
  );
}

function TimeZoneModel({
  unit,
  bookmarkedUnitIds,
}: {
  unit: PublishedContentUnit;
  bookmarkedUnitIds?: Set<string>;
}) {
  // The deck's own figure carries two things the tool does not — the clock faces and the
  // Sunday/Monday labels either side of the Date Line — and learners may be assessed on the
  // slide itself, so it stays one click away rather than being deleted.
  const sourceFigure = contentImages[unit.id];

  return (
    <section aria-labelledby="time-zone-explorer" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <UnitAnchor unit={unit} bookmarkedUnitIds={bookmarkedUnitIds} className="p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Explore the model</p>
        <h2 id="time-zone-explorer" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">{unit.title}</h2>
        <p className="mt-3 whitespace-pre-wrap text-[1.0625rem]/[1.65] text-ink">{unit.body}</p>
      </UnitAnchor>

      <TimeZoneExplorer />

      {sourceFigure ? (
        <details className="border-t border-graticule px-5 py-3 sm:px-6">
          <summary className="cursor-pointer font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted hover:text-ink">
            The slide&apos;s own diagram
          </summary>
          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <Image alt={sourceFigure.alt} className="h-auto w-full" height={sourceFigure.height} src={sourceFigure.src} width={sourceFigure.width} />
            {sourceFigure.caption ? (
              <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
                {sourceFigure.caption}
              </figcaption>
            ) : null}
          </figure>
        </details>
      ) : null}

      <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
        Interactive study tool · the model is from {unit.citation.sourceFile}, page/slide {unit.citation.pageOrSlide} · city
        and offset data is general reference, not course content · base map CC0
      </p>
    </section>
  );
}

function MidLatitudeComparison({
  table,
  bookmarkedUnitIds,
}: {
  table: PublishedContentUnit;
  bookmarkedUnitIds?: Set<string>;
}) {
  const parsed = parseMidLatitudeTable(table.body);

  return (
    <section aria-labelledby="mid-latitude-comparison" className="overflow-hidden rounded-card border border-graticule bg-surface">
      <UnitAnchor unit={table} bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule p-5 sm:p-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Compare the sub-types</p>
        <h2 id="mid-latitude-comparison" className="mt-1 font-display text-[1.5rem]/[1.2] font-semibold text-ink-strong">{table.title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{parsed ? parsed.introduction : table.body}</p>
      </UnitAnchor>

      {parsed ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] border-collapse text-left">
              <caption className="sr-only">Humid Continental and Marine-West Coast compared by latitude range, world location, vegetation, and seasons and rainfall</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[6.5rem] border-b border-graticule bg-chart px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted sm:w-[9rem] sm:px-4">
                    <span className="sr-only">Attribute</span>
                  </th>
                  <th scope="col" className="border-b border-l border-graticule bg-relief/10 px-3 py-2 align-bottom font-display text-[0.9375rem]/[1.25] font-semibold text-relief sm:px-4">Humid Continental</th>
                  <th scope="col" className="border-b border-l border-graticule bg-meridian/10 px-3 py-2 align-bottom font-display text-[0.9375rem]/[1.25] font-semibold text-meridian sm:px-4">Marine-West Coast</th>
                </tr>
              </thead>
              <tbody>
                {MID_LATITUDE_ATTRIBUTES.map((attribute) => (
                  <tr key={attribute.key} className="align-top">
                    <th scope="row" className="border-b border-graticule bg-chart px-3 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted sm:px-4">
                      {attribute.label}
                    </th>
                    <td className="border-b border-l border-graticule bg-relief/4 px-3 py-3 text-[0.9375rem]/[1.5] text-ink sm:px-4">
                      {parsed.humidContinental[attribute.key]}
                    </td>
                    <td className="border-b border-l border-graticule bg-meridian/4 px-3 py-3 text-[0.9375rem]/[1.5] text-ink sm:px-4">
                      {parsed.marineWestCoast[attribute.key]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-graticule bg-lowland/6 px-5 py-3 text-[0.9375rem]/[1.6] text-ink sm:px-6">
            <span className="font-semibold text-lowland">Where they differ:</span> both share a vegetation type and overlap in latitude — the working difference is the coast. Read the seasons row.
          </p>
        </>
      ) : null}

      <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
        Native table built from the published learning note · {table.citation.sourceFile}, page/slide {table.citation.pageOrSlide} · column headings as on the source table
      </p>
    </section>
  );
}

function parseMidLatitudeTable(body: string): MidLatitudeTable | null {
  const match = /^([\s\S]*?)\s*Humid Continental:\s*([\s\S]*?)\.\s*Marine-West Coast:\s*([\s\S]*)$/.exec(body);
  if (!match) return null;
  const humidContinental = parseMidLatitudeRow(match[2]);
  const marineWestCoast = parseMidLatitudeRow(match[3]);
  if (!humidContinental || !marineWestCoast) return null;
  return { introduction: match[1].trim(), humidContinental, marineWestCoast };
}

function parseMidLatitudeRow(value: string): MidLatitudeRow | null {
  const parts = value.split(";").map((part) => part.trim().replace(/\.$/, ""));
  if (parts.length !== 4) return null;
  const [latitude, location, vegetation, seasons] = parts;
  const stripped = {
    latitude: latitude.replace(/^latitude range\s+/i, ""),
    location: location.replace(/^world location\s+/i, ""),
    vegetation: vegetation.replace(/^vegetation\s+/i, ""),
    seasons,
  };
  return Object.values(stripped).every(Boolean) ? stripped : null;
}

function FormCell({
  unit,
  context,
  isInternational = false,
  bookmarkedUnitIds,
  className,
}: {
  unit: PublishedContentUnit;
  context: string;
  isInternational?: boolean;
  bookmarkedUnitIds?: Set<string>;
  className: string;
}) {
  return (
    <UnitAnchor unit={unit} bookmarkedUnitIds={bookmarkedUnitIds} className={`${className} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-muted">{context}</p>
        {isInternational ? <span className="rounded-full bg-deep/10 px-2 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-deep">International</span> : null}
      </div>
      <h3 className="mt-2 font-display text-[1.25rem]/[1.3] font-semibold text-ink-strong">{unit.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{unit.body}</p>
    </UnitAnchor>
  );
}

function UnitAnchor({
  unit,
  bookmarkedUnitIds,
  className,
  children,
}: {
  unit: PublishedContentUnit;
  bookmarkedUnitIds?: Set<string>;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <article id={`unit-${unit.id}`} className={`scroll-mt-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">{children}</div>
        {bookmarkedUnitIds ? (
          <BookmarkToggle contentUnitId={unit.id} title={unit.title} initiallySaved={bookmarkedUnitIds.has(unit.id)} />
        ) : null}
      </div>
    </article>
  );
}

function FactorList({ factors, markerClass }: { factors: string[]; markerClass: string }) {
  return (
    <ul className="space-y-2 text-[0.9375rem]/[1.45] text-ink">
      {factors.map((factor) => (
        <li key={factor} className="flex items-start gap-2">
          <span aria-hidden="true" className={`mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full ${markerClass}`} />
          <span>{factor}</span>
        </li>
      ))}
    </ul>
  );
}

function parseFactorLists(body: string): { introduction: string; push: string[]; pull: string[] } {
  const match = /^([\s\S]*?)\s*Push factors:\s*([\s\S]*?)\s*Pull factors:\s*([\s\S]*)$/.exec(body);
  if (!match) return { introduction: body, push: [], pull: [] };
  return {
    introduction: match[1].trim(),
    push: splitCourseList(match[2]),
    pull: splitCourseList(match[3]),
  };
}

function splitCourseList(value: string): string[] {
  return value
    .replace(/[.]\s*$/, "")
    .replace(/,\s+and\s+/i, ", ")
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ModelSource({ units }: { units: PublishedContentUnit[] }) {
  const sourceFile = units[0].citation.sourceFile;
  const pages = [...new Set(units.map((unit) => unit.citation.pageOrSlide))].sort((a, b) => a - b);
  const pageLabel = pages.length === 1 ? `page/slide ${pages[0]}` : `pages/slides ${pages[0]}–${pages.at(-1)}`;
  return (
    <p className="border-t border-graticule bg-chart px-5 py-2.5 font-mono text-[0.75rem]/[1.5] text-ink-muted sm:px-6">
      Native study model using the published learning notes · {sourceFile}, {pageLabel}
    </p>
  );
}
