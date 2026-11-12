import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storeUpload } from "@/lib/uploads";
import { db, media } from "@/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });
  const stored = [];
  for (const file of files) {
    const s = await storeUpload(file);
    db.insert(media).values({ url: s.url, kind: s.kind, name: s.name, width: s.width, height: s.height, size: s.size, blurDataUrl: s.blurDataUrl }).run();
    stored.push(s);
  }
  return NextResponse.json({ files: stored });
}
