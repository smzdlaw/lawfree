"""Build SLawFree horizontal logo PNG + SVG."""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "logo-horizontal.png.png"
OUT_PNG = ROOT / "images" / "logo-horizontal.png"
OUT_SVG = ROOT / "images" / "logo-horizontal.svg"

PAD_X = 14
PAD_Y = 14
GAP = 18
TEXT_SHIFT = 4
ICON_SCALE = 0.85
WHITE = 250
TAGLINE_X = 500
TAGLINE_Y = 512


def extract_layer(im: Image.Image, x0: int, x1: int, y0: int) -> Image.Image:
    w, h = im.size
    px = im.load()
    minx, miny, maxx, maxy = -1, -1, -1, -1
    for y in range(y0, h):
        for x in range(x0, min(x1, w)):
            r, g, b, a = px[x, y]
            if r >= WHITE and g >= WHITE and b >= WHITE:
                continue
            if x >= TAGLINE_X and y >= TAGLINE_Y:
                continue
            if minx < 0 or x < minx:
                minx = x
            if miny < 0 or y < miny:
                miny = y
            if maxx < 0 or x > maxx:
                maxx = x
            if maxy < 0 or y > maxy:
                maxy = y
    layer = Image.new("RGBA", (maxx - minx + 1, maxy - miny + 1), (0, 0, 0, 0))
    lp = layer.load()
    for y in range(miny, maxy + 1):
        for x in range(minx, maxx + 1):
            r, g, b, a = px[x, y]
            if r >= WHITE and g >= WHITE and b >= WHITE:
                continue
            if x >= TAGLINE_X and y >= TAGLINE_Y:
                continue
            lp[x - minx, y - miny] = (r, g, b, a)
    return layer


def trim(layer: Image.Image) -> Image.Image:
    bbox = layer.getbbox()
    return layer.crop(bbox) if bbox else layer


def shift_left(layer: Image.Image, px_shift: int) -> Image.Image:
    if px_shift <= 0:
        return layer
    lw, lh = layer.size
    out = Image.new("RGBA", (max(1, lw - px_shift), lh), (0, 0, 0, 0))
    out.paste(layer.crop((px_shift, 0, lw, lh)), (0, 0))
    return trim(out)


def b64_image(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def main() -> None:
    im = Image.open(SRC).convert("RGBA")

    icon = trim(extract_layer(im, 201, 520, 258))
    text = shift_left(trim(extract_layer(im, 520, 1590, 258)), TEXT_SHIFT)
    tw, th = text.size

    raw_icon_h = icon.size[1]
    target_icon_h = max(1, round(th * ICON_SCALE))
    scale = target_icon_h / raw_icon_h
    new_iw = max(1, round(icon.size[0] * scale))
    icon_scaled = icon.resize((new_iw, target_icon_h), Image.Resampling.LANCZOS)

    row_h = th
    icon_x = PAD_X
    icon_y = PAD_Y + (row_h - icon_scaled.size[1]) // 2
    text_x = icon_x + icon_scaled.size[0] + GAP
    text_y = PAD_Y + (row_h - text.size[1]) // 2
    canvas_w = text_x + tw + PAD_X
    canvas_h = PAD_Y * 2 + row_h

    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    canvas.paste(icon_scaled, (icon_x, icon_y), icon_scaled)
    canvas.paste(text, (text_x, text_y), text)
    canvas.save(OUT_PNG, "PNG", optimize=True)

    iw, ih = icon_scaled.size
    effective_gap = text_x - (icon_x + iw)
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w} {canvas_h}" width="{canvas_w}" height="{canvas_h}" role="img" aria-label="SLawFree">
  <title>SLawFree</title>
  <image href="data:image/png;base64,{b64_image(icon_scaled)}" x="{icon_x}" y="{icon_y}" width="{iw}" height="{ih}" />
  <image href="data:image/png;base64,{b64_image(text)}" x="{text_x}" y="{text_y}" width="{tw}" height="{th}" />
</svg>
"""
    OUT_SVG.write_text(svg, encoding="utf-8")

    print("icon", icon_scaled.size)
    print("text", text.size)
    print("effective_gap", effective_gap)
    print("icon_h/text_h", ih, th, f"{ih / th * 100:.1f}%")
    print("icon_shrink_from_raw", f"{(1 - target_icon_h / raw_icon_h) * 100:.1f}%")
    print("png", canvas.size)
    print("svg", OUT_SVG)


if __name__ == "__main__":
    main()
