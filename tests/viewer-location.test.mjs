import assert from "node:assert/strict";
import test from "node:test";
import { formatViewerLocation, lookupViewerLocation } from "../src/lib/viewer-location.js";

test("formats an approximate city and country without exposing the IP", () => {
  assert.equal(formatViewerLocation({ success: true, city: "London", country_code: "GB" }), "London, UK");
  assert.equal(formatViewerLocation({ success: true, city: "Madrid", country_code: "ES" }), "Madrid, ES");
  assert.equal(formatViewerLocation({ success: true, city: "", country_code: "FR" }), "FR");
});

test("rejects failed or malformed location results", () => {
  assert.equal(formatViewerLocation({ success: false, city: "London", country_code: "GB" }), null);
  assert.equal(formatViewerLocation({ success: true, city: "London" }), null);
  assert.equal(formatViewerLocation(null), null);
});

test("lookup handles a provider error and requests only approximate fields", async () => {
  let requestedUrl;
  const fetcher = async (url) => {
    requestedUrl = url;
    return { ok: false };
  };
  assert.equal(await lookupViewerLocation(fetcher), null);
  assert.match(requestedUrl, /fields=success,city,country_code/);
});
