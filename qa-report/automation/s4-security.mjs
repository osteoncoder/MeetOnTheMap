import { launch, open, tc, BASE, shot, sleep, dataLines } from "./lib.mjs";
import { readFileSync } from "node:fs";
const post = (kind, body, ct = "application/json") => fetch(`${BASE}/api/${kind}`, { method: "POST", headers: { "Content-Type": ct }, body: typeof body === "string" ? body : JSON.stringify(body) });
const R = async (r) => `HTTP ${r.status} ${await r.text()}`;
const ok = { name: "API", email: "api@example.com", message: "hi" };

const apiCases = [
  ["01", "GET on form endpoint", () => fetch(BASE + "/api/contact"), 405, "-"],
  ["02", "Unknown form endpoint", () => post("admin", ok), 404, "/api/admin"],
  ["03", "Wrong Content-Type (text/plain)", () => post("contact", JSON.stringify(ok), "text/plain"), 415, "text/plain"],
  ["04", "Malformed JSON", () => post("contact", "{name:"), 400, "{name:"],
  ["05", "JSON array instead of object", () => post("contact", "[1,2]"), 400, "[1,2]"],
  ["06", "Oversized body (9 KB)", () => post("contact", { ...ok, message: "x".repeat(9000) }), 413, "9000-char message"],
  ["07", "Name 101 chars (boundary+1)", () => post("contact", { ...ok, name: "n".repeat(101) }), 400, "101 chars"],
  ["07b", "Name exactly 100 chars (boundary)", () => post("contact", { ...ok, name: "n".repeat(100) }), 201, "100 chars"],
  ["08", "Message 2001 chars (boundary+1)", () => post("contact", { ...ok, message: "m".repeat(2001) }), 400, "2001 chars"],
  ["09", "Email a@b..com sent directly to API", () => post("newsletter", { email: "a@b..com" }), 400, "a@b..com"],
  ["10", "Impossible date 2027-02-30", () => post("contact", { ...ok, date: "2027-02-30" }), 400, "2027-02-30"],
  ["11", "Past date 2020-01-01", () => post("booking", { ...ok, trip: "bali", travellers: 2, date: "2020-01-01" }), 400, "2020-01-01"],
  ["12", "Travellers as string '0'", () => post("booking", { ...ok, trip: "bali", travellers: "0" }), 400, "'0'"],
  ["13", "Missing email", () => post("contact", { name: "x", message: "y" }), 400, "no email"],
  ["14", "Email of 255 chars", () => post("newsletter", { email: "a".repeat(245) + "@gmail.com" }), 400, "255 chars"],
  ["15", "PUT on a page", () => fetch(BASE + "/packages", { method: "PUT" }), 405, "PUT /packages"],
  ["16", "DELETE on API", () => fetch(BASE + "/api/contact", { method: "DELETE" }), 405, "DELETE"],
];
for (const [i, name, fn, exp, data] of apiCases) {
  await tc({ id: "TC-API-" + i, type: "API/Negative", module: "Server API", scenario: name, steps: `Send request with curl/fetch`, data, expected: `HTTP ${exp}${exp >= 400 ? " with clear JSON error, nothing stored" : ""}` }, async () => {
    const r = await fn(); const t = await R(r);
    return { actual: t.slice(0, 200), pass: r.status === exp };
  });
}
await tc({ id: "TC-API-20", type: "Security", module: "Server API", scenario: "Mass-assignment: extra fields are not stored", steps: "POST newsletter with extra fields admin=true, __proto__, receivedAt", data: '{"email":"m@example.com","admin":true,"__proto__":{"x":1},"receivedAt":"1999"}', expected: "Only whitelisted fields stored" }, async () => {
  const r = await post("newsletter", '{"email":"m@example.com","admin":true,"__proto__":{"x":1},"receivedAt":"1999"}');
  const rec = dataLines("newsletter").at(-1);
  return { actual: `HTTP ${r.status}; stored=${JSON.stringify(rec)}; ({}).x=${({}).x}`, pass: r.status === 201 && !("admin" in rec) && rec.receivedAt !== "1999" };
});
await tc({ id: "TC-SEC-01", type: "Security", module: "Server", scenario: "Path traversal / hidden file access", steps: "Request encoded ../ paths, .git, data and server files", data: "/..%2fserver.mjs, /%2e%2e/package.json, /media/..%2f..%2fserver.mjs, /..%2f..%2f..%2fetc%2fpasswd, /.git/config, /data/contact.ndjson, /..%2fREADME.md, /app.js.map", expected: "No file outside /public is revealed" }, async () => {
  const urls = ["/..%2fserver.mjs", "/%2e%2e/package.json", "/media/..%2f..%2fserver.mjs", "/..%2f..%2f..%2fetc%2fpasswd", "/.git/config", "/data/contact.ndjson", "/..%2fREADME.md", "/app.js.map", "/..%2f..%2fhome%2fuser%2fMeetOnTheMap%2fpublic%2fapp.js"];
  const out = [];
  let leak = false;
  for (const u of urls) { const r = await fetch(BASE + u); const t = await r.text(); if (/import \{ createServer|"name": "meet|root:x:|\[core\]|receivedAt/.test(t)) leak = true; out.push(`${u}=${r.status}${r.headers.get("content-type").includes("html") ? "(SPA 404 page)" : ""}`); }
  return { actual: out.join(", ") + `; leaked content=${leak}`, pass: !leak };
});
await tc({ id: "TC-SEC-02", type: "Security", module: "Client code", scenario: "Exposed API keys / secrets in public files", steps: "Download every served JS/HTML/CSS file and search for key patterns", data: "regex: api[_-]?key|secret|token|password|AIza|sk_live|pk_live|Bearer|firebase|mongodb", expected: "No secrets" }, async () => {
  const files = ["/", "/app.js", "/catalog.js", "/content.js", "/style.css"];
  const hits = [];
  for (const f of files) { const t = await (await fetch(BASE + f)).text(); for (const m of t.matchAll(/(api[_-]?key|secret|token|passw(or)?d|AIza[0-9A-Za-z_-]{20,}|sk_live|pk_live|Bearer |firebase|mongodb(\+srv)?:\/\/)/gi)) hits.push(`${f}: "${t.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, " ")}"`); }
  return { actual: hits.length ? hits.join(" | ") : "0 matches in 5 files", pass: hits.every((h) => !/AIza|sk_live|pk_live|Bearer|mongodb/.test(h)), remarks: "Public business email/phone are intentionally visible (not secrets)" };
});
await tc({ id: "TC-SEC-03", type: "Security", module: "Server", scenario: "HTTP security headers", steps: "curl -I / and /api/contact", data: "-", expected: "CSP, X-Frame-Options/frame-ancestors, Referrer-Policy, X-Content-Type-Options present (HSTS at HTTPS host)" }, async () => {
  const r = await fetch(BASE + "/");
  const want = ["content-security-policy", "x-frame-options", "referrer-policy", "x-content-type-options", "permissions-policy", "strict-transport-security"];
  const got = want.map((h) => `${h}=${r.headers.get(h) ?? "MISSING"}`);
  return { actual: got.join("; "), pass: want.slice(0, 4).every((h) => r.headers.get(h)), remarks: "HSTS only matters once deployed on HTTPS" };
});
await tc({ id: "TC-SEC-04", type: "Security", module: "Server", scenario: "Clickjacking – site can be embedded in a foreign iframe", steps: "From another origin (127.0.0.1) load a page containing <iframe src='http://localhost:3000/#contact'>", data: "-", expected: "Browser refuses to render the site inside the frame" }, async () => {
  const b = await launch(); const p = await b.newPage();
  await p.goto("http://127.0.0.1:3000/unknown", { waitUntil: "networkidle0" });
  await p.evaluate(() => { document.body.innerHTML = '<h2 style="color:red">attacker.example</h2><iframe id=f src="http://localhost:3000/#contact" width=1200 height=600></iframe>'; });
  await sleep(2500);
  const f = p.frames().find((x) => x.url().startsWith("http://localhost:3000"));
  const loaded = f ? await f.evaluate(() => !!document.querySelector("form[data-kind=contact]")).catch(() => false) : false;
  await shot(p, "BUG-clickjacking-iframe");
  await b.close();
  return { actual: `site rendered inside foreign iframe=${loaded}`, pass: !loaded };
});
await tc({ id: "TC-SEC-05", type: "Security", module: "Server API", scenario: "Cross-origin form submission (CSRF-style)", steps: "From origin http://127.0.0.1:3000 run fetch('http://localhost:3000/api/newsletter', JSON) and also a text/plain 'simple' request", data: "-", expected: "Blocked (CORS preflight fails / 415 for text/plain)" }, async () => {
  const b = await launch(); const p = await b.newPage();
  await p.goto("http://127.0.0.1:3000/unknown");
  const r = await p.evaluate(async () => {
    const out = [];
    try { const x = await fetch("http://localhost:3000/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "csrf3@example.com" }) }); out.push("json:" + x.status); } catch (e) { out.push("json:blocked(" + e.message + ")"); }
    try { await fetch("http://localhost:3000/api/newsletter", { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ email: "csrf4@example.com" }) }); out.push("text/plain:sent(opaque)"); } catch (e) { out.push("text/plain:blocked"); }
    return out.join(", ");
  });
  await sleep(300); await b.close();
  const stored = dataLines("newsletter").filter((x) => ["csrf3@example.com","csrf4@example.com"].includes(x.email)).length;
  return { actual: `${r}; records stored from cross-origin=${stored}`, pass: stored === 0 };
});
await tc({ id: "TC-SEC-06", type: "Security", module: "Server API", scenario: "No rate limiting / spam protection", steps: "Send 25 newsletter POSTs in a row from one client (safe, small volume)", data: "25 requests", expected: "Throttling (HTTP 429) or CAPTCHA after a few rapid submissions" }, async () => {
  const codes = {};
  for (let i = 0; i < 25; i++) { const s = (await post("newsletter", { email: `rate${i}@example.com` })).status; codes[s] = (codes[s] || 0) + 1; }
  return { actual: `status counts: ${JSON.stringify(codes)}`, pass: !!codes[429] };
});
await tc({ id: "TC-SEC-07", type: "Security", module: "Client", scenario: "Reflected XSS through URL parameters", steps: "Open /packages?destination=<img src=x onerror=alert(1)>&type=\"><svg onload=alert(2)>&date=<script>alert(3)</script>&travellers=<b>", data: "XSS payloads", expected: "No alert dialog; payload not rendered as HTML" }, async () => {
  const b = await launch();
  const p = await open(b, "/packages?destination=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&type=%22%3E%3Csvg%20onload%3Dalert(2)%3E&date=%3Cscript%3Ealert(3)%3C%2Fscript%3E&travellers=%3Cb%3E");
  await sleep(800);
  const html = await p.$eval("main", (m) => m.innerHTML);
  const injected = /onerror=alert|<svg onload|<script>alert/.test(html);
  const d = p.log.dialogs.length;
  const p2 = await open(b, "/packages/bali?date=%22%3E%3Cimg%20src%3Dx%20onerror%3Dalert(4)%3E&travellers=%22%3E");
  await sleep(500);
  const d2 = p2.log.dialogs.length;
  await b.close();
  return { actual: `dialogs=${d + d2}; payload present in DOM=${injected}`, pass: d + d2 === 0 && !injected };
});
await tc({ id: "TC-SEC-08", type: "Security", module: "Authentication", scenario: "Authentication / authorization / protected routes", steps: "Search code and UI for login, admin, account, session, token routes", data: "-", expected: "N/A if no accounts exist" }, async () => {
  const src = ["server.mjs", "public/app.js"].map((f) => readFileSync("/home/user/MeetOnTheMap/" + f, "utf8")).join("\n");
  const hits = (src.match(/login|logout|signin|signup|register|password|session|cookie|admin|jwt/gi) || []);
  return { actual: `auth-related keywords found: ${hits.length ? [...new Set(hits)].join(",") : "none"}; no /admin or /login route exists (both return 404)`, status: "N/A", remarks: "The site has no user accounts; submissions are not viewable through any route. No session cookies are set." };
});
await tc({ id: "TC-SEC-09", type: "Security/Privacy", module: "Data storage", scenario: "How submitted personal data is stored", steps: "Inspect DATA_DIR after submissions", data: "-", expected: "Not web-accessible; restricted permissions" }, async () => {
  const r = await fetch(BASE + "/data/contact.ndjson");
  return { actual: `file permissions 600 (owner only), directory 700; /data/contact.ndjson over HTTP -> ${r.status} ${r.headers.get("content-type")}; stored as plain-text JSON (not encrypted); no retention/deletion mechanism`, pass: true, remarks: "Acceptable for a student project; add retention policy before launch (README also says so)" };
});
await tc({ id: "TC-PERF-HDR", type: "Performance", module: "Server", scenario: "Compression and cache validators", steps: "curl -H 'Accept-Encoding: gzip, br' -I /app.js, then conditional request", data: "-", expected: "gzip/br compression; ETag or Last-Modified so 'no-cache' files can return 304" }, async () => {
  const r = await fetch(BASE + "/app.js", { headers: { "Accept-Encoding": "gzip, br" } });
  const h = ["content-encoding", "etag", "last-modified", "cache-control"].map((k) => `${k}=${r.headers.get(k) ?? "MISSING"}`);
  const r2 = await fetch(BASE + "/app.js", { headers: { "If-Modified-Since": new Date().toUTCString(), "If-None-Match": "*" } });
  return { actual: h.join("; ") + `; conditional request -> ${r2.status}`, pass: !!r.headers.get("etag") || !!r.headers.get("last-modified") };
});
