import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { appendKoiosAct, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";

export const ARTICLE_AD_INVENTORY_CONTRACT = "koios.news/article-ad-inventory/v1";
export const ARTICLE_AD_INVENTORY_SELLER = "urn:micro-enterprise:koios.news:publishing-and-ad-inventory";

type PublicWitness = Readonly<Record<string, unknown>>;

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rawNi(bytes: Uint8Array): string {
  return `ni:///sha-256;${createHash("sha256").update(bytes).digest("base64url")}`;
}

/** Form external inventory only from bytes that were released and witnessed. */
export async function issueArticleAdInventoryLot(input: Readonly<{
  dataDir: string;
  assignmentId: string;
  slug: string;
  candidateDir: string;
  artifactManifestDigest: string;
  publicWitness: PublicWitness;
  issuedAt: string;
}>): Promise<Readonly<JsonObject>> {
  const prior = readKoiosLedger(input.dataDir, "advertising").find((entry) => entry["act"] === "advertising.inventory-lot.available" && entry["subject"] === input.assignmentId && object(entry["data"]) && entry["data"]["artifactManifestDigest"] === input.artifactManifestDigest);
  if (prior !== undefined && object(prior["data"])) return prior["data"] as JsonObject;

  const manifestPath = join(resolve(input.candidateDir), "manifest.json");
  const manifestBytes = readFileSync(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as Record<string, unknown>;
  if (rawNi(manifestBytes) !== input.artifactManifestDigest) throw new Error("ad inventory candidate manifest does not match the released artifact");
  if (input.publicWitness["witnessed"] !== true || typeof input.publicWitness["witnessDigest"] !== "string") throw new Error("ad inventory requires an independently witnessed public release");
  if (!object(manifest["policy"]) || manifest["policy"]["advertising"] !== true) throw new Error("released artifact does not admit advertising inventory");
  const artifacts = Array.isArray(manifest["artifacts"]) ? manifest["artifacts"] : [];
  const article = artifacts.find((value) => object(value) && value["route"] === `/posts/${input.slug}`);
  if (!object(article) || typeof article["file"] !== "string") throw new Error("released manifest contains no exact article route for the inventory lot");
  const html = readFileSync(join(resolve(input.candidateDir), article["file"]), "utf8");
  const placements = [...html.matchAll(/data-provider="a-ads"[^>]*data-placement="([^"]+)"[^>]*data-unit="([^"]+)"/gu)].map((match) => Object.freeze({ provider: "aads.com", placement: match[1]!, unitId: match[2]! }));
  if (placements.length === 0) throw new Error("public article carries no declared advertising placement");

  const lotCore = Object.freeze({
    type: "ArticleAdInventoryLot",
    contract: ARTICLE_AD_INVENTORY_CONTRACT,
    seller: ARTICLE_AD_INVENTORY_SELLER,
    assignmentId: input.assignmentId,
    slug: input.slug,
    publicUrl: `https://koios.news/posts/${input.slug}`,
    artifactManifestDigest: input.artifactManifestDigest,
    publicWitnessDigest: input.publicWitness["witnessDigest"],
    placements: Object.freeze(placements),
    demandProvider: "aads.com",
    saleStatus: "available-awaiting-external-impression-and-revenue-receipts",
    readerIsCommodity: false,
    externalRevenueObserved: false,
    issuedAt: input.issuedAt,
  });
  const lot = Object.freeze({ id: `urn:${recordDigest(lotCore)}`, ...lotCore });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "advertising", instant: input.issuedAt, act: "advertising.inventory-lot.available", subject: input.assignmentId, data: lot as JsonObject });
  return lot as JsonObject;
}
