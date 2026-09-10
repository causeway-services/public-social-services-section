import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../../config.mts";
import { type KoiosPost } from "../../content.mts";
import { articleFingerprintPng } from "../../fingerprint.mts";
import { type KoiosItem, type KoiosMasthead } from "../../surface.mts";

const SITE_ROOT = resolve(import.meta.dirname, "../../..");
const C2PA_ROOT = resolve(SITE_ROOT, "../../../../../red-cup-engineering/services/web-services-section/services/c2pa-services-section");
const ETHEREUM_ROOT = resolve(SITE_ROOT, "../../../../../red-cup-engineering/services/blockchain-services-section/services/ethereum-services-section");
const KOIOS_ACCOUNT = join(SITE_ROOT, "content/evm/accounts/eip155-31337.json");
const KOIOS_KEYSTORE = join(SITE_ROOT, "data/evm/keystores/eip155-31337.json");
const DISCLOSURE = "This public-interest article was produced with AI language systems by Nik Koios, an artificial person. It passed automated editorial and source checks; no human review is claimed.";
const semanticId = (value: unknown): string => identifyJsonSemanticContent({ objectKind: "koios.article50-provenance-mark", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required; unsigned publication is forbidden`);
  return value;
}
function fingerprintIdentity(value: Uint8Array): string {
  return identifyJsonSemanticContent({ objectKind: "koios-news.article50-artifact", value: { encoding: "base64", bytes: Buffer.from(value).toString("base64") }, witnessRoot: EMPTY_WITNESS_ROOT }).token;
}
function suffix(ni: string): string { return ni.slice("ni:///sha-256;".length); }

export function article50FingerprintPath(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead, contentDir = DEFAULT_CONTENT_DIR): string {
  const sourceNi = fingerprintIdentity(articleFingerprintPng(post, item, masthead));
  return join(resolve(contentDir, ".."), "provenance", "fingerprints", post.slug, `${suffix(sourceNi)}.png`);
}

export function admittedArticle50Fingerprint(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead, contentDir = DEFAULT_CONTENT_DIR): Buffer {
  const path = article50FingerprintPath(post, item, masthead, contentDir);
  if (!existsSync(path)) throw new Error(`Article 50 provenance is absent for public article ${post.slug}; unsigned fallback is forbidden`);
  return readFileSync(path);
}

export async function prepareArticle50Fingerprint(input: Readonly<{
  post: KoiosPost;
  item: KoiosItem;
  masthead: KoiosMasthead;
  contentDir?: string;
  dataDir?: string;
}>): Promise<Readonly<{
  slug: string;
  sourceNi: string;
  signedNi: string;
  path: string;
  reused: boolean;
  inclusion: unknown;
  finality: unknown;
}>> {
  const contentDir = input.contentDir ?? DEFAULT_CONTENT_DIR, dataDir = input.dataDir ?? DEFAULT_DATA_DIR;
  const { queryWitnessJournalDocumentsByCategory, recordWitnessJournalBatch, relationalWitnessJournalDocument } = await import("@red-cup-engineering/witness-journal-document-service");
  const source = articleFingerprintPng(input.post, input.item, input.masthead), sourceNi = fingerprintIdentity(source);
  const path = article50FingerprintPath(input.post, input.item, input.masthead, contentDir);
  const prior = (queryWitnessJournalDocumentsByCategory(dataDir).map((document) => document.value).find((value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
    const record = value as Readonly<Record<string, unknown>>;
    return record["type"] === "Article50FingerprintPublication" && record["slug"] === input.post.slug && record["sourceNi"] === sourceNi;
  }) ?? undefined) as Readonly<Record<string, unknown>> | undefined;
  if (prior && existsSync(path)) {
    const signedNi = fingerprintIdentity(readFileSync(path));
    if (signedNi !== prior["signedNi"]) throw new Error(`settled Article 50 media bytes changed for ${input.post.slug}`);
    if (!("inclusion" in prior) || !("finality" in prior)) {
      throw new Error(`settled Article 50 provenance predates the inclusion/finality distinction for ${input.post.slug}; re-assay is required`);
    }
    return Object.freeze({
      slug: input.post.slug,
      sourceNi,
      signedNi,
      path,
      reused: true,
      inclusion: prior["inclusion"],
      finality: prior["finality"],
    });
  }
  if (existsSync(path)) throw new Error(`unwitnessed Article 50 media occupies ${path}`);
  // Provenance signing is a separately hired publication-boundary service.
  // Loading ordinary Koios modules must not require that provider to be
  // installed ambiently on the newsroom carrier.
  const { publishArticle50Asset } = await import("@red-cup-engineering/c2pa-services-section/client");
  const c2paAccount = JSON.parse(readFileSync(join(C2PA_ROOT, "content/evm/accounts/eip155-31337.json"), "utf8")).account.caip10 as string;
  const caller = JSON.parse(readFileSync(KOIOS_ACCOUNT, "utf8")).account.caip10 as string;
  const result = await publishArticle50Asset({
    signing: {
      c2paAgentUrl: required("C2PA_AGENT"), rmnAgentUrl: required("RMN_CONFORMANCE_AGENT"),
      caller, provider: c2paAccount, asset: source, mediaType: "image/png", title: `${input.post.slug}-fingerprint.png`,
      digitalSourceType: "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia",
      model: "Koios contracted model-contribution pipeline; exact provider model is retained in the article WitnessJournal",
      humanOversight: "none", accessibleDisclosure: DISCLOSURE,
      precondition: semanticId(["mark", "article admitted for publication"]),
      postcondition: semanticId(["mark", "signed fingerprint and chain-qualified commitment exist"]),
      refusal: semanticId(["mark", "provenance signing, validation, or accountable ERC-4337 commitment failed"]),
      evidenceRoot: semanticId(["mark", "FOUR-bottom"])
    },
    anchor: {
      bindingPath: KOIOS_ACCOUNT, keystorePath: KOIOS_KEYSTORE, passwordFile: required("KOIOS_EVM_PASSWORD_FILE"),
      deploymentPath: join(ETHEREUM_ROOT, "content/deployments/eip155-31337.json"),
      rpcUrl: required("EVM_RPC_URL"), bundlerUrl: required("ERC4337_BUNDLER_URL")
    }
  });
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, result.signedAsset, { flag: "wx", mode: 0o644 });
  const manifestPath = `${path}.c2pa`;
  writeFileSync(manifestPath, result.manifest, { flag: "wx", mode: 0o644 });
  const record = {
    type: "Article50FingerprintPublication", slug: input.post.slug, sourceNi, signedNi: result.assetNi,
    manifestNi: result.manifestNi, rmnAct: result.operationNi, evidenceRoot: result.evidenceRoot,
    disclosure: result.accessibleDisclosure, inclusion: result.commitment.includedReceipt,
    finality: result.commitment.finality
  };
  await recordWitnessJournalBatch({ agentUrl: required("WITNESS_JOURNAL_RDF_AGENT"), batch: {
    settlement: caller, graph: result.operationNi, recordedAt: new Date().toISOString(), document: relationalWitnessJournalDocument(record), assertions: [
      { subject: result.assetNi, predicate: "urn:emsenn:c2pa-manifest", object: { kind: "iri", value: result.manifestNi } },
      { subject: result.assetNi, predicate: "urn:emsenn:rmn-publication-act", object: { kind: "iri", value: result.operationNi } }
    ]
  }});
  return Object.freeze({
    slug: input.post.slug,
    sourceNi,
    signedNi: result.assetNi,
    path,
    reused: false,
    inclusion: result.commitment.includedReceipt,
    finality: result.commitment.finality
  });
}
