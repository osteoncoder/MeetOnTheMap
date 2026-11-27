# Meet on the Map

**Meet on the Map** is a travel website by [Ankle Gaming](https://anklegaming.com), with a 15-section editorial homepage, destination guides, tour packages with booking enquiries, a travel blog and support pages. Copy and structure follow the *Travel Website — Detailed Section-Wise Content* brief (hero, about, destinations, why choose us, packages, how it works, experiences, gallery, testimonials, special wishes, blog, newsletter, FAQ, contact and footer).

## Run locally

Needs Node.js 22 or later. There's nothing to install and no build step.

```sh
npm start  # http://localhost:3000
npm test   # HTTP routes, API validation and persistence
```

| Route | Page |
| --- | --- |
| `/` | Homepage with all 15 sections from the brief |
| `/destinations`, `/destinations/<id>` | Destination listing and guides (Bali, Switzerland, Paris, Maldives, India) |
| `/packages`, `/packages/<id>` | Tour packages: itinerary, inclusions and exclusions, availability, cancellation and pricing, plus a booking enquiry form |
| `/blog`, `/blog/<slug>` | Travel blog with the six suggested topics |
| `/booking-information`, `/cancellation-policy`, `/privacy-policy`, `/terms` | Support pages linked from the footer |

- `public/app.js` renders every page and handles navigation, search, the gallery filter and the forms.
- `public/style.css` holds the brand palette (`#102A2A`, `#D5A96B`, `#F5F1E8`, `#FFFFFF`), Playfair Display and Poppins type, the responsive mobile-first layout, and animation that respects reduced-motion settings.
- `public/catalog.js` contains the destinations, best times to visit, prices and itineraries.
- `public/content.js` contains the blog articles and the support and policy page copy.
- `server.mjs` serves the site and validates and stores booking, contact and newsletter submissions.

The brief suggests React, Vite and Tailwind. The site keeps this repository's existing dependency-free stack (plain ES modules with a small Node server) and implements the same structure and design notes.

## Before publishing

The brief asks for these sample details to be replaced before going live:

- **Prices, durations and itineraries** in `public/catalog.js` are sample figures. Check them against real operator rates.
- **Policies.** The booking, cancellation, privacy and terms pages in `public/content.js` are general starter text, not legal advice. Have them reviewed for your business and jurisdiction.
- **Business address.** No address is listed yet. Add one to the contact section if you want to show it.
- **Testimonials.** The brief's sample quotes are deliberately left out. The section shows an honest empty state that invites reviews until real, consented guest reviews are available.

## Company details

The company name, email (`info@anklegaming.com`), phone (`+91 95997 34137`), website (`https://anklegaming.com`) and Instagram handle (`@anklegaming_`) are all in one `company` object near the top of `public/app.js`. Update them there and the header, contact section and footer change with them. The privacy and terms pages in `public/content.js` repeat the email and phone, so update those too if they change.

## Forms and deployment

Submissions are written to separate newline-delimited JSON files under `data/`. In deployment, set `DATA_DIR` to a private persistent volume, and set `PORT` if needed. The contact form collects the brief's fields: name, email, phone, destination of interest, travel date, number of travellers and message. Name, email and message are required. The other fields are optional but validated when filled in.

Forms do not send email, add anyone to a mailing provider, hold inventory or confirm a booking. Before public launch, add operator notifications, abuse controls and a data-retention policy. Travel dates are enquiry preferences, not a live availability check.

## Photography

Local WebP assets use real destination photography. Before public launch, confirm you have permission for commercial use or replace each image with one you own or have licensed:

- Switzerland (Bachalpsee): [Swiss Around](https://www.swissaround.ch/)
- Paris (Seine at golden hour): [In Love With France](https://inlovewithfrance.com/)
- Maldives (aerial): [Pexels photo 28843928](https://www.pexels.com/photo/28843928/)
- India (Taj Mahal): [Pexels photo 3881104](https://www.pexels.com/photo/3881104/)
- Street food: [Pexels photo 618491](https://www.pexels.com/photo/618491/)
- Komodo / Padar Island: [Windows Spotlight archive](https://windows10spotlight.com/images/10130)
- Bali: [Bali Full Day Tour](https://www.balifulldaytour.com/ulun-danu-temple.php)
- Raja Ampat: [Luxury Raja Ampat](https://luxuryrajaampat.com/raja-ampat-piaynemo-viewpoint-luxury-tour/)
- Mount Bromo: [Pexels sunrise photo](https://images.pexels.com/photos/38964304/pexels-photo-38964304.jpeg)

Playfair Display and Poppins are self-hosted under the SIL Open Font License. The license files are in `public/media/`.
