"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PRINCIPAL_PARALLELS,
  faceTowards,
  formatLatitude,
  formatLongitude,
  hemispheresOf,
  hoursFromGreenwich,
  parseCoordinate,
  project,
  unproject,
} from "@/lib/course-brain/graticule";
import { worldBaseMap } from "@/lib/course-brain/component-assets";
import { keyForPixel, type ContinentKey } from "@/lib/course-brain/continents";

/**
 * A globe you can turn, in place of the two flat pictures of one.
 *
 * The slides rule a globe with parallels on p3 and with meridians on p4, and the thing they
 * are trying to say is what a still picture cannot show: parallels stay parallel and shrink
 * toward the poles, while meridians all converge there. Turning the globe shows it happening.
 *
 * The land is the real map, re-projected. Every pixel inside the sphere is turned back into a
 * longitude and latitude and sampled from the flat base map, so coastlines are continuous and
 * the continents look like themselves — an earlier version scattered land as dots and read as
 * noise. The same projection maths draws the lines on top, so the two cannot disagree.
 *
 * A tap drops a pin, and so does typing a latitude and longitude — which also turns the globe to
 * face it. A tap and a drag are told apart by how far the pointer moved, so turning the globe
 * never drops a pin by accident. The pin reads its continent off the Chapter 2 continents index,
 * which was cut from this same base map and so lines up with it pixel for pixel.
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
const OCEAN: [number, number, number] = [206, 227, 240];
/** A press that moves less than this, in CSS pixels, is a tap rather than a turn. */
const TAP_TOLERANCE = 5;

const CONTINENT_INDEX = { src: "/diagrams/ch2-continents-index.png", width: 1920, height: 960 };

/**
 * The seven continents by the names Chapter 3's own lithosphere card gives them. The positions
 * are only where each label is written on the globe — a point well inside the landmass — not a
 * claim about a continent's centre.
 */
const CONTINENT_LABELS: { key: ContinentKey; name: string; longitude: number; latitude: number }[] = [
  { key: "north-america", name: "North America", longitude: -102, latitude: 46 },
  { key: "south-america", name: "South America", longitude: -60, latitude: -14 },
  { key: "europe", name: "Europe", longitude: 16, latitude: 51 },
  { key: "asia", name: "Asia", longitude: 90, latitude: 46 },
  { key: "africa", name: "Africa", longitude: 20, latitude: 6 },
  { key: "australia", name: "Oceania/Australia", longitude: 134, latitude: -25 },
  { key: "antarctica", name: "Antarctica", longitude: 45, latitude: -78 },
];
const CONTINENT_NAMES = new Map(CONTINENT_LABELS.map((label) => [label.key, label.name]));

type Place = { longitude: number; latitude: number };
/**
 * A pin carries the continent it landed on, looked up once when it is dropped: reading the index
 * during render would reach into a ref. `undefined` means the index had not loaded yet, which is
 * not the same as the sea (`null`) and is never reported as if it were.
 */
type Pin = Place & { continent: string | null | undefined };

