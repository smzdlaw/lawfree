"""Generate images/og-image.png for Open Graph sharing."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "images" / "logo-horizontal.png"
OUT_PATH = ROOT / "images" / "og-image.png"

WIDTH = 1200
HEIGHT = 630
BG_COLOR = "#F8FAFC"
SUBTITLE = "免費法律文件快速產生器"
LOGO_WIDTH_RATIO = 0.60
SAFE_PADDING = 100


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/msjh.ttc",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/msyhbd.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "/System/Library/Fonts/PingFang.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def main() -> None:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    canvas = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)

    target_logo_width = int(WIDTH * LOGO_WIDTH_RATIO)
    target_logo_width = min(target_logo_width, WIDTH - SAFE_PADDING * 2)
    scale = target_logo_width / logo.width
    target_logo_height = int(logo.height * scale)
    logo = logo.resize((target_logo_width, target_logo_height), Image.Resampling.LANCZOS)

    subtitle_font = load_font(30)
    draw_probe = ImageDraw.Draw(canvas)
    text_bbox = draw_probe.textbbox((0, 0), SUBTITLE, font=subtitle_font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    gap = 28
    block_height = target_logo_height + gap + text_height
    block_top = (HEIGHT - block_height) // 2

    logo_x = (WIDTH - target_logo_width) // 2
    logo_y = block_top

    canvas.paste(logo, (logo_x, logo_y), logo)

    draw = ImageDraw.Draw(canvas)
    text_x = (WIDTH - text_width) // 2
    text_y = logo_y + target_logo_height + gap
    draw.text((text_x, text_y), SUBTITLE, fill="#64748B", font=subtitle_font)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT_PATH, format="PNG", optimize=True)
    print(f"Saved {OUT_PATH} ({WIDTH}x{HEIGHT})")
    print(f"Logo size: {target_logo_width}x{target_logo_height}")
    print(f"Logo position: ({logo_x}, {logo_y})")


if __name__ == "__main__":
    main()
