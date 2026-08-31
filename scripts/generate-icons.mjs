/**
 * Gera favicons web + mipmaps Android a partir de resources/icon.png
 */
import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'resources', 'icon.png');

const androidSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

/** Foreground adaptive: canvas maior com Z centrado (safe zone ~66%) */
const foregroundSizes = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

async function ensureDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function resizeTo(size, outPath) {
  await ensureDir(outPath);
  await sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(outPath);
}

async function adaptiveForeground(size, outPath) {
  await ensureDir(outPath);
  // Z ocupa ~66% (safe zone); padding preto ao redor
  const inner = Math.round(size * 0.66);
  const icon = await sharp(source).resize(inner, inner).png().toBuffer();
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

async function main() {
  const publicDir = join(root, 'public');
  await mkdir(publicDir, { recursive: true });

  // Web
  await resizeTo(32, join(publicDir, 'favicon-32x32.png'));
  await resizeTo(16, join(publicDir, 'favicon-16x16.png'));
  await resizeTo(180, join(publicDir, 'apple-touch-icon.png'));
  await resizeTo(192, join(publicDir, 'icon-192.png'));
  await resizeTo(512, join(publicDir, 'icon-512.png'));
  await copyFile(source, join(publicDir, 'icon.png'));

  // ICO multi-size (PNG-packed ICO via sharp → use 32png as favicon.png fallback)
  await sharp(source).resize(32, 32).png().toFile(join(publicDir, 'favicon.png'));

  // Android legacy launchers
  const res = join(root, 'android', 'app', 'src', 'main', 'res');
  for (const [density, size] of Object.entries(androidSizes)) {
    const dir = join(res, `mipmap-${density}`);
    await resizeTo(size, join(dir, 'ic_launcher.png'));
    await resizeTo(size, join(dir, 'ic_launcher_round.png'));
  }

  // Adaptive foreground
  for (const [density, size] of Object.entries(foregroundSizes)) {
    await adaptiveForeground(size, join(res, `mipmap-${density}`, 'ic_launcher_foreground.png'));
  }

  // Background color resource
  await writeFile(
    join(res, 'values', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
`,
  );

  // drawable background solid black (fallback)
  await writeFile(
    join(res, 'drawable', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="#000000"/>
</shape>
`,
  );

  console.log('Ícones gerados: public/ + android mipmaps');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
