import { createHash } from "node:crypto";

export const WITHHELD_EFFECTS = Object.freeze([
  "discord-write",
  "message-text-import",
  "contributor-identity-resale",
  "credential-custody",
  "fetch",
  "inference",
  "storage",
  "publication",
  "ranking",
  "price-conversion",
  "payment-settlement",
]);

const CREDENTIAL_KEY = /authorization|api[-_]?key|secret|token|password|cookie|bearer/i;
const MESSAGE_TEXT_KEY = /^(messageText|messageContent|content|attachments|embeds)$/;
const PRIVATE_HOST = /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0$|\[?::1\]?$|169\.254\.)/i;
const SHA256_DIGEST = /^sha256:[0-9a-f]{64}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const OPAQUE_CONTRIBUTOR = /^urn:tti:contributor:[0-9A-Za-z_-]+$/;

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function contentDigest(value) {
  return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
}

function findRefusedKey(value, pattern) {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findRefusedKey(entry, pattern);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (pattern.test(key)) return key;
      const found = findRefusedKey(entry, pattern);
      if (found) return found;
    }
  }
  return null;
}

function refusal(reason) {
  return Object.freeze({ disposition: "refused", reason });
}

export function admitCommunitySourceLead(lead) {
  if (!lead || typeof lead !== "object" || Array.isArray(lead)) return refusal("lead-not-an-object");
  const credentialKey = findRefusedKey(lead, CREDENTIAL_KEY);
  if (credentialKey) return refusal(`credential-shaped-key-refused:${credentialKey}`);
  const messageTextKey = findRefusedKey(lead, MESSAGE_TEXT_KEY);
  if (messageTextKey) return refusal(`discord-message-material-refused:${messageTextKey}`);
  if (typeof lead.sourceUrl !== "string") return refusal("source-url-missing");
  let url;
  try {
    url = new URL(lead.sourceUrl);
  } catch {
    return refusal("source-url-unparseable");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return refusal("source-url-scheme-refused");
  if (PRIVATE_HOST.test(url.hostname)) return refusal("source-host-not-public");
  if (url.username || url.password) return refusal("source-url-carries-identity");
  if (!SHA256_DIGEST.test(lead.rosterRef ?? "")) return refusal("roster-reference-missing");
  if (!OPAQUE_CONTRIBUTOR.test(lead.contributorRef ?? "")) return refusal("contributor-reference-not-opaque");
  if (!ISO_INSTANT.test(lead.offeredAtIso ?? "")) return refusal("offering-instant-missing");
  const admitted = Object.freeze({
    type: "CommunitySourceLead",
    sourceUrl: url.href,
    rosterRef: lead.rosterRef,
    contributorRef: lead.contributorRef,
    offeredAtIso: lead.offeredAtIso,
  });
  return Object.freeze({ disposition: "admitted", lead: admitted, id: contentDigest(admitted) });
}

export function reconcileFetchedSource(admission, fetchEvidence, analysisEvidence, reconciledAtIso) {
  if (admission?.disposition !== "admitted") return refusal("lead-not-admitted");
  if (!ISO_INSTANT.test(reconciledAtIso ?? "")) return refusal("reconciliation-instant-missing");
  if (!fetchEvidence || typeof fetchEvidence !== "object") return refusal("fetch-evidence-missing");
  if (!SHA256_DIGEST.test(fetchEvidence.contentDigest ?? "")) return refusal("fetched-content-digest-missing");
  if (typeof fetchEvidence.storageRef !== "string" || !fetchEvidence.storageRef.startsWith("urn:")) {
    return refusal("storage-reference-not-urn");
  }
  if (!Number.isInteger(fetchEvidence.byteCount) || fetchEvidence.byteCount <= 0) return refusal("byte-count-missing");
  if (typeof fetchEvidence.mediaType !== "string" || fetchEvidence.mediaType.length === 0) return refusal("media-type-missing");
  if (typeof fetchEvidence.title !== "string") return refusal("title-missing");
  if (!analysisEvidence || typeof analysisEvidence !== "object") return refusal("analysis-evidence-missing");
  if (typeof analysisEvidence.summary !== "string" || analysisEvidence.summary.length === 0) return refusal("analysis-summary-missing");
  if (!Array.isArray(analysisEvidence.claims)) return refusal("analysis-claims-missing");
  if (!Array.isArray(analysisEvidence.topics) || analysisEvidence.topics.length === 0) return refusal("analysis-topics-missing");
  const receipt = analysisEvidence.inferenceReceipt;
  if (!receipt || typeof receipt.provider !== "string" || !SHA256_DIGEST.test(receipt.receiptDigest ?? "")) {
    return refusal("inference-receipt-missing");
  }
  const record = Object.freeze({
    type: "CommunitySourceKnowledgeRecord",
    lead: admission.id,
    sourceUrl: admission.lead.sourceUrl,
    offeredAtIso: admission.lead.offeredAtIso,
    reconciledAtIso,
    fetched: Object.freeze({
      contentDigest: fetchEvidence.contentDigest,
      storageRef: fetchEvidence.storageRef,
      byteCount: fetchEvidence.byteCount,
      mediaType: fetchEvidence.mediaType,
      title: fetchEvidence.title,
    }),
    analysis: Object.freeze({
      summary: analysisEvidence.summary,
      claims: Object.freeze([...analysisEvidence.claims]),
      topics: Object.freeze([...analysisEvidence.topics]),
      inferenceReceipt: Object.freeze({ provider: receipt.provider, receiptDigest: receipt.receiptDigest }),
    }),
    provenance: Object.freeze({
      rosterRef: admission.lead.rosterRef,
      contributorRef: admission.lead.contributorRef,
    }),
    projectionAuthority: "non-authoritative-projection",
  });
  return Object.freeze({ disposition: "reconciled", record, id: contentDigest(record) });
}

export function projectSaleableKnowledge(record) {
  if (record?.type !== "CommunitySourceKnowledgeRecord") return refusal("record-not-reconciled");
  const projection = Object.freeze({
    type: "CommunityKnowledgeProjection",
    sourceUrl: record.sourceUrl,
    offeredAtIso: record.offeredAtIso,
    reconciledAtIso: record.reconciledAtIso,
    fetched: record.fetched,
    analysis: record.analysis,
    withheld: Object.freeze(["contributor-identity", "roster-reference", "raw-bytes"]),
    projectionAuthority: "non-authoritative-projection",
  });
  return Object.freeze({ disposition: "projected", projection, id: contentDigest(projection) });
}

export function fulfillCommunityKnowledgeQuery(query, records, evaluationInstantIso) {
  if (!query || typeof query !== "object" || Array.isArray(query)) return refusal("query-not-an-object");
  const credentialKey = findRefusedKey(query, CREDENTIAL_KEY);
  if (credentialKey) return refusal(`credential-shaped-key-refused:${credentialKey}`);
  const allowed = new Set(["topic", "sinceIso", "id"]);
  for (const key of Object.keys(query)) {
    if (!allowed.has(key)) return refusal(`query-key-refused:${key}`);
  }
  if (query.sinceIso !== undefined && !ISO_INSTANT.test(query.sinceIso)) return refusal("since-instant-unparseable");
  if (!ISO_INSTANT.test(evaluationInstantIso ?? "")) return refusal("evaluation-instant-missing");
  if (records === null || records === undefined) {
    return Object.freeze({ disposition: "unknown", reason: "corpus-unreadable" });
  }
  if (!Array.isArray(records)) return refusal("records-not-a-list");
  const matches = records
    .filter((entry) => entry?.record?.type === "CommunitySourceKnowledgeRecord")
    .filter((entry) => (query.id === undefined ? true : entry.id === query.id))
    .filter((entry) => (query.sinceIso === undefined ? true : entry.record.reconciledAtIso >= query.sinceIso))
    .filter((entry) =>
      query.topic === undefined
        ? true
        : entry.record.analysis.topics.some((topic) => topic.toLowerCase() === String(query.topic).toLowerCase()),
    )
    .sort((left, right) => (left.record.reconciledAtIso < right.record.reconciledAtIso ? 1 : -1));
  if (matches.length === 0) return refusal("no-matching-record");
  const projected = projectSaleableKnowledge(matches[0].record);
  if (projected.disposition !== "projected") return projected;
  return Object.freeze({
    disposition: "fulfilled",
    evaluationInstantIso,
    projection: projected.projection,
    id: projected.id,
  });
}
