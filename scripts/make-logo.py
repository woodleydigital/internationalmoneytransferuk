"""Build the IMT UK logo SVGs: the bar mark plus a wordmark outlined from a font.

The wordmark is converted to paths so it renders identically everywhere, including
in <img> tags where web fonts do not load. Font: Source Serif 4 SemiBold (SIL Open
Font License), downloaded from Google Fonts.

    pip install fonttools uharfbuzz
    python3 scripts/make-logo.py SourceSerif4-SemiBold.ttf 600 public/brand/logo-imt-uk line

Writes <out>.svg and <out>-reversed.svg. The /brand/ URLs are permanent: regenerate
in place, never rename.
"""
import sys, uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

def shape(path, text, size, wght=None):
    blob = hb.Blob.from_file_path(path); face = hb.Face(blob); font = hb.Font(face)
    if wght: font.set_variations({"wght": wght})
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    tt = TTFont(path)
    if wght and "fvar" in tt:
        from fontTools.varLib.instancer import instantiateVariableFont
        tt = instantiateVariableFont(tt, {"wght": wght})
    gs = tt.getGlyphSet(); order = tt.getGlyphOrder(); upm = tt["head"].unitsPerEm
    s = size / upm; x = 0; d = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
        gs[order[info.codepoint]].draw(TransformPen(pen, (s, 0, 0, -s, (x + pos.x_offset) * s, -pos.y_offset * s)))
        d.append(pen.getCommands()); x += pos.x_advance
    return " ".join(c for c in d if c), x * s

def build(font, wght, lines, size, gap, ink, mark_bg, bars, reversed_=False):
    M = 56  # mark size
    tx = M + 16
    paths = []; width = 0
    total_h = size * 0.72 + (len(lines) - 1) * gap  # cap-height approx
    top = (M - total_h) / 2 + size * 0.72
    for i, line in enumerate(lines):
        d, w = shape(font, line, size, wght); width = max(width, w)
        paths.append(f'<path transform="translate({tx} {top + i * gap:.2f})" d="{d}"/>')
    W = tx + width + 2
    k = M / 48
    mark = ("" if reversed_ else f'<rect width="{M}" height="{M}" rx="{11*k:.2f}" fill="{mark_bg}"/>') + \
        f'<g transform="scale({k:.4f})"><rect x="10" y="15.5" width="28" height="5" rx="2.5" fill="{bars[0]}"/>' \
        f'<rect x="10" y="27.5" width="19" height="5" rx="2.5" fill="{bars[1]}"/>' \
        f'<rect x="30" y="27.5" width="8" height="5" rx="2.5" fill="{bars[2]}"/></g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {M}" width="{W:.0f}" height="{M}" role="img" aria-labelledby="lt">\n'
            f'  <title id="lt">International Money Transfer UK</title>\n  {mark}\n'
            f'  <g fill="{ink}">{"".join(paths)}</g>\n</svg>\n')

if __name__ == "__main__":
    font, wght, out, layout = sys.argv[1], (int(sys.argv[2]) or None), sys.argv[3], sys.argv[4]
    lines = ["International Money", "Transfer UK"] if layout == "stack" else ["International Money Transfer UK"]
    size, gap = (22, 25) if layout == "stack" else (27, 0)
    open(out + ".svg", "w").write(build(font, wght, lines, size, gap, "#062626", "#062626", ["#F0F7F7", "#6FA8A9", "#B8811F"]))
    open(out + "-reversed.svg", "w").write(build(font, wght, lines, size, gap, "#F0F7F7", None, ["#F0F7F7", "#6FA8A9", "#B8811F"], True))
