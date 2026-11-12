"use client";

import { useActionState, useState } from "react";
import { updateSettings, type ActionState } from "@/lib/admin-actions";
import type { SiteSettings, HeroVideo } from "@/lib/settings";
import { Card, Field, Notice, SubmitButton, Toggle } from "./ui";
import { MediaPicker } from "./media-picker";

export function SettingsForm({ s }: { s: SiteSettings }) {
  const [state, action] = useActionState<ActionState, FormData>(updateSettings, null);
  return (
    <form action={action} className="space-y-6 pb-24">
      <div><p className="eyebrow">Configuration</p><h1 className="mt-2 font-display text-3xl font-light">Site settings</h1></div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Brand & hero" description="The first thing visitors see." className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Brand name"><input name="brandName" defaultValue={s.brandName} className="input" /></Field>
            <Field label="Tagline"><input name="tagline" defaultValue={s.tagline} className="input" /></Field>
            <Field label="Hero eyebrow (small line above the headline)" className="md:col-span-2"><input name="heroEyebrow" defaultValue={s.heroEyebrow} className="input" /></Field>
            <Field label="Hero headline" hint="Use a line break to split lines" className="md:col-span-2"><textarea name="heroHeadline" rows={2} defaultValue={s.heroHeadline} className="input font-display text-lg" /></Field>
            <Field label="Hero subheadline" className="md:col-span-2"><textarea name="heroSubheadline" rows={3} defaultValue={s.heroSubheadline} className="input" /></Field>
            <Field label="Primary button label"><input name="heroPrimaryLabel" defaultValue={s.heroPrimaryCta.label} className="input" /></Field>
            <Field label="Primary button link"><input name="heroPrimaryHref" defaultValue={s.heroPrimaryCta.href} className="input" /></Field>
            <Field label="Secondary button label"><input name="heroSecondaryLabel" defaultValue={s.heroSecondaryCta.label} className="input" /></Field>
            <Field label="Secondary button link"><input name="heroSecondaryHref" defaultValue={s.heroSecondaryCta.href} className="input" /></Field>
          </div>
          <div className="mt-6"><p className="label">Hero video</p><VideoFields prefix="heroVideo" v={s.heroVideo} /></div>
        </Card>

        <Card title="Home: statement & feature video" description="The big scrolling sentence and the full-screen video section further down the homepage." className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Statement sentence" className="md:col-span-2"><textarea name="statement" rows={2} defaultValue={s.statement} className="input" /></Field>
            <Field label="Feature eyebrow"><input name="featureEyebrow" defaultValue={s.featureEyebrow} className="input" /></Field>
            <Field label="Feature title" hint="Line break splits lines"><textarea name="featureTitle" rows={2} defaultValue={s.featureTitle} className="input" /></Field>
            <Field label="Feature text" className="md:col-span-2"><input name="featureText" defaultValue={s.featureText} className="input" /></Field>
          </div>
          <div className="mt-6"><p className="label">Feature video</p><VideoFields prefix="featureVideo" v={s.featureVideo} /></div>
        </Card>

        <Card title="Announcement bar" description="Optional strip above the navigation.">
          <div className="grid gap-4">
            <Toggle name="announcementEnabled" label="Show announcement bar" defaultChecked={s.announcement.enabled} />
            <Field label="Text"><input name="announcementText" defaultValue={s.announcement.text} className="input" /></Field>
            <Field label="Link"><input name="announcementHref" defaultValue={s.announcement.href} className="input" /></Field>
          </div>
        </Card>

        <Card title="Contact details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Phone (tel: format)" hint="Digits only with country code, e.g. +15147313773"><input name="phone" defaultValue={s.phone} className="input" /></Field>
            <Field label="Phone (display)"><input name="phoneDisplay" defaultValue={s.phoneDisplay} className="input" /></Field>
            <Field label="WhatsApp number" hint="Optional; enables a WhatsApp button on vehicle pages"><input name="whatsapp" defaultValue={s.whatsapp} className="input" /></Field>
            <Field label="Currency"><input name="currency" defaultValue={s.currency} className="input" /></Field>
            <Field label="Email"><input name="email" defaultValue={s.email} className="input" /></Field>
            <Field label="Secondary email"><input name="emailSecondary" defaultValue={s.emailSecondary} className="input" /></Field>
            <Field label="Address line 1"><input name="addressLine1" defaultValue={s.addressLine1} className="input" /></Field>
            <Field label="Address line 2"><input name="addressLine2" defaultValue={s.addressLine2} className="input" /></Field>
            <Field label="Google Maps link" className="md:col-span-2"><input name="mapUrl" defaultValue={s.mapUrl} className="input" /></Field>
            <Field label="Google Maps embed URL" className="md:col-span-2"><input name="mapEmbedUrl" defaultValue={s.mapEmbedUrl} className="input" /></Field>
          </div>
        </Card>

        <Card title="Opening hours">
          <div className="grid gap-2">
            {s.hours.map((h) => (
              <div key={h.day} className="grid grid-cols-[90px_1fr_1fr_auto] items-center gap-2">
                <span className="text-[13px]">{h.day}</span>
                <input name={`hours_${h.day}_open`} defaultValue={h.open} placeholder="09:00" className="input py-2" />
                <input name={`hours_${h.day}_close`} defaultValue={h.close} placeholder="18:00" className="input py-2" />
                <label className="flex items-center gap-1.5 text-[12px] text-muted"><input type="checkbox" name={`hours_${h.day}_closed`} defaultChecked={h.closed} className="accent-accent" /> Closed</label>
              </div>
            ))}
            <Field label="Note" className="mt-2"><input name="hoursNote" defaultValue={s.hoursNote} className="input" /></Field>
          </div>
        </Card>

        <Card title="Social links">
          <div className="grid gap-4 md:grid-cols-2">
            {(["instagram", "tiktok", "youtube", "x", "linkedin", "facebook"] as const).map((k) => <Field key={k} label={k}><input name={k} defaultValue={s.socials[k]} className="input" /></Field>)}
          </div>
        </Card>

        <Card title="About & stats">
          <div className="grid gap-4">
            <Field label="About section title"><input name="aboutTitle" defaultValue={s.aboutTitle} className="input" /></Field>
            <Field label="About text" hint="Blank line between paragraphs"><textarea name="aboutBody" rows={8} defaultValue={s.aboutBody} className="input" /></Field>
            <Field label="Stats (one per line, value | label)"><textarea name="stats" rows={4} defaultValue={s.stats.map((x) => `${x.value} | ${x.label}`).join("\n")} className="input font-mono text-[12.5px]" /></Field>
            <Field label="Partners (one per line)"><textarea name="partners" rows={4} defaultValue={s.partners.join("\n")} className="input" /></Field>
          </div>
        </Card>

        <Card title="SEO & footer" className="xl:col-span-2">
          <div className="grid gap-4">
            <Field label="Default page title"><input name="seoTitle" defaultValue={s.seoTitle} className="input" /></Field>
            <Field label="Meta description"><textarea name="seoDescription" rows={2} defaultValue={s.seoDescription} className="input" /></Field>
            <Field label="Footer blurb"><textarea name="footerBlurb" rows={2} defaultValue={s.footerBlurb} className="input" /></Field>
          </div>
        </Card>

        <Card title="French texts · Textes en français" description="Shown on the French site (/fr). Every field mirrors an English one above; leave one empty to show the English text instead." className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Slogan (tagline)"><input name="fr_tagline" defaultValue={s.fr.tagline} className="input" /></Field>
            <Field label="Sur-titre du héros (hero eyebrow)"><input name="fr_heroEyebrow" defaultValue={s.fr.heroEyebrow} className="input" /></Field>
            <Field label="Titre du héros (hero headline)" hint="Line break splits lines" className="md:col-span-2"><textarea name="fr_heroHeadline" rows={2} defaultValue={s.fr.heroHeadline} className="input font-display text-lg" /></Field>
            <Field label="Sous-titre du héros (hero subheadline)" className="md:col-span-2"><textarea name="fr_heroSubheadline" rows={2} defaultValue={s.fr.heroSubheadline} className="input" /></Field>
            <Field label="Bouton principal (primary button)"><input name="fr_heroPrimaryLabel" defaultValue={s.fr.heroPrimaryLabel} className="input" /></Field>
            <Field label="Bouton secondaire (secondary button)"><input name="fr_heroSecondaryLabel" defaultValue={s.fr.heroSecondaryLabel} className="input" /></Field>
            <Field label="Phrase d'accroche (statement)" className="md:col-span-2"><textarea name="fr_statement" rows={2} defaultValue={s.fr.statement} className="input" /></Field>
            <Field label="Section vidéo · sur-titre"><input name="fr_featureEyebrow" defaultValue={s.fr.featureEyebrow} className="input" /></Field>
            <Field label="Section vidéo · titre" hint="Line break splits lines"><textarea name="fr_featureTitle" rows={2} defaultValue={s.fr.featureTitle} className="input" /></Field>
            <Field label="Section vidéo · texte" className="md:col-span-2"><input name="fr_featureText" defaultValue={s.fr.featureText} className="input" /></Field>
            <Field label="Bandeau d'annonce (announcement)"><input name="fr_announcementText" defaultValue={s.fr.announcementText} className="input" /></Field>
            <Field label="Note sur les heures (hours note)"><input name="fr_hoursNote" defaultValue={s.fr.hoursNote} className="input" /></Field>
            <Field label="Libellés des statistiques (one per line, same order as Stats)" className="md:col-span-2"><textarea name="fr_statLabels" rows={3} defaultValue={s.fr.statLabels.join("\n")} className="input" /></Field>
            <Field label="À propos · titre"><input name="fr_aboutTitle" defaultValue={s.fr.aboutTitle} className="input" /></Field>
            <Field label="Titre SEO (default page title)"><input name="fr_seoTitle" defaultValue={s.fr.seoTitle} className="input" /></Field>
            <Field label="À propos · texte" hint="Blank line between paragraphs" className="md:col-span-2"><textarea name="fr_aboutBody" rows={6} defaultValue={s.fr.aboutBody} className="input" /></Field>
            <Field label="Description SEO (meta description)" className="md:col-span-2"><textarea name="fr_seoDescription" rows={2} defaultValue={s.fr.seoDescription} className="input" /></Field>
            <Field label="Texte du pied de page (footer blurb)" className="md:col-span-2"><textarea name="fr_footerBlurb" rows={2} defaultValue={s.fr.footerBlurb} className="input" /></Field>
          </div>
        </Card>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line glass p-3 lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-2"><Notice state={state} /><SubmitButton className="h-10 px-6">Save settings</SubmitButton></div>
      </div>
    </form>
  );
}

