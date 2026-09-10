#!/usr/bin/env node
import {
  attachExternalSignature,
  formCloudflareGrant,
  formCloudflareRollbackBinding,
  formEditorialGrant,
  formFirstPostHandoff,
  formRoutineEnvironment,
  formRoutineJob,
  readTrustedKeyMap,
  summarizeArtifact,
  verifyCloudflareArtifact,
  verifyEditorialArtifact,
  writeCreateOnly,
} from "../src/authority-ceremony.mjs";
import {
  verifyBinding,
  verifyRollback,
} from "../../../cloudflare-release-current/src/carrier.mjs";

const usage = `Usage:
  koios-news-authority-ceremony editorial-template --draft FILE --slug SLUG --grant-id ID --issuer-key-id ID --issued-at UTC --expires-at UTC --out FILE
  koios-news-authority-ceremony first-post-handoff --draft FILE --slug SLUG --out FILE
  koios-news-authority-ceremony cloudflare-template --candidate DIR --binding FILE --action preview|release [--production-baseline FILE] --grant-id ID --issuer-key-id ID --issued-at UTC --expires-at UTC --out FILE
  koios-news-authority-ceremony rollback-binding --binding FILE --prior-version-id ID --out FILE
  koios-news-authority-ceremony attach --kind editorial|cloudflare --unsigned FILE --signature BASE64URL --authority-keys FILE --out FILE
  koios-news-authority-ceremony validate-keys --authority-keys FILE
  koios-news-authority-ceremony verify-editorial --grant FILE --authority-keys FILE --draft FILE --slug SLUG --now UTC
  koios-news-authority-ceremony verify-cloudflare --grant FILE --authority-keys FILE --candidate DIR --binding FILE --action preview|release --now UTC [--production-baseline FILE]
  koios-news-authority-ceremony routine-job --content DIR --draft FILE --admission FILE --grant FILE [--assessment-receipt FILE] --candidate-name NAME --job-id ID --out FILE
  koios-news-authority-ceremony routine-env (--job FILE | --queue DIR) --authority-keys FILE --assessment-keys FILE --baseline-root DIR --output-root DIR --replay-root DIR --out FILE
`;
const command = process.argv[2];
if (!command || command === "--help" || command === "-h") {
  process.stdout.write(usage);
  process.exit(command ? 0 : 2);
}
const values = new Map();
for (let index = 3; index < process.argv.length; index += 1) {
  const flag = process.argv[index];
  if (!flag.startsWith("--")) throw new Error(`unknown argument: ${flag}`);
  const value = process.argv[++index];
  if (!value || value.startsWith("--")) {
    throw new Error(`missing value for ${flag}`);
  }
  values.set(flag, value);
}
const get = (flag) => {
  const value = values.get(flag);
  if (!value) throw new Error(`missing required ${flag}`);
  return value;
};
try {
  let artifact;
  if (command === "editorial-template") {
    artifact = formEditorialGrant({
      draftPath: get("--draft"),
      manuscriptSlug: get("--slug"),
      grantId: get("--grant-id"),
      issuerKeyId: get("--issuer-key-id"),
      issuedAt: get("--issued-at"),
      expiresAt: get("--expires-at"),
    });
  } else if (command === "first-post-handoff") {
    artifact = formFirstPostHandoff({
      draftPath: get("--draft"),
      manuscriptSlug: get("--slug"),
    });
  } else if (command === "cloudflare-template") {
    artifact = formCloudflareGrant({
      candidateDir: get("--candidate"),
      bindingPath: get("--binding"),
      action: get("--action"),
      productionBaselinePath: values.get("--production-baseline"),
      grantId: get("--grant-id"),
      issuerKeyId: get("--issuer-key-id"),
      issuedAt: get("--issued-at"),
      expiresAt: get("--expires-at"),
    });
  } else if (command === "rollback-binding") {
    artifact = formCloudflareRollbackBinding({
      bindingPath: get("--binding"),
      priorVersionId: get("--prior-version-id"),
    });
  } else if (command === "attach") {
    artifact = attachExternalSignature({
      kind: get("--kind"),
      unsignedPath: get("--unsigned"),
      signature: get("--signature"),
      authorityKeysPath: get("--authority-keys"),
    });
  } else if (command === "validate-keys") {
    const keys = readTrustedKeyMap(get("--authority-keys"));
    process.stdout.write(
      `${
        JSON.stringify({ validated: true, keyIds: Object.keys(keys) }, null, 2)
      }\n`,
    );
    process.exit(0);
  } else if (command === "verify-editorial") {
    const verified = verifyEditorialArtifact({
      grantPath: get("--grant"),
      authorityKeysPath: get("--authority-keys"),
      draftPath: get("--draft"),
      manuscriptSlug: get("--slug"),
      now: get("--now"),
    });
    process.stdout.write(
      `${JSON.stringify({ verified: true, ...verified }, null, 2)}\n`,
    );
    process.exit(0);
  } else if (command === "verify-cloudflare") {
    const verified = verifyCloudflareArtifact({
      grantPath: get("--grant"),
      authorityKeysPath: get("--authority-keys"),
      candidateDir: get("--candidate"),
      bindingPath: get("--binding"),
      action: get("--action"),
      now: get("--now"),
      productionBaselinePath: values.get("--production-baseline"),
    });
    process.stdout.write(
      `${JSON.stringify({
        verified: true,
        action: get("--action"),
        grantId: verified.grant.grantId,
        grantSha256: verified.digest,
        consumptionId: verified.consumptionId,
      }, null, 2)}\n`,
    );
    process.exit(0);
  } else if (command === "routine-job") {
    artifact = formRoutineJob({
      contentDir: get("--content"),
      draftPath: get("--draft"),
      admissionPath: get("--admission"),
      authorityGrantPath: get("--grant"),
      assessmentReceiptPath: values.get("--assessment-receipt"),
      candidateName: get("--candidate-name"),
      jobId: get("--job-id"),
    });
  } else if (command === "routine-env") {
    const job = values.get("--job"), queue = values.get("--queue");
    if ((job === undefined) === (queue === undefined)) throw new Error("routine-env requires exactly one of --job or --queue");
    artifact = formRoutineEnvironment({
      ...(job === undefined ? { KOIOS_NEWS_ROUTINE_PUBLICATION_QUEUE: queue } : { KOIOS_NEWS_ROUTINE_PUBLICATION_JOB: job }),
      KOIOS_NEWS_ROUTINE_PUBLICATION_AUTHORITY_KEYS: get("--authority-keys"),
      KOIOS_NEWS_ROUTINE_PUBLICATION_ASSESSMENT_KEYS: get("--assessment-keys"),
      KOIOS_NEWS_ROUTINE_PUBLICATION_BASELINE_ROOT: get("--baseline-root"),
      KOIOS_NEWS_ROUTINE_PUBLICATION_OUTPUT_ROOT: get("--output-root"),
      KOIOS_NEWS_ROUTINE_PUBLICATION_REPLAY_ROOT: get("--replay-root"),
    });
  } else throw new Error(`unknown command: ${command}`);
  const output = writeCreateOnly(get("--out"), artifact);
  if (command === "rollback-binding") {
    verifyRollback(output, verifyBinding(get("--binding")));
  }
  const report = typeof artifact === "string"
    ? { kind: "koios.news.routine-environment/v1" }
    : command === "routine-job"
    ? {
      kind: "koios.news.routine-publication-job/v1",
      jobId: artifact.jobId,
      candidateName: artifact.candidateName,
    }
    : command === "first-post-handoff"
    ? {
      kind: artifact.kind,
      status: artifact.status,
      manuscript: artifact.manuscript,
    }
    : command === "rollback-binding"
    ? {
      kind: artifact.kind,
      bindingSha256: artifact.bindingSha256,
      priorVersionId: artifact.priorVersionId,
    }
    : summarizeArtifact(
      command === "cloudflare-template" ||
        (command === "attach" && artifact.kind.includes("cloudflare"))
        ? "cloudflare"
        : "editorial",
      artifact,
    );
  process.stdout.write(
    `${JSON.stringify({ written: output, ...report }, null, 2)}\n`,
  );
} catch (error) {
  process.stderr.write(
    `koios-news-authority-ceremony: ${
      error instanceof Error ? error.message : String(error)
    }\n`,
  );
  process.exitCode = 1;
}
