import { cache } from "react";
import { and, asc, desc, eq, inArray, like, ne, or, sql, type SQL } from "drizzle-orm";
import { db, brands, inquiries, services, testimonials, vehicles, type VehicleWithRelations } from "@/db";

export const PUBLIC_STATUSES = ["available", "reserved", "coming_soon", "sold"] as const;

export type InventoryFilters = {
  q?: string;
  brand?: string[];
  condition?: string[];
  body?: string[];
  fuel?: string[];
  transmission?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sold?: boolean;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "year_desc" | "km_asc";
};

export const getBrands = cache(async () => db.select().from(brands).orderBy(asc(brands.sortOrder), asc(brands.name)).all());

export const getBrandsWithCounts = cache(async () => {
  const rows = db
    .select({ id: brands.id, name: brands.name, slug: brands.slug, soundUrl: brands.soundUrl, sortOrder: brands.sortOrder, count: sql<number>`count(${vehicles.id})` })
    .from(brands)
    .leftJoin(vehicles, and(eq(vehicles.brandId, brands.id), inArray(vehicles.status, ["available", "reserved", "coming_soon"])))
    .groupBy(brands.id)
    .orderBy(asc(brands.sortOrder), asc(brands.name))
    .all();
  return rows;
});

export const getVehicles = cache(async (f: InventoryFilters = {}): Promise<VehicleWithRelations[]> => {
  const where: SQL[] = [];
  where.push(f.sold ? inArray(vehicles.status, [...PUBLIC_STATUSES]) : inArray(vehicles.status, ["available", "reserved", "coming_soon"]));
  if (f.q) {
    const term = `%${f.q.trim()}%`;
    where.push(or(like(vehicles.title, term), like(vehicles.model, term), like(vehicles.summary, term))!);
  }
  if (f.brand?.length) {
    const ids = db.select({ id: brands.id }).from(brands).where(inArray(brands.slug, f.brand)).all().map((b) => b.id);
    where.push(ids.length ? inArray(vehicles.brandId, ids) : sql`0`);
  }
  if (f.condition?.length) where.push(inArray(vehicles.condition, f.condition));
  if (f.body?.length) where.push(inArray(vehicles.bodyStyle, f.body));
  if (f.fuel?.length) where.push(inArray(vehicles.fuelType, f.fuel));
  if (f.transmission?.length) where.push(inArray(vehicles.transmission, f.transmission));
  if (f.minPrice) where.push(sql`${vehicles.priceCents} >= ${f.minPrice * 100}`);
  if (f.maxPrice) where.push(sql`(${vehicles.priceCents} <= ${f.maxPrice * 100} or ${vehicles.priceOnRequest} = 1)`);
  if (f.minYear) where.push(sql`${vehicles.year} >= ${f.minYear}`);
  if (f.maxYear) where.push(sql`${vehicles.year} <= ${f.maxYear}`);

  const orderBy = (() => {
    switch (f.sort) {
      case "price_asc": return [asc(vehicles.priceOnRequest), asc(vehicles.priceCents)];
      case "price_desc": return [asc(vehicles.priceOnRequest), desc(vehicles.priceCents)];
      case "year_desc": return [desc(vehicles.year), desc(vehicles.createdAt)];
      case "km_asc": return [sql`${vehicles.mileageKm} is null`, asc(vehicles.mileageKm)];
      case "newest": return [desc(vehicles.createdAt)];
      default: return [sql`case ${vehicles.status} when 'sold' then 1 else 0 end`, desc(vehicles.featured), asc(vehicles.sortOrder), desc(vehicles.createdAt)];
    }
  })();

  return db.query.vehicles.findMany({
    where: and(...where),
    with: { brand: true, images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] } },
    orderBy,
  });
});

export const getFeaturedVehicles = cache(async (limit = 6) =>
  db.query.vehicles.findMany({
    where: and(inArray(vehicles.status, ["available", "reserved", "coming_soon"]), eq(vehicles.featured, true)),
    with: { brand: true, images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] } },
    orderBy: [asc(vehicles.sortOrder), desc(vehicles.createdAt)],
    limit,
  }),
);

export const getVehicleBySlug = cache(async (slug: string) =>
  db.query.vehicles.findFirst({
    where: and(eq(vehicles.slug, slug), ne(vehicles.status, "hidden")),
    with: { brand: true, images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] } },
  }),
);

export const getRelatedVehicles = cache(async (vehicle: { id: number; brandId: number | null; priceCents: number }, limit = 3) => {
  const rows = await db.query.vehicles.findMany({
    where: and(inArray(vehicles.status, ["available", "reserved", "coming_soon"]), ne(vehicles.id, vehicle.id)),
    with: { brand: true, images: { orderBy: (img, { asc }) => [asc(img.sortOrder)] } },
  });
  return rows
    .map((v) => ({ v, score: (v.brandId === vehicle.brandId ? 0 : 1) * 1e9 + Math.abs(v.priceCents - vehicle.priceCents) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.v);
});

export const getInventoryFacets = cache(async () => {
  const rows = db
    .select({ condition: vehicles.condition, body: vehicles.bodyStyle, fuel: vehicles.fuelType, transmission: vehicles.transmission, price: vehicles.priceCents, year: vehicles.year })
    .from(vehicles)
    .where(inArray(vehicles.status, [...PUBLIC_STATUSES]))
    .all();
  const uniq = (xs: (string | null)[]) => Array.from(new Set(xs.filter((x): x is string => !!x))).sort();
  const prices = rows.map((r) => r.price).filter((p) => p > 0);
  return {
    condition: uniq(rows.map((r) => r.condition)),
    body: uniq(rows.map((r) => r.body)),
    fuel: uniq(rows.map((r) => r.fuel)),
    transmission: uniq(rows.map((r) => r.transmission)),
    minPrice: prices.length ? Math.floor(Math.min(...prices) / 100) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices) / 100) : 0,
    minYear: rows.length ? Math.min(...rows.map((r) => r.year)) : 1990,
    maxYear: rows.length ? Math.max(...rows.map((r) => r.year)) : new Date().getFullYear() + 1,
  };
});

export const getServices = cache(async (onlyPublished = true) =>
  db.select().from(services).where(onlyPublished ? eq(services.published, true) : undefined).orderBy(asc(services.sortOrder)).all(),
);
export const getServiceBySlug = cache(async (slug: string) => db.select().from(services).where(eq(services.slug, slug)).get());

export const getTestimonials = cache(async () =>
  db.select().from(testimonials).where(eq(testimonials.published, true)).orderBy(asc(testimonials.sortOrder)).all(),
);

export function bumpVehicleViews(id: number) {
  try {
    db.update(vehicles).set({ views: sql`${vehicles.views} + 1` }).where(eq(vehicles.id, id)).run();
  } catch {}
}

export const getInquiryCounts = cache(async () => {
  const rows = db.select({ status: inquiries.status, n: sql<number>`count(*)` }).from(inquiries).groupBy(inquiries.status).all();
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
});
