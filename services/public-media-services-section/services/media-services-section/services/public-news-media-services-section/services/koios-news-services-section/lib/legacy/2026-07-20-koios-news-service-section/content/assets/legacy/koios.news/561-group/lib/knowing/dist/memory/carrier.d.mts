/**
 * memory/carrier — the agent's memory as a directed-relational carrier, DERIVED
 * from upstream, not reimplemented.
 *
 * Memory is the settled, accumulated body of knowledge an agent holds: the
 * codomain of learning, accumulated along the knowledge order. knowing reads it
 * as a memorystore carrier; downstream packages own concrete filepath admission.
 *
 * It depends on no package but `@emsenn/relating`: document parsing
 * comes from relating's markdown codec (`parseMarkdown`), and settlement from
 * `induceRelation` + `relateRelations`. The genre, frontmatter-legibility
 * conformance, and internal-reference helpers are ported into knowing (below) — the
 * capability lives here. knowing writes no settlement engine.
 *
 * Memory is settled by directed relational research: each document's
 * (path → claim) relation is induced to its own SettlementFiltration and the
 * relations are folded into one settled topology, whose closure regime is the
 * memory's certification (relating-experimental has no `settleUtterances` shortcut).
 */
import { type JsonRecord, type UtteranceCarrier, type SettlementFiltrationGenerators } from "@emsenn/relating";
import { type JsonValue } from "@emsenn/relating/writing";
import type { Resource } from "@emsenn/relating/writing/projector";
/** A frontmatter record: relating's markdown codec frontmatter shape. */
type FrontMatterRecord = Readonly<Record<string, JsonValue>>;
/** A document's genre: a single classifying facet, or null when unstated. */
interface GenreFacet {
    readonly value: string | null;
}
/** One conformance finding against a document's frontmatter legibility. */
interface MemoryFinding {
    readonly path: string;
    readonly rule: string;
    readonly severity: "error" | "warning" | "info";
    readonly message: string;
}
/** A folded conformance summary: finding counts by severity. */
interface ConformanceSummary {
    readonly total: number;
    readonly errors: number;
    readonly warnings: number;
    readonly info: number;
}
/** A fact: a charged predication cell admitted from a document (the truth-bearer). */
export interface MemoryFact {
    readonly kind: "knowing.memory.fact";
    readonly subject: string;
    readonly predicate: string;
    readonly object: JsonValue;
    /** the charge standing over FOUR (codec-admitted facts carry positive witness → potential). */
    readonly standing: "potential" | "active" | "stable" | "absurd";
}
/** A typing: a term inhabits a predicate-type (the predication's predicate/sort). */
export interface MemoryTyping {
    readonly kind: "knowing.memory.typing";
    readonly term: string;
    readonly predicate: string;
}
export interface MemoryDocument {
    readonly kind: "knowing.memory.document";
    /** the TERM: the entity (the codec's document subject) the facts are about. */
    readonly term: string;
    readonly path: string;
    readonly hadFrontMatter: boolean;
    readonly frontMatter: FrontMatterRecord;
    readonly body: string;
    readonly genre: GenreFacet;
    readonly findings: readonly MemoryFinding[];
    /** the FACTS this document admits: the charged predication cells the codec derived. */
    readonly facts: readonly MemoryFact[];
    /** the TYPINGS: the predicate-types the term inhabits (the distinct fact predicates). */
    readonly typings: readonly MemoryTyping[];
    readonly utterances: readonly UtteranceCarrier[];
}
export interface MemoryCarrier {
    readonly kind: "knowing.memory";
    readonly root: string;
    readonly documents: readonly MemoryDocument[];
    readonly utterances: readonly UtteranceCarrier[];
}
/**
 * Admit one memorystore resource as a memory document, decoding it through relating's
 * markdown codec (`markdownDataform`). The codec read gives the document's TERM (its
 * subject), its FACTS (the charged predication cells), its TYPINGS (the predicates
 * those facts assert), and the conformance verdict — never a hand-rolled parse.
 */
export declare function admitDocument(root: string, resource: Resource): MemoryDocument;
/** Admit a finite memory from already-gathered memorystore resources (callers own discovery). */
export declare function admitMemory(root: string, resources: readonly Resource[]): MemoryCarrier;
/**
 * A PROOF: the settling derivation that certifies memory's facts — the closure of
 * directed relational research over the held facts-about-terms. This is the shared
 * carrier the spine turns on: DRR (`research`/`settle-memory`) BUILDS it; neuro-
 * reflexivity (`reflect`/`ruminate`/`gauge`) READS its convergence. Its regime is
 * relating-experimental's closure-regime witness; `certified`/`onShell` is whether
 * the orbit settles (converges, `reflect`) rather than ruminates (aperiodic).
 */
export interface MemoryProof {
    readonly kind: "knowing.memory.proof";
    readonly documents: number;
    readonly facts: number;
    readonly relationsFolded: number;
    /** the closure-regime kind of the folded settlement (relating-experimental's witness). */
    readonly regime: string | null;
    /** on-shell idempotence reached — a stabilizing (non-aperiodic, convergent) regime. */
    readonly onShell: boolean;
    /** alias of onShell: whether the proof settles (the ≤_k orbit converges). */
    readonly certified: boolean;
}
/**
 * Fold memory into one settled topology by directed relational research: induce
 * each document's (path → claim) relation and relate them. The raw
 * SettlementFiltration — the carrier downstream agency morphisms (becoming →
 * doing → learning) admit. Null only for empty memory.
 */
