/**
 * authority - organizing's office-conferred authority read.
 *
 * This cannibalizes the office/authority half of animating-experimental's
 * dispatch algebra. Computing owns local capability-token admission; organizing
 * owns the social-scale question where an agent's capabilities are joined with
 * an office's conferred authorities and read against work/operation requirements.
 */
import { arrayTerm, objectTerm, stringTerm, tm } from "@emsenn/relating";
const boolFalse = tm.bool(false);
const boolTrue = tm.bool(true);
const isEmptyArrayTerm = (value) => tm.coincide(value, arrayTerm([]));
const andTerm = (left, right) => tm.cond(left, right, boolFalse);
/** `member x list` for array-encoded carrier terms. */
const memberTerm = tm.lam(tm.lam(tm.fold(tm.lam(tm.lam(tm.cond(tm.var(1), boolTrue, tm.coincide(tm.var(3), tm.var(0))))), boolFalse, tm.var(0))));
function missingFromTerm(requiredField, providedField) {
    return tm.fold(tm.lam(tm.lam(tm.cond(tm.app(tm.app(memberTerm, tm.var(0)), tm.field(providedField, tm.var(2))), tm.var(1), tm.append(tm.var(1), arrayTerm([tm.var(0)]))))), arrayTerm([]), tm.field(requiredField, tm.var(0)));
}
function gapOf(missingCapabilities, missingAuthorities) {
    const capabilityOk = missingCapabilities.length === 0;
    const authorityOk = missingAuthorities.length === 0;
    return capabilityOk && authorityOk
        ? "none"
        : !capabilityOk && !authorityOk
            ? "both"
            : capabilityOk ? "authority" : "capability";
}
/** Direct reader for office-conferred eligibility. */
export function officeEligibility(request) {
    const capabilities = new Set(request.capabilities);
    const authorities = new Set(request.officeAuthorities);
    const missingCapabilities = Object.freeze(request.requiresCapabilities.filter((required) => !capabilities.has(required)));
    const missingAuthorities = Object.freeze(request.requiresAuthorities.filter((required) => !authorities.has(required)));
    const eligible = missingCapabilities.length === 0 && missingAuthorities.length === 0;
    return Object.freeze({
        kind: "organizing.office-eligibility-decision",
        eligible,
        status: eligible ? "potential" : "active",
        gap: gapOf(missingCapabilities, missingAuthorities),
        missingCapabilities,
        missingAuthorities,
    });
}
const gapTerm = (missingCapabilities, missingAuthorities) => {
    const capabilityOk = isEmptyArrayTerm(missingCapabilities);
    const authorityOk = isEmptyArrayTerm(missingAuthorities);
    return tm.cond(andTerm(capabilityOk, authorityOk), stringTerm("none"), tm.cond(capabilityOk, stringTerm("authority"), tm.cond(authorityOk, stringTerm("capability"), stringTerm("both"))));
};
/** Relational IR body: OfficeEligibilityRequest -> OfficeEligibilityDecision. */
export const officeEligibilityTerm = tm.lam(tm.app(tm.app(tm.lam(tm.lam(objectTerm([
    ["kind", stringTerm("organizing.office-eligibility-decision")],
    ["eligible", andTerm(isEmptyArrayTerm(tm.var(1)), isEmptyArrayTerm(tm.var(0)))],
    ["status", tm.cond(andTerm(isEmptyArrayTerm(tm.var(1)), isEmptyArrayTerm(tm.var(0))), stringTerm("potential"), stringTerm("active"))],
    ["gap", gapTerm(tm.var(1), tm.var(0))],
    ["missingCapabilities", tm.var(1)],
    ["missingAuthorities", tm.var(0)],
]))), missingFromTerm("requiresCapabilities", "capabilities")), missingFromTerm("requiresAuthorities", "officeAuthorities")));
/** Boundary admission for the office-eligibility action. */
export function admitOfficeEligibilityRequest(input, verb) {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError(`${verb}: expected an organizing.office-eligibility-request carrier`);
    }
    if (input.kind !== "organizing.office-eligibility-request") {
        throw new TypeError(`${verb}: expected kind organizing.office-eligibility-request`);
    }
    return input;
}
//# sourceMappingURL=authority.mjs.map