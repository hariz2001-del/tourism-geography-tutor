#!/usr/bin/env python3
"""Colourise NASA's greyscale elevation map into the hypsometric texture the range map paints.

The mountain-range explorer shows real topography *inside* the range a learner selects, which
needs a relief image in the same equirectangular extent as every other map in the app
(-180..180, -90..90). NASA's SRTM ramp2 world image is that, but it is a greyscale height
field: land runs from about 12 (sea level) to 197 (Everest), which reads as almost black.

This turns it into the familiar green-to-white hypsometric tint and adds a hillshade computed
from the height field's own gradient, so ridges and valleys are visible rather than implied.
Nothing is invented: every pixel's colour is a function of the elevation NASA published for it.

    python scripts/build_relief_texture.py

Input:  data/relief-source/srtm-ramp2-grey.webp  (public domain, NASA Earth Observatory)
Output: web/public/diagrams/world-hypsometric.webp
"""
import pathlib

from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/relief-source/srtm-ramp2-grey.webp"
TARGET = ROOT / "web/public/diagrams/world-hypsometric.webp"

SEA_LEVEL = 13          # the value NASA's ramp gives the ocean surface
SEA_COLOUR = (150, 178, 196)   # water, so a coast reads as a coast rather than as low ground
PEAK = 200              # a little above Everest, so the top of the ramp is reached rarely

# Hypsometric stops keyed to metres, not to raw grey values. Keying them to the grey ramp
# spread nearly every mountain range on Earth across the bottom third of the scale and drew
# them all green; most of the world's relief is below 3,000 m and needs the colour there.
STOPS_IN_METRES = [
    (0, (86, 130, 74)),
    (250, (124, 156, 82)),
    (600, (168, 172, 96)),
    (1200, (200, 182, 116)),
    (2000, (198, 158, 104)),
    (3200, (172, 126, 92)),
    (4600, (152, 136, 130)),
    (6200, (208, 206, 204)),
    (8848, (252, 252, 252)),
]

PEAK_METRES = 8848

def ramp() -> list[tuple[int, int, int]]:
    """One colour per possible grey value, read off the elevation each value stands for."""
    table = []
    for value in range(256):
        metres = max(0.0, (value - SEA_LEVEL) / (PEAK - SEA_LEVEL)) * PEAK_METRES
        colour = STOPS_IN_METRES[-1][1]
        for (low, low_colour), (high, high_colour) in zip(STOPS_IN_METRES, STOPS_IN_METRES[1:]):
            if metres <= high:
                span = (metres - low) / (high - low) if high > low else 0.0
                span = min(max(span, 0.0), 1.0)
                colour = tuple(round(a + (b - a) * span) for a, b in zip(low_colour, high_colour))
                break
        table.append(colour)
    return table


def main():
    height_field = Image.open(SOURCE).convert("L")
    width, height = height_field.size

    table = ramp()
    for value in range(SEA_LEVEL + 1):
        table[value] = SEA_COLOUR
    tinted = Image.merge("RGB", [
        height_field.point([colour[channel] for colour in table]) for channel in range(3)
    ])

    # Hillshade from the height field's own slope, lit from the north-west. Emboss gives the
    # directional derivative; it is centred on 128, so it multiplies rather than adds.
    shade = height_field.filter(ImageFilter.EMBOSS).filter(ImageFilter.SMOOTH)
    shaded = Image.composite(tinted, tinted, height_field)  # same size, keeps mode
    pixels = shaded.load()
    shade_pixels = shade.load()
    for y in range(height):
        for x in range(width):
            factor = 0.55 + (shade_pixels[x, y] / 128.0) * 0.45
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                min(255, round(r * factor)),
                min(255, round(g * factor)),
                min(255, round(b * factor)),
            )

    shaded.save(TARGET, "WEBP", quality=86, method=6)
    print(f"wrote {TARGET.relative_to(ROOT)} ({width}x{height}, {TARGET.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
