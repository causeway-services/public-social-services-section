/**
 * institution - bridges that turn social forms into priced coordination work.
 *
 * institutionalize reads when practices have hardened into a durable institution
 * without becoming a self-referential racket; recognition reads whether domination is
 * misrecognized as legitimacy or contested into visibility. Both emit
 * coordination-currency cells, so the sociological verdict and the priced obligation
 * are one receipt.
 */
import { type Action } from "@emsenn/relating";
import { type CapitalHolder, type SymbolicViolence } from "./bourdieu.mjs";
import { type CommonKnowledge } from "./epistemics.mjs";
import type { JuralRelation } from "./govern.mjs";
import { type RacketIndex, type VitalityReading } from "./integrity.mjs";
import { type CommonsInstitution, type OstromDiagnostic } from "./ostrom.mjs";
import { type CoordinationCurrency } from "./currency.mjs";
import type { GovernanceLevel } from "./deciding.mjs";
import type { Regime } from "./regime.mjs";
export interface InstitutionalizationInput {
    readonly name?: string;
    readonly institution: CommonsInstitution;
    readonly actLevels?: readonly GovernanceLevel[];
    readonly regime?: Regime;
    readonly concentration?: number;
    readonly exitOpen?: boolean;
}
export interface Institutionalization {
    readonly kind: "socializing.institutionalization";
    readonly name: string;
    readonly diagnostic: OstromDiagnostic;
    readonly racket: RacketIndex;
    readonly vitality: VitalityReading;
    readonly institutionalized: boolean;
    readonly enduring: boolean;
    readonly currency: CoordinationCurrency;
}
export interface RecognitionInput {
    readonly relations: readonly JuralRelation[];
    readonly agent: string;
    readonly scope: string;
    readonly holders?: readonly CapitalHolder[];
    readonly commonKnowledgeValues?: readonly ("potential" | "active" | "stable" | "absurd")[];
    readonly reliableChannel?: boolean;
}
export interface Recognition {
    readonly kind: "socializing.recognition";
    readonly agent: string;
    readonly scope: string;
    readonly symbolicViolence: SymbolicViolence;
    readonly commonKnowledge: CommonKnowledge;
    readonly symbolicTopHolder: string;
    readonly symbolicTopShare: number;
    readonly recognized: boolean;
    readonly misrecognized: boolean;
    readonly contested: boolean;
    readonly currency: CoordinationCurrency;
}
export declare function institutionalize(input: InstitutionalizationInput): Institutionalization;
export declare function recognition(input: RecognitionInput): Recognition;
export declare const institutionalizeAction: Action;
export declare const recognitionAction: Action;
export declare const institutionActions: readonly Action[];
//# sourceMappingURL=institution.d.mts.map