"""Render the home shortcut and trust icons with Pillow, including on Windows."""
from pathlib import Path
from PIL import Image, ImageDraw

output = Path(__file__).resolve().parents[1] / 'assets/customer/icons'
output.mkdir(parents=True, exist_ok=True)
scale = 16

for name in ('truck', 'shield', 'leaf', 'package'):
    canvas = Image.new('RGBA', (24 * scale, 24 * scale))
    draw = ImageDraw.Draw(canvas)

    def line(points, closed=False):
        if closed:
            points = [*points, points[0]]
        draw.line([(int(x * scale), int(y * scale)) for x, y in points],
                  fill='black', width=round(1.7 * scale), joint='curve')

    def circle(x, y, radius):
        draw.ellipse(((x-radius)*scale, (y-radius)*scale,
                      (x+radius)*scale, (y+radius)*scale),
                     outline='black', width=round(1.7 * scale))

    if name == 'truck':
        line([(3, 5), (14, 5), (14, 17), (3, 17), (3, 5)])
        line([(14, 9), (18, 9), (21, 13), (21, 17), (14, 17)])
        line([(1, 9), (7, 9)])
        line([(1, 12), (6, 12)])
        circle(6, 18, 2)
        circle(18, 18, 2)
    elif name == 'shield':
        line([(12, 3), (20, 6), (20, 12), (18, 16), (12, 21),
              (6, 16), (4, 12), (4, 6)], closed=True)
        line([(8, 12), (11, 15), (16, 9)])
    elif name == 'leaf':
        line([(20, 3), (14, 3), (8, 5), (5, 9), (5, 13), (7, 17),
              (11, 18), (15, 16), (18, 11), (20, 3)])
        line([(4, 21), (15, 9)])
    else:
        line([(12, 2), (21, 7), (21, 18), (12, 23), (3, 18), (3, 7)], closed=True)
        line([(3, 7), (12, 12), (21, 7)])
        line([(12, 12), (12, 23)])
        line([(7, 5), (16, 10)])

    canvas.resize((96, 96), Image.Resampling.LANCZOS).save(output / f'{name}.png')

print('Generated 4 home icons')
