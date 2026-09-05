/**
 * publics - address, circulation, and counterpublic cost.
 *
 * A public is not just a crowd. In socializing's carrier it is an observer category
 * whose members can address one another, reach common knowledge about an issue, and glue
 * without an H1 obstruction. Counterpublics are modeled without treating them as failures:
 * they are subaltern circulations whose isolation from the dominant address field is an
 * explicit coordination cost.
 */
import { type Action, type ChargeValueName, type JsonRecord } from "@emsenn/relating";
import { type SheafConsensus } from "./consensus.mjs";
import { type CoordinationCurrency } from "./currency.mjs";
import { type CommonKnowledge } from "./epistemics.mjs";
import { type Field } from "./field.mjs";
export interface PublicsInput {
    readonly name?: string;
    readonly field: Field;
    readonly issue?: string;
    readonly minimumAudience?: number;
    readonly reliableChannel?: boolean;
    readonly subalternAgents?: readonly string[];
}
export interface Publics {
    readonly kind: "socializing.publics";
    readonly name: string;
    readonly issue: string;
    readonly audience: readonly string[];
    readonly minimumAudience: number;
    readonly audienceDeficit: number;
    readonly directedAddressEdges: number;
    readonly missingAddressEdges: number;
    readonly issueValues: readonly ChargeValueName[];
    readonly commonKnowledge: CommonKnowledge;
    readonly consensus: SheafConsensus;
    readonly contestedIssueValues: number;
    readonly subalternAgents: readonly string[];
    readonly counterpublic: boolean;
    readonly public: boolean;
    readonly currency: CoordinationCurrency;
    readonly theory: JsonRecord;
}
export declare function publics(input: PublicsInput): Publics;
export declare const publicsAction: Action;
export declare const publicsActions: readonly Action[];
//# sourceMappingURL=publics.d.mts.map