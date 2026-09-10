import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const command = fileURLToPath(new URL("../bin/koios-news-schedule-delivery-preflight.mjs", import.meta.url));
const args = ["solicitation", "--first-due-at", "2026-09-01T12:00:00.000Z", "--interval-seconds", "86400", "--max-deliveries", "null", "--timeout-milliseconds", "60000"];

test("forms the current live ScheduledActivityDeliveryRequest without changing the scheduled target", () => {
  const result = spawnSync(process.execPath, [command, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0);
  const solicitation = JSON.parse(result.stdout);
  const request = solicitation.object.sourceActivity.object.attachment[0];
  assert.equal(solicitation.object.type, "ServiceSolicitation");
  assert.equal(request.type, "ScheduledActivityDeliveryRequest");
  assert.equal(request.executionMode, "live");
  assert.equal(request.target.packageRoot, "/home/emsenn/services/koios-news-runtime");
  assert.equal(request.target.operation, "koios-news-routine-operation");
  assert.equal(request.target.contract, "koios-news/routine-operation/v1");
  assert.equal(request.deliveryCapabilityId, "urn:capability:koios-news:cold-red-gate:routine-publication:v1");
  assert.equal(request.activityTemplate.object.pulseId, undefined);
});

test("offer preflight recognizes only the real provider offer law and never permits activation", () => {
  const solicitation = JSON.parse(spawnSync(process.execPath, [command, ...args], { encoding: "utf8" }).stdout);
  const request = solicitation.object.sourceActivity.object.attachment[0];
  const offer = {
    "@context": solicitation["@context"], id: "urn:test:provider-offer", type: "Offer",
    actor: solicitation.target, target: solicitation.actor,
    object: {
      type: "ExecutableServiceOffer", contract: "ni:///sha-256;4FFjgQNtnqt4kz9gskolbDbK1kudEnJAMUe87oCAKZo",
      sourceActivity: solicitation.object.sourceActivity.id, customer: solicitation.actor, request,
      requestDigest: "ni:///sha-256;test-request", scheduleId: "ni:///sha-256;test-schedule",
      targetBinding: {
        packageDigest: "ni:///sha-256;0yKUqiN6oBx3OPLC1hlEH_bI75jh8krJrrpXlejffHY",
        selectedBinDigest: "ni:///sha-256;GT6O4vInCdejn2thcqFIqCq137OIwKsJ3X8abxTMvgI",
        runtimeClosureDigest: "ni:///sha-256;Y2IXvgUmtT1AtDfxyD3XFrSNkU7ERomL7OPd4Z6uBPs",
      },
      effects: ["provider-local-append-only-schedule", "provider-local-occurrence-reservation", "exact-advertised-target-operation-invocation"], operation: "invoke-service",
    },
  };
  const root = mkdtempSync(join(tmpdir(), "koios-schedule-preflight-"));
  try {
    const solicitationPath = join(root, "solicitation.json"), offerPath = join(root, "offer.json");
    writeFileSync(solicitationPath, JSON.stringify(solicitation)); writeFileSync(offerPath, JSON.stringify(offer));
    const result = spawnSync(process.execPath, [command, "verify-offer", "--solicitation", solicitationPath, "--offer", offerPath], { encoding: "utf8" });
    assert.equal(result.status, 2);
    const preflight = JSON.parse(result.stdout);
    assert.equal(preflight.offerLawShapeVerified, true);
    assert.equal(preflight.targetBindingVerified, true);
    assert.equal(preflight.targetBinding.runtimeClosureDigest, "ni:///sha-256;Y2IXvgUmtT1AtDfxyD3XFrSNkU7ERomL7OPd4Z6uBPs");
    assert.equal(preflight.providerAuthorityAuthenticated, false);
    assert.equal(preflight.acceptanceProduced, false);
    assert.equal(preflight.activationPermitted, false);

    offer.object.contract = "koios-news/schedule-delivery-activation/v1";
    writeFileSync(offerPath, JSON.stringify(offer));
    const forged = spawnSync(process.execPath, [command, "verify-offer", "--solicitation", solicitationPath, "--offer", offerPath], { encoding: "utf8" });
    assert.equal(forged.status, 2);
    assert.match(forged.stderr, /current ScheduleDelivery ExecutableServiceOffer law/u);

    offer.object.contract = "ni:///sha-256;4FFjgQNtnqt4kz9gskolbDbK1kudEnJAMUe87oCAKZo";
    offer.object.targetBinding.runtimeClosureDigest = "ni:///sha-256;different-runtime-closure";
    writeFileSync(offerPath, JSON.stringify(offer));
    const stale = spawnSync(process.execPath, [command, "verify-offer", "--solicitation", solicitationPath, "--offer", offerPath], { encoding: "utf8" });
    assert.equal(stale.status, 2);
    assert.match(stale.stderr, /target runtime closure/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
