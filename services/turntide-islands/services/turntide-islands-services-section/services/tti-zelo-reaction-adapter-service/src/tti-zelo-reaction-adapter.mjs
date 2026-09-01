const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/u;

function requireIdentifier(value, label) {
  if (typeof value !== "string" || !IDENTIFIER.test(value)) {
    throw new TypeError(`${label} must be a nonempty identifier`);
  }
  return value;
}

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);
  return value;
}

function requireExactSet(values, label) {
  const entries = requireArray(values, label).map((value) => requireIdentifier(value, label));
  if (new Set(entries).size !== entries.length) throw new TypeError(`${label} must not contain duplicates`);
  return entries;
}

function normalizeEmoji(value, label) {
  const emoji = requireObject(value, label);
  const name = typeof emoji.name === "string" && emoji.name.trim() !== "" ? emoji.name.trim() : undefined;
  const id = typeof emoji.id === "string" && emoji.id.trim() !== "" ? requireIdentifier(emoji.id.trim(), `${label} id`) : undefined;
  if (name === undefined && id === undefined) throw new TypeError(`${label} needs a name or id`);
  return Object.freeze({ ...(id === undefined ? {} : { id }), ...(name === undefined ? {} : { name }) });
}

function emojiKey(emoji) {
  const normalized = normalizeEmoji(emoji, "emoji");
  return `${normalized.id ?? ""}:${normalized.name ?? ""}`;
}

function mappingKey(messageId, emoji) {
  return `${requireIdentifier(messageId, "message id")}:${emojiKey(emoji)}`;
}

function deepCloneAndFreeze(value) {
  const clone = JSON.parse(JSON.stringify(value));
  const freeze = (item) => {
    if (item !== null && typeof item === "object" && !Object.isFrozen(item)) {
      for (const child of Object.values(item)) freeze(child);
      Object.freeze(item);
    }
    return item;
  };
  return freeze(clone);
}

function requireFreshObservation(observedAt, now, maxObservationAgeMs) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError("now must be a valid Date");
  if (!Number.isSafeInteger(maxObservationAgeMs) || maxObservationAgeMs <= 0) {
    throw new TypeError("maxObservationAgeMs must be a positive safe integer");
  }
  if (typeof observedAt !== "string" || !Number.isFinite(Date.parse(observedAt))) {
    throw new TypeError("observedAt must be an ISO timestamp");
  }
  const observedMillis = Date.parse(observedAt);
  if (observedMillis > now.getTime()) throw new TypeError("observed state is from the future");
  if (now.getTime() - observedMillis > maxObservationAgeMs) throw new TypeError("observed state is stale");
}

function normalizeConfiguration(input) {
  const configuration = requireObject(input, "configuration");
  if (configuration.type !== "TTIDiscordReactionSystemConfiguration" || configuration.version !== 1) {
    throw new TypeError("unsupported TTI reaction configuration");
  }
  const guildId = requireIdentifier(configuration.guildId, "configuration guild id");
  const roleNames = new Set(requireExactSet(configuration.roleNames, "configuration role names"));
  const channelNames = new Set(requireExactSet(configuration.channelNames, "configuration channel names"));
  const integrationNames = new Set(requireExactSet(configuration.integrationNames, "configuration integration names"));
  const selectors = new Map();
  for (const rawSelector of requireArray(configuration.selectors, "configuration selectors")) {
    const selector = requireObject(rawSelector, "selector");
    const purpose = requireIdentifier(selector.purpose, "selector purpose");
    if (selectors.has(purpose)) throw new TypeError("selector purposes must be unique");
    selectors.set(purpose, Object.freeze({
      purpose,
      channelId: requireIdentifier(selector.channelId, "selector channel id"),
      messageId: requireIdentifier(selector.messageId, "selector message id"),
    }));
  }
  const entry = selectors.get("entry");
  const visas = selectors.get("channel-visas");
  if (entry === undefined || visas === undefined) throw new TypeError("entry and channel-visas selectors are required");

  const mappings = [];
  const seenMappings = new Set();
  for (const rawMapping of requireArray(configuration.mappings, "configuration mappings")) {
    const mapping = requireObject(rawMapping, "configuration mapping");
    const messagePurpose = requireIdentifier(mapping.messagePurpose, "mapping message purpose");
    const selector = selectors.get(messagePurpose);
    if (selector === undefined) throw new TypeError("mapping must reference a selector");
    const emoji = normalizeEmoji(mapping.emoji, "mapping emoji");
    const key = mappingKey(selector.messageId, emoji);
    if (seenMappings.has(key)) throw new TypeError("configuration mappings must be unique by selector message and emoji");
    seenMappings.add(key);
    const roleName = requireIdentifier(mapping.roleName, "mapping role name");
    if (!roleNames.has(roleName)) throw new TypeError("mapping role must be declared");
    const mappingChannelNames = requireExactSet(mapping.channelNames, "mapping channel names");
    if (mappingChannelNames.length === 0 || mappingChannelNames.some((name) => !channelNames.has(name))) {
      throw new TypeError("mapping channels must be declared and nonempty");
    }
    const ownerIntegrationName = requireIdentifier(mapping.ownerIntegrationName, "mapping owner integration name");
    if (!integrationNames.has(ownerIntegrationName)) throw new TypeError("mapping owner integration must be declared");
    if (requireArray(mapping.evidence, "mapping evidence").length === 0) throw new TypeError("mapping evidence is required");
    mappings.push(Object.freeze({ selector, emoji, roleName, channelNames: Object.freeze(mappingChannelNames), ownerIntegrationName }));
  }

  const unresolved = [];
  const seenUnresolved = new Set();
  for (const rawUnresolved of requireArray(configuration.unresolved, "configuration unresolved mappings")) {
    const item = requireObject(rawUnresolved, "configuration unresolved mapping");
    const selector = selectors.get(requireIdentifier(item.messagePurpose, "unresolved message purpose"));
    if (selector === undefined) throw new TypeError("unresolved mapping must reference a selector");
    const emoji = normalizeEmoji(item.emoji, "unresolved emoji");
    const key = mappingKey(selector.messageId, emoji);
    if (seenUnresolved.has(key) || seenMappings.has(key)) throw new TypeError("unresolved mappings must be unique and not executable mappings");
    seenUnresolved.add(key);
    if (typeof item.question !== "string" || item.question.trim() === "") throw new TypeError("unresolved mapping question is required");
    if (requireArray(item.evidence, "unresolved mapping evidence").length === 0) throw new TypeError("unresolved mapping evidence is required");
    unresolved.push(Object.freeze({ selector, emoji }));
  }
  const dockUnresolved = unresolved.find((item) => item.selector.purpose === "entry");
  if (dockUnresolved === undefined) throw new TypeError("entry reaction must remain explicitly unresolved");
  return Object.freeze({ guildId, mappings: Object.freeze(mappings), dockUnresolved });
}

