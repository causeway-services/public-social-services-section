import { decodeCharge, encodeCharge } from "./charge.mjs";
import { decodeDesign, encodeDesign } from "./design.mjs";
import { decodeLocus, encodeLocus } from "./locus.mjs";
import { asArray, asBoolean, asObject, asString, field } from "./json.mjs";
const DESIGN_ACTS = ["proponent", "opponent", "daimon", "none"];
function decodeAct(json, what) {
    const name = asString(json, what);
    if (!DESIGN_ACTS.includes(name)) {
        throw new TypeError(`game-codecs: expected design act for ${what}, got ${JSON.stringify(json)}`);
    }
    return name;
}
function encodeMeeting(value) {
    return {
        locus: encodeLocus(value.locus),
        left: value.left,
        right: value.right,
        joined: encodeCharge(value.joined),
        daimonized: value.daimonized,
    };
}
function decodeMeeting(json) {
    const obj = asObject(json, "meeting");
    const locusValue = decodeLocus(field(obj, "locus", "meeting"));
    const left = decodeAct(field(obj, "left", "meeting"), "meeting.left");
    const right = decodeAct(field(obj, "right", "meeting"), "meeting.right");
    const joined = decodeCharge(field(obj, "joined", "meeting"));
    const daimonized = asBoolean(field(obj, "daimonized", "meeting"), "meeting.daimonized");
    return Object.freeze({
        kind: "game.interaction.meeting",
        locus: locusValue,
        left,
        right,
        joined,
        daimonized,
    });
}
/** Encode an interaction report to `{normalForm, meetings, daimonLoci}`. */
export function encodeInteractionReport(value) {
    return {
        normalForm: encodeDesign(value.normalForm),
        meetings: value.meetings.map(encodeMeeting),
        daimonLoci: value.daimonLoci.map(encodeLocus),
    };
}
/** Decode `{normalForm, meetings, daimonLoci}` back to a frozen `InteractionReport`. */
export function decodeInteractionReport(json) {
    const obj = asObject(json, "interactionReport");
    const normalForm = decodeDesign(field(obj, "normalForm", "interactionReport"));
    const meetings = asArray(field(obj, "meetings", "interactionReport"), "interactionReport.meetings").map(decodeMeeting);
    const daimonLoci = asArray(field(obj, "daimonLoci", "interactionReport"), "interactionReport.daimonLoci").map(decodeLocus);
    return Object.freeze({
        kind: "game.interaction.report",
        normalForm,
        meetings: Object.freeze(meetings),
        daimonLoci: Object.freeze(daimonLoci),
    });
}
//# sourceMappingURL=interaction.mjs.map