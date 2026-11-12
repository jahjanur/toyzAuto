"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db, brands, inquiries, services, testimonials, users, vehicleImages, vehicles, VEHICLE_STATUSES } from "@/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { saveSettings, type SiteSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";

export type ActionState = { ok: boolean; error?: string; message?: string } | null;

function revalidateSite() {
  revalidatePath("/", "layout");
}

/* ---------------- auth ---------------- */
export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "Invalid email or password." };
  }
  db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id)).run();
  await createSession({ uid: user.id, email: user.email, name: user.name, role: user.role });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
  const user = db.select().from(users).where(eq(users.id, s.uid)).get();
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { ok: false, error: "Current password is incorrect." };
  db.update(users).set({ passwordHash: await bcrypt.hash(next, 11) }).where(eq(users.id, s.uid)).run();
  return { ok: true, message: "Password updated." };
}

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const s = await requireAdmin();
  if (s.role !== "owner") return { ok: false, error: "Only the owner can add users." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !name || password.length < 8) return { ok: false, error: "Name, email and an 8+ character password are required." };
  if (db.select().from(users).where(eq(users.email, email)).get()) return { ok: false, error: "A user with this email already exists." };
  db.insert(users).values({ email, name, passwordHash: await bcrypt.hash(password, 11), role: "admin" }).run();
  revalidatePath("/admin/account");
  return { ok: true, message: `Added ${name}.` };
}

export async function deleteUser(id: number) {
  const s = await requireAdmin();
  if (s.role !== "owner" || id === s.uid) return;
  db.delete(users).where(eq(users.id, id)).run();
  revalidatePath("/admin/account");
}

/* ---------------- vehicles ---------------- */
const vehicleSchema = z.object({
  title: z.string().trim().min(3),
  slug: z.string().trim().optional(),
  brandId: z.coerce.number().int().optional(),
  newBrand: z.string().trim().optional(),
  model: z.string().trim().min(1),
  year: z.coerce.number().int().min(1900).max(2100),
  price: z.coerce.number().min(0).default(0),
  priceOnRequest: z.coerce.boolean().default(false),
  condition: z.string().trim().default("Used"),
  mileageKm: z.coerce.number().int().min(0).optional(),
  bodyStyle: z.string().trim().optional(),
  drivetrain: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
  fuelType: z.string().trim().optional(),
  engine: z.string().trim().optional(),
  horsepower: z.coerce.number().int().min(0).optional(),
  exteriorColor: z.string().trim().optional(),
  interiorColor: z.string().trim().optional(),
  vin: z.string().trim().optional(),
  stockNumber: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  description: z.string().trim().optional(),
  highlights: z.string().optional(),
  summaryFr: z.string().trim().optional(),
  descriptionFr: z.string().trim().optional(),
  highlightsFr: z.string().optional(),
  videoUrl: z.string().trim().optional(),
  status: z.enum(VEHICLE_STATUSES).default("available"),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  images: z.string().optional(), // JSON array of {url,width,height,blurDataUrl,alt}
});

const empty = (v: string | undefined) => (v && v.length ? v : null);

