/**
 * boundary-work - classification, translation, and policing priced as coordination cost.
 *
 * Boundary-work is the labor of saying who counts, who does not, and which crossings
 * are possible. The reading combines socializing's observer-category translations with
 * Hohfeldian jural relations: a boundary can be legible, porous, exclusionary, contested,
 * or policed. The anarchist/autonomist pressure is to keep exodus/refusal visible as a
 * priced relation rather than naturalizing the border.
 */
import { type Action, type JsonRecord } from "@emsenn/relating";
import { type CoordinationCurrency } from "./currency.mjs";
import type { Field } from "./field.mjs";
import type { JuralRelation } from "./govern.mjs";
export interface BoundaryWorkInput {
    readonly name?: string;
    readonly field?: Field;
    readonly relations?: readonly JuralRelation[];
    readonly insiders: readonly string[];
    readonly outsiders: readonly string[];
    readonly criterion?: string;
    readonly subalternAgents?: readonly string[];
}
export interface BoundaryWork {
    readonly kind: "socializing.boundary-work";
    readonly name: string;
    readonly criterion: string;
    readonly insiders: readonly string[];
    readonly outsiders: readonly string[];
    readonly ambiguousAgents: readonly string[];
    readonly crossBoundaryTranslations: number;
    readonly missingCrossBoundaryTranslations: number;
    readonly policingRelations: number;
    readonly contestedBoundaryRelations: number;
    readonly subalternExcluded: number;
    readonly legible: boolean;
    readonly porous: boolean;
    readonly exclusionary: boolean;
    readonly currency: CoordinationCurrency;
    readonly theory: JsonRecord;
}
export declare function boundaryWork(input: BoundaryWorkInput): BoundaryWork;
export declare const boundaryWorkAction: Action;
export declare const boundaryWorkActions: readonly Action[];
//# sourceMappingURL=boundary.d.mts.map