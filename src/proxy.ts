import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { LOCALE_COOKIE } from "@/i18n/config";
import { authSecretKey } from "@/lib/auth-secret";

const SESSION_COOKIE = "toyz_session";

/** Paths that are not pages of the bilingual site. */
const PASSTHROUGH = /^\/(api|uploads|_next)(\/|$)/;
const HAS_EXTENSION = /\.[a-z0-9]{2,5}$/i;

async function guardAdmin(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  try {
    if (!token) throw new Error("no session");
    await jwtVerify(token, authSecretKey());
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

/** First visit without a saved choice: send French-preferring browsers to /fr. */
function prefersFrench(req: NextRequest) {
  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  if (saved) return saved === "fr";
  const header = req.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("fr");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return guardAdmin(req);
  if (PASSTHROUGH.test(pathname) || HAS_EXTENSION.test(pathname)) return NextResponse.next();

  // French pages: /fr, /fr/...
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return NextResponse.next();

  // Canonical English URLs have no prefix: /en/x → /x
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url);
  }

  if (prefersFrench(req)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
    return NextResponse.redirect(url);
  }

  // English: the address stays as is; next.config.ts rewrites it onto the [locale]=en route.
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