export async function saveVehicle(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw: Record<string, unknown> = Object.fromEntries(formData.entries());
  raw.priceOnRequest = formData.get("priceOnRequest") === "on";
  raw.featured = formData.get("featured") === "on";
  for (const k of ["mileageKm", "horsepower", "brandId"]) if (raw[k] === "") delete raw[k];
  const parsed = vehicleSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ") };
  const d = parsed.data;

  let brandId = d.brandId ?? null;
  if (d.newBrand) {
    const slug = slugify(d.newBrand);
    const existing = db.select().from(brands).where(eq(brands.slug, slug)).get();
    brandId = existing ? existing.id : db.insert(brands).values({ name: d.newBrand, slug, sortOrder: 99 }).returning().get().id;
  }

  let slug = slugify(d.slug || d.title);
  const clash = db.select({ id: vehicles.id }).from(vehicles).where(id ? and(eq(vehicles.slug, slug), ne(vehicles.id, id)) : eq(vehicles.slug, slug)).get();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const highlights = (d.highlights ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
  const highlightsFr = (d.highlightsFr ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
  const values = {
    title: d.title, slug, brandId, model: d.model, year: d.year, priceCents: Math.round(d.price * 100), priceOnRequest: d.priceOnRequest,
    condition: d.condition || "Used", mileageKm: d.mileageKm ?? null, bodyStyle: empty(d.bodyStyle), drivetrain: empty(d.drivetrain),
    transmission: empty(d.transmission), fuelType: empty(d.fuelType), engine: empty(d.engine), horsepower: d.horsepower ?? null,
    exteriorColor: empty(d.exteriorColor), interiorColor: empty(d.interiorColor), vin: empty(d.vin), stockNumber: empty(d.stockNumber),
    summary: empty(d.summary), description: empty(d.description), highlights,
    summaryFr: empty(d.summaryFr), descriptionFr: empty(d.descriptionFr), highlightsFr, videoUrl: empty(d.videoUrl), status: d.status,
    featured: d.featured, sortOrder: d.sortOrder, updatedAt: new Date(),
  };

  let vehicleId = id;
  if (id) db.update(vehicles).set(values).where(eq(vehicles.id, id)).run();
  else vehicleId = db.insert(vehicles).values(values).returning().get().id;

  // images: replace set with submitted order
  if (d.images !== undefined && vehicleId) {
    type Img = { url: string; width?: number | null; height?: number | null; blurDataUrl?: string | null; alt?: string | null };
    let list: Img[] = [];
    try { list = JSON.parse(d.images || "[]"); } catch { list = []; }
    db.delete(vehicleImages).where(eq(vehicleImages.vehicleId, vehicleId)).run();
    list.forEach((img, i) => {
      db.insert(vehicleImages).values({ vehicleId: vehicleId!, url: img.url, width: img.width ?? null, height: img.height ?? null, blurDataUrl: img.blurDataUrl ?? null, alt: img.alt ?? `${d.title} — photo ${i + 1}`, sortOrder: i }).run();
    });
  }
  revalidateSite();
  revalidatePath("/admin", "layout");
  if (!id) redirect(`/admin/vehicles/${vehicleId}?created=1`);
  return { ok: true, message: "Saved." };
}

export async function deleteVehicle(id: number) {
  await requireAdmin();
  db.delete(vehicles).where(eq(vehicles.id, id)).run();
  revalidateSite();
  revalidatePath("/admin", "layout");
  redirect("/admin/vehicles");
}

export async function setVehicleStatus(id: number, status: (typeof VEHICLE_STATUSES)[number]) {
  await requireAdmin();
  db.update(vehicles).set({ status, updatedAt: new Date() }).where(eq(vehicles.id, id)).run();
  revalidateSite();
  revalidatePath("/admin", "layout");
}

export async function toggleFeatured(id: number, featured: boolean) {
  await requireAdmin();
  db.update(vehicles).set({ featured, updatedAt: new Date() }).where(eq(vehicles.id, id)).run();
  revalidateSite();
  revalidatePath("/admin", "layout");
}

export async function duplicateVehicle(id: number) {
  await requireAdmin();
  const v = db.select().from(vehicles).where(eq(vehicles.id, id)).get();
  if (!v) return;
  const { id: _id, createdAt: _c, updatedAt: _u, views: _v, ...rest } = v;
  const copy = db.insert(vehicles).values({ ...rest, title: `${v.title} (copy)`, slug: `${v.slug}-copy-${Date.now().toString(36).slice(-4)}`, status: "hidden", featured: false }).returning().get();
  const imgs = db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, id)).orderBy(asc(vehicleImages.sortOrder)).all();
  imgs.forEach((img) => { const { id: _i, ...r } = img; db.insert(vehicleImages).values({ ...r, vehicleId: copy.id }).run(); });
  revalidatePath("/admin", "layout");
  redirect(`/admin/vehicles/${copy.id}`);
}

