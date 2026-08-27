#!/usr/bin/env python3
"""Regroup a Köppen-Geiger climate map into the five climate types the course teaches.

The deck's own p12 map is a low-resolution raster whose legend mixes its five climate types
with a nine-part vegetation key it never reconciles, so it cannot be made clickable without
inventing which colour means what. This builds a replacement from published data instead.

Source: Beck, H.E. et al. (2023), "High-resolution (1 km) Köppen-Geiger maps for 1901-2099
based on constrained CMIP6 projections", Scientific Data 10:724, via the CC BY 4.0 map on
Wikimedia Commons. Its palette is the standard Köppen one, listed below.

The regrouping is the part that needs explaining, because Köppen's five groups are not the
course's five types:

  A (tropical)                          -> tropical
  B (arid)                              -> dry
  C (temperate) and warm-summer D       -> middle latitude
  cold-summer D, and E poleward of 55   -> high latitude
  E (polar) equatorward of 55 deg       -> highland

That last line is a documented heuristic, not data. Köppen has no highland class. The
course defines highland by elevation — "as elevation increases, temperature and vegetation
decrease, changing toward the treeline" — and a polar climate near the equator is exactly
that: ground above the treeline on a mountain. The rule therefore takes only the E classes,
which are the treeless ones, and only away from the poles: the Andes, the Himalaya and
Tibet, the Rockies, the Alps, the East African massifs.

An earlier version also swept in cold-summer D and mislabelled subarctic Mongolia and
eastern Siberia as highland. Those are genuinely subarctic, not mountain, so cold D now
always counts as high latitude.

Outputs, in the same 1920x960 space as the other maps so they can share a base:
  web/public/diagrams/ch2-climate-types-map.webp   the five classes, ocean transparent
  web/public/diagrams/ch2-climate-index.png        flat colour per type, for hit-testing
  web/public/diagrams/ch2-climate-<key>.webp       one mask per type, for the highlight

Run:  ./.venv/Scripts/python.exe scripts/build_climate_regions.py
"""
from collections import deque
import io
import json
import math
import pathlib
import sys
import urllib.request

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import commons_images as ci  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = ROOT / "web/public/diagrams/ch3-world-basemap.webp"
OUT = ROOT / "web/public/diagrams"
SOURCE_FILE = "File:Koppen-Geiger Map v2 World 1991–2020.svg"

# The rendered figure carries a legend and a caption below the map, and black margins above
# it. These bounds were found by maximising overlap between the figure's land and the base
# map's land (best IoU 0.857 at top=134, height=944 on a 1920-wide render) — re-derive them
# if the source figure is ever replaced.
RENDER_WIDTH = 1920
MAP_TOP = 134
MAP_HEIGHT = 944

# Standard Köppen-Geiger palette, class -> RGB.
KOPPEN = {
    "Af": (0, 0, 255), "Am": (0, 120, 255), "Aw": (70, 170, 250),
    "BWh": (255, 0, 0), "BWk": (255, 150, 150), "BSh": (245, 165, 0), "BSk": (255, 220, 100),
    "Csa": (255, 255, 0), "Csb": (200, 200, 0), "Csc": (150, 150, 0),
    "Cwa": (150, 255, 150), "Cwb": (100, 200, 100), "Cwc": (50, 150, 50),
    "Cfa": (200, 255, 80), "Cfb": (100, 255, 80), "Cfc": (50, 200, 0),
    "Dsa": (255, 0, 255), "Dsb": (200, 0, 200), "Dsc": (150, 50, 150), "Dsd": (150, 100, 150),
    "Dwa": (170, 175, 255), "Dwb": (90, 120, 220), "Dwc": (75, 80, 180), "Dwd": (50, 0, 135),
    "Dfa": (0, 255, 255), "Dfb": (55, 200, 255), "Dfc": (0, 125, 125), "Dfd": (0, 70, 95),
    "ET": (178, 178, 178), "EF": (102, 102, 102),
}

WARM_D = {"Dsa", "Dsb", "Dwa", "Dwb", "Dfa", "Dfb"}
COLD_D = {"Dsc", "Dsd", "Dwc", "Dwd", "Dfc", "Dfd"}

# The five types, with the colours the app draws them in (land only; ocean stays clear).
TYPES = {
    "tropical": (34, 139, 84),
    "dry": (222, 158, 54),
    "middle-latitude": (86, 148, 196),
    "high-latitude": (148, 163, 184),
    "highland": (140, 106, 168),
}

