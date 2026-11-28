import { launch, tc, BASE, sleep, shot, EVID } from "./lib.mjs";
import { statSync, readdirSync, writeFileSync } from "node:fs";
const b = await launch();
const profiles = {
  "Desktop (no throttling)": { vp: { width: 1366, height: 768 }, net: null, cpu: 1 },
  "Mobile Slow 4G + 4x CPU": { vp: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, net: { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }, cpu: 4 },
};
async function measure(path, prof, runs = 3) {
  const out = [];
  for (let i = 0; i < runs; i++) {
    const ctx = await b.createBrowserContext(); // cold cache each run
    const p = await ctx.newPage();
    await p.setViewport(prof.vp);
    const cdp = await p.createCDPSession();
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    if (prof.net) await cdp.send("Network.emulateNetworkConditions", prof.net);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: prof.cpu });
    await p.evaluateOnNewDocument(() => {
      window.__lcp = 0; window.__long = 0; window.__cls = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__long += 1))).observe({ type: "longtask", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: "layout-shift", buffered: true });
    });
    let bytes = 0, reqs = 0;
    cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; reqs++; });
    await p.goto(BASE + path, { waitUntil: "load", timeout: 90000 });
    await sleep(1500);
    const m = await p.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; const fcp = performance.getEntriesByName("first-contentful-paint")[0]; return { ttfb: n.responseStart, fcp: fcp?.startTime, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, lcp: window.__lcp, long: window.__long, cls: window.__cls }; });
    out.push({ ...m, bytes, reqs });
    await ctx.close();
  }
  const med = (k) => { const v = out.map((o) => o[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  return Object.fromEntries(Object.keys(out[0]).map((k) => [k, med(k)]));
}
const perf = {};
for (const [pname, prof] of Object.entries(profiles))
  for (const path of ["/", "/packages", "/packages/maldives", "/blog/responsible-travel"]) {
    const m = await measure(path, prof);
    perf[`${pname} ${path}`] = m;
    const f = (x) => `${Math.round(x)} ms`;
    const lcpLimit = 2500;
    await tc({ id: `TC-PERF-${pname.startsWith("D") ? "D" : "M"}${path.replace(/\//g, "-") || "-home"}`, type: "Performance", module: "Page load", scenario: `Cold load of ${path} — ${pname}`, steps: "Fresh browser context (empty cache), load page, read Performance API (median of 3 runs)", data: pname, expected: "LCP ≤ 2.5 s (Google 'good'), CLS ≤ 0.1, no long tasks freezing the page" }, async () => ({
      actual: `TTFB ${f(m.ttfb)}, FCP ${f(m.fcp)}, LCP ${f(m.lcp)}, DOMContentLoaded ${f(m.dcl)}, load ${f(m.load)}, CLS ${m.cls.toFixed(3)}, long tasks ${m.long}, ${m.reqs} requests, ${(m.bytes / 1024).toFixed(0)} KB transferred`,
      pass: m.lcp <= lcpLimit && m.cls <= 0.1,
      remarks: "Server runs in the same sandbox, so TTFB is near zero; real hosting adds network latency",
    }));
  }
writeFileSync("/tmp/qa/perf.json", JSON.stringify(perf, null, 1));

// Image weight & oversizing
await tc({ id: "TC-PERF-IMG", type: "Performance", module: "Images", scenario: "Image file sizes and over-sized images", steps: "List /public/media; on home at 390px@3x and 1366px compare natural width with displayed width × DPR", data: "-", expected: "No image > 200 KB; natural width ≤ 2× needed pixels" }, async () => {
  const sizes = readdirSync("/home/user/MeetOnTheMap/public/media").filter((f) => f.endsWith(".webp")).map((f) => [f, statSync("/home/user/MeetOnTheMap/public/media/" + f).size]);
  const big = sizes.filter(([, s]) => s > 200 * 1024).map(([f, s]) => `${f} ${(s / 1024).toFixed(0)}KB`);
  const over = [];
  for (const vp of [{ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true }, { width: 1366, height: 768 }]) {
    const p = await b.newPage(); await p.setViewport(vp);
    await p.goto(BASE + "/", { waitUntil: "networkidle0" });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
    await sleep(800);
    const r = await p.evaluate(() => [...document.images].filter((i) => i.naturalWidth && i.offsetParent).map((i) => ({ src: i.getAttribute("src"), nat: i.naturalWidth, need: Math.round(i.getBoundingClientRect().width * devicePixelRatio) })).filter((x) => x.nat > x.need * 2));
    r.forEach((x) => over.push(`${vp.width}px: ${x.src} natural ${x.nat}px vs needed ${x.need}px`));
    await p.close();
  }
  return { actual: `all sizes: ${sizes.map(([f, s]) => `${f} ${(s / 1024).toFixed(0)}KB`).join(", ")}; >200KB: ${big.join(", ") || "none"}; oversized: ${[...new Set(over)].slice(0, 8).join("; ") || "none"}`, pass: !big.length && !over.length, remarks: "No responsive srcset — every device downloads the same full-size image" };
});
// Navigation speed (warm cache)
await tc({ id: "TC-PERF-NAV", type: "Performance", module: "Navigation", scenario: "Page-to-page navigation speed (warm cache)", steps: "Load /, then click 'Tour Packages', then a package, measuring click→load", data: "Desktop", expected: "Each navigation < 1 s" }, async () => {
  const p = await b.newPage(); await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  const t = [];
  for (const sel of ['#nav a[href="/packages"]', ".package .text-link", '#nav a[href="/blog"]']) {
    const s = Date.now();
    await Promise.all([p.waitForNavigation({ waitUntil: "load" }), p.$eval(sel, (a) => a.click())]);
    t.push(`${sel.split('"')[1] || sel} ${Date.now() - s} ms`);
  }
  await p.close();
  return { actual: t.join("; "), pass: t.every((x) => +x.match(/(\d+) ms/)[1] < 1000) };
});
// Clean top-of-page screenshots for the report
for (const [n, vp] of [["375", { width: 375, height: 667, isMobile: true, deviceScaleFactor: 2 }], ["768", { width: 768, height: 1024, isMobile: true, deviceScaleFactor: 1 }], ["1920", { width: 1920, height: 1080 }]]) {
  const p = await b.newPage(); await p.setViewport(vp); await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await p.goto(BASE + "/", { waitUntil: "networkidle0" }); await sleep(500);
  await shot(p, `home-top-${n}`); await p.close();
}
await b.close();