/* ---------------- brands ---------------- */
export async function saveBrand(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const name = String(formData.get("name") ?? "").trim();
  const opt = (k: string) => (formData.has(k) ? String(formData.get(k) ?? "").trim() || null : undefined);
  const logoUrl = opt("logoUrl");
  const soundUrl = opt("soundUrl");
  const sortOrder = formData.has("sortOrder") ? Number(formData.get("sortOrder") || 0) : undefined;
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(name);
  if (id) db.update(brands).set({ name, slug, logoUrl, soundUrl, sortOrder }).where(eq(brands.id, id)).run();
  else {
    if (db.select().from(brands).where(eq(brands.slug, slug)).get()) return { ok: false, error: "Brand already exists." };
    db.insert(brands).values({ name, slug, logoUrl, soundUrl, sortOrder: sortOrder ?? 0 }).run();
  }
  revalidateSite();
  revalidatePath("/admin/brands");
  return { ok: true, message: "Saved." };
}
export async function deleteBrand(id: number) {
  await requireAdmin();
  db.delete(brands).where(eq(brands.id, id)).run();
  revalidateSite();
  revalidatePath("/admin/brands");
}

/* ---------------- services ---------------- */
export async function saveService(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, error: "Title is required." };
  const values = {
    title, slug: slugify(String(formData.get("slug") || title)), excerpt: empty(String(formData.get("excerpt") ?? "").trim()),
    body: empty(String(formData.get("body") ?? "").trim()), icon: String(formData.get("icon") || "sparkles"),
    titleFr: empty(String(formData.get("titleFr") ?? "").trim()), excerptFr: empty(String(formData.get("excerptFr") ?? "").trim()),
    bodyFr: empty(String(formData.get("bodyFr") ?? "").trim()),
    coverImage: empty(String(formData.get("coverImage") ?? "").trim()), sortOrder: Number(formData.get("sortOrder") || 0),
    published: formData.get("published") === "on",
  };
  let sid = id;
  if (id) db.update(services).set(values).where(eq(services.id, id)).run();
  else sid = db.insert(services).values(values).returning().get().id;
  revalidateSite();
  revalidatePath("/admin/services");
  if (!id) redirect(`/admin/services/${sid}`);
  return { ok: true, message: "Saved." };
}
export async function deleteService(id: number) {
  await requireAdmin();
  db.delete(services).where(eq(services.id, id)).run();
  revalidateSite();
  redirect("/admin/services");
}

