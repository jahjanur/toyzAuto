import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "../fonts";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Admin", template: "%s · TOYZ Admin" },
  icons: { icon: "/icon.svg" },
  authors: [{ name: "Zulbera", url: "https://zulbera.com" }],
  creator: "Zulbera",
  generator: "Zulbera",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#050505", width: "device-width", initialScale: 1 };

/** Root layout for the admin panel (English only). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
