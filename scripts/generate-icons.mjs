/**
 * Gera masters dark/light (Playfair Display “Z” = tipografia do hero) e
 * propaga para favicons web (com corner radius) + mipmaps Android (quadrado).
 *
 * Masters:
 *   resources/icon-dark.png  — Z branco em fundo preto (default / Android)
 *   resources/icon-light.png — Z preto em fundo branco
 *   resources/icon.png       — alias do dark (compat)
 */
import sharp from 'sharp';
import opentype from 'opentype.js';
import { mkdir, copyFile, writeFile, access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const resourcesDir = join(root, 'resources');
const fontsDir = join(resourcesDir, 'fonts');
const fontPath = join(fontsDir, 'PlayfairDisplay.ttf');

/** Mesmo canto visual típico do mask de ícone Android (≈22% do lado). */
const WEB_CORNER_RADIUS_RATIO = 0.22;

const MASTER_SIZE = 1024;
/** Escala do glifo no canvas (Playfair Display regular ≈ hero font-light fallback). */
const GLYPH_FONT_SIZE = 680;
/** Instance weight na variável Playfair Display (eixo wght). */
const FONT_WEIGHT = 400;

const androidSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const foregroundSizes = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

const FONT_URL =
  'https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf';

async function ensureDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureFont() {
  await mkdir(fontsDir, { recursive: true });
  if (await fileExists(fontPath)) return;
  console.log('Baixando Playfair Display…');
  const res = await fetch(FONT_URL);
  if (!res.ok || !res.body) {
    throw new Error(`Falha ao baixar fonte (${res.status})`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(fontPath));
}

/**
 * Contorno do “Z” centrado no canvas size×size.
 * opentype.getPath usa coordenadas SVG (y positivo para baixo).
 */
function zGlyphPathData(font, size, fontSize = GLYPH_FONT_SIZE) {
  const glyph = font.charToGlyph('Z');
  const opts = { fontSize, variation: { wght: FONT_WEIGHT } };
  const measure = glyph.getPath(0, 0, fontSize, opts);
  const b = measure.getBoundingBox();
  const x = (size - (b.x2 - b.x1)) / 2 - b.x1;
  const y = (size - (b.y2 - b.y1)) / 2 - b.y1;
  return glyph.getPath(x, y, fontSize, opts).toPathData(2);
}

function masterSvg({ size, bg, fg, pathD }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <path fill="${fg}" d="${pathD}"/>
</svg>`);
}

async function renderMaster(font, mode) {
  const dark = mode === 'dark';
  const pathD = zGlyphPathData(font, MASTER_SIZE);
  const svg = masterSvg({
    size: MASTER_SIZE,
    bg: dark ? '#000000' : '#ffffff',
    fg: dark ? '#ffffff' : '#000000',
    pathD,
  });
  const out = join(resourcesDir, dark ? 'icon-dark.png' : 'icon-light.png');
  await sharp(svg).png().toFile(out);
  return out;
}

/** Máscara arredondada com cantos transparentes (favicon web ≈ mask Android). */
async function withCornerRadius(inputBufferOrPath, size) {
  const radius = Math.round(size * WEB_CORNER_RADIUS_RATIO);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/>
    </svg>`,
  );
  return sharp(inputBufferOrPath)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .composite([{ input: await sharp(mask).png().toBuffer(), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function writePng(buffer, outPath) {
  await ensureDir(outPath);
  await writeFile(outPath, buffer);
}

async function resizeSquare(sourcePath, size, outPath) {
  await ensureDir(outPath);
  await sharp(sourcePath)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(outPath);
}

async function adaptiveForeground(sourcePath, size, outPath) {
  await ensureDir(outPath);
  const inner = Math.round(size * 0.66);
  const icon = await sharp(sourcePath).resize(inner, inner).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: icon, gravity: 'centre' }])
    .png()
    .toFile(outPath);
}

function faviconSvgMarkup(pathD512, cornerRatio) {
  const size = 512;
  const r = Math.round(size * cornerRatio);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Zue">
  <style>
    .bg { fill: #000; }
    .mark { fill: #fff; }
    @media (prefers-color-scheme: light) {
      .bg { fill: #fff; }
      .mark { fill: #000; }
    }
  </style>
  <rect class="bg" width="${size}" height="${size}" rx="${r}" ry="${r}"/>
  <path class="mark" d="${pathD512}"/>
</svg>
`;
}

async function main() {
  await ensureFont();
  const font = opentype.parse(await readFile(fontPath));

  const darkMaster = await renderMaster(font, 'dark');
  const lightMaster = await renderMaster(font, 'light');
  await copyFile(darkMaster, join(resourcesDir, 'icon.png'));

  const publicDir = join(root, 'public');
  await mkdir(publicDir, { recursive: true });

  for (const size of [16, 32]) {
    await writePng(
      await withCornerRadius(darkMaster, size),
      join(publicDir, `favicon-${size}x${size}.png`),
    );
    await writePng(
      await withCornerRadius(lightMaster, size),
      join(publicDir, `favicon-${size}x${size}-light.png`),
    );
  }
  await writePng(await withCornerRadius(darkMaster, 32), join(publicDir, 'favicon.png'));
  await writePng(await withCornerRadius(lightMaster, 32), join(publicDir, 'favicon-light.png'));

  const path512 = zGlyphPathData(font, 512, GLYPH_FONT_SIZE / 2);
  await writeFile(
    join(publicDir, 'favicon.svg'),
    faviconSvgMarkup(path512, WEB_CORNER_RADIUS_RATIO),
  );

  await resizeSquare(darkMaster, 180, join(publicDir, 'apple-touch-icon.png'));
  await resizeSquare(darkMaster, 192, join(publicDir, 'icon-192.png'));
  await resizeSquare(darkMaster, 512, join(publicDir, 'icon-512.png'));
  await copyFile(darkMaster, join(publicDir, 'icon.png'));
  await copyFile(lightMaster, join(publicDir, 'icon-light.png'));

  const res = join(root, 'android', 'app', 'src', 'main', 'res');
  for (const [density, size] of Object.entries(androidSizes)) {
    const dir = join(res, `mipmap-${density}`);
    await resizeSquare(darkMaster, size, join(dir, 'ic_launcher.png'));
    await resizeSquare(darkMaster, size, join(dir, 'ic_launcher_round.png'));
  }
  for (const [density, size] of Object.entries(foregroundSizes)) {
    await adaptiveForeground(
      darkMaster,
      size,
      join(res, `mipmap-${density}`, 'ic_launcher_foreground.png'),
    );
  }

  await writeFile(
    join(res, 'values', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
`,
  );

  await writeFile(
    join(res, 'drawable', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="#000000"/>
</shape>
`,
  );

  console.log(
    `Ícones gerados (Playfair Display Z, web radius ${(WEB_CORNER_RADIUS_RATIO * 100).toFixed(0)}%): public/ + android mipmaps`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
