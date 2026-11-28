import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";

export const BASE = "http://localhost:3000";
export const EVID = "/home/user/MeetOnTheMap/qa-report/evidence";
mkdirSync(EVID, { recursive: true });
export const DATA = "/tmp/qa-data";

export async function launch() {
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: [...chromium.args.filter((a) => a !== "--disable-web-security" && !a.startsWith("--disable-site-isolation")), "--lang=en-IN"],
    headless: true,
    defaultViewport: { width: 1366, height: 768 },
  });
}

// Page wrapper that records console errors, page errors, failed requests and dialogs (XSS detector)
export async function open(browser, path = "/", { viewport, js = true, tz } = {}) {
  const page = await browser.newPage();
  page.log = { console: [], pageerror: [], failed: [], dialogs: [], bad: [] };
  page.on("console", (m) => m.type() === "error" && page.log.console.push(m.text()));
  page.on("pageerror", (e) => page.log.pageerror.push(String(e)));
  page.on("requestfailed", (r) => page.log.failed.push(r.url() + " " + r.failure()?.errorText));
  page.on("response", (r) => r.status() >= 400 && page.log.bad.push(r.status() + " " + r.url()));
  page.on("dialog", async (d) => { page.log.dialogs.push(d.type() + ":" + d.message()); await d.dismiss(); });
  if (viewport) await page.setViewport(viewport);
  if (!js) await page.setJavaScriptEnabled(false);
  if (tz) await page.emulateTimezone(tz);
  page.lastResponse = path === null ? null : await page.goto(BASE + path, { waitUntil: "networkidle0" });
  return page;
}

const results = existsSync("/tmp/qa/results.json") ? JSON.parse(readFileSync("/tmp/qa/results.json")) : [];
export function record(r) {
  const i = results.findIndex((x) => x.id === r.id);
  if (i >= 0) results[i] = r; else results.push(r);
  writeFileSync("/tmp/qa/results.json", JSON.stringify(results, null, 1));
  console.log(`${r.status.padEnd(7)} ${r.id} ${r.scenario} -> ${String(r.actual).slice(0, 220)}`);
}
// run a test body safely; body returns {actual, pass, remarks?}
export async function tc(meta, fn) {
  if (process.env.ONLY && !new RegExp(process.env.ONLY).test(meta.id)) return;
  try {
    const { actual, pass, remarks = "", status } = await fn();
    record({ ...meta, actual, status: status || (pass ? "PASS" : "FAIL"), remarks: remarks || meta.remarks || "" });
  } catch (e) {
    record({ ...meta, actual: "Test error: " + e.message, status: "BLOCKED", remarks: "Automation error" });
  }
}
export const dataLines = (kind) => existsSync(`${DATA}/${kind}.ndjson`) ? readFileSync(`${DATA}/${kind}.ndjson`, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse) : [];
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const shot = (page, name, full = false) => page.screenshot({ path: `${EVID}/${name}.jpg`, type: "jpeg", quality: 60, fullPage: full });
export async function clickEl(page, sel) {
  const el = typeof sel === "string" ? await page.waitForSelector(sel) : sel;
  await el.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await sleep(150);
  await el.click();
}
export async function clickNav(page, sel) {
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), clickEl(page, sel)]);
}

export async function waitFor(page, fn, ms = 5000) {
  const t = Date.now();
  while (Date.now() - t < ms) { if (await page.evaluate(fn)) return true; await sleep(150); }
  return false;
}
