import Link from "next/link";
import Image from "next/image";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { Car, Inbox, Eye, Banknote, Plus, ArrowUpRight } from "lucide-react";
import { db, inquiries, vehicles } from "@/db";
import { getSettings } from "@/lib/settings";
import { formatPrice, formatNumber, timeAgo, STATUS_LABEL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/admin/ui";

export default async function Dashboard() {
  const s = await getSettings();
  const live = db.select({ n: sql<number>`count(*)`, value: sql<number>`coalesce(sum(price_cents),0)`, views: sql<number>`coalesce(sum(views),0)` }).from(vehicles).where(inArray(vehicles.status, ["available", "reserved", "coming_soon"])).get()!;
  const sold = db.select({ n: sql<number>`count(*)` }).from(vehicles).where(eq(vehicles.status, "sold")).get()!;
  const newInq = db.select({ n: sql<number>`count(*)` }).from(inquiries).where(eq(inquiries.status, "new")).get()!;
  const recent = await db.query.inquiries.findMany({ with: { vehicle: { columns: { title: true, slug: true } } }, orderBy: [desc(inquiries.createdAt)], limit: 6 });
  const top = await db.query.vehicles.findMany({ with: { images: { limit: 1, orderBy: (i, { asc }) => [asc(i.sortOrder)] } }, orderBy: [desc(vehicles.views)], limit: 5 });

  const kpis = [
    { label: "Live vehicles", value: formatNumber(live.n), sub: `${sold.n} sold`, Icon: Car },
    { label: "Inventory value", value: formatPrice(live.value, s.currency), sub: "listed prices", Icon: Banknote },
    { label: "New inquiries", value: formatNumber(newInq.n), sub: "awaiting reply", Icon: Inbox },
    { label: "Vehicle page views", value: formatNumber(live.views), sub: "since launch", Icon: Eye },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Overview</p><h1 className="mt-2 font-display text-3xl font-light">Dashboard</h1></div>
        <Link href="/admin/vehicles/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-2"><Plus className="size-4" /> Add vehicle</Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, sub, Icon }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between"><p className="label mb-0">{label}</p><Icon className="size-4 text-accent" /></div>
            <p className="mt-3 font-display text-2xl font-light tracking-tight">{value}</p>
            <p className="mt-1 text-[12px] text-muted">{sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Recent inquiries" actions={<Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-[13px] text-accent hover:text-accent-2">All inquiries <ArrowUpRight className="size-3.5" /></Link>}>
          {recent.length ? (
            <ul className="divide-y divide-line">
              {recent.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm"><span className="font-medium">{q.name}</span> <span className="text-muted">· {q.email}</span></p>
                    <p className="mt-0.5 truncate text-[12.5px] text-muted">{q.vehicle ? q.vehicle.title : q.type.replace("_", " ")} {q.message ? `— ${q.message}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1"><Badge tone={q.status === "new" ? "accent" : "neutral"}>{q.status}</Badge><span className="text-[11px] text-muted">{timeAgo(q.createdAt)}</span></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">No inquiries yet. They will appear here as soon as a visitor submits a form.</p>}
        </Card>
        <Card title="Most viewed vehicles">
          <ul className="divide-y divide-line">
            {top.map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-bg-2">{v.images[0] && <Image src={v.images[0].url} alt="" fill sizes="48px" className="object-cover" />}</div>
                <div className="min-w-0 flex-1"><Link href={`/admin/vehicles/${v.id}`} className="block truncate text-sm hover:text-accent">{v.title}</Link><p className="text-[11px] text-muted">{STATUS_LABEL[v.status]} · {formatNumber(v.views)} views</p></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
