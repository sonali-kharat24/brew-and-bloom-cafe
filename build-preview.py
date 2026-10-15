#!/usr/bin/env python3
"""Bundle the Brew & Bloom site into ONE self-contained HTML file.

Why: a single file can be opened by double-clicking it or hosted as a preview,
with no folders (css/, js/, assets/) that can go missing.

Run from the project folder:   python3 tools/build-preview.py
Creates:  brew-and-bloom-standalone.html   (open this in any browser)
Optional: python3 tools/build-preview.py --fragment out.html   (for page hosts that add their own <html>/<head>)
"""
import base64, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
read = lambda p: (ROOT / p).read_text(encoding='utf-8')

# 1. every SVG in assets/ becomes a data: URI
assets = {}
for f in sorted((ROOT / 'assets').glob('*.svg')):
    assets[f.name] = 'data:image/svg+xml;base64,' + base64.b64encode(f.read_bytes()).decode()

html = read('index.html')
css = read('css/styles.css')
data_js = read('js/data.js')
main_js = read('js/main.js')

# 2. image paths in the HTML and in main.js
html = re.sub(r'src="assets/([\w-]+\.svg)"', lambda m: f'src="{assets[m.group(1)]}"', html)
main_js, n = re.subn(r"'assets/' \+ ([\w.]+)", r"ASSETS[\1]", main_js)
assert n >= 4, 'expected image lookups in main.js'
assets_js = 'const ASSETS = ' + __import__('json').dumps(assets) + ';\n'

# 3. page links work inside a hosted preview frame: scroll smoothly ourselves
main_js += '''
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  var t = document.getElementById(a.getAttribute('href').slice(1));
  if (!t) return;
  e.preventDefault();
  t.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
'''

# 4. take just the <body> markup (without the script tags)
body = html.split('<body>')[1].split('<script src="js/data.js">')[0]

fonts = re.search(r'<link href="(https://fonts\.googleapis\.com[^"]+)" rel="stylesheet">', html).group(1)
title = 'Brew &amp; Bloom'
inner = f'''<link rel="stylesheet" href="{fonts}">
<style>
{css}
</style>
{body}
<script>
{assets_js}{data_js}
{main_js}
</script>'''

if len(sys.argv) > 2 and sys.argv[1] == '--fragment':
    # No contact links in a hosted frame (mailto:/tel: are unreliable there): show as plain text
    inner = inner.replace("el('li', {}, el('a', { href: 'tel:' + site.phone.replace(/[^\\d+]/g, ''), text: site.phone })),",
                          "el('li', { text: site.phone }),")
    inner = inner.replace("el('li', {}, el('a', { href: 'mailto:' + site.email, text: site.email })),",
                          "el('li', { text: site.email }),")
    assert 'mailto:' not in inner and "'tel:'" not in inner
    out = f'<title>{title}</title>\n<script>document.documentElement.classList.add("js");</script>\n' + inner
    pathlib.Path(sys.argv[2]).write_text(out, encoding='utf-8')
    print('wrote', sys.argv[2], len(out) // 1024, 'KB')
else:
    out = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Good coffee. Slow mornings. Beautiful moments.</title>
<script>document.documentElement.classList.add("js");</script>
{inner.split("<style>")[0]}<style>
{css}
</style>
</head>
<body>
{body}
<script>
{assets_js}{data_js}
{main_js}
</script>
</body>
</html>'''
    (ROOT / 'brew-and-bloom-standalone.html').write_text(out, encoding='utf-8')
    print('wrote brew-and-bloom-standalone.html', len(out) // 1024, 'KB')
