"use client";

import { useEffect, useRef } from "react";
import { reliefTexture } from "@/lib/course-brain/component-assets";
import { projectRange, type MountainRange } from "@/lib/course-brain/mountain-ranges";

/**
 * The chosen range's own country, cut out of the relief map and enlarged.
 *
 * On a world map a range one degree across is a few pixels wide, which is no way to look at
 * terrain. This crops NASA's elevation model to the range's own bounding box and draws it at a
 * size where ridges, valleys and the drop to the surrounding lowland are all visible — the same
 * data as the world map above, just close enough to read.
 *
 * The range's line is drawn over it, so it is clear which of the ridges in view is the one
 * named. Nothing here is a separate claim about where the range is: both views project the
 * same spine through the same equirectangular projection.
 */
const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 420;

/** The relief file, whose pixels are the coordinate space the crop is taken from. */
const RELIEF_WIDTH = reliefTexture.width;
const RELIEF_HEIGHT = reliefTexture.height;

export function cropFor(range: MountainRange): { lon: number; lat: number; lonSpan: number; latSpan: number } {
  const lons = range.spine.map(([lon]) => lon);
  const lats = range.spine.map(([, lat]) => lat);
  const padding = Math.max(range.width * 2, 3);

  let west = Math.min(...lons) - padding;
  let east = Math.max(...lons) + padding;
  let north = Math.max(...lats) + padding;
  let south = Math.min(...lats) - padding;

  // Match the view's shape, so the crop is not stretched: widen or heighten, never squash.
  const aspect = VIEW_WIDTH / VIEW_HEIGHT;
  let lonSpan = east - west;
  let latSpan = north - south;
  if (lonSpan / latSpan < aspect) {
    const wanted = latSpan * aspect;
    const middle = (west + east) / 2;
    west = middle - wanted / 2;
    east = middle + wanted / 2;
    lonSpan = wanted;
  } else {
    const wanted = lonSpan / aspect;
    const middle = (north + south) / 2;
    north = middle + wanted / 2;
    south = middle - wanted / 2;
    latSpan = wanted;
  }

  // A range near the edge of the map — New Zealand's, at 173°E — would otherwise be given a
  // window running off the end of the image, which draws as blank. Slide the window back
  // inside the world instead of stretching it.
  lonSpan = Math.min(lonSpan, 360);
  latSpan = Math.min(latSpan, 180);
  west = Math.min(Math.max(west, -180), 180 - lonSpan);
  north = Math.max(Math.min(north, 90), -90 + latSpan);

  return { lon: west, lat: north, lonSpan, latSpan };
}

export default function RangeCloseUp({ range }: { range: MountainRange }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reliefRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    function paint() {
      const canvas = canvasRef.current;
      const relief = reliefRef.current;
      if (!canvas || !relief) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const crop = cropFor(range);
      const [sourceX, sourceY] = projectRange(crop.lon, crop.lat, RELIEF_WIDTH, RELIEF_HEIGHT);
      const sourceWidth = (crop.lonSpan / 360) * RELIEF_WIDTH;
      const sourceHeight = (crop.latSpan / 180) * RELIEF_HEIGHT;

      context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      context.imageSmoothingQuality = "high";
      context.drawImage(relief, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      const path = new Path2D();
      range.spine.forEach(([lon, lat], index) => {
        const x = ((lon - crop.lon) / crop.lonSpan) * VIEW_WIDTH;
        const y = ((crop.lat - lat) / crop.latSpan) * VIEW_HEIGHT;
        if (index === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });

      context.lineCap = "round";
      context.lineJoin = "round";
      // A wide wash would cover the terrain this view exists to show, so the range is marked
      // with a narrow glow and a hairline down its middle.
      context.lineWidth = Math.min(Math.max(8, (range.width / crop.latSpan) * VIEW_HEIGHT), 22);
      context.strokeStyle = "rgba(255, 255, 255, 0.2)";
      context.stroke(path);
      context.lineWidth = 3;
      context.strokeStyle = "rgba(15, 40, 52, 0.55)";
      context.stroke(path);
      context.lineWidth = 1.5;
      context.strokeStyle = "rgba(255, 255, 255, 0.92)";
      context.stroke(path);
    }

    if (reliefRef.current) {
      paint();
      return;
    }
    const image = new window.Image();
    image.onload = () => {
      if (cancelled) return;
      reliefRef.current = image;
      paint();
    };
    image.src = reliefTexture.src;
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <figure className="border-t border-graticule">
      <canvas
        aria-label={`Elevation close-up of the ${range.name}, with the range picked out in white`}
        className="block h-auto w-full"
        height={VIEW_HEIGHT}
        ref={canvasRef}
        role="img"
        width={VIEW_WIDTH}
      />
      <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem]/[1.45] text-ink-muted">
        The {range.name} in close-up — NASA elevation data, tinted by height and shaded by slope.
        Green is low ground, brown is high, white is highest.
      </figcaption>
    </figure>
  );
}
