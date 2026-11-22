// Generates every image the site uses as original SVG art (no third-party images).
// node scripts/generate-art.mjs  ->  public/art/*.svg, public/bg.svg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artDir = path.join(root, 'public', 'art');
fs.mkdirSync(artDir, { recursive: true });

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const PALETTES = [
  ['#0b0b0f', '#e8402b', '#f4efe6', '#f2b33d'],
  ['#1c2b8f', '#e9ecf8', '#5c7cfa', '#0b0b0f'],
  ['#f2f0ea', '#111111', '#d9d4c7', '#9b1b1b'],
  ['#ff4fa3', '#ffe2f0', '#22142b', '#ffd23f'],
  ['#0e3b2e', '#7fd18b', '#f3f1e7', '#ff6b3d'],
  ['#2a1a12', '#e2763a', '#f8d9a0', '#6b2d17'],
  ['#0a7fc0', '#bfe9ff', '#ffffff', '#0b2540'],
  ['#c40d1e', '#120708', '#f2e6dc', '#ff8a3d'],
  ['#6a4cff', '#c9f24c', '#14121f', '#f5f2ff'],
  ['#d8c9b4', '#3b2f26', '#a83c2b', '#f7f2ea'],
];

const styles = {
  rings(r, w, h, p) {
    const cx = w * (0.35 + r() * 0.3), cy = h * (0.35 + r() * 0.3);
    let s = `<rect width="${w}" height="${h}" fill="${p[0]}"/>`;
    const n = 6 + Math.floor(r() * 6);
    for (let i = n; i > 0; i--) s += `<circle cx="${cx}" cy="${cy}" r="${(i / n) * Math.max(w, h) * 0.75}" fill="${p[i % 2 ? 1 : 2]}"/>`;
    return s + `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.06}" fill="${p[3]}"/>`;
  },
  stripes(r, w, h, p) {
    let s = `<rect width="${w}" height="${h}" fill="${p[2]}"/>`;
    const n = 5 + Math.floor(r() * 9); const a = Math.floor(r() * 4) * 45;
    s += `<g transform="rotate(${a} ${w / 2} ${h / 2})">`;
    for (let i = -n; i < n * 2; i++) if (i % 2) s += `<rect x="${(i * w) / n}" y="${-h}" width="${w / n}" height="${h * 3}" fill="${p[i % 3 === 0 ? 0 : 1]}"/>`;
    return s + `</g><rect x="${w * 0.1}" y="${h * 0.72}" width="${w * 0.5}" height="${h * 0.08}" fill="${p[3]}"/>`;
  },
  grid(r, w, h, p) {
    let s = `<rect width="${w}" height="${h}" fill="${p[0]}"/>`;
    const c = 3 + Math.floor(r() * 4), rows = Math.max(2, Math.round((c * h) / w));
    for (let y = 0; y < rows; y++) for (let x = 0; x < c; x++) {
      const k = Math.floor(r() * 4); const pad = w * 0.02;
      s += k === 0 ? '' : `<rect x="${(x * w) / c + pad}" y="${(y * h) / rows + pad}" width="${w / c - pad * 2}" height="${h / rows - pad * 2}" rx="${k === 3 ? w / c / 2 : 0}" fill="${p[k]}"/>`;
    }
    return s;
  },
  sun(r, w, h, p) {
    const hz = h * (0.55 + r() * 0.15);
    return `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#g)"/><circle cx="${w * (0.3 + r() * 0.4)}" cy="${hz}" r="${Math.min(w, h) * 0.22}" fill="${p[3]}"/>` +
      `<rect y="${hz}" width="${w}" height="${h - hz}" fill="${p[2]}"/>` +
      Array.from({ length: 5 }, (_, i) => `<rect y="${hz + (i + 1) * (h - hz) / 6}" width="${w}" height="${(h - hz) / 30 + i}" fill="${p[0]}" opacity=".35"/>`).join('');
  },
  blob(r, w, h, p) {
    let s = `<rect width="${w}" height="${h}" fill="${p[2]}"/>`;
    for (let i = 0; i < 4; i++) {
      const cx = w * r(), cy = h * r(), rx = w * (0.2 + r() * 0.35), ry = h * (0.15 + r() * 0.3);
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${p[i % 4 === 2 ? 0 : i % 4]}" opacity="${0.75 + r() * 0.25}" transform="rotate(${r() * 90} ${cx} ${cy})"/>`;
    }
    return s;
  },
  type(r, w, h, p) {
    const words = ['NO', 'ON', 'XO', 'AV', 'LP', 'EP', 'VOL', 'IV', 'OK'];
    const t = words[Math.floor(r() * words.length)];
    return `<rect width="${w}" height="${h}" fill="${p[0]}"/><text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${Math.min(w, h) * 0.5}" fill="${p[1]}" letter-spacing="-2">${t}</text>` +
      `<rect x="${w * 0.08}" y="${h * 0.08}" width="${w * 0.25}" height="${h * 0.03}" fill="${p[3]}"/>`;
  },
  figure(r, w, h, p) {
    const cx = w * (0.4 + r() * 0.2);
    return `<rect width="${w}" height="${h}" fill="${p[2]}"/><circle cx="${cx}" cy="${h * 0.36}" r="${Math.min(w, h) * 0.16}" fill="${p[0]}"/>` +
      `<path d="M${cx - w * 0.3} ${h} Q${cx} ${h * 0.45} ${cx + w * 0.3} ${h} Z" fill="${p[0]}"/><rect x="${cx - w * 0.14}" y="${h * 0.33}" width="${w * 0.28}" height="${h * 0.05}" fill="${p[1]}"/>`;
  },
  spiral(r, w, h, p) {
    const cx = w / 2, cy = h / 2; let d = `M${cx} ${cy}`;
    for (let a = 0; a < 40; a += 0.2) { const rr = a * Math.min(w, h) * 0.012; d += ` L${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`; }
    return `<rect width="${w}" height="${h}" fill="${p[2]}"/><path d="${d}" fill="none" stroke="${p[0]}" stroke-width="${Math.min(w, h) * 0.04}"/>`;
  },
};
const styleNames = Object.keys(styles);

