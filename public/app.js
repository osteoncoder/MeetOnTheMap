import { places } from "./catalog.js";
import { posts, infoPages } from "./content.js";
const paths = {
  compass:
    '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
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
  leaf: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z"/><path d="M5 19c3.5-3.5 6.5-5.5 10-7"/>',
  chat:
    '<path d="M21 12a8 8 0 0 1-8 8H4l1.7-3.4A8 8 0 1 1 21 12Z"/><path d="M8.5 10.5h7m-7 3.5h4.5"/>',
  wallet:
    '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14.5h2.5"/>',
  book: '<path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 17h9"/>',
  heart:
    '<path d="M12 20s-7-4.4-7-9.5A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.5C19 15.6 12 20 12 20Z"/>',
  star: '<path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6L12 16.7 6.6 19.6l1-6L3.3 9.4l6-.9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  mountain: '<path d="m2 19 7-12 4 7 2.5-4.5L22 19z"/>',
  utensils:
    '<path d="M7 3v7a2.5 2.5 0 0 0 5 0V3M7 10.5V21M17 3c-1.7 0-3 2.7-3 6h3zm0 6v12"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  phone:
    '<path d="M5.5 3.5h3l1.5 4-2 1.5a11.5 11.5 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>',
  quote:
    '<path d="M9.5 7H5.5A1.5 1.5 0 0 0 4 8.5V12a1.5 1.5 0 0 0 1.5 1.5H8V15a3 3 0 0 1-3 3M19.5 7h-4A1.5 1.5 0 0 0 14 8.5V12a1.5 1.5 0 0 0 1.5 1.5H18V15a3 3 0 0 1-3 3"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const img = (p) => `/media/${p.id}.webp`;
const placeLabel = (p) => (p.country ? `${p.name}, ${p.country}` : p.name);
const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
const nav = [
  ["Destinations", "/destinations"],
  ["Tour Packages", "/packages"],
  ["Experiences", "/#experiences"],
  ["Gallery", "/#gallery"],
  ["Travel Blog", "/blog"],
  ["About Us", "/#about"],
  ["Contact", "/#contact"],
];
const brand = `<a class="brand" href="/" aria-label="Meet on the Map home">${icon("pin")}<span>Meet on the <span class="brand-accent">Map</span><small>BY ANKLE GAMING</small></span></a>`;
const header = `<header class="header"><div class="nav-wrap">${brand}<button class="menu" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">${icon("menu")}</button><nav id="nav" aria-label="Main navigation">${nav
  .map(([n, h]) => {
    const path = h.split("#")[0] || "/";
    const current =
      path !== "/" &&
      (location.pathname === path || location.pathname.startsWith(path + "/"));
    return `<a href="${h}" ${current ? 'aria-current="page"' : ""}>${n}</a>`;
  })
  .join("")}</nav><a class="nav-cta" href="/#contact">Plan a Trip ${icon("diagonal")}</a></div></header>`;
const quickLinks = [
  ["Home", "/"],
  ["About Us", "/#about"],
  ["Destinations", "/destinations"],
  ["Tour Packages", "/packages"],
  ["Experiences", "/#experiences"],
  ["Gallery", "/#gallery"],
  ["Travel Blog", "/blog"],
  ["Contact", "/#contact"],
];
const supportLinks = [
  ["FAQs", "/#faq"],
  ["Booking Information", "/booking-information"],
  ["Cancellation Policy", "/cancellation-policy"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms"],
];
const company = {
  name: "Ankle Gaming",
  site: "https://anklegaming.com",
  email: "info@anklegaming.com",
  phone: "+91 95997 34137",
  tel: "+919599734137",
  instagram: "anklegaming_",
};
const socialLinks = [
  [`Instagram @${company.instagram}`, `https://www.instagram.com/${company.instagram}/`],
  ["anklegaming.com", company.site],
];
const footer = `<footer><div class="wrap foot-grid"><div class="foot-brand">${brand}<p>We believe every journey has the power to inspire. Discover new places, experience different cultures and create memories that stay with you.</p></div><div><h3>Quick links</h3>${quickLinks
  .map(([n, h]) => `<a href="${h}">${n}</a>`)
  .join("")}</div><div><h3>Support</h3>${supportLinks
    .map(([n, h]) => `<a href="${h}">${n}</a>`)
    .join("")}</div><div><h3>Get in touch</h3><a href="mailto:${company.email}">${icon("mail")}${company.email}</a><a href="tel:${company.tel}">${icon("phone")}${company.phone}</a><h3 class="foot-follow">Follow us</h3>${socialLinks
      .map(
        ([n, h]) =>
          `<a href="${h}" rel="noopener noreferrer" target="_blank">${n} ${icon("diagonal")}</a>`,
      )
      .join("")}</div></div><div class="wrap foot-bottom"><p class="foot-closing">The world is waiting. Where will your story take you?</p><p class="copyright">© 2026 Meet on the Map. All Rights Reserved. An <a href="${company.site}" rel="noopener noreferrer" target="_blank">${company.name}</a> company.</p></div></footer>`;
const field = (name, label, content, i) =>
  `<label class="field">${icon(i)}<span><strong>${label}</strong>${content}</span></label>`;
const search = `<form id="search" class="search" aria-label="Find your trip">${field("destination", "Destination", `<select name="destination"><option value="">Where to?</option>${places.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}</select>`, "pin")}${field("date", "Travel Dates", '<input name="date" type="date" aria-label="Travel start date">', "calendar")}${field("travellers", "Travellers", '<select name="travellers">' + Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i === 1 ? "selected" : ""}>${i + 1} ${i === 0 ? "traveller" : "travellers"}</option>`).join("") + "</select>", "users")}${field("type", "Trip Type", `<select name="type"><option value="">Any style</option>${[...new Set(places.map((p) => p.type))].map((t) => `<option>${t}</option>`).join("")}</select>`, "compass")}<button class="button" type="submit">${icon("search")} Search Trips</button></form>`;
const heading = (label, title, desc) =>
  `<span class="eyebrow">${label}</span><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ""}`;
const destCard = (p, i) =>
  `<article class="place-card" style="--delay:${i * 60}ms"><a class="place-media" href="/destinations/${p.id}" tabindex="-1" aria-hidden="true"><img src="${img(p)}" alt="" loading="lazy" width="800" height="520"></a><div class="place-body"><span class="card-region">${p.region}</span><h3><a href="/destinations/${p.id}">${p.name}</a></h3><p>${p.description}</p><ul class="place-meta"><li>${icon("calendar")} ${p.days} days</li><li>${icon("sun")} ${p.bestTime}</li><li>${icon("wallet")} From ${money(p.price)}</li></ul><a class="outline sm" href="/destinations/${p.id}">View Destination</a></div></article>`;
const packageCard = (p, q = "") =>
  `<article class="package"><a href="/packages/${p.id}${q}" tabindex="-1" aria-hidden="true"><img src="${img(p)}" alt="" loading="lazy" width="800" height="450"></a><div><span class="eyebrow">${p.days} DAYS · ${p.type}</span><h3>${p.tour}</h3><p>From <strong>${money(p.price)}</strong> / person</p><a class="text-link" href="/packages/${p.id}${q}">View Details ${icon("arrow")}</a></div></article>`;
const packageCats = [
  {
    title: "Adventure Trips",
    img: "/media/komodo.webp",
    alt: "Travellers taking in the view over Padar Island",
    copy: "Step outside your comfort zone with scenic hikes, outdoor activities, nature trails and exciting experiences. Ideal for travellers who love discovery and a little adrenaline.",
  },
  {
    title: "Family Holidays",
    img: "/media/bali.webp",
    alt: "Ulun Danu Beratan temple on Lake Beratan, Bali",
    copy: "Create time for the people who matter most. Choose comfortable stays, family-friendly attractions and flexible plans that make travelling together enjoyable.",
  },
  {
    title: "Honeymoon Escapes",
    img: "/media/maldives.webp",
    alt: "Overwater villas on turquoise lagoons in the Maldives",
    copy: "Celebrate a new beginning with beautiful views, intimate experiences and time to relax together. Discover romantic destinations for a memorable getaway.",
  },
  {
    title: "Luxury Breaks",
    img: "/media/switzerland.webp",
    alt: "A turquoise alpine lake beneath the Swiss Alps",
    copy: "Enjoy carefully selected stays, special experiences and extra comfort. Make your holiday feel like a celebration from the moment you arrive.",
  },
  {
    title: "Weekend Getaways",
    img: "/media/bromo.webp",
    alt: "Mount Bromo at sunrise above the sea of sand",
    copy: "Take a refreshing break from everyday routines with short trips, nearby discoveries and easy-to-plan escapes.",
  },
];
const experiences = [
  {
    title: "Nature & Wildlife",
    img: "/media/raja.webp",
    alt: "Limestone islands and lagoons of Raja Ampat",
    copy: "Reconnect with the outdoors through forests, mountains, lakes, national parks and unforgettable wildlife experiences. Appreciate nature while respecting the habitats and communities around you.",
  },
  {
    title: "Food & Culture",
    img: "/media/street-food.webp",
    alt: "A street vendor serving local snacks in India",
    copy: "Discover a destination through its flavours, traditions, music, art and everyday life. Every local experience can help you understand a place a little better.",
  },
  {
    title: "Adventure & Outdoors",
    img: "/media/komodo.webp",
    alt: "The ridgeline viewpoint over Padar Island",
    copy: "Find new perspectives through hiking, cycling, water activities and outdoor exploration. Choose activities that match your interests and comfort level.",
  },
  {
    title: "Relaxation & Wellness",
    img: "/media/maldives.webp",
    alt: "A calm turquoise lagoon in the Maldives",
    copy: "Make space to slow down with peaceful beaches, scenic stays, wellness experiences and days without a packed schedule.",
  },
];
const galleryItems = [
  {
    src: "/media/maldives.webp",
    cat: "Beaches & Islands",
    alt: "Overwater villas curving across a turquoise lagoon in the Maldives",
  },
  {
    src: "/media/raja.webp",
    cat: "Beaches & Islands",
    alt: "Limestone islands rising from the clear water of Raja Ampat",
  },
  {
    src: "/media/switzerland.webp",
    cat: "Mountains & Nature",
    alt: "A turquoise alpine lake beneath steep Swiss mountain peaks",
  },
  {
    src: "/media/bromo.webp",
    cat: "Mountains & Nature",
    alt: "Mount Bromo at sunrise above the sea of sand",
  },
  {
    src: "/media/paris.webp",
    cat: "Cities & Architecture",
    alt: "The Eiffel Tower and a Seine bridge at a pink Paris sunset",
  },
  {
    src: "/media/india.webp",
    cat: "Cities & Architecture",
    alt: "The Taj Mahal framed by its reflecting pool in Agra",
  },
  {
    src: "/media/street-food.webp",
    cat: "Food & Culture",
    alt: "A street vendor with bowls and jars of local snacks in India",
  },
  {
    src: "/media/bali.webp",
    cat: "Food & Culture",
    alt: "Ulun Danu Beratan temple on the water in Bali",
  },
  {
    src: "/media/komodo.webp",
    cat: "Adventure Moments",
    alt: "Hikers taking in the sweeping view over Padar Island",
  },
];
const galleryCats = [
  "Beaches & Islands",
  "Mountains & Nature",
  "Cities & Architecture",
  "Food & Culture",
  "Adventure Moments",
];
const whyItems = [
  [
    "compass",
    "Personalised Recommendations",
    "Find ideas that match your travel style, interests, schedule and budget. Whether you prefer adventure, culture, relaxation or a little of everything, discover options that suit your plans.",
  ],
  [
    "book",
    "Clear Travel Information",
    "Make informed decisions with useful destination details, suggested itineraries and practical travel tips. We believe good planning starts with information that is easy to understand.",
  ],
  [
    "chat",
    "Support When You Need It",
    "Get help with your questions and planning needs. Our aim is to make it easier to move from browsing destinations to feeling ready for your trip.",
  ],
  [
    "wallet",
    "Options for Different Budgets",
    "Explore travel ideas for different budgets and styles, from simple getaways to special-occasion escapes. The best journey is the one that works for you.",
  ],
  [
    "leaf",
    "Responsible Travel",
    "Travel thoughtfully, respect local communities and help protect the natural and cultural places that make every destination special.",
  ],
];
const steps = [
  [
    "Choose Your Destination",
    "Start with a place that inspires you. Browse destinations, compare experiences and save the ideas that catch your attention.",
  ],
  [
    "Shape Your Journey",
    "Select the travel dates, number of travellers and experiences you are interested in. Review the suggested plan and ask questions before confirming.",
  ],
  [
    "Get Ready to Explore",
    "Once your arrangements are confirmed, review your itinerary and essential travel information. Then get ready to enjoy the journey and make new memories.",
  ],
];
const faqs = [
  [
    "How do I choose the right destination?",
    "Think about your budget, travel dates, interests, preferred weather and the kind of experience you want. Our destination guides can help you compare your options.",
  ],
  [
    "Can I customise a travel package?",
    "Customisation depends on the package and service offered. Contact the travel team with your preferred dates, group size and requirements to discuss available options.",
  ],
  [
    "What should I check before booking?",
    "Review the final price, inclusions, exclusions, accommodation details, transport arrangements, cancellation policy, required documents and any destination-specific rules.",
  ],
  [
    "When should I book my trip?",
    "Booking early can provide more choice, especially during holidays and peak seasons. The best timing depends on the destination, dates and availability.",
  ],
  [
    "How can I contact customer support?",
    "Use the contact details or enquiry form on this website. Add your booking reference if you already have one.",
  ],
];
const newsletterForm = `<form class="submit-form newsletter-form" data-kind="newsletter"><label class="news-label" for="news-email">Your email address</label><div class="news-row"><input id="news-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="Enter your email address"><button class="button">Subscribe to Updates ${icon("arrow")}</button></div><p class="privacy-note">By subscribing, you agree to receive email updates. Unsubscribe at any time — read our <a href="/privacy-policy">privacy policy</a>.</p><p class="feedback" role="status" aria-live="polite"></p></form>`;
const contactForm = `<form class="submit-form contact-form" data-kind="contact"><div class="form-row"><label>Full Name<input name="name" autocomplete="name" required maxlength="100"></label><label>Email Address<input name="email" type="email" autocomplete="email" required maxlength="254"></label></div><div class="form-row"><label>Phone Number<input name="phone" type="tel" autocomplete="tel" maxlength="20" placeholder="+91 00000 00000"></label><label>Destination of Interest<input name="destination" list="destination-options" maxlength="100" placeholder="Where are you dreaming of?"><datalist id="destination-options">${places
  .map((p) => `<option value="${p.name}"></option>`)
  .join("")}<option value="Not sure yet"></option></datalist></label></div><div class="form-row"><label>Travel Dates<input name="date" type="date"></label><label>Number of Travellers<input name="travellers" type="number" min="1" max="99" value="2"></label></div><label>Message<textarea name="message" rows="5" maxlength="2000" required placeholder="Tell us a little about the journey you have in mind."></textarea></label><button class="button">Send Your Enquiry ${icon("arrow")}</button><p class="feedback" role="status" aria-live="polite"></p></form>`;
