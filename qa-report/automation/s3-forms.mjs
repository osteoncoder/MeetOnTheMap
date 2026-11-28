import { launch, open, tc, BASE, shot, sleep, clickEl, dataLines, waitFor } from "./lib.mjs";
import { rmSync, statSync } from "node:fs";
rmSync("/tmp/qa-data", { recursive: true, force: true });
const b = await launch();
const C = "form[data-kind=contact]", N = "form[data-kind=newsletter]", B = "form[data-kind=booking]";
const fb = (p, f) => p.$eval(`${f} .feedback`, (e) => ({ t: e.textContent, err: e.classList.contains("error") }));
const apiCount = (p) => { const c = { n: 0 }; p.on("request", (r) => r.url().includes("/api/") && c.n++); return c; };
async function fill(p, sel, values) {
  for (const [k, v] of Object.entries(values)) await p.$eval(`${sel} [name=${k}]`, (el, v) => { el.value = v; }, v);
}
async function submit(p, sel) { await clickEl(p, `${sel} button`); await waitFor(p, (s) => { const t = document.querySelector(s + " .feedback")?.textContent; return t && t !== "Sending…"; }, 3000).catch(() => {}); await sleep(300); }
const invalidMsg = (p, sel) => p.$$eval(`${sel} input, ${sel} textarea`, (els) => els.filter((e) => !e.checkValidity()).map((e) => `${e.name}: "${e.validationMessage}"`));

// ================= NEWSLETTER =================
await tc({ id: "TC-NEWS-01", type: "Functional/Positive", module: "Newsletter", scenario: "Subscribe with valid email", steps: "Enter email in newsletter box on /, click Subscribe", data: "qa.user@example.com", expected: "Green success 'Thanks! Your signup was saved.', field cleared, record saved" }, async () => {
  const p = await open(b, "/");
  await p.type(`${N} [name=email]`, "qa.user@example.com");
  await submit(p, N);
  const f = await fb(p, N); const v = await p.$eval(`${N} [name=email]`, (i) => i.value);
  await shot(p, "newsletter-success");
  await p.close();
  const rec = dataLines("newsletter").at(-1);
  return { actual: `message="${f.t}" error=${f.err}; field after="${v}"; saved=${JSON.stringify(rec)}`, pass: f.t === "Thanks! Your signup was saved." && !f.err && v === "" && rec?.email === "qa.user@example.com" };
});
await tc({ id: "TC-NEWS-02", type: "Negative", module: "Newsletter", scenario: "Submit empty newsletter form", steps: "Click Subscribe without typing", data: "(empty)", expected: "Browser validation message, no request sent" }, async () => {
  const p = await open(b, "/"); const c = apiCount(p);
  await submit(p, N);
  const m = await invalidMsg(p, N);
  await p.close();
  return { actual: `requests sent=${c.n}; validation: ${m.join("; ")}`, pass: c.n === 0 && m.length === 1 };
});
for (const [i, email] of [["03", "abc"], ["04", "user@"], ["05", "user@@mail.com"], ["06", "user name@mail.com"]]) {
  await tc({ id: "TC-NEWS-" + i, type: "Negative", module: "Newsletter", scenario: `Invalid email "${email}"`, steps: `Type "${email}" and click Subscribe`, data: email, expected: "Rejected with message, nothing saved" }, async () => {
    const p = await open(b, "/"); const c = apiCount(p);
    await p.type(`${N} [name=email]`, email); await submit(p, N);
    const m = await invalidMsg(p, N); const f = await fb(p, N);
    await p.close();
    return { actual: `requests=${c.n}; browser msg: ${m.join(";") || "-"}; feedback="${f.t}"`, pass: (c.n === 0 && m.length === 1) || f.err };
  });
}
await tc({ id: "TC-NEWS-07", type: "Negative", module: "Newsletter", scenario: "Duplicate subscription with same email", steps: "Subscribe dup@example.com, then subscribe dup@example.com again", data: "dup@example.com x2", expected: "Second attempt is recognised (e.g. 'already subscribed') and not stored twice" }, async () => {
  const msgs = [];
  for (let k = 0; k < 2; k++) { const p = await open(b, "/"); await p.type(`${N} [name=email]`, "dup@example.com"); await submit(p, N); msgs.push((await fb(p, N)).t); await p.close(); }
  const recs = dataLines("newsletter").filter((r) => r.email === "dup@example.com").length;
  return { actual: `messages: "${msgs.join('" / "')}"; stored records for dup@example.com = ${recs}`, pass: recs === 1 };
});
await tc({ id: "TC-NEWS-08", type: "Functional/UI", module: "Newsletter", scenario: "Loading indicator + double-click protection", steps: "Slow network (API delayed 1.5s); type email; double-click Subscribe rapidly", data: "slow@example.com", expected: "'Sending…' shown, button disabled, only one request sent" }, async () => {
  const p = await open(b, "/");
  await p.setRequestInterception(true);
  let n = 0;
  p.on("request", async (r) => { if (r.url().includes("/api/")) { n++; await sleep(1500); r.continue(); } else r.continue(); });
  await p.type(`${N} [name=email]`, "slow@example.com");
  const btn = await p.$(`${N} button`);
  await btn.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await btn.click({ count: 2, delay: 30 }); await sleep(300);
  const during = await p.evaluate((s) => ({ t: document.querySelector(s + " .feedback").textContent, dis: document.querySelector(s + " button").disabled }), N);
  await shot(p, "newsletter-sending-state");
  await sleep(2000);
  const after = await fb(p, N);
  await p.close();
  return { actual: `during: feedback="${during.t}", button disabled=${during.dis}; requests=${n}; final="${after.t}"`, pass: during.t === "Sending…" && during.dis && n === 1 };
});
await tc({ id: "TC-NEWS-09", type: "Negative", module: "Newsletter", scenario: "Network failure during submit", steps: "Block /api/ requests (offline), submit valid email", data: "offline@example.com", expected: "Friendly error shown, button re-enabled" }, async () => {
  const p = await open(b, "/");
  await p.setRequestInterception(true);
  p.on("request", (r) => (r.url().includes("/api/") ? r.abort("internetdisconnected") : r.continue()));
  await p.type(`${N} [name=email]`, "offline@example.com"); await submit(p, N);
  const f = await fb(p, N); const dis = await p.$eval(`${N} button`, (x) => x.disabled);
  await shot(p, "newsletter-offline-error");
  await p.close();
  return { actual: `feedback="${f.t}" (error style=${f.err}); button disabled=${dis}`, pass: f.err && /connect/i.test(f.t) && !dis };
});