# Distinct flat colours for the hit-test index. Must match CLIMATE_INDEX_COLOURS in the app.
INDEX = {
    "tropical": (255, 0, 0),
    "dry": (0, 255, 0),
    "middle-latitude": (0, 0, 255),
    "high-latitude": (255, 255, 0),
    "highland": (255, 0, 255),
}

HIGHLAND_LATITUDE = 55.0  # treeless polar climates nearer the equator than this are mountains


def classify(klass: str, latitude: float) -> str:
    if klass.startswith("A"):
        return "tropical"
    if klass.startswith("B"):
        return "dry"
    if klass.startswith("C"):
        return "middle-latitude"
    if klass in WARM_D:
        return "middle-latitude"
    if klass in COLD_D:
        return "high-latitude"
    if klass.startswith("E"):
        return "highland" if abs(latitude) < HIGHLAND_LATITUDE else "high-latitude"
    raise SystemExit(f"unmapped Köppen class {klass}")


def nearest_class(rgb, lookup, tolerance=48):
    best, best_distance = None, tolerance * tolerance * 3
    for klass, colour in lookup.items():
        distance = sum((a - b) ** 2 for a, b in zip(rgb, colour))
        if distance < best_distance:
            best, best_distance = klass, distance
    return best


def main() -> None:
    print(f"fetching {SOURCE_FILE}")
    url = ci.thumburl(SOURCE_FILE, RENDER_WIDTH)
    data = urllib.request.urlopen(urllib.request.Request(url, headers=ci.UA), timeout=300).read()
    figure = Image.open(io.BytesIO(data)).convert("RGB")

    base = Image.open(BASE).convert("RGB")
    width, height = base.size
    climate = figure.crop((0, MAP_TOP, figure.width, MAP_TOP + MAP_HEIGHT)).resize((width, height), Image.NEAREST)
    source = climate.load()
    base_pixels = base.load()

    owner: list[str | None] = [None] * (width * height)
    counts = {key: 0.0 for key in TYPES}

    for y in range(height):
        latitude = 90.0 - (y + 0.5) / height * 180.0
        weight = math.cos(math.radians(latitude))  # equirectangular exaggerates the poles
        for x in range(width):
            rgb = source[x, y]
            if sum(rgb) < 60:  # black: ocean, or a country border drawn over land
                continue
            klass = nearest_class(rgb, KOPPEN)
            if not klass:
                continue
            key = classify(klass, latitude)
            owner[y * width + x] = key
            counts[key] += weight

    classified = sum(1 for value in owner if value)
    print(f"{classified} pixels classified from the source map")

    # Country borders are drawn in black over the land, and the two maps' coastlines differ
    # slightly. Grow the classes into any base-map land they left unclaimed, so the masks
    # cover the coastlines the app actually draws.
    land = [base_pixels[x, y][0] >= 200 for y in range(height) for x in range(width)]
    frontier = deque(i for i, value in enumerate(owner) if value)
    grown = 0
    while frontier:
        i = frontier.popleft()
        x, y = i % width, i // width
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if ny < 0 or ny >= height:
                continue
            nx %= width
            j = ny * width + nx
            if land[j] and owner[j] is None:
                owner[j] = owner[i]
                grown += 1
                frontier.append(j)
    print(f"{grown} land pixels filled in from their neighbours")

    colour_map = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    index_map = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    masks = {key: Image.new("LA", (width, height), (255, 0)) for key in TYPES}
    colour_pixels, index_pixels = colour_map.load(), index_map.load()
    mask_pixels = {key: masks[key].load() for key in TYPES}

    for y in range(height):
        for x in range(width):
            key = owner[y * width + x]
            if not key:
                continue
            colour_pixels[x, y] = (*TYPES[key], 255)
            index_pixels[x, y] = (*INDEX[key], 255)
            mask_pixels[key][x, y] = (255, 255)

    colour_map.save(OUT / "ch2-climate-types-map.webp", "WEBP", quality=90, method=6)
    index_map.save(OUT / "ch2-climate-index.png", optimize=True)
    for key, mask in masks.items():
        mask.save(OUT / f"ch2-climate-{key}.webp", "WEBP", lossless=True, quality=100)

    total = sum(counts.values())
    shares = {key: round(value / total * 100) for key, value in counts.items()}
    print("share of classified land (cosine-weighted, so the poles do not dominate):")
    for key, share in sorted(shares.items(), key=lambda item: -item[1]):
        print(f"   {key:<16} {share:>3}%")
    (OUT / "ch2-climate-shares.json").write_text(json.dumps(shares, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
