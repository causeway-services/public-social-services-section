/**
 * acting/action — the boundary-morphism class: an action is a cocone leg.
 *
 * An `action` registers, at the morphism's own definition, "a boundary morphism
 * with declared domain/codomain and the metadata OpenAPI and MCP require." It is
 * categorically a cocone leg: it injects one operation into the package's call
 * surface, whose coproduct apex `induceBins` assembles. `run` is the PURE
 * morphism over the decoded carrier; `in`/`out` name the default wire codecs
 * (string for the articulation family, JSON for composition); summary,
 * description, and the schemas are the documentation slots the transports read.
 *
 * The action carries utterance facts about itself, so the discovery carrier is
 * built from carriers, never from a second metadata model.
 */
import { mark, utterance } from "../articulating/index.mjs";
import { wireCodec } from "./codecs.mjs";
/** Register an action. Validates the verb and witnesses the wire codec names. */
export function action(spec) {
    if (!spec.verb || spec.verb.trim() === "")
        throw new TypeError("action: verb is required");
    const inName = spec.in ?? "json";
    const outName = spec.out ?? "json";
    wireCodec(inName);
    wireCodec(outName);
    return Object.freeze({
        kind: "relating.action",
        verb: spec.verb,
        in: inName,
        out: outName,
        options: Object.freeze([...(spec.options ?? [])]),
        ...(spec.summary === undefined ? {} : { summary: spec.summary }),
        ...(spec.description === undefined ? {} : { description: spec.description }),
        ...(spec.inputSchema === undefined ? {} : { inputSchema: spec.inputSchema }),
        ...(spec.outputSchema === undefined ? {} : { outputSchema: spec.outputSchema }),
        run: spec.run,
    });
}
/** Type guard: a value is an action carrier. */
export function isAction(value) {
    return typeof value === "object" && value !== null && value.kind === "relating.action";
}
/** A relational fact as an utterance: token mark = {subject, object}, claim mark = predicate. */
export function fact(subject, predicate, object) {
    return utterance(mark({ subject, object }), mark(predicate));
}
/** The utterance facts an action carries about itself — the leg's content. */
export function actionUtterances(act) {
    const term = `relating.action.${act.verb}`;
    const facts = [
        fact(term, "relating.action.has-verb", act.verb),
        fact(term, "relating.action.accepts-codec", act.in),
        fact(term, "relating.action.emits-codec", act.out),
    ];
    if (act.summary !== undefined)
        facts.push(fact(term, "relating.action.summary", act.summary));
    if (act.description !== undefined)
        facts.push(fact(term, "relating.action.description", act.description));
    return Object.freeze(facts);
}
//# sourceMappingURL=action.mjs.map