// ================= CONTACT =================
const good = { name: "Riya Sharma", email: "riya@example.com", phone: "+91 98765 43210", destination: "Bali", date: "2027-02-14", travellers: "3", message: "We want a 6-day honeymoon trip." };
await tc({ id: "TC-CON-01", type: "Functional/Positive", module: "Contact form", scenario: "Submit contact form with all valid fields", steps: "Fill all 7 fields on /#contact, click Send Your Enquiry", data: JSON.stringify(good), expected: "'Thanks! Your message was received.', form reset, record saved with same values" }, async () => {
  const p = await open(b, "/");
  for (const [k, v] of Object.entries(good)) if (k !== "date" && k !== "travellers") await p.type(`${C} [name=${k}]`, v);
  await fill(p, C, { date: good.date, travellers: good.travellers });
  await submit(p, C);
  const f = await fb(p, C);
  await shot(p, "contact-success");
  await p.close();
  const rec = dataLines("contact").at(-1);
  return { actual: `message="${f.t}"; saved=${JSON.stringify(rec)}`, pass: f.t === "Thanks! Your message was received." && rec?.name === good.name && rec?.travellers === 3 };
});
await tc({ id: "TC-CON-02", type: "Functional/Positive", module: "Contact form", scenario: "Only required fields (name, email, message)", steps: "Fill name, email, message; clear travellers; submit", data: "Aman / aman@example.com / Hello", expected: "Success" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "Aman", email: "aman@example.com", message: "Hello", travellers: "" });
  await submit(p, C); const f = await fb(p, C); await p.close();
  return { actual: `"${f.t}"`, pass: !f.err && /received/.test(f.t) };
});
await tc({ id: "TC-CON-03", type: "Negative", module: "Contact form", scenario: "Submit empty contact form", steps: "Click Send Your Enquiry with all fields empty", data: "(empty)", expected: "Browser blocks with 'Please fill out this field', no request" }, async () => {
  const p = await open(b, "/"); const c = apiCount(p);
  await submit(p, C); const m = await invalidMsg(p, C);
  await shot(p, "contact-empty-validation");
  await p.close();
  return { actual: `requests=${c.n}; invalid fields: ${m.join("; ")}`, pass: c.n === 0 && m.length >= 3 };
});
await tc({ id: "TC-CON-04", type: "Negative", module: "Contact form", scenario: "Spaces-only name and message", steps: "Type 3 spaces in Name and Message, valid email, submit", data: '"   "', expected: "Clear message such as 'Please enter your name'" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "   ", email: "s@example.com", message: "   " });
  await submit(p, C); const f = await fb(p, C);
  await shot(p, "BUG-whitespace-name-message");
  await p.close();
  return { actual: `feedback="${f.t}" (error=${f.err})`, pass: f.err && !/up to 100/.test(f.t), remarks: "Input is correctly rejected by the server, but the message talks about a length limit, which confuses the user" };
});
await tc({ id: "TC-CON-05", type: "Negative", module: "Contact form", scenario: "Letters in phone number", steps: "Phone='call me maybe', other fields valid, submit", data: "call me maybe", expected: "'Enter a valid phone number.'" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "Test", email: "t@example.com", message: "Hi", phone: "call me maybe" });
  await submit(p, C); const f = await fb(p, C); await p.close();
  return { actual: `"${f.t}" error=${f.err}`, pass: f.err && /phone/.test(f.t), remarks: "Client has no pattern check — error only after server round-trip" };
});
await tc({ id: "TC-CON-06", type: "Negative", module: "Contact form", scenario: "Phone made only of symbols", steps: "Phone='+-------' (no digits), submit", data: "+-------", expected: "Rejected as invalid phone" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "Test", email: "t2@example.com", message: "Hi", phone: "+-------" });
  await submit(p, C); const f = await fb(p, C);
  await shot(p, "BUG-phone-symbols-accepted");
  await p.close();
  const rec = dataLines("contact").at(-1);
  return { actual: `feedback="${f.t}"; stored phone="${rec.phone}"`, pass: f.err };
});
await tc({ id: "TC-CON-07", type: "Negative", module: "Contact form", scenario: "Numbers only in Full Name (text-only field)", steps: "Name='1234567890', submit", data: "1234567890", expected: "Rejected – a name should contain letters" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "1234567890", email: "n@example.com", message: "Hi" });
  await submit(p, C); const f = await fb(p, C); await p.close();
  return { actual: `feedback="${f.t}"`, pass: f.err, remarks: "Requirement-dependent: no name-format validation exists" };
});
await tc({ id: "TC-CON-08", type: "Security/Negative", module: "Contact form", scenario: "XSS payload in name and message", steps: "Name='<img src=x onerror=alert(1)>', Message='<script>alert(2)</script>', submit; watch for alert dialogs", data: "<img src=x onerror=alert(1)> / <script>alert(2)</script>", expected: "No script runs; input treated as plain text" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "<img src=x onerror=alert(1)>", email: "x@example.com", message: "<script>alert(2)</script>" });
  await submit(p, C); const f = await fb(p, C); await sleep(500);
  const d = p.log.dialogs; await p.close();
  const rec = dataLines("contact").at(-1);
  return { actual: `feedback="${f.t}"; alert dialogs=${d.length}; stored raw name=${rec.name}`, pass: d.length === 0, remarks: "Stored without sanitising — safe today because submissions are never displayed on the site; must be HTML-escaped if an admin page is added later" };
});
await tc({ id: "TC-CON-09", type: "Boundary", module: "Contact form", scenario: "Type 150 characters into Full Name", steps: "Type 150 'a' characters into Name", data: "'a' x 150", expected: "Field stops at 100 characters (maxlength)" }, async () => {
  const p = await open(b, "/");
  await p.type(`${C} [name=name]`, "a".repeat(150));
  const l = await p.$eval(`${C} [name=name]`, (i) => i.value.length); await p.close();
  return { actual: `value length=${l}`, pass: l === 100 };
});
await tc({ id: "TC-CON-10", type: "Boundary", module: "Contact form", scenario: "Message of exactly 2000 characters", steps: "Paste 2000-character message, submit", data: "'x' x 2000", expected: "Accepted" }, async () => {
  const p = await open(b, "/");
  await fill(p, C, { name: "Long", email: "long@example.com", message: "x".repeat(2000) });
  await submit(p, C); const f = await fb(p, C); await p.close();
  return { actual: `"${f.t}"`, pass: !f.err };
});
for (const [i, v, why] of [["11", "0", "below min 1"], ["12", "100", "above max 99"], ["13", "2.5", "decimal"], ["14", "-3", "negative"]]) {
  await tc({ id: "TC-CON-" + i, type: "Boundary/Negative", module: "Contact form", scenario: `Number of Travellers = ${v} (${why})`, steps: `Set travellers=${v}, other fields valid, submit`, data: v, expected: "Blocked with validation message" }, async () => {
    const p = await open(b, "/"); const c = apiCount(p);
    await fill(p, C, { name: "T", email: "t@example.com", message: "Hi", travellers: v });
    await submit(p, C); const m = await invalidMsg(p, C); await p.close();
    return { actual: `requests=${c.n}; ${m.join(";")}`, pass: c.n === 0 && m.length === 1 };
  });
}
await tc({ id: "TC-CON-15", type: "Negative", module: "Contact form", scenario: "Past travel date", steps: "Travel Dates=2024-05-01, submit", data: "2024-05-01", expected: "Blocked" }, async () => {
  const p = await open(b, "/"); const c = apiCount(p);
  await fill(p, C, { name: "T", email: "t@example.com", message: "Hi", date: "2024-05-01" });
  await submit(p, C); const m = await invalidMsg(p, C); await p.close();
  return { actual: `requests=${c.n}; ${m.join(";")}`, pass: c.n === 0 && m.length === 1 };
});
await tc({ id: "TC-CON-16", type: "Functional/Positive", module: "Contact form", scenario: "Unicode & special characters", steps: "Name='José Ñúñez 李雷 😀', Message with Hindi and symbols, submit", data: "José Ñúñez 李雷 😀 / नमस्ते! 50% off? & <b>", expected: "Accepted and stored exactly" }, async () => {
  const p = await open(b, "/");
  const name = "José Ñúñez 李雷 😀", msg = "नमस्ते! 50% off? & <b>";
  await fill(p, C, { name, email: "u@example.com", message: msg });
  await submit(p, C); const f = await fb(p, C); await p.close();
  const rec = dataLines("contact").at(-1);
  return { actual: `"${f.t}"; stored name="${rec.name}", message="${rec.message}"`, pass: !f.err && rec.name === name && rec.message === msg };
});
await tc({ id: "TC-CON-17", type: "Functional/Negative", module: "Contact form", scenario: "Timezone: user west of UTC picks today's date", steps: "Set browser timezone to a zone where the local date is still the previous day vs UTC (e.g. US evening). Choose today's local date (allowed by the date picker), submit", data: "local 'today'", expected: "Accepted, because the date picker allows it" }, async () => {
  const zones = ["America/New_York", "America/Los_Angeles", "Pacific/Honolulu", "Pacific/Pago_Pago"];
  const utc = new Date().toISOString().slice(0, 10);
  const tz = zones.find((z) => new Date().toLocaleDateString("en-CA", { timeZone: z }) !== utc);
  if (!tz) return { actual: "No zone currently behind UTC date", status: "BLOCKED" };
  const local = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const p = await open(b, "/", { tz });
  const min = await p.$eval(`${C} [name=date]`, (i) => i.min);
  await fill(p, C, { name: "TZ", email: "tz@example.com", message: "Hi", date: local });
  const valid = await p.$eval(`${C} [name=date]`, (i) => i.checkValidity());
  await submit(p, C); const f = await fb(p, C);
  await shot(p, "BUG-timezone-date-rejected");
  await p.close();
  return { actual: `browser TZ=${tz}; UTC date=${utc}; local date=${local}; picker min=${min}; browser says valid=${valid}; server feedback="${f.t}" (error=${f.err})`, pass: !f.err };
});
await tc({ id: "TC-CON-18", type: "Negative", module: "Contact form", scenario: "Email with double dot domain", steps: "Email='a@b..com' submit", data: "a@b..com", expected: "Rejected" }, async () => {
  const p = await open(b, "/"); const c = apiCount(p);
  await fill(p, C, { name: "T", email: "a@b..com", message: "Hi" });
  await submit(p, C); const m = await invalidMsg(p, C); await p.close();
  return { actual: `requests=${c.n}; ${m.join(";")}`, pass: c.n === 0 && m.length === 1, remarks: "Browser blocks it; server alone would accept it (see TC-API-09)" };
});

