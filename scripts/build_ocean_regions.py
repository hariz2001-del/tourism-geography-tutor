#!/usr/bin/env python3
"""Derive per-ocean hover regions from the CC0 equirectangular base map.

The mirror of scripts/build_continent_regions.py, and harder for one reason: there is
really only one ocean. Land separates the continents for you; the seas are continuous, so
every boundary between the five named oceans is a human convention drawn across open
water. The lines below follow the usual ones — the IHO limits as they are normally taught:

  * Southern Ocean: everything south of 60 S, the 2000 IHO definition.
  * Atlantic | Indian: the meridian of Cape Agulhas, 20 E.
  * Indian | Pacific: the meridian of South East Cape, Tasmania, 147 E, and the straits
    through the Indonesian archipelago.
  * Atlantic | Pacific: Drake Passage at about 67 W (the Panama isthmus does the rest).
  * Arctic | Atlantic: the Bering Strait, the Davis Strait, and the line from Greenland
    past Jan Mayen to the Norwegian coast.

None of this is in the course deck, which simply names five oceans. It is written down
here so that a reader can see exactly which conventions the highlights encode, and change
them in one place.

Outputs, same shape as the continent build:
  web/public/diagrams/ch2-oceans-index.png      flat colour per ocean, for hit-testing
  web/public/diagrams/ch2-ocean-<key>.webp      one mask per ocean, for the highlight

Run:  ./.venv/Scripts/python.exe scripts/build_ocean_regions.py
"""
from collections import deque
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = ROOT / "web/public/diagrams/ch3-world-basemap.webp"
OUT = ROOT / "web/public/diagrams"

SEEDS = {
    "pacific": (-150.0, 0.0),
    "atlantic": (-30.0, 10.0),
    "indian": (75.0, -20.0),
    "southern": (0.0, -65.0),
    "arctic": (0.0, 88.0),
}

COLOURS = {
    "pacific": (255, 0, 0),
    "atlantic": (0, 255, 0),
    "indian": (0, 0, 255),
    "southern": (255, 255, 0),
    "arctic": (255, 0, 255),
}

CUTS = [
    # Every cut must START AND END INSIDE LAND (or inside another cut). A line that stops
    # short of the coast leaves a gap, and one gap is all a flood fill needs: the first
    # attempt here ran the Drake Passage cut from Cape Horn's latitude southward and the
    # Pacific promptly reached the Atlantic through the open water just north of it.
    # Overshooting into land costs nothing, since land pixels are excluded anyway.

    # Southern Ocean: the 60 S parallel, right round the globe
    [(-180.0, -60.0), (-90.0, -60.0), (0.0, -60.0), (90.0, -60.0), (180.0, -60.0)],
    # Atlantic | Indian: the meridian of Cape Agulhas, 20 E, from inside Africa southward
    [(20.0, -28.0), (20.0, -60.0)],
    # Indian | Pacific: 147 E from inside mainland Australia, across Bass Strait and
    # Tasmania, down to the Southern Ocean
    [(146.9, -30.0), (146.9, -60.0)],
    # Indian | Pacific through the archipelago. The Strait of Malacca is its own short cut;
    # the rest is ONE continuous line running along the island chain from the Sunda Strait,
    # over Java, Bali and the Lesser Sundas, across the Arafura Sea below New Guinea and out
    # through the Torres Strait. Continuity is the whole trick — every gap between two
    # islands is a strait, and the Indian Ocean found each one that was left open. Drawing
    # the line over the islands themselves costs nothing, since land is excluded anyway.
    # The eastern end must finish INSIDE Cape York, not out in the Coral Sea: a dangling
    # end is not a barrier, and the fill simply walked around it.
    # This also puts the internal Indonesian seas on the Pacific side, as the IHO does.
    [(101.5, 6.5), (97.5, 1.0)],
    [
        (105.5, -5.5), (104.5, -7.5), (110.0, -8.4), (114.5, -8.9), (116.5, -8.9),
        (119.0, -9.2), (121.0, -9.6), (124.0, -9.6), (127.5, -9.5), (132.0, -8.5),
        (137.0, -8.5), (141.0, -9.3), (143.6, -9.3), (143.2, -11.0), (142.5, -13.0),
    ],
    # Atlantic | Pacific: Drake Passage, from inside Tierra del Fuego to the Southern Ocean
    [(-67.3, -52.0), (-67.3, -60.0)],
    # Arctic | Pacific: straight across the Bering Strait, ends buried in Chukotka and in
    # the Seward Peninsula. A diagonal here misses: it crosses the strait's latitude east of
    # the strait itself and leaves the water open.
    [(-174.0, 65.6), (-163.0, 65.6)],
    # Arctic | Atlantic: Davis Strait, then Greenland - Jan Mayen - Norway, each end on land
    [(-82.0, 76.0), (-72.0, 73.0), (-61.0, 66.6), (-50.0, 66.0)],
    [(-30.0, 69.0), (-8.0, 71.0), (5.0, 71.0), (18.0, 70.5), (33.0, 68.0)],
]

OCEAN_RED_MAX = 199  # ocean is (166, 206, 227); land is (250, 243, 227)
CUT_WIDTH = 5


def to_pixel(lon: float, lat: float, width: int, height: int) -> tuple[int, int]:
    return (round((lon + 180.0) / 360.0 * width), round((90.0 - lat) / 180.0 * height))


def main() -> None:
    image = Image.open(BASE).convert("RGB")
    width, height = image.size
    pixels = image.load()

    water = bytearray(width * height)
    for y in range(height):
        row = y * width
        for x in range(width):
            water[row + x] = 1 if pixels[x, y][0] <= OCEAN_RED_MAX else 0

    cuts = Image.new("1", (width, height), 0)
    pen = ImageDraw.Draw(cuts)
    for polyline in CUTS:
        pen.line([to_pixel(lon, lat, width, height) for lon, lat in polyline], fill=1, width=CUT_WIDTH)
    cut_pixels = cuts.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if cut_pixels[x, y]:
                water[row + x] = 0

    owner = [-1] * (width * height)
    keys = list(SEEDS)

    def fill(start: tuple[int, int], index: int) -> int:
        sx, sy = start
        if not water[sy * width + sx]:
            raise SystemExit(f"seed for {keys[index]} is not on water at pixel {start}")
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
                nx %= width
                offset = ny * width + nx
                if water[offset] and owner[offset] == -1:
                    owner[offset] = index
                    queue.append((nx, ny))
        return count

    for index, key in enumerate(keys):
        print(f"{key:<10} {fill(to_pixel(*SEEDS[key], width, height), index):>8} px")

    # Enclosed seas the fills never reach (the Caspian, the Aral) and the cut lines
    # themselves are left unclaimed: they belong to no named ocean, and a learner pointing
    # at one should get no answer rather than a wrong one.
    unclaimed = sum(1 for x, value in enumerate(owner) if water[x] and value == -1)

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

    index_image.save(OUT / "ch2-oceans-index.png", optimize=True)
    for key, mask in masks.items():
        mask.save(OUT / f"ch2-ocean-{key}.webp", "WEBP", lossless=True, quality=100)

    claimed = sum(1 for value in owner if value >= 0)
    print(f"index + {len(masks)} masks written; {claimed} water pixels claimed, {unclaimed} left unclaimed")


if __name__ == "__main__":
    main()