function normalizeObservedState(input, configuration, now, maxObservationAgeMs) {
  const observed = requireObject(input, "observed state");
  if (observed.type !== "TTIDiscordReactionSystemState" || observed.version !== 1 || observed.completeness !== "complete") {
    throw new TypeError("complete TTI reaction state is required");
  }
  const guild = requireObject(observed.guild, "observed guild");
  if (requireIdentifier(guild.id, "observed guild id") !== configuration.guildId) throw new TypeError("observed guild does not match configuration");
  requireFreshObservation(observed.observedAt, now, maxObservationAgeMs);
  const rolesById = new Map();
  const roleNames = new Set();
  for (const rawRole of requireArray(observed.roles, "observed roles")) {
    const role = requireObject(rawRole, "observed role");
    const id = requireIdentifier(role.id, "observed role id");
    const name = requireIdentifier(role.name, "observed role name");
    if (rolesById.has(id) || roleNames.has(name)) {
      throw new TypeError("observed roles must have unique ids and names");
    }
    rolesById.set(id, name);
    roleNames.add(name);
  }
  const channelsById = new Map();
  const channelNames = new Set();
  for (const rawChannel of requireArray(observed.channels, "observed channels")) {
    const channel = requireObject(rawChannel, "observed channel");
    const id = requireIdentifier(channel.id, "observed channel id");
    const name = requireIdentifier(channel.name, "observed channel name");
    if (channelsById.has(id) || channelNames.has(name)) {
      throw new TypeError("observed channels must have unique ids and names");
    }
    channelsById.set(id, name);
    channelNames.add(name);
  }
  const integrationsByName = new Map();
  for (const rawIntegration of requireArray(observed.integrations, "observed integrations")) {
    const integration = requireObject(rawIntegration, "observed integration");
    const name = requireIdentifier(integration.name, "observed integration name");
    if (integrationsByName.has(name)) throw new TypeError("observed integration names must be unique");
    integrationsByName.set(name, Object.freeze({
      id: requireIdentifier(integration.id, "observed integration id"),
      enabled: integration.enabled === true,
      applicationId: requireIdentifier(integration.applicationId, "observed integration application id"),
      botId: requireIdentifier(integration.botId, "observed integration bot id"),
    }));
  }
  const mappingsByKey = new Map();
  for (const rawMapping of requireArray(observed.reactionMappings, "observed reaction mappings")) {
    const mapping = requireObject(rawMapping, "observed reaction mapping");
    const messageId = requireIdentifier(mapping.messageId, "observed mapping message id");
    const emoji = normalizeEmoji(mapping.emoji, "observed mapping emoji");
    const key = mappingKey(messageId, emoji);
    if (mappingsByKey.has(key)) throw new TypeError("observed reaction mappings must be unique by message and emoji");
    const targetChannelIds = requireExactSet(mapping.targetChannelIds, "observed target channel ids");
    const automationOwner = requireObject(mapping.automationOwner, "observed automation owner");
    mappingsByKey.set(key, Object.freeze({
      messageId,
      emoji,
      grantRoleId: requireIdentifier(mapping.grantRoleId, "observed grant role id"),
      targetChannelIds: Object.freeze(targetChannelIds),
      confidence: mapping.confidence,
      unresolved: mapping.unresolved,
      automationOwner: Object.freeze({
        integrationId: requireIdentifier(automationOwner.integrationId, "owner integration id"),
        applicationId: requireIdentifier(automationOwner.applicationId, "owner application id"),
        botId: requireIdentifier(automationOwner.botId, "owner bot id"),
        confidence: automationOwner.confidence,
      }),
    }));
  }
  const unresolvedKeys = new Set();
  for (const rawUnresolved of requireArray(observed.unresolved, "observed unresolved mappings")) {
    const item = requireObject(rawUnresolved, "observed unresolved mapping");
    const key = mappingKey(requireIdentifier(item.messageId, "observed unresolved message id"), normalizeEmoji(item.emoji, "observed unresolved emoji"));
    if (unresolvedKeys.has(key)) throw new TypeError("observed unresolved mappings must be unique");
    if (item.confidence !== "unresolved") throw new TypeError("observed unresolved mappings must be unresolved");
    unresolvedKeys.add(key);
  }
  return Object.freeze({ observedAt: observed.observedAt, rolesById, channelsById, integrationsByName, mappingsByKey, unresolvedKeys });
}

