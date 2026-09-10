import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf8"));
}

test("Cold Red Gate cannot be projected as any Koios public web carrier", () => {
  const admin = readJson("site-admin.config.json");
  const endpoints = Array.isArray(admin.endpoints) ? admin.endpoints : [];

  assert.equal(
    endpoints.length,
    0,
    "site-admin must not advertise any Koios hostname to the VPS carrier",
  );
  assert.equal(
    endpoints.some((endpoint) => endpoint.serviceName === "koios-news-site" || endpoint.port === 18802),
    false,
    "site-admin must not recreate the retired public-site service or port",
  );
  assert.equal(
    existsSync(join(ROOT, "deploy/systemd/koios-news-site.service")),
    false,
    "the VPS public-site unit template must remain retired",
  );
  assert.equal(
    existsSync(join(ROOT, "deploy/systemd/koios-news-newsroom.service")),
    false,
    "the VPS newsroom web-unit template must remain retired",
  );
});

test("Koios law assigns public authority to Cloudflare and persistence to Cold Red Gate", () => {
  const law = readJson("lib/law/cloudflare-public-authority.json");

  assert.match(law.authorities.public, /cloudflare-worker:koios-news-primary/u);
  assert.match(law.authorities.persistentOperations, /may not serve koios\.news or any Koios public subdomain/u);
  assert.match(law.authorities.rollbackTarget, /never a Cold Red Gate public origin/u);
});
