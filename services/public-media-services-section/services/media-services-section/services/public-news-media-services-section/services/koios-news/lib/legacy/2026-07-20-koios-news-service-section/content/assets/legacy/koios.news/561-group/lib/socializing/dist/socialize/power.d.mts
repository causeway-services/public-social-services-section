/**
 * power — socializing's VOTING-POWER indices: Banzhaf and Shapley–Shubik. A decision rule reports who
 * ALIGNED; power asks who was DECISIVE. In a weighted voting body the nominal weight is not the power:
 * a large bloc can be a dummy and a small bloc pivotal. For an agent collective this is the right way
 * to weight influence — and to catch a hidden dominator the degree-counting kyriarchy classifier in
 * `govern.mts` would miss (a member pivotal in every winning coalition is a κύριος by power, whatever
 * its nominal weight).
 *
 * Banzhaf (1965): a player's power ∝ the number of coalitions in which it SWINGS (its departure flips
 * a winning coalition to losing). Shapley–Shubik (1954): a player's power ∝ the fraction of join
 * orderings in which it is PIVOTAL (the member whose arrival crosses the quota). Both are computed by
 * exact enumeration over the 2ⁿ⁻¹ / n! structure — bounded to small bodies (the realistic case for a
 * council of agents).
 */
/** The two power indices for one player in a weighted voting game. */
export interface PlayerPower {
    /** the player's nominal weight. */
    readonly weight: number;
    /** Banzhaf index — share of total swings (normalized to sum 1 across players). */
    readonly banzhaf: number;
    /** Shapley–Shubik index — share of pivotal positions over all join orderings (sums to 1). */
    readonly shapleyShubik: number;
    /** a DUMMY: zero power under both indices — never decisive despite its weight. */
    readonly dummy: boolean;
    /** a DICTATOR: full power (both indices = 1) — decisive in every coalition. */
    readonly dictator: boolean;
}
/** The power analysis of a weighted voting game (weights + quota). */
export interface VotingPower {
    readonly kind: "socializing.voting-power";
    readonly quota: number;
    readonly players: readonly PlayerPower[];
}
/**
 * votingPower — the Banzhaf and Shapley–Shubik power of each player in a weighted voting game with the
 * given integer-or-real weights and quota (a coalition wins iff its total weight ≥ quota). Computed by
 * exact enumeration over the 2ⁿ⁻¹ coalitions of the other players; bounded to ≤ 20 players.
 */
export declare function votingPower(weights: readonly number[], quota: number): VotingPower;
//# sourceMappingURL=power.d.mts.map