"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useGoToUnit } from "@/app/chapters/[chapterCode]/chapter-topics";
import { contentImages } from "@/lib/course-brain/content-images";
import { unitsForCategory, type AttractionCategory } from "@/lib/course-brain/attraction-categories";
import type { PublishedContentUnit } from "@/lib/course-brain/types";

/**
 * The deck's wheel of physical tourist attractions, turned into the index it always was.
 *
 * Seven bubbles around a hub is a picture of a list. What makes it worth drawing is that every
 * one of the seven is taught elsewhere in this chapter — the plateau bubble has four cards
 * behind it, the islands bubble six — and until now nothing connected the two. Choosing a
 * segment lists that category's cards; choosing a card jumps to it, wherever in the chapter it
 * lives, and the card flashes when it arrives.
 *
 * The wheel is SVG so the labels stay sharp and the segments can be real buttons: a reader on a
 * phone or a keyboard gets the same thing a mouse does.
 */
const CENTRE = 200;
const HUB_RADIUS = 74;
const PETAL_RADIUS = 58;
const ORBIT = 126;

function petalCentre(index: number, total: number): { x: number; y: number } {
  // Start at the top and go clockwise, the way the slide's own wheel is arranged.
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: CENTRE + Math.cos(angle) * ORBIT, y: CENTRE + Math.sin(angle) * ORBIT };
}

/**
 * The body writes the categories in running prose, so they arrive lowercase. A CSS
 * `capitalize` would render "Hills And Mountains" — which is neither the body's wording nor
 * the slide's. Only the first letter is raised, and only for display.
 */
function forDisplay(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Two short lines read better in a circle than one long one. */
function labelLines(name: string): string[] {
  const words = name.split(" ");
  if (words.length < 3) return [name];
  const middle = Math.ceil(words.length / 2);
  return [words.slice(0, middle).join(" "), words.slice(middle).join(" ")];
}

export default function AttractionWheel({
  categories,
  chapterUnits,
  topicNames,
}: {
  categories: AttractionCategory[];
  chapterUnits: PublishedContentUnit[];
  topicNames: Record<string, string>;
}) {
  const [activeKey, setActiveKey] = useState(categories[0]?.key ?? "");
  const goToUnit = useGoToUnit();

  const active = categories.find((category) => category.key === activeKey) ?? categories[0];
  const cards = useMemo(() => unitsForCategory(active, chapterUnits), [active, chapterUnits]);

  return (
    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div>
        <svg
          aria-hidden="true"
          className="mx-auto block h-auto w-full max-w-[22rem]"
          viewBox="0 0 400 400"
        >
          {categories.map((category, index) => {
            const { x, y } = petalCentre(index, categories.length);
            const isActive = category.key === active.key;
            return (
              <g key={category.key}>
                <line
                  stroke="currentColor"
                  className="text-graticule"
                  strokeWidth={isActive ? 2 : 1}
                  x1={CENTRE}
                  x2={x}
                  y1={CENTRE}
                  y2={y}
                />
                <circle
                  className={isActive ? "fill-meridian" : "fill-chart"}
                  cx={x}
                  cy={y}
                  r={PETAL_RADIUS}
                  stroke="currentColor"
                  strokeWidth={isActive ? 2 : 1}
                />
                <text
                  className={`font-display text-[13px] ${isActive ? "fill-white" : "fill-ink"}`}
                  dominantBaseline="middle"
                  textAnchor="middle"
                  x={x}
                  y={y}
                >
                  {labelLines(forDisplay(category.name)).map((line, lineIndex, lines) => (
                    <tspan key={line} dy={lineIndex === 0 ? (lines.length - 1) * -8 : 16} x={x}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
          <circle className="fill-surface" cx={CENTRE} cy={CENTRE} r={HUB_RADIUS} stroke="currentColor" strokeWidth={2} />
          <text className="font-display text-[13px] font-semibold fill-ink-strong" dominantBaseline="middle" textAnchor="middle" x={CENTRE} y={CENTRE}>
            <tspan dy={-16} x={CENTRE}>Physical</tspan>
            <tspan dy={17} x={CENTRE}>tourist</tspan>
            <tspan dy={17} x={CENTRE}>attraction</tspan>
          </text>
        </svg>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <button
              aria-pressed={category.key === active.key}
              className={`rounded-card border px-2.5 py-1 text-[0.8125rem] transition-colors ${
                category.key === active.key
                  ? "border-meridian bg-meridian/12 font-semibold text-ink-strong"
                  : "border-graticule bg-surface text-ink hover:border-meridian/60"
              }`}
              key={category.key}
              onClick={() => setActiveKey(category.key)}
              type="button"
            >
              {forDisplay(category.name)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-[1.1875rem]/[1.3] font-semibold text-ink-strong">{forDisplay(active.name)}</h3>
        <p className="mt-1 font-mono text-[0.75rem] text-ink-muted">
          {cards.length === 1 ? "1 card in this chapter" : `${cards.length} cards in this chapter`}
        </p>

        {active.gap ? (
          <p className="mt-3 rounded-card border border-relief/40 bg-relief/8 p-3 text-[0.875rem]/[1.5] text-ink">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-relief">Gap</span>{" "}
            {active.gap}
          </p>
        ) : null}

        {cards.length ? (
          <ul className="mt-3 space-y-2">
            {cards.map((unit) => {
              const image = contentImages[unit.id];
              return (
                <li key={unit.id}>
                  <button
                    className="flex w-full items-start gap-3 rounded-card border border-graticule bg-surface p-2.5 text-left transition-colors hover:border-meridian/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                    onClick={() => goToUnit(unit.topicId, unit.id)}
                    type="button"
                  >
                    {image ? (
                      <Image
                        alt=""
                        aria-hidden="true"
                        className="h-14 w-20 shrink-0 rounded-[3px] object-cover"
                        height={image.height}
                        sizes="80px"
                        src={image.src}
                        width={image.width}
                      />
                    ) : (
                      <span aria-hidden="true" className="h-14 w-20 shrink-0 rounded-[3px] bg-chart" />
                    )}
                    <span className="min-w-0">
                      <span className="block font-display text-[0.9375rem]/[1.3] font-semibold text-ink-strong">{unit.title}</span>
                      <span className="mt-0.5 block line-clamp-2 text-[0.8125rem]/[1.45] text-ink-muted">{unit.body}</span>
                      <span className="mt-1 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-meridian">
                        {topicNames[unit.topicId] ?? "This chapter"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 rounded-card border border-relief/40 bg-relief/8 p-3 text-[0.875rem]/[1.5] text-ink">
            The slide names this category, but Chapter 4 has no card that teaches it. Worth
            raising rather than filling in.
          </p>
        )}
      </div>
    </div>
  );
}
