import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { buildServer } from "../server.mjs";

test("routes, form validation and persistence", async (t) => {
  const dataDir = await mkdtemp(join(tmpdir(), "breez-test-"));
  const server = buildServer({ dataDir }).listen(0, "127.0.0.1");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(dataDir, { recursive: true, force: true });
  });
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (kind, data) =>
    fetch(`${url}/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  for (const route of [
    "/",
    "/destinations",
    "/destinations/bali",
    "/packages",
    "/packages/maldives",
    "/media/komodo.webp",
    "/media/switzerland.webp",
    "/blog",
    "/blog/first-time-traveller-checklist",
    "/booking-information",
    "/cancellation-policy",
    "/privacy-policy",
    "/terms",
  ])
    assert.equal((await fetch(url + route)).status, 200, route);
  assert.equal((await fetch(url + "/packages/unknown")).status, 404);
  assert.equal((await fetch(url + "/blog/unknown")).status, 404);
  assert.equal((await fetch(url + "/unknown-page")).status, 404);
  assert.equal((await fetch(url + "/api/contact")).status, 405);
  assert.equal(
    (await post("newsletter", { email: "not-an-email" })).status,
    400,
  );
  assert.equal(
    (
      await post("contact", {
        email: "test@example.com",
        name: "Test",
        message: " ",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await post("contact", {
        email: "test@example.com",
        name: "Test",
        message: "Hello",
        phone: "call me maybe",
      })
    ).status,
    400,
  );
  const booking = {
    email: "test@example.com",
    name: "Test",
    trip: "maldives",
    travellers: 2,
    date: "2090-02-12",
  };
  assert.equal(
    (await post("booking", { ...booking, travellers: 7 })).status,
    400,
  );
  assert.equal(
    (await post("booking", { ...booking, date: "2090-02-30" })).status,
    400,
  );
  for (const [kind, data] of [
    ["booking", booking],
    [
      "contact",
      {
        email: booking.email,
        name: "Test",
        message: "Can we travel in May?",
        phone: "+91 98765 43210",
        destination: "Maldives",
        date: "2090-02-12",
        travellers: 2,
      },
    ],
    ["newsletter", { email: booking.email }],
  ]) {
    assert.equal((await post(kind, data)).status, 201);
    const record = JSON.parse(
      await readFile(join(dataDir, kind + ".ndjson"), "utf8"),
    );
    for (const [key, value] of Object.entries(data))
      assert.equal(record[key], value);
  }
});
