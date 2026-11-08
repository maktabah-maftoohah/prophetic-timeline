"""
Generate high-fidelity raster PNG icons and favicons for Prophetic Timeline.
Uses supersampling (4x) for pristine antialiasing, crisp curves, and smooth gradients.
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

def create_icon(size: int = 512) -> Image.Image:
    scale = 4
    canvas_size = size * scale
    center = canvas_size // 2
    
    # 1. Background image with deep cosmic radial gradient
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background plate
    corner_radius = int(canvas_size * 0.22)
    bg_rect = [0, 0, canvas_size, canvas_size]
    
    # Draw rounded dark background plate
    # Radial color simulation
    for r in range(center, 0, -2):
        factor = r / center
        # Gradient from #060911 to #132338
        red = int(6 + (19 - 6) * (1.0 - factor**1.5))
        green = int(9 + (35 - 9) * (1.0 - factor**1.5))
        blue = int(17 + (56 - 17) * (1.0 - factor**1.5))
        draw.ellipse([center - r, center - r, center + r, center + r], fill=(red, green, blue, 255))
        
    # Mask to rounded rect
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=corner_radius, fill=255)
    
    # Apply rounded rect mask
    base_plate = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    base_plate.paste(img, (0, 0), mask)
    img = base_plate
    draw = ImageDraw.Draw(img)

    # 2. Outer Astrolabe Rim Rings
    # Gold & Emerald rings
    gold_color = (245, 158, 11, 230)
    emerald_color = (16, 185, 129, 210)
    dim_gold = (217, 119, 6, 160)

    r_outer = int(canvas_size * 0.44)
    r_mid = int(canvas_size * 0.425)
    r_inner = int(canvas_size * 0.395)

    draw.ellipse([center - r_outer, center - r_outer, center + r_outer, center + r_outer], outline=gold_color, width=int(2.5 * scale))
    draw.ellipse([center - r_mid, center - r_mid, center + r_mid, center + r_mid], outline=emerald_color, width=int(2 * scale))

    # Astrolabe degree tick marks
    num_ticks = 36
    tick_len = int(16 * scale)
    for i in range(num_ticks):
        angle = math.radians(i * (360 / num_ticks))
        x1 = center + (r_outer - 2) * math.cos(angle)
        y1 = center + (r_outer - 2) * math.sin(angle)
        is_major = (i % 9 == 0)
        curr_len = tick_len * 1.5 if is_major else tick_len
        w = int(3.5 * scale) if is_major else int(2 * scale)
        x2 = center + (r_outer - curr_len) * math.cos(angle)
        y2 = center + (r_outer - curr_len) * math.sin(angle)
        tick_col = (254, 240, 138, 240) if is_major else dim_gold
        draw.line([(x1, y1), (x2, y2)], fill=tick_col, width=w)

    # 3. Celestial Orbit Ellipses (Planetary Paths)
    # Tilted orbit 1 (-28 deg)
    orbit1 = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    orbit1_draw = ImageDraw.Draw(orbit1)
    rx1, ry1 = int(canvas_size * 0.36), int(canvas_size * 0.17)
    orbit1_draw.ellipse([center - rx1, center - ry1, center + rx1, center + ry1], outline=(52, 211, 153, 170), width=int(2.2 * scale))
    orbit1 = orbit1.rotate(28, center=(center, center), resample=Image.BICUBIC)
    img = Image.alpha_composite(img, orbit1)
    draw = ImageDraw.Draw(img)

    # Tilted orbit 2 (38 deg)
    orbit2 = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    orbit2_draw = ImageDraw.Draw(orbit2)
    rx2, ry2 = int(canvas_size * 0.34), int(canvas_size * 0.15)
    orbit2_draw.ellipse([center - rx2, center - ry2, center + rx2, center + ry2], outline=(245, 158, 11, 150), width=int(2 * scale))
    orbit2 = orbit2.rotate(-38, center=(center, center), resample=Image.BICUBIC)
    img = Image.alpha_composite(img, orbit2)
    draw = ImageDraw.Draw(img)

    # 4. Crescent Moon (Hilal)
    # Constructed via 2 overlapping circles on an alpha layer
    crescent_layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(crescent_layer)

    r_crescent_outer = int(canvas_size * 0.31)
    # Outer circle centered slightly to right
    cx_out = int(center + canvas_size * 0.04)
    cy_out = int(center - canvas_size * 0.01)
    c_draw.ellipse([cx_out - r_crescent_outer, cy_out - r_crescent_outer, 
                    cx_out + r_crescent_outer, cy_out + r_crescent_outer], fill=(245, 158, 11, 255))

    # Inner cutout circle (masking)
    inner_mask = Image.new("L", (canvas_size, canvas_size), 255)
    in_draw = ImageDraw.Draw(inner_mask)
    r_crescent_inner = int(canvas_size * 0.28)
    cx_in = int(center - canvas_size * 0.055)
    cy_in = int(center - canvas_size * 0.05)
    in_draw.ellipse([cx_in - r_crescent_inner, cy_in - r_crescent_inner, 
                     cx_in + r_crescent_inner, cy_in + r_crescent_inner], fill=0)

    # Apply mask to create crescent
    crescent_alpha = crescent_layer.split()[3]
    # Multiply alpha with inner_mask
    final_alpha = Image.composite(crescent_alpha, Image.new("L", (canvas_size, canvas_size), 0), inner_mask)
    
    # Gold gradient fill for crescent
    gold_fill = Image.new("RGBA", (canvas_size, canvas_size), (251, 191, 36, 255))
    g_draw = ImageDraw.Draw(gold_fill)
    for y in range(canvas_size):
        ratio = y / canvas_size
        r_col = int(254 * (1 - ratio) + 217 * ratio)
        g_col = int(240 * (1 - ratio) + 119 * ratio)
        b_col = int(138 * (1 - ratio) + 6 * ratio)
        g_draw.line([(0, y), (canvas_size, y)], fill=(r_col, g_col, b_col, 255))
    
    gold_crescent = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    gold_crescent.paste(gold_fill, (0, 0), final_alpha)

    # Crescent subtle glow
    glow = gold_crescent.filter(ImageFilter.GaussianBlur(radius=8 * scale))
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, gold_crescent)
    draw = ImageDraw.Draw(img)

    # 5. Radiant 8-Pointed Star (Rub el Hizb)
    # Centered at cradle: (center - canvas_size * 0.055, center - canvas_size * 0.03)
    sx = int(center - canvas_size * 0.055)
    sy = int(center - canvas_size * 0.032)
    s_size = int(canvas_size * 0.13)

    star_layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    star_draw = ImageDraw.Draw(star_layer)

    # Square 1
    star_draw.rounded_rectangle([sx - s_size, sy - s_size, sx + s_size, sy + s_size], 
                                radius=int(6 * scale), fill=(16, 185, 129, 245), 
                                outline=(254, 240, 138, 255), width=int(2.5 * scale))
    
    # Square 2 (Rotated 45 degrees)
    sq2 = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    sq2_draw = ImageDraw.Draw(sq2)
    sq2_draw.rounded_rectangle([sx - s_size, sy - s_size, sx + s_size, sy + s_size], 
                               radius=int(6 * scale), fill=(16, 185, 129, 245), 
                               outline=(254, 240, 138, 255), width=int(2.5 * scale))
    sq2 = sq2.rotate(45, center=(sx, sy), resample=Image.BICUBIC)
    star_layer = Image.alpha_composite(star_layer, sq2)
    star_draw = ImageDraw.Draw(star_layer)

    # Central Core Disc
    r_core1 = int(s_size * 0.62)
    star_draw.ellipse([sx - r_core1, sy - r_core1, sx + r_core1, sy + r_core1], 
                      fill=(11, 18, 32, 255), outline=(245, 158, 11, 255), width=int(2.5 * scale))
    r_core2 = int(s_size * 0.38)
    star_draw.ellipse([sx - r_core2, sy - r_core2, sx + r_core2, sy + r_core2], fill=(245, 158, 11, 255))
    r_core3 = int(s_size * 0.18)
    star_draw.ellipse([sx - r_core3, sy - r_core3, sx + r_core3, sy + r_core3], fill=(255, 255, 255, 255))

    # Star Beams
    beam_len = int(s_size * 1.7)
    star_draw.line([(sx - beam_len, sy), (sx + beam_len, sy)], fill=(254, 240, 138, 220), width=int(2.5 * scale))
    star_draw.line([(sx, sy - beam_len), (sx, sy + beam_len)], fill=(254, 240, 138, 220), width=int(2.5 * scale))

    # Composite star with glow
    star_glow = star_layer.filter(ImageFilter.GaussianBlur(radius=6 * scale))
    img = Image.alpha_composite(img, star_glow)
    img = Image.alpha_composite(img, star_layer)
    draw = ImageDraw.Draw(img)

    # 6. Distant sparkling stars
    stars_coords = [
        (int(center - canvas_size * 0.30), int(center - canvas_size * 0.28), 2.5),
        (int(center + canvas_size * 0.30), int(center - canvas_size * 0.25), 3.0),
        (int(center + canvas_size * 0.28), int(center + canvas_size * 0.28), 2.0),
        (int(center - canvas_size * 0.28), int(center + canvas_size * 0.26), 2.5),
    ]
    for px, py, pr in stars_coords:
        r_px = int(pr * scale)
        draw.ellipse([px - r_px, py - r_px, px + r_px, py + r_px], fill=(254, 240, 138, 200))

    # 7. Resample back down with high-quality Lanczos antialiasing
    final_icon = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_icon

def main():
    root = Path(__file__).resolve().parent.parent
    assets_dir = root / "assets"
    data_dir = root / "data"
    assets_dir.mkdir(exist_ok=True)
    data_dir.mkdir(exist_ok=True)

    print("Generating 512x512 icon...")
    icon_512 = create_icon(512)
    icon_512.save(data_dir / "icon-512.png", format="PNG", optimize=True)
    icon_512.save(assets_dir / "logo-icon-512.png", format="PNG", optimize=True)

    print("Generating 192x192 icon...")
    icon_192 = icon_512.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save(data_dir / "icon.png", format="PNG", optimize=True)
    icon_192.save(assets_dir / "logo-icon-192.png", format="PNG", optimize=True)

    print("Generating 64x64, 32x32, 16x16 favicons...")
    icon_64 = icon_512.resize((64, 64), Image.Resampling.LANCZOS)
    icon_32 = icon_512.resize((32, 32), Image.Resampling.LANCZOS)
    icon_16 = icon_512.resize((16, 16), Image.Resampling.LANCZOS)
    
    icon_32.save(assets_dir / "favicon-32x32.png", format="PNG")
    icon_16.save(assets_dir / "favicon-16x16.png", format="PNG")
    
    # Save multi-size favicon.ico
    icon_512.save(root / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    icon_512.save(assets_dir / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    print("All icons generated successfully!")

if __name__ == "__main__":
    main()
