#!/usr/bin/env python3
"""Derive per-continent hover regions from the CC0 equirectangular base map.

The Chapter 2 "seven continents" figure in the deck is a flat raster, so it cannot
answer "which continent is my cursor over". This script produces the two assets the
interactive version needs, both regenerable from the same base map:

  web/public/diagrams/ch2-continents-index.png   one flat colour per continent, used
                                                 for pixel hit-testing on a canvas
  web/public/diagrams/ch2-continent-<key>.webp   one white-on-transparent mask per
                                                 continent, used as a CSS mask so the
                                                 highlight follows the real coastline

Nothing here is traced by hand. Land is flood-filled from a seed inside each continent,
so every highlight follows the coastline exactly. Two kinds of judgement are encoded and
should be understood before changing them:

1. **Cut lines.** Continents that share land have to be separated somewhere, or the fill
   leaks. The cuts are the conventional ones — Suez between Africa and Asia, Panama
   between the Americas, and the Ural/Caspian/Caucasus/Bosphorus line between Europe and
   Asia. The course deck does not define these; they are the standard convention, applied
   here so that the map can respond at all.
2. **Island assignment.** A flood fill only reaches connected land, so Japan, the British
   Isles, Madagascar and several hundred smaller islands would belong to nothing. Each
   leftover landmass is assigned to whichever continent it lies closest to. This is right
   almost everywhere and arguable in the Pacific; the tool never states an island's
   continent in words, so the consequence is limited to which shape lights up.

Run:  ./.venv/Scripts/python.exe scripts/build_continent_regions.py
"""
from collections import deque
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = ROOT / "web/public/diagrams/ch3-world-basemap.webp"
OUT = ROOT / "web/public/diagrams"

# Seed points, in degrees (longitude, latitude), each well inside its continent.
SEEDS = {
    "asia": (100.0, 45.0),
    "africa": (20.0, 5.0),
    "north-america": (-100.0, 45.0),
    "south-america": (-60.0, -10.0),
    "europe": (15.0, 50.0),
    "antarctica": (0.0, -80.0),
    "australia": (134.0, -25.0),
}

# Distinct flat colours for the hit-test index image. Values are arbitrary but must stay
# in step with CONTINENT_INDEX_COLOURS in the component.
COLOURS = {
    "asia": (255, 0, 0),
    "africa": (0, 255, 0),
    "north-america": (0, 0, 255),
    "south-america": (255, 255, 0),
    "europe": (255, 0, 255),
    "antarctica": (0, 255, 255),
    "australia": (255, 128, 0),
}

# Conventional dividing lines, as polylines in (longitude, latitude).
CUTS = [
    # Suez: Africa | Asia
    [(32.3, 31.3), (32.6, 29.9), (34.0, 28.0)],
    # Panama: North America | South America
    [(-77.4, 9.6), (-78.2, 8.6), (-78.9, 7.6)],
    # Ural mountains, Ural river, Caspian, Caucasus, Black Sea, Bosphorus: Europe | Asia
    [
        (66.0, 69.0), (60.0, 64.0), (59.5, 56.0), (57.5, 51.5), (52.0, 47.5),
        (48.5, 46.5), (47.5, 43.5), (44.0, 42.5), (40.0, 43.2), (35.0, 43.5),
        (29.2, 41.2), (26.5, 39.5), (26.0, 36.0),
    ],
]

LAND_RED_MIN = 200  # ocean is (166, 206, 227); land is (250, 243, 227)
CUT_WIDTH = 5

# Where "nearest continent" gives the wrong answer, name the box and the right one.
# (min lon, max lon, min lat, max lat) -> continent key, matched against island centroids.
ISLAND_OVERRIDES = [
    # Sulawesi, the Moluccas and the Lesser Sundas are Indonesian and belong with Asia;
    # they fall closer to Australia. New Guinea (from about 131 E) is deliberately left
    # with Australia, the continent the deck also calls Oceania.
    (117.0, 131.0, -11.5, 6.0, "asia"),
]


def to_pixel(lon: float, lat: float, width: int, height: int) -> tuple[int, int]:
    return (round((lon + 180.0) / 360.0 * width), round((90.0 - lat) / 180.0 * height))


