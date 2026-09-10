import { type ChargeDistributionCarrier, type JointChargeDistributionCarrier } from "../articulating/predicating/positing/settling/analysis/evidence.mjs";
/** Shannon entropy in bits: a float boundary read of an exact distribution. */
export declare function entropyBitsAtBoundary(distribution: ChargeDistributionCarrier): number;
/** Divergence of `from` relative to `to` in bits: a float boundary read.
 * Infinite exactly when `absoluteContinuity(from, to)` obstructs. */
export declare function klBitsAtBoundary(from: ChargeDistributionCarrier, to: ChargeDistributionCarrier): number;
/** Mutual information in bits: a float boundary read. Zero exactly when
 * `independence(joint)` witnesses. */
export declare function mutualInformationBitsAtBoundary(joint: JointChargeDistributionCarrier): number;
//# sourceMappingURL=evidence.d.mts.map