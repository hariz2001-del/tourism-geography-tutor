"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LAND_DOTS } from "@/lib/course-brain/land-dots";
import {
  PRINCIPAL_PARALLELS,
  formatLatitude,
  formatLongitude,
  hoursFromGreenwich,
  project,
  unproject,
} from "@/lib/course-brain/graticule";

/**
 * A globe you can turn, in place of the two flat pictures of one.
 *
 * The slides rule a globe with parallels on p3 and with meridians on p4, and the thing they
 * are trying to say is what a still picture cannot show: parallels stay parallel and shrink
 * toward the poles, while meridians all converge there. Turning the globe shows it happening.
 *
 * Drawn on a canvas from an orthographic projection — no map library, no globe image. The
 * land is a coarse grid of points sampled from the base map, which is enough to keep the
 * continents recognisable while the globe moves.
 */
type View = "latitude" | "longitude" | "principals" | "all";

const VIEWS: { key: View; label: string; hint: string }[] = [
  { key: "latitude", label: "Latitude", hint: "Parallels only" },
  { key: "longitude", label: "Longitude", hint: "Meridians only" },
  { key: "principals", label: "Principal lines", hint: "The five named parallels" },
  { key: "all", label: "All", hint: "Everything at once" },
];

const SIZE = 460;
const RADIUS = 196;

