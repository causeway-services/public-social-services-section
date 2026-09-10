/**
 * @emsenn/knowing/dreaming — the four forms of dreaming, one per closure regime.
 *
 * Dreaming is what knowing does at each of its four regimes — confirmed by the
 * memorystore (the dreaming-tick journal; the dream convergence/emergence functions).
 * Three regimes are inward, deterministic, network-free learning acts that
 * RECOMBINE held observations (the convergence reading Ξᵣ — mutual stabilization of
 * difference toward a shared unrealized future):
 *
 *   - strict-finite (κ<ω): compose observations chaining object → subject;
 *   - Scott-continuous (κ=ω): consolidate repeated cells by knowledge-join (ω-limit);
 *   - transfinite (ω<κ<ω₁): co-predicate pairs sharing a subject (bounded).
 *
 * The fourth regime — **aperiodic (κ≥ω₁)** — is dreaming proper: the EMERGENCE
 * reading Dᵣ, "the persistence of intention in the absence of realizable
 * constraint", where genuinely new generators enter from OUTSIDE the settled
 * fibers. That can only happen by reaching past the closure, so the aperiodic
 * enactor is an external boundary (today: the LLM in
 * @emsenn/organizing-with-llm-agents/dreaming). Aperiodic knowing IS dreaming; this
 * surface owns the structure and the inward three, and exposes `"aperiodic"` as a
 * regime its downstream enactor fills.
 */
