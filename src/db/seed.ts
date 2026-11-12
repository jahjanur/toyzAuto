/* Seeds the database with the imported inventory, services and an admin user.
   Usage: pnpm db:seed            (skips vehicles if any exist)
          pnpm db:seed -- --force (wipes vehicles/brands/services and re-seeds) */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, brands, services, users, vehicleImages, vehicles } from "./index";
import { slugify } from "../lib/utils";

type SeedImage = { url: string; width: number; height: number; blurDataUrl: string };
type SeedVehicle = {
  slug: string; title: string; brand: string; model: string; year: number; priceCents: number; priceOnRequest: boolean;
  condition: string; mileageKm: number | null; bodyStyle: string | null; drivetrain: string | null; transmission: string | null;
  fuelType: string | null; engine: string | null; horsepower: number | null; summary: string; description: string;
  images: SeedImage[]; sortOrder: number; featured: boolean;
};

const force = process.argv.includes("--force");
const dataFile = ["src/data/vehicles.json", "src/data/vehicles_seed.json"]
  .map((p) => path.resolve(process.cwd(), p))
  .find((p) => fs.existsSync(p));
if (!dataFile) throw new Error("No vehicle data file found in src/data");
const seedVehicles = JSON.parse(fs.readFileSync(dataFile, "utf8")) as SeedVehicle[];

const SERVICES = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "src/data/services.json"), "utf8")) as { slug: string; title: string; icon: string; coverImage: string; excerpt: string; body: string }[];

async function main() {
  const existing = db.select({ id: vehicles.id }).from(vehicles).all();
  if (existing.length && !force) {
    console.log(`Database already has ${existing.length} vehicles. Use --force to re-seed.`);
  } else {
    if (force) {
      db.delete(vehicleImages).run();
      db.delete(vehicles).run();
      db.delete(brands).run();
      db.delete(services).run();
    }
    const brandNames = Array.from(new Set(seedVehicles.map((v) => v.brand))).sort();
    const brandIds = new Map<string, number>();
    brandNames.forEach((name, i) => {
      const row = db.insert(brands).values({ name, slug: slugify(name), sortOrder: i }).returning().get();
      brandIds.set(name, row.id);
    });
    for (const v of seedVehicles) {
      const row = db
        .insert(vehicles)
        .values({
          slug: v.slug, title: v.title, brandId: brandIds.get(v.brand) ?? null, model: v.model, year: v.year,
          priceCents: v.priceCents, priceOnRequest: v.priceOnRequest, condition: v.condition, mileageKm: v.mileageKm,
          bodyStyle: v.bodyStyle, drivetrain: v.drivetrain, transmission: v.transmission, fuelType: v.fuelType,
          engine: v.engine, horsepower: v.horsepower, summary: v.summary, description: v.description,
          highlights: [], status: "available", featured: v.featured, sortOrder: v.sortOrder,
          createdAt: new Date(Date.now() - v.sortOrder * 86_400_000), updatedAt: new Date(),
        })
        .returning()
        .get();
      v.images.forEach((img, i) => {
        db.insert(vehicleImages)
          .values({ vehicleId: row.id, url: img.url, width: img.width ?? null, height: img.height ?? null, blurDataUrl: img.blurDataUrl ?? null, alt: `${v.title} — photo ${i + 1}`, sortOrder: i })
          .run();
      });
    }
    const SERVICES_FR = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "src/data/services.fr.json"), "utf8")) as { slug: string; title: string; excerpt: string; body: string }[];
    SERVICES.forEach((s, i) => {
      const fr = SERVICES_FR.find((x) => x.slug === s.slug);
      db.insert(services).values({ ...s, titleFr: fr?.title, excerptFr: fr?.excerpt, bodyFr: fr?.body, sortOrder: i, published: true }).run();
    });
    console.log(`Seeded ${seedVehicles.length} vehicles, ${brandNames.length} brands, ${SERVICES.length} services from ${path.basename(dataFile!)}.`);
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@toyzautoart.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    db.insert(users).values({ email, name: "Administrator", passwordHash: await bcrypt.hash(password, 11), role: "owner" }).run();
    console.log(`Created admin user ${email}`);
  } else {
    console.log(`Admin user ${email} already exists.`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
