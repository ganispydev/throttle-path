#!/usr/bin/env python3
import os, io, sys
from PIL import Image, ImageOps
try:
    from rembg import remove
except ImportError:
    print("❌ rembg not installed. Run: pip install rembg pillow onnxruntime")
    sys.exit(1)

# Look for a source logo we can process
CANDIDATES = [
    "assets/logo-source.png",
    "assets/logo-source.jpg",
    "assets/logo-source.jpeg",
    "assets/logo.png",
    "assets/logo.jpg",
    "assets/logo.jpeg",
]
OUT_192 = "assets/logo-192.png"
OUT_512 = "assets/logo-512.png"

def find_input():
    for p in CANDIDATES:
        if os.path.exists(p):
            return p
    print("❌ Put your logo at assets/logo-source.(png|jpg)")
    sys.exit(1)

def remove_bg(pil_img):
    # Run rembg (U²-Net) to get transparency
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    out = remove(buf.getvalue())  # returns PNG bytes with alpha
    result = Image.open(io.BytesIO(out)).convert("RGBA")
    return result

def center_on_square(img_rgba, size, pad_ratio=0.08):
    # Trim any empty transparent area
    bbox = img_rgba.getbbox()
    if bbox:
        img_rgba = img_rgba.crop(bbox)

    pad = int(size * pad_ratio)
    target = size - 2 * pad
    scale = min(target / img_rgba.width, target / img_rgba.height)
    new_w = max(1, int(img_rgba.width * scale))
    new_h = max(1, int(img_rgba.height * scale))
    resized = img_rgba.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas

def make_icon(size, out_path, src_img):
    icon = center_on_square(src_img, size)
    icon.save(out_path, format="PNG")
    print(f"✅ Saved {out_path}")

if __name__ == "__main__":
    in_path = find_input()
    print(f"🖼  Using input: {in_path}")
    base = Image.open(in_path).convert("RGBA")
    cutout = remove_bg(base)  # transparent background, keeps 3D look
    make_icon(192, OUT_192, cutout)
    make_icon(512, OUT_512, cutout)