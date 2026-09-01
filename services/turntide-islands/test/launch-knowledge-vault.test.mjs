import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { foundingChannelMessages, foundingOfferMessage, vaultPermissionOverwrites, ventureLaunchAdmission } from "../lib/management/launch-knowledge-vault.mjs";

const product = JSON.parse(readFileSync(new URL("../content/products/founding-knowledge-vault.json", import.meta.url), "utf8"));

test("admits a priced but honestly uncharged founding vault product", () => {
  assert.equal(ventureLaunchAdmission(product).type, "TTIVentureLaunchAdmission");
  const message = foundingOfferMessage(product);
  assert.match(message, /\$5\/month/u);
  assert.match(message, /No charge is being taken yet/u);
  assert.match(message, /islander.*not proof of payment/u);
  assert.match(message, /TTI-KV-FOUNDING-2026-01/u);
});

test("refuses infrastructure without the venture measurement and entitlement loop", () => {
  const thin = structuredClone(product); delete thin.measurement; thin.roles.paidEntitlement = thin.roles.grandfathered;
  const refusal = ventureLaunchAdmission(thin);
  assert.equal(refusal.type, "TTIVentureLaunchRefusal");
  assert.ok(refusal.missing.includes("payment-distinct-entitlement"));
  assert.ok(refusal.missing.includes("venture-measurement-loop"));
});

test("preserves grandfathered access while adding a payment-distinct subscriber role", () => {
  const rows = vaultPermissionOverwrites({ guildId: "guild", islanderRoleId: "islander", subscriberRoleId: "subscriber", botUserId: "bot", adminUserId: "admin" });
  assert.equal(rows.find((row) => row.id === "guild").deny, "1024");
  assert.equal(rows.find((row) => row.id === "islander").allow, "68608");
  assert.equal(rows.find((row) => row.id === "subscriber").allow, "68608");
});

test("seeds fulfillment, request, receipts, and editorial lanes with bounded promises", () => {
  const messages = foundingChannelMessages(product);
  assert.deepEqual(Object.keys(messages).sort(), ["archive-desk", "receipts", "serious-threading", "vault-briefings"]);
  assert.match(messages.receipts, /Charges taken: none/u);
  assert.match(messages["archive-desk"], /not a guaranteed private consulting SLA/u);
});
