/**
 * Views and innocence — the Hyland-Ong local-memory reading of chronicles.
 *
 * Hyland-Ong innocence says a strategy's next Proponent move is determined by
 * the Proponent view, not by the whole hidden history. Faggian-Hyland's bridge
 * from ludics to game semantics makes this live directly on our existing
 * chronicle grain: designs yield chronicles, and chronicles yield player views.
 *
 * No new strategy datatype is introduced. Actions already route through the
 * Design charge valuation (`positive`/`negative`/`daimon` from relating's
 * four-valued charge), so view-dependence is another reading of the same carrier.
 */
import { type Action } from "./action.mjs";
import { type Chronicle } from "./chronicle.mjs";
import { type Design } from "./design.mjs";
export type PlayerPerspective = "proponent" | "opponent";
export interface PlayerView {
    readonly kind: "game.view";
    readonly perspective: PlayerPerspective;
    readonly actions: readonly Action[];
}
export interface InnocenceWitness {
    readonly kind: "game.innocence:witness";
    readonly design: Design;
    readonly decisions: readonly InnocentDecision[];
}
export interface InnocenceObstruction {
    readonly kind: "game.innocence-obstruction";
    readonly design: Design;
    readonly view: PlayerView;
    readonly expected: Action;
    readonly actual: Action;
    readonly reason: string;
}
export interface InnocentDecision {
    readonly view: PlayerView;
    readonly next: Action;
}
export type InnocenceJudgment = InnocenceWitness | InnocenceObstruction;
export declare const viewOfChronicle: (chronicle: Chronicle, perspective?: PlayerPerspective) => PlayerView;
export declare const viewsOfDesign: (design: Design, perspective?: PlayerPerspective) => readonly PlayerView[];
/**
 * Judge Proponent innocence over the finite chronicle presentation of a Design:
 * whenever two chronicle prefixes have the same Proponent view, the next
 * Proponent action must be the same. This is the finite, carrier-level analogue
 * of the Hyland-Ong innocence condition.
 */
export declare function innocenceJudgment(design: Design): InnocenceJudgment;
export declare const isInnocent: (design: Design) => boolean;
//# sourceMappingURL=view.d.mts.map