import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOADS_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

/** A problem the person uploading can act on; its message is shown in the admin. */
export class UploadError extends Error {}

type ImageKind = "jpeg" | "png" | "webp" | "gif" | "avif" | "heic" | "tiff";
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs"]);

/** Recognise images by their first bytes (browsers sometimes send no type, e.g. HEIC on Windows). */
function sniffImage(buf: Buffer): ImageKind | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("latin1", 0, 4) === "RIFF" && buf.toString("latin1", 8, 12) === "WEBP") return "webp";
  if (buf.toString("latin1", 0, 3) === "GIF") return "gif";
  const tiff = buf.toString("latin1", 0, 4);
  if (tiff === "II*\0" || tiff === "MM\0*") return "tiff";
  if (buf.toString("latin1", 4, 8) === "ftyp") {
    const brand = buf.toString("latin1", 8, 12);
    const box = buf.toString("latin1", 8, Math.min(buf.length, buf.readUInt32BE(0)));
    if (brand.startsWith("avi") || ((brand === "mif1" || brand === "msf1") && box.includes("avif"))) return "avif";
    if (HEIC_BRANDS.has(brand) || brand === "mif1" || brand === "msf1") return "heic";
  }
  return null;
}

function kindFromName(file: File): ImageKind | null {
  const t = file.type.toLowerCase();
  const ext = path.extname(file.name).toLowerCase();
  if (t === "image/heic" || t === "image/heif" || ext === ".heic" || ext === ".heif") return "heic";
  if (t === "image/jpeg" || ext === ".jpg" || ext === ".jpeg") return "jpeg";
  if (t === "image/png" || ext === ".png") return "png";
  if (t === "image/webp" || ext === ".webp") return "webp";
  if (t === "image/avif" || ext === ".avif") return "avif";
  if (t === "image/gif" || ext === ".gif") return "gif";
  if (t === "image/tiff" || ext === ".tif" || ext === ".tiff") return "tiff";
  return null;
}

/** iPhone photos (HEIC) are decoded in JavaScript: the bundled image library cannot read them. */
async function heicToJpeg(buf: Buffer): Promise<Buffer> {
  const { default: convert } = await import("heic-convert");
  const out = await convert({ buffer: new Uint8Array(buf), format: "JPEG", quality: 0.92 });
  return Buffer.from(out);
}

/** Converts any supported photo to an optimized WebP (max 2400 px wide) plus a tiny blur placeholder. */
async function toWebp(input: Buffer, kind: ImageKind) {
  let buf = input;
  if (kind === "heic") {
    try {
      buf = await heicToJpeg(input);
    } catch {
      throw new UploadError("This iPhone photo (HEIC) could not be read. Export it as JPG and try again.");
    }
  }
  try {
    const out = await sharp(buf, { failOn: "none" }).rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const meta = await sharp(out).metadata();
    const blur = await sharp(out).resize(20).webp({ quality: 40 }).toBuffer();
    return { out, meta, blur };
  } catch {
    throw new UploadError("This photo could not be read. Please upload a JPG, PNG, WebP or iPhone (HEIC) photo.");
  }
}

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
  const kind = sniffImage(buf) ?? kindFromName(file);

  if (kind && kind !== "gif") {
    const { out, meta, blur } = await toWebp(buf, kind);
    const name = `${base}-${id}.webp`;
    await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), out);
    return {
      url: `/uploads/${sub}/${name}`, kind: "image", name: file.name, size: out.length,
      width: meta.width, height: meta.height, blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
    };
  }
  if (file.type.startsWith("image/") && kind !== "gif") throw new UploadError("This photo format is not supported. Please upload a JPG, PNG, WebP or iPhone (HEIC) photo.");
  const ext = path.extname(file.name).toLowerCase() || (VIDEO_TYPES.has(file.type) ? ".mp4" : "");
  const name = `${base}-${id}${ext}`;
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf);
  return { url: `/uploads/${sub}/${name}`, kind: VIDEO_TYPES.has(file.type) ? "video" : "file", name: file.name, size: buf.length };
}
