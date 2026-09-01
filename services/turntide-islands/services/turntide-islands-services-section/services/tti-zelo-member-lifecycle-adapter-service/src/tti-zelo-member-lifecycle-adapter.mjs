const IDENTIFIER = /^[A-Za-z][A-Za-z0-9._:-]{0,127}$/u;
const LIFECYCLE_KINDS = new Set(["arrival", "leave", "milestone", "reengagement"]);

function plain(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError(`${label} must be a plain object`);
  return value;
}
function exact(value, fields, label) {
  const keys = Object.keys(value).sort(), expected = [...fields].sort();
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) throw new TypeError(`${label} fields invalid`);
}
function identifier(value, label) { if (typeof value !== "string" || !IDENTIFIER.test(value)) throw new TypeError(`${label} must be an identifier`); return value; }
function snowflake(value, label) { if (typeof value !== "string" || !/^[0-9]{17,20}$/u.test(value)) throw new TypeError(`${label} must be a Discord snowflake`); return value; }
function clone(value) { const copy = structuredClone(value); const visit = (item) => { if (item && typeof item === "object") { Object.values(item).forEach(visit); Object.freeze(item); } }; visit(copy); return copy; }

/** Creates only a generic Zelo shadow config; no member record or Discord transport enters this boundary. */
export function prepareTtiZeloMemberLifecycleShadowConfig(input) {
  const value = plain(input, "TTI lifecycle configuration");
  exact(value, ["admittedKinds", "communityId", "establishedJourney", "execution", "guildId", "humanOwner", "policy", "reengagement", "sources", "status", "type", "version"], "TTI lifecycle configuration");
  if (value.type !== "TTIZeloMemberLifecycleConfiguration" || value.version !== 1 || value.status !== "shadow-only" || value.execution !== "forbidden-pending-reviewed-admission") throw new TypeError("TTI lifecycle must remain shadow-only");
  snowflake(value.guildId, "guild id"); const communityId = identifier(value.communityId, "community id");
  const journey = plain(value.establishedJourney, "established journey");
  exact(journey, ["arrival", "replacement", "selection"], "established journey");
  if (journey.replacement !== "forbidden" || !String(journey.arrival).includes("#dock") || !String(journey.selection).includes("#channel-visas")) throw new TypeError("incumbent dock and channel-visas journey must be preserved");
  const reengagement = plain(value.reengagement, "reengagement");
  exact(reengagement, ["rule", "status"], "reengagement");
  if (reengagement.status !== "disabled-pending-explicit-revocable-opt-in-process") throw new TypeError("TTI reengagement is not admitted");
  if (!Array.isArray(value.admittedKinds) || value.admittedKinds.length === 0 || value.admittedKinds.some((kind) => !LIFECYCLE_KINDS.has(kind)) || value.admittedKinds.includes("reengagement") || new Set(value.admittedKinds).size !== value.admittedKinds.length) throw new TypeError("only explicitly admitted non-reengagement lifecycle kinds are allowed");
  if (!Array.isArray(value.sources) || value.sources.length === 0 || value.sources.some((source) => typeof source !== "string" || !(source.startsWith("content/") || source.startsWith("data/")))) throw new TypeError("public provenance sources required");
  if (typeof value.humanOwner !== "string" || value.humanOwner.trim() === "" || value.humanOwner.length > 256) throw new TypeError("human owner is required");
  return clone({ type: "ZeloMemberLifecycleShadowConfig", version: 1, communityId, purpose: "tti-member-lifecycle-review", permittedKinds: value.admittedKinds, policy: value.policy });
}
