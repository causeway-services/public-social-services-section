import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';

import { prepareTtiZeloProgrammableResponseShadowInput } from '../src/tti-zelo-programmable-response-adapter.mjs';

const ttiRoot = resolve(import.meta.dirname, '..', '..', '..', '..', '..');
const configFile = resolve(ttiRoot, 'content/configurations/zelo-programmable-responses.json');
const programmableService = await import(new URL('../../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-platform-services-section/services/web2-platform-services-section/services/discord-services-section/services/discord-engineering-services-section/services/programmable-community-response-service/src/index.mjs', import.meta.url));

const configuration = async () => JSON.parse(await readFile(configFile, 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));

test('committed TTI command directory yields five non-executable generic-program commands with provenance and owners', async () => {
  const result = prepareTtiZeloProgrammableResponseShadowInput(await configuration());
  assert.equal(result.mode, 'shadow');
  assert.equal(result.executable, false);
  assert.equal(result.discordMutation, 'forbidden');
  assert.equal(result.memberIdentityRead, 'forbidden');
  assert.equal(result.program.commands.length, 5);
  assert.deepEqual(result.commandDirectory.map((command) => command.id), ['tti-help', 'tti-arrival', 'tti-visas', 'tti-governance', 'tti-reporting']);
  assert.ok(result.commandDirectory.every((command) => command.source.reference.startsWith('content/') || command.source.reference.startsWith('data/')));
  assert.ok(result.commandDirectory.every((command) => command.humanOwner === 'emsenn, Turntide Islands administrator'));
});

test('generic programmable service produces only a non-executable, no-mention visa response proposal', async () => {
  const { program } = prepareTtiZeloProgrammableResponseShadowInput(await configuration());
  const result = programmableService.planCommunityResponse(program, {
    type: 'CommunityResponseEvent', version: 1, id: 'event-1', scopeId: 'channel-visas', content: '!tti-visas', actorAuthority: 'everyone',
  }, {
    now: new Date('2026-08-29T00:01:00.000Z'), maxObservationAgeMs: 60_000, variables: {},
    rateBudgetObservation: { type: 'CommunityResponseRateBudgetObservation', version: 1, observedAt: '2026-08-29T00:00:00.000Z', sourceRevision: 'review-1', commandId: 'tti-visas', scopeId: 'channel-visas', window: 'hour', responseCount: 0 },
  });
  assert.equal(result.kind, 'propose');
  assert.equal(result.proposal.executable, false);
  assert.equal(result.proposal.allowedMentions, 'none');
  assert.match(result.proposal.content, /#channel-visas/u);
});

test('adapter fails closed on invented channels, duplicate triggers, and executable status', async () => {
  const inventedChannel = clone(await configuration());
  inventedChannel.commands[0].channels = ['new-channel'];
  assert.throws(() => prepareTtiZeloProgrammableResponseShadowInput(inventedChannel), /observed TTI channels/u);
  const duplicateTrigger = clone(await configuration());
  duplicateTrigger.commands[1].trigger = duplicateTrigger.commands[0].trigger;
  assert.throws(() => prepareTtiZeloProgrammableResponseShadowInput(duplicateTrigger), /unique/u);
  const executable = clone(await configuration());
  executable.execution = 'enabled';
  assert.throws(() => prepareTtiZeloProgrammableResponseShadowInput(executable), /shadow-only/u);
});

test('shadow input is deeply frozen, detached, and contains no member or reaction identities', async () => {
  const input = await configuration();
  const result = prepareTtiZeloProgrammableResponseShadowInput(input);
  assert.equal(Object.isFrozen(result.program.commands[0]), true);
  assert.throws(() => { result.program.commands[0].template = 'changed'; }, TypeError);
  input.commands[0].response = 'changed input';
  assert.notEqual(result.program.commands[0].template, 'changed input');
  const serialized = JSON.stringify(result);
  for (const forbidden of ['"memberId"', '"reactionUsers"', '"administratorAuthorIds"', '"privateKey"', '"mnemonic"']) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
});
