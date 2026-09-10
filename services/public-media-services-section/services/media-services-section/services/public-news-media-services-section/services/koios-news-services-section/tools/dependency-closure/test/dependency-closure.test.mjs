import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('../dependency-closure.mjs', import.meta.url).pathname;
const temporaryDirectories = [];
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'koios-closure-'));
  temporaryDirectories.push(directory);
  const packageSource = join(directory, 'fixture-package');
  mkdirSync(packageSource);
  writeFileSync(join(packageSource, 'package.json'), JSON.stringify({ name: 'fixture', version: '1.0.0', files: ['index.js'] }));
  writeFileSync(join(packageSource, 'index.js'), 'export const fixture = true;\n');
  const packed = spawnSync('npm', ['pack', '--json', '--ignore-scripts'], { cwd: packageSource, encoding: 'utf8' });
  assert.equal(packed.status, 0, packed.stderr);
  const bytes = readFileSync(join(packageSource, JSON.parse(packed.stdout)[0].filename));
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  const packageJson = { name: 'fixture-consumer', version: '1.0.0', private: true, dependencies: { fixture: '1.0.0' } };
  const lock = { name: packageJson.name, version: packageJson.version, lockfileVersion: 3, requires: true, packages: { '': packageJson, 'node_modules/fixture': { version: '1.0.0', resolved: 'https://registry.example/fixture.tgz', integrity } } };
  writeFileSync(join(directory, 'package.json'), JSON.stringify(packageJson));
  writeFileSync(join(directory, 'package-lock.json'), JSON.stringify(lock));
  mkdirSync(join(directory, 'cloudflare-release-current'), { recursive: true });
  writeFileSync(join(directory, 'cloudflare-release-current', 'package-lock.json'), JSON.stringify(lock));
  mkdirSync(join(directory, 'services', 'provider'), { recursive: true });
  writeFileSync(join(directory, 'services', 'provider', 'package-lock.json'), JSON.stringify(lock));
  const hex = Buffer.from(integrity.slice('sha512-'.length), 'base64').toString('hex');
  const cached = join(directory, 'cache', 'content-v2', 'sha512', hex.slice(0, 2), hex.slice(2, 4));
  mkdirSync(cached, { recursive: true });
  writeFileSync(join(cached, hex.slice(4)), bytes);
  const resolved = 'https://registry.example/fixture.tgz';
  const key = `make-fetch-happen:request-cache:${resolved}`;
  const keyHash = createHash('sha256').update(key).digest('hex');
  const serialized = JSON.stringify({ key, integrity, time: 1, size: bytes.length, metadata: { url: resolved } });
  const entryHash = createHash('sha1').update(serialized).digest('hex');
  const index = join(directory, 'cache', 'index-v5', keyHash.slice(0, 2), keyHash.slice(2, 4));
  mkdirSync(index, { recursive: true });
  writeFileSync(join(index, keyHash.slice(4)), `${entryHash}\t${serialized}\n`);
  return { directory, integrity, bytes, keyHash };
}
test.after(() => temporaryDirectories.forEach((directory) => rmSync(directory, { recursive: true, force: true })));
test('audits all current root, release-carrier, and provider locks from cacache content paths', () => {
  const { directory } = fixture();
  const manifest = join(directory, 'audit.json');
  const result = spawnSync(process.execPath, [script, 'audit', '--root', directory, '--cache', join(directory, 'cache'), '--manifest', manifest], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(readFileSync(manifest));
  assert.equal(report.artifactCount, 1, 'identical integrity is deduplicated across locks');
  assert.equal(report.foundCount, 1);
  assert.equal(report.missingCount, 0);
  assert.deepEqual(report.lockfiles, [
    'cloudflare-release-current/package-lock.json',
    'package-lock.json',
    'services/provider/package-lock.json'
  ]);
});
test('reports missing exact artifact and exports verified content-addressed bundle', () => {
  const { directory, integrity } = fixture();
  const missing = spawnSync(process.execPath, [script, 'audit', '--root', directory, '--cache', join(directory, 'absent')], { encoding: 'utf8' });
  assert.equal(missing.status, 1);
  const output = join(directory, 'bundle');
  const exported = spawnSync(process.execPath, [script, 'export', '--root', directory, '--cache', join(directory, 'cache'), '--output', output], { encoding: 'utf8' });
  assert.equal(exported.status, 0, exported.stderr);
  const report = JSON.parse(readFileSync(join(output, 'manifest.json')));
  assert.equal(report.artifacts[0].integrity, integrity);
  assert.match(report.artifacts[0].object, /^objects\/sha512-[0-9a-f]+$/);
  assert.ok(readFileSync(join(output, report.artifacts[0].object)).length > 0);
});
test('can recover an artifact from a read-only-style extracted external source', () => {
  const { directory, bytes } = fixture();
  const source = join(directory, 'verdaccio-storage');
  mkdirSync(source);
  writeFileSync(join(source, 'artifact.tgz'), bytes);
  const result = spawnSync(process.execPath, [script, 'audit', '--root', directory, '--cache', join(directory, 'absent'), '--source', source], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
test('exports only verified content and the exact matching npm index-v5 record', () => {
  const { directory, keyHash } = fixture();
  const output = join(directory, 'portable');
  const result = spawnSync(process.execPath, [script, 'export-cache', '--root', directory, '--cache', join(directory, 'cache'), '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(readFileSync(join(output, 'manifest.json')));
  assert.equal(report.portableCache.indexEntryCount, 1);
  assert.equal(report.portableCache.copiedIndexEntryCount, 1);
  assert.equal(report.portableCache.synthesizedIndexEntryCount, 0);
  assert.equal(report.portableCache.cacachePath, 'cache/_cacache');
  assert.ok(readFileSync(join(output, 'cache', '_cacache', 'index-v5', keyHash.slice(0, 2), keyHash.slice(2, 4), keyHash.slice(4)), 'utf8').includes('make-fetch-happen:request-cache:https://registry.example/fixture.tgz'));
});
test('materializes a deterministic HTTP cache record when verified content lacks an index entry', () => {
  const { directory } = fixture();
  rmSync(join(directory, 'cache', 'index-v5'), { recursive: true, force: true });
  const output = join(directory, 'portable-synthesized');
  const result = spawnSync(process.execPath, [script, 'export-cache', '--root', directory, '--cache', join(directory, 'cache'), '--output', output], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(readFileSync(join(output, 'manifest.json')));
  assert.equal(report.portableCache.copiedIndexEntryCount, 0);
  assert.equal(report.portableCache.synthesizedIndexEntryCount, 1);
  assert.deepEqual(report.portableCache.synthesizedIndexEntries[0].key, 'make-fetch-happen:request-cache:https://registry.example/fixture.tgz');
});
test('the exported npm root performs a clean offline installation', () => {
  const { directory } = fixture();
  rmSync(join(directory, 'cache', 'index-v5'), { recursive: true, force: true });
  const output = join(directory, 'portable-install'), installation = join(directory, 'clean-install');
  const exported = spawnSync(process.execPath, [script, 'export-cache', '--root', directory, '--cache', join(directory, 'cache'), '--output', output], { encoding: 'utf8' });
  assert.equal(exported.status, 0, exported.stderr);
  mkdirSync(installation);
  for (const file of ['package.json', 'package-lock.json']) writeFileSync(join(installation, file), readFileSync(join(directory, file)));
  const installed = spawnSync('npm', ['ci', '--offline', '--ignore-scripts', '--cache', join(output, 'cache')], { cwd: installation, encoding: 'utf8' });
  assert.equal(installed.status, 0, installed.stderr);
  assert.equal(JSON.parse(readFileSync(join(installation, 'node_modules', 'fixture', 'package.json'))).version, '1.0.0');
});
