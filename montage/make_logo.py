from PIL import Image, ImageDraw
im = Image.open('/root/.claude/uploads/a17f69f2-468f-5400-944e-642294fe6223/8738a81a-image.jpg').convert('RGB')
cx, cy, r = 480, 463, 422
crop = im.crop((cx - r, cy - r, cx + r, cy + r))
mask = Image.new('L', crop.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, crop.size[0] - 1, crop.size[1] - 1), fill=255)
out = Image.new('RGBA', crop.size, (0, 0, 0, 0))
out.paste(crop, (0, 0), mask)
out = out.resize((520, 520), Image.LANCZOS)
out.save('logo_ec.png')
print(out.size)
