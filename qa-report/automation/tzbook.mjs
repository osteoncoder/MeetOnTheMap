import { launch, open, tc, sleep, clickEl, waitFor, shot } from "./lib.mjs";
const b = await launch();
await tc({ id: "TC-BOOK-06", type: "Functional/Negative", module: "Booking enquiry", scenario: "Timezone: user west of UTC books for today's local date", steps: "Browser timezone Pacific/Honolulu; open /packages/bali; choose today's local date; submit", data: "local 'today'", expected: "Accepted" }, async () => {
  const tz = "Pacific/Honolulu"; const local = new Date().toLocaleDateString("en-CA", { timeZone: tz }); const utc = new Date().toISOString().slice(0, 10);
  if (local === utc) return { actual: "Honolulu date already equals UTC date — cannot reproduce now", status: "BLOCKED" };
  const p = await open(b, "/packages/bali", { tz });
  const B = "form[data-kind=booking]";
  for (const [k, v] of Object.entries({ name: "TZ", email: "tz@example.com", date: local, travellers: "2" })) await p.$eval(`${B} [name=${k}]`, (e, v) => (e.value = v), v);
  const min = await p.$eval(`${B} [name=date]`, (i) => i.min);
  await clickEl(p, `${B} button`); await waitFor(p, () => { const t = document.querySelector("form[data-kind=booking] .feedback").textContent; return t && t !== "Sending…"; });
  const f = await p.$eval(`${B} .feedback`, (e) => e.textContent);
  await shot(p, "BUG-timezone-booking-rejected");
  await p.close();
  return { actual: `UTC date=${utc}; local=${local}; picker min=${min}; server: "${f}"`, pass: !/valid travel date/.test(f) };
});
await b.close();
