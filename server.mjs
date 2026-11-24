import { createServer } from "node:http";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { places } from "./public/catalog.js";
const root = fileURLToPath(new URL("./public/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
const kinds = new Set(["booking", "contact", "newsletter"]);
const invalid = (message, status = 400) =>
  Object.assign(new Error(message), { status });
async function body(req) {
  let size = 0;
  const chunks = [];
  for await (const part of req) {
    size += part.length;
    if (size > 8192) throw invalid("Request is too large.", 413);
    chunks.push(part);
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw Error();
    return data;
  } catch {
    throw invalid("Enter valid form details.");
  }
}
export function validate(kind, data) {
  const text = (key) => (typeof data[key] === "string" ? data[key].trim() : "");
  const email = text("email");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw invalid("Enter a valid email address.");
  const result = { email };
  if (kind === "newsletter") return result;
  const name = text("name"),
    message = text("message");
  if (!name || name.length > 100)
    throw invalid("Enter a name of up to 100 characters.");
  if (message.length > 2000 || (!message && kind === "contact"))
    throw invalid("Enter a message of up to 2,000 characters.");
  Object.assign(result, { name, message });
  if (kind === "booking") {
    const trip = places.find((p) => p.id === text("trip"));
    const travellers =
      typeof data.travellers === "string" || typeof data.travellers === "number"
        ? Number(data.travellers)
        : NaN;
    const date = text("date");
    if (
      !trip ||
      !Number.isInteger(travellers) ||
      travellers < 1 ||
      travellers > trip.group
    )
      throw invalid("Select a valid trip and group size.");
    if (date) {
      const t = new Date(date);
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(+t) ||
        t.toISOString().slice(0, 10) !== date ||
        t < now
      )
        throw invalid("Choose a valid travel date today or later.");
    }
    Object.assign(result, { trip: trip.id, travellers, date });
  }
  return result;
}
export function buildServer({
  dataDir = process.env.DATA_DIR || resolve("data"),
} = {}) {
  return createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, "http://local");
      const path = decodeURIComponent(url.pathname);
      if (path.startsWith("/api/")) {
        const kind = path.slice(5);
        if (!kinds.has(kind)) return send(404, { error: "Form not found." });
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return send(405, { error: "Use POST to submit the form." });
        }
        if (req.headers["content-type"]?.split(";")[0] !== "application/json")
          return send(415, { error: "Expected JSON form data." });
        const data = validate(kind, await body(req));
        await mkdir(dataDir, { recursive: true, mode: 0o700 });
        await appendFile(
          resolve(dataDir, `${kind}.ndjson`),
          JSON.stringify({ receivedAt: new Date().toISOString(), ...data }) +
            "\n",
          { mode: 0o600 },
        );
        return send(201, {
          message:
            kind === "newsletter"
              ? "Thanks! Your signup was saved."
              : kind === "booking"
                ? "Your inquiry was received. This is not a confirmed booking."
                : "Thanks! Your message was received.",
        });
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.setHeader("Allow", "GET, HEAD");
        return send(405, { error: "Method not allowed." });
      }
      const page = !extname(path);
      const segments = path.split("/").filter(Boolean);
      const exists =
        !segments.length ||
        (["destinations", "packages"].includes(segments[0]) &&
          (segments.length === 1 ||
            (segments.length === 2 &&
              places.some((p) => p.id === segments[1]))));
      const file = resolve(root, page ? "index.html" : "." + path);
      const type = types[extname(file)];
      if (!file.startsWith(root) || !type)
        return send(404, { error: "Not found." });
      const contents = await readFile(file);
      res.writeHead(page && !exists ? 404 : 200, {
        "Content-Type": type,
        "Cache-Control": file.includes("/media/")
          ? "public, max-age=86400"
          : "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : contents);
    } catch (e) {
      if (e.code === "ENOENT" || e.code === "EISDIR")
        return send(404, { error: "Not found." });
      if (e instanceof URIError) return send(400, { error: "Invalid URL." });
      if (!e.status) console.error(e);
      return send(e.status || 500, {
        error: e.status
          ? e.message
          : "Unable to complete the request. Please try again.",
      });
    }
  });
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 3000);
  buildServer().listen(port, "0.0.0.0", () =>
    console.log(`Travelling Breez listening on ${port}`),
  );
}
