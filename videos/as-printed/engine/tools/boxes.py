"""Draw candidate boxes on a scan to check them: python3 tools/boxes.py <image> x0,y0,x1,y1 [...] [--out preview.jpg]
Coordinates in source pixels. The preview is downscaled to 1400 px wide, boxes in orange."""
import sys
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS = None
a = sys.argv[1:]; out = 'boxes_preview.jpg'
if '--out' in a: i = a.index('--out'); out = a[i + 1]; del a[i:i + 2]
im = Image.open(a[0]).convert('RGB'); d = ImageDraw.Draw(im)
for b in a[1:]:
    x0, y0, x1, y1 = map(float, b.split(',')); d.rectangle([x0, y0, x1, y1], outline=(255, 90, 31), width=max(3, im.size[0] // 500))
im.thumbnail((1400, 100000)); im.save(out, quality=88); print(out, im.size)
