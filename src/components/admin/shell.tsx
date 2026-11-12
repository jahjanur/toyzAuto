"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Car, Inbox, Wrench, Tags, MessageSquareQuote, Settings, UserCircle, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { logout } from "@/lib/admin-actions";
import { LogoSvg } from "@/components/brand/logo-svg";
import { ZulberaBadge } from "@/components/brand/zulbera";
import type { SessionPayload } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/vehicles", label: "Vehicles", Icon: Car },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox, badge: true },
  { href: "/admin/services", label: "Services", Icon: Wrench },
  { href: "/admin/brands", label: "Brands", Icon: Tags },
  { href: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Site settings", Icon: Settings },
  { href: "/admin/account", label: "Account & users", Icon: UserCircle },
];

export function AdminShell({ user, newInquiries, children }: { user: SessionPayload; newInquiries: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, Icon, exact, badge }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors", active ? "bg-accent/12 text-accent-2" : "text-ink-2 hover:bg-white/[.04] hover:text-ink")}>
            <Icon className="size-4" /> <span className="flex-1">{label}</span>
            {badge && newInquiries > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">{newInquiries}</span>}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <div className="flex min-h-svh bg-bg text-ink">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-bg-2 p-4 lg:flex">
        <Link href="/admin" className="px-2 pb-6 pt-2"><LogoSvg className="h-8 text-white" carClassName="fill-accent" /><span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.3em] text-muted">Admin panel</span></Link>
        {nav}
        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-ink-2 hover:bg-white/[.04] hover:text-ink"><ExternalLink className="size-4" /> View website</a>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0"><p className="truncate text-[13px]">{user.name}</p><p className="truncate text-[11px] text-muted">{user.email}</p></div>
            <form action={logout}><button className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/[.05] hover:text-danger" aria-label="Sign out"><LogOut className="size-4" /></button></form>
          </div>
          <ZulberaBadge label="Powered by" className="!mt-4" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-bg-2 px-4 py-3 lg:hidden">
          <Link href="/admin"><LogoSvg className="h-7 text-white" carClassName="fill-accent" /></Link>
          <button onClick={() => setOpen((v) => !v)} className="grid size-9 place-items-center rounded-lg border border-line" aria-label="Menu">{open ? <X className="size-4" /> : <Menu className="size-4" />}</button>
        </header>
        {open && (
          <div className="border-b border-line bg-bg-2 p-4 lg:hidden">
            {nav}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px]"><a href="/" target="_blank" className="text-ink-2">View website</a><form action={logout}><button className="text-danger">Sign out</button></form></div>
            <div className="mt-3 border-t border-line pt-3"><ZulberaBadge label="Powered by" /></div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
