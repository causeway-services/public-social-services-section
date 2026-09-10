/**
 * codecs/exact-number — the exact-carrier ↔ native-number boundary.
 *
 * The single door where exact carrier numbers (Natural / Integer / Rational /
 * Matrix) cross to and from machine `number` and decimal strings. Core
 * algebra/analysis never import these — they speak carriers; scripts, displays,
 * and inherently-numeric boundary routines decode and encode here.
 */
import { type Integer, type Matrix, type Natural, type Rational } from "../articulating/predicating/positing/settling/analysis/exact-number.mjs";
/** Decode — a natural's member-count as a native number. */
export declare const toCount: (n: Natural) => number;
/** Encode — a non-negative JS integer as a natural by iterated successor. */
export declare function fromCount(value: number): Natural;
/** Decode — an integer to a native number. */
export declare const toInt: (z: Integer) => number;
/** Encode — a native number as an integer. */
export declare const fromInt: (value: number) => Integer;
/** Encode — a native integer as a rational with denominator one. */
export declare const ratFromInt: (value: number) => Rational;
/** Encode — native numerator and denominator as a reduced rational. */
export declare const fromRatio: (num: number, den: number) => Rational;
/** Decode — a rational's native floating-point value (lossy). */
export declare const toNumber: (q: Rational) => number;
/** Encode — rows of native integers as an exact integer Matrix. */
export declare const fromInts: (rows: readonly (readonly number[])[]) => Matrix;
/** Decode — an integer's exact decimal-string form. */
export declare const integerToDecimalString: (z: Integer) => string;
/** Decode — a rational's lossless audit form "num/den". */
export declare const ratToExactString: (q: Rational) => string;
/** Encode — an exact decimal string as a rational with its place-count. */
export declare const parseDecimal: (text: string) => {
    readonly value: Rational;
    readonly places: number;
};
/** Encode — an exact decimal string as a rational, discarding the place-count. */
export declare const fromDecimalString: (text: string) => Rational;
/** Decode — a rational as a fixed-point decimal string, rounded half-up. */
export declare const toDecimalString: (q: Rational, places: number) => string;
//# sourceMappingURL=exact-number.d.mts.map