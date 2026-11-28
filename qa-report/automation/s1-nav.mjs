import { launch, open, tc, BASE, shot, sleep, clickEl, clickNav, waitFor } from "./lib.mjs";
import { places } from "/home/user/MeetOnTheMap/public/catalog.js";
import { posts, infoPages } from "/home/user/MeetOnTheMap/public/content.js";
const b = await launch();

// ---------- Inventory of every element on home page ----------
{
  const p = await open(b, "/");
  const inv = await p.evaluate(() => ({
    sections: [...document.querySelectorAll("section[id]")].map((s) => s.id),
    links: document.querySelectorAll("a").length,
    buttons: document.querySelectorAll("button").length,
    forms: [...document.querySelectorAll("form")].map((f) => f.id || f.dataset.kind),
    inputs: document.querySelectorAll("input,select,textarea").length,
    imgs: document.querySelectorAll("img").length,
    navLinks: [...document.querySelectorAll("#nav a")].map((a) => a.textContent + "=" + a.getAttribute("href")),
    footerLinks: [...document.querySelectorAll("footer a")].map((a) => a.textContent.trim() + "=" + a.getAttribute("href")),
    external: [...document.querySelectorAll("a[target=_blank]")].map((a) => a.href + " rel=" + a.rel),
  }));
  console.log("INVENTORY", JSON.stringify(inv, null, 1));
  await shot(p, "home-desktop-1366");
  await p.close();
}

// ---------- Every route ----------
const routes = [
  ["/", "Discover the World."],
  ["/destinations", "Explore the World"],
  ...places.map((x) => [`/destinations/${x.id}`, x.name]),
  ["/packages", "Explore Our Packages"],
  ...places.map((x) => [`/packages/${x.id}`, x.tour]),
  ["/blog", "The Travel Blog"],
  ...posts.map((x) => [`/blog/${x.slug}`, x.title]),
  ...Object.entries(infoPages).map(([k, v]) => [`/${k}`, v.title]),
];
let n = 1;
for (const [route, h] of routes) {
  const id = "TC-NAV-" + String(n++).padStart(2, "0");
  await tc({ id, type: "Functional/Positive", module: "Routing", scenario: `Open ${route} directly by URL`, steps: `Type ${BASE}${route} in address bar and press Enter`, data: route, expected: `HTTP 200, main heading contains "${h}", no JS errors, no failed requests, all images load` }, async () => {
    const p = await open(b, route);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
    await p.waitForNetworkIdle({ idleTime: 300 }).catch(() => {});
    const st = p.lastResponse.status();
    const h1 = await p.$eval(route === "/" ? "h1" : "main h1, main h2", (e) => e.textContent).catch(() => "(no heading)");
    const hasH1 = await p.$("h1").then(Boolean);
    const broken = await p.evaluate(() => [...document.images].filter((i) => i.offsetParent !== null && (!i.complete || i.naturalWidth === 0)).map((i) => i.src));
    const title = await p.title();
    const errs = [...p.log.console, ...p.log.pageerror, ...p.log.failed, ...p.log.bad];
    await p.close();
    return { actual: `HTTP ${st}; main heading="${h1}"; has <h1>=${hasH1}; title="${title}"; brokenImages=${broken.length}; errors=${errs.length ? errs.join(" | ") : 0}`, pass: st === 200 && h1.includes(h) && !broken.length && !errs.length };
  });
}

// ---------- In-page anchor links (#id) must exist on that page ----------
for (const route of routes.map((r) => r[0])) {
  const p = await open(b, route);
  const missing = await p.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !document.getElementById(h.slice(1))));
  if (missing.length) console.log("MISSING-ANCHOR", route, missing);
  await p.close();
}
await tc({ id: "TC-NAV-40", type: "Functional/Negative", module: "Destination detail", scenario: "'contact us' link in sidebar of destination guide", steps: "Open /destinations/bali; in the right sidebar click 'contact us'", data: "/destinations/bali", expected: "User is taken to the contact form" }, async () => {
  const p = await open(b, "/destinations/bali");
  const before = await p.evaluate(() => scrollY);
  const href = await p.$eval(".booking-note a", (a) => a.getAttribute("href"));
  await p.click(".booking-note a");
  await sleep(500);
  const r = await p.evaluate(() => ({ url: location.href, y: scrollY, target: !!document.getElementById("contact"), form: !!document.querySelector('form[data-kind=contact]') }));
  await shot(p, "BUG-contact-us-link-destination");
  await p.close();
  return { actual: `href="${href}"; after click URL=${r.url}; element #contact exists on page=${r.target}; contact form on page=${r.form}; scroll moved from ${before} to ${r.y}`, pass: r.target };
});

