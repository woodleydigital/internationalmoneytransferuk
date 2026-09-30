"""Build the IMT UK logo SVGs: the bar mark plus a two-line wordmark outlined from a font.

The wordmark is converted to paths so it renders identically everywhere, including
in <img> tags where web fonts do not load. Fonts are SIL Open Font License, from
Google Fonts.

    pip install fonttools uharfbuzz
    python3 scripts/make-logo.py FONT.ttf OUT_PREFIX [--size 21] [--track 0.08] [--upper] [--rule]
                                 [--mark pound-fine|pound-open|pound|exchange|bars]
                                 [--pound-font FONT.ttf]

Writes OUT_PREFIX.svg and OUT_PREFIX-reversed.svg. The /brand/ URLs are permanent:
regenerate in place, never rename.
"""
import argparse
import math
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

LINES = ["International Money", "Transfer UK"]
MARK = 56          # mark height; the logo is exactly this tall
GAP = 16           # mark to wordmark
INK, INK_REV = "#062626", "#F0F7F7"
BARS = ["#F0F7F7", "#6FA8A9", "#B8811F"]
GOLD = "#B8811F"


def ntos(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def shape(tt, blob_path, text, size, track):
    """Return (path data, advance width, cap height) for one line, with tracking in em."""
    font = hb.Font(hb.Face(hb.Blob.from_file_path(blob_path)))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    gs, order, upm = tt.getGlyphSet(), tt.getGlyphOrder(), tt["head"].unitsPerEm
    s, x, d = size / upm, 0.0, []
    infos, positions = buf.glyph_infos, buf.glyph_positions
    for i, (info, pos) in enumerate(zip(infos, positions)):
        pen = SVGPathPen(gs, ntos=ntos)
        gs[order[info.codepoint]].draw(
            TransformPen(pen, (s, 0, 0, -s, x + pos.x_offset * s, -pos.y_offset * s)))
        d.append(pen.getCommands())
        x += pos.x_advance * s + (track * size if i < len(infos) - 1 else 0)
    cap = getattr(tt["OS/2"], "sCapHeight", 0) or upm * 0.7
    return " ".join(c for c in d if c), x, cap * s


def mark_bars():
    return (f'<rect x="10" y="15.5" width="28" height="5" rx="2.5" fill="{BARS[0]}"/>'
            f'<rect x="10" y="27.5" width="19" height="5" rx="2.5" fill="{BARS[1]}"/>'
            f'<rect x="30" y="27.5" width="8" height="5" rx="2.5" fill="{BARS[2]}"/>')


def mark_exchange():
    """Two opposed arrows: money going out and coming in."""
    return ('<g fill="none" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M11 17.5H36M29.5 11L36 17.5L29.5 24" stroke="{BARS[0]}"/>'
            f'<path d="M37 30.5H12M18.5 24L12 30.5L18.5 37" stroke="{GOLD}"/></g>')


# Styles for the pound mark: tile behind it, arc stroke, arrowhead size, radius,
# pound size, and colours (arcs, arrowheads, pound) on light and dark grounds.
POUND_STYLES = {
    "pound": dict(tile=True, stroke=3.2, head=4.2, r=15.5, size=21,
                  light=(BARS[1], GOLD, BARS[0]), dark=(BARS[1], GOLD, BARS[0])),
    # Fine white rings on the tile, a gold pound: quieter and more refined.
    "pound-fine": dict(tile=True, stroke=2.2, head=3.0, r=15.5, size=19,
                       light=(BARS[0], BARS[0], GOLD), dark=(BARS[0], BARS[0], GOLD)),
    # No tile: a single-colour ring around a gold pound.
    "pound-open": dict(tile=False, stroke=2.6, head=3.4, r=20, size=24,
                       light=(INK, INK, GOLD), dark=(INK_REV, INK_REV, GOLD)),
}


def mark_pound(style, pound_font, reversed_):
    """A pound sign inside two arrows circling it: money changing hands and currency."""
    st = POUND_STYLES[style]
    arc_c, head_c, pound_c = st["dark" if reversed_ else "light"]
    cx = cy = 24
    r, h = st["r"], st["head"]

    def pt(a):
        return cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))

    def arc(a0, a1):
        (x0, y0), (x1, y1) = pt(a0), pt(a1)
        # Open chevron at the end of the arc, pointing along the clockwise tangent.
        t = math.radians(a1 + 90)
        tx, ty = math.cos(t), math.sin(t)
        nx, ny = -ty, tx
        hx1, hy1 = x1 - tx * h + nx * h, y1 - ty * h + ny * h
        hx2, hy2 = x1 - tx * h - nx * h, y1 - ty * h - ny * h
        return (f'<path d="M{ntos(x0)} {ntos(y0)}A{r} {r} 0 0 1 {ntos(x1)} {ntos(y1)}" stroke="{arc_c}"/>'
                f'<path d="M{ntos(hx1)} {ntos(hy1)}L{ntos(x1)} {ntos(y1)}L{ntos(hx2)} {ntos(hy2)}" stroke="{head_c}"/>')

    tt = TTFont(pound_font)
    d, w, cap = shape(tt, pound_font, "£", st["size"], 0)
    glyph = f'<path transform="translate({ntos(cx - w / 2)} {ntos(cy + cap / 2)})" d="{d}" fill="{pound_c}"/>'
    return (f'<g fill="none" stroke-width="{st["stroke"]}" stroke-linecap="round" stroke-linejoin="round">'
            + arc(205, 330) + arc(25, 150) + '</g>' + glyph), st["tile"]


