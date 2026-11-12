import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const now = () => new Date();

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "admin", "editor"] }).notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
});

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  /** Short engine clip played when a visitor hovers the brand (falls back to /sounds/hover/<slug>.mp3). */
  soundUrl: text("sound_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const VEHICLE_STATUSES = ["available", "reserved", "sold", "coming_soon", "hidden"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const vehicles = sqliteTable(
  "vehicles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    priceCents: integer("price_cents").notNull().default(0),
    priceOnRequest: integer("price_on_request", { mode: "boolean" }).notNull().default(false),
    condition: text("condition").notNull().default("Used"),
    mileageKm: integer("mileage_km"),
    bodyStyle: text("body_style"),
    drivetrain: text("drivetrain"),
    transmission: text("transmission"),
    fuelType: text("fuel_type"),
    engine: text("engine"),
    horsepower: integer("horsepower"),
    exteriorColor: text("exterior_color"),
    interiorColor: text("interior_color"),
    vin: text("vin"),
    stockNumber: text("stock_number"),
    summary: text("summary"),
    description: text("description"),
    highlights: text("highlights", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    summaryFr: text("summary_fr"),
    descriptionFr: text("description_fr"),
    highlightsFr: text("highlights_fr", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    videoUrl: text("video_url"),
    /** Engine recording for the "Hear the engine" player (falls back to a brand/engine-type clip). */
    soundUrl: text("sound_url"),
    status: text("status", { enum: VEHICLE_STATUSES }).notNull().default("available"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    views: integer("views").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("vehicles_status_idx").on(t.status), index("vehicles_brand_idx").on(t.brandId)],
);

export const vehicleImages = sqliteTable(
  "vehicle_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    width: integer("width"),
    height: integer("height"),
    blurDataUrl: text("blur_data_url"),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("vehicle_images_vehicle_idx").on(t.vehicleId)],
);

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  body: text("body"),
  titleFr: text("title_fr"),
  excerptFr: text("excerpt_fr"),
  bodyFr: text("body_fr"),
  icon: text("icon").notNull().default("sparkles"),
  coverImage: text("cover_image"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  author: text("author").notNull(),
  role: text("role"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const INQUIRY_TYPES = ["vehicle", "contact", "test_drive", "sell", "service", "wheels"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type", { enum: INQUIRY_TYPES }).notNull().default("contact"),
    vehicleId: integer("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message"),
    meta: text("meta", { mode: "json" }).$type<Record<string, string>>(),
    status: text("status", { enum: ["new", "contacted", "closed"] }).notNull().default("new"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
  },
  (t) => [index("inquiries_status_idx").on(t.status)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
});

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  kind: text("kind", { enum: ["image", "video", "file"] }).notNull().default("image"),
  name: text("name"),
  width: integer("width"),
  height: integer("height"),
  size: integer("size"),
  blurDataUrl: text("blur_data_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now),
});

export const brandsRelations = relations(brands, ({ many }) => ({ vehicles: many(vehicles) }));
export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  brand: one(brands, { fields: [vehicles.brandId], references: [brands.id] }),
  images: many(vehicleImages),
  inquiries: many(inquiries),
}));
export const vehicleImagesRelations = relations(vehicleImages, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehicleImages.vehicleId], references: [vehicles.id] }),
}));
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  vehicle: one(vehicles, { fields: [inquiries.vehicleId], references: [vehicles.id] }),
}));

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type VehicleImage = typeof vehicleImages.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type User = typeof users.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type VehicleWithRelations = Vehicle & { brand: Brand | null; images: VehicleImage[] };
