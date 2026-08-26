#!/usr/bin/env python3
"""Source openly licensed photographs from Wikimedia Commons for content units.

Used for the Chapter 2 climate imagery (2026-08-26). Every image the app shows that
did NOT come from the course deck must carry creator, source URL and licence — that is
a licence obligation, not a nicety — and `content-images.ts` records exactly that. This
script is how those fields are obtained without hand-copying them from a web page.

Two hard-won rules are baked in:

1. **Throttle, and download thumbnails, not originals.** Fetching full-size originals
   from upload.wikimedia.org earns `HTTP 429` within a handful of requests; Wikimedia
   asks bots to use the standard thumbnail sizes instead. `make()` therefore resolves a
   thumbnail at the target width and retries with backoff.
2. **Read the metadata, do not guess it.** `meta()` returns the artist, licence and
   licence URL that the file page actually declares. Never write an attribution from a
   search result snippet or from memory.

Usage:
    python scripts/commons_images.py search "arctic tundra autumn"
    python scripts/commons_images.py meta "File:Greenland-ice sheet hg.jpg"
    python scripts/commons_images.py make "File:Greenland-ice sheet hg.jpg" \
        web/public/content-images/ch2-highlat-ice-cap-hd.webp

`make` writes a 1600px-wide WebP and prints the attribution fields to paste into
`content-images.ts`. Afterwards run `scripts/build_image_attribution.py` to regenerate
`web/public/content-images/ATTRIBUTION.md`, and `npx vitest run` — the visual-map tests
refuse any entry that has neither a course source nor a complete attribution.
"""
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "tourism-geography-tutor/1.0 (course content; educational use)"}

_last = [0.0]


def _throttle(gap=4.0):
    wait = gap - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    _last[0] = time.time()


def _get(params, tries=5):
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(tries):
        _throttle()
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=90) as response:
                return json.load(response)
        except Exception:
            if attempt == tries - 1:
                raise
            time.sleep(4 * (attempt + 1))


def _clean(value):
    if isinstance(value, (list, dict)):
        value = json.dumps(value)
    return re.sub("<[^>]+>", "", value or "").strip()


def _field(extmetadata, key):
    if not isinstance(extmetadata, dict):
        return ""
    value = extmetadata.get(key, {})
    if isinstance(value, dict):
        value = value.get("value", "")
    return _clean(value)


def search(query, limit=10, min_width=1200, ratio=(1.05, 2.3)):
    """Candidate files, filtered to landscape-ish shapes large enough to render at 1600px."""
    data = _get({
        "action": "query", "format": "json", "generator": "search", "gsrsearch": query,
        "gsrnamespace": 6, "gsrlimit": limit * 3, "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiextmetadatafilter": "LicenseShortName|LicenseUrl|Artist|ImageDescription",
    })
    results = []
    for page in (data.get("query", {}).get("pages") or {}).values():
        info = page["imageinfo"][0]
        extra = info.get("extmetadata", {})
        licence = _field(extra, "LicenseShortName")
        if info["width"] < min_width or not licence:
            continue
        shape = info["width"] / info["height"]
        if not ratio[0] <= shape <= ratio[1]:
            continue
        if info["url"].lower().endswith((".svg", ".pdf", ".djvu", ".tif", ".tiff", ".webm", ".ogv")):
            continue
        results.append({
            "title": page["title"], "w": info["width"], "h": info["height"], "lic": licence,
            "artist": _field(extra, "Artist")[:60], "desc": _field(extra, "ImageDescription")[:150],
        })
    return results[:limit]


def meta(title):
    """The attribution fields as the file page declares them."""
    data = _get({"action": "query", "format": "json", "titles": title,
                 "prop": "imageinfo", "iiprop": "url|size|extmetadata"})
    page = list(data["query"]["pages"].values())[0]
    info = page["imageinfo"][0]
    extra = info.get("extmetadata", {})
    return {
        "title": page["title"], "w": info["width"], "h": info["height"],
        "artist": _field(extra, "Artist"), "lic": _field(extra, "LicenseShortName"),
        "licurl": _field(extra, "LicenseUrl"), "desc": _field(extra, "ImageDescription"),
        "date": _field(extra, "DateTimeOriginal"), "url": info["url"].split("?")[0],
        "page": "https://commons.wikimedia.org/wiki/" + page["title"].replace(" ", "_"),
    }


def thumburl(title, width=1600):
    data = _get({"action": "query", "format": "json", "titles": title,
                 "prop": "imageinfo", "iiprop": "url|size", "iiurlwidth": width})
    info = list(data["query"]["pages"].values())[0]["imageinfo"][0]
    return info.get("thumburl") or info["url"]


def make(title, dest, width=1600, quality=82):
    """Download at `width` and save as WebP. Resize and format only — never a crop or a filter."""
    from PIL import Image

    record = meta(title)
    source = thumburl(title, width) if record["w"] > width else record["url"]
    data = None
    for attempt in range(6):
        try:
            time.sleep(3)
            request = urllib.request.Request(source, headers=UA)
            with urllib.request.urlopen(request, timeout=300) as response:
                data = response.read()
            break
        except Exception:
            if attempt == 5:
                raise
            time.sleep(10 * (attempt + 1))

    image = Image.open(io.BytesIO(data)).convert("RGB")
    target = min(width, image.width)
    image = image.resize((target, round(image.height * target / image.width)), Image.LANCZOS)
    image.save(dest, "WEBP", quality=quality, method=6)
    record["out"] = (image.width, image.height, os.path.getsize(dest))
    return record


def _print_attribution(record, dest):
    width, height, size = record["out"]
    print(f"\nwrote {dest} ({width}x{height}, {size // 1024} KB)\n")
    print("  width: %d," % width)
    print("  height: %d," % height)
    print("  attribution: {")
    print('    creator: "%s",' % record["artist"])
    print('    sourceUrl: "%s",' % record["page"])
    print('    license: "%s",' % record["lic"])
    if record["licurl"]:
        print('    licenseUrl: "%s",' % record["licurl"].rstrip("/") + "/,")
    else:
        print("    // public domain: no licence deed to link to, licenseUrl omitted")
    print("  },")


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "search"
    if command == "search":
        for candidate in search(sys.argv[2]):
            print(f"{candidate['title']}\t{candidate['w']}x{candidate['h']}\t{candidate['lic']}"
                  f"\t{candidate['artist'][:30]}\t{candidate['desc'][:70]}")
    elif command == "meta":
        print(json.dumps(meta(sys.argv[2]), indent=2, ensure_ascii=False))
    elif command == "make":
        _print_attribution(make(sys.argv[2], sys.argv[3]), sys.argv[3])
    else:
        print(__doc__)
        sys.exit(1)
