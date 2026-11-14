"""Storyboard sheet: python tools/storyboard.py out.jpg  (frames from out/sb/)"""
import sys
from PIL import Image, ImageDraw, ImageFont
SH = [
 ('0.75', '1', '0:00–0:01', 'Table switches on; the New Haven Union', 'wide, glide in', '(starter click, hum)'),
 ('7.7', '2', '0:01–0:08', 'Loupe on the headline; lines light; 0 lifts out', 'push into the lens', '"…Titanic afloat. No lives lost."'),
 ('13.6', '3', '0:08–0:15', 'Glass negative turns positive; into the photo', 'dolly + parallax', '"In New York, crowds push into the White Star Line\'s office…"'),
 ('16.6', '4', '0:15–0:19', 'Back on the Union: ALREADY SUNK pinned to its date', 'medium, held', '"But the ship had sunk before dawn…"'),
 ('20.9', '5', '0:19–0:23', 'New-York Tribune: 1,340 lights; the count climbs', 'table glide', '"Tuesday morning… 1,340 perish."'),
 ('24.6', '6', '0:23–0:27', 'Medford Mail Tribune: 1492', 'table glide', '"In Oregon, the count is 1,492."'),
 ('33.6', '7', '0:27–0:36', 'SIGNATURE: into the lifeboat photograph; 706', 'through the lens', '"The Carpathia picked up 706 people…"'),
 ('42.2', '8', '0:37–0:44', 'Two records held still; 0 struck', 'locked', '"…of 2,223 aboard, 1,517 died."'),
 ('47.5', '9', '0:44–0:50', 'Pull back: the archive index; end card', 'pull back to the whole table', '(piano resolves)'),
]
w, h, cols = 420, 747, 3
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 19)
fr = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
fi = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
cap = 118; rows = (len(SH) + cols - 1) // cols
S = Image.new('RGB', (cols * (w + 24) + 24, rows * (h + cap + 24) + 90), (18, 19, 22)); d = ImageDraw.Draw(S)
d.text((24, 22), 'NO LIVES LOST — storyboard · Archive Light Table · 9:16 Short · ~50 s', font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26), fill=(245, 245, 240))
d.text((24, 58), 'Frames rendered with the film\'s real code (subtitles hidden). Orange = the one signal colour.', font=fr, fill=(170, 170, 170))
def wrap(s, f, mx):
    out, line = [], ''
    for word in s.split():
        if d.textlength(line + ' ' + word, font=f) > mx and line: out.append(line); line = word
        else: line = (line + ' ' + word).strip()
    return out + [line]
for k, (t, n, tm, what, cam, vo) in enumerate(SH):
    x, y = 24 + (k % cols) * (w + 24), 90 + (k // cols) * (h + cap + 24)
    S.paste(Image.open(f'out/sb/t_{t}.jpg').convert('RGB').resize((w, h)), (x, y))
    d.rectangle([x, y, x + 46, y + 32], fill=(255, 90, 31)); d.text((x + 10, y + 5), n, font=fb, fill=(20, 20, 20))
    yy = y + h + 8
    d.text((x, yy), f'{tm} · {cam}', font=fb, fill=(255, 140, 90)); yy += 26
    for L in wrap(what, fr, w)[:2]: d.text((x, yy), L, font=fr, fill=(235, 235, 230)); yy += 21
    for L in wrap(vo, fi, w)[:2]: d.text((x, yy), L, font=fi, fill=(180, 180, 175)); yy += 21
S.save(sys.argv[1], quality=88); print(S.size)
