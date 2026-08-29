import assert from "node:assert/strict";
import test from "node:test";
import { refreshAccessToken } from "../src/private-draft-pilot.mjs";
import { selectPendingPrivateSchedule } from "../src/schedule-pending.mjs";

const AT = "2096-07-22T10:00:00.000Z";
const draft = (id, inventoryAdmission) => ({ id, inventoryAdmission, status: "private-draft-not-scheduled" });
const claim = (id, inventoryAdmission, plannedPublishAt) => ({ id, inventoryAdmission, plannedPublishAt });

test("pending scheduler chooses the earliest future claimed private draft exactly once", () => {
  const input = selectPendingPrivateSchedule({
    privateDraftReceipts: [draft("draft-later", "inventory-later"), draft("draft-first", "inventory-first"), draft("draft-done", "inventory-done")],
    releaseClaims: [claim("claim-later", "inventory-later", "2096-07-24T15:00:00.000Z"), claim("claim-first", "inventory-first", "2096-07-22T15:00:00.000Z"), claim("claim-done", "inventory-done", "2096-07-23T15:00:00.000Z")],
    scheduleReceipts: [{ privateDraftReceipt: "draft-done" }],
    at: AT,
  });
  assert.equal(input.privateDraftReceipt.id, "draft-first");
  assert.equal(input.releaseClaim.id, "claim-first");
});

test("pending scheduler does not invent a schedule for expired or unclaimed inventory", () => {
  const input = selectPendingPrivateSchedule({
    privateDraftReceipts: [draft("expired", "inventory-expired"), draft("unclaimed", "inventory-unclaimed")],
    releaseClaims: [claim("expired-claim", "inventory-expired", "2096-07-22T09:00:00.000Z")],
    scheduleReceipts: [],
    at: AT,
  });
  assert.equal(input, null);
});

test("scope admission fails before scheduling when a refreshed token lacks force-ssl", async () => {
  const credentials = { clientId: "client", clientSecret: "secret", refreshToken: "refresh" };
  const fetchImpl = async () => new Response(JSON.stringify({ access_token: "access", scope: "https://www.googleapis.com/auth/youtube.upload" }), { status: 200 });
  await assert.rejects(
    refreshAccessToken(credentials, fetchImpl, ["https://www.googleapis.com/auth/youtube.force-ssl"]),
    /lacks required scope.*youtube\.force-ssl/u,
  );
});