def build(font_path, size, track, upper, rule, reversed_, mark_kind="bars", pound_font=None):
    tt = TTFont(font_path)
    lines = [l.upper() for l in LINES] if upper else LINES
    shaped = [shape(tt, font_path, l, size, track) for l in lines]
    cap = shaped[0][2]
    leading = cap * (1.95 if rule else 1.7)
    block = cap + leading                      # first cap top to second baseline
    top = (MARK - block) / 2 + cap             # first baseline, block centred on the mark
    tx = MARK + GAP
    width = max(w for _, w, _ in shaped)
    ink = INK_REV if reversed_ else INK

    parts = []
    for i, (d, _, _) in enumerate(shaped):
        parts.append(f'<path transform="translate({tx} {ntos(top + i * leading)})" d="{d}"/>')
    if rule:
        y = top + leading / 2 - cap / 2 + 0.2
        parts.append(f'<rect x="{tx}" y="{ntos(y - 0.6)}" width="{ntos(width)}" height="1.2" fill="{GOLD}"/>')

    k = MARK / 48
    if mark_kind in POUND_STYLES:
        inner, tile = mark_pound(mark_kind, pound_font or font_path, reversed_)
    else:
        inner, tile = {"bars": mark_bars, "exchange": mark_exchange}[mark_kind](), True
    mark = (f'<rect width="{MARK}" height="{MARK}" rx="{ntos(11 * k)}" fill="#062626"/>'
            if tile and not reversed_ else "")
    mark += f'<g transform="scale({k:.4f})">{inner}</g>'
    W = ntos(tx + width + 1)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {MARK}" width="{W}" '
            f'height="{MARK}" role="img" aria-labelledby="lt">\n'
            f'  <title id="lt">International Money Transfer UK</title>\n  {mark}\n'
            f'  <g fill="{ink}">{"".join(parts)}</g>\n</svg>\n')


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("font"); a.add_argument("out")
    a.add_argument("--size", type=float, default=21)
    a.add_argument("--track", type=float, default=0)
    a.add_argument("--upper", action="store_true")
    a.add_argument("--rule", action="store_true")
    a.add_argument("--mark", choices=["bars", "exchange", *POUND_STYLES], default="pound-fine")
    a.add_argument("--pound-font", help="font for the £ in the mark (defaults to FONT)")
    o = a.parse_args()
    for rev, suffix in ((False, ""), (True, "-reversed")):
        with open(f"{o.out}{suffix}.svg", "w") as f:
            f.write(build(o.font, o.size, o.track, o.upper, o.rule, rev, o.mark, o.pound_font))