function svg(seed, w, h, forced) {
  const r = rng(seed * 7919 + 17);
  const p = PALETTES[Math.floor(r() * PALETTES.length)];
  const st = forced || styleNames[Math.floor(r() * styleNames.length)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${styles[st](r, w, h, p)}</svg>\n`;
}

// Thumbnails: same aspect ratios as the reference icons.
const layout = JSON.parse(fs.readFileSync(path.join(root, 'lib', 'layout.json'), 'utf8'));
layout.forEach((it, i) => fs.writeFileSync(path.join(artDir, `p${i}.svg`), svg(i + 1, it.w * 4, it.h * 4)));
// Preview images: 6 per project (square, landscape, portrait) + gallery + bin.
const SHAPES = [[1000, 1000], [1000, 660], [1000, 1250], [1000, 560]];
for (let i = 0; i < layout.length + 2; i++) for (let k = 0; k < 6; k++) {
  const [w, h] = SHAPES[(i + k) % SHAPES.length];
  fs.writeFileSync(path.join(artDir, `p${i}-${k}.svg`), svg(1000 + i * 31 + k * 7, w, h));
}

// Soft-focus background "figure" (original drawing, not the reference photo): a profile facing left with a pale cap,
// sunglasses, face, ear, hair, neck and dark shoulders. 2000x1882 like the reference photo, and the features sit where
// the photo's do (measured at 1440x900 and 3824x1414), so the cover crop reads the same at every screen size.
const bg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1882" width="2000" height="1882">
<defs>
<filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="b2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="28"/></filter>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#dca487"/><stop offset=".45" stop-color="#c98468"/><stop offset="1" stop-color="#9c5a43"/></linearGradient>
<linearGradient id="neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7634a"/><stop offset="1" stop-color="#7d4532"/></linearGradient>
<linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b4029"/><stop offset=".6" stop-color="#4a2b1c"/><stop offset="1" stop-color="#2e1a11"/></linearGradient>
<linearGradient id="cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4e0ef"/><stop offset=".75" stop-color="#d3cce6"/><stop offset="1" stop-color="#b4abcb"/></linearGradient>
<linearGradient id="cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3326"/><stop offset="1" stop-color="#1b1914"/></linearGradient>
</defs>
<rect width="2000" height="1882" fill="#f4f3f2"/>
<g filter="url(#b2)">
<path d="M640 1882 C660 1640 760 1470 960 1400 C1160 1340 1440 1350 1640 1470 C1800 1570 1880 1720 1900 1882 Z" fill="url(#cloth)"/>
</g>
<g filter="url(#b)">
<path d="M700 1040 C730 1180 760 1300 770 1440 L1180 1440 C1160 1330 1150 1220 1170 1110 Z" fill="url(#neck)"/>
<path d="M1000 640 C1150 610 1300 640 1350 740 C1390 840 1380 1000 1330 1090 C1280 1170 1190 1190 1120 1160 C1080 1060 1060 900 1000 640 Z" fill="url(#hair)"/>
<path d="M590 600 C565 640 548 668 545 690 C540 712 532 728 518 745 C510 758 520 772 540 782 C548 795 546 810 552 830 C548 850 556 868 562 880 C556 900 562 920 576 936 C586 960 600 975 622 985 C660 1030 700 1060 760 1100 C850 1150 930 1165 990 1150 C1080 1130 1170 1060 1200 980 L1210 770 C1150 730 1070 690 1000 670 Z" fill="url(#skin)"/>
<ellipse cx="1235" cy="880" rx="55" ry="90" fill="#b66f53"/>
<ellipse cx="1240" cy="885" rx="26" ry="54" fill="#8e4f3a"/>
<path d="M515 545 C640 528 820 538 960 568 C1080 598 1170 650 1250 700 L1240 745 C1170 715 1080 680 990 665 C930 680 880 705 830 715 C740 732 640 722 552 692 C528 668 514 612 515 545 Z" fill="#17110e"/>
<path d="M560 440 C620 290 800 170 1010 150 C1200 140 1350 240 1390 400 C1410 500 1405 620 1380 720 C1300 690 1180 615 1040 585 C900 552 740 540 560 530 Z" fill="url(#cap)"/>
<path d="M340 505 C430 455 560 440 730 450 L730 525 C600 518 470 525 360 552 Z" fill="#c6bfdb"/>
</g>
</svg>
`;
fs.writeFileSync(path.join(root, 'public', 'bg.svg'), bg);
console.log('art:', fs.readdirSync(artDir).length, 'files + bg.svg');
