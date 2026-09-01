import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { recordDigest } from "./ledger.mts";
import { productClassFor, resourceEnvelopeForProduct, type ProductClass, type ProductResourceEnvelope } from "./audience-product-planning.mts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const LAW_PATH = join(ROOT, "lib", "law", "editorial-product-commissions.json");

export type EditorialEvidenceBudget = Readonly<{
  targetWords: Readonly<{ minimum: number; maximum: number }>;
  minimumDistinctAssertions: number;
  minimumPrimaryAssertions: number;
  minimumIndependentSources: number;
  maximumWordsPerAssertion: number;
  minimumSections: number;
  sectionPurposes: readonly string[];
}>;

export type EditorialCommission = Readonly<{
  kind: "koios.editorial-commission";
  version: 1;
  productClass: ProductClass;
  genre: string;
  promise: string;
  evidenceBudget: EditorialEvidenceBudget;
  resourceEnvelope: ProductResourceEnvelope;
  writerPromptLaws: readonly string[];
  invariants: readonly string[];
  lawDigest: string;
}>;

type Json = Record<string, unknown>;
function object(value: unknown, label: string): Json {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
  return value as Json;
}
function strings(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string" && entry.trim() !== "")) throw new TypeError(`${label} must be a nonempty string array`);
  return Object.freeze(value);
}
function positive(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) throw new TypeError(`${label} must be a positive integer`);
  return Number(value);
}

function commissionLaw(): Readonly<{ raw: Json; profiles: Json; productProfiles: Json; invariants: readonly string[] }> {
  const raw = object(JSON.parse(readFileSync(LAW_PATH, "utf8")), "commission law");
  if (raw["kind"] !== "koios.editorial-product-commission-law" || raw["version"] !== 1) throw new TypeError("unsupported editorial product commission law");
  return Object.freeze({
    raw,
    profiles: object(raw["profiles"], "commission profiles"),
    productProfiles: object(raw["productProfiles"], "product profile map"),
    invariants: strings(raw["invariants"], "commission invariants"),
  });
}

export function commissionForProduct(productClass: ProductClass): EditorialCommission {
  const law = commissionLaw();
  const genre = law.productProfiles[productClass];
  if (typeof genre !== "string" || genre.trim() === "") throw new TypeError(`no commission profile for ${productClass}`);
  const profile = object(law.profiles[genre], `commission profile ${genre}`);
  const budget = object(profile["evidenceBudget"], `${genre} evidence budget`);
  const target = object(budget["targetWords"], `${genre} target words`);
  const minimum = positive(target["minimum"], `${genre} minimum words`);
  const maximum = positive(target["maximum"], `${genre} maximum words`);
  if (maximum < minimum) throw new TypeError(`${genre} maximum words precedes its minimum`);
  const sectionPurposes = strings(budget["sectionPurposes"], `${genre} section purposes`);
  const minimumSections = positive(budget["minimumSections"], `${genre} minimum sections`);
  if (sectionPurposes.length < minimumSections) throw new TypeError(`${genre} lacks enough section purposes`);
  const resourceEnvelope = resourceEnvelopeForProduct(productClass);
  const minimumIndependentSources = positive(budget["minimumIndependentSources"], `${genre} minimum independent sources`);
  if (minimumIndependentSources !== resourceEnvelope.independentSourceFloor) throw new TypeError(`${genre} source floor disagrees with its portfolio resource envelope`);
  return Object.freeze({
    kind: "koios.editorial-commission",
    version: 1,
    productClass,
    genre,
    promise: String(profile["promise"] ?? "").trim(),
    evidenceBudget: Object.freeze({
      targetWords: Object.freeze({ minimum, maximum }),
      minimumDistinctAssertions: positive(budget["minimumDistinctAssertions"], `${genre} minimum assertions`),
      minimumPrimaryAssertions: positive(budget["minimumPrimaryAssertions"], `${genre} minimum primary assertions`),
      minimumIndependentSources,
      maximumWordsPerAssertion: positive(budget["maximumWordsPerAssertion"], `${genre} words per assertion`),
      minimumSections,
      sectionPurposes,
    }),
    resourceEnvelope,
    writerPromptLaws: strings(profile["writerPromptLaws"], `${genre} writer laws`),
    invariants: law.invariants,
    lawDigest: recordDigest(law.raw),
  });
}

export function commissionForAssignment(input: Readonly<{ term: string; beat?: string; title?: string }>): EditorialCommission {
  return commissionForProduct(productClassFor(input));
}
