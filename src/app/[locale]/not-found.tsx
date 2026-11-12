import { ButtonLink } from "@/components/ui/button";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <section className="container-x flex min-h-[70svh] flex-col items-center justify-center pt-[var(--nav-h)] text-center">
      <p className="eyebrow mb-5">404</p>
      <h1 className="display text-[clamp(2.4rem,9vw,6rem)]">{t.notFound.title.replace(/\.$/, "")}<span className="text-accent">.</span></h1>
      <p className="mt-5 max-w-md text-muted">{t.notFound.text}</p>
      <div className="mt-8 flex gap-3"><ButtonLink href="/inventory" arrow>{t.notFound.browse}</ButtonLink><ButtonLink href="/" variant="ghost">{t.notFound.home}</ButtonLink></div>
    </section>
  );
}