/* ---------------- testimonials ---------------- */
export async function saveTestimonial(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const author = String(formData.get("author") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  if (!author || !quote) return { ok: false, error: "Author and quote are required." };
  const values = { author, quote, role: empty(String(formData.get("role") ?? "").trim()), rating: Math.min(5, Math.max(1, Number(formData.get("rating") || 5))), published: formData.get("published") === "on", sortOrder: Number(formData.get("sortOrder") || 0) };
  if (id) db.update(testimonials).set(values).where(eq(testimonials.id, id)).run();
  else db.insert(testimonials).values(values).run();
  revalidateSite();
  revalidatePath("/admin/testimonials");
  return { ok: true, message: "Saved." };
}
export async function deleteTestimonial(id: number) {
  await requireAdmin();
  db.delete(testimonials).where(eq(testimonials.id, id)).run();
  revalidateSite();
  revalidatePath("/admin/testimonials");
}

/* ---------------- inquiries ---------------- */
export async function setInquiryStatus(id: number, status: "new" | "contacted" | "closed") {
  await requireAdmin();
  db.update(inquiries).set({ status }).where(eq(inquiries.id, id)).run();
  revalidatePath("/admin", "layout");
}
export async function deleteInquiry(id: number) {
  await requireAdmin();
  db.delete(inquiries).where(eq(inquiries.id, id)).run();
  revalidatePath("/admin", "layout");
}

/* ---------------- settings ---------------- */
export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const lines = (k: string) => g(k).split("\n").map((x) => x.trim()).filter(Boolean);
  const video = (prefix: string) => ({ src: g(`${prefix}Src`), srcMobile: g(`${prefix}SrcMobile`) || undefined, poster: g(`${prefix}Poster`) || undefined });
  const heroVideo = video("heroVideo");
  const featureVideo = video("featureVideo");
  if (!heroVideo.src) return { ok: false, error: "The hero needs a video file." };
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = days.map((day) => ({ day, open: g(`hours_${day}_open`), close: g(`hours_${day}_close`), closed: formData.get(`hours_${day}_closed`) === "on" }));
  const stats = lines("stats").map((l) => { const [value, ...rest] = l.split("|"); return { value: value.trim(), label: rest.join("|").trim() }; }).filter((x) => x.value && x.label);
  const patch: Partial<SiteSettings> = {
    brandName: g("brandName"), tagline: g("tagline"), heroEyebrow: g("heroEyebrow"), heroHeadline: g("heroHeadline"), heroSubheadline: g("heroSubheadline"),
    heroPrimaryCta: { label: g("heroPrimaryLabel"), href: g("heroPrimaryHref") }, heroSecondaryCta: { label: g("heroSecondaryLabel"), href: g("heroSecondaryHref") },
    heroVideo, featureVideo, statement: g("statement"), featureEyebrow: g("featureEyebrow"), featureTitle: g("featureTitle"), featureText: g("featureText"),
    announcement: { enabled: formData.get("announcementEnabled") === "on", text: g("announcementText"), href: g("announcementHref") },
    phone: g("phone"), phoneDisplay: g("phoneDisplay"), whatsapp: g("whatsapp"), email: g("email"), emailSecondary: g("emailSecondary"),
    addressLine1: g("addressLine1"), addressLine2: g("addressLine2"), mapUrl: g("mapUrl"), mapEmbedUrl: g("mapEmbedUrl"), hours, hoursNote: g("hoursNote"),
    socials: { instagram: g("instagram"), tiktok: g("tiktok"), youtube: g("youtube"), x: g("x"), linkedin: g("linkedin"), facebook: g("facebook") },
    currency: g("currency") || "CAD", stats: stats.length ? stats : undefined, aboutTitle: g("aboutTitle"), aboutBody: g("aboutBody"), partners: lines("partners"),
    seoTitle: g("seoTitle"), seoDescription: g("seoDescription"), footerBlurb: g("footerBlurb"),
    fr: {
      tagline: g("fr_tagline"), heroEyebrow: g("fr_heroEyebrow"), heroHeadline: g("fr_heroHeadline"), heroSubheadline: g("fr_heroSubheadline"),
      heroPrimaryLabel: g("fr_heroPrimaryLabel"), heroSecondaryLabel: g("fr_heroSecondaryLabel"), statement: g("fr_statement"),
      featureEyebrow: g("fr_featureEyebrow"), featureTitle: g("fr_featureTitle"), featureText: g("fr_featureText"),
      announcementText: g("fr_announcementText"), hoursNote: g("fr_hoursNote"), statLabels: lines("fr_statLabels"),
      aboutTitle: g("fr_aboutTitle"), aboutBody: g("fr_aboutBody"), seoTitle: g("fr_seoTitle"), seoDescription: g("fr_seoDescription"),
      footerBlurb: g("fr_footerBlurb"),
    },
  };
  saveSettings(patch);
  revalidateSite();
  revalidatePath("/admin/settings");
  return { ok: true, message: "Settings saved." };
}

export async function reorderVehicles(ids: number[]) {
  await requireAdmin();
  ids.forEach((id, i) => db.update(vehicles).set({ sortOrder: i }).where(eq(vehicles.id, id)).run());
  revalidateSite();
  revalidatePath("/admin/vehicles");
}

export async function getAdminStats() {
  await requireAdmin();
  const total = db.select({ n: sql<number>`count(*)` }).from(vehicles).get()?.n ?? 0;
  return { total };
}
