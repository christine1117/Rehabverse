try:
    from PIL import Image
except Exception as e:
    print("NO_PIL", e)
    raise SystemExit

im = Image.open('logo.png').convert('RGBA')
alpha = im.split()[3]
mn, mx = alpha.getextrema()
print('SIZE', im.size, 'ALPHA_EXTREMA', (mn, mx))

if mx == 0:
    print('fully transparent?!')
elif mn == mx == 255:
    # no transparency -> trim near-white/near-black border by luminance difference from corner color
    from PIL import ImageChops
    bg = Image.new('RGBA', im.size, im.getpixel((0, 0)))
    diff = ImageChops.difference(im, bg).convert('L')
    bbox = diff.point(lambda p: 255 if p > 12 else 0).getbbox()
    print('COLOR_BBOX', bbox)
    if bbox:
        im.crop(bbox).save('logo_trim.png')
        print('saved logo_trim.png', Image.open('logo_trim.png').size)
else:
    bbox = alpha.getbbox()
    print('ALPHA_BBOX', bbox)
    if bbox:
        im.crop(bbox).save('logo_trim.png')
        print('saved logo_trim.png', Image.open('logo_trim.png').size)