// ---------- Header navigation by clicking ----------
const navExpect = { "Destinations": "/destinations", "Tour Packages": "/packages", "Experiences": "/#experiences", "Gallery": "/#gallery", "Travel Blog": "/blog", "About Us": "/#about", "Contact": "/#contact" };
for (const [label, href] of Object.entries(navExpect)) {
  await tc({ id: "TC-NAV-H-" + label.replace(/\s/g, ""), type: "Functional/Positive", module: "Header navigation", scenario: `Click header link "${label}" from a blog page`, steps: `Open /blog, click "${label}" in header`, data: "-", expected: `Navigates to ${href}; target section/page visible` }, async () => {
    const p = await open(b, "/blog");
    await Promise.all([p.waitForNavigation({ waitUntil: "networkidle0" }), p.evaluate((l) => [...document.querySelectorAll("#nav a")].find((a) => a.textContent === l).click(), label)]);
    await sleep(400);
    const r = await p.evaluate((h) => { const id = h.split("#")[1]; const el = id && document.getElementById(id); return { path: location.pathname + location.hash, visible: el ? el.getBoundingClientRect().top < innerHeight && el.getBoundingClientRect().bottom > 0 : !!document.querySelector("main h1, main h2") }; }, href);
    await p.close();
    return { actual: `URL=${r.path}; target visible=${r.visible}`, pass: r.path === href && r.visible };
  });
}
await tc({ id: "TC-NAV-50", type: "Functional/Positive", module: "Header", scenario: "Logo returns to home; 'Plan a Trip' CTA goes to contact", steps: "On /packages click logo; then click 'Plan a Trip'", data: "-", expected: "Logo -> '/', CTA -> '/#contact' with contact form in view" }, async () => {
  const p = await open(b, "/packages");
  await clickNav(p, "header .brand");
  const a = await p.evaluate(() => location.pathname);
  await clickEl(p, ".nav-cta");
  await waitFor(p, () => Math.abs(document.getElementById("contact").getBoundingClientRect().top) < 400);
  const c = await p.evaluate(() => ({ u: location.pathname + location.hash, top: Math.round(document.getElementById("contact").getBoundingClientRect().top) }));
  await p.close();
  return { actual: `logo -> ${a}; CTA -> ${c.u}, #contact top=${c.top}px`, pass: a === "/" && c.u === "/#contact" && c.top < 400 };
});
await tc({ id: "TC-NAV-51", type: "Functional/Positive", module: "Header", scenario: "Active page highlighting in header", steps: "Open /packages/bali and inspect header", data: "-", expected: "'Tour Packages' marked aria-current=page" }, async () => {
  const p = await open(b, "/packages/bali");
  const cur = await p.$$eval("#nav a[aria-current=page]", (as) => as.map((a) => a.textContent));
  await p.close();
  return { actual: `aria-current on: ${cur.join(",")}`, pass: cur.length === 1 && cur[0] === "Tour Packages" };
});

