/**
 * socialize/assertions - assertion-world reads over the Social Field.
 *
 * This cannibalizes the useful part of animating-experimental's assertion worlds
 * into socializing: an EAV assertion is admitted as an observer-local meme, and
 * disagreement is a derived multi-observer read over contrary predicates. There
 * is no second World carrier here; the Social Field remains the one socializing
 * carrier, and federation is still merge/settle/converge over observer stalks.
 */
import { type Action, type JsonValue, type Meme } from "@emsenn/relating";
import { type Field } from "./field.mjs";
import { type AssertionDisagreements } from "../carriers.mjs";
export interface SocialAssertion {
    readonly e: JsonValue;
    readonly a: string;
    readonly v: JsonValue;
    readonly t?: JsonValue;
    readonly source?: string;
}
export interface AssertionDisagreement {
    readonly subject: JsonValue;
    readonly predicate: string;
    readonly contrary: string;
    readonly object: JsonValue;
    readonly observers: readonly number[];
    readonly contraryObservers: readonly number[];
    readonly value: "stable";
}
/** Convert one EAV assertion into the meme this observer locally holds. */
export declare function assertionMeme(assertion: SocialAssertion): Meme;
/** Admit assertions into one observer's local stalk. */
export declare function admitAssertions(field: Field, observer: number, assertions: readonly SocialAssertion[]): Field;
/** Endomorphic action: add EAV claims to an observer's local meme stalk. */
export declare const assertAction: Action;
/** Derive stable disagreements from contrary predicates held over the same subject/object. */
export declare function assertionDisagreements(field: Field, declared?: Record<string, string>): AssertionDisagreements;
/** Read action: derive assertion disagreements from a social field. */
export declare const assertionDisagreementsAction: Action;
//# sourceMappingURL=assertions.d.mts.map