def main() -> None:
    image = Image.open(BASE).convert("RGB")
    width, height = image.size
    pixels = image.load()

    land = bytearray(width * height)
    for y in range(height):
        row = y * width
        for x in range(width):
            land[row + x] = 1 if pixels[x, y][0] >= LAND_RED_MIN else 0

    # Carve the conventional divides into the land mask so the fills cannot leak across.
    cuts = Image.new("1", (width, height), 0)
    pen = ImageDraw.Draw(cuts)
    for polyline in CUTS:
        pen.line([to_pixel(lon, lat, width, height) for lon, lat in polyline], fill=1, width=CUT_WIDTH)
    cut_pixels = cuts.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if cut_pixels[x, y]:
                land[row + x] = 0

    owner = [-1] * (width * height)
    keys = list(SEEDS)

    def fill(start: tuple[int, int], index: int) -> int:
        sx, sy = start
        if not land[sy * width + sx]:
            raise SystemExit(f"seed for {keys[index]} is not on land at pixel {start}")
        queue = deque([(sx, sy)])
        owner[sy * width + sx] = index
        count = 0
        while queue:
            x, y = queue.popleft()
            count += 1
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if ny < 0 or ny >= height:
                    continue
                nx %= width  # the map wraps at the date line
                offset = ny * width + nx
                if land[offset] and owner[offset] == -1:
                    owner[offset] = index
                    queue.append((nx, ny))
        return count

    for index, key in enumerate(keys):
        size = fill(to_pixel(*SEEDS[key], width, height), index)
        print(f"{key:<15} {size:>8} px from mainland fill")

    # Everything still unclaimed is an island. Label each one, then give it to the nearest
    # continent — measured to actual continent pixels, sampled for speed.
    samples: list[list[tuple[int, int]]] = [[] for _ in keys]
    for y in range(0, height, 3):
        row = y * width
        for x in range(0, width, 3):
            index = owner[row + x]
            if index >= 0:
                samples[index].append((x, y))

    islands = 0
    island_pixels = 0
    overrides = 0
    for y in range(height):
        row = y * width
        for x in range(width):
            if not land[row + x] or owner[row + x] != -1:
                continue
            component = []
            queue = deque([(x, y)])
            owner[row + x] = -2
            while queue:
                cx, cy = queue.popleft()
                component.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if ny < 0 or ny >= height:
                        continue
                    nx %= width
                    offset = ny * width + nx
                    if land[offset] and owner[offset] == -1:
                        owner[offset] = -2
                        queue.append((nx, ny))

            cx = sum(p[0] for p in component) / len(component)
            cy = sum(p[1] for p in component) / len(component)
            lon = cx / width * 360.0 - 180.0
            lat = 90.0 - cy / height * 180.0

            best = None
            for min_lon, max_lon, min_lat, max_lat, key in ISLAND_OVERRIDES:
                if min_lon <= lon <= max_lon and min_lat <= lat <= max_lat:
                    best = keys.index(key)
                    overrides += len(component)
                    break

            if best is None:
                best, best_distance = 0, float("inf")
                for index, points in enumerate(samples):
                    for px, py in points:
                        dx = abs(px - cx)
                        dx = min(dx, width - dx)  # shortest way round the globe
                        distance = dx * dx + (py - cy) ** 2
                        if distance < best_distance:
                            best_distance, best = distance, index
            for px, py in component:
                owner[py * width + px] = best
            islands += 1
            island_pixels += len(component)

    print(f"{islands} island groups ({island_pixels} px) assigned by proximity, {overrides} px by explicit override")

    index_image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    index_pixels = index_image.load()
    masks = {key: Image.new("LA", (width, height), (255, 0)) for key in keys}
    mask_pixels = {key: masks[key].load() for key in keys}

    for y in range(height):
        row = y * width
        for x in range(width):
            index = owner[row + x]
            if index < 0:
                continue
            key = keys[index]
            index_pixels[x, y] = (*COLOURS[key], 255)
            mask_pixels[key][x, y] = (255, 255)

    index_image.save(OUT / "ch2-continents-index.png", optimize=True)
    for key, mask in masks.items():
        mask.save(OUT / f"ch2-continent-{key}.webp", "WEBP", lossless=True, quality=100)

    total = sum(1 for value in owner if value >= 0)
    print(f"index + {len(masks)} masks written; {total} land pixels claimed of {sum(land)}")


if __name__ == "__main__":
    main()
