# backend/python/app.py
# Usage:
#   python app.py --in_upper in_upper.jpg --in_front in_front.jpg --in_lower in_lower.jpg --out_upper out_upper.png --out_front out_front.png --out_lower out_lower.png

import argparse
from PIL import Image, ImageDraw, ImageFont
import random, os

def annotate_image(in_path, out_path, seed=0):
    img = Image.open(in_path).convert("RGBA")
    w, h = img.size
    draw = ImageDraw.Draw(img)

    random.seed(seed)
    colors = [(255,0,0,200),(0,200,255,200),(255,128,0,200),(180,0,180,200)]
    for i in range(3):
        x1 = int(random.uniform(0.05, 0.6) * w)
        y1 = int(random.uniform(0.05, 0.6) * h)
        x2 = int(min(w, x1 + random.uniform(0.1, 0.35) * w))
        y2 = int(min(h, y1 + random.uniform(0.08, 0.3) * h))
        color = colors[i % len(colors)]
        draw.rectangle([x1, y1, x2, y2], outline=color, width=max(2, int(w/200)))

        label = f"ID{i+1}"
        textsize = max(12, int(w/80))
        try:
            font = ImageFont.truetype("arial.ttf", textsize)
        except:
            font = ImageFont.load_default()

        # Pillow 10+ safe text size
        bbox = draw.textbbox((0, 0), label, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]

        rect_label_bg = (0,0,0,160)
        draw.rectangle([x1, y1 - text_h - 4, x1 + text_w + 6, y1], fill=rect_label_bg)
        draw.text((x1+3, y1 - text_h - 2), label, fill=(255,255,255,255), font=font)

    img.save(out_path, format='PNG')
    print("Annotated", out_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--in_upper', required=True)
    parser.add_argument('--in_front', required=True)
    parser.add_argument('--in_lower', required=True)
    parser.add_argument('--out_upper', required=True)
    parser.add_argument('--out_front', required=True)
    parser.add_argument('--out_lower', required=True)
    args = parser.parse_args()

    annotate_image(args.in_upper, args.out_upper, seed=1)
    annotate_image(args.in_front, args.out_front, seed=2)
    annotate_image(args.in_lower, args.out_lower, seed=3)

if __name__ == '__main__':
    main()
