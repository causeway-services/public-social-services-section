export const REPAIR_START_COOLDOWN_MILLISECONDS = 4 * 60 * 60 * 1_000;

export type RepairStartCooldownDecision = Readonly<{
  active: boolean;
  repeatsPurchasedRepair: boolean;
  blocked: boolean;
  changedMechanismCrossing: boolean;
  nextEligibleAt?: string;
}>;

/**
 * Restrain repetition of one capacity-consuming manuscript-repair lineage,
 * not the whole repair market. Legacy `:repair:` successor ids are the same
 * purchase lineage and cannot evade the cooldown. Source-intelligence work is
 * a different commodity and may still cross.
 */
export function repairStartCooldownDecision(input: Readonly<{
  pulseAt: number;
  latestRepairAt: number;
  latestPurchasedAssignmentId?: string;
  candidateAssignmentId?: string;
  candidateCommodity?: "source-intelligence" | "manuscript-repair";
  sameMechanism: boolean;
}>): RepairStartCooldownDecision {
  const active = Number.isFinite(input.latestRepairAt)
    && Number.isFinite(input.pulseAt)
    && input.pulseAt < input.latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS;
  const repairLineage = (value: string) => value.split(":repair:", 1)[0]!;
  const repeatsPurchasedRepair = input.candidateCommodity === "manuscript-repair"
    && input.candidateAssignmentId !== undefined
    && input.latestPurchasedAssignmentId !== undefined
    && repairLineage(input.candidateAssignmentId) === repairLineage(input.latestPurchasedAssignmentId);
  return Object.freeze({
    active,
    repeatsPurchasedRepair,
    blocked: active && repeatsPurchasedRepair && input.sameMechanism,
    changedMechanismCrossing: active && repeatsPurchasedRepair && !input.sameMechanism,
    ...(active ? { nextEligibleAt: new Date(input.latestRepairAt + REPAIR_START_COOLDOWN_MILLISECONDS).toISOString() } : {}),
  });
}