export declare function settleMemoryFiltration(memory: MemoryCarrier): SettlementFiltrationGenerators | null;
/**
 * settle-memory: build the PROOF — settle the held facts-about-terms by directed
 * relational research and read the folded derivation's regime + convergence. This is
 * the proof the neuroreflexivity readings (reflect/ruminate/gauge) judge for settling.
 */
export declare function settleMemory(memory: MemoryCarrier): MemoryProof;
export interface MemoryHealth {
    readonly kind: "knowing.memory.health";
    readonly documents: number;
    readonly withFrontMatter: number;
    readonly withTitle: number;
    readonly conformance: ConformanceSummary;
}
export interface MemoryObservation {
    readonly kind: "knowing.memory.observation";
    readonly documents: number;
    /** signs presented to the game (frontmatter/genre/findings as labeled outcomes). */
    readonly signs: number;
    /** Player commitments — ordinary memory signs (frontmatter, genre). */
    readonly commitments: number;
    /** Opponent challenges — conformance findings (the active signs). */
    readonly challenges: number;
    /** polarized arena events produced by computing's observation map. */
    readonly events: number;
}
/**
 * Observe memory as a polarized arena of signs.
 *
 * Each memory sign is a labeled finite outcome: ordinary signs (path, frontmatter
 * keys, genre) are Player commitments (`potential`); conformance findings are
 * Opponent challenges (`active`). Each labeled sign is one arena event — the
 * polarized observation map over knowing's memory. The fuller concurrent-game arena
 * (move trees, strategies) is playing's domain; this records the polarization on the
 * bilattice charge directly, depending on no package but @emsenn/relating.
 */
export declare function observeMemory(memory: MemoryCarrier): MemoryObservation;
export type TopicRole = "concept-home" | "exact-title" | "path-match" | "supporting";
export interface TopicDocumentInspection {
    readonly path: string;
    readonly title: string;
    readonly role: TopicRole;
}
export interface MemoryTopicInspection {
    readonly kind: "knowing.memory.topic-inspection";
    readonly topic: string;
    readonly slug: string;
    readonly documentsInspected: number;
    readonly conceptHomes: readonly string[];
    readonly exactTitleMatches: readonly string[];
    readonly pathMatches: readonly string[];
    readonly supporting: number;
    readonly gaps: readonly string[];
}
/**
 * Inspect a topic across memory — DERIVED reading, faithful to the research
 * server's role classification. Each document is a concept-home (title or
 * basename slug matches the topic, outside an archive), an exact-title match, a
 * path match, or merely supporting. The gaps name what is missing for the topic
 * to have a settled home.
 */
export declare function inspectMemoryTopic(memory: MemoryCarrier, topic: string): MemoryTopicInspection;
/** Read memory's health — frontmatter legibility via knowing's conformance summary. */
export declare function inspectMemoryHealth(memory: MemoryCarrier): MemoryHealth;
export interface ConceptEdge {
    readonly from: string;
    readonly to: string;
    readonly field: string;
}
export interface MemoryConceptMap {
    readonly kind: "knowing.memory.concept-map";
    readonly topic: string;
    readonly slug: string;
    /** the documents matching the topic (concept-homes, title/path matches) — the map's nodes. */
    readonly nodes: readonly string[];
    readonly edgeCount: number;
    /** the internal cross-references the matched documents assert (bounded sample). */
    readonly edges: readonly ConceptEdge[];
    /** normalized finite cohomology receipt for the concept-reference graph. */
    readonly cohomology: JsonRecord;
}
/**
 * Map the concepts around a topic — DERIVED. The nodes are the documents matching
 * the topic (via topic inspection); the edges are the internal cross-references
 * those documents assert in their frontmatter, extracted by
 * knowing's `internalReferenceTargets` (ported) and resolved to slugs by
 * `referenceSlug`. The directed-relation neighborhood of a concept.
 */
export declare function conceptMapMemory(memory: MemoryCarrier, topic: string): MemoryConceptMap;
export type GapStatus = "settled" | "partial" | "gap";
export interface GapAxis {
    readonly axis: "coverage" | "frontmatter-legibility";
    readonly status: GapStatus;
}
export interface MemoryGap {
    readonly kind: "knowing.memory.gap";
    readonly topic: string;
    readonly slug: string;
    readonly documentsInspected: number;
    readonly axes: readonly GapAxis[];
    readonly conceptHomes: number;
    readonly gaps: readonly string[];
    readonly conformance: ConformanceSummary;
}
/**
 * Measure the gap for a topic across memory — DERIVED by composing the topic
 * inspection and the conformance health into graded axes. Coverage is settled
 * when a concept-home exists, partial when only path-matches do, a gap otherwise;
 * frontmatter-legibility grades how much of the region carries usable titles.
 */
export declare function measureMemoryGap(memory: MemoryCarrier, topic: string): MemoryGap;
export {};
//# sourceMappingURL=carrier.d.mts.map