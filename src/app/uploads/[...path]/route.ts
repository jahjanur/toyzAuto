import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".avif": "image/avif", ".gif": "image/gif",
  ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac", ".wav": "audio/wav", ".ogg": "audio/ogg", ".webm": "video/webm", ".mov": "video/quicktime", ".pdf": "application/pdf", ".svg": "image/svg+xml",
};

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const rel = path.normalize(parts.join("/"));
  if (rel.startsWith("..") || path.isAbsolute(rel)) return new Response("Not found", { status: 404 });
  const abs = path.join(UPLOADS_DIR, rel);
  if (!abs.startsWith(UPLOADS_DIR) || !fs.existsSync(abs)) return new Response("Not found", { status: 404 });
  const stat = fs.statSync(abs);
  const type = TYPES[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
  const range = req.headers.get("range");
  const headers: Record<string, string> = {
    "content-type": type,
    "cache-control": "public, max-age=31536000, immutable",
    "accept-ranges": "bytes",
  };
  if (range && (type.startsWith("video/") || type.startsWith("audio/"))) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m && m[1] ? parseInt(m[1], 10) : 0;
    const end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
    const stream = fs.createReadStream(abs, { start, end });
    return new Response(stream as unknown as ReadableStream, {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${stat.size}`, "content-length": String(end - start + 1) },
    });
  }
  const stream = fs.createReadStream(abs);
  return new Response(stream as unknown as ReadableStream, { headers: { ...headers, "content-length": String(stat.size) } });
}
