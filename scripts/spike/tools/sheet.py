# usage: python3 sheet.py out.png cols "caption=path" ...  -> a labelled grid, each tile scaled to 640 wide
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols, items = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
W = 640
tiles = []
font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 18)
for it in items:
    cap, path = it.split('=', 1)
    im = Image.open(path).convert('RGB')
    im = im.resize((W, int(im.height * W / im.width)))
    t = Image.new('RGB', (W, im.height + 34), 'white')
    t.paste(im, (0, 34))
    ImageDraw.Draw(t).text((8, 7), cap, fill='black', font=font)
    tiles.append(t)
rows = [tiles[i:i + cols] for i in range(0, len(tiles), cols)]
H = sum(max(t.height for t in r) for r in rows) + 12 * len(rows)
sheet = Image.new('RGB', (cols * W + 12 * (cols - 1), H), '#888')
y = 0
for r in rows:
    for j, t in enumerate(r):
        sheet.paste(t, (j * (W + 12), y))
    y += max(t.height for t in r) + 12
sheet.save(out)
print(out, sheet.size)