export default function GlobeExplorer({ principalNames }: { principalNames: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [view, setView] = useState<View>("latitude");
  const [rotation, setRotation] = useState(-10);
  const [tilt, setTilt] = useState(18);
  const [reading, setReading] = useState<{ longitude: number; latitude: number } | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const names = principalNames.length === PRINCIPAL_PARALLELS.length ? principalNames : PRINCIPAL_PARALLELS.map((line) => line.name);
  const showParallels = view === "latitude" || view === "all";
  const showMeridians = view === "longitude" || view === "all";
  const showPrincipals = view === "principals" || view === "all" || view === "latitude";

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const scale = window.devicePixelRatio || 1;
    canvas.width = SIZE * scale;
    canvas.height = SIZE * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, SIZE, SIZE);
    context.save();
    context.translate(SIZE / 2, SIZE / 2);

    // the sphere
    context.beginPath();
    context.arc(0, 0, RADIUS, 0, Math.PI * 2);
    context.fillStyle = "#e3eef6";
    context.fill();
    context.strokeStyle = "#b7c7d4";
    context.lineWidth = 1;
    context.stroke();

    // land, as points
    context.fillStyle = "#a8b89a";
    for (let i = 0; i < LAND_DOTS.length; i += 2) {
      const point = project(LAND_DOTS[i], LAND_DOTS[i + 1], rotation, tilt, RADIUS);
      if (!point.visible) continue;
      context.fillRect(point.x - 1.6, point.y - 1.6, 3.2, 3.2);
    }

    const pen = context;
    function stroke(points: { x: number; y: number; visible: boolean }[], colour: string, width: number, dashed = false) {
      pen.save();
      pen.strokeStyle = colour;
      pen.lineWidth = width;
      pen.setLineDash(dashed ? [4, 4] : []);
      pen.beginPath();
      let drawing = false;
      for (const point of points) {
        if (!point.visible) {
          drawing = false;
          continue;
        }
        if (drawing) pen.lineTo(point.x, point.y);
        else pen.moveTo(point.x, point.y);
        drawing = true;
      }
      pen.stroke();
      pen.restore();
    }

    if (showParallels) {
      for (let latitude = -75; latitude <= 75; latitude += 15) {
        if (showPrincipals && PRINCIPAL_PARALLELS.some((line) => Math.abs(line.latitude - latitude) < 0.6)) continue;
        const points = [];
        for (let longitude = -180; longitude <= 180; longitude += 3) {
          points.push(project(longitude, latitude, rotation, tilt, RADIUS));
        }
        stroke(points, "#8ba3b5", 1);
      }
    }

    if (showMeridians) {
      for (let longitude = -180; longitude < 180; longitude += 15) {
        const points = [];
        for (let latitude = -90; latitude <= 90; latitude += 3) {
          points.push(project(longitude, latitude, rotation, tilt, RADIUS));
        }
        const isPrime = longitude === 0;
        stroke(points, isPrime ? "#b45309" : "#8ba3b5", isPrime ? 2.5 : 1);
      }
    }

    if (showPrincipals) {
      for (const line of PRINCIPAL_PARALLELS) {
        const points = [];
        for (let longitude = -180; longitude <= 180; longitude += 3) {
          points.push(project(longitude, line.latitude, rotation, tilt, RADIUS));
        }
        stroke(points, line.latitude === 0 ? "#0f766e" : "#2563a8", line.latitude === 0 ? 2.5 : 2, line.latitude !== 0);
      }
    }

    context.restore();
  }, [rotation, showMeridians, showParallels, showPrincipals, tilt]);

  useEffect(() => {
    draw();
  }, [draw]);

  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = SIZE / bounds.width;
    return {
      x: (event.clientX - bounds.left) * scale - SIZE / 2,
      y: (event.clientY - bounds.top) * scale - SIZE / 2,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (drag.current) {
      setRotation((current) => current + (event.clientX - drag.current!.x) * 0.4);
      setTilt((current) => Math.max(-80, Math.min(80, current + (event.clientY - drag.current!.y) * -0.3)));
      drag.current = { x: event.clientX, y: event.clientY };
      return;
    }
    const { x, y } = pointerPosition(event);
    setReading(unproject(x, y, rotation, tilt, RADIUS));
  }

  const nearestPrincipal = reading
    ? PRINCIPAL_PARALLELS.map((line, index) => ({ line, name: names[index] ?? line.name }))
        .find(({ line }) => Math.abs(line.latitude - reading.latitude) < 4)
    : undefined;

  return (
    <div className="border-t border-graticule px-5 py-4 sm:px-6">
      <div aria-label="Choose what the globe shows" className="flex flex-wrap gap-1.5" role="group">
        {VIEWS.map((option) => (
          <button
            aria-pressed={view === option.key}
            className={`min-h-11 rounded-full border px-3 py-1.5 text-[0.875rem] transition-colors ${
              view === option.key
                ? "border-meridian bg-meridian text-white"
                : "border-graticule bg-surface text-ink hover:border-meridian hover:text-meridian"
            }`}
            key={option.key}
            onClick={() => setView(option.key)}
            title={option.hint}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <canvas
          aria-label="A globe showing lines of latitude and longitude. Drag to turn it."
          className="w-full max-w-[460px] cursor-grab touch-none rounded-full active:cursor-grabbing"
          height={SIZE}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerLeave={() => setReading(null)}
          onPointerMove={onPointerMove}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            drag.current = null;
          }}
          ref={canvasRef}
          role="img"
          style={{ aspectRatio: "1 / 1" }}
          width={SIZE}
        />

        <div className="w-full flex-1 space-y-3">
          <div className="rounded-card border border-graticule bg-surface p-4" aria-live="polite">
            {reading ? (
              <>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Under the pointer</p>
                <p className="mt-1 font-display text-[1.25rem]/[1.25] font-semibold text-ink-strong">
                  {formatLatitude(reading.latitude, true)}, {formatLongitude(reading.longitude)}
                </p>
                {nearestPrincipal ? (
                  <p className="mt-2 text-[0.9375rem]/[1.5] text-ink">
                    On <span className="font-semibold">{nearestPrincipal.name}</span>
                    {nearestPrincipal.line.latitudeIsAdded ? (
                      <>
                        {" "}
                        <span className="rounded-sm bg-relief/12 px-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-relief">
                          {formatLatitude(nearestPrincipal.line.latitude)} added
                        </span>
                      </>
                    ) : null}
                  </p>
                ) : null}
                <p className="mt-2 text-[0.875rem]/[1.5] text-ink-muted">
                  That meridian keeps {hoursFromGreenwich(reading.longitude)} — 15° of longitude for every hour.
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Turn the globe</p>
                <p className="mt-1 text-[0.9375rem]/[1.55] text-ink">
                  Drag it. Watch the parallels stay parallel and shrink toward the poles, while every meridian runs
                  pole to pole and meets the others there.
                </p>
              </>
            )}
          </div>

          {showPrincipals ? (
            <>
            <p className="flex items-baseline justify-between gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">
              The five principal lines
              <span className="rounded-sm bg-relief/12 px-1 text-[0.625rem] tracking-[0.08em] text-relief">latitudes added</span>
            </p>
            <ul className="grid gap-1.5">
              {PRINCIPAL_PARALLELS.map((line, index) => (
                <li className="flex items-baseline justify-between gap-3 rounded-card bg-chart px-3 py-1.5" key={line.key}>
                  <span className="text-[0.9375rem] text-ink-strong">{names[index] ?? line.name}</span>
                  <span className="font-mono text-[0.75rem] text-ink-muted">{formatLatitude(line.latitude)}</span>
                </li>
              ))}
            </ul>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">
        * The five names, their order and the 15°-per-hour rule are the course&apos;s own. The slide names the
        principal lines without numbering them, so their latitudes are added. The globe is drawn from an
        orthographic projection rather than photographed, which is why it can be turned.
      </p>
    </div>
  );
}