function hasSameSet(actual, expected) {
  return actual.length === expected.length && new Set(actual).size === actual.length && actual.every((item) => expected.includes(item));
}

function validatedOwner(actualOwner, expectedName, integrationsByName) {
  const integration = integrationsByName.get(expectedName);
  return integration !== undefined
    && integration.enabled
    && actualOwner.confidence === "inferred"
    && actualOwner.integrationId === integration.id
    && actualOwner.applicationId === integration.applicationId
    && actualOwner.botId === integration.botId;
}

/** Produces non-executable review proposals; it never contacts Discord or reads member identities. */
export function prepareTtiZeloShadowInput(configurationInput, observedInput, options = {}) {
  const now = options.now ?? new Date();
  const maxObservationAgeMs = options.maxObservationAgeMs ?? 86_400_000;
  const configuration = normalizeConfiguration(configurationInput);
  const observed = normalizeObservedState(observedInput, configuration, now, maxObservationAgeMs);
  const dockKey = mappingKey(configuration.dockUnresolved.selector.messageId, configuration.dockUnresolved.emoji);
  if (!observed.unresolvedKeys.has(dockKey)) throw new TypeError("entry reaction must remain unresolved in observed state");
  const bindings = [];
  const review = [];
  for (const desired of configuration.mappings) {
    const observedMapping = observed.mappingsByKey.get(
      mappingKey(desired.selector.messageId, desired.emoji),
    );
    const observedRoleName = observedMapping === undefined
      ? undefined
      : observed.rolesById.get(observedMapping.grantRoleId);
    const observedChannelNames = observedMapping === undefined
      ? []
      : observedMapping.targetChannelIds.map((id) => observed.channelsById.get(id));
    const usable = observedMapping !== undefined
      && observedMapping.confidence === "inferred"
      && observedMapping.unresolved === false
      && observedRoleName === desired.roleName
      && !observedChannelNames.includes(undefined)
      && hasSameSet(observedChannelNames, desired.channelNames)
      && validatedOwner(observedMapping.automationOwner, desired.ownerIntegrationName, observed.integrationsByName);
    review.push({
      selectorPurpose: desired.selector.purpose,
      emoji: desired.emoji,
      status: usable ? "review-proposal-ready" : "blocked",
      reason: usable ? "observed-mapping-matches-configuration" : "observed-mapping-does-not-match-configuration",
    });
    if (!usable) continue;
    bindings.push({
      type: "DiscordReactionRoleBinding",
      version: 1,
      id: `tti-review-${desired.selector.purpose}-${emojiKey(desired.emoji)}`,
      revision: 1,
      guildId: configuration.guildId,
      channelId: desired.selector.channelId,
      messageId: desired.selector.messageId,
      emoji: desired.emoji,
      onAdd: ["add-role"],
      onRemove: ["remove-role"],
      roleId: observedMapping.grantRoleId,
      execution: "review-proposal-only",
      executable: false,
    });
  }
  return deepCloneAndFreeze({
    type: "TTIZeloReactionShadowInput",
    version: 1,
    mode: "shadow",
    executable: false,
    discordMutation: "forbidden",
    reactionUserEnumeration: "forbidden",
    observedAt: observed.observedAt,
    desiredVsObserved: review,
    bindings,
    blocked: [{
      selectorPurpose: "entry",
      emoji: configuration.dockUnresolved.emoji,
      reason: "unresolved-dock-grant",
      executable: false,
    }],
  });
}