import { type Action, type ChargeCarrier, type JsonValue, type Mark, type PredicationTerm } from "@emsenn/relating";
import { type Observation } from "./observation.mjs";
export { task, taskCell } from "./task.mjs";
export type { Task, Term, Utterance, TaskEvidenceCarrier } from "./task.mjs";
export { observation } from "./observation.mjs";
export type { Observation } from "./observation.mjs";
/** The four closure regimes a dream settles at; `aperiodic` is filled by an external enactor. */
export type DreamRegime = "strict-finite" | "scott-continuous" | "transfinite" | "aperiodic";
/** The result of a dream: its regime, the observations it generated, and their joined charge. */
export interface DreamResult {
    readonly regime: DreamRegime;
    readonly observations: readonly Observation[];
    readonly charge: ChargeCarrier;
}
/** Whether the three finite inward regimes can derive a residue pair. */
export interface FiniteRegimeReachability {
    readonly "strict-finite": boolean;
    readonly "scott-continuous": boolean;
    readonly transfinite: boolean;
}
/** One finite-regime exclusion witness for a conjecture candidate. */
export interface StrictRegimeExclusion {
    readonly regime: Exclude<DreamRegime, "aperiodic">;
    readonly reachable: false;
    readonly because: string;
}
/** One non-convergent residue pair, with the finite-regime impossibility certificate attached. */
export interface AperiodicResiduePair {
    readonly kind: "knowing.dream.aperiodic-residue-pair";
    readonly left: Observation;
    readonly right: Observation;
    readonly finiteReachability: FiniteRegimeReachability;
    readonly strictRegimeExclusions: readonly StrictRegimeExclusion[];
}
/** The residue field: exactly the observation pairs no finite dream regime reaches. */
export interface AperiodicResidue {
    readonly kind: "knowing.dream.aperiodic-residue";
    readonly regime: "aperiodic";
    readonly observations: number;
    readonly pairs: readonly AperiodicResiduePair[];
    readonly theory: {
        readonly closure: "finite-regime-exclusion";
        readonly order: "aperiodic-non-convergence";
        readonly practice: "praxis-frontier";
    };
}
export interface FiniteDreamDiscovery {
    readonly kind: "knowing.dream.finite-discovery";
    readonly regime: Exclude<DreamRegime, "aperiodic">;
    readonly observations: readonly Observation[];
    readonly count: number;
}
export interface AperiodicDreamDiscovery {
    readonly kind: "knowing.dream.aperiodic-discovery";
    readonly regime: "aperiodic";
    readonly candidate: AperiodicConjecture;
    readonly genuinelyNew: true;
    readonly unreachableBy: readonly Exclude<DreamRegime, "aperiodic">[];
}
/** Audit ledger: finite products versus genuinely new aperiodic candidates. */
export interface AperiodicDiscoveryLedger {
    readonly kind: "knowing.dream.discovery-ledger";
    readonly regime: "aperiodic";
    readonly finite: readonly FiniteDreamDiscovery[];
    readonly aperiodic: readonly AperiodicDreamDiscovery[];
    readonly residue: AperiodicResidue;
    readonly verdict: {
        readonly genuineNovelty: "finite-regime-exclusion";
        readonly finiteProducts: number;
        readonly aperiodicCandidates: number;
        readonly allAperiodicUnreachable: boolean;
    };
    readonly theory: {
        readonly finite: "closure-products";
        readonly aperiodic: "non-convergent-residue";
        readonly discovery: "new-iff-finite-unreachable";
    };
}
export type AperiodicPraxisProbeKind = "strict-chain-probe" | "repeat-cell-probe" | "shared-subject-probe";
/** A concrete candidate observation that would test whether residue can become finite-reachable. */
export interface AperiodicPraxisProbe {
    readonly kind: "knowing.dream.praxis-probe";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly targetRegime: Exclude<DreamRegime, "aperiodic">;
    readonly probe: AperiodicPraxisProbeKind;
    readonly source: AperiodicResiduePair;
    readonly observation: Observation;
    readonly predictedFeedback: AperiodicPraxisFeedbackEffectKind;
    readonly rationale: string;
}
/** Intervention design: concrete probes for moving residue into finite reachability tests. */
export interface AperiodicPraxisProbeSet {
    readonly kind: "knowing.dream.praxis-probes";
    readonly regime: "aperiodic";
    readonly residue: AperiodicResidue;
    readonly probes: readonly AperiodicPraxisProbe[];
    readonly method: {
        readonly analysis: "finite-regime-exclusion";
        readonly design: "minimal-observation-probes";
        readonly feedback: "praxis-feedback-classifies-the-result";
    };
    readonly theory: {
        readonly praxis: "concrete-analysis-into-situated-action";
        readonly activeInference: "epistemic-probing";
        readonly dreaming: "test-non-convergence-without-forcing-settlement";
    };
}
export type PraxisLineage = "aperiodic-order" | "sheaf-contextuality" | "autopoietic-cognition" | "south-american-especifismo" | "critical-pedagogy";
/** One action obligation produced by folding non-convergent residue back into material practice. */
export interface AperiodicPraxisIntervention {
    readonly kind: "knowing.dream.praxis-intervention";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly source: AperiodicResiduePair;
    readonly lineages: readonly PraxisLineage[];
    readonly reflection: string;
    readonly action: string;
    readonly materialCheck: string;
    readonly feedback: {
        readonly observeAgain: true;
        readonly nextCarrier: "knowing.dream.aperiodic-residue";
        readonly loop: "theory-practice-theory";
    };
}
/** The praxis frontier: residue transformed into intervention obligations and feedback loops. */
export interface AperiodicPraxisFrontier {
    readonly kind: "knowing.dream.praxis-frontier";
    readonly regime: "aperiodic";
    readonly residue: AperiodicResidue;
    readonly interventions: readonly AperiodicPraxisIntervention[];
    readonly doctrine: {
        readonly analysis: "finite closure cannot settle this pair";
        readonly organization: "intervene at the material boundary";
        readonly feedback: "return action results as new observations";
    };
}
export type AperiodicPraxisFeedbackEffectKind = "strict-chain-created" | "repeat-cell-created" | "shared-subject-created" | "persistent-residue";
/** One intervention result: did practice make a finite regime newly able to reach the pair? */
export interface AperiodicPraxisFeedbackEffect {
    readonly kind: "knowing.dream.praxis-feedback-effect";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly source: AperiodicResiduePair;
    readonly effect: AperiodicPraxisFeedbackEffectKind;
    readonly finiteReachability: FiniteRegimeReachability;
    readonly reachableBy: readonly Exclude<DreamRegime, "aperiodic">[];
    readonly interpretation: string;
}
/** Theory-practice-theory feedback: post-intervention observations folded back into residue. */
export interface AperiodicPraxisFeedback {
    readonly kind: "knowing.dream.praxis-feedback";
    readonly regime: "aperiodic";
    readonly before: AperiodicResidue;
    readonly after: AperiodicResidue;
    readonly effects: readonly AperiodicPraxisFeedbackEffect[];
    readonly loop: {
        readonly theory: "finite-regime-exclusion";
        readonly practice: "situated-intervention";
        readonly return: "reobserve-and-reclassify";
    };
}
export type AperiodicHologramPhase = "empty" | "local" | "motile" | "persistent";
/** One local spatiotemporal projection of the aperiodic residue field. */
export interface AperiodicHologramProjection {
    readonly kind: "knowing.dream.aperiodic-hologram-projection";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly window: {
        readonly start: number;
        readonly end: number;
        readonly observations: number;
        readonly observers: number;
    };
    readonly residue: AperiodicResidue;
    readonly candidates: readonly AperiodicConjecture[];
}
/** A residue pair that recurs across local windows, visible from more than one local cut. */
export interface AperiodicHologramRecurrence {
    readonly kind: "knowing.dream.aperiodic-hologram-recurrence";
    readonly regime: "aperiodic";
    readonly source: AperiodicResiduePair;
    readonly windows: readonly number[];
    readonly finiteReachability: FiniteRegimeReachability;
}
/** Spatiotemporal agentic holography: local windows carrying the non-convergent frontier. */
export interface AperiodicHologram {
    readonly kind: "knowing.dream.aperiodic-hologram";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly transport: "event-stream";
    readonly projections: readonly AperiodicHologramProjection[];
    readonly recurrences: readonly AperiodicHologramRecurrence[];
    readonly frontier: {
        readonly phase: AperiodicHologramPhase;
        readonly windows: number;
        readonly maxResiduePairs: number;
        readonly recurrentResidues: number;
    };
    readonly theory: {
        readonly spatial: "local-window-projection";
        readonly temporal: "ordered-observation-stream";
        readonly agentic: "observer-indexed-field";
        readonly holographic: "local-projection-carries-frontier";
        readonly aperiodic: "finite-regime-exclusion";
    };
}
/** A recurrent hologram residue turned into an organized praxis obligation. */
export interface AperiodicHolographicPraxisIntervention {
    readonly kind: "knowing.dream.holographic-praxis-intervention";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly recurrence: AperiodicHologramRecurrence;
    readonly intervention: AperiodicPraxisIntervention;
    readonly organization: {
        readonly method: "social-insertion-through-local-windows";
        readonly target: "recurrent-non-convergent-residue";
        readonly windows: readonly number[];
    };
    readonly feedback: {
        readonly observeAgain: true;
        readonly nextCarrier: "knowing.dream.praxis-feedback";
        readonly measure: "local-window-recurrence-after-intervention";
    };
}
/** Holographic praxis: recurrent local residue becomes the organized intervention frontier. */
export interface AperiodicHolographicPraxis {
    readonly kind: "knowing.dream.holographic-praxis";
    readonly regime: "aperiodic";
    readonly hologram: AperiodicHologram;
    readonly interventions: readonly AperiodicHolographicPraxisIntervention[];
    readonly doctrine: {
        readonly analysis: "local projections reveal the frontier";
        readonly organization: "act where residue recurs across cuts";
        readonly feedback: "reobserve the windows and classify praxis feedback";
    };
    readonly theory: {
        readonly aperiodic: "non-convergent-residue";
        readonly holographic: "whole-frontier-visible-locally";
        readonly autopoietic: "structural-coupling";
        readonly southAmericanPraxis: "specific-organization-and-social-insertion";
        readonly participatoryResearch: "knowledge-through-action";
    };
}
/** One conjunctural line: analysis -> strategy -> tactics -> feedback over recurrent residue. */
export interface AperiodicConjuncturalPraxisLine {
    readonly kind: "knowing.dream.conjunctural-praxis-line";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly source: AperiodicHolographicPraxisIntervention;
    readonly analysis: {
        readonly conjuncture: "recurrent-non-convergent-residue";
        readonly correlationOfForces: "finite-regimes-excluded";
        readonly windows: readonly number[];
    };
    readonly strategy: {
        readonly orientation: "social-insertion";
        readonly objective: "change-the-observation-field";
        readonly criterion: "finite-bridge-created-or-persistent-residue-certified";
    };
    readonly tactics: readonly string[];
    readonly feedback: {
        readonly nextCarrier: "knowing.dream.praxis-feedback";
        readonly after: "append-situated-observations";
        readonly question: "which finite regime became reachable, if any?";
    };
}
/** Conjunctural praxis: a strategy/program layer over holographic praxis. */
export interface AperiodicConjuncturalPraxis {
    readonly kind: "knowing.dream.conjunctural-praxis";
    readonly regime: "aperiodic";
    readonly praxis: AperiodicHolographicPraxis;
    readonly lines: readonly AperiodicConjuncturalPraxisLine[];
    readonly program: {
        readonly analysis: "concrete-analysis-of-concrete-residue";
        readonly strategy: "select-recurrent-local-windows";
        readonly tactics: "situated-probes-and-reobservation";
        readonly feedback: "participatory-action-research-cycle";
    };
    readonly theory: {
        readonly huertaGrande: "theory-as-practical-tool";
        readonly especifismo: "specific-organization-and-social-insertion";
        readonly falsBorda: "participatory-action-research";
        readonly dreaming: "aperiodic-research-that-does-not-terminate";
    };
}
/** A full PAR/theory-practice-theory cycle over the aperiodic dream frontier. */
export interface AperiodicActionResearchCycle {
    readonly kind: "knowing.dream.action-research-cycle";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly before: AperiodicConjuncturalPraxis;
    readonly feedback: AperiodicPraxisFeedback;
    readonly after: AperiodicConjuncturalPraxis;
    readonly delta: {
        readonly strictBridges: number;
        readonly scottJoins: number;
        readonly transfiniteCovers: number;
        readonly persistentResidues: number;
        readonly beforeLines: number;
        readonly afterLines: number;
    };
    readonly loop: {
        readonly reflection: "analyze-recurrent-residue";
        readonly action: "intervene-and-observe";
        readonly observation: "classify-finite-reachability";
        readonly next: "repeat";
        readonly continues: true;
    };
    readonly theory: {
        readonly falsBorda: "participatory-action-research-cycle";
        readonly huertaGrande: "analysis-strategy-tactics-feedback";
        readonly autopoietic: "structural-coupling-through-observation";
        readonly dreaming: "valuable-because-it-does-not-terminate";
    };
}
/** One emitted event from the non-terminating action-research sequence. */
export interface AperiodicActionResearchSequenceEvent {
    readonly kind: "knowing.dream.action-research-sequence-event";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly cycle: AperiodicActionResearchCycle;
    readonly field: {
        readonly before: number;
        readonly after: number;
        readonly total: number;
    };
    readonly trajectory: {
        readonly settles: false;
        readonly next: "repeat";
    };
}
/** A bounded prefix of the action-research stream. */
export interface AperiodicActionResearchSequenceResult {
    readonly kind: "knowing.dream.action-research-sequence";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly transport: "event-stream";
    readonly events: readonly AperiodicActionResearchSequenceEvent[];
    readonly trajectory: {
        readonly batches: number;
        readonly emitted: number;
        readonly observations: number;
        readonly continues: true;
    };
}
export type AperiodicMetastableTrajectoryPhase = "quiescent" | "integrated" | "segregated" | "metastable";
/** One read of a non-terminating action-research event as a metastable trajectory step. */
export interface AperiodicMetastableTrajectoryStep {
    readonly kind: "knowing.dream.metastable-trajectory-step";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly source: AperiodicActionResearchSequenceEvent;
    readonly integration: number;
    readonly segregation: number;
    readonly novelty: number;
    readonly drift: number;
    readonly recommendation: "consolidate-bridge" | "organize-residue" | "probe-again";
}
/** The aperiodic stream read as productive non-stationary coordination, not convergence. */
export interface AperiodicMetastableTrajectory {
    readonly kind: "knowing.dream.metastable-trajectory";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly sequence: AperiodicActionResearchSequenceResult;
    readonly steps: readonly AperiodicMetastableTrajectoryStep[];
    readonly assessment: {
        readonly phase: AperiodicMetastableTrajectoryPhase;
        readonly integration: number;
        readonly segregation: number;
        readonly novelty: number;
        readonly drift: number;
        readonly nonstationary: boolean;
    };
    readonly next: {
        readonly carrier: "knowing.dream.frontier-agenda";
        readonly reason: string;
    };
    readonly theory: {
        readonly metastability: "integration-segregation-without-stationary-settlement";
        readonly activeInference: "epistemic-value-of-probing-uncertain-frontiers";
        readonly falsBorda: "knowledge-through-action-and-return";
        readonly huertaGrande: "theory-guides-situated-strategy";
        readonly dreaming: "aperiodic-trajectory-as-discovery-surface";
    };
}
export type AperiodicWorldMethodKind = "active-inference-epistemic-probing" | "enactive-autopoiesis" | "catuskoti-paraconsistency" | "ibn-khaldun-asabiyyah" | "huerta-grande-conjunctural-praxis" | "second-order-cybernetics" | "yijing-change-pattern" | "polynesian-wayfinding" | "daoist-wuwei-minimal-action" | "decolonizing-methodologies" | "reflective-practice" | "kula-reciprocity";
/** One global-historical research method selected for the current aperiodic trajectory. */
export interface AperiodicWorldMethod {
    readonly kind: "knowing.dream.world-method";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly method: AperiodicWorldMethodKind;
    readonly region: string;
    readonly period: string;
    readonly fits: readonly AperiodicMetastableTrajectoryPhase[];
    readonly score: number;
    readonly question: string;
    readonly intervention: string;
    readonly evidence: string;
    readonly nextCarrier: "knowing.dream.praxis-probes" | "knowing.dream.praxis-feedback" | "knowing.dream.frontier-agenda";
}
/** A global and historical repertoire for choosing how the aperiodic stream should act next. */
export interface AperiodicWorldMethodRepertoire {
    readonly kind: "knowing.dream.world-method-repertoire";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly trajectory: AperiodicMetastableTrajectory;
    readonly agenda: AperiodicFrontierAgenda;
    readonly methods: readonly AperiodicWorldMethod[];
    readonly selected: readonly AperiodicWorldMethod[];
    readonly doctrine: {
        readonly compare: "multiple-historical-inquiry-lineages";
        readonly choose: "fit-method-to-trajectory-phase";
        readonly act: "return-method-as-carrier-obligation";
        readonly repeat: true;
    };
    readonly theory: {
        readonly activeInference: "epistemic-value-probing";
        readonly enaction: "sense-making-through-structural-coupling";
        readonly catuskoti: "four-corner-paraconsistent-obstruction";
        readonly asabiyyah: "cohesion-as-collective-capacity";
        readonly cybernetics: "observer-in-the-loop";
        readonly dreaming: "world-methods-for-non-convergent-research";
    };
}
/** One selected world method turned into an observation obligation for the next cycle. */
export interface AperiodicWorldMethodIntervention {
    readonly kind: "knowing.dream.world-method-intervention";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly method: AperiodicWorldMethod;
    readonly observation: Observation;
    readonly protocol: {
        readonly read: string;
        readonly act: string;
        readonly verify: string;
        readonly nextCarrier: AperiodicWorldMethod["nextCarrier"];
    };
}
/** A concrete next-batch plan produced by global-historical methods. */
export interface AperiodicWorldMethodInterventionPlan {
    readonly kind: "knowing.dream.world-method-intervention-plan";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly repertoire: AperiodicWorldMethodRepertoire;
    readonly interventions: readonly AperiodicWorldMethodIntervention[];
    readonly after: readonly Observation[];
    readonly projected: AperiodicActionResearchCycle;
    readonly loop: {
        readonly currentField: number;
        readonly nextBatch: number;
        readonly next: "run-action-research-cycle";
        readonly continues: true;
    };
    readonly theory: {
        readonly comparativeMethod: "global-historical-methods-as-operational-probes";
        readonly navigation: "wayfinding-through-non-convergent-fields";
        readonly change: "pattern-change-without-final-settlement";
        readonly action: "minimal-situated-intervention";
        readonly dreaming: "methods-become-observations";
    };
}
export type AperiodicWorldMethodFeedbackAssessment = "finite-bridge-created" | "residue-persisted" | "trajectory-shifted" | "no-method-signal";
/** One selected method evaluated by its own generated observation against the current field. */
export interface AperiodicWorldMethodFeedbackEffect {
    readonly kind: "knowing.dream.world-method-feedback-effect";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly intervention: AperiodicWorldMethodIntervention;
    readonly cycle: AperiodicActionResearchCycle;
    readonly assessment: AperiodicWorldMethodFeedbackAssessment;
    readonly scoreDelta: number;
    readonly next: "amplify" | "repeat" | "hold-open" | "retire-for-now";
}
/** Adaptive feedback for global-historical methods: which ones changed the aperiodic frontier? */
export interface AperiodicWorldMethodFeedback {
    readonly kind: "knowing.dream.world-method-feedback";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly plan: AperiodicWorldMethodInterventionPlan;
    readonly effects: readonly AperiodicWorldMethodFeedbackEffect[];
    readonly adapted: readonly AperiodicWorldMethod[];
    readonly summary: {
        readonly amplified: number;
        readonly repeated: number;
        readonly heldOpen: number;
        readonly retiredForNow: number;
    };
    readonly loop: {
        readonly nextCarrier: "knowing.dream.world-method-repertoire";
        readonly action: "adjust-method-priorities-and-repeat";
        readonly continues: true;
    };
    readonly theory: {
        readonly bayesianDesign: "rank-methods-by-information-producing-intervention";
        readonly reflectivePractice: "reflection-in-action";
        readonly decolonizingMethodology: "method-accountability-to-the-field";
        readonly reciprocity: "methods-return-value-to-the-observation-community";
        readonly dreaming: "adaptive-method-feedback-without-settlement";
    };
}
export type AperiodicWorldMethodEcologyVerdict = "requisite-variety" | "under-varied" | "method-monoculture";
export interface AperiodicWorldMethodEcologyObligation {
    readonly kind: "knowing.dream.world-method-ecology-obligation";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly priority: "add-variety" | "preserve-conflict" | "return-to-field";
    readonly question: string;
    readonly nextCarrier: "knowing.dream.world-method-repertoire" | "knowing.dream.world-method-feedback";
}
/** Audit whether the method ecology has enough variety for the aperiodic frontier it regulates. */
export interface AperiodicWorldMethodEcology {
    readonly kind: "knowing.dream.world-method-ecology";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly feedback: AperiodicWorldMethodFeedback;
    readonly variety: {
        readonly selectedMethods: number;
        readonly regions: number;
        readonly periods: number;
        readonly nextCarriers: number;
        readonly assessments: number;
        readonly effectiveVariety: number;
        readonly requiredVariety: number;
    };
    readonly verdict: AperiodicWorldMethodEcologyVerdict;
    readonly obligations: readonly AperiodicWorldMethodEcologyObligation[];
    readonly loop: {
        readonly nextCarrier: "knowing.dream.world-method-feedback";
        readonly action: "increase-method-variety-and-repeat";
        readonly continues: true;
    };
    readonly theory: {
        readonly requisiteVariety: "method-variety-must-match-frontier-variety";
        readonly epistemologicalPluralism: "no-single-method-governs-discovery";
        readonly strongObjectivity: "situated-standpoints-increase-reflexive-correction";
        readonly collectiveIntelligence: "heterogeneous-search-can-outperform-homogeneous-search";
        readonly dreaming: "aperiodic-method-ecology";
    };
}
/** Two distinct world methods braided into one combined intervention. */
export interface AperiodicWorldMethodBraidPair {
    readonly kind: "knowing.dream.world-method-braid-pair";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly left: AperiodicWorldMethod;
    readonly right: AperiodicWorldMethod;
    readonly complementarity: {
        readonly regionDifference: boolean;
        readonly periodDifference: boolean;
        readonly carrierDifference: boolean;
        readonly score: number;
    };
    readonly question: string;
    readonly observation: Observation;
}
/** Compose diverse methods into paired interventions so the ecology acts with variety. */
export interface AperiodicWorldMethodBraid {
    readonly kind: "knowing.dream.world-method-braid";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly ecology: AperiodicWorldMethodEcology;
    readonly pairs: readonly AperiodicWorldMethodBraidPair[];
    readonly after: readonly Observation[];
    readonly projected: AperiodicActionResearchCycle;
    readonly loop: {
        readonly currentField: number;
        readonly braidedPairs: number;
        readonly next: "run-action-research-cycle";
        readonly continues: true;
    };
    readonly theory: {
        readonly requisiteVariety: "compose-response-variety";
        readonly epistemologicalPluralism: "methods-check-each-other";
        readonly standpoint: "situated-difference-as-correction";
        readonly collectiveIntelligence: "diverse-heuristics-as-search";
        readonly dreaming: "braided-methods-for-aperiodic-research";
    };
}
export type AperiodicWorldMethodConstellationRelation = "braided-complementarity" | "historical-translation" | "standpoint-tension" | "reciprocity-obligation";
export interface AperiodicWorldMethodConstellationNode {
    readonly kind: "knowing.dream.world-method-constellation-node";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly method: AperiodicWorldMethod;
}
export interface AperiodicWorldMethodConstellationEdge {
    readonly kind: "knowing.dream.world-method-constellation-edge";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly relation: AperiodicWorldMethodConstellationRelation;
    readonly left: AperiodicWorldMethod;
    readonly right: AperiodicWorldMethod;
    readonly weight: number;
    readonly reason: string;
}
/** A graph read of the method ecology: how global methods relate before the next action. */
export interface AperiodicWorldMethodConstellation {
    readonly kind: "knowing.dream.world-method-constellation";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly braid: AperiodicWorldMethodBraid;
    readonly nodes: readonly AperiodicWorldMethodConstellationNode[];
    readonly edges: readonly AperiodicWorldMethodConstellationEdge[];
    readonly topology: {
        readonly components: number;
        readonly connected: boolean;
        readonly isolates: number;
        readonly braidedEdges: number;
        readonly reciprocityEdges: number;
    };
    readonly obligations: readonly AperiodicWorldMethodEcologyObligation[];
    readonly theory: {
        readonly boundaryObjects: "methods-coordinate-without-identical-meanings";
        readonly actorNetwork: "relations-between-methods-change-the-research-field";
        readonly pluriverse: "many-worlds-of-inquiry-without-single-sovereign-method";
        readonly dreaming: "constellated-method-field-for-aperiodic-research";
    };
}
export interface AperiodicWorldMethodWayfindingEvent {
    readonly kind: "knowing.dream.world-method-wayfinding-event";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly edge: AperiodicWorldMethodConstellationEdge;
    readonly from: AperiodicWorldMethod;
    readonly to: AperiodicWorldMethod;
    readonly step: "short" | "long";
    readonly observation: Observation;
    readonly question: string;
}
/** A bounded aperiodic walk through the method constellation. */
export interface AperiodicWorldMethodWayfinding {
    readonly kind: "knowing.dream.world-method-wayfinding";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly transport: "event-stream";
    readonly constellation: AperiodicWorldMethodConstellation;
    readonly events: readonly AperiodicWorldMethodWayfindingEvent[];
    readonly trajectory: {
        readonly emitted: number;
        readonly visitedMethods: number;
        readonly relations: number;
        readonly continues: true;
    };
    readonly theory: {
        readonly graphWalks: "walk-record-as-graph-learning-signal";
        readonly foraging: "aperiodic-search-through-sparse-method-space";
        readonly songlines: "navigation-as-storied-relation";
        readonly ifa: "structured-interpretive-traversal";
        readonly dreaming: "wayfinding-through-method-constellation";
    };
}
export type AperiodicFrontierAgendaPriority = "consolidate" | "experiment" | "organize";
/** One next research obligation derived from a non-terminating action-research stream. */
export interface AperiodicFrontierAgendaItem {
    readonly kind: "knowing.dream.frontier-agenda-item";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly source: AperiodicActionResearchSequenceEvent;
    readonly priority: AperiodicFrontierAgendaPriority;
    readonly score: number;
    readonly question: string;
    readonly next: {
        readonly carrier: "knowing.dream.action-research-cycle";
        readonly reason: string;
    };
}
/** The live agenda: what the non-terminating dream loop should pursue next. */
export interface AperiodicFrontierAgenda {
    readonly kind: "knowing.dream.frontier-agenda";
    readonly regime: "aperiodic";
    readonly sequence: AperiodicActionResearchSequenceResult;
    readonly items: readonly AperiodicFrontierAgendaItem[];
    readonly method: {
        readonly analyze: "rank-residue-by-persistence-and-reachability";
        readonly decide: "prefer-unsettled-recurrent-frontiers";
        readonly act: "feed-next-cycle";
        readonly repeat: true;
    };
    readonly theory: {
        readonly researchProgram: "progressive-problemshift";
        readonly participatoryResearch: "return-results-to-action";
        readonly especifismo: "organized-priority-from-social-insertion";
        readonly dreaming: "agenda-emerges-from-non-convergence";
    };
}
export type AperiodicResearchProgramPhase = "progressive-problemshift" | "open-problemshift" | "degenerating-problemshift";
/** Audit whether the non-terminating research stream is producing progressive novelty. */
export interface AperiodicResearchProgramAudit {
    readonly kind: "knowing.dream.research-program-audit";
    readonly regime: "aperiodic";
    readonly agenda: AperiodicFrontierAgenda;
    readonly assessment: {
        readonly phase: AperiodicResearchProgramPhase;
        readonly finiteBridges: number;
        readonly persistentResidues: number;
        readonly agendaItems: number;
        readonly organize: number;
        readonly experiment: number;
        readonly consolidate: number;
    };
    readonly heuristics: {
        readonly positive: "prefer-cycles-that-produce-new-reachability-or-sharper-residue";
        readonly negative: "do-not-declare-final-settlement-from-one-finite-bridge";
        readonly next: "feed-the-agenda-back-into-action-research";
    };
    readonly theory: {
        readonly lakatos: "progressive-versus-degenerating-problemshift";
        readonly falsBorda: "participatory-return-to-the-field";
        readonly dreaming: "non-termination-with-novelty-audit";
    };
}
/** A conjecture emitted from the aperiodic residue of the dream trajectory. */
export interface AperiodicConjecture {
    readonly kind: "knowing.dream.conjecture";
    readonly index: number;
    readonly regime: "aperiodic";
    readonly maturity: "Research-grade";
    readonly trajectory: {
        readonly kind: "sturmian-golden";
        readonly step: "short" | "long";
        readonly prefix: string;
        readonly neverSettles: true;
    };
    readonly finiteReachability: FiniteRegimeReachability;
    readonly strictRegimeExclusions: readonly StrictRegimeExclusion[];
    readonly novelty: {
        readonly genuinelyNew: true;
        readonly reason: string;
    };
    readonly source: {
        readonly left: Observation;
        readonly right: Observation;
    };
    readonly conjecture: Observation;
}
/** A bounded prefix of the aperiodic dream stream. */
export interface AperiodicDreamResult {
    readonly kind: "knowing.dream.aperiodic-research";
    readonly regime: "aperiodic";
    readonly settles: false;
    readonly transport: "event-stream";
    readonly candidates: readonly AperiodicConjecture[];
    readonly residue: {
        readonly observations: number;
        readonly pairs: number;
        readonly emitted: number;
    };
}
/** Options shared by the dream regimes: where, who observes, and a generation cap. */
export interface DreamOptions {
    readonly at?: Mark;
    readonly observer?: PredicationTerm;
    readonly limit?: number;
    readonly start?: number;
}
/** strict-finite (κ<ω): compose observations where one's object is the next's subject. */
export declare function strictFiniteDream(observations: readonly Observation[], options?: DreamOptions): DreamResult;
/** Scott-continuous (κ=ω): consolidate repeated cells by knowledge-join. */
export declare function scottContinuousDream(observations: readonly Observation[], options?: DreamOptions): DreamResult;
/** transfinite (ω<κ<ω₁): co-predicate every pair sharing a subject. */
export declare function transfiniteDream(observations: readonly Observation[], options?: DreamOptions): DreamResult;
/** Dispatch the three synchronous inward regimes over a single observation set. */
export declare function dreaming(input?: {
    readonly observations?: readonly Observation[];
    readonly regime?: Exclude<DreamRegime, "aperiodic">;
}, options?: DreamOptions): DreamResult;
/** Aperiodic (kappa >= omega_1): stream conjectures from residue no finite regime derives. */
export declare function aperiodicDreamConjectures(observations: readonly Observation[], options?: DreamOptions): Generator<AperiodicConjecture>;
/** Return a bounded prefix of the aperiodic dream stream for request/response callers. */
export declare function aperiodicDream(input?: {
    readonly observations?: readonly Observation[];
    readonly limit?: number;
}, options?: DreamOptions): AperiodicDreamResult;
/** Extract the non-convergent residue as a reusable carrier. */
export declare function aperiodicResidue(observations: readonly Observation[]): AperiodicResidue;
/** Compare finite closure products with genuinely new aperiodic candidates. */
export declare function aperiodicDiscoveryLedger(input?: {
    readonly observations?: readonly Observation[];
    readonly limit?: number;
    readonly start?: number;
}): AperiodicDiscoveryLedger;
/** Design concrete probes that can test whether residue becomes finite-reachable after action. */
export declare function aperiodicPraxisProbes(input?: {
    readonly observations?: readonly Observation[];
    readonly limit?: number;
}): AperiodicPraxisProbeSet;
/** Fold residue into praxis: the non-settling frontier becomes material intervention obligations. */
export declare function aperiodicPraxisFrontier(input?: {
    readonly observations?: readonly Observation[];
    readonly limit?: number;
}): AperiodicPraxisFrontier;
/** Fold intervention results back into dreaming and classify whether finite regimes can now reach. */
export declare function aperiodicPraxisFeedback(input?: {
    readonly before?: readonly Observation[];
    readonly after?: readonly Observation[];
    readonly limit?: number;
}): AperiodicPraxisFeedback;
/** Project the aperiodic residue through local observation windows as a spatiotemporal hologram. */
export declare function aperiodicHologram(input?: {
    readonly observations?: readonly Observation[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
}): AperiodicHologram;
/** Turn recurrent local residue into organized praxis obligations. */
export declare function aperiodicHolographicPraxis(input?: {
    readonly observations?: readonly Observation[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
}): AperiodicHolographicPraxis;
/** Build a conjunctural strategy/program from holographic praxis. */
export declare function aperiodicConjuncturalPraxis(input?: {
    readonly observations?: readonly Observation[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
}): AperiodicConjuncturalPraxis;
/** Run one action-research cycle and keep the next aperiodic frontier open. */
export declare function aperiodicActionResearchCycle(input?: {
    readonly before?: readonly Observation[];
    readonly after?: readonly Observation[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
}): AperiodicActionResearchCycle;
/** Stream action-research cycles over successive observation batches, accumulating the field. */
export declare function aperiodicActionResearchCycles(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
}): Generator<AperiodicActionResearchSequenceEvent>;
/** Return a bounded prefix of the non-terminating action-research sequence. */
export declare function aperiodicActionResearchSequence(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
}): AperiodicActionResearchSequenceResult;
/** Read the non-terminating action-research stream as a metastable aperiodic trajectory. */
export declare function aperiodicMetastableTrajectory(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
}): AperiodicMetastableTrajectory;
/** Choose global-historical research methods fitted to the current aperiodic trajectory. */
export declare function aperiodicWorldMethodRepertoire(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
}): AperiodicWorldMethodRepertoire;
/** Turn selected world methods into concrete next-batch observations and project the next cycle. */
export declare function aperiodicWorldMethodInterventionPlan(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
}): AperiodicWorldMethodInterventionPlan;
/** Evaluate selected world methods by their actual effect on the aperiodic frontier. */
export declare function aperiodicWorldMethodFeedback(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
}): AperiodicWorldMethodFeedback;
/** Audit the global-historical method ecology for requisite variety against the aperiodic frontier. */
export declare function aperiodicWorldMethodEcology(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
}): AperiodicWorldMethodEcology;
/** Braid complementary world methods into combined next-cycle observations. */
export declare function aperiodicWorldMethodBraid(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
    readonly braidLimit?: number;
}): AperiodicWorldMethodBraid;
/** Build a constellation graph over the selected/adapted global method ecology. */
export declare function aperiodicWorldMethodConstellation(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
    readonly braidLimit?: number;
}): AperiodicWorldMethodConstellation;
/** Walk the method constellation with an aperiodic step schedule and emit navigation events. */
export declare function aperiodicWorldMethodWayfinding(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
    readonly methodLimit?: number;
    readonly braidLimit?: number;
    readonly pathLimit?: number;
}): AperiodicWorldMethodWayfinding;
/** Rank the live frontiers produced by an action-research stream into next obligations. */
export declare function aperiodicFrontierAgenda(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
}): AperiodicFrontierAgenda;
/** Audit the research programme carried by a non-terminating frontier agenda. */
export declare function aperiodicResearchProgramAudit(input?: {
    readonly before?: readonly Observation[];
    readonly batches?: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
}): AperiodicResearchProgramAudit;
export declare function admitAperiodicDreamInput(input: JsonValue, verb?: string): {
    readonly observations: readonly Observation[];
    readonly limit?: number;
    readonly start?: number;
};
export declare function admitAperiodicHologramInput(input: JsonValue, verb?: string): {
    readonly observations: readonly Observation[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
};
export declare function admitActionResearchCycleInput(input: JsonValue, verb?: string): {
    readonly before: readonly Observation[];
    readonly after: readonly Observation[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
};
export declare function admitActionResearchSequenceInput(input: JsonValue, verb?: string): {
    readonly before: readonly Observation[];
    readonly batches: readonly (readonly Observation[])[];
    readonly window?: number;
    readonly stride?: number;
    readonly limit?: number;
    readonly candidatesPerWindow?: number;
    readonly cycleLimit?: number;
};
export declare function admitPraxisFeedbackInput(input: JsonValue, verb?: string): {
    readonly before: readonly Observation[];
    readonly after: readonly Observation[];
    readonly limit?: number;
};
export declare const aperiodicDreamAction: Action;
export declare const discoveryLedgerAction: Action;
export declare const praxisProbesAction: Action;
export declare const aperiodicResidueAction: Action;
export declare const praxisFrontierAction: Action;
export declare const aperiodicHologramAction: Action;
export declare const holographicPraxisAction: Action;
export declare const conjuncturalPraxisAction: Action;
export declare const actionResearchCycleAction: Action;
export declare const actionResearchSequenceAction: Action;
export declare const metastableTrajectoryAction: Action;
export declare const worldMethodRepertoireAction: Action;
export declare const worldMethodInterventionPlanAction: Action;
export declare const worldMethodFeedbackAction: Action;
export declare const worldMethodEcologyAction: Action;
export declare const worldMethodBraidAction: Action;
export declare const worldMethodConstellationAction: Action;
export declare const worldMethodWayfindingAction: Action;
export declare const frontierAgendaAction: Action;
export declare const researchProgramAuditAction: Action;
export declare const praxisFeedbackAction: Action;
/** Build a frozen `DreamResult`: its regime, observations, and their knowledge-joined charge. */
export declare function dreamResult(regime: DreamRegime, observations: readonly Observation[]): DreamResult;
//# sourceMappingURL=index.d.mts.map