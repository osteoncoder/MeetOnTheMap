import { launch, open, tc, shot, sleep, record } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { places } from "/home/user/MeetOnTheMap/public/catalog.js";
import { posts, infoPages } from "/home/user/MeetOnTheMap/public/content.js";
const axeSrc = readFileSync("/tmp/qa/node_modules/axe-core/axe.min.js", "utf8");
const b = await launch();
const VP = [
  ["Mobile 375x667", { width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ["Mobile 390x844", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }],
  ["Tablet 768x1024", { width: 768, height: 1024, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ["Laptop 1366x768", { width: 1366, height: 768 }],
  ["Desktop 1920x1080", { width: 1920, height: 1080 }],
];
const pages = ["/", "/destinations", "/packages", "/packages/maldives", "/destinations/bali", "/blog/first-time-traveller-checklist", "/privacy-policy", "/unknown"];
const detail = {};
for (const [vname, vp] of VP) {
  const rows = [];
  for (const path of pages) {
    const p = await open(b, path, { viewport: vp });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } scrollTo(0, 0); });
    await sleep(400);
    const r = await p.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const vis = (e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0 && !e.closest("[hidden]"); };
      const off = [...document.querySelectorAll("body *")].filter((e) => vis(e) && e.getBoundingClientRect().right > W + 1 && !e.closest(".hero")).map((e) => e.tagName.toLowerCase() + "." + [...e.classList].join(".")).slice(0, 5);
      const tiny = [...document.querySelectorAll("body *")].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12);
      const tinyClasses = [...new Set(tiny.map((e) => e.tagName.toLowerCase() + (e.className ? "." + String(e.className).split(" ")[0] : "") + "(" + getComputedStyle(e).fontSize + ")"))].slice(0, 6);
      const menu = getComputedStyle(document.querySelector(".menu")).display !== "none";
      const navInline = getComputedStyle(document.querySelector("#nav")).display !== "none";
      const smallTargets = [...document.querySelectorAll("main a, main button, main input, main select, header a, header button")].filter((e) => vis(e) && !e.closest("p, li") && (e.getBoundingClientRect().height < 24 || e.getBoundingClientRect().width < 24)).map((e) => (e.textContent.trim().slice(0, 20) || e.getAttribute("aria-label") || e.tagName) + `(${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)})`).slice(0, 6);
      const header = document.querySelector(".header").getBoundingClientRect();
      const brandR = document.querySelector(".header .brand").getBoundingClientRect(), cta = document.querySelector(".nav-cta").getBoundingClientRect(), mb = document.querySelector(".menu").getBoundingClientRect();
      const overlapHeader = (cta.width > 0 && brandR.right > cta.left + 1) || (cta.width > 0 && mb.width > 0 && cta.right > mb.left + 1) || (mb.width > 0 && brandR.right > mb.left + 1);
      return { hScroll: document.documentElement.scrollWidth > W, sw: document.documentElement.scrollWidth, W, off, tinyClasses, tinyCount: tiny.length, menu, navInline, smallTargets, overlapHeader, headerH: Math.round(header.height) };
    });
    rows.push({ path, ...r });
    if (["/", "/packages/maldives", "/packages"].includes(path)) await shot(p, `resp-${vp.width}x${vp.height}${path.replace(/\//g, "_") || "_home"}`, path === "/" && (vp.width === 375 || vp.width === 1920) ? false : false);
    if (path === "/" && [375, 768, 1920].includes(vp.width)) await shot(p, `resp-full-${vp.width}-home`, true);
    await p.close();
  }
  detail[vname] = rows;
  const anyH = rows.filter((r) => r.hScroll);
  const menuOk = rows.every((r) => (vp.width <= 800 ? r.menu && !r.navInline : !r.menu && r.navInline));
  const overl = rows.filter((r) => r.overlapHeader);
  await tc({ id: "TC-RESP-" + vp.width, type: "Responsive/UI", module: "Layout", scenario: `Layout at ${vname} on ${pages.length} pages`, steps: `Set DevTools device toolbar to ${vp.width}x${vp.height}; open each page; scroll to bottom`, data: pages.join(", "), expected: "No horizontal scrolling, no element past right edge, correct menu type (hamburger ≤800px), header items not overlapping" }, async () => ({
    actual: `horizontal scroll on: ${anyH.map((r) => r.path + `(${r.sw}>${r.W})`).join(",") || "none"}; elements past edge: ${[...new Set(rows.flatMap((r) => r.off))].join(",") || "none"}; menu correct=${menuOk}; header overlap: ${overl.map((r) => r.path).join(",") || "none"}; text <12px: ${[...new Set(rows.flatMap((r) => r.tinyClasses))].join(" ") || "none"}; small tap targets: ${[...new Set(rows.flatMap((r) => r.smallTargets))].join(" ") || "none"}`,
    pass: !anyH.length && menuOk && !overl.length && !rows.some((r) => r.off.length),
  }));
}
writeFileSync("/tmp/qa/responsive.json", JSON.stringify(detail, null, 1));

if (process.env.SKIP_AXE) { await b.close(); process.exit(0); }
// ---- Accessibility scan (axe-core, WCAG 2.1 AA) on every route ----
const routes = ["/", "/destinations", ...places.map((x) => `/destinations/${x.id}`), "/packages", ...places.map((x) => `/packages/${x.id}`), "/blog", ...posts.map((x) => `/blog/${x.slug}`), ...Object.keys(infoPages).map((k) => "/" + k), "/unknown"];
const agg = {};
for (const [vname, vp] of [VP[0], VP[3]]) {
  for (const r of routes) {
    const p = await open(b, r, { viewport: vp });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 25)); } });
    await sleep(900); // let reveal animations finish
    await p.addScriptTag({ content: axeSrc });
    const res = await p.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] })).violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => n.target.join(" ") + " :: " + (n.any[0]?.message || n.all[0]?.message || "")) })));
    for (const v of res) { agg[v.id] ??= { impact: v.impact, help: v.help, pages: new Set(), samples: new Set() }; agg[v.id].pages.add(`${r}@${vp.width}`); v.nodes.slice(0, 2).forEach((n) => agg[v.id].samples.add(n.slice(0, 230))); }
    await p.close();
  }
}
const summary = Object.entries(agg).map(([id, v]) => ({ id, impact: v.impact, help: v.help, pageCount: v.pages.size, pages: [...v.pages].slice(0, 8), samples: [...v.samples].slice(0, 4) }));
writeFileSync("/tmp/qa/axe.json", JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
await tc({ id: "TC-A11Y-01", type: "UI/Accessibility", module: "All pages", scenario: "Automated WCAG 2.1 AA scan (axe-core) of all 24 routes at 375px and 1366px", steps: "Inject axe-core into each page and run", data: "48 scans", expected: "0 violations" }, async () => ({ actual: summary.map((s) => `${s.id}[${s.impact}] on ${s.pageCount} page-views`).join("; ") || "0 violations", pass: !summary.length }));
await b.close();
