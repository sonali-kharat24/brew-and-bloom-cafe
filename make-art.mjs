// Generates the illustrated SVG artwork used by the Brew & Bloom demo site.
// Run with:  node tools/make-art.mjs
// (You don't need to run this to use the website — the SVGs are already in /assets.)
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../assets/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// Brand palette + a few supporting food tones
const C = {
  cream: '#F4EBDD', brown: '#49352A', white: '#FFFFFF', sage: '#A5A77B', esp: '#241B17',
  caramel: '#C58B4E', crema: '#B98557', coffee: '#6B4630', milk: '#EADBC4', foam: '#F1E3CC',
  gold: '#D9A05B', goldD: '#B97E36', choc: '#3A261D', blue: '#4B4A7A', wall: '#2B211C',
};

// ---------- tiny helpers ----------
const svg = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
const save = (name, s) => writeFileSync(OUT + name, s);
const r2 = (n) => Math.round(n * 100) / 100;
const circ = (x, y, r, fill, extra = '') => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${fill}" ${extra}/>`;
const ell = (x, y, rx, ry, fill, rot = 0, extra = '') =>
  `<ellipse cx="${r2(x)}" cy="${r2(y)}" rx="${r2(rx)}" ry="${r2(ry)}" fill="${fill}" transform="rotate(${rot} ${r2(x)} ${r2(y)})" ${extra}/>`;
