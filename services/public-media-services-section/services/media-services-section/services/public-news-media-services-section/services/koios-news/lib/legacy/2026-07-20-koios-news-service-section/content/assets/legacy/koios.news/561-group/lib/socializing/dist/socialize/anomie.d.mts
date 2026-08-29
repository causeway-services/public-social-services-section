/**
 * anomie - normlessness and strain priced as coordination currency.
 *
 * Durkheim's anomie is regulatory failure; Merton's strain is the mismatch between
 * valued goals and legitimate means. In this package both become computable gaps in a
 * jural/common-knowledge field: norms absent, norms contested, means missing, authority
 * unaccountable, or contradiction recuperated instead of organized.
 */
import { type Action, type ChargeValueName, type JsonRecord } from "@emsenn/relating";
import { type CoordinationCurrency } from "./currency.mjs";
import { type CommonKnowledge } from "./epistemics.mjs";
import type { Governance, JuralRelation } from "./govern.mjs";
export interface AnomieInput {
    readonly name?: string;
    readonly relations?: readonly JuralRelation[];
    readonly governance?: Governance;
    readonly commonKnowledgeValues?: readonly ChargeValueName[];
    readonly reliableChannel?: boolean;
    readonly goals?: readonly string[];
    readonly means?: readonly string[];
    readonly exitOpen?: boolean;
    readonly recuperated?: boolean;
}
export interface Anomie {
    readonly kind: "socializing.anomie";
    readonly name: string;
    readonly observers: number;
    readonly normClaims: number;
    readonly normlessness: boolean;
    readonly contestedNorms: number;
    readonly goalMeansGap: number;
    readonly accountabilityGap: number;
    readonly obstruction: number;
    readonly commonKnowledge: CommonKnowledge;
    readonly exitOpen: boolean;
    readonly recuperated: boolean;
    readonly verdict: "integrated" | "strained" | "anomic";
    readonly currency: CoordinationCurrency;
    readonly theory: JsonRecord;
}
export declare function anomie(input: AnomieInput): Anomie;
export declare const anomieAction: Action;
export declare const anomieActions: readonly Action[];
//# sourceMappingURL=anomie.d.mts.map