const bookingForm = (p, params) =>
  `<form class="submit-form" data-kind="booking"><label>Name<input name="name" autocomplete="name" required maxlength="100"></label><label>Email<input name="email" type="email" autocomplete="email" required maxlength="254"></label><input type="hidden" name="trip" value="${p.id}"><label>Travel start date<input name="date" type="date" value="${params.date}"></label><label>Travellers<input name="travellers" type="number" min="1" max="${p.group}" value="${params.travellers}" required></label><label>Message<textarea name="message" rows="4" maxlength="2000"></textarea></label><button class="button">Send booking inquiry ${icon("arrow")}</button><p class="feedback" role="status" aria-live="polite"></p></form>`;
const photoCard = (item, i, cls = "") =>
  `<article class="photo-card ${cls}" style="--delay:${i * 60}ms"><div class="photo-media"><img src="${item.img}" alt="${item.alt}" loading="lazy" width="800" height="520"></div><div class="photo-body"><h3>${item.title}</h3><p>${item.copy}</p></div></article>`;
const postCard = (p, i) =>
  `<a class="post-card" href="/blog/${p.slug}" style="--delay:${i * 60}ms"><span class="card-region">${p.label} · ${p.read}</span><h3>${p.title}</h3><p>${p.excerpt}</p><span class="text-link">Read guide ${icon("arrow")}</span></a>`;
