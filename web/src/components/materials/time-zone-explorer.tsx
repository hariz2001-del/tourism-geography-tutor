"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import {
  bandWidth,
  converterCities,
  formatClock,
  formatOffsetDifference,
  shiftClock,
  timeZoneBands,
  type TimeZoneBand,
} from "@/lib/course-brain/time-zones";
import { worldBaseMap } from "@/lib/course-brain/component-assets";

const GMT_BAND = timeZoneBands.find((band) => band.offset === 0)!;

/** Percentage position of a longitude on a -180..180 equirectangular base map. */
function longitudeLeft(longitude: number): number {
  return ((longitude + 180) / 360) * 100;
}

function parseClock(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function dayLabel(shift: -1 | 0 | 1): string | null {
  if (shift === 1) return "next day";
  if (shift === -1) return "previous day";
  return null;
}

export default function TimeZoneExplorer() {
  const [activeOffset, setActiveOffset] = useState<number>(0);
  const [fromCity, setFromCity] = useState("Kuala Lumpur");
  const [toCity, setToCity] = useState("New York");
  const [clock, setClock] = useState("09:00");
  const headingId = useId();

  const active = timeZoneBands.find((band) => band.offset === activeOffset) ?? GMT_BAND;
  const from = converterCities.find((city) => city.city === fromCity) ?? converterCities[0];
  const to = converterCities.find((city) => city.city === toCity) ?? converterCities[0];
  const minutes = parseClock(clock);

  const conversion = useMemo(() => {
    if (minutes === null) return null;
    const greenwich = shiftClock(minutes, from.offset, 0);
    const destination = shiftClock(minutes, from.offset, to.offset);
    return { greenwich, destination };
  }, [minutes, from.offset, to.offset]);

  return (
    <div className="border-t border-graticule">
      {/* ---------------------------------------------------------- converter */}
      <div className="border-b border-graticule bg-chart/60 px-5 py-4 sm:px-6">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Time zone converter
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
          <label className="block">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-relief">When it is</span>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                aria-label="Time in the first city"
                className="w-[10rem] shrink-0 rounded-card border border-graticule bg-surface px-2 py-2 font-mono text-[0.9375rem] text-ink-strong"
                onChange={(event) => setClock(event.target.value)}
                type="time"
                value={clock}
              />
              <select
                aria-label="First city"
                className="w-full min-w-0 flex-1 basis-[8rem] truncate rounded-card border border-graticule bg-surface px-2 py-2 text-[0.9375rem] text-ink-strong"
                onChange={(event) => setFromCity(event.target.value)}
                value={from.city}
              >
                {converterCities.map((city) => (
                  <option key={`${city.city}-${city.country}`} value={city.city}>
                    {city.city} ({city.label})
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="rounded-card border border-graticule bg-surface px-3 py-2 text-center">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-muted">Greenwich</p>
            <p className="font-mono text-[1.125rem] font-semibold text-ink-strong">
              {conversion ? formatClock(conversion.greenwich.minutes) : "--:--"}
            </p>
            {conversion && dayLabel(conversion.greenwich.dayShift) ? (
              <p className="font-mono text-[0.625rem] text-ink-muted">{dayLabel(conversion.greenwich.dayShift)}</p>
            ) : null}
          </div>

          <label className="block">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-meridian">it is</span>
            <div className="mt-1 flex flex-wrap gap-2">
              <output
                aria-live="polite"
                className="w-[10rem] shrink-0 rounded-card border border-meridian/40 bg-meridian/8 px-2 py-2 font-mono text-[0.9375rem] font-semibold text-meridian"
              >
                {conversion ? formatClock(conversion.destination.minutes) : "--:--"}
              </output>
              <select
                aria-label="Second city"
                className="w-full min-w-0 flex-1 basis-[8rem] truncate rounded-card border border-graticule bg-surface px-2 py-2 text-[0.9375rem] text-ink-strong"
                onChange={(event) => setToCity(event.target.value)}
                value={to.city}
              >
                {converterCities.map((city) => (
                  <option key={`${city.city}-${city.country}`} value={city.city}>
                    {city.city} ({city.label})
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
        <p className="mt-2 text-[0.875rem]/[1.5] text-ink-muted">
          {conversion ? (
            <>
              {to.city} is <span className="font-semibold text-ink">{formatOffsetDifference(from.offset, to.offset)}</span>{" "}
              {from.city}
              {dayLabel(conversion.destination.dayShift)
                ? ` — and it is already the ${dayLabel(conversion.destination.dayShift)} there`
                : ""}
              .
            </>
          ) : (
            "Enter a time as HH:MM."
          )}
        </p>
      </div>

      {/* --------------------------------------------------------------- map */}
      <div className="px-5 py-4 sm:px-6">
        <p className="sr-only" id={headingId}>
          World map divided into hourly time zones. Select a zone to see its offset from Greenwich and example cities.
        </p>
        <div className="relative overflow-hidden rounded-card border border-graticule">
          <Image
            sizes="(min-width: 1024px) 720px, 100vw"
            alt="Blank world map in equirectangular projection, used as the base for the time-zone bands"
            className="block h-auto w-full select-none"
            height={worldBaseMap.height}
            src={worldBaseMap.src}
            width={worldBaseMap.width}
          />

          {/* the two meridians the deck names */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px bg-relief"
            style={{ left: `${longitudeLeft(0)}%` }}
          />
          {/* 180° is the edge of the map, so the line is pulled just inside it at both ends */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-0 border-l-2 border-dashed border-deep" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-0 border-l-2 border-dashed border-deep" />

          <div aria-labelledby={headingId} className="absolute inset-0 flex" role="group">
            {timeZoneBands.map((band) => (
              <ZoneBand
                band={band}
                isActive={band.offset === active.offset}
                key={band.offset}
                onSelect={() => setActiveOffset(band.offset)}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6875rem] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-3 w-px bg-relief" /> Greenwich Meridian (0°)
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-3 w-px border-l border-dashed border-deep" /> International Date Line (180°)
          </span>
        </div>

        {/* ------------------------------------------------------- zone panel */}
        <div className="mt-3 rounded-card border border-graticule bg-surface p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p aria-live="polite" className="font-display text-[1.375rem]/[1.2] font-semibold text-ink-strong">
              {active.label}
            </p>
            <p className="font-mono text-[0.75rem] text-ink-muted">
              {formatLongitude(active.from)} to {formatLongitude(active.to)}
            </p>
          </div>
          {active.cities.length > 0 ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {active.cities.map((city) => (
                <li className="rounded-card bg-chart px-3 py-2" key={`${city.city}-${city.country}`}>
                  <p className="text-[0.9375rem] font-semibold text-ink-strong">{city.city}</p>
                  <p className="text-[0.8125rem] text-ink-muted">{city.country}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[0.9375rem]/[1.55] text-ink">{active.note}</p>
          )}
          {active.offset !== 0 ? (
            <p className="mt-3 text-[0.875rem]/[1.55] text-ink-muted">
              {Math.abs(active.offset)} hour{Math.abs(active.offset) === 1 ? "" : "s"}{" "}
              {active.offset > 0 ? "ahead of" : "behind"} Greenwich — {Math.abs(active.offset) * 15}° of longitude at 15° per hour.
            </p>
          ) : (
            <p className="mt-3 text-[0.875rem]/[1.55] text-ink-muted">
              The reference zone. Every other clock on the map is set by its distance from this meridian.
            </p>
          )}
        </div>

        <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">
          * Standard time only — this tool does not account for daylight saving, which several countries
          apply for part of the year. The bands are the idealised 15° zones the course describes; real
          boundaries bend to follow national borders, and a few countries use half-hour offsets. That is
          why a city can sit outside its own band: Reykjavík lies at about 22°W but keeps GMT, and
          Kuala Lumpur at about 102°E keeps GMT+8.
        </p>
      </div>
    </div>
  );
}

function ZoneBand({
  band,
  isActive,
  onSelect,
}: {
  band: TimeZoneBand;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-current={isActive}
      className={`group relative h-full border-l border-white/25 transition-colors first:border-l-0 ${
        isActive ? "bg-meridian/35" : "bg-transparent hover:bg-meridian/20 focus-visible:bg-meridian/20"
      }`}
      onClick={onSelect}
      onFocus={onSelect}
      onMouseEnter={onSelect}
      style={{ width: `${bandWidth(band)}%` }}
      type="button"
    >
      <span className="sr-only">
        {band.label}
        {band.cities.length > 0 ? `, for example ${band.cities.map((city) => city.city).join(", ")}` : ""}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1 w-fit whitespace-nowrap rounded-sm px-1 font-mono text-[0.5rem] leading-tight text-white transition-opacity sm:text-[0.625rem] ${
          // the ±12 zones are half-width, so a centred label would be clipped at the map edge
          band.offset === 12 ? "right-0" : band.offset === -12 ? "left-0" : "inset-x-0 mx-auto"
        } ${
          isActive ? "bg-meridian opacity-100" : "bg-ink-strong/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        }`}
      >
        {band.label.replace("GMT", "")}
        {band.offset === 0 ? "0" : ""}
      </span>
    </button>
  );
}

function formatLongitude(longitude: number): string {
  if (longitude === 0) return "0°";
  const hemisphere = longitude > 0 ? "E" : "W";
  return `${Math.abs(longitude)}°${hemisphere}`;
}

export { longitudeLeft, parseClock };
