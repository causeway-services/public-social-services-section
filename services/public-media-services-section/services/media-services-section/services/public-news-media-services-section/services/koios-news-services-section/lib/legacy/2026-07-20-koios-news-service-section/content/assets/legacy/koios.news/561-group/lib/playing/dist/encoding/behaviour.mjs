import { decodeDesign, encodeDesign } from "./design.mjs";
import { asArray, asObject, field } from "./json.mjs";
/** Encode a behaviour witness to `{carrier: [design, ...]}`. */
export function encodeBehaviour(value) {
    return { carrier: value.carrier.map(encodeDesign) };
}
/** Decode `{carrier: [design, ...]}` back to a frozen `BehaviourWitness`. */
export function decodeBehaviour(json) {
    const obj = asObject(json, "behaviour");
    const carrier = asArray(field(obj, "carrier", "behaviour"), "behaviour.carrier").map(decodeDesign);
    return Object.freeze({
        kind: "game.behaviour:witness",
        carrier: Object.freeze(carrier),
    });
}
//# sourceMappingURL=behaviour.mjs.map