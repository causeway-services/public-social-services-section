import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { exportReceipt, verifyReceipt } from "../src/editorial-admission-receipt.mjs";

const digest = (value, objectKind = "rsc-quiescent.record") => identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT })[objectKind === "rsc-quiescent.record" ? "token" : "id"];
const manuscriptSource = "---\ntitle: Exact\ndraft: true\n---\n\nExact witnessed manuscript.\n";
const manuscriptDigest = `sha256:${(await import("node:crypto")).createHash("sha256").update(manuscriptSource).digest("hex")}`;
const selection = { tool: "submit_editorial_acceptance", failureLayer: "none", replayFrom: "none", summary: "Publishable exact manuscript.", requiredRepairs: [], repairTools: [], report: "The exact manuscript and carried evidence have been assessed. ".repeat(12) };
const toolSelectionDigest = digest(selection);
const demand = { type: "EditorialAssessmentDemand", manuscript: { bytes: manuscriptSource, digest: manuscriptDigest } };
const offer = { actor: "urn:ame:independent-editorial-assessment", object: { service: "assess-manuscript", demandDigest: digest(demand), scope: { serviceClass: "editorial-judgment" }, sourceActivity: { object: demand } } };
const contractSource = JSON.stringify({ "@context": "https://www.w3.org/ns/activitystreams", type: "Accept", object: { type: "ServiceContract", offer } });
const deliverySource = JSON.stringify({ "@context": "https://www.w3.org/ns/activitystreams", type: "Accept", actor: "urn:ame:independent-editorial-assessment", object: { type: "EditorialToolSelectionDelivery", disposition: "completion", dryRun: false, demandDigest: offer.object.demandDigest, manuscriptDigest, toolSelection: selection, toolSelectionDigest } });
const record = { type: "EditorialAssessmentEvidence", kind: "provider.exchange", provider: "urn:ame:independent-editorial-assessment", outcome: "completion", demandDigest: offer.object.demandDigest, toolSelectionDigest };
const coordinate = digest(record, "koios-news.independent-editorial-assessment.record");
const ledgerSource = `${JSON.stringify({ e: coordinate, a: "independent-editorial-assessment.provider.exchange", v: record, t: "2026-08-29T00:00:00.000Z" })}\n`;
const input = { manuscriptSource, contractSource, deliverySource, ledgerSource, ledgerCoordinate: coordinate };

test("exports an exact evidence-bound custody proof without claiming signed authority", () => {
  const receipt = exportReceipt(input);
  assert.equal(receipt.proof.verifiedIssuerAuthority, false);
  assert.equal(receipt.admission.routinePublicationAuthority, false);
  assert.equal(receipt.manuscript.digest, manuscriptDigest);
  assert.equal(receipt.ledger.coordinate, coordinate);
  assert.equal(verifyReceipt({ ...input, receiptSource: JSON.stringify(receipt) }).ok, true);
});

test("refuses a changed manuscript, fabricated ledger coordinate, or authority escalation", () => {
  assert.throws(() => exportReceipt({ ...input, manuscriptSource: `${manuscriptSource}changed` }), /exact manuscript bytes/u);
  assert.throws(() => exportReceipt({ ...input, ledgerCoordinate: "ni:///sha-256;BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB" }), /not a provider-exchange/u);
  const receipt = structuredClone(exportReceipt(input)); receipt.admission.routinePublicationAuthority = true;
  assert.throws(() => verifyReceipt({ ...input, receiptSource: JSON.stringify(receipt) }), /must not claim routine publication authority/u);
});

test("the read-only CLI exports then verifies the same portable custody proof", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-editorial-receipt-"));
  try {
    const paths = Object.fromEntries(Object.entries({ manuscript: manuscriptSource, contract: contractSource, delivery: deliverySource, ledger: ledgerSource }).map(([name, source]) => { const path = join(root, name); writeFileSync(path, source); return [name, path]; }));
    const cli = new URL("../src/cli.mjs", import.meta.url).pathname;
    const exported = execFileSync(process.execPath, [cli, "export", "--manuscript", paths.manuscript, "--contract", paths.contract, "--delivery", paths.delivery, "--ledger", paths.ledger, "--ledger-coordinate", coordinate], { encoding: "utf8" });
    const receipt = join(root, "receipt.json"); writeFileSync(receipt, exported);
    const verified = execFileSync(process.execPath, [cli, "verify", "--receipt", receipt, "--manuscript", paths.manuscript, "--contract", paths.contract, "--delivery", paths.delivery, "--ledger", paths.ledger], { encoding: "utf8" });
    assert.equal(JSON.parse(verified).ok, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