const rect = (x, y, w, h, fill, rx = 0, extra = '') =>
  `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${rx}" fill="${fill}" ${extra}/>`;
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, stroke, w, extra = '') =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${r2(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

// deterministic pseudo-random so the art is identical on every run
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// ---------- building blocks ----------
function sprig(x, y, s, rot = 0, color = C.sage) {
  let g = line(`M0 0 C ${s * 0.1} ${-s * 0.4}, ${s * 0.05} ${-s * 0.7}, ${s * 0.15} ${-s}`, color, s * 0.03);
  [[0.25, -1], [0.4, 1], [0.55, -1], [0.7, 1], [0.85, -1]].forEach(([t, side]) => {
    g += ell(s * 0.08 * side + s * 0.1 * t, -s * t, s * 0.12, s * 0.05, color, side * 30);
  });
  return `<g transform="translate(${x} ${y}) rotate(${rot})">${g}</g>`;
}

function plant(x, y, s) {
  let g = path(`M${x - s * 0.14} ${y - s * 0.2} H${x + s * 0.14} L${x + s * 0.1} ${y} H${x - s * 0.1} Z`, C.cream);
  [-50, -25, 0, 25, 50].forEach((a, i) => {
    g += ell(x + Math.sin((a * Math.PI) / 180) * s * 0.28, y - s * 0.2 - Math.cos((a * Math.PI) / 180) * s * 0.28, s * 0.07, s * 0.22 - Math.abs(a) * 0.0012 * s, i % 2 ? C.sage : '#8F9266', a);
  });
  return g;
}

function pendant(x, len, w = 70, color = C.cream) {
  return line(`M${x} 0 V${len}`, color, 3) + path(`M${x - w / 2} ${len + w * 0.5} A${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${len + w * 0.5} Z`, color) + circ(x, len + w * 0.55, w * 0.1, '#FFE9B8');
}

function archWindow(x, y, w, h, sky = C.cream, frame = C.brown) {
  const r = w / 2;
  const d = `M${x} ${y + h} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h} Z`;
  return (
    path(d, sky) +
    circ(x + w * 0.68, y + h * 0.32, w * 0.16, '#FFFFFF', 'opacity=".75"') +
    path(`M${x} ${y + h * 0.78} q${w * 0.25} -${h * 0.08} ${w * 0.5} 0 t${w * 0.5} 0 V${y + h} H${x} Z`, C.sage, 'opacity=".55"') +
    line(`M${x + w / 2} ${y} V${y + h} M${x} ${y + h * 0.5} H${x + w}`, frame, w * 0.03) +
    path(d, 'none', `stroke="${frame}" stroke-width="${w * 0.05}"`)
  );
}

const beam = (pts, opacity = 0.16, fill = '#FFF4D6') => `<polygon points="${pts}" fill="${fill}" opacity="${opacity}"/>`;

function steam(x, y, s, color = C.cream) {
  return [0, 1, 2].map((i) =>
    line(`M${x + (i - 1) * s * 0.22} ${y} c ${s * 0.1} ${-s * 0.12}, ${-s * 0.1} ${-s * 0.24}, 0 ${-s * 0.36} s ${-s * 0.1} ${-s * 0.24}, 0 ${-s * 0.36}`, color, s * 0.025, 'opacity=".45"')
  ).join('');
}

function sideCup(cx, cy, s, liquid = C.coffee) {
  // cy is the table line the saucer sits on
  const w = s * 0.62, h = s * 0.46;
  return (
    ell(cx, cy + s * 0.02, s * 0.5, s * 0.07, 'rgba(0,0,0,.25)') +
    ell(cx, cy - s * 0.02, s * 0.46, s * 0.07, C.white) +
    `<path d="M${cx + w / 2 - 2} ${cy - h * 0.8} c ${s * 0.26} ${-s * 0.04}, ${s * 0.26} ${s * 0.3}, ${-s * 0.1} ${s * 0.3}" fill="none" stroke="${C.white}" stroke-width="${s * 0.06}" stroke-linecap="round"/>` +
    path(`M${cx - w / 2} ${cy - h - s * 0.04} H${cx + w / 2} C${cx + w / 2} ${cy - h * 0.2}, ${cx + w * 0.3} ${cy - s * 0.03}, ${cx} ${cy - s * 0.03} C${cx - w * 0.3} ${cy - s * 0.03}, ${cx - w / 2} ${cy - h * 0.2}, ${cx - w / 2} ${cy - h - s * 0.04} Z`, C.white) +
    ell(cx, cy - h - s * 0.04, w / 2, s * 0.05, liquid)
  );
}

// ---------- drinks & food (used for menu thumbnails and best-seller art) ----------
function rosetta(cx, cy, r) {
  let g = '';
  for (let i = 0; i < 5; i++) g += ell(cx, cy - r * 0.5 + i * r * 0.22, r * (0.62 - 0.07 * i), r * 0.15, C.cream);
  return g + line(`M${cx} ${cy - r * 0.62} V${cy + r * 0.62}`, C.coffee, r * 0.04, 'opacity=".65"');
}

function hotCup(cx, cy, s, kind) {
  const R = s / 2;
  const sc = kind === 'espresso' ? 0.78 : 1;
  const cupR = R * 0.74 * sc, liqR = cupR * 0.84, sR = R * (kind === 'espresso' ? 0.82 : 1);
  const liquid = { espresso: '#3A2116', cappuccino: C.crema, latte: '#C9A072', caramel: C.caramel, mocha: '#4A2C1F' }[kind];
  let g = ell(cx + R * 0.07, cy + R * 0.1, sR, sR * 0.98, 'rgba(36,27,23,.2)');
  g += circ(cx, cy, sR, C.white, `stroke="${C.brown}" stroke-opacity=".22" stroke-width="2"`);
  g += circ(cx, cy, sR * 0.78, 'none', `stroke="${C.brown}" stroke-opacity=".08" stroke-width="2"`);
  g += rect(cx + cupR - 6, cy - R * 0.11, R * 0.34, R * 0.22, C.white, R * 0.1, `stroke="${C.brown}" stroke-opacity=".22" stroke-width="2"`);
  g += circ(cx, cy, cupR, C.white, `stroke="${C.brown}" stroke-opacity=".22" stroke-width="2"`);
  g += circ(cx, cy, cupR * 0.93, '#F3EEE6');
  g += circ(cx, cy, liqR, liquid);
  if (kind === 'espresso') {
    g += circ(cx, cy, liqR * 0.8, '#8B5A35', 'opacity=".55"') + ell(cx - liqR * 0.2, cy - liqR * 0.25, liqR * 0.3, liqR * 0.14, '#C58B4E', -25, 'opacity=".6"');
  } else if (kind === 'cappuccino') {
    g += circ(cx, cy, liqR * 0.8, C.foam) + circ(cx, cy, liqR * 0.8, 'none', `stroke="${C.crema}" stroke-width="${liqR * 0.04}" opacity=".6"`);
    g += line(`M${cx - liqR * 0.4} ${cy} q${liqR * 0.2} ${-liqR * 0.3} ${liqR * 0.4} 0 t${liqR * 0.4} 0`, C.crema, liqR * 0.05, 'opacity=".5"');
  } else if (kind === 'latte') {
    g += rosetta(cx, cy, liqR);
  } else if (kind === 'caramel') {
    g += circ(cx, cy, liqR * 0.8, C.foam);
    let d = `M${cx - liqR * 0.6} ${cy - liqR * 0.45}`;
    for (let i = 0; i < 6; i++) d += ` L${cx + (i % 2 ? -1 : 1) * liqR * 0.6} ${cy - liqR * 0.45 + (i + 1) * liqR * 0.18}`;
    g += line(d, '#8A4F1F', liqR * 0.06);
  } else if (kind === 'mocha') {
    g += circ(cx, cy, liqR * 0.8, '#E9D7BE');
    let d = `M${cx} ${cy}`;
    for (let t = 0; t < 14; t += 0.2) d += ` L${cx + Math.cos(t) * t * liqR * 0.05} ${cy + Math.sin(t) * t * liqR * 0.05}`;
    g += line(d, '#4A2C1F', liqR * 0.05);
  }
  return g;
}

function icedGlass(cx, cy, s, kind) {
  const w = s * 0.5, h = s * 0.92, top = cy - h / 2, bot = cy + h / 2, bw = w * 0.76;
  const shape = `M${cx - w / 2} ${top} L${cx + w / 2} ${top} L${cx + bw / 2} ${bot} L${cx - bw / 2} ${bot} Z`;
  const id = `clip-${kind}`;
  const lt = top + h * 0.1;
  let inner = '';
  if (kind === 'americano') {
    inner += rect(cx - w, lt, w * 2, h, '#4A2C1F') + rect(cx - w, lt, w * 2, h * 0.25, C.coffee, 0, 'opacity=".7"');
  } else if (kind === 'latte') {
    inner += rect(cx - w, lt, w * 2, h, C.milk);
    inner += path(`M${cx - w} ${lt} H${cx + w} V${lt + h * 0.3} q${-w * 0.5} ${h * 0.1} ${-w} 0 t${-w} 0 Z`, C.coffee);
  } else {
    inner += rect(cx - w, lt, w * 2, h, '#A47751');
    inner += path(`M${cx - w} ${lt} H${cx + w} V${lt + h * 0.12} q${-w * 0.5} ${h * 0.06} ${-w} 0 t${-w} 0 Z`, C.foam);
  }
  const ice = [[-0.18, 0.12, 20], [0.12, 0.2, -14], [-0.08, 0.42, 10], [0.16, 0.5, 28], [-0.2, 0.66, -22]]
    .map(([dx, dy, a]) => rect(cx + dx * w - w * 0.13, top + dy * h, w * 0.26, w * 0.26, '#FFFFFF', 6, `opacity=".38" transform="rotate(${a} ${cx + dx * w} ${top + dy * h + w * 0.13})"`))
    .join('');
  let g = ell(cx, bot + 6, bw * 0.7, 10, 'rgba(36,27,23,.25)');
  g += `<clipPath id="${id}"><path d="${shape}"/></clipPath><g clip-path="url(#${id})">${inner}${ice}</g>`;
  g += path(shape, 'rgba(255,255,255,.1)', 'stroke="rgba(255,255,255,.75)" stroke-width="4" stroke-linejoin="round"');
  g += line(`M${cx - w * 0.36} ${top + h * 0.15} L${cx - bw * 0.34} ${bot - h * 0.1}`, '#FFFFFF', 5, 'opacity=".45"');
  g += line(`M${cx + w * 0.08} ${bot - h * 0.12} L${cx + w * 0.3} ${top - h * 0.14}`, C.sage, w * 0.07);
  if (kind === 'coldcoffee') g += circ(cx, lt - 4, w * 0.16, C.foam) + line(`M${cx - w * 0.3} ${lt + h * 0.14} q${w * 0.15} ${h * 0.05} ${w * 0.3} 0 t${w * 0.3} 0`, '#4A2C1F', 4);
  return g;
}

function croissant(cx, cy, s) {
  let g = ell(cx + s * 0.03, cy + s * 0.12, s * 0.5, s * 0.1, 'rgba(36,27,23,.2)');
  const sizes = [[0.15, 0.1], [0.19, 0.14], [0.26, 0.2], [0.19, 0.14], [0.15, 0.1]];
  for (let k = -2; k <= 2; k++) {
    const [rx, ry] = sizes[k + 2];
    const x = cx + k * 0.19 * s, y = cy + k * k * 0.04 * s;
    g += ell(x, y, rx * s, ry * s, C.gold, k * 16, `stroke="${C.goldD}" stroke-width="${s * 0.012}"`);
    g += ell(x - rx * s * 0.1, y - ry * s * 0.3, rx * s * 0.6, ry * s * 0.22, '#EDBF7E', k * 16, 'opacity=".8"');
  }
  return g;
}

function plate(cx, cy, r) {
  return ell(cx + r * 0.05, cy + r * 0.08, r, r * 0.98, 'rgba(36,27,23,.18)') + circ(cx, cy, r, C.white, `stroke="${C.brown}" stroke-opacity=".2" stroke-width="2"`) + circ(cx, cy, r * 0.78, 'none', `stroke="${C.brown}" stroke-opacity=".08" stroke-width="2"`);
}

function brownie(cx, cy, s) {
  let g = plate(cx, cy, s * 0.52);
  g += `<g transform="rotate(-8 ${cx} ${cy})">${rect(cx - s * 0.3, cy - s * 0.28, s * 0.6, s * 0.56, C.choc, s * 0.04)}${rect(cx - s * 0.26, cy - s * 0.24, s * 0.52, s * 0.18, '#523428', s * 0.03, 'opacity=".8"')}`;
  g += [[-0.12, 0.05], [0.1, -0.02], [0.0, 0.14], [-0.15, 0.17], [0.14, 0.15]].map(([dx, dy]) => ell(cx + dx * s, cy + dy * s, s * 0.05, s * 0.02, '#6B4630', 20)).join('') + '</g>';
  return g;
}

function cheesecake(cx, cy, s) {
  let g = plate(cx, cy + s * 0.05, s * 0.55);
  const x0 = cx - s * 0.32, w = s * 0.64, y0 = cy - s * 0.2;
  g += rect(x0, y0, w, s * 0.34, '#F1E2C0', s * 0.02);
  g += rect(x0, y0 + s * 0.28, w, s * 0.1, '#8A5A3C', s * 0.02);
  g += path(`M${x0} ${y0} H${x0 + w} V${y0 + s * 0.08} q${-w * 0.12} ${s * 0.06} ${-w * 0.2} ${s * 0.02} t${-w * 0.25} ${-s * 0.01} t${-w * 0.2} ${s * 0.04} t${-w * 0.23} ${-s * 0.03} Z`, C.blue);
  const r = rng(11);
  for (let i = 0; i < 7; i++) g += circ(x0 + w * (0.08 + i * 0.13), y0 - s * 0.01 + r() * s * 0.03, s * 0.04, '#34345E');
  return g;
}

function cookie(cx, cy, s) {
  const r = rng(5);
  let g = plate(cx, cy, s * 0.52) + circ(cx, cy, s * 0.36, '#C98B4F', `stroke="#A9692F" stroke-width="${s * 0.015}"`) + circ(cx - s * 0.06, cy - s * 0.07, s * 0.24, '#D69B60', 'opacity=".6"');
  for (let i = 0; i < 11; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * s * 0.28;
    g += ell(cx + Math.cos(a) * d, cy + Math.sin(a) * d, s * 0.045, s * 0.03, C.choc, r() * 90);
  }
  return g;
}

// per-menu-item definitions (shared by thumbnails + best-sellers)
const items = {
  espresso: (cx, cy, s) => hotCup(cx, cy, s, 'espresso'),
  cappuccino: (cx, cy, s) => hotCup(cx, cy, s, 'cappuccino'),
  latte: (cx, cy, s) => hotCup(cx, cy, s, 'latte'),
  caramel: (cx, cy, s) => hotCup(cx, cy, s, 'caramel'),
  mocha: (cx, cy, s) => hotCup(cx, cy, s, 'mocha'),
  americano: (cx, cy, s) => icedGlass(cx, cy, s, 'americano'),
  icedlatte: (cx, cy, s) => icedGlass(cx, cy, s, 'latte'),
  coldcoffee: (cx, cy, s) => icedGlass(cx, cy, s, 'coldcoffee'),
  croissant: (cx, cy, s) => plate(cx, cy, s * 0.55) + croissant(cx, cy, s * 0.85),
  brownie, cheesecake, cookie,
};

// a framed "product shot" background + subject
function itemScene(name, w, h, bg, draw, scale = 0.64, dark = false) {
  const m = Math.min(w, h);
  const body =
    rect(0, 0, w, h, bg) +
    circ(w / 2, h / 2, m * 0.46, dark ? '#4F3A2F' : 'rgba(255,255,255,.35)') +
    sprig(w * 0.1, h * 0.95, m * 0.35, 12, dark ? C.sage : '#8F9266') +
    sprig(w * 0.93, h * 0.12, m * 0.25, 190, dark ? C.sage : '#8F9266') +
    draw(w / 2, h / 2, m * scale);
  save(name, svg(w, h, body));
}

const menuBgs = [C.cream, '#E7D9C2', '#C9CAA3', C.cream];
const menuKeys = ['espresso', 'cappuccino', 'latte', 'caramel', 'mocha', 'americano', 'icedlatte', 'coldcoffee', 'croissant', 'brownie', 'cheesecake', 'cookie'];
menuKeys.forEach((k, i) => itemScene(`item-${k}.svg`, 600, 600, menuBgs[i % 4], items[k], ['americano', 'icedlatte', 'coldcoffee'].includes(k) ? 0.7 : 0.62));

// best sellers (portrait)
itemScene('best-caramel.svg', 800, 1000, '#C9CAA3', items.caramel, 0.78);
itemScene('best-icedlatte.svg', 800, 1000, C.brown, items.icedlatte, 0.86, true);
itemScene('best-croissant.svg', 800, 1000, '#E7D9C2', items.croissant, 0.82);

// ---------- scenes ----------
// Hero (wide)
{
  const W = 1600, H = 1000;
  let g = rect(0, 0, W, H, C.wall);
  g += archWindow(780, 130, 300, 560) + archWindow(1140, 130, 300, 560);
  g += beam('780,690 1080,690 1180,1000 640,1000', 0.13) + beam('1140,690 1440,690 1560,1000 1060,1000', 0.1);
  g += pendant(900, 70, 70) + pendant(1260, 40, 70);
  g += rect(0, 690, W, 310, C.brown) + rect(0, 690, W, 10, '#5B4437');
  g += rect(0, 820, W, 4, 'rgba(0,0,0,.15)');
  g += plant(1500, 690, 280) + plant(700, 690, 170);
  g += steam(1010, 560, 160) + sideCup(1010, 800, 230, '#6B4630');
  g += plate(1290, 850, 120) + croissant(1290, 850, 190);
  g += sideCup(1440, 880, 150, '#3A2116');
  save('hero.svg', svg(W, H, g));
}

// Story: portrait interior
{
  const W = 800, H = 1000;
  let g = rect(0, 0, W, H, C.sage);
  g += archWindow(240, 110, 320, 560, C.cream, C.brown);
  g += beam('240,670 560,670 700,1000 100,1000', 0.2);
  g += pendant(130, 80, 60);
  g += pendant(680, 40, 60, C.cream);
  g += rect(0, 700, W, 300, C.brown) + rect(0, 700, W, 8, '#5B4437');
  g += plant(90, 700, 260);
  // round table with two cups
  g += rect(280, 840, 24, 160, C.esp) + ell(292, 1000, 90, 12, C.esp) + ell(300, 830, 190, 26, '#6B4630') + ell(300, 822, 190, 26, '#7A5439');
  g += sideCup(230, 818, 120, '#6B4630') + sideCup(380, 822, 110, '#3A2116') + steam(230, 700, 110);
  save('story-main.svg', svg(W, H, g));
}

// Story: small top-down shot
{
  const W = 600, H = 600;
  let g = rect(0, 0, W, H, C.brown);
  g += rect(0, 0, W, H, '#523C30', 0, 'opacity=".5"');
  g += hotCup(220, 300, 330, 'latte') + plate(430, 360, 120) + croissant(430, 360, 190);
  g += sprig(60, 560, 220, 12) + sprig(560, 70, 150, 200);
  save('story-small.svg', svg(W, H, g));
}

// Gallery
{
  // 1. coffee preparation (tall)
  const W = 800, H = 1000;
  let g = rect(0, 0, W, H, C.esp);
  g += rect(0, 0, W, 360, '#2F231D');
  g += rect(250, 120, 300, 120, '#8C8C8C') + rect(250, 120, 300, 20, '#B5B5B5') + rect(330, 240, 140, 40, '#6E6E6E', 6);
  g += rect(310, 290, 180, 46, '#1A1310', 10) + rect(480, 304, 190, 18, '#1A1310', 9);
  g += rect(392, 336, 8, 250, '#6B4630', 3) + rect(404, 336, 5, 250, '#8B5A35', 2);
  [[380, 400], [420, 470], [388, 540]].forEach(([x, y]) => (g += ell(x, y, 5, 8, '#8B5A35')));
  g += rect(0, 700, W, 300, C.brown) + rect(0, 700, W, 8, '#5B4437');
  g += sideCup(400, 760, 300, '#3A2116') + steam(400, 560, 160);
  save('g-prep.svg', svg(W, H, g));
}
// 2. latte art close-up (square)
{
  const W = 800, H = 800;
  let g = rect(0, 0, W, H, C.brown) + circ(400, 400, 360, '#523C30');
  g += hotCup(400, 400, 640, 'latte');
  g += rect(620, 640, 200, 22, C.sage, 11, 'transform="rotate(-35 700 650)"');
  save('g-latteart.svg', svg(W, H, g));
}
// 3. pastries (wide)
{
  const W = 1000, H = 700;
  let g = rect(0, 0, W, H, '#E7D9C2') + rect(60, 60, 880, 580, C.brown, 14) + rect(78, 78, 844, 544, '#5B4437', 8);
  g += croissant(250, 230, 250) + croissant(250, 470, 250) + brownie(520, 250, 230) + cookie(780, 240, 220) + cheesecake(560, 480, 260) + cookie(820, 480, 200);
  g += sprig(40, 680, 220, 12);
  save('g-pastry.svg', svg(W, H, g));
}
// 4. cozy interior (wide)
{
  const W = 1000, H = 700;
  let g = rect(0, 0, W, H, C.sage);
  g += archWindow(110, 90, 190, 360) + archWindow(650, 90, 190, 360);
  g += rect(330, 120, 280, 8, C.brown) + [0, 1, 2, 3].map((i) => sideCup(375 + i * 70, 120, 56, C.coffee)).join('');
  g += rect(0, 450, W, 250, C.brown) + rect(0, 450, W, 8, '#5B4437');
  g += pendant(420, 0, 60) + pendant(560, 0, 60);
  g += plant(900, 450, 240) + plant(40, 450, 180);
  [[200, 600], [780, 600]].forEach(([x, y]) => {
    g += ell(x, y + 6, 160, 26, '#7A5439') + rect(x - 8, y + 20, 16, 80, C.esp) + sideCup(x - 40, y + 2, 80) + sideCup(x + 45, y + 2, 70, '#3A2116');
  });
  save('g-interior.svg', svg(W, H, g));
}
// 5. sunlight on the table (square)
{
  const W = 800, H = 800;
  let g = rect(0, 0, W, H, '#3A2C24');
  g += rect(0, 0, W, H, '#6B4630', 0, 'opacity=".25"');
  g += `<g opacity=".2" fill="#FFF4D6"><polygon points="0,0 220,0 800,600 800,800 560,800 0,260"/><polygon points="280,0 420,0 800,380 800,480"/></g>`;
  g += `<g opacity=".28" fill="${C.esp}"><ellipse cx="330" cy="560" rx="150" ry="46" transform="rotate(30 330 560)"/><ellipse cx="560" cy="330" rx="100" ry="34" transform="rotate(30 560 330)"/></g>`;
  g += hotCup(300, 470, 300, 'cappuccino') + hotCup(580, 230, 220, 'espresso');
  g += sprig(740, 780, 220, 200);
  save('g-sunlight.svg', svg(W, H, g));
}
// 6. seating (tall)
{
  const W = 800, H = 1000;
  let g = rect(0, 0, W, H, '#E7D9C2');
  g += rect(0, 700, W, 300, '#8A6A55') + rect(0, 700, W, 8, '#6B4C3A');
  g += archWindow(250, 100, 300, 520, C.cream, C.brown) + beam('250,620 550,620 700,1000 120,1000', 0.18, '#FFF4D6');
  const chair = (x, col) =>
    rect(x - 130, 590, 260, 190, col, 40) + rect(x - 160, 700, 320, 90, col, 28) + rect(x - 140, 780, 14, 120, C.esp) + rect(x + 126, 780, 14, 120, C.esp) + rect(x - 110, 735, 220, 30, 'rgba(255,255,255,.12)', 14);
  g += chair(190, C.brown);
  g += ell(580, 800, 110, 18, C.esp, 0, 'opacity=".9"') + rect(572, 800, 16, 130, C.esp) + sideCup(580, 790, 90, C.coffee) + steam(580, 700, 90, C.brown);
  g += plant(700, 700, 360);
  save('g-seating.svg', svg(W, H, g));
}

console.log('Artwork written to', OUT);
