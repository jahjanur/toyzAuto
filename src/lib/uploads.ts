import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type StoredFile = {
  url: string;
  kind: "image" | "video" | "file";
  name: string;
  size: number;
  width?: number;
  height?: number;
  blurDataUrl?: string;
};

export async function storeUpload(file: File): Promise<StoredFile> {
  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, sub);
  await fs.mkdir(dir, { recursive: true });
  const id = crypto.randomBytes(8).toString("hex");
  const buf = Buffer.from(await file.arrayBuffer());
  const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "file";

  if (IMAGE_TYPES.has(file.type) && file.type !== "image/gif") {
    const img = sharp(buf).rotate();
    const out = await img.resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const meta = await sharp(out).metadata();
    const blur = await sharp(out).resize(20).webp({ quality: 40 }).toBuffer();
    const name = `${base}-${id}.webp`;
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), out);
    return {
      url: `/uploads/${sub}/${name}`, kind: "image", name: file.name, size: out.length,
      width: meta.width, height: meta.height, blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
    };
  }
  const ext = path.extname(file.name).toLowerCase() || (VIDEO_TYPES.has(file.type) ? ".mp4" : "");
  const name = `${base}-${id}${ext}`;
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf);
  return { url: `/uploads/${sub}/${name}`, kind: VIDEO_TYPES.has(file.type) ? "video" : "file", name: file.name, size: buf.length };
}
