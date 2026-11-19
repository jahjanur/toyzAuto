/** Browser-side helpers shared by the admin uploaders. */

const MAX_EDGE = 3000;

/**
 * Downscales a large photo in the browser before upload: much faster on phones, and keeps every request small
 * whatever limits the host puts on request size. Returns the original file when it is already small, is not a photo
 * the browser can decode (e.g. HEIC in Chrome, which the server converts instead), or anything goes wrong.
 */
export async function shrinkPhoto(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) || file.size < 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 4_000_000) { bitmap.close(); return file; }
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); return file; }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export type UploadedFile = { url: string; width?: number; height?: number; blurDataUrl?: string; kind?: string };

/** Uploads one file and returns it, or throws an Error whose message explains the problem in plain words. */
export async function uploadFile(file: File): Promise<UploadedFile> {
  const fd = new FormData();
  fd.append("files", file);
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: fd });
  } catch {
    throw new Error("the connection was interrupted, please try again");
  }
  const json = (await res.json().catch(() => null)) as { files?: UploadedFile[]; error?: string } | null;
  if (res.ok && json?.files?.length) return json.files[0];
  if (json?.error) throw new Error(json.error);
  if (res.status === 413) throw new Error("the file is too large for the server");
  if (res.status === 401) throw new Error("you are signed out, please sign in again");
  throw new Error(`the server could not save it (error ${res.status})`);
}

/** True for files the photo uploaders should accept, including HEIC files that arrive without a type. */
export const isPhoto = (f: File) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name);