function home() {
  return `<section class="hero" aria-label="Discover the world"><img id="hero-image" src="${img(places[1])}" alt="" fetchpriority="high" width="1600" height="1014"><div class="hero-shade"></div><div class="hero-copy"><div class="hero-kicker"><span></span> YOUR NEXT ADVENTURE STARTS HERE <span></span></div><h1>Discover the World.<em>Create Stories That Last Forever.</em></h1><p>The world is full of extraordinary places, hidden gems and unforgettable experiences. Whether you dream of relaxing beside crystal-clear waters, exploring lively cities, walking through peaceful mountain trails or discovering a new culture, your next journey begins right here. Find inspiration, choose your destination and let every moment become a memory worth keeping.</p><div class="hero-ctas"><a class="button" href="#destinations">Explore Destinations ${icon("diagonal")}</a><a class="button ghost" href="/packages">Plan Your Journey ${icon("arrow")}</a></div><p class="trust-line">Thoughtfully planned journeys · Inspiring destinations · Memories that stay with you</p></div><div class="hero-bottom"><a href="#destinations" class="scroll-link">${icon("down")} <span>SCROLL TO EXPLORE</span></a><div class="slide"><span id="hero-location">${icon("pin")} ${placeLabel(places[1])}</span><div class="dots" aria-label="Change featured destination">${[1, 0, 2]
    .map(
      (v, i) =>
        `<button type="button" data-slide="${v}" aria-label="Show ${places[v].name}" aria-pressed="${!i}"></button>`,
    )
    .join("")}</div></div></div></section>
<div class="wrap search-wrap">${search}</div><main id="main">
<section id="about" class="section wrap about"><div class="about-head"><div>${heading("A LITTLE ABOUT US", "We Believe the Best Stories Begin With a Journey.")}</div><div class="about-copy"><p>Travel has a special way of changing how we see the world. It takes us beyond familiar streets, introduces us to new traditions and gives us moments we could never experience by staying in one place. That belief is at the heart of our travel brand.</p><p>We bring destination inspiration, helpful travel information and thoughtfully designed trip options together in one place. From the first spark of an idea to the final day of your holiday, our goal is to make planning feel easier and travelling feel more exciting.</p><p>Whether you are planning your first solo escape, a family holiday, a romantic break or an adventure with friends, we want to help you find a journey that feels right for you.</p></div></div><div class="mv-grid"><article class="mv-card"><span class="eyebrow">Our Mission</span><p>Our mission is to make travel planning simple, accessible and inspiring, while encouraging people to explore responsibly and appreciate the places they visit.</p></article><article class="mv-card"><span class="eyebrow">Our Vision</span><p>Our vision is a world where more people can discover new places, connect with different cultures and return home with meaningful stories.</p></article></div><a class="button" href="#contact">Get to Know Us ${icon("diagonal")}</a></section>
<section id="destinations" class="section wrap destinations"><div class="section-top"><div>${heading("PLACES TO FALL IN LOVE WITH", "Where Would You Like to Go Next?", "Every destination has its own rhythm, character and charm. Explore peaceful coastlines, dramatic landscapes, historic streets and vibrant cities. Choose the atmosphere you love and find a place that makes you want to pack your bags.")}</div><a class="outline" href="/destinations">Discover All Destinations ${icon("diagonal")}</a></div><div class="place-grid">${places.map(destCard).join("")}</div></section>
<section id="why-us" class="section tinted"><div class="wrap">${heading("TRAVEL WITH CONFIDENCE", "Every Detail Matters. Your Experience Matters Most.", "A great trip is about more than choosing a beautiful destination. It is also about clear information, thoughtful planning and support when you need it. We aim to make every step feel straightforward.")}<div class="benefits">${whyItems
    .map(
      ([i, h, p]) =>
        `<article>${icon(i)}<h3>${h}</h3><p>${p}</p></article>`,
    )
    .join("")}</div><div class="section-cta"><a class="button" href="#how-it-works">Why Travel With Us ${icon("arrow")}</a></div></div></section>
<section id="packages" class="section wrap"><div class="section-top"><div>${heading("TRIPS MADE FOR YOU", "Find a Package That Matches Your Kind of Adventure.", "Not every traveller dreams of the same holiday. Some want peaceful days by the sea, some want thrilling outdoor experiences, and others want time with family or a special escape for two. Explore package ideas designed around the way you love to travel.")}</div><a class="outline" href="/packages">Browse Tour Packages ${icon("diagonal")}</a></div><div class="cat-grid">${packageCats
    .map((c, i) => photoCard(c, i, "cat-card"))
    .join("")}</div></section>
<section id="how-it-works" class="section white"><div class="wrap">${heading("YOUR TRIP, MADE SIMPLE", "Three Simple Steps to Your Next Great Escape.")}<ol class="steps">${steps
    .map(
      ([h, p], i) =>
        `<li class="step" style="--delay:${i * 90}ms"><span class="step-num">${String(i + 1).padStart(2, "0")}</span><h3>${h}</h3><p>${p}</p></li>`,
    )
    .join("")}</ol><p class="closing-line">Less time worrying about the details. More time looking forward to the experience.</p><div class="section-cta"><a class="button" href="#contact">Start Planning ${icon("diagonal")}</a></div></div></section>
<section id="experiences" class="section wrap"><div class="section-top"><div>${heading("MAKE THE MOMENT YOURS", "Don't Just See the World. Feel It.", "The most memorable parts of a trip are often the little moments: a sunrise over the mountains, a meal shared with locals, a quiet walk through an old town or the sound of waves at the end of a long day.")}</div><a class="outline" href="/packages">Find Your Experience ${icon("diagonal")}</a></div><div class="exp-grid">${experiences
    .map((e, i) => photoCard(e, i))
    .join("")}</div></section>
<section id="gallery" class="section tinted"><div class="wrap">${heading("A WINDOW TO THE WORLD", "Little Glimpses of Big Adventures.", "Some places leave you speechless. Some moments make you smile long after you return. Explore our travel gallery for a glimpse of the landscapes, colours, people and experiences that make travelling so special.")}<div class="chips" role="group" aria-label="Filter gallery"><button class="chip" data-cat="All" aria-pressed="true">All</button>${galleryCats
      .map(
        (c) =>
          `<button class="chip" data-cat="${c}" aria-pressed="false">${c}</button>`,
      )
      .join("")}</div><div class="gallery-grid" id="gallery-grid">${galleryItems
        .map(
          (g, i) =>
            `<figure class="gallery-item" data-cat="${g.cat}" style="--delay:${i * 45}ms"><img src="${g.src}" alt="${g.alt}" loading="lazy" width="800" height="520"><figcaption>${g.cat}</figcaption></figure>`,
        )
        .join("")}</div><div class="section-cta"><button class="button" id="gallery-more" type="button">Explore the Gallery ${icon("diagonal")}</button></div></div></section>
<section id="testimonials" class="section wrap reviews"><div class="reviews-head">${heading("TRAVELERS' WORDS", "Memories Shared by People Like You.", "Every journey is personal. We love hearing what travellers enjoyed, what surprised them and which moments they will remember for years to come.")}</div><div class="review-empty"><span class="quote-mark">${icon("quote")}</span><p><strong>Have you travelled with us?</strong> Share your experience and help other travellers plan with confidence.</p><p class="review-note">Verified traveller reviews will be published here once they are shared with permission.</p><a class="text-link" href="#contact">Read More Reviews ${icon("arrow")}</a></div></section>
<section id="wishes" class="wishes"><div class="wrap"><span class="eyebrow">A WISH FOR EVERY TRAVELER</span><h2>May Your Journeys Be Endless and Your Memories Timeless.</h2><div class="wish-cols"><p>May every road lead you to a beautiful discovery. May every sunrise bring fresh excitement, every new place open your mind and every unexpected turn become part of a wonderful story.</p><p>May you find peace beside quiet waters, courage on unfamiliar paths, laughter in new company and joy in the smallest moments. May the people you meet remind you how wonderfully diverse our world can be.</p><p>Travel with an open heart and a curious mind. Respect the places you visit, cherish the memories you create and always leave room for one more adventure.</p></div><p class="wish-close">Wherever life takes you next, may it be filled with safe travels, meaningful experiences and moments worth remembering.</p><p class="tagline">Travel More. Explore More. Live More.</p></div></section>
<section id="blog" class="section white"><div class="wrap"><div class="section-top"><div>${heading("INSPIRATION & INFORMATION", "A Little Travel Knowledge Goes a Long Way.", "Good journeys begin with good information. Read destination guides, packing advice, travel inspiration and practical tips to help you prepare with confidence.")}</div><a class="outline" href="/blog">Read Travel Stories ${icon("diagonal")}</a></div><div class="post-grid">${posts
      .map(postCard)
      .join("")}</div></div></section>
<section class="newsletter"><div class="wrap"><div>${heading("A WORLD OF INSPIRATION", "Your Next Adventure Starts in Your Inbox.", "Get fresh destination ideas, useful travel tips, seasonal inspiration and occasional updates delivered straight to your inbox. Whether your next trip is just around the corner or still a dream, let a little inspiration find its way to you.")}</div>${newsletterForm}</div></section>
<section id="faq" class="section wrap faq"><div>${heading("NEED A LITTLE HELP?", "Frequently Asked Questions.")}</div><div class="faq-list">${faqs
    .map(
      ([q, a], i) =>
        `<details class="faq-item" ${i === 0 ? "open" : ""}><summary>${q}<span class="faq-mark" aria-hidden="true"></span></summary><p>${a}</p></details>`,
    )
    .join("")}</div></section>
<section id="contact" class="section wrap contact"><div class="contact-info">${heading("LET'S PLAN SOMETHING WONDERFUL", "Tell Us Where You Dream of Going.", "Have a destination in mind, need help comparing packages or simply want some travel inspiration? We would love to hear from you. Send us a message and tell us a little about the journey you have in mind.")}<ul class="contact-details"><li>${icon("mail")}<div><span>Email</span><a href="mailto:${company.email}">${company.email}</a></div></li><li>${icon("phone")}<div><span>Phone</span><a href="tel:${company.tel}">${company.phone}</a></div></li><li>${icon("globe")}<div><span>Company</span><a href="${company.site}" rel="noopener noreferrer" target="_blank">${company.name} · anklegaming.com</a></div></li><li>${icon("instagram")}<div><span>Instagram</span><a href="https://www.instagram.com/${company.instagram}/" rel="noopener noreferrer" target="_blank">@${company.instagram}</a></div></li></ul><p class="reassurance">Your enquiry details should be used only to respond to your request and handled according to the website's <a href="/privacy-policy">privacy policy</a>.</p></div>${contactForm}</section></main>`;
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
  return `<main id="main" class="wrap section listing">${heading(is ? "FIND YOUR TRIP" : "PLACES TO FALL IN LOVE WITH", is ? "Explore Our Packages" : "Explore the World", is ? "Filter by destination, group size and travel style. Dates are carried into your inquiry; availability is confirmed separately." : "Explore the places that make our world extraordinary — from island paradises to Alpine peaks.")}${is ? search : ""}<p role="status">${found.length} ${is ? "trips" : "destinations"}${is && p.date ? ` · Requested start: ${p.date}` : ""}</p>${found.length ? `<div class="${is ? "package-grid" : "place-grid"}">${found.map((x, i) => (is ? packageCard(x, "?" + q) : destCard(x, i))).join("")}</div>` : '<div class="empty"><h2>No matching trips</h2><p>Try a different destination, travel style or smaller group.</p><a class="outline" href="/packages">Clear filters</a></div>'}</main>`;
}
function detail(p, is) {
  const pr = params();
  pr.travellers = Math.min(p.group, pr.travellers);
  const meta = `<ul class="place-meta"><li>${icon("calendar")} ${p.days} days</li><li>${icon("sun")} Best time: ${p.bestTime}</li><li>${icon("wallet")} From ${money(p.price)} / person</li></ul>`;
  const know = `<h3>Good to know</h3><ul class="know-list"><li><strong>Final pricing:</strong> From ${money(p.price)} per person. Your written quote confirms the final price.</li><li><strong>Availability:</strong> Dates are confirmed on inquiry — nothing is reserved until you confirm.</li><li><strong>Inclusions:</strong> Accommodation, guided activities and transfers listed in the itinerary.</li><li><strong>Exclusions:</strong> Flights, insurance and personal expenses are not included.</li><li><strong>Cancellation terms:</strong> Shared with your quote — review them before confirming.</li></ul>`;
  return `<main id="main"><section class="detail-hero" style="--photo:url('${img(p)}')"><div class="wrap"><a href="/${is ? "packages" : "destinations"}">← ${is ? "All packages" : "All destinations"}</a><span class="eyebrow">${p.region}</span><h1>${is ? p.tour : p.name}</h1><p>${p.tag}</p></div></section><section class="section wrap detail-grid"><div>${heading(is ? "YOUR JOURNEY" : "THE DESTINATION", is ? "Trip overview" : `Discover ${p.name}`, p.description)}${is ? `<h3>Day-by-day itinerary</h3><ol class="itinerary">${p.stops.map((s) => `<li>${s}</li>`).join("")}</ol>${know}` : `${meta}<a class="button" href="/packages/${p.id}">View ${p.tour} ${icon("arrow")}</a>`}</div>${is ? `<aside class="booking"><span class="eyebrow">${p.days} DAYS · UP TO ${p.group} TRAVELLERS</span><h2>From ${money(p.price)}</h2><p>Per person. Request dates and a confirmed quote below.</p>${bookingForm(p, pr)}</aside>` : `<aside class="booking"><span class="eyebrow">SIGNATURE TRIP</span><h3>${p.tour}</h3><p>${p.days} days · ${p.type}</p><p>From ${money(p.price)} per person</p><p class="booking-note">Customisation depends on the package — <a href="#contact">contact us</a> with your dates and requirements.</p></aside>`}</section></main>`;
}
function blogHome() {
  return `<main id="main" class="wrap section listing">${heading("INSPIRATION & INFORMATION", "The Travel Blog", "Good journeys begin with good information. Read destination guides, packing advice, travel inspiration and practical tips to help you prepare with confidence.")}<div class="post-grid">${posts
    .map(postCard)
    .join("")}</div></main>`;
}
function blogPost(post) {
  return `<main id="main" class="wrap section article"><a class="back-link" href="/blog">← All guides</a><span class="eyebrow">${post.label} · ${post.read}</span><h1>${post.title}</h1><p class="article-intro">${post.intro}</p><div class="article-body">${post.body
    .map(
      (s) =>
        `<section>${s.h ? `<h2>${s.h}</h2>` : ""}${s.p ? `<p>${s.p}</p>` : ""}${s.ul ? `<ul>${s.ul.map((li) => `<li>${li}</li>`).join("")}</ul>` : ""}</section>`,
    )
    .join("")}</div><div class="article-cta"><a class="button" href="/packages">Plan Your Journey ${icon("diagonal")}</a></div></main>`;
}
function infoPage(page) {
  return `<main id="main" class="wrap section article"><a class="back-link" href="/">← Back to home</a><span class="eyebrow">${page.eyebrow}</span><h1>${page.title}</h1><p class="article-intro">${page.intro}</p><div class="article-body">${page.sections
    .map(
      (s) =>
        `<section>${s.h ? `<h2>${s.h}</h2>` : ""}${s.p ? `<p>${s.p}</p>` : ""}${s.ul ? `<ul>${s.ul.map((li) => `<li>${li}</li>`).join("")}</ul>` : ""}</section>`,
    )
    .join("")}</div><div class="article-cta"><a class="button" href="/#contact">Contact Us ${icon("diagonal")}</a></div></main>`;
}
const notFound = () =>
  `<main id="main" class="wrap section listing"><h1>Page not found</h1><p>The page you are looking for does not exist.</p><p><a class="outline" href="/">Return home</a></p></main>`;
