import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';

const root = resolve(import.meta.dirname, '..');

test('the site depends on VICTOR through the registry', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.equal(manifest.dependencies['@red-cup-engineering/victor'], '0.1.3');
  assert.doesNotMatch(manifest.dependencies['@red-cup-engineering/victor'], /^file:/);
  assert.doesNotMatch(manifest.dependencies['@red-cup-engineering/victor'], /^workspace:/);
});

test('the project declares its public origin and catalog pages', async () => {
  const config = await readFile(resolve(root, 'victor.config.mjs'), 'utf8');
  assert.match(config, /https:\/\/turntide-islands\.561\.group\//);
  for (const page of ['index.md', 'join.md', 'events.md', 'settlement.md', 'proof-of-adaptation.md', 'governance.md']) {
    const content = await readFile(resolve(root, 'content', page), 'utf8');
    assert.match(content, /^---\ntitle: /);
    assert.match(content, /date-created: 2026-08-29/);
  }
});

test('the public programming page distinguishes active intake from scheduled events', async () => {
  const events = await readFile(resolve(root, 'content', 'events.md'), 'utf8');
  const config = await readFile(resolve(root, 'victor.config.mjs'), 'utf8');
  const programming = JSON.parse(await readFile(resolve(root, '..', '..', '..', '..', 'content', 'programming', '2026-09-community-programming.json'), 'utf8'));

  assert.ok(config.includes("label: 'Events', href: '/events/'"));
  assert.match(events, /Open Harbor/);
  assert.match(events, /Discord's\s+Events list is authoritative/);
  assert.match(events, /No synchronous event is confirmed/);
  assert.equal(programming.status, 'active-intake');
  assert.equal(programming.programs.length, 4);
  assert.equal(programming.scheduling.automaticReminders, false);
  assert.deepEqual(programming.scheduling.scheduledEventIds, []);
});

test('public join path preserves the established dock and channel-visas journey', async () => {
  const index = await readFile(resolve(root, 'content', 'index.md'), 'utf8');
  const join = await readFile(resolve(root, 'content', 'join.md'), 'utf8');
  const config = await readFile(resolve(root, 'victor.config.mjs'), 'utf8');
  const invite = 'https://discord.gg/zHRy3RQgkD';

  assert.match(index, new RegExp(invite));
  assert.match(join, new RegExp(invite));
  assert.match(index, /#dock/);
  assert.match(index, /#channel-visas/);
  assert.match(join, /#dock/);
  assert.match(join, /#channel-visas/);
  assert.doesNotMatch(index, /#start-here/);
  assert.doesNotMatch(join, /#start-here/);
  assert.ok(config.includes("label: 'Join', href: '/join/'"));
});

test('Cloudflare serves the verified VICTOR release at the public hostname', async () => {
  const wrangler = JSON.parse(await readFile(resolve(root, 'wrangler.json'), 'utf8'));
  assert.equal(wrangler.name, 'turntide-islands-561-group');
  assert.equal(wrangler.main, './worker.mjs');
  assert.equal(wrangler.assets.directory, './dist');
  assert.equal(wrangler.assets.binding, 'ASSETS');
  assert.equal(wrangler.assets.run_worker_first, true);
  assert.deepEqual(wrangler.routes, [{ pattern: 'turntide-islands.561.group', custom_domain: true }]);
});

test('the edge serves the VICTOR landing cell at the root URL', async () => {
  const worker = await readFile(resolve(root, 'worker.mjs'), 'utf8');
  assert.match(worker, /url\.pathname === '\/'/);
  assert.match(worker, /new URL\('\/index\/index\.html', url\)/);
  assert.match(worker, /env\.ASSETS\.fetch/);
});
