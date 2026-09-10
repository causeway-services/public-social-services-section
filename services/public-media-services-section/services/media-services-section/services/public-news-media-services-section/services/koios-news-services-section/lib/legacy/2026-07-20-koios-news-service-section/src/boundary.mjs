import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { semanticId } from "@emsenn/rmn-semantic-conformance";
import { createSettlementStore, relationalRwilDocument } from "@emsenn/rwil-rdf-services/client";

export const ACTOR = "https://koios-news-service-section.invalid/activitypub/actor";
export const CONTEXT = "https://www.w3.org/ns/activitystreams";
export const ENTERPRISE = "urn:ame:koios-news-service-section";
export const ACCOUNT = "eip155:31337:0x55397286728b70d86a139fe8263c2d63c5d6770c";
export const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

export function digest(value) {
  return semanticId(relationalRwilDocument(value));
}

export function niSuffix(value) {
  if (!/^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u.test(value ?? "")) throw new Error("semantic identity must be an RFC 6920 SHA-256 ni URI");
  return value.slice("ni:///sha-256;".length);
}

export function settlementStore() {
  return createSettlementStore({
    settlementRoot: ROOT,
    dataRoot: resolve(process.env["KOIOS_NEWS_SERVICE_SECTION_DATA_ROOT"] ?? join(ROOT, "data")),
    agentUrl: process.env.RWIL_RDF_AGENT,
  });
}

export function records(category) {
  return settlementStore().records(category);
}

export function record(category, recordedAt, value) {
  return settlementStore().record({ category, recordedAt, record: value });
}