const [kind, id, ...extra] = location.pathname.split("/").filter(Boolean);
const place = places.find((p) => p.id === id);
const post = posts.find((p) => p.slug === id);
const isHome = !kind;
document.body.classList.toggle("home", isHome);
if (place)
  document.title = `${kind === "packages" ? place.tour : place.name} — Meet on the Map`;
else if (kind === "blog" && post) document.title = `${post.title} — Meet on the Map Blog`;
else if (infoPages[kind]) document.title = `${infoPages[kind].title} — Meet on the Map`;
document.querySelector("#app").innerHTML =
  header +
  (isHome
    ? home()
    : kind === "blog"
      ? !extra.length
        ? id
          ? post
            ? blogPost(post)
            : notFound()
          : blogHome()
        : notFound()
      : infoPages[kind] && !id && !extra.length
        ? infoPage(infoPages[kind])
        : !extra.length && ["destinations", "packages"].includes(kind)
          ? id
            ? place
              ? detail(place, kind === "packages")
              : notFound()
            : listing(kind)
          : notFound()) +
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
      icon("pin") + " " + placeLabel(p);
    document
      .querySelectorAll("[data-slide]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  };
const galleryGrid = document.querySelector("#gallery-grid");
if (galleryGrid) {
  const items = [...galleryGrid.querySelectorAll(".gallery-item")];
  const more = document.querySelector("#gallery-more");
  let expanded = false;
  let activeCat = "All";
  const apply = () => {
    let shown = 0;
    for (const el of items) {
      const match = activeCat === "All" || el.dataset.cat === activeCat;
      const limitOk = expanded || activeCat !== "All" || shown < 6;
      el.hidden = !(match && limitOk);
      if (!el.hidden) shown++;
    }
    if (more) more.hidden = expanded || activeCat !== "All";
  };
  more.onclick = () => {
    expanded = true;
    apply();
    galleryGrid.querySelector(".gallery-item")?.focus?.();
  };
  for (const chip of document.querySelectorAll(".chip"))
    chip.onclick = () => {
      activeCat = chip.dataset.cat;
      document
        .querySelectorAll(".chip")
        .forEach((c) =>
          c.setAttribute("aria-pressed", String(c === chip)),
        );
      apply();
    };
  apply();
}
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
    .querySelectorAll(
      ".place-card,.photo-card,.benefits article,.step,.post-card,.faq-item,.mv-card,.gallery-item",
    )
    .forEach((x) => observer.observe(x));
}
