// Generates all PWA / iOS icons from a simple vector mark — no dependencies.
// Mark: four identical vertical bars (one key, four worlds), the last one brass.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
mkdirSync(OUT, { recursive: true });

const PAPER = [251, 247, 238];
const INK = [29, 26, 22];
const BRASS = [154, 107, 63];

function coverageRoundRect(px, py, x, y, w, h, r) {
  const cx = x + w / 2, cy = y + h / 2;
  const dx = Math.abs(px - cx) - (w / 2 - r);
  const dy = Math.abs(py - cy) - (h / 2 - r);
  const d = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
  return Math.min(1, Math.max(0, 0.5 - d));
}

function draw(size, { pad = 0, bars = 4 } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const S = size * (1 - pad * 2);            // drawable area
  const off = size * pad;
  const barW = S * 0.088;
  const gap = S * 0.036;
  const barH = S * 0.40;
  const totalW = bars * barW + (bars - 1) * gap;
  const x0 = off + (S - totalW) / 2;
  const y0 = off + (S - barH) / 2;
  const radius = barW / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5;
      let r = PAPER[0], g = PAPER[1], b = PAPER[2];
      for (let i = 0; i < bars; i++) {
        const bx = x0 + i * (barW + gap);
        const cov = coverageRoundRect(px, py, bx, y0, barW, barH, radius);
        if (cov > 0) {
          const c = i === bars - 1 ? BRASS : INK;
          r = r + (c[0] - r) * cov;
          g = g + (c[1] - g) * cov;
          b = b + (c[2] - b) * cov;
        }
      }
      const o = (y * size + x) * 4;
      buf[o] = Math.round(r);
      buf[o + 1] = Math.round(g);
      buf[o + 2] = Math.round(b);
      buf[o + 3] = 255;
    }
  }
  return buf;
}

// ---- minimal PNG encoder ----
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(rgba, size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const jobs = [
  ['icon-1024.png', 1024, {}],
  ['icon-512.png', 512, {}],
  ['icon-192.png', 192, {}],
  ['apple-touch-icon.png', 180, {}],
  ['favicon-32.png', 32, {}],
  ['icon-512-maskable.png', 512, { pad: 0.14 }],
  ['icon-192-maskable.png', 192, { pad: 0.14 }],
];

for (const [name, size, opts] of jobs) {
  writeFileSync(join(OUT, name), encodePNG(draw(size, opts), size));
  console.log('wrote', name, size);
}
