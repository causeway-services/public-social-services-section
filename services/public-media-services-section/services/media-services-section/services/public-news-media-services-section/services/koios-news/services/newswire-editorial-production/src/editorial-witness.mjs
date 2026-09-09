import { Buffer } from "node:buffer";

import { seavt } from "@red-cup-engineering/witness-journal-entry-service";
import { jsonToTerm } from "@red-cup-engineering/relation-model-notation-json-codec";
import { appendSeavt } from "@red-cup-engineering/witness-journal-log-service";
const directSeavt = (entity, attribute, value, time) => seavt(jsonToTerm(entity), jsonToTerm(attribute), jsonToTerm(value), time);

function niSurface(role, token) {
  const match = /^ni:\/\/\/sha-256;([A-Za-z0-9_-]{43})$/u.exec(token);
  if (match === null) throw new TypeError(`${role} must be one semantic-content ni token`);
  return `semantic-content.${role}.sha256.${Buffer.from(match[1], "base64url").toString("hex")}`;
}

export function appendEditorialContributionWitness(root, at, { proposal, completion, witness, inference, disposition }) {
  const entity = niSurface("completion", completion);
  const positiveEvidence = disposition === "completion";
  const negativeEvidence = disposition !== "completion";
  return appendSeavt(root, "newswire.editorial-contribution", [
    directSeavt(entity, "editorial-contribution:proposal", niSurface("proposal", proposal), at),
    directSeavt(entity, "editorial-contribution:completion", entity, at),
    directSeavt(entity, "editorial-contribution:transition-witness", niSurface("transition-witness", witness), at),
    directSeavt(entity, "editorial-contribution:child-completion", niSurface("child-completion", inference), at),
    directSeavt(entity, "editorial-contribution:disposition", `editorial-contribution.disposition.${disposition}`, at),
    directSeavt(entity, "four:positive-evidence", `four.positive.${positiveEvidence}`, at),
    directSeavt(entity, "four:negative-evidence", `four.negative.${negativeEvidence}`, at),
  ], at);
}
