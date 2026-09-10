import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import {
  acceptPreviewProbe,
  CLOUDFLARE_COMPATIBILITY_DATE,
  doctor,
  enqueuePendingRelease,
  executeObservedAuthorized,
  plan,
  TARGET,
  verifyCandidate,
  verifyProductionBaseline,
  WRANGLER,
} from "../src/carrier.mjs";
import { spawnSync } from "node:child_process";
const sha = (v) => createHash("sha256").update(v).digest("hex");
const NOW = "2026-08-29T18:00:00.000Z";
const canonical = (value) => {
  if (
    value === null || typeof value === "boolean" || typeof value === "number" ||
    typeof value === "string"
  ) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${
    Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonical(value[key])}`
    ).join(",")
  }}`;
};
function fixture() {
  const modeCapableTmp = process.env.TMPDIR ?? (existsSync("/var/tmp") ? "/var/tmp" : tmpdir());
  const root = mkdtempSync(join(modeCapableTmp, "koios-cf-current-")),
    candidate = join(root, "candidate");
  mkdirSync(candidate);
  const index = Buffer.from("<h1>Koios</h1>\n"), news = Buffer.from("news\n");
  for (const [file, bytes] of [["index.html", index], ["news.txt", news]]) {
    writeFileSync(join(candidate, file), bytes);
  }
  const manifest = {
    kind: "koios.news.static-publication-manifest/v1",
    provenance: { canonicalOrigin: "https://koios.news" },
    artifacts: [["index.html", index], ["news.txt", news]].map((
      [file, bytes],
    ) => ({ file, sha256: sha(bytes), bytes: bytes.length })),
  };
  writeFileSync(
    join(candidate, "manifest.json"),
    `${JSON.stringify(manifest)}\n`,
  );
  const binding = {
      kind: "koios.news.cloudflare-release-binding/v1",
      ...TARGET,
    },
    bindingPath = join(root, "binding.json");
  writeFileSync(bindingPath, `${JSON.stringify(binding, null, 2)}\n`);
  const digest = sha(readFileSync(bindingPath)),
    rollback = {
      kind: "koios.news.cloudflare-rollback-binding/v1",
      ...TARGET,
      bindingSha256: digest,
      priorVersionId: "previous-version",
    },
    keyId = "cloudflare_release_test_key",
    { publicKey, privateKey } = generateKeyPairSync("ed25519"),
    keys = join(root, "keys.json");
  writeFileSync(
    keys,
    JSON.stringify({ [keyId]: publicKey.export({ format: "jwk" }).x }),
  );
  writeFileSync(join(root, "rollback.json"), JSON.stringify(rollback));
  const grant = (phase) => {
    const baselinePath = join(root, "baseline.json"),
      baseline = phase === "release"
        ? {
          kind: "koios.static-publication-manifest",
          profile: "cutover-candidate",
          authority: "non-authoritative-cutover-candidate",
          canonicalOrigin: "https://koios.news",
          routeCount: 2,
          aliasCount: 0,
          artifacts: [
            { route: "/", file: "index.html", mediaType: "text/html", bytes: 1, digest: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
            { route: "/news.txt", file: "news.txt", mediaType: "text/plain", bytes: 1, digest: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
          ],
        }
        : undefined;
    if (baseline) writeFileSync(baselinePath, `${JSON.stringify(baseline)}\n`);
    const unsigned = {
        admission: {
          kind: "local-operator-admission",
          verifiedProviderAuthority: false,
        },
        expiresAt: "2026-08-30T18:00:00.000Z",
        grantId: `${phase}_grant_current_123`,
        issuedAt: "2026-08-29T17:00:00.000Z",
        issuerKeyId: keyId,
        kind: "koios.news.cloudflare-release-grant/v2",
        scope: {
          action: phase,
          ...(baseline
            ? { baselineManifestSha256: sha(readFileSync(baselinePath)) }
            : {}),
          bindingSha256: digest,
          candidateManifestSha256: sha(
            readFileSync(join(candidate, "manifest.json")),
          ),
          target: TARGET,
        },
      },
      record = {
        ...unsigned,
        signature: sign(null, Buffer.from(canonical(unsigned)), privateKey)
          .toString("base64url"),
      },
      path = join(root, `${phase}-grant.json`);
    writeFileSync(path, `${canonical(record)}\n`);
    return { path, baselinePath };
  };
  return {
    root,
    candidate,
    binding: bindingPath,
    grant,
    keys,
    rollback: join(root, "rollback.json"),
    manifest,
    digest,
  };
}
const authorized = (x, phase, extra = {}) => {
  const grant = x.grant(phase);
  return plan({
    phase,
    candidateDir: x.candidate,
    bindingPath: x.binding,
    grantPath: grant.path,
    authorityKeysPath: x.keys,
    now: NOW,
    ...(phase === "release"
      ? { productionBaselinePath: grant.baselinePath }
      : {}),
    ...extra,
  });
};
test("plan has bytewise asset deploys, exact signed admission template, and positional rollback", () => {
  const x = fixture();
  try {
    const got = plan({ candidateDir: x.candidate, bindingPath: x.binding });
    assert.equal(verifyCandidate(x.candidate).artifactCount, 2);
    assert.deepEqual(got.commands[1].args.slice(-4), [
      "--assets",
      x.candidate,
      "--route",
      TARGET.routePattern,
    ]);
    assert.deepEqual(got.commands[1].args.slice(3, 5), [
      "--compatibility-date",
      CLOUDFLARE_COMPATIBILITY_DATE,
    ]);
    assert.equal(
      got.commands.flatMap((command) => command.args).includes("--account-id"),
      false,
    );
    assert.deepEqual(got.commands[2].args, [
      "rollback",
      "<priorVersionId>",
      "--name",
      TARGET.workerName,
    ]);
    assert.equal(
      got.requiredAdmissions.grant.scope.candidateManifestSha256,
      got.candidate.manifestSha256,
    );
    assert.equal(
      got.requiredAdmissions.grant.scope.bindingSha256,
      got.bindingSha256,
    );
    assert.equal(
      got.requiredAdmissions.grant.kind,
      "koios.news.cloudflare-release-grant/v2",
    );
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
test("doctor proves package-local prerequisites without claiming Cloudflare authorization", () => {
  const x = fixture();
  try {
    const missing = doctor({
      candidateDir: x.candidate,
      bindingPath: x.binding,
      environment: {},
    });
    assert.equal(missing.disposition, "no-effect");
    assert.equal(missing.toolchain.version, "4.127.1");
    assert.equal(missing.accountConfiguration.status, "missing");
    assert.equal(missing.candidateParity.status, "not-assessed");
    assert.equal(missing.cloudflareAuthorization.status, "not-checked");
    const baseline = x.grant("release").baselinePath,
      matching = doctor({
        candidateDir: x.candidate,
        bindingPath: x.binding,
        productionBaselinePath: baseline,
        environment: { CLOUDFLARE_ACCOUNT_ID: TARGET.accountId },
      });
    assert.equal(
      matching.accountConfiguration.status,
      "matches-fixed-target",
    );
    assert.equal(
      matching.candidateParity.status,
      "preserves-observed-baseline-artifacts",
    );
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
test("doctor CLI has no Cloudflare effect path", () => {
  const x = fixture();
  try {
    const result = spawnSync(process.execPath, [
      "bin/koios-news-cloudflare-release.mjs",
      "doctor",
      "--candidate",
      x.candidate,
      "--binding",
      x.binding,
    ], { encoding: "utf8", cwd: new URL("..", import.meta.url) });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.kind, "koios.news.cloudflare-release-doctor/v1");
    assert.equal(report.disposition, "no-effect");
    assert.equal(report.cloudflareAuthorization.status, "not-checked");
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
test("candidate refuses non-bytewise order and signed grant binds exact action and binding bytes", () => {
  const x = fixture();
  try {
    x.manifest.artifacts.reverse();
    writeFileSync(
      join(x.candidate, "manifest.json"),
      JSON.stringify(x.manifest),
    );
    assert.throws(() => verifyCandidate(x.candidate), /bytewise/);
    x.manifest.artifacts.reverse();
    writeFileSync(
      join(x.candidate, "manifest.json"),
      `${JSON.stringify(x.manifest)}\n`,
    );
    const grant = x.grant("preview").path;
    writeFileSync(
      x.binding,
      JSON.stringify({
        kind: "koios.news.cloudflare-release-binding/v1",
        ...TARGET,
      }),
    );
    assert.throws(
      () => {
        const releaseAdmission = x.grant("release");
        return plan({
          phase: "preview",
          candidateDir: x.candidate,
          bindingPath: x.binding,
          grantPath: grant,
          authorityKeysPath: x.keys,
          now: NOW,
          productionBaselinePath: releaseAdmission.baselinePath,
        });
      },
      /bindingSha256/,
    );
    assert.throws(
      () =>
        plan({
          phase: "release",
          candidateDir: x.candidate,
          bindingPath: x.binding,
          grantPath: grant,
          authorityKeysPath: x.keys,
          now: NOW,
          productionBaselinePath: x.grant("release").baselinePath,
        }),
      /release grant scope/,
    );
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
test("release authority rejects ambient or invalid time and weak Ed25519 encodings", () => {
  const x = fixture();
  try {
    const grant = x.grant("preview").path,
      input = {
        phase: "preview",
        candidateDir: x.candidate,
        bindingPath: x.binding,
        grantPath: grant,
        authorityKeysPath: x.keys,
      };
    assert.throws(() => plan(input), /validity window/);
    assert.throws(
      () => plan({ ...input, now: "2026-08-31T18:00:00.000Z" }),
      /validity window/,
    );
    writeFileSync(
      x.keys,
      JSON.stringify({
        cloudflare_release_test_key: Buffer.alloc(32).toString("base64url"),
      }),
    );
    assert.throws(() => plan({ ...input, now: NOW }), /non-small-order/);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
test("probe validates bounded Cloudflare preview bytes and release binds its receipt", async () => {
  const x = fixture();
  try {
    const served = new Map(
      ["manifest.json", "index.html", "news.txt"].map((
        file,
      ) => [file, readFileSync(join(x.candidate, file))]),
    );
    const out = join(x.root, "preview.json");
    const receipt = await acceptPreviewProbe({
      candidateDir: x.candidate,
      bindingPath: x.binding,
      url: "https://preview.example.workers.dev/build/",
      receiptOut: out,
      fetchImpl: async (url, options) => {
        assert.equal(options.redirect, "error");
        const file = url.pathname.endsWith("/")
          ? "index.html"
          : url.pathname.split("/").at(-1);
        const bytes = served.get(file);
        return new Response(bytes, {
          status: 200,
          headers: { "content-length": String(bytes.length) },
        });
      },
    });
    assert.equal(receipt.probe.accepted, true);
    const release = authorized(x, "release", {
      rollbackPath: x.rollback,
      previewReceiptPath: out,
    });
    assert.deepEqual(release.commands[1].args, [
      "rollback",
      "previous-version",
      "--name",
      TARGET.workerName,
    ]);
    await assert.rejects(
      () =>
        acceptPreviewProbe({
          candidateDir: x.candidate,
          bindingPath: x.binding,
          url: "https://example.test/",
          fetchImpl: async () => new Response(),
        }),
      /workers\.dev/,
    );
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
test("execution requires provider JSON readback and exact served bytes before writing success receipt", async () => {
  const x = fixture();
  try {
    const p = authorized(x, "preview"),
      receipt = join(x.root, "deployment-receipt.json"),
      replayRoot = join(x.root, "replay");
    await assert.rejects(
      () =>
        executeObservedAuthorized({
          phase: "preview",
          plan: p,
          receiptOut: receipt,
          replayRoot,
          environment: {},
          executor: () => ({ status: 0 }),
        }),
      /CLOUDFLARE_ACCOUNT_ID/,
    );
    let call;
    const environment = { CLOUDFLARE_ACCOUNT_ID: TARGET.accountId };
    await assert.rejects(
      () =>
        executeObservedAuthorized({
          phase: "preview",
          plan: {
            ...p,
            commands: [{ ...p.commands[0], program: "/tmp/caller-selected" }],
          },
          receiptOut: receipt,
          replayRoot,
          environment,
          executor: () => ({ status: 0 }),
        }),
      /authorized deployment executable/,
    );
    const served = new Map(["manifest.json", "index.html", "news.txt"].map((file) => [file, readFileSync(join(x.candidate, file))]));
    let readbacks = 0;
    const success = await executeObservedAuthorized({
      phase: "preview",
      plan: p,
      receiptOut: receipt,
      replayRoot,
      environment,
      executor: (program, args, options) => {
        call = { program, args, options };
        if (args[0] === "deployments") return readbacks++ === 0
          ? { status: 1, stdout: "", stderr: "This Worker does not exist on your account. [code: 10007]" }
          : { status: 0, stdout: JSON.stringify([{ id: "deployment-1", created_on: "2026-08-29T18:01:00.123456Z", versions: [{ version_id: "version-1", percentage: 100 }] }]) };
        return { status: 0 };
      },
      url: "https://preview.example.workers.dev/build/",
      fetchImpl: async (url) => new Response(served.get(url.pathname.endsWith("/") ? "index.html" : url.pathname.split("/").at(-1)), { status: 200 }),
    });
    assert.equal(call.program, WRANGLER);
    assert.equal(call.options.environment, environment);
    assert.equal(success.deployment.readback.versionId, "version-1");
    await assert.rejects(
      () =>
        executeObservedAuthorized({
          phase: "preview",
          plan: p,
          receiptOut: join(x.root, "second-receipt.json"),
          replayRoot,
          environment,
          executor: (_program, args) => args[0] === "deployments" ? { status: 0, stdout: "[]" } : { status: 0 }, url: "https://preview.example.workers.dev/build/",
        }),
      /already been consumed/,
    );
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

test("enqueue seals an adjacent routine candidate without granting release authority", () => {
  const x = fixture();
  try {
    const { baselinePath } = x.grant("release"), candidate = verifyCandidate(x.candidate),
      baseline = verifyProductionBaseline(baselinePath, candidate),
      routinePath = join(x.root, "routine-publication-receipt.json"),
      out = join(x.root, "pending-release.json");
    writeFileSync(routinePath, `${JSON.stringify({
      kind: "koios.news.routine-publication-receipt/v1",
      disposition: "offline-static-candidate",
      provenance: { baseline },
      staticCarrier: { package: "@causeway-services/koios-news-static-delivery-current", output: "public/" },
    })}\n`);
    const envelope = enqueuePendingRelease({ candidateDir: x.candidate, bindingPath: x.binding, productionBaselinePath: baselinePath, receiptOut: out });
    assert.equal(envelope.kind, "koios.news.cloudflare-pending-release-envelope/v1");
    assert.equal(envelope.disposition, "no-effect-no-release-authority");
    assert.equal(envelope.candidateManifestSha256, candidate.manifestDigest);
    assert.equal(envelope.productionBaselineManifestSha256, baseline.manifestSha256);
    assert.equal(statSync(out).mode & 0o777, 0o600);
    assert.throws(() => enqueuePendingRelease({ candidateDir: x.candidate, bindingPath: x.binding, productionBaselinePath: baselinePath, receiptOut: out }), /overwrite immutable receipt/u);
    writeFileSync(routinePath, `${JSON.stringify({ kind: "koios.news.routine-publication-receipt/v1", disposition: "offline-static-candidate" })}\n`);
    assert.throws(() => enqueuePendingRelease({ candidateDir: x.candidate, bindingPath: x.binding, productionBaselinePath: baselinePath }), /adjacent offline routine-publication receipt/u);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

test("legacy live-manifest schema refuses the lossy current static candidate", () => {
  const x = fixture();
  try {
    const baseline = join(x.root, "live-manifest.json");
    writeFileSync(
      baseline,
      `${
        JSON.stringify({
          kind: "koios.static-publication-manifest",
          profile: "cutover-candidate",
          authority: "non-authoritative-cutover-candidate",
          canonicalOrigin: "https://koios.news",
          routeCount: 2,
          aliasCount: 0,
          artifacts: [{
            route: "/",
            file: "index.html",
            mediaType: "text/html",
            bytes: 1,
            digest: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          }, {
            route: "/2025/02/15/retained",
            file: "2025/02/15/retained/index.html",
            mediaType: "text/html",
            bytes: 1,
            digest: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          }],
        })
      }\n`,
    );
    assert.throws(
      () => verifyProductionBaseline(baseline, verifyCandidate(x.candidate)),
      /would remove 1 production-baseline artifacts/,
    );
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});

test("current static production manifest is a valid subsequent-release baseline", () => {
  const x = fixture();
  try {
    const candidate = verifyCandidate(x.candidate),
      baseline = verifyProductionBaseline(join(x.candidate, "manifest.json"), candidate);
    assert.equal(baseline.manifestSha256, candidate.manifestDigest);
    assert.equal(baseline.artifactCount, candidate.manifest.artifacts.length);
  } finally {
    rmSync(x.root, { recursive: true, force: true });
  }
});
