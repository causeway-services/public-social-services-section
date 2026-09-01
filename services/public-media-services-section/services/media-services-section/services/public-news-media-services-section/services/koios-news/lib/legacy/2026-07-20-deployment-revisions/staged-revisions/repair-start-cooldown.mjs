export const REPAIR_START_COOLDOWN_MILLISECONDS = 4 * 60 * 60 * 1_000;
/**
 * Restrain repetition of one capacity-consuming manuscript purchase, not the
 * whole repair market. A successor carrying a new terminal witness is a new
 * demand; source-intelligence work is a different commodity. Both may cross
 * while the predecessor's anti-thrashing window remains active.
 */
export function repairStartCooldownDecision(input) {
    const active = Number.isFinite(input.latestRepairAt)
        && Number.isFinite(input.pulseAt)
        && input.pulseAt < input.latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS;
    const repeatsPurchasedRepair = input.candidateCommodity === "manuscript-repair"
        && input.candidateAssignmentId !== undefined
        && input.latestPurchasedAssignmentId !== undefined
        && input.candidateAssignmentId === input.latestPurchasedAssignmentId;
    return Object.freeze({
        active,
        repeatsPurchasedRepair,
        blocked: active && repeatsPurchasedRepair && input.sameMechanism,
        changedMechanismCrossing: active && repeatsPurchasedRepair && !input.sameMechanism,
        ...(active ? { nextEligibleAt: new Date(input.latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS).toISOString() } : {}),
    });
}
//# sourceMappingURL=repair-start-cooldown.mjs.map