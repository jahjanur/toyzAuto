// Downloads the original vehicle photos from toyzautoart.com, converts them to
// optimized WebP (max 1920px wide) plus a tiny blur placeholder, and writes
// src/data/vehicles.json which the seed script consumes.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SEED = process.argv[2];
if (!SEED) throw new Error("usage: node scripts/import-images.mjs <vehicles_seed.json>");
const root = path.resolve(process.cwd());
const outRoot = path.join(root, "public", "vehicles");
const vehicles = JSON.parse(await fs.readFile(SEED, "utf8"));

const CONCURRENCY = 6;
let active = 0;
const queue = [];
const run = (fn) =>
  new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    pump();
  });
function pump() {
  while (active < CONCURRENCY && queue.length) {
    const { fn, resolve, reject } = queue.shift();
    active++;
    fn().then(resolve, reject).finally(() => { active--; pump(); });
  }
}

async function fetchBuffer(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (toyz-importer)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
}

let done = 0, total = vehicles.reduce((n, v) => n + v.images.length, 0);
const result = [];
for (const v of vehicles) {
  const dir = path.join(outRoot, v.slug);
  await fs.mkdir(dir, { recursive: true });
  const images = await Promise.all(
    v.images.map((url, idx) =>
      run(async () => {
        const file = `${String(idx + 1).padStart(2, "0")}.webp`;
        const abs = path.join(dir, file);
        let buf;
        try {
          buf = await fetchBuffer(url);
        } catch (e) {
          console.error("FAILED", url, e.message);
          return null;
        }
        const img = sharp(buf).rotate();
        const meta = await img.metadata();
        const resized = img.resize({ width: 1920, withoutEnlargement: true });
        const out = await resized.webp({ quality: 82, effort: 4 }).toBuffer();
        await fs.writeFile(abs, out);
        const m2 = await sharp(out).metadata();
        const blur = await sharp(out).resize(20).webp({ quality: 40 }).toBuffer();
        done++;
        if (done % 20 === 0) console.log(`${done}/${total}`);
        return {
          url: `/vehicles/${v.slug}/${file}`,
          width: m2.width, height: m2.height,
          blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
          source: url, originalWidth: meta.width, originalHeight: meta.height,
        };
      })
    )
  );
  result.push({ ...v, images: images.filter(Boolean) });
}
await fs.writeFile(path.join(root, "src", "data", "vehicles.json"), JSON.stringify(result, null, 1));
console.log("done", done, "/", total);
