import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal PNG generator in pure Node.js
function createPNG(width, height, getPixel) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk data (uncompressed filter type 0 + RGBA pixels)
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter: 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 implementation
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Forest Green Shield Logo Drawing Logic (#064E3B bg, #34D399 border, #FFFFFF checkmark)
function drawShieldPixel(x, y, width, height) {
  const nx = (x / width) * 2 - 1; // -1 to 1
  const ny = (y / height) * 2 - 1; // -1 to 1

  // Outer Shield Boundary Check
  const topCut = ny < -0.85;
  const sideCut = Math.abs(nx) > 0.85;
  const bottomV = ny > (1.1 - Math.abs(nx) * 1.1);

  if (topCut || sideCut || bottomV) {
    return [0, 0, 0, 0]; // Transparent outside shield
  }

  // Border Stroke Check
  const isBorder = (Math.abs(nx) > 0.72) || (ny < -0.72) || (ny > (0.95 - Math.abs(nx) * 1.1));
  if (isBorder) {
    return [52, 211, 153, 255]; // Accent Emerald #34D399
  }

  // Checkmark inside shield
  // Line 1: (-0.3, 0.0) -> (0.0, 0.3)
  // Line 2: (0.0, 0.3) -> (0.4, -0.3)
  let isCheckmark = false;

  const d1 = Math.abs((ny - 0.0) - 1.0 * (nx - (-0.3)));
  if (nx >= -0.35 && nx <= 0.05 && d1 < 0.18) {
    isCheckmark = true;
  }

  const d2 = Math.abs((ny - 0.3) - (-1.5) * (nx - 0.0));
  if (nx >= -0.05 && nx <= 0.45 && d2 < 0.18) {
    isCheckmark = true;
  }

  if (isCheckmark) {
    return [255, 255, 255, 255]; // Pure White Checkmark
  }

  // Deep Forest Green Shield Body
  return [6, 78, 59, 255]; // #064E3B
}

// Build Output Directories
const iconsDir = path.resolve('extension/icons');
const publicDir = path.resolve('frontend/public');

if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Generate 16x16, 48x48, 128x128 PNG icons
[16, 48, 128].forEach(size => {
  const pngBuf = createPNG(size, size, drawShieldPixel);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Generated extension/icons/icon${size}.png (${pngBuf.length} bytes)`);
});

// Generate favicon
const favBuf = createPNG(64, 64, drawShieldPixel);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favBuf);
console.log(`Generated frontend/public/favicon.png (${favBuf.length} bytes)`);
