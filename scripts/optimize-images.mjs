// Shrinks oversized photos in public/images so pages load fast (page speed is a Google ranking factor).
//
//   npm run optimize:images           optimise oversized images and fix references
//   npm run optimize:images -- --check   only list oversized images (exit code 1 if any)
//
// Photos over ~1 MB or longer than 1800 px (1600 px for blog and notes) are resized
// and saved as JPEG. A .png photo becomes a .jpg, and every reference to it in src/ is
// updated. PNGs with real transparency are only resized and stay PNG.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const LIMITS = { products: 1800, blog: 1600, notes: 1600 };
const MAX_BYTES = 1024 * 1024;
const checkOnly = process.argv.includes('--check');

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
      })
    : [];

const renamed = new Map(); // old public path -> new public path
let oversized = 0;

for (const [folder, maxSide] of Object.entries(LIMITS)) {
  for (const file of walk(path.join(ROOT, 'public/images', folder))) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;
    const size = fs.statSync(file).size;
    const meta = await sharp(file).metadata();
    const tooBig = size > MAX_BYTES || Math.max(meta.width ?? 0, meta.height ?? 0) > maxSide + 100;
    if (!tooBig) continue;
    oversized += 1;
    const rel = path.relative(path.join(ROOT, 'public'), file);
    if (checkOnly) {
      console.log(`too big: ${(size / 1048576).toFixed(1)} MB  ${meta.width}x${meta.height}  /${rel}`);
      continue;
    }
    let pipeline = sharp(file).rotate().resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true });
    const transparent = ext === '.png' && meta.hasAlpha && !(await sharp(file).stats()).isOpaque;
    const target = ext === '.png' && !transparent ? file.replace(/\.png$/i, '.jpg') : file;
    const buffer = transparent
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
      : await pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    if (buffer.length >= size && target === file) continue; // already well compressed
    fs.writeFileSync(target + '.tmp', buffer);
    if (target !== file) fs.unlinkSync(file);
    fs.renameSync(target + '.tmp', target);
    if (target !== file) renamed.set('/' + rel, '/' + path.relative(path.join(ROOT, 'public'), target));
    console.log(`${(size / 1048576).toFixed(1)} MB -> ${(buffer.length / 1024).toFixed(0)} KB  /${rel}`);
  }
}

if (renamed.size > 0) {
  for (const file of walk(path.join(ROOT, 'src'))) {
    if (!/\.(md|mdx|astro|ts|json|ya?ml)$/.test(file)) continue;
    let text = fs.readFileSync(file, 'utf8');
    const before = text;
    for (const [from, to] of renamed) text = text.split(from).join(to);
    if (text !== before) fs.writeFileSync(file, text);
  }
  console.log(`Updated references for ${renamed.size} renamed image(s).`);
}

if (checkOnly) {
  console.log(oversized === 0 ? 'All images are a good size.' : `${oversized} oversized image(s). Run: npm run optimize:images`);
  process.exit(oversized === 0 ? 0 : 1);
}
if (oversized === 0) console.log('All images are a good size.');
