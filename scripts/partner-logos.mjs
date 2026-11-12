// Converts partner logos (downloaded from the old site) into trimmed monochrome PNGs.
import sharp from "sharp";
import fs from "node:fs/promises";
const SRC = process.argv[2];
const OUT = "public/brand/partners";
const map = { TEchart: "techart", Novitec: "novitec", BRAbus: "brabus", Vossen: "vossen", HREperformacePartner: "hre", YRBAN: "urban" };
const meta = {};
for (const [file, slug] of Object.entries(map)) {
  const trimmed = await sharp(`${SRC}/${file}.png`).ensureAlpha().trim({ threshold: 1 }).toBuffer();
  const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (slug === "hre") {
      // keep the emblem's detail as greyscale, lifted for a dark background
      const g = Math.min(255, Math.round((0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * 1.15 + 20));
      data[i] = data[i + 1] = data[i + 2] = g;
    } else {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }
  const out = await sharp(data, { raw: info }).resize({ height: 160, withoutEnlargement: false }).png({ compressionLevel: 9 }).toBuffer();
  const m = await sharp(out).metadata();
  await fs.writeFile(`${OUT}/${slug}.png`, out);
  meta[slug] = { w: m.width, h: m.height };
}
console.log(JSON.stringify(meta));
