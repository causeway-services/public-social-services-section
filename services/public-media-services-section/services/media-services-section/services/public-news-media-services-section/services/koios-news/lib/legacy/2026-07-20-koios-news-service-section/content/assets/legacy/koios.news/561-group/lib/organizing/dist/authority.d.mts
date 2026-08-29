/**
 * authority - organizing's office-conferred authority read.
 *
 * This cannibalizes the office/authority half of animating-experimental's
 * dispatch algebra. Computing owns local capability-token admission; organizing
 * owns the social-scale question where an agent's capabilities are joined with
 * an office's conferred authorities and read against work/operation requirements.
 */
import { type JsonValue, type Tm } from "@emsenn/relating";
import type { OfficeEligibilityDecision } from "./schemas.mjs";
import type { OfficeEligibilityRequest } from "./schemas.mjs";
export type EligibilityGap = OfficeEligibilityDecision["gap"];
export type { OfficeEligibilityDecision } from "./schemas.mjs";
export type { OfficeEligibilityRequest } from "./schemas.mjs";
/** Direct reader for office-conferred eligibility. */
export declare function officeEligibility(request: OfficeEligibilityRequest): OfficeEligibilityDecision;
/** Relational IR body: OfficeEligibilityRequest -> OfficeEligibilityDecision. */
export declare const officeEligibilityTerm: Tm;
/** Boundary admission for the office-eligibility action. */
export declare function admitOfficeEligibilityRequest(input: JsonValue, verb: string): OfficeEligibilityRequest;
//# sourceMappingURL=authority.d.mts.map