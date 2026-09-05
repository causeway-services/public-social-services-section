import { createHash, createPublicKey, verify } from "node:crypto";
import {
  accessSync,
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const WRANGLER_VERSION = "4.127.1";
export const CLOUDFLARE_COMPATIBILITY_DATE = "2026-08-29";
export const WRANGLER = fileURLToPath(
  new URL("../node_modules/.bin/wrangler", import.meta.url),
);

export const TARGET = Object.freeze({
  accountId: "337e54ee6dc7d488933f473204a6d89e",
  workerName: "koios-news-primary",
  hostname: "koios.news",
  routePattern: "koios.news/*",
  effect: "cloudflare-worker-static-publication",
});
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const bytewise = (left, right) =>
  Buffer.compare(Buffer.from(left), Buffer.from(right));
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const exact = (value, expected, label) => {
  if (value !== expected) {
    throw new Error(`${label} must be ${JSON.stringify(expected)}`);
  }
};
const readJson = (path, label) => {
  const absolute = resolve(path), bytes = readFileSync(absolute);
  try {
    return { absolute, bytes, value: JSON.parse(bytes.toString("utf8")) };
  } catch {
    throw new Error(`${label} is not valid JSON: ${absolute}`);
  }
};
export function verifyPinnedWrangler() {
  const packageRoot = fileURLToPath(new URL("../", import.meta.url)),
    packageJsonPath = join(packageRoot, "node_modules", "wrangler", "package.json"),
    lockPath = join(packageRoot, "package-lock.json"),
    packageJson = readJson(packageJsonPath, "installed Wrangler package").value,
    lock = readJson(lockPath, "Cloudflare carrier package lock").value,
    locked = lock?.packages?.["node_modules/wrangler"];
  if (
    packageJson?.version !== WRANGLER_VERSION ||
    packageJson?.bin?.wrangler !== "./bin/wrangler.js" ||
    lock?.packages?.[""]?.devDependencies?.wrangler !== WRANGLER_VERSION ||
    locked?.version !== WRANGLER_VERSION ||
    locked?.bin?.wrangler !== "bin/wrangler.js" ||
    typeof locked.integrity !== "string" || locked.integrity === ""
  ) throw new Error(`Wrangler must be the package-local locked ${WRANGLER_VERSION} release`);
  accessSync(WRANGLER, constants.X_OK);
  const expected = realpathSync(join(dirname(packageJsonPath), packageJson.bin.wrangler));
  if (realpathSync(WRANGLER) !== expected) {
    throw new Error("package-local Wrangler executable does not resolve to its locked package bin");
  }
  return Object.freeze({ version: WRANGLER_VERSION, packageLockSha256: sha256(readFileSync(lockPath)) });
}
const canonicalJson = (value) => {
  if (
    value === null || typeof value === "boolean" || typeof value === "string"
  ) return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (!object(value)) {
    throw new Error("release authority accepts only finite JSON values");
  }
  return `{${
    Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    ).join(",")
  }}`;
};
const canonicalTimestamp = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
// Cloudflare deployment readbacks currently use RFC 3339 timestamps with
// microsecond precision. Keep operator-authored authority timestamps on the
// stricter canonical millisecond contract above, while accepting the
// provider's bounded UTC representation at the observation boundary.
const providerTimestamp = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/u.test(value) &&
  Number.isFinite(Date.parse(value));
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex"),
  ED25519_FIELD = (1n << 255n) - 19n,
  ED25519_ORDER = (1n << 252n) + 27742317777372353535851937790883648493n;
const ED25519_SMALL_ORDER = new Set([
  "0100000000000000000000000000000000000000000000000000000000000000",
  "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a",
  "0000000000000000000000000000000000000000000000000000000000000080",
  "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05",
  "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
  "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85",
  "0000000000000000000000000000000000000000000000000000000000000000",
  "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa",
]);
const littleEndian = (bytes) => {
  let value = 0n;
  for (let index = bytes.length - 1; index >= 0; index -= 1) {
    value = value << 8n | BigInt(bytes[index]);
  }
  return value;
};
function encoded(value, size, label) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/u.test(value)) {
    throw new Error(`${label} must be unpadded base64url`);
  }
  const bytes = Buffer.from(value, "base64url");
  if (bytes.length !== size || bytes.toString("base64url") !== value) {
    throw new Error(`${label} must encode ${size} bytes`);
  }
  return bytes;
}
function strictPoint(bytes, label) {
  const y = Buffer.from(bytes);
  y[31] &= 0x7f;
  if (
    littleEndian(y) >= ED25519_FIELD ||
    ED25519_SMALL_ORDER.has(bytes.toString("hex"))
  ) {
    throw new Error(
      `${label} is not a canonical non-small-order Ed25519 point`,
    );
  }
}
function exactShape(value, keys, label) {
  if (
    !object(value) || Object.keys(value).length !== keys.length ||
    keys.some((key) => !(key in value))
  ) throw new Error(`${label} has an invalid shape`);
}

