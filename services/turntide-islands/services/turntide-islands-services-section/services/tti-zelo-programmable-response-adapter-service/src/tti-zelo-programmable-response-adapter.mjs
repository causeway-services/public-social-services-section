const IDENTIFIER = /^[A-Za-z][A-Za-z0-9._:-]{0,127}$/u;

const KNOWN_CHANNELS = new Set([
  'dock',
  'channel-visas',
  'governance-questions',
  'governance-discussion',
  'governance-proposals',
  'receipts',
]);

function identifier(value, label) {
  if (typeof value !== 'string' || !IDENTIFIER.test(value)) throw new TypeError(`${label} must be an identifier`);
  return value;
}

function snowflake(value, label) {
  if (typeof value !== 'string' || !/^[0-9]{17,20}$/u.test(value)) throw new TypeError(`${label} must be a Discord snowflake`);
  return value;
}

function text(value, label, maximum = 2_000) {
  if (typeof value !== 'string' || value.trim() === '' || value.length > maximum || /[\u0000-\u001F\u007F-\u009F]/u.test(value)) {
    throw new TypeError(`${label} must be bounded plain text`);
  }
  return value;
}

function freeze(value) {
  const copy = JSON.parse(JSON.stringify(value));
  const visit = (item) => {
    if (item !== null && typeof item === 'object') {
      for (const child of Object.values(item)) visit(child);
      Object.freeze(item);
    }
  };
  visit(copy);
  return copy;
}

/** Builds a non-executable generic-program input; callers must separately review any proposal. */
export function prepareTtiZeloProgrammableResponseShadowInput(input) {
  if (!input || input.type !== 'TTIZeloProgrammableResponseConfiguration' || input.version !== 1) {
    throw new TypeError('TTI programmable response configuration version 1 is required');
  }
  if (input.status !== 'shadow-only' || input.execution !== 'forbidden-pending-reviewed-admission') {
    throw new TypeError('TTI programmable responses must remain shadow-only and non-executable');
  }
  const guildId = snowflake(input.guildId, 'guild id');
  if (!Array.isArray(input.commands) || input.commands.length === 0) throw new TypeError('commands are required');
  const ids = new Set();
  const triggers = new Set();
  const directory = [];
  const commands = input.commands.map((command) => {
    if (!command || typeof command !== 'object' || Array.isArray(command)) throw new TypeError('command must be an object');
    const id = identifier(command.id, 'command id');
    const revision = identifier(command.revision, 'command revision');
    const trigger = text(command.trigger, 'command trigger', 256).trim();
    const response = text(command.response, 'command response');
    if (ids.has(id) || triggers.has(trigger)) throw new TypeError('command ids and triggers must be unique');
    ids.add(id);
    triggers.add(trigger);
    if (!Array.isArray(command.channels) || command.channels.length === 0 || command.channels.some((channel) => !KNOWN_CHANNELS.has(channel))) {
      throw new TypeError('command channels must be observed TTI channels');
    }
    if (new Set(command.channels).size !== command.channels.length) throw new TypeError('command channels must be unique');
    const source = command.source;
    if (!source || typeof source !== 'object') throw new TypeError('command source is required');
    const sourceId = identifier(source.id, 'source id');
    const sourceRevision = identifier(source.revision, 'source revision');
    const sourceReference = text(source.reference, 'source reference', 512);
    const humanOwner = text(command.humanOwner, 'human owner', 256);
    directory.push({ id, revision, trigger, channels: command.channels, source: { id: sourceId, revision: sourceRevision, reference: sourceReference }, humanOwner });
    return {
      id,
      revision,
      triggers: [{ kind: 'exact-text', value: trigger }],
      variables: [],
      template: response,
      visibility: 'public',
      authority: 'everyone',
      rateBudget: { maxResponses: 1, window: 'hour' },
      provenance: { sourceId, revision: sourceRevision },
    };
  });
  return freeze({
    type: 'TTIZeloProgrammableResponseShadowInput',
    version: 1,
    mode: 'shadow',
    executable: false,
    discordMutation: 'forbidden',
    memberIdentityRead: 'forbidden',
    program: {
      type: 'ProgrammableCommunityResponseProgram',
      version: 1,
      id: `tti-zelo-${guildId}`,
      revision: 'r20260829-1',
      commands,
    },
    commandDirectory: directory,
  });
}
