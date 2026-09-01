import { type ChargeValueName, type UtteranceCarrier } from "@emsenn/relating";
export declare class UtteranceLog {
    #private;
    constructor(utterances?: readonly UtteranceCarrier[]);
    get utterances(): readonly UtteranceCarrier[];
    admit(...utterances: readonly UtteranceCarrier[]): UtteranceLog;
}
/** A cell address in middleware vocabulary: plain values, not yet terms. */
export type WitnessCell = Readonly<{
    subject: unknown;
    predicate: unknown;
    object: unknown;
}>;
/** Whether an utterance claims the contrary predicate of its cell. */
export declare function isContraryUtterance(carrier: UtteranceCarrier): boolean;
/** The utterances a bit-pair fact decodes to: the truth side utters the
 * cell's claim, the falsity side utters the contrary claim. */
export declare function factUtterances(cell: WitnessCell, sides: readonly [boolean, boolean]): readonly UtteranceCarrier[];
/** Admit a fact into the log. Accretive, chainable — the write half of the
 * old MemeStore.store. */
export declare function witness(log: UtteranceLog, cell: WitnessCell, sides: readonly [boolean, boolean]): UtteranceLog;
/** Fold utterances to a charge name: truth present iff any claim is uttered
 * plain, falsity present iff any contrary claim is uttered. Empty folds to
 * "absurd". */
export declare function chargeOfUtterances(utterances: Iterable<UtteranceCarrier>): ChargeValueName;
/** The plain values at an utterance's cell, in middleware vocabulary. The
 * contrary claim reads back to the BASE predicate — the two opposed claims
 * address the same middleware fact. */
export declare function cellValues(carrier: UtteranceCarrier): WitnessCell;
/** Utterances whose middleware cell matches the given values (bedrock mark
 * coincidence), in admission order. Omitted fields match anything — the
 * partial-address scan. Both the plain and the contrary claim at a cell
 * match its address. */
export declare function recallWhere(log: UtteranceLog, where: Partial<WitnessCell>): readonly UtteranceCarrier[];
/** Recall a cell's utterances (plain and contrary claims), in admission order. */
export declare function recallCell(log: UtteranceLog, cell: WitnessCell): readonly UtteranceCarrier[];
/** The charge currently at a cell — the read half of the old recall-and-fold. */
export declare function chargeAt(log: UtteranceLog, cell: WitnessCell): ChargeValueName;
//# sourceMappingURL=witness.d.mts.map