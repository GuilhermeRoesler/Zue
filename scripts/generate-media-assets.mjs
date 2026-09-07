/**
 * Gera assets de mídia estática:
 * - public/og.jpg (1200×630) para Open Graph / Twitter
 * - public/demo/{id}-{800|1200|1600}.webp a partir de fotos Pexels
 *
 * Uso: npm run media:generate
 */
import sharp from 'sharp';
import { mkdir, access, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const demoDir = join(publicDir, 'demo');
const resourcesDir = join(root, 'resources');

const DEMO_PHOTO_IDS = [
  7679720, 7679471, 7679730, 1926769, 1536619, 1183266,
];
const WIDTHS = [800, 1200, 1600];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao baixar ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function generateOg() {
  const out = join(publicDir, 'og.jpg');
  const iconPath = join(resourcesDir, 'icon-dark.png');
  const iconFallback = join(resourcesDir, 'icon.png');
  const icon = (await exists(iconPath)) ? iconPath : iconFallback;

  const base = sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  });

  if (await exists(icon)) {
    const mark = await sharp(icon)
      .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    await base
      .composite([
        { input: mark, top: 140, left: 460 },
        {
          input: Buffer.from(`
            <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
              <text x="600" y="500" text-anchor="middle"
                font-family="Georgia, 'Times New Roman', serif"
                font-size="28" fill="#ffffff" letter-spacing="12"
                opacity="0.72">ELEGÂNCIA ATEMPORAL</text>
            </svg>
          `),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(out);
  } else {
    await base.jpeg({ quality: 88 }).toFile(out);
  }

  console.log('✓', out.replace(root + '\\', '').replace(root + '/', ''));
}

async function generateDemoWebp() {
  await mkdir(demoDir, { recursive: true });

  for (const id of DEMO_PHOTO_IDS) {
    const sourceUrl = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;
    console.log(`↓ Pexels ${id}…`);
    const jpeg = await fetchBuffer(sourceUrl);

    for (const w of WIDTHS) {
      const out = join(demoDir, `${id}-${w}.webp`);
      await sharp(jpeg)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(out);
      console.log('✓', `public/demo/${id}-${w}.webp`);
    }
  }

  await writeFile(
    join(demoDir, '.gitkeep'),
    '# Demo WebP gerados por media:generate\n',
    'utf8'
  );
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  await generateOg();
  await generateDemoWebp();
  console.log('Assets de mídia prontos.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