// ---------- Footer links ----------
await tc({ id: "TC-NAV-52", type: "Functional/Positive", module: "Footer", scenario: "All footer internal links resolve", steps: "Collect every footer link on home; request each; for /#id links verify id exists on home", data: "18 footer links", expected: "All return 200 and all anchors exist" }, async () => {
  const p = await open(b, "/");
  const links = await p.$$eval("footer a", (as) => as.map((a) => a.getAttribute("href")));
  const ids = await p.$$eval("[id]", (e) => e.map((x) => x.id));
  const bad = [];
  for (const h of links) {
    if (!h.startsWith("/")) continue;
    const [path, hash] = h.split("#");
    const s = (await fetch(BASE + path)).status;
    if (s !== 200 || (hash && !ids.includes(hash))) bad.push(h + "=" + s);
  }
  const ext = links.filter((h) => !h.startsWith("/"));
  await p.close();
  return { actual: `${links.length} links; internal broken=${bad.length ? bad.join(",") : 0}; external/mailto/tel (not followed): ${ext.join(", ")}`, pass: !bad.length, remarks: "External sites (instagram.com, anklegaming.com) not reachable from test sandbox - only href correctness checked" };
});
await tc({ id: "TC-NAV-53", type: "Security/Functional", module: "Footer", scenario: "External links open safely", steps: "Inspect all target=_blank links", data: "-", expected: "Every target=_blank link has rel=noopener noreferrer" }, async () => {
  const p = await open(b, "/");
  const unsafe = await p.$$eval("a[target=_blank]", (as) => as.filter((a) => !/noopener/.test(a.rel)).map((a) => a.href));
  const total = await p.$$eval("a[target=_blank]", (as) => as.length);
  await p.close();
  return { actual: `${total} external links, unsafe=${unsafe.length}`, pass: !unsafe.length };
});
await tc({ id: "TC-NAV-54", type: "Functional/Positive", module: "Contact info", scenario: "Email and phone links", steps: "Inspect mailto/tel links in contact section and footer", data: "-", expected: "mailto:info@anklegaming.com and tel:+919599734137" }, async () => {
  const p = await open(b, "/");
  const r = await p.$$eval('a[href^="mailto:"],a[href^="tel:"]', (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  await p.close();
  return { actual: r.join(", "), pass: r.includes("mailto:info@anklegaming.com") && r.includes("tel:+919599734137"), remarks: "Clicking would open the OS mail/phone app; that cannot be verified in headless mode" };
});

// ---------- 404s / unusual URLs ----------
for (const [i, url, exp] of [
  [60, "/unknown-page", 404], [61, "/packages/unknown", 404], [62, "/blog/unknown", 404], [63, "/destinations/bali/extra", 404], [64, "/Destinations", 404],
]) {
  await tc({ id: "TC-NAV-" + i, type: "Negative", module: "Error page", scenario: `Invalid URL ${url}`, steps: `Open ${url}`, data: url, expected: `HTTP ${exp} and friendly 'Page not found' page with header, footer and a 'Return home' link` }, async () => {
    const p = await open(b, url);
    const r = await p.evaluate(() => ({ h1: document.querySelector("h1")?.textContent, home: !!document.querySelector('main a[href="/"]'), footer: !!document.querySelector("footer"), title: document.title }));
    if (i === 60) await shot(p, "404-page");
    await p.close();
    return { actual: `HTTP ${p.lastResponse.status()}; H1="${r.h1}"; return-home link=${r.home}; footer=${r.footer}; title="${r.title}"`, pass: p.lastResponse.status() === exp && r.h1 === "Page not found" && r.home };
  });
}
await tc({ id: "TC-NAV-65", type: "Negative", module: "Routing", scenario: "Open /index.html directly", steps: "Open /index.html", data: "/index.html", expected: "Shows the homepage (or redirects to /)" }, async () => {
  const p = await open(b, "/index.html");
  const h1 = await p.$eval("h1", (e) => e.textContent);
  await shot(p, "BUG-index-html-not-found");
  await p.close();
  return { actual: `HTTP ${p.lastResponse.status()}; H1="${h1}"`, pass: !/not found/i.test(h1) };
});
await tc({ id: "TC-NAV-66", type: "Negative", module: "Routing", scenario: "Trailing slash URL", steps: "Open /destinations/ and /packages/maldives/", data: "-", expected: "Pages load normally" }, async () => {
  const r = [];
  for (const u of ["/destinations/", "/packages/maldives/"]) { const p = await open(b, u); r.push(u + "=" + p.lastResponse.status() + " " + (await p.$eval("main h1, main h2", (e) => e.textContent))); await p.close(); }
  return { actual: r.join("; "), pass: r.every((x) => x.includes("=200")) };
});
await tc({ id: "TC-NAV-67", type: "Negative", module: "Routing", scenario: "Malformed percent-encoding in URL", steps: "Open /%E0%A4%A", data: "/%E0%A4%A", expected: "Handled safely with an error page, no crash" }, async () => {
  const r = await fetch(BASE + "/%E0%A4%A");
  const body = await r.text();
  const alive = (await fetch(BASE + "/")).status;
  return { actual: `HTTP ${r.status}; body=${body}; server still up=${alive === 200}`, pass: r.status === 400 && alive === 200, remarks: "Safe, but user sees raw JSON instead of the styled error page (cosmetic)" };
});

// ---------- Refresh, back/forward ----------
await tc({ id: "TC-NAV-70", type: "Functional", module: "Browser behaviour", scenario: "Refresh deep page keeps state", steps: "Open /packages?destination=bali&travellers=3, press F5", data: "destination=bali, travellers=3", expected: "Same page reloads with filters kept (1 trip, Bali selected, 3 travellers)" }, async () => {
  const p = await open(b, "/packages?destination=bali&travellers=3");
  await p.reload({ waitUntil: "networkidle0" });
  const r = await p.evaluate(() => ({ s: document.querySelector("[role=status]").textContent, d: document.querySelector("#search [name=destination]").value, t: document.querySelector("#search [name=travellers]").value }));
  await p.close();
  return { actual: `status="${r.s}", destination=${r.d}, travellers=${r.t}`, pass: r.s.startsWith("1 trips") && r.d === "bali" && r.t === "3" };
});
await tc({ id: "TC-NAV-71", type: "Functional", module: "Browser behaviour", scenario: "Back and forward buttons", steps: "Home -> click 'Browse Tour Packages' -> click first package -> Back -> Back -> Forward", data: "-", expected: "Each step shows the correct page" }, async () => {
  const p = await open(b, "/");
  const seq = [];
  await clickNav(p, 'a.outline[href="/packages"]'); seq.push(await p.evaluate(() => location.pathname));
  await clickNav(p, ".package .text-link"); seq.push(await p.evaluate(() => location.pathname));
  await p.goBack(); seq.push(await p.evaluate(() => location.pathname + "|" + document.querySelector("main h1, main h2").textContent));
  await p.goBack(); seq.push(await p.evaluate(() => location.pathname));
  await p.goForward(); seq.push(await p.evaluate(() => location.pathname + "|" + document.querySelector("main h1, main h2").textContent));
  await p.close();
  return { actual: seq.join(" -> "), pass: seq[0] === "/packages" && seq[1].startsWith("/packages/") && seq[2].startsWith("/packages|") && seq[3] === "/" && seq[4].startsWith("/packages|") };
});
await tc({ id: "TC-NAV-72", type: "Functional", module: "SEO / page titles", scenario: "Each page has its own browser-tab title", steps: "Open /destinations, /packages, /blog, /unknown and read document.title", data: "-", expected: "Distinct descriptive titles per page" }, async () => {
  const r = [];
  for (const u of ["/", "/destinations", "/packages", "/blog", "/unknown"]) { const p = await open(b, u); r.push(`${u} => "${await p.title()}"`); await p.close(); }
  const t = r.map((x) => x.split("=>")[1]);
  return { actual: r.join("; "), pass: new Set(t).size === t.length };
});
await tc({ id: "TC-NAV-73", type: "Functional/Negative", module: "Rendering", scenario: "Website with JavaScript disabled", steps: "Disable JavaScript in DevTools, open /", data: "JS off", expected: "Content (or at least a message) is visible" }, async () => {
  const p = await open(b, "/", { js: false });
  const txt = await p.evaluate(() => document.body.innerText.trim());
  await shot(p, "no-javascript-home");
  await p.close();
  return { actual: `Visible text: "${txt}"`, pass: txt.length > 50, remarks: "Entire UI is rendered by JavaScript; no <noscript> fallback. Also affects SEO crawlers that don't run JS." };
});
await b.close();
