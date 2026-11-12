import { asc } from "drizzle-orm";
import { db, testimonials } from "@/db";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function TestimonialsAdmin() {
  const rows = db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)).all();
  return (
    <div className="max-w-3xl space-y-6">
      <div><p className="eyebrow">Social proof</p><h1 className="mt-2 font-display text-3xl font-light">Testimonials</h1><p className="mt-2 text-sm text-muted">Published testimonials appear on the homepage. Add real client words only.</p></div>
      <TestimonialForm t={null} />
      <div className="grid gap-3">{rows.map((t) => <TestimonialForm key={t.id} t={t} />)}</div>
    </div>
  );
}
