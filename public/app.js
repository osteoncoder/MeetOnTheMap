import { places } from "./catalog.js";
const paths = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  diagonal: '<path d="M6 18 18 6M7 6h11v11"/>',
  pin: '<path d="M20 10c0 5-8 10-8 10s-8-5-8-10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar:
    '<rect x="4" y="6" width="16" height="15" rx="2"/><path d="M8 3v6m8-6v6M4 11h16"/>',
  users:
    '<circle cx="10" cy="8" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2m1-15a3 3 0 0 1 0 6m2 4a4 4 0 0 1 2 4"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  down: '<path d="M12 4v15m-5-5 5 5 5-5"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const img = (p) => `/media/${p.id}.webp`;
const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
const nav = [
  ["Home", "/"],
  ["Destinations", "/#destinations"],
  ["Explore", "/#explore"],
  ["Packages", "/#packages"],
  ["About Us", "/#about"],
  ["Contact", "/#contact"],
];
const brand = `<a class="brand" href="/">${icon("compass")}<span>Travelling<span class="brand-accent">Breez</span><small>INDONESIA TRAVEL CO.</small></span></a>`;
const header = `<header class="header"><div class="nav-wrap">${brand}<button class="menu" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">${icon("menu")}</button><nav id="nav" aria-label="Main navigation">${nav.map(([n, h]) => `<a href="${h}" ${n === "Home" && location.pathname === "/" ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</nav><a class="nav-cta" href="/#contact">Plan a Trip ${icon("diagonal")}</a></div></header>`;
const footer = `<footer><div class="wrap foot-grid"><div>${brand}<p>Thoughtfully planned journeys across Indonesia.</p></div><div><h3>Explore</h3>${nav
  .slice(1)
  .map(([n, h]) => `<a href="${h}">${n}</a>`)
  .join(
    "",
  )}</div><div><h3>Travel inspiration</h3><a href="https://www.instagram.com/indtravel/">Wonderful Indonesia on Instagram ${icon("diagonal")}</a><a href="https://www.youtube.com/@wonderfulindonesia">Wonderful Indonesia on YouTube ${icon("diagonal")}</a></div></div><div class="wrap copyright">© ${new Date().getFullYear()} Travelling Breez</div></footer>`;
const field = (name, label, content, i) =>
  `<label class="field">${icon(i)}<span><strong>${label}</strong>${content}</span></label>`;
const search = `<form id="search" class="search" aria-label="Find your trip">${field("destination", "Destination", `<select name="destination"><option value="">Where to?</option>${places.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}</select>`, "pin")}${field("date", "Travel Dates", '<input name="date" type="date" aria-label="Travel start date">', "calendar")}${field("travellers", "Travellers", '<select name="travellers">' + Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i === 1 ? "selected" : ""}>${i + 1} ${i === 0 ? "traveller" : "travellers"}</option>`).join("") + "</select>", "users")}${field("type", "Trip Type", `<select name="type"><option value="">Any style</option>${[...new Set(places.map((p) => p.type))].map((t) => `<option>${t}</option>`).join("")}</select>`, "compass")}<button class="button" type="submit">${icon("search")} Search Trips</button></form>`;
const heading = (label, title, desc) =>
  `<span class="eyebrow">${label}</span><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ""}`;
const destCard = (p, i) =>
  `<a class="destination" style="--delay:${i * 65}ms" href="/destinations/${p.id}" aria-label="Explore ${p.name}"><img src="${img(p)}" alt="" loading="lazy" width="800" height="650"><div class="card-copy"><span>${p.region}</span><h3>${p.name}</h3><p>${p.tag}</p></div><span class="card-arrow">${icon("diagonal")}</span></a>`;
const packageCard = (p, q = "") =>
  `<article class="package"><a href="/packages/${p.id}${q}" tabindex="-1" aria-hidden="true"><img src="${img(p)}" alt="" loading="lazy" width="800" height="450"></a><div><span class="eyebrow">${p.days} DAYS · ${p.type}</span><h3>${p.tour}</h3><p>From <strong>${money(p.price)}</strong> / person</p><a class="text-link" href="/packages/${p.id}${q}">View Details ${icon("arrow")}</a></div></article>`;
const form = (kind, p, params) =>
  `<form class="submit-form ${kind === "newsletter" ? "inline-form" : ""}" data-kind="${kind}">${kind === "newsletter" ? "" : '<label>Name<input name="name" autocomplete="name" required maxlength="100"></label>'}<label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label>${p ? `<input type="hidden" name="trip" value="${p.id}"><label>Travel start date<input name="date" type="date" value="${params.date}"></label><label>Travellers<input name="travellers" type="number" min="1" max="${p.group}" value="${params.travellers}" required></label>` : ""}${kind === "newsletter" ? "" : `<label>Message<textarea name="message" rows="4" maxlength="2000" ${p ? "" : "required"}></textarea></label>`}<button class="button">${kind === "newsletter" ? "Subscribe" : p ? "Send booking inquiry" : "Send message"} ${icon("arrow")}</button><p class="feedback" role="status" aria-live="polite"></p></form>`;
function home() {
  return `<section class="hero" aria-label="Discover Indonesia"><img id="hero-image" src="${img(places[1])}" alt="" fetchpriority="high" width="1024" height="576"><div class="hero-shade"></div><div class="hero-copy"><div class="hero-kicker"><span></span> THE ART OF EXPLORING INDONESIA <span></span></div><h1>Indonesia, Beyond<br>the Ordinary.</h1><p>From misty volcanoes to untouched shores. Discover the islands<br class="desktop"> through journeys worth remembering.</p><a class="button" href="#destinations">Explore Now ${icon("diagonal")}</a></div><div class="hero-bottom"><a href="#destinations" class="scroll-link">${icon("down")} <span>SCROLL TO EXPLORE</span></a><div class="slide"><span id="hero-location">${icon("pin")} Padar Island, Komodo</span><div class="dots" aria-label="Change featured destination">${[1, 0, 2].map((v, i) => `<button type="button" data-slide="${v}" aria-label="Show ${places[v].name}" aria-pressed="${!i}"></button>`).join("")}</div></div></div></section>
<div class="wrap search-wrap">${search}</div><main id="main"><section id="destinations" class="wrap section destinations"><div class="section-top"><div>${heading("THE ISLAND COLLECTION", "Popular Destinations", "A few of our favourite places to get wonderfully lost.")}</div><a class="outline" href="/destinations">All Destinations ${icon("diagonal")}</a></div><div class="destination-grid">${places.map(destCard).join("")}</div></section>
<section id="packages" class="section tinted"><div class="wrap"><div class="section-top"> <div>${heading("TRAVEL, WELL PLANNED", "Featured Tour Packages", "Small-group journeys with time to take it all in.")}</div><a class="outline" href="/packages">All Packages ${icon("diagonal")}</a></div><div class="package-grid">${places
    .slice(0, 3)
    .map((p) => packageCard(p))
    .join("")}</div></div></section>
<section id="explore" class="wrap section editorial"><div class="editorial-image"><img loading="lazy" src="/media/bromo.webp" alt="Mount Bromo at sunrise" width="500" height="333"><span>01 / THE HIGHLANDS OF EAST JAVA</span></div><div>${heading("THE SLOW TRAVEL EDIT", "Wake up somewhere extraordinary.", "There’s a quiet moment just before sunrise at Bromo. The caldera is still in shadow, and the only thing moving is the mist. It’s worth the early start.")}<a class="button" href="/destinations/bromo">Explore Mount Bromo ${icon("diagonal")}</a></div></section>
<section id="about" class="section tinted"><div class="wrap">${heading("THE BREEZ DIFFERENCE", "Why Travel With Us?", "More time with the people and places you came to meet.")}<div class="benefits">${[
    [
      "compass",
      "Local perspective",
      "Spend your days with guides who know these islands firsthand.",
    ],
    [
      "users",
      "Small groups",
      "Our sample itineraries are designed for groups of six to ten.",
    ],
    [
      "shield",
      "Clear trip details",
      "See the itinerary, inclusions and starting price before you inquire.",
    ],
  ]
    .map(([i, h, p]) => `<article>${icon(i)}<h3>${h}</h3><p>${p}</p></article>`)
    .join("")}</div></div></section>
<section class="section wrap reviews">${heading("TRAVELLER STORIES", "Notes from the road", "A space for first-hand travel stories. Verified guest reviews will appear here once available.")}<p><a class="text-link" href="#contact">Share feedback about your trip ${icon("arrow")}</a></p></section>
<section class="newsletter"><div class="wrap"> <div>${heading("POSTCARDS FROM THE ISLANDS", "A little more Indonesia.", "Get trip ideas and new itinerary updates in your inbox.")}</div>${form("newsletter")}</div></section>
<section id="contact" class="section wrap contact"><div>${heading("LET’S PLAN TOGETHER", "Where would you like to go?", "Tell us what you have in mind, from the islands you want to see to the pace you want to travel.")}</div>${form("contact")}</section></main>`;
}
function params() {
  const q = new URLSearchParams(location.search);
  const d = q.get("date") || "";
  const n = Number(q.get("travellers") || 2);
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "",
    travellers: Number.isInteger(n) && n >= 1 && n <= 12 ? n : 2,
    destination: q.get("destination") || "",
    type: q.get("type") || "",
  };
}
function listing(kind) {
  const p = params(),
    is = kind === "packages";
  const found = is
    ? places.filter(
        (x) =>
          (!p.destination || x.id === p.destination) &&
          (!p.type || x.type === p.type) &&
          x.group >= p.travellers,
      )
    : places;
  const q = new URLSearchParams({ date: p.date, travellers: p.travellers });
  return `<main id="main" class="wrap section listing">${heading(is ? "FIND YOUR TRIP" : "THE ISLAND COLLECTION", is ? "Explore Our Packages" : "Explore Indonesia", is ? "Filter by destination, group size and travel style. Dates are carried into your inquiry; availability is confirmed separately." : "Explore the places that make Indonesia extraordinary.")}${is ? search : ""}<p role="status">${found.length} ${is ? "trips" : "destinations"}${is && p.date ? ` · Requested start: ${p.date}` : ""}</p>${found.length ? `<div class="${is ? "package-grid" : "destination-grid"}">${found.map((x, i) => (is ? packageCard(x, "?" + q) : destCard(x, i))).join("")}</div>` : '<div class="empty"><h2>No matching trips</h2><p>Try a different destination, travel style or smaller group.</p><a class="outline" href="/packages">Clear filters</a></div>'}</main>`;
}
function detail(p, is) {
  const pr = params();
  pr.travellers = Math.min(p.group, pr.travellers);
  return `<main id="main"><section class="detail-hero" style="--photo:url('${img(p)}')"><div class="wrap"><a href="/${is ? "packages" : "destinations"}">← ${is ? "All packages" : "All destinations"}</a><span class="eyebrow">${p.region}</span><h1>${is ? p.tour : p.name}</h1><p>${p.tag}</p></div></section><section class="section wrap detail-grid"><div>${heading(is ? "YOUR JOURNEY" : "THE DESTINATION", is ? "Trip overview" : `Discover ${p.name}`, p.description)}${is ? `<h3>Day-by-day itinerary</h3><ol class="itinerary">${p.stops.map((s) => `<li>${s}</li>`).join("")}</ol><h3>What’s included</h3><p>Accommodation, guided activities and transfers listed in the itinerary. Flights, insurance and personal expenses are not included.</p>` : `<a class="button" href="/packages/${p.id}">View ${p.tour} ${icon("arrow")}</a>`}</div>${is ? `<aside class="booking"><span class="eyebrow">${p.days} DAYS · UP TO ${p.group} TRAVELLERS</span><h2>From ${money(p.price)}</h2><p>Per person. Request dates and a confirmed quote below.</p>${form("booking", p, pr)}</aside>` : `<aside class="booking"><span class="eyebrow">SIGNATURE TRIP</span><h3>${p.tour}</h3><p>${p.days} days · ${p.type}</p><p>From ${money(p.price)} per person</p></aside>`}</section></main>`;
}
const [kind, id, ...extra] = location.pathname.split("/").filter(Boolean);
const place = places.find((p) => p.id === id);
const isHome = !kind;
document.body.classList.toggle("home", isHome);
if (place)
  document.title = `${kind === "packages" ? place.tour : place.name} — Travelling Breez`;
document.querySelector("#app").innerHTML =
  header +
  (isHome
    ? home()
    : !extra.length && ["destinations", "packages"].includes(kind)
      ? id
        ? place
          ? detail(place, kind === "packages")
          : '<main id="main" class="wrap section"><h1>Trip not found</h1><a href="/destinations">Browse destinations</a></main>'
        : listing(kind)
      : '<main id="main" class="wrap section"><h1>Page not found</h1><a href="/">Return home</a></main>') +
  footer;
const menu = document.querySelector(".menu");
const close = () => menu.setAttribute("aria-expanded", "false");
menu.onclick = () =>
  menu.setAttribute(
    "aria-expanded",
    String(menu.getAttribute("aria-expanded") !== "true"),
  );
document
  .querySelectorAll("#nav a")
  .forEach((a) => a.addEventListener("click", close));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    close();
    menu.focus();
  }
});
const today = new Date();
const dateMin = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
document.querySelectorAll("input[type=date]").forEach((x) => (x.min = dateMin));
const searchForm = document.querySelector("#search");
if (searchForm) {
  const p = params();
  if (kind === "packages")
    for (const key of ["date", "travellers", "destination", "type"]) {
      if (key === "date" && p.date && p.date < dateMin) continue;
      const field = searchForm.elements[key];
      if (
        field.tagName !== "SELECT" ||
        [...field.options].some((o) => o.value === String(p[key]))
      )
        field.value = p[key];
    }
  searchForm.onsubmit = (e) => {
    e.preventDefault();
    location.href =
      "/packages?" + new URLSearchParams(new FormData(searchForm));
  };
}
for (const btn of document.querySelectorAll("[data-slide]"))
  btn.onclick = () => {
    const p = places[btn.dataset.slide];
    const hero = document.querySelector("#hero-image");
    if (btn.getAttribute("aria-pressed") === "true") return;
    hero.src = img(p);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      hero.animate(
        [
          { opacity: 0.35, transform: "scale(1.035)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 620 },
      );
    document.querySelector("#hero-location").innerHTML =
      icon("pin") +
      " " +
      (p.id === "komodo" ? "Padar Island, Komodo" : p.name + ", Indonesia");
    document
      .querySelectorAll("[data-slide]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  };
for (const f of document.querySelectorAll(".submit-form"))
  f.onsubmit = async (e) => {
    e.preventDefault();
    const button = f.querySelector("button"),
      feedback = f.querySelector(".feedback"),
      kind = f.dataset.kind;
    button.disabled = true;
    feedback.textContent = "Sending…";
    feedback.classList.remove("error");
    try {
      const r = await fetch("/api/" + kind, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(f))),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      feedback.textContent = result.message;
      f.reset();
    } catch (e) {
      feedback.textContent =
        e instanceof TypeError
          ? "Could not connect. Please try again."
          : e.message || "Something went wrong. Please try again.";
      feedback.classList.add("error");
    } finally {
      button.disabled = false;
    }
  };
if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("arrived");
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(".destination,.package,.editorial,.benefits article")
    .forEach((x) => observer.observe(x));
}