function VideoFields({ prefix, v }: { prefix: string; v: HeroVideo }) {
  const [src, setSrc] = useState(v.src);
  const [mob, setMob] = useState(v.srcMobile ?? "");
  const [poster, setPoster] = useState(v.poster ?? "");
  return (
    <div className="rounded-xl border border-line bg-bg/40 p-4">
      <input type="hidden" name={`${prefix}Src`} value={src} />
      <input type="hidden" name={`${prefix}SrcMobile`} value={mob} />
      <input type="hidden" name={`${prefix}Poster`} value={poster} />
      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="aspect-video overflow-hidden rounded-lg border border-line bg-bg-2">{src ? <video key={src} src={src} poster={poster || undefined} muted loop autoPlay playsInline className="h-full w-full object-cover" /> : null}</div>
        <div className="grid gap-3">
          <div><p className="label">Video (desktop, mp4)</p><UrlPicker value={src} onChange={setSrc} accept="video/*" /></div>
          <div><p className="label">Video (mobile, optional)</p><UrlPicker value={mob} onChange={setMob} accept="video/*" /></div>
          <div><p className="label">Poster image</p><UrlPicker value={poster} onChange={setPoster} accept="image/*" /></div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-2">Tip: keep videos under ~8 MB (1080p, no audio). Changes apply when you press Save settings.</p>
    </div>
  );
}

function UrlPicker({ value, onChange, accept }: { value: string; onChange: (v: string) => void; accept: string }) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    const fd = new FormData(); fd.append("files", file);
    try { const res = await fetch("/api/upload", { method: "POST", body: fd }); const j = await res.json(); if (res.ok) onChange(j.files[0].url); else alert(j.error ?? "Upload failed"); } catch { alert("Upload failed"); } finally { setBusy(false); }
  }
  return (
    <div className="flex gap-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/media/… or /uploads/…" className="input h-9 py-0 text-[12.5px]" />
      <label className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg border border-line-2 px-3 text-[12px] hover:border-accent/60">{busy ? "…" : "Upload"}<input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
    </div>
  );
}
