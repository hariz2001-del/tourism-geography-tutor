import BookmarkToggle from "./bookmark-toggle";
import type { PublishedContentUnit } from "@/lib/course-brain/types";

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

const MODEL_UNIT_IDS: Record<string, readonly string[]> = {
  [PUSH_PULL_TOPIC_ID]: Object.values(PUSH_PULL_UNIT_IDS),
  [FORMS_OF_TOURISM_TOPIC_ID]: Object.values(FORMS_OF_TOURISM_UNIT_IDS),
};

export function integratedTopicUnitIds(topicId: string, units: PublishedContentUnit[]): Set<string> {
  const requiredIds = MODEL_UNIT_IDS[topicId];
  if (!requiredIds) return new Set();
  const availableIds = new Set(units.map((unit) => unit.id));
  return requiredIds.every((id) => availableIds.has(id)) ? new Set(requiredIds) : new Set();
}

export default function TopicLearningModel({
  topicId,
  units,
  bookmarkedUnitIds,
}: {
  topicId: string;
  units: PublishedContentUnit[];
  bookmarkedUnitIds?: Set<string>;
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
        <p className="mt-3 max-w-[68ch] whitespace-pre-wrap text-[1.0625rem]/[1.65] text-ink">{relationship.body}</p>
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
        <p className="mt-2 max-w-[68ch] text-[1rem]/[1.65] text-ink">{factors.introduction}</p>
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
        <p className="mt-2 max-w-[62ch] text-[1rem]/[1.6] text-ink-muted">Use Country A as the reference point, then compare who travels and whether the trip stays inside or crosses its border.</p>
      </div>

      <UnitAnchor unit={international} bookmarkedUnitIds={bookmarkedUnitIds} className="border-b border-graticule bg-deep/6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-deep">The border-crossing category</p>
            <h3 className="mt-1 font-display text-[1.25rem]/[1.3] font-semibold text-deep">{international.title}</h3>
          </div>
        </div>
        <p className="mt-2 max-w-[68ch] whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{international.body}</p>
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
