import type { ChargeValueName } from "@emsenn/relating";
export type ChargeBearing = Readonly<{
    charge: Readonly<{
        value: readonly unknown[];
    }>;
}>;
export declare function chargeValueFromBits(positive: boolean, negative: boolean): ChargeValueName;
export declare function chargeBits(value: ChargeValueName): readonly [boolean, boolean];
export declare function chargeValueFromEvidence(items: Iterable<ChargeBearing>): ChargeValueName;
//# sourceMappingURL=admission.d.mts.map