function files(root) {
  const found = [];
  const visit = (directory) => {
    for (
      const entry of readdirSync(directory, { withFileTypes: true }).sort((
        a,
        b,
      ) => bytewise(a.name, b.name))
    ) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`candidate contains a symlink: ${path}`);
      }
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) {
        found.push({ file: relative(root, path).split(sep).join("/"), path });
      } else throw new Error(`candidate contains a non-regular entry: ${path}`);
    }
  };
  visit(root);
  return found;
}
export function verifyCandidate(candidateDir) {
  const root = resolve(candidateDir);
  if (
    !existsSync(root) || !lstatSync(root).isDirectory() ||
    lstatSync(root).isSymbolicLink()
  ) throw new Error("candidate must be a regular directory");
  const manifestPath = join(root, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("candidate lacks manifest.json");
  }
  const manifestBytes = readFileSync(manifestPath);
  let manifest;
  try {
    manifest = JSON.parse(manifestBytes.toString("utf8"));
  } catch {
    throw new Error(`candidate manifest is not valid JSON: ${manifestPath}`);
  }
  if (
    !object(manifest) ||
    manifest.kind !== "koios.news.static-publication-manifest/v1" ||
    !object(manifest.provenance) ||
    manifest.provenance.canonicalOrigin !== "https://koios.news"
  ) {
    throw new Error(
      "candidate manifest is not a static-delivery-current manifest bound to https://koios.news",
    );
  }
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
    throw new Error("candidate manifest has no artifacts");
  }
  const expected = new Set();
  let prior;
  for (const artifact of manifest.artifacts) {
    if (
      !object(artifact) || typeof artifact.file !== "string" ||
      !/^[^/]+(?:\/[^/]+)*$/u.test(artifact.file) ||
      artifact.file.includes("..") || typeof artifact.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/u.test(artifact.sha256) ||
      !Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0
    ) throw new Error("candidate manifest contains an invalid artifact entry");
    if (prior !== undefined && bytewise(prior, artifact.file) >= 0) {
      throw new Error(
        "candidate manifest artifacts must be in strict bytewise path order",
      );
    }
    prior = artifact.file;
    if (expected.has(artifact.file)) {
      throw new Error(`candidate manifest lists ${artifact.file} twice`);
    }
    expected.add(artifact.file);
    const path = resolve(root, artifact.file);
    if (
      !path.startsWith(`${root}${sep}`) || !existsSync(path) ||
      !lstatSync(path).isFile() || lstatSync(path).isSymbolicLink()
    ) {
      throw new Error(
        `candidate artifact is missing or unsafe: ${artifact.file}`,
      );
    }
    const bytes = readFileSync(path);
    if (bytes.length !== artifact.bytes || sha256(bytes) !== artifact.sha256) {
      throw new Error(
        `candidate artifact digest does not match: ${artifact.file}`,
      );
    }
  }
  const actual = new Set(
    files(root).map(({ file }) => file).filter((file) =>
      file !== "manifest.json"
    ),
  );
  if (
    actual.size !== expected.size ||
    [...actual].some((file) => !expected.has(file))
  ) throw new Error("candidate contains files not sealed by its manifest");
  return Object.freeze({
    root,
    manifestBytes,
    manifestDigest: sha256(manifestBytes),
    artifactCount: expected.size,
    manifest,
  });
}
export function verifyBinding(bindingPath) {
  const binding = readJson(bindingPath, "release binding");
  if (
    !object(binding.value) ||
    binding.value.kind !== "koios.news.cloudflare-release-binding/v1"
  ) throw new Error("release binding has the wrong kind");
  for (const [key, value] of Object.entries(TARGET)) {
    exact(binding.value[key], value, `binding.${key}`);
  }
  return Object.freeze({ ...binding, digest: sha256(binding.bytes) });
}
export function verifyGrant(
  grantPath,
  authorityKeysPath,
  candidate,
  binding,
  phase,
  now,
  baseline,
) {
  const source = readJson(grantPath, "release grant"), grant = source.value;
  if (`${canonicalJson(grant)}\n` !== source.bytes.toString("utf8")) {
    throw new Error("release grant is not canonical exact bytes");
  }
  exactShape(grant, [
    "admission",
    "expiresAt",
    "grantId",
    "issuedAt",
    "issuerKeyId",
    "kind",
    "scope",
    "signature",
  ], "release grant");
  if (
    grant.kind !== "koios.news.cloudflare-release-grant/v2" ||
    !/^[A-Za-z0-9_-]{16,128}$/u.test(grant.grantId ?? "")
  ) throw new Error("release grant has the wrong kind or id");
  if (
    !canonicalTimestamp(now) || !canonicalTimestamp(grant.issuedAt) ||
    !canonicalTimestamp(grant.expiresAt) ||
    Date.parse(grant.issuedAt) > Date.parse(now) ||
    Date.parse(grant.expiresAt) <= Date.parse(now)
  ) throw new Error("release grant is outside its explicit validity window");
  exactShape(
    grant.admission,
    ["kind", "verifiedProviderAuthority"],
    "release grant admission",
  );
  exact(
    grant.admission.kind,
    "local-operator-admission",
    "grant.admission.kind",
  );
  exact(
    grant.admission.verifiedProviderAuthority,
    false,
    "grant.admission.verifiedProviderAuthority",
  );
  exactShape(
    grant.scope,
    phase === "release"
      ? [
        "action",
        "baselineManifestSha256",
        "bindingSha256",
        "candidateManifestSha256",
        "target",
      ]
      : ["action", "bindingSha256", "candidateManifestSha256", "target"],
    "release grant scope",
  );
  exact(grant.scope.action, phase, "grant.scope.action");
  exact(
    grant.scope.candidateManifestSha256,
    candidate.manifestDigest,
    "grant.scope.candidateManifestSha256",
  );
  exact(grant.scope.bindingSha256, binding.digest, "grant.scope.bindingSha256");
  if (phase === "release") {
    exact(
      grant.scope.baselineManifestSha256,
      baseline?.manifestSha256,
      "grant.scope.baselineManifestSha256",
    );
  }
  exactShape(grant.scope.target, Object.keys(TARGET), "release grant target");
  for (const [key, value] of Object.entries(TARGET)) {
    exact(grant.scope.target[key], value, `grant.scope.target.${key}`);
  }
  const keys = readJson(authorityKeysPath, "release authority keys").value,
    publicKey = encoded(
      keys?.[grant.issuerKeyId],
      32,
      "release authority public key",
    ),
    signature = encoded(grant.signature, 64, "release grant signature");
  strictPoint(publicKey, "release authority public key");
  strictPoint(signature.subarray(0, 32), "release grant signature R");
  if (littleEndian(signature.subarray(32)) >= ED25519_ORDER) {
    throw new Error("release grant signature scalar is noncanonical");
  }
  const { signature: omitted, ...unsigned } = grant;
  const key = createPublicKey({
    key: Buffer.concat([ED25519_SPKI_PREFIX, publicKey]),
    format: "der",
    type: "spki",
  });
  if (
    !verify(null, Buffer.from(canonicalJson(unsigned), "utf8"), key, signature)
  ) throw new Error("release grant signature is invalid");
  return Object.freeze({
    grant,
    digest: sha256(source.bytes),
    consumptionId: `grant-${grant.grantId}`,
  });
}
export function verifyRollback(rollbackPath, binding) {
  const rollback = readJson(rollbackPath, "rollback binding").value;
  if (
    !object(rollback) ||
    rollback.kind !== "koios.news.cloudflare-rollback-binding/v1"
  ) throw new Error("rollback binding has the wrong kind");
  for (const [key, value] of Object.entries(TARGET)) {
    exact(rollback[key], value, `rollback.${key}`);
  }
  exact(rollback.bindingSha256, binding.digest, "rollback.bindingSha256");
  if (
    typeof rollback.priorVersionId !== "string" ||
    rollback.priorVersionId.length < 1
  ) throw new Error("rollback.priorVersionId is required");
  return Object.freeze(rollback);
}
/** Read the observed production manifest as evidence, never as a deployment input. */
export function verifyProductionBaseline(path, candidate) {
  if (typeof path !== "string" || path.length === 0) {
    throw new Error("release requires an explicit production baseline manifest");
  }
  const absolute = resolve(path);
  if (
    !existsSync(absolute) || lstatSync(absolute).isSymbolicLink() ||
    !lstatSync(absolute).isFile()
  ) throw new Error("production baseline must be a real regular file");
  const source = readJson(path, "production baseline manifest"),
    baseline = source.value;
  if (object(baseline) && baseline.kind === "koios.news.static-publication-manifest/v1") {
    if (!Array.isArray(baseline.artifacts) || baseline.artifacts.length === 0) {
      throw new Error("current production baseline has no sealed artifacts");
    }
    const required = new Set();
    for (const artifact of baseline.artifacts) {
      if (!object(artifact) || Object.keys(artifact).length !== 3 ||
        !["bytes", "file", "sha256"].every((key) => Object.hasOwn(artifact, key)) ||
        typeof artifact.file !== "string" || !/^[^/]+(?:\/[^/]+)*$/u.test(artifact.file) ||
        artifact.file.includes("..") || !Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0 ||
        typeof artifact.sha256 !== "string" || !/^[a-f0-9]{64}$/u.test(artifact.sha256)) {
        throw new Error("current production baseline contains an unsafe sealed artifact");
      }
      if (required.has(artifact.file)) throw new Error(`production baseline lists ${artifact.file} twice`);
      required.add(artifact.file);
    }
    const candidateFiles = new Set(candidate.manifest.artifacts.map((artifact) => artifact.file)),
      missing = [...required].filter((file) => !candidateFiles.has(file));
    if (missing.length > 0) throw new Error(`candidate would remove ${missing.length} production-baseline artifacts (first: ${missing[0]})`);
    return Object.freeze({ manifestSha256: sha256(source.bytes), artifactCount: required.size });
  }
  if (
    !object(baseline) ||
    baseline.kind !== "koios.static-publication-manifest" ||
    baseline.profile !== "cutover-candidate" ||
    baseline.authority !== "non-authoritative-cutover-candidate" ||
    baseline.canonicalOrigin !== "https://koios.news" ||
    !Array.isArray(baseline.artifacts) || baseline.artifacts.length === 0 ||
    !Number.isSafeInteger(baseline.routeCount) ||
    baseline.routeCount < 1 || baseline.routeCount > baseline.artifacts.length ||
    !Number.isSafeInteger(baseline.aliasCount) || baseline.aliasCount < 0
  ) {
    throw new Error(
      "production baseline is not a supported koios.static-publication-manifest",
    );
  }
  const required = new Set();
  for (const artifact of baseline.artifacts) {
    if (
      !object(artifact) ||
      Object.keys(artifact).length !== 5 ||
      !["bytes", "digest", "file", "mediaType", "route"].every((key) =>
        Object.hasOwn(artifact, key)
      ) ||
      typeof artifact.file !== "string" ||
      !/^[^/]+(?:\/[^/]+)*$/u.test(artifact.file) ||
      artifact.file.includes("..") ||
      typeof artifact.route !== "string" || artifact.route.length === 0 ||
      typeof artifact.mediaType !== "string" || artifact.mediaType.length === 0 ||
      !Number.isSafeInteger(artifact.bytes) || artifact.bytes < 0 ||
      typeof artifact.digest !== "string" ||
      !/^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u.test(artifact.digest)
    ) {
      throw new Error(
        "production baseline contains an unsafe artifact file path",
      );
    }
    if (required.has(artifact.file)) {
      throw new Error(`production baseline lists ${artifact.file} twice`);
    }
    required.add(artifact.file);
  }
  const candidateFiles = new Set(
      candidate.manifest.artifacts.map((artifact) => artifact.file),
    ),
    missing = [...required].filter((file) => !candidateFiles.has(file));
  if (missing.length > 0) {
    throw new Error(
      `candidate would remove ${missing.length} production-baseline artifacts (first: ${
        missing[0]
      })`,
    );
  }
  return Object.freeze({
    manifestSha256: sha256(source.bytes),
    artifactCount: required.size,
  });
}
/**
 * Prove local release prerequisites without invoking Wrangler or inspecting
 * provider credentials. Cloudflare authentication remains provider-side
 * evidence and is intentionally outside this no-effect check.
 */
