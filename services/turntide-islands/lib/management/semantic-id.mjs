import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

/**
 * The canonical semantic content id (ni: token) for a turntide-islands record.
 * @param {unknown} value - the record to identify
 * @returns {string} the semantic content token
 */
export function semanticId(value) {
  return identifyJsonSemanticContent({ objectKind: "turntide-islands.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
}
