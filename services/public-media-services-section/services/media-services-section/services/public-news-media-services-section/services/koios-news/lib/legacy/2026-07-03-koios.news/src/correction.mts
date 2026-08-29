import { readFileSync } from "node:fs";

import { amendCorrection, openCorrection, reopenCorrection } from "./management/corrections.mjs";
import { closeAndReleaseCorrection } from "./management/correction-release.mjs";

function flag(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function required(name: string): string {
  const value = flag(name);
  if (value === undefined || value.trim() === "") throw new Error(`missing --${name}=...`);
  return value;
}

const command = process.argv[2];
if (command === "open") {
  const bodyFile = flag("body-file");
  const replaceFrom = flag("replace-from");
  const replaceTo = flag("replace-to");
  const priorRouteDigestsFile = required("prior-route-digests-file");
  if ((replaceFrom === undefined) !== (replaceTo === undefined)) throw new Error("--replace-from and --replace-to must be supplied together");
  const result = await openCorrection({
    slug: required("slug"),
    kind: required("kind") as "correction" | "clarification" | "update" | "retraction",
    correctedAt: required("corrected-at"),
    summary: required("summary"),
    ...(flag("details") === undefined ? {} : { details: flag("details")! }),
    ...(bodyFile === undefined ? {} : { correctedBody: readFileSync(bodyFile, "utf8") }),
    ...(replaceFrom === undefined || replaceTo === undefined ? {} : {
      replacements: Object.freeze([{ from: replaceFrom, to: replaceTo }]),
    }),
    ...(flag("expected-digest") === undefined ? {} : { expectedManuscriptDigest: flag("expected-digest")! }),
    trigger: {
      act: required("trigger-act") as "source-claim.superseded" | "source-claim.withdrawn" | "claim.narrowed",
      evidenceDigest: required("trigger-evidence-digest"),
      reason: required("trigger-reason"),
      ...(flag("source-subject") === undefined ? {} : { sourceSubjects: [flag("source-subject")!] }),
      ...(flag("claim-id") === undefined ? {} : { claimIds: [flag("claim-id")!] }),
    },
    priorManifestDigest: required("prior-manifest-digest"),
    priorRouteDigests: JSON.parse(readFileSync(priorRouteDigestsFile, "utf8")) as Record<string, string>,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (command === "amend") {
  const result = await amendCorrection({
    slug: required("slug"),
    correctionId: required("correction-id"),
    amendedAt: required("amended-at"),
    summary: required("summary"),
    ...(flag("details") === undefined ? {} : { details: flag("details")! }),
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (command === "reopen") {
  const replaceFrom = required("replace-from");
  const replaceTo = required("replace-to");
  const result = await reopenCorrection({
    slug: required("slug"),
    correctionId: required("correction-id"),
    reopenedAt: required("reopened-at"),
    reason: required("reason"),
    replacements: Object.freeze([{ from: replaceFrom, to: replaceTo }]),
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (command === "close") {
  const result = await closeAndReleaseCorrection({
    slug: required("slug"),
    correctionId: required("correction-id"),
    closedAt: required("closed-at"),
    outputDir: flag("out") ?? ".static/koios.news-candidate",
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  throw new Error("usage: correction open|amend|reopen|close --slug=... [transaction flags]");
}