export function doctor(
  { candidateDir, bindingPath, productionBaselinePath, environment = process.env },
) {
  const candidate = verifyCandidate(candidateDir),
    binding = verifyBinding(bindingPath),
    toolchain = verifyPinnedWrangler(),
    accountConfiguration = environment.CLOUDFLARE_ACCOUNT_ID === undefined
      ? "missing"
      : environment.CLOUDFLARE_ACCOUNT_ID === TARGET.accountId
      ? "matches-fixed-target"
      : "does-not-match-fixed-target";
  const parity = productionBaselinePath === undefined
    ? {
      status: "not-assessed",
      reason:
        "release continuity requires an explicit observed production baseline",
    }
    : {
      status: "preserves-observed-baseline-artifacts",
      ...verifyProductionBaseline(productionBaselinePath, candidate),
    };
  return Object.freeze({
    kind: "koios.news.cloudflare-release-doctor/v1",
    disposition: "no-effect",
    toolchain,
    candidate: {
      manifestSha256: candidate.manifestDigest,
      artifactCount: candidate.artifactCount,
    },
    binding: TARGET,
    bindingSha256: binding.digest,
    accountConfiguration: {
      environment: "CLOUDFLARE_ACCOUNT_ID",
      expectedAccountId: TARGET.accountId,
      status: accountConfiguration,
    },
    candidateParity: parity,
    cloudflareAuthorization: {
      status: "not-checked",
      reason:
        "Doctor does not invoke Wrangler, read credentials, or contact Cloudflare; it cannot establish or deny Cloudflare authentication or authorization.",
    },
  });
}
/** Create offline handoff evidence only; this is deliberately not release authority. */
export function enqueuePendingRelease({ candidateDir, bindingPath, productionBaselinePath, receiptOut }) {
  const candidate = verifyCandidate(candidateDir), binding = verifyBinding(bindingPath),
    baseline = verifyProductionBaseline(productionBaselinePath, candidate),
    routineRoot = resolve(candidateDir, ".."),
    routinePath = join(routineRoot, "routine-publication-receipt.json"),
    routine = readJson(routinePath, "routine publication receipt");
  if (lstatSync(routinePath).isSymbolicLink() || !lstatSync(routinePath).isFile() ||
    !object(routine.value) || routine.value.kind !== "koios.news.routine-publication-receipt/v1" ||
    routine.value.disposition !== "offline-static-candidate" ||
    routine.value.staticCarrier?.package !== "@causeway-services/koios-news-static-delivery-current" ||
    routine.value.staticCarrier?.output !== "public/" ||
    !object(routine.value.provenance?.baseline) ||
    routine.value.provenance.baseline.manifestSha256 !== baseline.manifestSha256 ||
    routine.value.provenance.baseline.artifactCount !== baseline.artifactCount) {
    throw new Error("pending release requires the adjacent offline routine-publication receipt");
  }
  return receiptPath(receiptOut, {
    kind: "koios.news.cloudflare-pending-release-envelope/v1",
    disposition: "no-effect-no-release-authority",
    candidateManifestSha256: candidate.manifestDigest,
    bindingSha256: binding.digest,
    productionBaselineManifestSha256: baseline.manifestSha256,
    routinePublicationReceiptSha256: sha256(routine.bytes),
    limitations: ["This envelope grants no Cloudflare preview, release, rollback, or provider authority."],
  });
}
const command = (program, args) =>
  Object.freeze({
    program,
    args: Object.freeze(args),
    credentialPolicy:
      "Cloudflare credentials are read only by the child process; this carrier never prints environment values or command output.",
  });
