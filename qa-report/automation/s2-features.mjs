import { launch, open, tc, BASE, shot, sleep, clickEl, clickNav, waitFor } from "./lib.mjs";
const b = await launch();
const M = { width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

// ---- Hero slider ----
await tc({ id: "TC-HOME-01", type: "Functional/Positive", module: "Hero slider", scenario: "Change featured destination using hero dots", steps: "Open /; click each of the 3 dots under the hero", data: "Switzerland, Bali, Paris", expected: "Hero image, location label and pressed state change to the clicked destination" }, async () => {
  const p = await open(b, "/");
  const out = [];
  for (const i of [1, 2, 0]) {
    const btn = (await p.$$("[data-slide]"))[i];
    await btn.click(); await sleep(700);
    out.push(await p.evaluate((i) => {
      const b = document.querySelectorAll("[data-slide]")[i];
      return `${b.getAttribute("aria-label")}: img=${document.querySelector("#hero-image").getAttribute("src")}, label="${document.querySelector("#hero-location").textContent.trim()}", pressed=${b.getAttribute("aria-pressed")}, loaded=${document.querySelector("#hero-image").naturalWidth > 0}`;
    }, i));
  }
  await shot(p, "hero-slider-paris");
  await p.close();
  const ok = out[0].includes("bali.webp") && out[0].includes("Bali, Indonesia") && out[1].includes("paris.webp") && out[2].includes("switzerland.webp") && out.every((o) => o.includes("pressed=true") && o.includes("loaded=true"));
  return { actual: out.join(" | "), pass: ok };
});
await tc({ id: "TC-HOME-02", type: "Functional", module: "Hero slider", scenario: "Slider has no auto-play / swipe; dot tap-target size", steps: "Wait 8s on / without interaction; measure dot buttons", data: "-", expected: "Informational: record behaviour; dots >= 24x24 px (WCAG 2.2 target size)" }, async () => {
  const p = await open(b, "/", { viewport: M });
  const before = await p.$eval("#hero-image", (i) => i.getAttribute("src"));
  await sleep(8000);
  const after = await p.$eval("#hero-image", (i) => i.getAttribute("src"));
  const sizes = await p.$$eval("[data-slide]", (bs) => bs.map((b) => { const r = b.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; }));
  await p.close();
  const small = sizes.some((s) => s.split("x").some((v) => +v < 24));
  return { actual: `auto-advance=${before !== after}; dot sizes on mobile=${sizes.join(",")}`, pass: !small, remarks: "No auto-play is acceptable (manual slider)." };
});
await tc({ id: "TC-HOME-03", type: "Functional/Positive", module: "Hero", scenario: "'Explore Destinations' and 'Plan Your Journey' buttons", steps: "Click 'Explore Destinations' (should scroll), then click 'Plan Your Journey'", data: "-", expected: "#destinations scrolled into view; second button opens /packages" }, async () => {
  const p = await open(b, "/");
  await clickEl(p, ".hero-ctas .button:not(.ghost)");
  const ok1 = await waitFor(p, () => Math.abs(document.getElementById("destinations").getBoundingClientRect().top) < 200);
  await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await clickNav(p, ".hero-ctas .ghost");
  const u = await p.evaluate(() => location.pathname);
  await p.close();
  return { actual: `destinations in view=${ok1}; second button -> ${u}`, pass: ok1 && u === "/packages" };
});

// ---- Gallery ----
await tc({ id: "TC-HOME-10", type: "Functional/Positive", module: "Gallery", scenario: "Default gallery shows 6 of 9 photos, 'Explore the Gallery' reveals all", steps: "Open /#gallery; count visible photos; click 'Explore the Gallery'", data: "-", expected: "6 visible initially; after click 9 visible and button hidden" }, async () => {
  const p = await open(b, "/");
  const vis = () => p.$$eval(".gallery-item", (f) => f.filter((x) => !x.hidden).length);
  const a = await vis();
  await clickEl(p, "#gallery-more"); await sleep(300);
  const c = await vis();
  const hidden = await p.$eval("#gallery-more", (x) => x.hidden);
  const focused = await p.evaluate(() => document.activeElement.tagName + "." + document.activeElement.className);
  await p.close();
  return { actual: `initial=${a}; after click=${c}; button hidden=${hidden}; focus after click=${focused}`, pass: a === 6 && c === 9 && hidden, remarks: "Code tries to move focus to the first photo, but <figure> is not focusable so focus stays on the (now hidden) button/body — minor accessibility note." };
});
for (const [cat, n] of [["Beaches & Islands", 2], ["Mountains & Nature", 2], ["Cities & Architecture", 2], ["Food & Culture", 2], ["Adventure Moments", 1], ["All", 6]]) {
  await tc({ id: "TC-HOME-11-" + cat.split(" ")[0], type: "Functional/Positive", module: "Gallery filter", scenario: `Filter gallery by "${cat}"`, steps: `Click chip "${cat}" in gallery`, data: cat, expected: `${n} photo(s) shown, all of category ${cat}; chip aria-pressed=true` }, async () => {
    const p = await open(b, "/");
    if (cat === "All") await clickEl(p, '.chip[data-cat="Food & Culture"]');
    await clickEl(p, `.chip[data-cat="${cat}"]`); await sleep(200);
    const r = await p.evaluate((cat) => { const v = [...document.querySelectorAll(".gallery-item")].filter((x) => !x.hidden); return { n: v.length, ok: cat === "All" || v.every((x) => x.dataset.cat === cat), pressed: document.querySelector(`.chip[data-cat="${cat}"]`).getAttribute("aria-pressed"), btn: document.querySelector("#gallery-more").hidden }; }, cat);
    if (cat === "Beaches") await shot(p, "gallery-filter");
    await p.close();
    return { actual: `shown=${r.n}; correct category=${r.ok}; pressed=${r.pressed}; 'Explore' button hidden=${r.btn}`, pass: r.n === n && r.ok && r.pressed === "true" };
  });
}

// ---- FAQ ----
await tc({ id: "TC-HOME-20", type: "Functional/Positive", module: "FAQ", scenario: "Expand / collapse FAQ items", steps: "Open /#faq; click question 2; click question 1", data: "-", expected: "Q1 open by default; Q2 opens on click; Q1 closes when clicked" }, async () => {
  const p = await open(b, "/");
  const st = () => p.$$eval(".faq-item", (d) => d.map((x) => (x.open ? 1 : 0)).join(""));
  const s0 = await st();
  const sums = await p.$$(".faq-item summary");
  await clickEl(p, sums[1]); await sleep(200); const s1 = await st();
  await clickEl(p, sums[0]); await sleep(200); const s2 = await st();
  await p.close();
  return { actual: `states (1=open): initial ${s0}, after Q2 click ${s1}, after Q1 click ${s2}`, pass: s0 === "10000" && s1 === "11000" && s2 === "01000" };
});

// ---- Search & filters ----
await tc({ id: "TC-SRCH-01", type: "Functional/Positive", module: "Trip search", scenario: "Search with destination + trip type + travellers + date", steps: "On / choose Destination=Maldives, Travellers=2, Trip Type=Island Escape, date=2027-01-15; click Search Trips", data: "maldives / 2 / Island Escape / 2027-01-15", expected: "Goes to /packages with 1 matching trip (Maldives), filters kept in form, requested date shown" }, async () => {
  const p = await open(b, "/");
  await p.select("#search [name=destination]", "maldives");
  await p.select("#search [name=travellers]", "2");
  await p.select("#search [name=type]", "Island Escape");
  await p.$eval("#search [name=date]", (i) => (i.value = "2027-01-15"));
  await clickNav(p, "#search button");
  const r = await p.evaluate(() => ({ url: location.pathname + location.search, status: document.querySelector("[role=status]").textContent, cards: [...document.querySelectorAll(".package h3")].map((h) => h.textContent), d: document.querySelector("#search [name=destination]").value, t: document.querySelector("#search [name=type]").value, date: document.querySelector("#search [name=date]").value }));
  await shot(p, "search-result-maldives");
  await p.close();
  return { actual: `URL=${r.url}; "${r.status}"; cards=${r.cards}; form kept: dest=${r.d}, type=${r.t}, date=${r.date}`, pass: r.cards.length === 1 && r.cards[0].includes("Maldives") && r.d === "maldives" && r.date === "2027-01-15" };
});
await tc({ id: "TC-SRCH-02", type: "Functional/Positive", module: "Trip search", scenario: "Search with no filters", steps: "On / click Search Trips without changing anything", data: "defaults (2 travellers)", expected: "All 5 packages listed" }, async () => {
  const p = await open(b, "/");
  await clickNav(p, "#search button");
  const r = await p.$eval("[role=status]", (e) => e.textContent);
  const n = await p.$$eval(".package", (e) => e.length);
  await p.close();
  return { actual: `"${r}", cards=${n}`, pass: n === 5 };
});
await tc({ id: "TC-SRCH-03", type: "Boundary", module: "Trip filter", scenario: "Group-size filter boundary (Maldives max 6)", steps: "Open /packages?destination=maldives&travellers=6 then travellers=7", data: "6 and 7 travellers", expected: "6 -> 1 trip; 7 -> 0 trips with 'No matching trips' empty state and Clear filters link" }, async () => {
  const p = await open(b, "/packages?destination=maldives&travellers=6");
  const a = await p.$$eval(".package", (e) => e.length);
  await p.goto(BASE + "/packages?destination=maldives&travellers=7", { waitUntil: "networkidle0" });
  const r = await p.evaluate(() => ({ n: document.querySelectorAll(".package").length, empty: document.querySelector(".empty h2")?.textContent }));
  await shot(p, "empty-state-no-trips");
  await clickNav(p, ".empty a");
  const after = await p.$$eval(".package", (e) => e.length);
  await p.close();
  return { actual: `6 travellers -> ${a} trip; 7 travellers -> ${r.n} trips, empty state="${r.empty}"; after Clear filters -> ${after} trips`, pass: a === 1 && r.n === 0 && r.empty === "No matching trips" && after === 5 };
});
await tc({ id: "TC-SRCH-04", type: "Functional", module: "Trip filter", scenario: "Filter by trip type only", steps: "Open /packages?type=Heritage", data: "Heritage", expected: "Only India package" }, async () => {
  const p = await open(b, "/packages?type=Heritage");
  const c = await p.$$eval(".package h3", (e) => e.map((x) => x.textContent));
  await p.close();
  return { actual: c.join(","), pass: c.length === 1 && /India/.test(c[0]) };
});
await tc({ id: "TC-SRCH-05", type: "Negative", module: "Trip filter", scenario: "Invalid / tampered query parameters", steps: "Open /packages?destination=mars&travellers=abc&type=xyz&date=not-a-date", data: "mars / abc / xyz / not-a-date", expected: "No crash; invalid values ignored or 'No matching trips' shown" }, async () => {
  const p = await open(b, "/packages?destination=mars&travellers=abc&type=xyz&date=not-a-date");
  const r = await p.evaluate(() => ({ s: document.querySelector("[role=status]")?.textContent, empty: !!document.querySelector(".empty") }));
  const errs = p.log.pageerror.length;
  await p.close();
  return { actual: `status="${r.s}", empty state=${r.empty}, JS errors=${errs}`, pass: errs === 0 && !!r.s };
});
await tc({ id: "TC-SRCH-06", type: "Negative", module: "Trip filter", scenario: "Past date in packages URL", steps: "Open /packages?date=2020-01-01", data: "2020-01-01", expected: "Past date rejected / not shown as requested start" }, async () => {
  const p = await open(b, "/packages?date=2020-01-01");
  const r = await p.evaluate(() => ({ s: document.querySelector("[role=status]").textContent, field: document.querySelector("#search [name=date]").value, link: document.querySelector(".package a").getAttribute("href") }));
  await p.goto(BASE + r.link, { waitUntil: "networkidle0" });
  const bf = await p.$eval("form[data-kind=booking] [name=date]", (i) => ({ v: i.value, min: i.min, valid: i.checkValidity(), msg: i.validationMessage }));
  await shot(p, "past-date-carried-to-booking");
  await p.close();
  return { actual: `listing status="${r.s}"; search date field="${r.field}"; package link=${r.link}; booking form date="${bf.v}" (min ${bf.min}) valid=${bf.valid} msg="${bf.msg}"`, pass: !r.s.includes("2020-01-01"), remarks: "Browser validation still stops submission, so no bad data reaches server" };
});
await tc({ id: "TC-SRCH-07", type: "Negative", module: "Trip search", scenario: "Past date typed into homepage search", steps: "On / set Travel Dates to 2020-01-01 and click Search Trips", data: "2020-01-01", expected: "Browser blocks with message; stays on /" }, async () => {
  const p = await open(b, "/");
  await p.$eval("#search [name=date]", (i) => (i.value = "2020-01-01"));
  await clickEl(p, "#search button"); await sleep(800);
  const r = await p.evaluate(() => ({ u: location.pathname, msg: document.querySelector("#search [name=date]").validationMessage }));
  await p.close();
  return { actual: `URL=${r.u}; validation="${r.msg}"`, pass: r.u === "/" && !!r.msg };
});
await tc({ id: "TC-SRCH-08", type: "Functional/Positive", module: "Package details", scenario: "Search values carried into booking form", steps: "Open /packages?travellers=4&date=2027-03-10, click 'View Details' on Bali", data: "4 travellers, 2027-03-10", expected: "Booking form pre-filled with 4 travellers and 2027-03-10" }, async () => {
  const p = await open(b, "/packages?travellers=4&date=2027-03-10");
  await clickNav(p, '.package a.text-link[href^="/packages/bali"]');
  const r = await p.evaluate(() => { const f = document.querySelector("form[data-kind=booking]"); return { t: f.travellers.value, d: f.date.value, trip: f.trip.value, max: f.travellers.max }; });
  await p.close();
  return { actual: `travellers=${r.t}, date=${r.d}, trip=${r.trip}, max=${r.max}`, pass: r.t === "4" && r.d === "2027-03-10" && r.trip === "bali" };
});
await tc({ id: "TC-SRCH-09", type: "Boundary", module: "Package details", scenario: "Travellers in URL above package limit is clamped", steps: "Open /packages/maldives?travellers=12", data: "12 (limit 6)", expected: "Booking form shows 6" }, async () => {
  const p = await open(b, "/packages/maldives?travellers=12");
  const v = await p.$eval("form[data-kind=booking] [name=travellers]", (i) => i.value);
  await p.close();
  return { actual: `travellers field=${v}`, pass: v === "6" };
});
await tc({ id: "TC-DEST-01", type: "Functional/Positive", module: "Destinations", scenario: "Destination card -> guide -> package", steps: "On /destinations click 'View Destination' (Paris), then 'View A Parisian Escape'", data: "Paris", expected: "Destination guide shows best time, days, price; button opens /packages/paris" }, async () => {
  const p = await open(b, "/destinations");
  await clickNav(p, '.place-card a.outline[href="/destinations/paris"]');
  const meta = await p.$$eval(".place-meta li", (l) => l.map((x) => x.textContent.trim()).join(" / "));
  await clickNav(p, '.detail-grid a.button');
  const u = await p.evaluate(() => location.pathname);
  await p.close();
  return { actual: `meta: ${meta}; button -> ${u}`, pass: /days/.test(meta) && /Best time/.test(meta) && u === "/packages/paris" };
});
await tc({ id: "TC-BLOG-01", type: "Functional/Positive", module: "Blog", scenario: "Open blog post from listing and go back via '← All guides'", steps: "On /blog click the first card; then click '← All guides'", data: "-", expected: "Article opens with body text; back link returns to /blog" }, async () => {
  const p = await open(b, "/blog");
  await clickNav(p, ".post-card");
  const r = await p.evaluate(() => ({ u: location.pathname, sections: document.querySelectorAll(".article-body section").length }));
  await clickNav(p, ".back-link");
  const u2 = await p.evaluate(() => location.pathname);
  await p.close();
  return { actual: `opened ${r.u} with ${r.sections} sections; back -> ${u2}`, pass: r.sections > 0 && u2 === "/blog" };
});

// ---- Mobile menu ----
await tc({ id: "TC-MENU-01", type: "Functional/Responsive", module: "Mobile menu", scenario: "Hamburger menu open / link / close at 375px", steps: "Set viewport 375x667; tap ☰; tap 'Travel Blog'", data: "375x667", expected: "Nav hidden initially; ☰ shows nav; clicking link navigates to /blog" }, async () => {
  const p = await open(b, "/", { viewport: M });
  const vis = () => p.$eval("#nav", (n) => getComputedStyle(n).display !== "none" && n.getBoundingClientRect().height > 0);
  const v0 = await vis();
  await p.tap(".menu"); await sleep(300);
  const v1 = await vis(); const exp = await p.$eval(".menu", (m) => m.getAttribute("aria-expanded"));
  await shot(p, "mobile-menu-open-375");
  await Promise.all([p.waitForNavigation(), p.tap('#nav a[href="/blog"]')]);
  const u = await p.evaluate(() => location.pathname);
  await p.close();
  return { actual: `nav visible before=${v0}; after tap=${v1} (aria-expanded=${exp}); link -> ${u}`, pass: !v0 && v1 && exp === "true" && u === "/blog" };
});
await tc({ id: "TC-MENU-02", type: "Functional/Accessibility", module: "Mobile menu", scenario: "Close menu with Escape and with in-page link", steps: "375px: open ☰, press Esc; open ☰, tap 'Gallery'", data: "-", expected: "Esc closes and returns focus to ☰; in-page link closes menu" }, async () => {
  const p = await open(b, "/", { viewport: M });
  await p.tap(".menu"); await p.keyboard.press("Escape"); await sleep(200);
  const a = await p.evaluate(() => [document.querySelector(".menu").getAttribute("aria-expanded"), document.activeElement.className]);
  await p.tap(".menu"); await sleep(200); await p.tap('#nav a[href="/#gallery"]'); await sleep(1500);
  const c = await p.evaluate(() => [document.querySelector(".menu").getAttribute("aria-expanded"), location.hash]);
  await p.close();
  return { actual: `after Esc: expanded=${a[0]}, focus=${a[1]}; after Gallery: expanded=${c[0]}, hash=${c[1]}`, pass: a[0] === "false" && a[1] === "menu" && c[0] === "false" && c[1] === "#gallery" };
});
await tc({ id: "TC-MENU-03", type: "Usability", module: "Mobile menu", scenario: "Tap outside the open menu", steps: "375px: open ☰, tap on hero area outside menu", data: "-", expected: "Menu closes (common user expectation)" }, async () => {
  const p = await open(b, "/", { viewport: M });
  await p.tap(".menu"); await sleep(200);
  await p.touchscreen.tap(180, 600); await sleep(300);
  const e = await p.$eval(".menu", (m) => m.getAttribute("aria-expanded"));
  await p.close();
  return { actual: `aria-expanded after outside tap=${e}`, pass: e === "false", remarks: "Usability expectation, not a hard requirement" };
});
await tc({ id: "TC-KEY-01", type: "Accessibility", module: "Keyboard", scenario: "Skip link and keyboard focus", steps: "Open /, press Tab once, press Enter", data: "-", expected: "'Skip to content' appears first and moves focus to main content" }, async () => {
  const p = await open(b, "/");
  await p.keyboard.press("Tab");
  const f = await p.evaluate(() => [document.activeElement.textContent, getComputedStyle(document.activeElement).outlineStyle]);
  await p.keyboard.press("Enter"); await sleep(1500);
  const h = await p.evaluate(() => location.hash);
  await p.close();
  return { actual: `first Tab focus="${f[0]}", outline=${f[1]}; after Enter hash=${h}`, pass: f[0] === "Skip to content" && h === "#main" };
});
await b.close();