// ================= BOOKING =================
await tc({ id: "TC-BOOK-01", type: "Functional/Positive", module: "Booking enquiry", scenario: "Send booking enquiry for Maldives", steps: "Open /packages/maldives, fill Name, Email, date 2027-05-01, 2 travellers, message, submit", data: "Neha / neha@example.com / 2027-05-01 / 2", expected: "'Your inquiry was received. This is not a confirmed booking.' and record saved with trip=maldives" }, async () => {
  const p = await open(b, "/packages/maldives");
  await p.type(`${B} [name=name]`, "Neha"); await p.type(`${B} [name=email]`, "neha@example.com");
  await fill(p, B, { date: "2027-05-01", travellers: "2", message: "Anniversary" });
  await submit(p, B); const f = await fb(p, B);
  await shot(p, "booking-success");
  await p.close();
  const rec = dataLines("booking").at(-1);
  return { actual: `"${f.t}"; saved=${JSON.stringify(rec)}`, pass: /not a confirmed booking/.test(f.t) && rec?.trip === "maldives" };
});
await tc({ id: "TC-BOOK-02", type: "Boundary", module: "Booking enquiry", scenario: "Travellers above package max (Maldives 6)", steps: "Set travellers=7 and submit", data: "7", expected: "Blocked by validation" }, async () => {
  const p = await open(b, "/packages/maldives"); const c = apiCount(p);
  await fill(p, B, { name: "N", email: "n@example.com", travellers: "7" });
  await submit(p, B); const m = await invalidMsg(p, B); await p.close();
  return { actual: `requests=${c.n}; ${m.join(";")}`, pass: c.n === 0 && m.length === 1 };
});
await tc({ id: "TC-BOOK-03", type: "Security/Negative", module: "Booking enquiry", scenario: "Tamper hidden trip id via DevTools", steps: "In DevTools change hidden input trip='mars', submit", data: "trip=mars", expected: "Server rejects" }, async () => {
  const p = await open(b, "/packages/maldives");
  await fill(p, B, { name: "N", email: "n@example.com", travellers: "2", trip: "mars" });
  await submit(p, B); const f = await fb(p, B); await p.close();
  return { actual: `"${f.t}" error=${f.err}`, pass: f.err };
});
await tc({ id: "TC-BOOK-04", type: "Security/Negative", module: "Booking enquiry", scenario: "Bypass client max via DevTools (travellers=50)", steps: "Remove max attribute, set travellers=50, submit", data: "50", expected: "Server rejects" }, async () => {
  const p = await open(b, "/packages/maldives");
  await p.$eval(`${B} [name=travellers]`, (i) => i.removeAttribute("max"));
  await fill(p, B, { name: "N", email: "n@example.com", travellers: "50" });
  await submit(p, B); const f = await fb(p, B); await p.close();
  return { actual: `"${f.t}" error=${f.err}`, pass: f.err };
});
await tc({ id: "TC-BOOK-05", type: "Negative", module: "Booking enquiry", scenario: "Empty booking form", steps: "Clear travellers, click Send booking inquiry", data: "(empty)", expected: "Name, Email, Travellers flagged; no request" }, async () => {
  const p = await open(b, "/packages/bali"); const c = apiCount(p);
  await fill(p, B, { travellers: "" });
  await submit(p, B); const m = await invalidMsg(p, B); await p.close();
  return { actual: `requests=${c.n}; ${m.join("; ")}`, pass: c.n === 0 && m.length === 3 };
});
await tc({ id: "TC-REG-01", type: "Regression", module: "Forms", scenario: "Re-run original project test suite (npm test)", steps: "Run npm test in repository", data: "-", expected: "All tests pass" }, async () => {
  const { execSync } = await import("node:child_process");
  const out = execSync("cd /home/user/MeetOnTheMap && npm test 2>&1").toString();
  return { actual: out.match(/# (pass|fail) \d+/g).join(", "), pass: /# fail 0/.test(out) };
});
const st = statSync("/tmp/qa-data/contact.ndjson");
console.log("data file mode", (st.mode & 0o777).toString(8));
await b.close();
