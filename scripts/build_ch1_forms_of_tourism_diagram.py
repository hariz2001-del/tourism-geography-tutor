"""Draw the CH1 "Forms of tourism" 2x2 matrix.

Finding 2 of docs/pedagogy-review-content-units-2026-08-25.md. CH1 topic t5 holds four
definitions - domestic, international, inbound, outbound - that are not four independent
facts but one matrix the prose never draws. Inbound versus outbound is exactly the pair
learners confuse, and the distinction is only a question of which country you take as the
reference.

This is the first diagram in the project not extracted from a source page. Every quoted
label comes verbatim from the four unit bodies, all of which cite
chapter-1-candidate-a.pdf p25. The diagram contributes arrangement, not content.

Text is ASCII only: the PDF base-14 fonts used here cannot encode curly quotes or
en/em dashes, and pymupdf silently substitutes "?" for anything outside Latin-1.

    .venv/Scripts/python.exe scripts/build_ch1_forms_of_tourism_diagram.py
"""

import sys
import fitz

OUT = "web/public/diagrams/ch1-forms-of-tourism-matrix.png"
W, H = 1400, 700

INK = (0.086, 0.137, 0.169)
MUTED = (0.353, 0.420, 0.459)
LINE = (0.725, 0.780, 0.808)
TINT = (0.898, 0.941, 0.961)
FAINT = (0.976, 0.980, 0.984)

doc = fitz.open()
page = doc.new_page(width=W, height=H)
page.draw_rect(fitz.Rect(0, 0, W, H), color=None, fill=(1, 1, 1))


def text(rect, body, size=13, color=MUTED, bold=False, align=0):
    assert body.isascii(), f"non-ASCII would render as '?': {body!r}"
    left = page.insert_textbox(rect, body, fontsize=size, fontname="hebo" if bold else "helv",
                               color=color, align=align, lineheight=1.32)
    if left < 0:
        sys.exit(f"text did not fit ({left:.0f} short): {body[:60]!r}")


text(fitz.Rect(70, 42, 1330, 92), "Forms of tourism", size=29, color=INK, bold=True)
text(fitz.Rect(70, 92, 1330, 124),
     "All four terms are defined relative to one reference country. Call it Country A.",
     size=14.5, color=MUTED)

HX, C1X, C2X, RX = 70, 380, 845, 1310
HY, R1Y, R2Y, BOT = 150, 206, 386, 566

text(fitz.Rect(C1X + 20, HY + 16, C2X - 20, R1Y), "Travelling INSIDE Country A", size=14.5, color=INK, bold=True, align=1)
text(fitz.Rect(C2X + 20, HY + 16, RX - 20, R1Y), "Travelling OUTSIDE Country A", size=14.5, color=INK, bold=True, align=1)
text(fitz.Rect(HX + 12, R1Y + 66, C1X - 24, R2Y), "Residents\nof Country A", size=14.5, color=INK, bold=True)
text(fitz.Rect(HX + 12, R2Y + 66, C1X - 24, BOT), "Residents of\nother countries", size=14.5, color=INK, bold=True)


def cell(x0, y0, x1, y1, term, gloss, tinted, dim=False):
    page.draw_rect(fitz.Rect(x0, y0, x1, y1), color=LINE, fill=TINT if tinted else FAINT, width=1)
    text(fitz.Rect(x0 + 26, y0 + 30, x1 - 26, y0 + 70), term, size=21, color=MUTED if dim else INK, bold=True)
    text(fitz.Rect(x0 + 26, y0 + 78, x1 - 26, y1 - 14), gloss, size=13.5, color=MUTED)


cell(C1X, R1Y, C2X, R2Y, "DOMESTIC TOURISM",
     '"those travelling within their own country"', tinted=False)
cell(C2X, R1Y, RX, R2Y, "OUTBOUND TOURISM",
     '"residents of a particular country travelling\nabroad to other countries"', tinted=True)
cell(C1X, R2Y, C2X, BOT, "INBOUND TOURISM",
     '"non-residents travelling in a given country"', tinted=True)
cell(C2X, R2Y, RX, BOT, "(no term)",
     "Country A is not part of this trip, so none of its\nfour forms of tourism describe it.", tinted=False, dim=True)

page.draw_line(fitz.Point(HX, R1Y), fitz.Point(RX, R1Y), color=LINE, width=1)
page.draw_line(fitz.Point(C1X, HY), fitz.Point(C1X, BOT), color=LINE, width=1)

page.draw_rect(fitz.Rect(HX, BOT + 30, HX + 24, BOT + 48), color=LINE, fill=TINT, width=1)
text(fitz.Rect(HX + 36, BOT + 28, RX, BOT + 124),
     'Shaded = INTERNATIONAL TOURISM: "those who travel to a country other than the one in which they normally\n'
     'live, using another currency and often encountering a different language."\n'
     "Inbound and outbound are the same border crossing. Which term applies depends only on which country you\n"
     "are standing in.",
     size=13.5, color=MUTED)

pix = page.get_pixmap(dpi=144)
pix.save(OUT)
print(f"{OUT}  {pix.width}x{pix.height}")
