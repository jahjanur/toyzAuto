"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ExternalLink, Trash2, Copy } from "lucide-react";
import { saveVehicle, deleteVehicle, duplicateVehicle, type ActionState } from "@/lib/admin-actions";
import { VEHICLE_STATUSES, type Brand, type Vehicle, type VehicleImage } from "@/db/schema";
import { STATUS_LABEL } from "@/lib/utils";
import { Card, Field, Notice, SubmitButton, Toggle, ConfirmButton, ActionButton } from "./ui";
import { ImageManager } from "./image-manager";
import { MediaPicker } from "./media-picker";

const OPTIONS = {
  condition: ["New", "Used", "Certified Pre-Owned"],
  body: ["Coupe", "Convertible", "Targa", "Sedan", "SUV", "Wagon", "Hatchback", "Pickup", "6x6 Pickup", "Armored SUV", "Supercar", "Hypercar"],
  drivetrain: ["RWD", "AWD", "FWD", "4WD", "6x6"],
  transmission: ["Automatic", "Manual", "PDK", "DCT", "CVT"],
  fuel: ["Gasoline", "Hybrid", "Electric", "Diesel"],
};

export function VehicleForm({ vehicle, images, brands, currency }: { vehicle: Vehicle | null; images: VehicleImage[]; brands: Brand[]; currency: string }) {
  const [state, action] = useActionState<ActionState, FormData>(saveVehicle.bind(null, vehicle?.id ?? null), null);
  const v = vehicle;
  return (
    <form action={action} className="space-y-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{v ? "Edit vehicle" : "New vehicle"}</p>
          <h1 className="mt-2 font-display text-3xl font-light">{v?.title ?? "Add a vehicle"}</h1>
        </div>
        {v && (
          <div className="flex flex-wrap gap-2">
            <Link href={`/inventory/${v.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] text-ink-2 hover:text-ink"><ExternalLink className="size-3.5" /> View page</Link>
            <ActionButton action={() => duplicateVehicle(v.id)}><Copy className="size-3.5" /> Duplicate</ActionButton>
            <ConfirmButton action={deleteVehicle.bind(null, v.id)} message={`Delete “${v.title}” and all its photos? This cannot be undone.`}><Trash2 className="size-3.5" /> Delete</ConfirmButton>
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Basics">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title" className="md:col-span-2"><input name="title" required defaultValue={v?.title ?? ""} placeholder="2025 Porsche 911 GT3 RS" className="input" /></Field>
              <Field label="Brand">
                <select name="brandId" defaultValue={v?.brandId ?? ""} className="input">
                  <option value="" className="bg-surface">— Select —</option>
                  {brands.map((b) => <option key={b.id} value={b.id} className="bg-surface">{b.name}</option>)}
                </select>
              </Field>
              <Field label="Or add a new brand" hint="Overrides the selection above"><input name="newBrand" placeholder="e.g. McLaren" className="input" /></Field>
              <Field label="Model"><input name="model" required defaultValue={v?.model ?? ""} placeholder="911 GT3 RS" className="input" /></Field>
              <Field label="Year"><input name="year" type="number" required defaultValue={v?.year ?? new Date().getFullYear()} className="input" /></Field>
              <Field label="URL slug" hint="Leave empty to generate from the title" className="md:col-span-2"><input name="slug" defaultValue={v?.slug ?? ""} className="input font-mono text-[13px]" /></Field>
            </div>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={`Price (${currency})`}><input name="price" type="number" min={0} step="1" defaultValue={v ? v.priceCents / 100 : ""} className="input" /></Field>
              <div className="self-end"><Toggle name="priceOnRequest" label="Price on request" hint="Hides the price and shows “Price on request”" defaultChecked={v?.priceOnRequest ?? false} /></div>
            </div>
          </Card>

          <Card title="Specifications">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Condition"><input name="condition" list="dl-condition" defaultValue={v?.condition ?? "Used"} className="input" /></Field>
              <Field label="Mileage (km)"><input name="mileageKm" type="number" min={0} defaultValue={v?.mileageKm ?? ""} className="input" /></Field>
              <Field label="Body style"><input name="bodyStyle" list="dl-body" defaultValue={v?.bodyStyle ?? ""} className="input" /></Field>
              <Field label="Drivetrain"><input name="drivetrain" list="dl-drivetrain" defaultValue={v?.drivetrain ?? ""} className="input" /></Field>
              <Field label="Transmission"><input name="transmission" list="dl-transmission" defaultValue={v?.transmission ?? ""} className="input" /></Field>
              <Field label="Powertrain / fuel"><input name="fuelType" list="dl-fuel" defaultValue={v?.fuelType ?? ""} className="input" /></Field>
              <Field label="Engine" className="md:col-span-2"><input name="engine" defaultValue={v?.engine ?? ""} placeholder="4.0L Twin-Turbo V8" className="input" /></Field>
              <Field label="Horsepower"><input name="horsepower" type="number" min={0} defaultValue={v?.horsepower ?? ""} className="input" /></Field>
              <Field label="Exterior colour"><input name="exteriorColor" defaultValue={v?.exteriorColor ?? ""} className="input" /></Field>
              <Field label="Interior colour"><input name="interiorColor" defaultValue={v?.interiorColor ?? ""} className="input" /></Field>
              <Field label="Stock #"><input name="stockNumber" defaultValue={v?.stockNumber ?? ""} className="input" /></Field>
              <Field label="VIN" hint="Internal only, never shown publicly" className="md:col-span-3"><input name="vin" defaultValue={v?.vin ?? ""} className="input font-mono text-[13px]" /></Field>
            </div>
            {Object.entries(OPTIONS).map(([k, opts]) => <datalist key={k} id={`dl-${k}`}>{opts.map((o) => <option key={o} value={o} />)}</datalist>)}
          </Card>

          <Card title="Content (English)" description="Summary appears on cards and search results. Description supports blank-line paragraphs, “## Heading” lines and “- bullet” lines.">
            <div className="grid gap-4">
              <Field label="Summary (1–2 sentences)"><textarea name="summary" rows={2} defaultValue={v?.summary ?? ""} className="input" /></Field>
              <Field label="Description"><textarea name="description" rows={14} defaultValue={v?.description ?? ""} className="input font-mono text-[12.5px] leading-relaxed" /></Field>
              <Field label="Highlights (one per line)"><textarea name="highlights" rows={5} defaultValue={(v?.highlights ?? []).join("\n")} placeholder={"Full XPEL PPF\n22'' HRE wheels\nExtended warranty"} className="input" /></Field>
              <Field label="Video URL (optional)" hint="YouTube link or an uploaded .mp4"><MediaPicker name="videoUrl" defaultValue={v?.videoUrl} accept="video/*" label="Upload video" preview={false} /></Field>
            </div>
          </Card>

          <Card title="French content · Contenu en français" description="Shown on the French site (/fr). Leave a field empty to show the English text there instead.">
            <div className="grid gap-4">
              <Field label="Résumé (1–2 phrases)"><textarea name="summaryFr" rows={2} defaultValue={v?.summaryFr ?? ""} className="input" /></Field>
              <Field label="Description"><textarea name="descriptionFr" rows={14} defaultValue={v?.descriptionFr ?? ""} className="input font-mono text-[12.5px] leading-relaxed" /></Field>
              <Field label="Points forts (un par ligne)"><textarea name="highlightsFr" rows={5} defaultValue={(v?.highlightsFr ?? []).join("\n")} placeholder={"Film de protection XPEL complet\nJantes HRE de 22 po\nGarantie prolongée"} className="input" /></Field>
            </div>
          </Card>

          <Card title="Photos" description="Drag to reorder. The first photo is the cover used on cards and social previews.">
            <ImageManager initial={images.map((i) => ({ url: i.url, width: i.width, height: i.height, blurDataUrl: i.blurDataUrl, alt: i.alt }))} title={v?.title} />
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <Card title="Publishing">
            <div className="grid gap-4">
              <Field label="Status">
                <select name="status" defaultValue={v?.status ?? "available"} className="input">
                  {VEHICLE_STATUSES.map((st) => <option key={st} value={st} className="bg-surface">{STATUS_LABEL[st]}</option>)}
                </select>
              </Field>
              <Toggle name="featured" label="Featured on homepage" defaultChecked={v?.featured ?? false} />
              <Field label="Sort order" hint="Lower numbers appear first"><input name="sortOrder" type="number" defaultValue={v?.sortOrder ?? 0} className="input" /></Field>
              <Notice state={state} />
              <SubmitButton className="h-11 w-full">{v ? "Save changes" : "Create vehicle"}</SubmitButton>
            </div>
          </Card>
          {v && (
            <Card title="Stats">
              <dl className="grid grid-cols-2 gap-3 text-[13px]">
                <div><dt className="text-muted">Views</dt><dd className="font-medium">{v.views}</dd></div>
                <div><dt className="text-muted">Created</dt><dd className="font-medium">{new Date(v.createdAt).toLocaleDateString()}</dd></div>
              </dl>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line glass p-3 lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-2">
          <p className="hidden text-[12.5px] text-muted sm:block">{v ? "Changes are live on the website as soon as you save." : "The vehicle goes live immediately unless its status is Hidden."}</p>
          <div className="flex items-center gap-3"><Notice state={state} /><SubmitButton className="h-10 px-6">{v ? "Save changes" : "Create vehicle"}</SubmitButton></div>
        </div>
      </div>
    </form>
  );
}
