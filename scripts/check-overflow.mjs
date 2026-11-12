// Loads every public page in EN + FR at several widths and reports text that sticks out of any visible box,
// or out of the viewport. Scroll containers, the horizontal car rail and the hero video are excluded.
import { chromium } from "playwright";
import fs from "node:fs";
// Usage: node scripts/check-overflow.mjs slugs.json   (admin pages: ADMIN=1 ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/check-overflow.mjs slugs.json)
const B = process.env.BASE_URL || "http://localhost:3312";
const slugs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const widths = (process.env.WIDTHS || "360,768,1024,1280,1885").split(",").map(Number);
const base = ["/", "/inventory", "/services", "/about", "/contact", "/sell", "/privacy", "/nope-404",
  ...["paint-protection-film", "vehicle-customization", "detailing", "wheels-and-tires", "performance"].map((s) => `/services/${s}`),
  ...slugs.map((s) => `/inventory/${s}`)];
const pages = process.env.ADMIN ? ["/admin/login", "/admin", "/admin/vehicles", "/admin/vehicles/16", "/admin/vehicles/new", "/admin/inquiries", "/admin/services", "/admin/services/1", "/admin/brands", "/admin/testimonials", "/admin/settings", "/admin/account"] : [...base, ...base.map((p) => (p === "/" ? "/fr" : "/fr" + p))];
if (process.env.ADMIN && !(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)) { console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD to check admin pages."); process.exit(1); }
const browser = await chromium.launch();
const issues = [];
const check = () => {
  const out = [];
  const vw = document.documentElement.clientWidth;
  const isBox = (cs) => cs.overflowX !== "visible" || parseFloat(cs.borderRightWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent");
  const scroller = (cs) => cs.overflowX === "auto" || cs.overflowX === "scroll";
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("[data-overflow-ok], script, style, svg, noscript, .sr-only")) continue;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.replace(/[\s ]/g, "").length);
    if (!hasText) continue;
    const cs0 = getComputedStyle(el);
    if (cs0.visibility === "hidden" || cs0.display === "none" || cs0.textOverflow === "ellipsis") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    let a = el.parentElement, skip = false;
    while (a && a !== document.body) {
      const cs = getComputedStyle(a);
      if (scroller(cs)) { skip = true; break; }
      if (cs.textOverflow === "ellipsis") { skip = true; break; }
      if (isBox(cs) && a.getBoundingClientRect().width > 0) {
        const ar = a.getBoundingClientRect();
        if (r.right > ar.right + 1.5 || r.left < ar.left - 1.5) {
          out.push({ text: el.textContent.trim().slice(0, 40), tag: el.tagName.toLowerCase(), over: Math.round(Math.max(r.right - ar.right, ar.left - r.left)), box: (a.className.baseVal ?? a.className).toString().slice(0, 60) });
          skip = true; break;
        }
      }
      a = a.parentElement;
    }
    if (skip) continue;
    if (r.right > vw + 1.5 || r.left < -1.5) out.push({ text: el.textContent.trim().slice(0, 40), tag: el.tagName.toLowerCase(), over: Math.round(Math.max(r.right - vw, -r.left)), box: "VIEWPORT" });
  }
  return out;
};
let n = 0;
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 600, hasTouch: w < 600 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("toyz-intro", "1"); localStorage.setItem("toyz-sound", "on"); } catch {} });
  const page = await ctx.newPage();
  if (process.env.ADMIN) {
    await page.goto(B + "/admin/login", { waitUntil: "networkidle" });
    const found = await page.evaluate(check); n++; for (const f of found) issues.push({ w, p: "/admin/login", ...f });
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL ?? ""); await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD ?? "");
    await page.click('button[type="submit"]'); await page.waitForURL("**/admin");
  }
  for (const p of pages.filter((x) => !(process.env.ADMIN && x === "/admin/login"))) {
    await page.goto(B + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    const found = await page.evaluate(check);
    n++;
    for (const f of found) issues.push({ w, p, ...f });
  }
  await ctx.close();
  console.log(`width ${w}: checked ${pages.length} pages`);
}
await browser.close();
const key = (i) => `${i.text}|${i.box}`;
const grouped = new Map();
for (const i of issues) { const k = key(i); if (!grouped.has(k)) grouped.set(k, { ...i, where: [] }); grouped.get(k).where.push(`${i.w}:${i.p}`); }
console.log(`\n${n} page loads, ${issues.length} overflow hits, ${grouped.size} distinct`);
for (const g of grouped.values()) console.log(`- [${g.tag}] "${g.text}" +${g.over}px out of ${g.box} | ${g.where.slice(0, 4).join(", ")}${g.where.length > 4 ? ` (+${g.where.length - 4})` : ""}`);
fs.writeFileSync("overflow-report.json", JSON.stringify([...grouped.values()], null, 1));
