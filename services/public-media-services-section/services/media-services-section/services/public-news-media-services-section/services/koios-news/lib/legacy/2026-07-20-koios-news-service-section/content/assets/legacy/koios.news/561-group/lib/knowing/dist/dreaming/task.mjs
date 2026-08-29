// task.mts — a task is a cell (subject -predicate-> object) the knower holds, the
// unit dreaming recombines. Relating-only: a task is articulated relating data.
import { articulate, cell, predicateOfClaim, } from "@emsenn/relating";
export function taskCell(taskCarrier) {
    return taskCarrier.cell;
}
export function task(input) {
    if (isUtteranceCarrier(input)) {
        const subject = input.token;
        const predicate = predicateOfClaim(input.claim);
        return taskFromCell(input, cell(subject, predicate, subject));
    }
    if (isCellCarrier(input)) {
        return taskFromCell(undefined, input);
    }
    return taskFromCell(undefined, cell(input.subject, input.predicate, input.object ?? input.subject));
}
function taskFromCell(utteranceCarrier, taskCarrier) {
    const carrier = utteranceCarrier ?? Object.freeze({
        kind: "utterance.carrier",
        token: taskCarrier.subject,
        claim: taskCarrier.predicate.claim,
    });
    return Object.freeze({
        kind: "knowing.task",
        utterance: carrier,
        articulation: articulate(carrier),
        subject: taskCarrier.subject,
        predicate: taskCarrier.predicate,
        object: taskCarrier.object,
        cell: taskCarrier,
    });
}
function isUtteranceCarrier(value) {
    return "kind" in value && value.kind === "utterance.carrier";
}
function isCellCarrier(value) {
    return "subject" in value && "predicate" in value && "object" in value;
}
//# sourceMappingURL=task.mjs.map