function receiptPath(path, receipt) {
  if (!path) return Object.freeze(receipt);
  const target = resolve(path);
  if (existsSync(target)) {
    throw new Error(`refusing to overwrite immutable receipt: ${target}`);
  }
  mkdirSync(resolve(target, ".."), { recursive: true });
  writeFileSync(target, `${JSON.stringify(receipt, null, 2)}\n`, {
    mode: 0o600,
    flag: "wx",
  });
  return Object.freeze({ ...receipt, receiptPath: target });
}
const deploy = (candidate, name, route) =>
  command(WRANGLER, [
    "deploy",
    "--name",
    name,
    "--compatibility-date",
    CLOUDFLARE_COMPATIBILITY_DATE,
    "--assets",
    candidate.root,
    ...(route ? ["--route", route] : []),
  ]);
function previewReceipt(path, candidate, binding) {
  const preview = readJson(path, "preview receipt"), receipt = preview.value;
  if (
    !object(receipt) ||
    receipt.kind !== "koios.news.cloudflare-preview-receipt/v1"
  ) throw new Error("release requires a preview probe receipt");
  exact(
    receipt.candidateManifestSha256,
    candidate.manifestDigest,
    "preview receipt candidate",
  );
  exact(receipt.bindingSha256, binding.digest, "preview receipt binding");
  if (!object(receipt.binding)) {
    throw new Error("preview receipt lacks its full target binding");
  }
  for (const [key, value] of Object.entries(TARGET)) {
    exact(receipt.binding[key], value, `preview receipt binding.${key}`);
  }
  if (!object(receipt.probe) || receipt.probe.accepted !== true) {
    throw new Error(
      "release requires an accepted preview receipt for this exact candidate and binding",
    );
  }
  safeUrl(receipt.probe.url);
  exact(
    receipt.probe.candidateManifestSha256,
    candidate.manifestDigest,
    "preview probe candidate",
  );
  exact(receipt.probe.bindingSha256, binding.digest, "preview probe binding");
  exact(
    receipt.probe.manifestSha256,
    candidate.manifestDigest,
    "preview probe manifest",
  );
  if (
    !Array.isArray(receipt.probe.artifacts) ||
    receipt.probe.artifacts.length === 0
  ) throw new Error("preview probe lacks representative sealed assets");
  return sha256(preview.bytes);
}
export function plan(
  {
    phase = "plan",
    candidateDir,
    bindingPath,
    grantPath,
    authorityKeysPath,
    now,
    rollbackPath,
    previewReceiptPath,
    productionBaselinePath,
  },
) {
  const candidate = verifyCandidate(candidateDir),
    binding = verifyBinding(bindingPath);
  const grantTemplate = {
    admission: {
      kind: "local-operator-admission",
      verifiedProviderAuthority: false,
    },
    expiresAt: "<future-canonical-UTC-instant>",
    grantId: "<unique-operator-supplied-id>",
    issuedAt: "<canonical-UTC-instant>",
    issuerKeyId: "<independently-configured-key-id>",
    kind: "koios.news.cloudflare-release-grant/v2",
    scope: {
      action: "<preview-or-release>",
      bindingSha256: binding.digest,
      candidateManifestSha256: candidate.manifestDigest,
      target: TARGET,
    },
    signature: "<Ed25519-signature-over-canonical-unsigned-object>",
  };
  const base = {
    kind: "koios.news.cloudflare-release-plan/v2",
    phase,
    candidate: {
      manifestSha256: candidate.manifestDigest,
      artifactCount: candidate.artifactCount,
    },
    binding: TARGET,
    bindingSha256: binding.digest,
    immutableReceipt: true,
    accountVerification: {
      environment: "CLOUDFLARE_ACCOUNT_ID",
      expectedAccountId: TARGET.accountId,
    },
    requiredAdmissions: {
      grant: grantTemplate,
      rollback: {
        kind: "koios.news.cloudflare-rollback-binding/v1",
        ...TARGET,
        bindingSha256: binding.digest,
        priorVersionId: "<current-production-version-id>",
      },
    },
  };
  if (phase === "plan") {
    return Object.freeze({
      ...base,
      disposition: "dry-run",
      commands: [
        deploy(
          candidate,
          `${TARGET.workerName}-preview-${
            candidate.manifestDigest.slice(0, 12)
          }`,
        ),
        deploy(candidate, TARGET.workerName, TARGET.routePattern),
        command(WRANGLER, [
          "rollback",
          "<priorVersionId>",
          "--name",
          TARGET.workerName,
        ]),
      ],
      refusal:
        "No Cloudflare process is started. Preview and release require separate signed, exact-action grants and durable one-use consumption.",
    });
  }
  if (!["preview", "release"].includes(phase)) {
    throw new Error(`unknown phase: ${phase}`);
  }
  const baseline = phase === "release"
    ? verifyProductionBaseline(productionBaselinePath, candidate)
    : undefined;
  const authority = verifyGrant(
    grantPath,
    authorityKeysPath,
    candidate,
    binding,
    phase,
    now,
    baseline,
  );
  if (phase === "preview") {
    return Object.freeze({
      ...base,
      disposition: "preview-authorized",
      grantId: authority.grant.grantId,
      grantDigest: authority.digest,
      consumptionId: authority.consumptionId,
      commands: [
        deploy(
          candidate,
          `${TARGET.workerName}-preview-${
            candidate.manifestDigest.slice(0, 12)
          }`,
        ),
      ],
      next:
        "Use the create-only probe command with an explicit safe HTTPS preview URL before release.",
    });
  }
  const rollback = verifyRollback(rollbackPath, binding),
    probeDigest = previewReceipt(previewReceiptPath, candidate, binding);
  return Object.freeze({
    ...base,
    disposition: "release-authorized",
    grantId: authority.grant.grantId,
    grantDigest: authority.digest,
    consumptionId: authority.consumptionId,
    previewReceiptSha256: probeDigest,
    productionBaselineManifestSha256: baseline.manifestSha256,
    rollback: { priorVersionId: rollback.priorVersionId },
    commands: [
      deploy(candidate, TARGET.workerName, TARGET.routePattern),
      command(WRANGLER, [
        "rollback",
        rollback.priorVersionId,
        "--name",
        TARGET.workerName,
      ]),
    ],
  });
}
function consume(replayRoot, releasePlan) {
  if (typeof replayRoot !== "string" || replayRoot.length === 0) {
    throw new Error("durable replay root is required before execution");
  }
  const root = resolve(replayRoot);
  mkdirSync(root, { recursive: true, mode: 0o700 });
  if (lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory()) {
    throw new Error("replay root must be a regular directory");
  }
  const path = join(root, `${releasePlan.consumptionId}.json`);
  let fd;
  try {
    fd = openSync(path, "wx", 0o600);
    const bytes = Buffer.from(`${
      JSON.stringify({
        kind: "koios.news.cloudflare-release-authority-use/v1",
        consumptionId: releasePlan.consumptionId,
        grantDigest: releasePlan.grantDigest,
        phase: releasePlan.phase,
        candidateManifestSha256: releasePlan.candidate.manifestSha256,
        bindingSha256: releasePlan.bindingSha256,
        ...(releasePlan.phase === "release"
          ? {
            productionBaselineManifestSha256:
              releasePlan.productionBaselineManifestSha256,
          }
          : {}),
      })
    }\n`);
    writeSync(fd, bytes);
    fsyncSync(fd);
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw new Error("release authority use has already been consumed");
    }
    throw error;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
  const directory = openSync(root, "r");
  try {
    fsyncSync(directory);
  } finally {
    closeSync(directory);
  }
  return path;
}
function deploymentReadback(name) {
  return command(WRANGLER, ["deployments", "list", "--name", name, "--json"]);
}
function providerDeployments(result, { allowAbsent = false } = {}) {
  if (!result || result.status !== 0 || typeof result.stdout !== "string") {
    if (allowAbsent && result?.status === 1 && typeof result.stderr === "string" && /\[code:\s*10007\]/u.test(result.stderr)) return [];
    throw new Error("Cloudflare deployment readback failed");
  }
  let parsed;
  try { parsed = JSON.parse(result.stdout); } catch {
    throw new Error("Cloudflare deployment readback was not machine-readable JSON");
  }
  const deployments = Array.isArray(parsed) ? parsed : parsed?.deployments;
  if (!Array.isArray(deployments)) throw new Error("Cloudflare deployment readback is not a deployment list");
  for (const entry of deployments) {
    if (!object(entry) || typeof entry.id !== "string" || entry.id.length < 1 ||
      !providerTimestamp(entry.created_on) || !Array.isArray(entry.versions) ||
      entry.versions.length < 1 || entry.versions.some((version) =>
        !object(version) || typeof version.version_id !== "string" || version.version_id.length < 1 ||
        typeof version.percentage !== "number" || !Number.isFinite(version.percentage))) {
      throw new Error("Cloudflare deployment readback contains an invalid deployment");
    }
  }
  return deployments;
}
function observedProviderDeployment(before, after) {
  const priorIds = new Set(before.map(({ id }) => id));
  const created = after.filter(({ id }) => !priorIds.has(id));
  if (created.length !== 1) throw new Error("Cloudflare readback did not identify exactly one new deployment");
  const entry = created[0], active = entry.versions.filter(({ percentage }) => percentage === 100);
  if (entry.versions.length !== 1 || active.length !== 1) {
    throw new Error("new Cloudflare deployment is not one exact 100 percent version");
  }
  return Object.freeze({ deploymentId: entry.id, versionId: active[0].version_id, createdOn: entry.created_on });
}
function observationUrl(value, phase) {
  if (phase === "preview") return safeUrl(value);
  let url;
  try { url = new URL(value); } catch { throw new Error("release observation URL must be https://koios.news/"); }
  if (url.href !== "https://koios.news/") {
    throw new Error("release observation URL must be exactly https://koios.news/");
  }
  return url;
}
async function observeExactDeployment(candidate, binding, url, phase, fetchImpl) {
  const base = observationUrl(url, phase), manifestBytes = await fetchExact(
    base, "manifest.json", candidate.manifestBytes.length, fetchImpl,
  );
  if (!manifestBytes.equals(candidate.manifestBytes)) {
    throw new Error("served manifest bytes do not match the exact candidate");
  }
  const artifacts = [];
  for (const artifact of candidate.manifest.artifacts) {
    if (artifact.file === "_headers") {
      artifacts.push({ ...artifact, observation: "cloudflare-deployment-config-not-public-asset" });
      continue;
    }
    if (phase === "release" && artifact.file === "robots.txt") {
      const bytes = await fetchObserved(base, artifact.file, 64 * 1024, fetchImpl);
      artifacts.push({ ...artifact, observation: "cloudflare-managed-content", observedSha256: sha256(bytes), observedBytes: bytes.length });
      continue;
    }
    const bytes = await fetchExact(base, artifact.file, artifact.bytes, fetchImpl);
    if (!bytes.equals(readFileSync(join(candidate.root, artifact.file)))) {
      throw new Error(`served sealed artifact bytes do not match: ${artifact.file}`);
    }
    artifacts.push({ file: artifact.file, sha256: artifact.sha256, bytes: artifact.bytes });
  }
  return Object.freeze({ accepted: true, url: base.toString(), candidateManifestSha256: candidate.manifestDigest,
    bindingSha256: binding.digest, manifestSha256: sha256(manifestBytes), artifacts });
}
export async function executeObservedAuthorized(
  { phase, plan: releasePlan, receiptOut, replayRoot, environment = process.env,
    executor, url, fetchImpl = fetch },
) {
  const disposition = phase === "preview" ? "preview-authorized" : phase === "release" ? "release-authorized" : undefined;
  if (!releasePlan || releasePlan.phase !== phase || releasePlan.disposition !== disposition) throw new Error("only an exact-phase authorized preview or release plan can execute");
  if (!receiptOut || existsSync(resolve(receiptOut))) throw new Error("a new immutable receipt path is required before execution");
  exact(environment.CLOUDFLARE_ACCOUNT_ID, TARGET.accountId, "CLOUDFLARE_ACCOUNT_ID");
  const deployment = releasePlan.commands?.[0];
  exact(deployment?.program, WRANGLER, "authorized deployment executable");
  const toolchain = executor === undefined ? verifyPinnedWrangler() : Object.freeze({ version: WRANGLER_VERSION, injectedExecutor: true });
  const nameIndex = deployment.args.indexOf("--name"), deployedName = deployment.args[nameIndex + 1],
    expectedName = phase === "release" ? TARGET.workerName : `${TARGET.workerName}-preview-${releasePlan.candidate.manifestSha256.slice(0, 12)}`;
  exact(deployedName, expectedName, "authorized deployment worker name");
  const run = executor ?? ((program, args, options) => spawnSync(program, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: options.environment })),
    readbackCommand = deploymentReadback(deployedName),
    before = providerDeployments(run(readbackCommand.program, readbackCommand.args, { environment }), { allowAbsent: phase === "preview" }),
    authorityUsePath = consume(replayRoot, releasePlan);
  const deployed = run(deployment.program, deployment.args, { environment });
  if (!deployed || deployed.status !== 0) throw new Error(`Cloudflare command failed after one-use authority consumption without exposing its output (status=${deployed?.status ?? "unknown"}, authorityUse=${authorityUsePath})`);
  const after = providerDeployments(run(readbackCommand.program, readbackCommand.args, { environment })),
    provider = observedProviderDeployment(before, after);
  const candidate = { root: deployment.args[deployment.args.indexOf("--assets") + 1], manifestDigest: releasePlan.candidate.manifestSha256, manifestBytes: readFileSync(join(deployment.args[deployment.args.indexOf("--assets") + 1], "manifest.json")), manifest: verifyCandidate(deployment.args[deployment.args.indexOf("--assets") + 1]).manifest };
  const binding = { digest: releasePlan.bindingSha256 };
  const probe = await observeExactDeployment(candidate, binding, url, phase, fetchImpl);
  return receiptPath(receiptOut, {
    kind: phase === "preview"
      ? "koios.news.cloudflare-preview-deployment-receipt/v1"
      : "koios.news.cloudflare-release-receipt/v1",
    candidateManifestSha256: releasePlan.candidate.manifestSha256,
    binding: TARGET,
    bindingSha256: releasePlan.bindingSha256,
    grantId: releasePlan.grantId,
    grantDigest: releasePlan.grantDigest,
    authorityUsePath,
    ...(phase === "release"
      ? {
        previewReceiptSha256: releasePlan.previewReceiptSha256,
        productionBaselineManifestSha256:
          releasePlan.productionBaselineManifestSha256,
        rollback: releasePlan.rollback,
      }
      : {}),
    deployment: { command: deployment.args, readback: { command: readbackCommand.args, ...provider } },
    toolchain,
    probe,
  });
}
function safeUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "probe URL must be an absolute HTTPS Cloudflare preview URL",
    );
  }
  if (
    url.protocol !== "https:" || url.username || url.password || url.port ||
    url.search || url.hash || !url.hostname.endsWith(".workers.dev") ||
    url.hostname === "workers.dev" || !url.pathname.endsWith("/")
  ) {
    throw new Error(
      "probe URL must be an HTTPS *.workers.dev directory URL without credentials, port, query, or fragment",
    );
  }
  return url;
}
function servedAssetPath(file) {
  if (file === "index.html") return "";
  if (file === "404.html") return "404";
  return file.endsWith("/index.html")
    ? file.slice(0, -"index.html".length)
    : file;
}
async function fetchObserved(base, file, maximumBytes, fetchImpl) {
  const url = new URL(servedAssetPath(file), base), response = await fetchImpl(url, {
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response?.ok) throw new Error(`probe fetch failed for ${file}: HTTP ${response?.status ?? "unknown"}`);
  if (typeof response.url === "string" && response.url !== "" && response.url !== url.href) throw new Error(`probe response URL changed for ${file}`);
  const contentLength = response.headers?.get?.("content-length");
  if (contentLength !== null && contentLength !== undefined && Number(contentLength) > maximumBytes) throw new Error(`probe response exceeds the provider-managed byte bound for ${file}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > maximumBytes) throw new Error(`probe response exceeds the provider-managed byte bound for ${file}`);
  return bytes;
}
async function fetchExact(base, file, expectedBytes, fetchImpl) {
  // Workers Static Assets canonicalizes directory indexes and redirects
  // requests ending in `/index.html`. Probe the canonical route directly so
  // redirect refusal remains meaningful instead of rejecting correct assets.
  const servedPath = servedAssetPath(file);
  const url = new URL(servedPath, base),
    response = await fetchImpl(url, {
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
  if (!response?.ok) {
    throw new Error(
      `probe fetch failed for ${file}: HTTP ${response?.status ?? "unknown"}`,
    );
  }
  if (
    typeof response.url === "string" && response.url !== "" &&
    response.url !== url.href
  ) throw new Error(`probe response URL changed for ${file}`);
  const contentLength = response.headers?.get?.("content-length");
  if (
    contentLength !== null && contentLength !== undefined &&
    Number(contentLength) > expectedBytes
  ) {
    throw new Error(
      `probe response exceeds the sealed byte length for ${file}`,
    );
  }
  let bytes;
  if (response.body?.getReader) {
    const reader = response.body.getReader(), chunks = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > expectedBytes) {
          throw new Error(
            `probe response exceeds the sealed byte length for ${file}`,
          );
        }
        chunks.push(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }
    bytes = Buffer.concat(chunks, total);
  } else bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== expectedBytes) {
    throw new Error(`probe response byte length does not match for ${file}`);
  }
  return bytes;
}
export async function acceptPreviewProbe(
  { candidateDir, bindingPath, url, receiptOut, fetchImpl = fetch },
) {
  const candidate = verifyCandidate(candidateDir),
    binding = verifyBinding(bindingPath),
    base = safeUrl(url);
  const manifestBytes = await fetchExact(
    base,
    "manifest.json",
    candidate.manifestBytes.length,
    fetchImpl,
  );
  if (!manifestBytes.equals(candidate.manifestBytes)) {
    throw new Error("served manifest bytes do not match the exact candidate");
  }
  const listed = candidate.manifest.artifacts,
    representative = [
      ...new Set([
        listed[0],
        listed[Math.floor(listed.length / 2)],
        listed.at(-1),
      ]),
    ],
    artifacts = [];
  for (const artifact of representative) {
    const bytes = await fetchExact(
      base,
      artifact.file,
      artifact.bytes,
      fetchImpl,
    );
    if (sha256(bytes) !== artifact.sha256) {
      throw new Error(
        `served sealed artifact does not match: ${artifact.file}`,
      );
    }
    artifacts.push({
      file: artifact.file,
      sha256: artifact.sha256,
      bytes: artifact.bytes,
    });
  }
  return receiptPath(receiptOut, {
    kind: "koios.news.cloudflare-preview-receipt/v1",
    candidateManifestSha256: candidate.manifestDigest,
    binding: TARGET,
    bindingSha256: binding.digest,
    probe: {
      accepted: true,
      url: base.toString(),
      candidateManifestSha256: candidate.manifestDigest,
      bindingSha256: binding.digest,
      manifestSha256: sha256(manifestBytes),
      artifacts,
    },
  });
}
