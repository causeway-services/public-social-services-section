import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the channel Cloud Run lane is portable, scoped, and credential-blind", () => {
  const contractPath = new URL("../content/deployment/cloud-run/channel-lane-contract.json", import.meta.url);
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  const packageMetadata = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(contract.type, "YouTubeChannelCloudRunLaneContract");
  assert.equal(contract.version, 1);
  assert.equal(contract.packageIdentity, packageMetadata.name);
  assert.match(contract.serviceMount, /^\/app\/emsweb\/services\/[a-z0-9-]+$/u);
  assert.equal(contract.statePrefix, `runtime-state/${contract.channel}/`);
  assert.match(contract.cadence.schedule, /^(?:\S+\s+){4}\S+$/u);
  assert.equal(contract.cadence.timeZone, "America/Chicago");
  assert.deepEqual(Object.keys(contract.controlPlaneOwnership).sort(), ["execution", "owner", "provider", "scheduler"]);
  assert.ok(contract.secretEnvironmentNames.every((name) => /^[A-Z][A-Z0-9_]*$/u.test(name)));
  assert.equal(Object.values(contract).some((value) => typeof value === "string" && value.startsWith("/home/")), false);
  const activations = ["portfolio-status-agent.json", "release-distribution-agent.json"].map((name) =>
    JSON.parse(readFileSync(new URL(`../content/config/${name}`, import.meta.url), "utf8")));
  assert.equal(new Set(activations.map(({ internalListener }) => internalListener.port)).size, 2);
  for (const activation of activations) {
    assert.equal(activation.status, "planned-cloud-run-batch");
    assert.equal(activation.desiredState, "paused-until-cloud-run-release-approval");
    assert.deepEqual(activation.internalListener, {
      scope: "container-loopback",
      host: "127.0.0.1",
      port: activation.internalListener.port,
      baseUrl: `http://127.0.0.1:${activation.internalListener.port}`,
    });
    assert.equal(activation.signingKeyRuntime.source, "secret-manager-archive");
    assert.equal(activation.signingKeyRuntime.archiveMount, "/secrets/signing-keys.tar");
    assert.equal(activation.signingKeyRuntime.environment, "AGENT_CARD_SIGNING_KEY");
    assert.match(activation.signingKeyRuntime.archiveEntry, /^emsweb\/[a-z0-9-]+\/signing\/(?:portfolio-status|release-distribution)\.pkcs8\.pem$/u);
    assert.equal("signingKeyDataPath" in activation || "serviceUnit" in activation || "host" in activation, false);
  }
});
