import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Mail, Phone, Trash2 } from "lucide-react";
import { db, inquiries } from "@/db";
import { setInquiryStatus, deleteInquiry } from "@/lib/admin-actions";
import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/admin/ui";

const TABS = ["all", "new", "contacted", "closed"] as const;

export default async function InquiriesAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const rows = await db.query.inquiries.findMany({
    where: status !== "all" ? eq(inquiries.status, status as "new" | "contacted" | "closed") : undefined,
    with: { vehicle: { columns: { title: true, slug: true, id: true } } },
    orderBy: [desc(inquiries.createdAt)],
  });
  return (
    <div className="space-y-6">
      <div><p className="eyebrow">Leads</p><h1 className="mt-2 font-display text-3xl font-light">Inquiries</h1></div>
      <div className="flex gap-1.5">
        {TABS.map((t) => <Link key={t} href={`/admin/inquiries${t === "all" ? "" : `?status=${t}`}`} className={cn("rounded-full border px-3 py-1.5 text-[12px] capitalize", status === t ? "border-accent text-accent-2" : "border-line text-ink-2")}>{t}</Link>)}
      </div>
      <ul className="grid gap-3">
        {rows.map((q) => (
          <li key={q.id} className={cn("rounded-2xl border bg-surface p-5", q.status === "new" ? "border-accent/40" : "border-line")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{q.name}</p>
                  <Badge tone={q.status === "new" ? "accent" : "neutral"}>{q.status}</Badge>
                  <Badge>{q.type.replace("_", " ")}</Badge>
                  {q.vehicle && <Link href={`/admin/vehicles/${q.vehicle.id}`} className="text-[12px] text-accent hover:text-accent-2">{q.vehicle.title}</Link>}
                  {q.meta && Object.entries(q.meta).map(([k, v]) => <span key={k} className="text-[12px] text-muted">{k}: {v}</span>)}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-4 text-[13px] text-ink-2">
                  <a href={`mailto:${q.email}`} className="inline-flex items-center gap-1.5 hover:text-accent"><Mail className="size-3.5 text-accent" />{q.email}</a>
                  {q.phone && <a href={`tel:${q.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent"><Phone className="size-3.5 text-accent" />{q.phone}</a>}
                  <span className="text-muted">{formatDate(q.createdAt)}</span>
                </div>
                {q.message && <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-2">{q.message}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {(["new", "contacted", "closed"] as const).filter((s) => s !== q.status).map((s) => (
                  <form key={s} action={async () => { "use server"; await setInquiryStatus(q.id, s); }}><button className="rounded-lg border border-line px-3 py-1.5 text-[12px] capitalize text-ink-2 hover:border-accent/60 hover:text-ink">Mark {s}</button></form>
                ))}
                <ConfirmButton action={deleteInquiry.bind(null, q.id)} variant="icon" className="size-8" label="Delete" message={`Delete the inquiry from ${q.name}? This cannot be undone.`}><Trash2 className="size-3.5" /></ConfirmButton>
              </div>
            </div>
          </li>
        ))}
        {!rows.length && <li className="rounded-2xl border border-dashed border-line-2 p-10 text-center text-muted">No inquiries here.</li>}
      </ul>
    </div>
  );
}
