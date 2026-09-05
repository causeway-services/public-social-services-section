import type { Field } from "./field.mjs";
/** The scapegoat reading over a before/after transition. */
export interface ScapegoatVerdict {
    readonly kind: "socializing.scapegoat";
    /** contested (⊤) cells before — the sacrificial crisis: undifferentiated mimetic rivalry. */
    readonly priorContested: number;
    /** contested cells after the expulsion. */
    readonly posteriorContested: number;
    /** the expelled was present before. */
    readonly expelledPresentBefore: boolean;
    /** the expelled is absent after. */
    readonly expelledAbsentAfter: boolean;
    /** exactly ONE member was removed (unanimity-minus-one, not a general schism). */
    readonly exactlyOneRemoved: boolean;
    /** the remainder is UNANIMOUS after — the peace the expulsion purchased (no contested cells left). */
    readonly unanimousAfter: boolean;
    /** the expulsion was COERCED (not the victim's own choice) — a scapegoating, not a voluntary secession. */
    readonly coerced: boolean;
    /** the SCAPEGOAT mechanism: a crisis resolved by coercively expelling one member into posterior
     *  unanimity — forced convergence by sacrifice, the malign twin of consensus. */
    readonly scapegoat: boolean;
}
/**
 * scapegoatDetector — detect Girard's scapegoat mechanism across a before/after transition: a field in
 * sacrificial crisis (contested ⊤ present) resolved by coercively expelling exactly one member, after
 * which the remainder is unanimous. This is consensus reached by expulsion rather than agreement — a
 * coerced secession imposed on a victim, distinct from a voluntary withdrawal (`voluntary` true), and the
 * worst case of recuperation (the crisis discharged onto a body).
 */
export declare function scapegoatDetector(before: Field, after: Field, expelled: string, voluntary: boolean): ScapegoatVerdict;
//# sourceMappingURL=girard.d.mts.map