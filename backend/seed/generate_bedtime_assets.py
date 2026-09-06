import os
import sys
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BACKEND_DIR = Path(__file__).resolve().parent.parent
STORAGE_ART_DIR = BACKEND_DIR / "storage" / "artwork"
VIEWER_PUB_DIR = BACKEND_DIR.parent / "viewer" / "public"
CMS_PUB_DIR = BACKEND_DIR.parent / "cms" / "public"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

STORAGE_ART_DIR.mkdir(parents=True, exist_ok=True)
VIEWER_PUB_DIR.mkdir(parents=True, exist_ok=True)
CMS_PUB_DIR.mkdir(parents=True, exist_ok=True)


def draw_star(draw, cx, cy, r, color):
    points = []
    for i in range(10):
        angle = i * math.pi / 5 - math.pi / 2
        radius = r if i % 2 == 0 else r * 0.45
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill=color)


def draw_crescent_moon(draw, cx, cy, r, color, bg_color):
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=color)
    offset_r = int(r * 0.85)
    draw.ellipse([(cx - r + int(r * 0.45), cy - offset_r), (cx + offset_r, cy + offset_r)], fill=bg_color)


def draw_cloud(draw, cx, cy, w, h, color):
    r = h // 2
    draw.ellipse([(cx - w//3, cy - r), (cx, cy + r)], fill=color)
    draw.ellipse([(cx - r, cy - r*1.2), (cx + r, cy + r*0.8)], fill=color)
    draw.ellipse([(cx, cy - r), (cx + w//3, cy + r)], fill=color)
    draw.rectangle([(cx - w//3, cy), (cx + w//3, cy + r)], fill=color)


def create_storybook_asset(filename, width, height, title, theme, c_sky_top, c_sky_bottom, c_accent):
    target_path = STORAGE_ART_DIR / filename
    
    img = Image.new("RGB", (width, height), c_sky_top)
    draw = ImageDraw.Draw(img)

    # Sky gradient
    for y in range(height):
        ratio = y / height
        r = int(c_sky_top[0] + (c_sky_bottom[0] - c_sky_top[0]) * ratio)
        g = int(c_sky_top[1] + (c_sky_bottom[1] - c_sky_top[1]) * ratio)
        b = int(c_sky_top[2] + (c_sky_bottom[2] - c_sky_top[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Background stars
    import random
    rng = random.Random(hash(filename))
    for _ in range(40):
        sx = rng.randint(10, width - 10)
        sy = rng.randint(10, int(height * 0.7))
        sr = rng.randint(2, 5)
        brightness = rng.randint(180, 255)
        draw_star(draw, sx, sy, sr, (brightness, brightness, 230))

    # Glowing celestial moon or star
    moon_x = int(width * 0.8)
    moon_y = int(height * 0.25)
    moon_r = min(width, height) // 8
    draw.ellipse([(moon_x - moon_r - 10, moon_y - moon_r - 10), (moon_x + moon_r + 10, moon_y + moon_r + 10)], fill=(c_accent[0], c_accent[1], c_accent[2]))
    draw_crescent_moon(draw, moon_x, moon_y, moon_r, (255, 240, 180), c_sky_top)

    # Soft rolling hills or clouds at bottom
    for i in range(3):
        cy = int(height * (0.65 + i * 0.12))
        cw = width + 100
        ch = int(height * 0.4)
        c_hill = (
            max(0, c_sky_bottom[0] - 15 * (3 - i)),
            max(0, c_sky_bottom[1] - 10 * (3 - i)),
            min(255, c_sky_bottom[2] + 20 * (3 - i))
        )
        draw.ellipse([(-50 + i * 40, cy), (width + 50, cy + ch * 2)], fill=c_hill)

    # Soft dreamy clouds
    draw_cloud(draw, int(width * 0.3), int(height * 0.72), int(width * 0.4), int(height * 0.2), (240, 240, 255, 120))
    draw_cloud(draw, int(width * 0.75), int(height * 0.78), int(width * 0.45), int(height * 0.22), (220, 230, 250, 140))

    # Center Title Plaque
    cx, cy = width // 2, int(height * 0.82)
    box_w = min(width - 30, 320)
    box_h = 56
    draw.rounded_rectangle(
        [(cx - box_w // 2, cy - box_h // 2), (cx + box_w // 2, cy + box_h // 2)],
        radius=14,
        fill=(12, 16, 32, 230),
        outline=(c_accent[0], c_accent[1], c_accent[2]),
        width=2
    )

    draw.text((cx, cy - 8), title, fill=(255, 255, 255), anchor="mm")
    draw.text((cx, cy + 12), f"✨ {theme}", fill=(245, 197, 68), anchor="mm")

    img.save(target_path, "WEBP", quality=88)
    print(f"  + Generated: {filename} ({width}x{height})")


def main():
    print("🎨 Generating Peblo Bedtime storybook assets...")

    assets = [
        # (filename, width, height, title, theme, sky_top, sky_bottom, accent)
        # Hero: Luna & The Cloud Whale
        ("luna_whale_banner.webp", 1280, 720, "Luna & The Cloud Whale", "Bedtime Wonder • Ages 3-7", (15, 20, 48), (28, 42, 90), (245, 197, 68)),
        ("luna_whale_poster.webp", 400, 600, "Luna & The Cloud Whale", "Slumber Isles", (15, 20, 48), (35, 45, 100), (245, 197, 68)),
        ("luna_whale_thumb.webp", 640, 360, "Luna & The Cloud Whale", "Ep 1: The Starwhale", (18, 25, 55), (32, 48, 105), (245, 197, 68)),

        # Featured: Pip & The Whispering Woods
        ("pip_woods_banner.webp", 1280, 720, "Pip & The Whispering Woods", "Calm Bedtime Series", (18, 30, 45), (25, 55, 65), (245, 197, 68)),
        ("pip_woods_poster.webp", 400, 600, "Pip & The Whispering Woods", "Lullaby Rhythm", (18, 30, 45), (25, 55, 65), (245, 197, 68)),
        ("pip_ep1_thumb.webp", 640, 360, "Ep 1: The Mossy Pillow", "Gentle River Lullaby", (20, 35, 50), (30, 60, 70), (245, 197, 68)),
        ("pip_ep2_thumb.webp", 640, 360, "Ep 2: Firefly Lanterns", "Soft Chimes & Hush", (25, 25, 55), (45, 35, 80), (245, 197, 68)),
        ("pip_ep3_thumb.webp", 640, 360, "Ep 3: The Singing Willow", "Acoustic Strings", (20, 30, 50), (35, 50, 75), (245, 197, 68)),
        ("pip_ep4_thumb.webp", 640, 360, "Ep 4: Night Rain on Acorn", "Calming Ambient Rain", (15, 25, 40), (25, 45, 65), (245, 197, 68)),
        ("pip_trailer_thumb.webp", 640, 360, "Pip: Official Teaser", "Trailer • 2m 15s", (22, 28, 52), (38, 48, 85), (245, 197, 68)),

        # New Releases
        ("pip_hedgehog_thumb.webp", 640, 360, "Pip the Sleepy Hedgehog", "Gentle Woodland Lullaby", (25, 20, 45), (45, 30, 70), (245, 197, 68)),
        ("moonlit_train_thumb.webp", 640, 360, "Moonlit Train to Dreamland", "Cosmic rhythm • Calming chimes", (12, 18, 42), (24, 38, 85), (245, 197, 68)),
        ("starry_kitchen_thumb.webp", 640, 360, "Starry Kitchen with Chef Mochi", "Warm milk & dreams", (40, 20, 25), (75, 35, 40), (245, 197, 68)),
        ("whispering_woods_thumb.webp", 640, 360, "Tales of Whispering Woods", "Nature ambiance • Deep slumber", (15, 30, 35), (25, 60, 55), (245, 197, 68)),

        # Bedtime Stories & Calming Sounds
        ("sleepy_river_thumb.webp", 640, 360, "Sleepy River Lullabies", "Gentle babbling stream", (15, 25, 55), (25, 50, 95), (245, 197, 68)),
        ("counting_sheep_thumb.webp", 640, 360, "The Boy Who Counted Sheep", "Bedtime fable • Guided counting", (18, 22, 48), (35, 40, 85), (245, 197, 68)),
        ("quiet_ocean_thumb.webp", 640, 360, "Quiet Ocean Wonders", "Deep sea whale humming", (8, 22, 45), (15, 45, 80), (245, 197, 68)),
        ("cozy_burrow_thumb.webp", 640, 360, "The Cozy Burrow Bedtime", "Snug burrow tale • Warm acoustic", (35, 25, 20), (65, 45, 30), (245, 197, 68)),

        # Learning & Discovery
        ("professor_owl_thumb.webp", 640, 360, "Professor Owl's Cosmic Shapes", "Geometry in the stars", (20, 20, 50), (40, 35, 85), (245, 197, 68)),
        ("little_botanist_thumb.webp", 640, 360, "Little Botanist: Why Trees Sleep", "Gentle science wonder", (15, 35, 35), (25, 65, 50), (245, 197, 68)),
        ("colors_twilight_thumb.webp", 640, 360, "Colors of the Deep Twilight", "Art & color recognition", (35, 18, 45), (70, 30, 75), (245, 197, 68)),
        ("number_stars_thumb.webp", 640, 360, "Number Stars", "Gentle rhythmic counting", (25, 25, 55), (50, 40, 90), (245, 197, 68)),

        # Posters for Search Grid (Image 1)
        ("starlight_forest_poster.webp", 400, 600, "Starlight Forest Lullabies", "Ages 4+ • 15m", (15, 25, 45), (25, 50, 80), (245, 197, 68)),
        ("little_star_poster.webp", 400, 600, "Journey of the Little Star", "Ages 3+ • 18m", (20, 18, 45), (40, 35, 85), (245, 197, 68)),
        ("star_catcher_poster.webp", 400, 600, "The Star Catcher's Dream", "Ages 5+ • 22m", (25, 22, 50), (55, 45, 90), (245, 197, 68)),
        ("whistling_bay_poster.webp", 400, 600, "Nighttime at Whistling Bay", "Ages 2+ • 12m", (10, 25, 45), (20, 50, 80), (245, 197, 68)),
        ("little_panda_poster.webp", 400, 600, "Little Panda's Starry Dream", "Ages 3+ • 16m", (18, 30, 35), (30, 55, 60), (245, 197, 68)),
        ("cosmic_bear_poster.webp", 400, 600, "Cosmic Bear's Bedtime", "Ages 4+ • 20m", (15, 20, 48), (30, 40, 88), (245, 197, 68)),
        ("cotton_wool_poster.webp", 400, 600, "Clouds of Cotton Wool", "Ages 3+ • 14m", (22, 28, 55), (45, 55, 95), (245, 197, 68)),
        ("old_oak_poster.webp", 400, 600, "Old Oak's Lullaby Chimes", "Ages 4+ • 25m", (30, 25, 25), (55, 45, 35), (245, 197, 68)),
    ]

    for item in assets:
        create_storybook_asset(*item)

    print("✅ All bedtime storybook assets created successfully!")


if __name__ == "__main__":
    main()
