import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storeUpload, UploadError } from "@/lib/uploads";
import { db, media } from "@/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "The upload did not arrive complete. Try again with fewer or smaller files." }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No file received." }, { status: 400 });
  const stored = [];
  const errors: { name: string; error: string }[] = [];
  for (const file of files) {
    try {
      const s = await storeUpload(file);
      db.insert(media).values({ url: s.url, kind: s.kind, name: s.name, width: s.width, height: s.height, size: s.size, blurDataUrl: s.blurDataUrl }).run();
      stored.push(s);
    } catch (e) {
      console.error(`[upload] ${file.name} (${file.type || "no type"}, ${file.size} bytes):`, e);
      errors.push({ name: file.name, error: e instanceof UploadError ? e.message : "The server could not save this file." });
    }
  }
  if (!stored.length) return NextResponse.json({ error: errors[0]?.error ?? "Upload failed.", errors }, { status: 422 });
  return NextResponse.json({ files: stored, errors });
}
