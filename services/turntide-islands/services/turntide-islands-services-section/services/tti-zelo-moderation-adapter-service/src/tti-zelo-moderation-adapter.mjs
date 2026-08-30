const ACTIONS = new Set(["warn", "timeout", "remove-role", "restore-role"]);
const synthetic = (value, label) => { if (typeof value !== "string" || !/^synthetic-[A-Za-z0-9._:-]+$/u.test(value)) throw new TypeError(`${label} must be synthetic`); return value; };
const plain = (value, label) => { if (value === null || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError(`${label} must be a plain object`); return value; };
const exact = (value, fields, label) => { const keys = Object.keys(value); if (keys.length !== fields.length || fields.some((field) => !(field in value))) throw new TypeError(`${label} has unknown or missing fields`); };
const clone = (value) => Object.freeze(JSON.parse(JSON.stringify(value)));

export function validateTtiModerationConfiguration(input) {
  const value = plain(input, "configuration");
  exact(value, ["type", "version", "status", "guildId", "humanDecisionOwner", "humanAuthority", "verifiedSurfaces", "memberHumanContactToday", "reasonTaxonomy", "proportionalActions", "protectedRoles", "privacy", "appealAndEmergency", "sources"], "configuration");
  if (value.type !== "TTIZeloModerationReportingDesiredState" || value.version !== 1 || value.status !== "shadow-only-private-intake-unresolved" || typeof value.guildId !== "string" || !Array.isArray(value.reasonTaxonomy) || !Array.isArray(value.protectedRoles) || !Array.isArray(value.sources)) throw new TypeError("shadow-only TTI moderation configuration required");
  if (new Set(value.reasonTaxonomy).size !== value.reasonTaxonomy.length || new Set(value.protectedRoles).size !== value.protectedRoles.length || value.protectedRoles.some((name) => typeof name !== "string" || name.length === 0)) throw new TypeError("configuration taxonomy or protected roles is invalid");
  return clone(value);
}

/** Builds a complete generic ModerationPlanInput from synthetic acceptance data; it never calls Discord. */
export function prepareTtiModerationShadowInput(configuration, review, now = new Date()) {
  const config = validateTtiModerationConfiguration(configuration), value = plain(review, "review"), base = ["guildId", "action", "severity", "reasonCode", "caseId", "subjectId", "actorId", "evidenceDigest", "arguments", "authority", "state"], fields = "appealOf" in value ? [...base, "appealOf"] : base;
  exact(value, fields, "review");
  if (value.guildId !== config.guildId || !ACTIONS.has(value.action) || !["low", "moderate", "high"].includes(value.severity) || !config.reasonTaxonomy.includes(value.reasonCode) || typeof value.evidenceDigest !== "string" || !/^[a-f0-9]{64}$/u.test(value.evidenceDigest) || !(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError("same-guild admitted synthetic moderation review required");
  const caseId = synthetic(value.caseId, "case id"), subjectId = synthetic(value.subjectId, "subject id"), actorId = synthetic(value.actorId, "actor id"), appealOf = value.appealOf === undefined ? undefined : synthetic(value.appealOf, "appeal id");
  if (subjectId === actorId || appealOf === caseId) throw new TypeError("synthetic identities must be distinct");
  const argumentsValue = plain(value.arguments, "action arguments"), authority = plain(value.authority, "authority"), state = plain(value.state, "state");
  if (authority.guildId !== config.guildId || authority.actorId !== actorId || state.guildId !== config.guildId) throw new TypeError("authority and state must bind configured guild and actor");
  const cleanedState = { ...state, ...(typeof state.observedProtectedRoleName === "string" && config.protectedRoles.includes(state.observedProtectedRoleName) ? { subjectProtected: true } : {}) }; delete cleanedState.observedProtectedRoleName;
  return Object.freeze({ type: "TTIZeloModerationShadowInput", version: 1, executable: false, discordMutation: "forbidden", privateReportIntake: "unresolved", humanDecisionOwner: config.humanDecisionOwner, request: Object.freeze({ case: Object.freeze({ type: "DiscordModerationCase", version: 1, id: caseId, guildId: config.guildId, subjectId, openedAt: now.toISOString(), severity: value.severity, reasonCode: value.reasonCode, evidenceDigest: value.evidenceDigest, ...(appealOf === undefined ? {} : { appealOf }) }), authority: clone(authority), state: clone(cleanedState), action: value.action, arguments: clone(argumentsValue), now, maxStateAgeMs: 60_000 }) });
}
