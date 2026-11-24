# Travelling Breez

An Indonesia travel site with an editorial homepage, destination guides, tour itineraries, and booking inquiries. Inspired by [Indotravi on Dribbble](https://dribbble.com/shots/27082369-Indotravi-Travel-Website-Animation), with original branding and layouts.

## Run locally

Requires Node.js 22+. No installation or build step is needed.

```sh
npm start  # http://localhost:3000
npm test   # HTTP routes, API validation and persistence
```

- `public/app.js` renders the homepage, listings and detail pages, and handles search, navigation and forms.
- `public/style.css` provides responsive layout, typography and reduced-motion-aware animation.
- `public/catalog.js` contains the starter destinations, prices and itineraries.
- `server.mjs` serves the site and validates and stores booking, contact and newsletter submissions.

## Forms and deployment

The original repository contained only this README. There was no email provider, database, authentication or booking system to integrate. Submissions are written to separate newline-delimited JSON files under `data/` by default. Set `DATA_DIR` to a private persistent volume in deployment and `PORT` if needed. Form submissions do not send email, subscribe anyone to a mailing provider, reserve inventory or confirm a booking. Add operator notifications, abuse controls and an appropriate privacy and retention policy before public launch. Travel dates are inquiry preferences, not a live availability filter.

The catalog is sample content; verify operator details and prices before accepting bookings. The reviews section intentionally shows an empty state rather than inventing testimonials.

## Preview photography

Local WebP assets use real destination photography. Confirm permission for commercial publication or replace with owned/licensed equivalents before public launch:

- Padar Island: [Windows Spotlight archive](https://windows10spotlight.com/images/10130)
- Bali: [Bali Full Day Tour](https://www.balifulldaytour.com/ulun-danu-temple.php)
- Raja Ampat: [Luxury Raja Ampat](https://luxuryrajaampat.com/raja-ampat-piaynemo-viewpoint-luxury-tour/)
- Mount Bromo: [Pexels sunrise photo](https://images.pexels.com/photos/38964304/pexels-photo-38964304.jpeg)

Manrope and Playfair Display are self-hosted under their included font licenses.
