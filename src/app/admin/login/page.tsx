import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { LogoSvg } from "@/components/brand/logo-svg";
import { ZulberaCredit } from "@/components/brand/zulbera";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; restored?: string }> }) {
  if (await getSession()) redirect("/admin");
  const { next, restored } = await searchParams;
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-bg px-5">
      <video src="/media/hero-bugatti-720.mp4" poster="/media/hero-bugatti-poster.jpg" muted loop playsInline autoPlay className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/80 to-bg" />
      <div className="relative w-full max-w-sm rounded-3xl border border-line glass p-8 shadow-card">
        <LogoSvg className="h-10 text-white" carClassName="fill-accent" />
        <p className="eyebrow mt-6">Admin panel</p>
        <h1 className="mt-2 font-display text-2xl font-medium">Sign in</h1>
        {restored !== undefined && (
          <p role="status" className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-[12.5px] text-ink-2">
            Backup restored ({Number(restored) || 0} vehicles). Sign in with an account from the backup.
          </p>
        )}
        <LoginForm next={next} />
      </div>
      <ZulberaCredit label="Powered by" size="lg" className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap" />
    </main>
  );
}
