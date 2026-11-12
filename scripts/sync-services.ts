import fs from "node:fs";
import path from "node:path";
import { db, services } from "../src/db";

// Update only service content; keep inventory, inquiries and existing visibility intact.
const content = JSON.parse(
  fs.readFileSync(path.resolve("src/data/services.json"), "utf8"),
) as Pick<typeof services.$inferInsert, "slug" | "title" | "icon" | "coverImage" | "excerpt" | "body">[];

for (const service of content) {
  if (!service.coverImage || !fs.existsSync(path.join("public", service.coverImage))) {
    throw new Error(`Missing cover image for ${service.slug}`);
  }
}

db.transaction((tx) => {
  content.forEach((service, sortOrder) => {
    tx.insert(services)
      .values({ ...service, sortOrder, published: true })
      .onConflictDoUpdate({ target: services.slug, set: service })
      .run();
  });
});

console.log(`Updated ${content.length} services. Existing visibility and ordering were preserved.`);
