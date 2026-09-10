/**
 * codecs/text — the plain-string boundary.
 *
 * The default wire form for the articulation family: a Mark payload is an opaque
 * string. This projector carries the raw content as a single JSON string value,
 * so it composes in one catalog with the JSON and EAVT projectors.
 */
import { type Projector } from "../holography/index.mjs";
import type { JsonValue } from "./json.mjs";
/** The string projector: recognizes any content, carries it verbatim as one value. */
export declare const stringProjector: Projector<JsonValue>;
//# sourceMappingURL=text.d.mts.map