export default function GlobeExplorer({ principalNames }: { principalNames: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sphereRef = useRef<HTMLCanvasElement | null>(null);
  const mapPixels = useRef<Uint8ClampedArray | null>(null);
  const continentPixels = useRef<Uint8ClampedArray | null>(null);
  const frame = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [view, setView] = useState<View>("latitude");
  const [rotation, setRotation] = useState(-10);
  const [tilt, setTilt] = useState(18);
  const [reading, setReading] = useState<Place | null>(null);
  const [pin, setPin] = useState<Pin | null>(null);
  const [latitudeText, setLatitudeText] = useState("");
  const [longitudeText, setLongitudeText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const names = principalNames.length === PRINCIPAL_PARALLELS.length ? principalNames : PRINCIPAL_PARALLELS.map((line) => line.name);
  const showParallels = view === "latitude" || view === "all";
  const showMeridians = view === "longitude" || view === "all";
  const showPrincipals = view === "principals" || view === "all" || view === "latitude";

  // Both flat maps are read into memory once; every frame samples them rather than decoding again.
  useEffect(() => {
    let cancelled = false;
    function readPixels(src: string, onRead: (pixels: Uint8ClampedArray) => void) {
      const image = new window.Image();
      image.src = src;
      image.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        onRead(context.getImageData(0, 0, canvas.width, canvas.height).data);
      };
    }
    readPixels(worldBaseMap.src, (pixels) => {
      mapPixels.current = pixels;
      setMapLoaded(true);
    });
    readPixels(CONTINENT_INDEX.src, (pixels) => {
      continentPixels.current = pixels;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Which continent a point is on; null for the sea, undefined while the index is still loading. */
  const continentAt = useCallback((place: Place): string | null | undefined => {
    const pixels = continentPixels.current;
    if (!pixels) return undefined;
    const wrapped = ((((place.longitude + 180) % 360) + 360) % 360) / 360;
    const x = Math.min(CONTINENT_INDEX.width - 1, Math.floor(wrapped * CONTINENT_INDEX.width));
    const y = Math.min(CONTINENT_INDEX.height - 1, Math.max(0, Math.floor(((90 - place.latitude) / 180) * CONTINENT_INDEX.height)));
    const index = (y * CONTINENT_INDEX.width + x) * 4;
    const key = keyForPixel(pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]);
    return key ? CONTINENT_NAMES.get(key) ?? null : null;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const scale = window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * scale) {
      canvas.width = SIZE * scale;
      canvas.height = SIZE * scale;
    }
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, SIZE, SIZE);

    // --- the sphere, built a pixel at a time by unprojecting each one onto the flat map ---
    let sphere = sphereRef.current;
    if (!sphere) {
      sphere = document.createElement("canvas");
      sphere.width = RADIUS * 2;
      sphere.height = RADIUS * 2;
      sphereRef.current = sphere;
    }
    const sphereContext = sphere.getContext("2d");
    const source = mapPixels.current;
    if (sphereContext) {
      const image = sphereContext.createImageData(RADIUS * 2, RADIUS * 2);
      const out = image.data;
      const tiltRadians = (-tilt * Math.PI) / 180;
      const cosTilt = Math.cos(tiltRadians);
      const sinTilt = Math.sin(tiltRadians);
      const mapWidth = worldBaseMap.width;
      const mapHeight = worldBaseMap.height;

      for (let py = 0; py < RADIUS * 2; py += 1) {
        const ny = -(py - RADIUS + 0.5) / RADIUS;
        for (let px = 0; px < RADIUS * 2; px += 1) {
          const nx = (px - RADIUS + 0.5) / RADIUS;
          const squared = nx * nx + ny * ny;
          if (squared > 1) continue; // outside the globe: left transparent
          const offset = (py * RADIUS * 2 + px) * 4;

          const nz = Math.sqrt(1 - squared);
          const y2 = ny * cosTilt - nz * sinTilt;
          const z2 = ny * sinTilt + nz * cosTilt;
          const latitude = (Math.asin(y2 < -1 ? -1 : y2 > 1 ? 1 : y2) * 180) / Math.PI;
          const longitude = (Math.atan2(nx, z2) * 180) / Math.PI - rotation;

          let red = OCEAN[0];
          let green = OCEAN[1];
          let blue = OCEAN[2];
          if (source) {
            const wrapped = ((((longitude + 180) % 360) + 360) % 360) / 360;
            const sx = Math.min(mapWidth - 1, (wrapped * mapWidth) | 0);
            const sy = Math.min(mapHeight - 1, (((90 - latitude) / 180) * mapHeight) | 0);
            const index = (sy * mapWidth + sx) * 4;
            red = source[index];
            green = source[index + 1];
            blue = source[index + 2];
          }

          // a little shading toward the limb, so it reads as a ball rather than a disc
          const shade = 1 - 0.35 * squared * squared;
          out[offset] = red * shade;
          out[offset + 1] = green * shade;
          out[offset + 2] = blue * shade;
          out[offset + 3] = 255;
        }
      }
      sphereContext.putImageData(image, 0, 0);
      context.drawImage(sphere, SIZE / 2 - RADIUS, SIZE / 2 - RADIUS);
    }

    context.save();
    context.translate(SIZE / 2, SIZE / 2);
    context.beginPath();
    context.arc(0, 0, RADIUS, 0, Math.PI * 2);
    context.strokeStyle = "#93a7b5";
    context.lineWidth = 1;
    context.stroke();

    const pen = context;
    function stroke(points: { x: number; y: number; visible: boolean }[], colour: string, width: number, dashed = false) {
      pen.save();
      pen.strokeStyle = colour;
      pen.lineWidth = width;
      pen.setLineDash(dashed ? [5, 5] : []);
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

    function parallelAt(latitude: number) {
      const points = [];
      for (let longitude = -180; longitude <= 180; longitude += 3) {
        points.push(project(longitude, latitude, rotation, tilt, RADIUS));
      }
      return points;
    }

    if (showParallels) {
      for (let latitude = -75; latitude <= 75; latitude += 15) {
        if (showPrincipals && PRINCIPAL_PARALLELS.some((line) => Math.abs(line.latitude - latitude) < 0.6)) continue;
        stroke(parallelAt(latitude), "rgba(24,58,79,0.45)", 1);
      }
    }

    if (showMeridians) {
      for (let longitude = -180; longitude < 180; longitude += 15) {
        const points = [];
        for (let latitude = -90; latitude <= 90; latitude += 3) {
          points.push(project(longitude, latitude, rotation, tilt, RADIUS));
        }
        const isPrime = longitude === 0;
        stroke(points, isPrime ? "#b45309" : "rgba(24,58,79,0.45)", isPrime ? 3 : 1);
      }
    }

    if (showPrincipals) {
      for (const line of PRINCIPAL_PARALLELS) {
        const isEquator = line.latitude === 0;
        stroke(parallelAt(line.latitude), isEquator ? "#0f766e" : "#1d4ed8", isEquator ? 3 : 2.5, !isEquator);
      }
    }

    // --- continent names, written on the near side only, and not so close to the rim that
    //     the curve would cut them off ---
    context.font = "600 12px system-ui, -apple-system, 'Segoe UI', sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.lineJoin = "round";
    for (const label of CONTINENT_LABELS) {
      const point = project(label.longitude, label.latitude, rotation, tilt, RADIUS);
      if (!point.visible || Math.hypot(point.x, point.y) > RADIUS * 0.9) continue;
      context.lineWidth = 3.5;
      context.strokeStyle = "rgba(255,255,255,0.92)";
      context.strokeText(label.name, point.x, point.y);
      context.fillStyle = "#0b3d4f";
      context.fillText(label.name, point.x, point.y);
    }

    // --- the pin ---
    if (pin) {
      const point = project(pin.longitude, pin.latitude, rotation, tilt, RADIUS);
      if (point.visible) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(point.x - 6, point.y - 14);
        context.arc(point.x, point.y - 18, 7.2, Math.PI * 0.78, Math.PI * 0.22);
        context.closePath();
        context.fillStyle = "#dc2626";
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "#ffffff";
        context.stroke();
        context.beginPath();
        context.arc(point.x, point.y - 18, 2.6, 0, Math.PI * 2);
        context.fillStyle = "#ffffff";
        context.fill();
      }
    }

    context.restore();
  }, [pin, rotation, showMeridians, showParallels, showPrincipals, tilt]);

  // One draw per animation frame, however many pointer events arrive in between.
  useEffect(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      draw();
    });
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [draw, mapLoaded]);

  function placeUnder(event: React.PointerEvent<HTMLCanvasElement>): Place | null {
    const bounds = event.currentTarget.getBoundingClientRect();
    const scale = SIZE / bounds.width;
    const x = (event.clientX - bounds.left) * scale - SIZE / 2;
    const y = (event.clientY - bounds.top) * scale - SIZE / 2;
    return unproject(x, y, rotation, tilt, RADIUS);
  }

  function endDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    // Releasing a capture the browser has already dropped — a cancelled touch, for one — throws.
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // the capture is gone either way; nothing to undo
    }
    drag.current = null;
  }

  function onPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const start = pressStart.current;
    pressStart.current = null;
    endDrag(event);
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_TOLERANCE) return;
    const place = placeUnder(event);
    if (!place) return;
    setPin({ ...place, continent: continentAt(place) });
    setInputError(null);
  }

  function onPointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const active = drag.current;
    if (active && active.pointerId === event.pointerId) {
      /**
       * The deltas are worked out HERE, not inside the state updaters. An updater runs later —
       * after a pointerup may have cleared this ref, and twice over in development — so reading
       * the ref from inside one threw mid-spin and took the globe down with it.
       */
      const deltaX = event.clientX - active.x;
      const deltaY = event.clientY - active.y;
      drag.current = { x: event.clientX, y: event.clientY, pointerId: active.pointerId };
      setRotation((current) => current + deltaX * 0.4);
      setTilt((current) => Math.max(-80, Math.min(80, current + deltaY * -0.3)));
      return;
    }
    setReading(placeUnder(event));
  }

  function pinFromInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const latitude = parseCoordinate(latitudeText, "latitude");
    const longitude = parseCoordinate(longitudeText, "longitude");
    if (latitude === null || longitude === null) {
      setInputError(
        latitude === null
          ? "Latitude must be between 90°S and 90°N — for example 3.1, -33.9 or 33.9 S."
          : "Longitude must be between 180°W and 180°E — for example 101.7, -74.1 or 74.1 W.",
      );
      return;
    }
    const place = { latitude, longitude };
    const facing = faceTowards(longitude, latitude);
    setPin({ ...place, continent: continentAt(place) });
    setRotation(facing.rotation);
    setTilt(facing.tilt);
    setInputError(null);
  }

  function principalNear(place: Place) {
    return PRINCIPAL_PARALLELS.map((line, index) => ({ line, name: names[index] ?? line.name })).find(
      ({ line }) => Math.abs(line.latitude - place.latitude) < 4,
    );
  }

  const nearestPrincipal = reading ? principalNear(reading) : undefined;
  const pinPrincipal = pin ? principalNear(pin) : undefined;
  const pinOnFarSide = pin ? !project(pin.longitude, pin.latitude, rotation, tilt, RADIUS).visible : false;

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

      <form
        aria-label="Pin a place by its coordinates"
        className="mt-3 flex flex-wrap items-end gap-2 rounded-card border border-graticule bg-chart/60 p-3"
        onSubmit={pinFromInput}
      >
        <label className="flex flex-col gap-1 text-[0.8125rem] font-medium text-ink-strong">
          Latitude
          <input
            className="w-36 rounded-card border border-graticule bg-surface px-2.5 py-1.5 font-mono text-[0.875rem] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            inputMode="decimal"
            onChange={(event) => setLatitudeText(event.target.value)}
            placeholder="3.1 or 3.1 N"
            value={latitudeText}
          />
        </label>
        <label className="flex flex-col gap-1 text-[0.8125rem] font-medium text-ink-strong">
          Longitude
          <input
            className="w-36 rounded-card border border-graticule bg-surface px-2.5 py-1.5 font-mono text-[0.875rem] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            inputMode="decimal"
            onChange={(event) => setLongitudeText(event.target.value)}
            placeholder="101.7 or 101.7 E"
            value={longitudeText}
          />
        </label>
        <button
          className="min-h-9 rounded-card bg-meridian px-4 py-1.5 text-[0.875rem] font-semibold text-white transition-colors hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          type="submit"
        >
          Pin it
        </button>
        <p className="w-full text-[0.75rem]/[1.45] text-ink-muted">
          Or tap anywhere on the globe. A minus sign means south or west.
        </p>
        {inputError ? (
          <p className="w-full text-[0.8125rem] text-danger" role="alert">
            {inputError}
          </p>
        ) : null}
      </form>

      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <canvas
          aria-label="A globe showing the continents and lines of latitude and longitude. Drag to turn it; tap to drop a pin."
          className="w-full max-w-[460px] cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
          height={SIZE}
          onPointerCancel={(event) => {
            pressStart.current = null;
            endDrag(event);
          }}
          onPointerDown={(event) => {
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // capture is an optimisation; the drag still works without it
            }
            drag.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
            pressStart.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerLeave={() => setReading(null)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          ref={canvasRef}
          role="img"
          style={{ aspectRatio: "1 / 1" }}
          width={SIZE}
        />

        <div className="w-full flex-1 space-y-3">
          {pin ? (
            <div aria-live="polite" className="rounded-card border border-danger/40 bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-danger">Pinned</p>
                <button
                  className="rounded-card border border-graticule px-2 py-0.5 text-[0.75rem] text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  onClick={() => setPin(null)}
                  type="button"
                >
                  Clear pin
                </button>
              </div>
              <p className="mt-1 font-display text-[1.25rem]/[1.25] font-semibold text-ink-strong">
                {formatLatitude(pin.latitude, true)}, {formatLongitude(pin.longitude)}
              </p>
              <p className="mt-2 text-[0.9375rem]/[1.5] text-ink">
                {pin.continent ? (
                  <>
                    In <span className="font-semibold">{pin.continent}</span>
                    {" · "}
                  </>
                ) : pin.continent === null ? (
                  "In the sea, not on a continent · "
                ) : null}
                {hemispheresOf(pin.longitude, pin.latitude)}
              </p>
              {pinPrincipal ? (
                <p className="mt-1 text-[0.9375rem]/[1.5] text-ink">
                  Close to <span className="font-semibold">{pinPrincipal.name}</span>
                </p>
              ) : null}
              <p className="mt-2 text-[0.875rem]/[1.5] text-ink-muted">
                Its meridian keeps {hoursFromGreenwich(pin.longitude)} — 15° of longitude for every hour.
              </p>
              {pinOnFarSide ? (
                <p className="mt-2 text-[0.8125rem]/[1.5] text-ink-muted">
                  The pin is on the far side of the globe. Turn it round to see it.
                </p>
              ) : null}
            </div>
          ) : null}

          <div aria-live="polite" className="rounded-card border border-graticule bg-surface p-4">
            {reading ? (
              <>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Under the pointer</p>
                <p className="mt-1 font-display text-[1.25rem]/[1.25] font-semibold text-ink-strong">
                  {formatLatitude(reading.latitude, true)}, {formatLongitude(reading.longitude)}
                </p>
                {nearestPrincipal ? (
                  <p className="mt-2 text-[0.9375rem]/[1.5] text-ink">
                    On <span className="font-semibold">{nearestPrincipal.name}</span>
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
                  pole to pole and meets the others there. Tap to drop a pin.
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
        principal lines without numbering them, so their latitudes are added. The continent names are the ones the
        course&apos;s lithosphere card uses; where each is written on the globe is only a label position. The globe is
        drawn by re-projecting the flat map rather than photographed, which is why it can be turned.
      </p>
    </div>
  );
}
