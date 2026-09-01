/**
 * legitimacy - recognized authority priced as coordination currency.
 *
 * Legitimacy is not mere power. It requires a basis of authority, common knowledge of
 * the claim, accountability for powers, and an absence of symbolic violence. This bridge
 * composes Weber's authority bases, Bourdieu's misrecognition, and the Hohfeldian
 * accountability rule into one priced receipt.
 */
import { type Action, type ChargeValueName, type JsonRecord } from "@emsenn/relating";
import { type CapitalHolder, type SymbolicViolence } from "./bourdieu.mjs";
import { type CoordinationCurrency } from "./currency.mjs";
import { type AuthorityBasis } from "./deciding.mjs";
import { type CommonKnowledge } from "./epistemics.mjs";
import type { Governance, JuralRelation } from "./govern.mjs";
export interface LegitimacyInput {
    readonly name?: string;
    readonly relations?: readonly JuralRelation[];
    readonly governance?: Governance;
    readonly claimant: string;
    readonly scope: string;
    readonly basis?: AuthorityBasis;
    readonly routinizeToward?: "traditional" | "rational-legal";
    readonly holders?: readonly CapitalHolder[];
    readonly commonKnowledgeValues?: readonly ChargeValueName[];
    readonly reliableChannel?: boolean;
}
export interface Legitimacy {
    readonly kind: "socializing.legitimacy";
    readonly name: string;
    readonly claimant: string;
    readonly scope: string;
    readonly basis: AuthorityBasis;
    readonly routinizedBasis: AuthorityBasis;
    readonly commonKnowledge: CommonKnowledge;
    readonly symbolicViolence: SymbolicViolence;
    readonly symbolicTopHolder: string;
    readonly symbolicTopShare: number;
    readonly accountabilityGap: number;
    readonly charismaticInstability: boolean;
    readonly symbolicMonopoly: boolean;
    readonly legitimate: boolean;
    readonly legitimacyCrisis: boolean;
    readonly currency: CoordinationCurrency;
    readonly theory: JsonRecord;
}
export declare function legitimate(input: LegitimacyInput): Legitimacy;
export declare const legitimateAction: Action;
export declare const legitimacyActions: readonly Action[];
//# sourceMappingURL=legitimacy.d.mts.map