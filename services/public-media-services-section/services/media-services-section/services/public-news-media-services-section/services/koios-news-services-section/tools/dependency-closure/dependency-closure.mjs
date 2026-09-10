#!/usr/bin/env node
/**
 * Offline npm dependency closure audit/export for Koios.
 *
 * The package-lock integrity field is the authority.  Cache index metadata,
 * package names, and URLs are deliberately not trusted to identify bytes.
 */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, copyFileSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const toolDirectory = dirname(new URL(import.meta.url).pathname);
const defaultRoot = resolve(toolDirectory, '..', '..');
const defaultCache = join(homedir(), '.npm', '_cacache');

function usage() {
  return `Usage:
  node dependency-closure.mjs audit [--root PATH] [--cache PATH] [--source PATH]... [--verdaccio-backup PATH]... [--manifest PATH]
  node dependency-closure.mjs export --output PATH [same source options]
  node dependency-closure.mjs export-cache --output PATH [same source options]

The audit reads Koios/package-lock.json, the explicit
cloudflare-release-current/package-lock.json, and each current
services/*/package-lock.json.
It never contacts a registry. --source accepts an extracted Verdaccio storage
directory or another directory of tarballs; --verdaccio-backup also accepts
.tar, .tar.gz, and .tar.zst archives (requiring GNU tar and zstd for .zst).`;
}

function parseArguments(argv) {
  const [command = 'audit', ...rest] = argv;
  if (!['audit', 'export', 'export-cache'].includes(command)) throw new Error(`Unknown command: ${command}`);
  const options = { command, root: defaultRoot, cache: defaultCache, sources: [], backups: [] };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === '--help' || argument === '-h') return { help: true };
    if (!['--root', '--cache', '--source', '--verdaccio-backup', '--manifest', '--output'].includes(argument)) {
      throw new Error(`Unknown option: ${argument}`);
    }
    const value = rest[++index];
    if (!value || value.startsWith('--')) throw new Error(`${argument} needs a path`);
    if (argument === '--source') options.sources.push(resolve(value));
    else if (argument === '--verdaccio-backup') options.backups.push(resolve(value));
    else options[argument.slice(2)] = resolve(value);
  }
  if (['export', 'export-cache'].includes(command) && !options.output) throw new Error(`${command} needs --output PATH`);
  return options;
}

function lockfiles(root) {
  const rootLockfile = join(root, 'package-lock.json');
  const servicesDirectory = join(root, 'services');
  // The release carrier is a package-local, explicit deployment dependency.
  // Keep it enumerated rather than recursively collecting every nested
  // package: a closure expansion must be an intentional change in custody.
  const releaseCarrierLockfile = join(root, 'cloudflare-release-current', 'package-lock.json');
  const providerLockfiles = existsSync(servicesDirectory)
    ? readdirSync(servicesDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(servicesDirectory, entry.name, 'package-lock.json'))
      .filter(existsSync)
    : [];
  return [rootLockfile, releaseCarrierLockfile, ...providerLockfiles]
    .filter(existsSync)
    .sort();
}

function parseIntegrity(integrity) {
  const parsed = String(integrity).trim().split(/\s+/).map((token) => {
    const separator = token.indexOf('-');
    if (separator < 1) return null;
    const algorithm = token.slice(0, separator).toLowerCase();
    const digest = token.slice(separator + 1).replace(/[?].*$/, '');
    if (!/^sha(256|384|512)$/.test(algorithm) || !digest) return null;
    return { algorithm, digest, token: `${algorithm}-${digest}` };
  }).filter(Boolean);
  if (!parsed.length) throw new Error(`Unsupported integrity: ${integrity}`);
  return parsed;
}

function cachePath(cache, integrity) {
  // npm cacache content-v2 layout is algorithm/base16-digest split 2/2/rest.
  const strongest = parseIntegrity(integrity).sort((left, right) => right.algorithm.localeCompare(left.algorithm))[0];
  const hex = Buffer.from(strongest.digest, 'base64').toString('hex');
  return join(cache, 'content-v2', strongest.algorithm, hex.slice(0, 2), hex.slice(2, 4), hex.slice(4));
}

function verifies(path, integrity) {
  const bytes = readFileSync(path);
  return parseIntegrity(integrity).some(({ algorithm, digest }) =>
    createHash(algorithm).update(bytes).digest('base64') === digest);
}

function artifacts(root) {
  const byIntegrity = new Map();
  for (const lockfile of lockfiles(root)) {
    if (!existsSync(lockfile)) throw new Error(`Lockfile not found: ${lockfile}`);
    const lock = JSON.parse(readFileSync(lockfile, 'utf8'));
    const packages = lock.packages || {};
    for (const [packagePath, entry] of Object.entries(packages)) {
      if (!entry.integrity) continue;
      // Validate early, so malformed supplied locks cannot produce an unauditable report.
      parseIntegrity(entry.integrity);
      const key = entry.integrity;
      const artifact = byIntegrity.get(key) || {
        integrity: key, version: entry.version || null, resolved: entry.resolved || null, resolvedUrls: [], occurrences: []
      };
      if (entry.resolved && !artifact.resolvedUrls.includes(entry.resolved)) artifact.resolvedUrls.push(entry.resolved);
      artifact.occurrences.push({ lockfile: relative(root, lockfile) || 'package-lock.json', packagePath });
      byIntegrity.set(key, artifact);
    }
  }
  return [...byIntegrity.values()].sort((left, right) => left.integrity.localeCompare(right.integrity));
}

function indexKey(resolved) {
  return `make-fetch-happen:request-cache:${resolved}`;
}

function indexPath(cache, key) {
  const digest = createHash('sha256').update(key).digest('hex');
  return join(cache, 'index-v5', digest.slice(0, 2), digest.slice(2, 4), digest.slice(4));
}

function exactIndexEntry(cache, resolved, integrity) {
  const key = indexKey(resolved);
  const path = indexPath(cache, key);
  if (!existsSync(path)) return null;
  let selected = null;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const [checksum, serialized] = line.split('\t', 2);
    if (!serialized || createHash('sha1').update(serialized).digest('hex') !== checksum) continue;
    try {
      const entry = JSON.parse(serialized);
      if (entry.key === key && entry.integrity === integrity) selected = line;
    } catch { /* An invalid cache record is not exportable evidence. */ }
  }
  return selected;
}

function synthesizedIndexEntry(resolved, integrity, size) {
  // make-fetch-happen requires this response metadata before it will consider
  // a cacache entry a cacheable HTTP response, even in only-if-cached mode.
  const serialized = JSON.stringify({
    key: indexKey(resolved), integrity, time: 0, size,
    metadata: {
      time: 0, url: resolved, reqHeaders: {},
      resHeaders: { 'content-type': 'application/octet-stream' }, options: { compress: true }
    }
  });
  return `${createHash('sha1').update(serialized).digest('hex')}\t${serialized}`;
}

function walkFiles(directory, visit) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const candidate = join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(candidate, visit);
    else if (entry.isFile()) visit(candidate);
  }
}

function tarArguments(archive, operation, member) {
  const compression = archive.endsWith('.tar.zst') ? ['--zstd'] : archive.endsWith('.tar.gz') || archive.endsWith('.tgz') ? ['-z'] : [];
  return [...compression, operation, archive, ...(member ? [member] : [])];
}

function archiveMembers(archive) {
  const result = spawnSync('tar', tarArguments(archive, '-tf'), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Cannot list Verdaccio backup ${archive}: ${result.stderr.trim() || result.error?.message}`);
  return result.stdout.split('\n').filter((name) => /\.(tgz|tar\.gz)$/i.test(name)).sort();
}

function materializeArchiveMember(archive, member, destination) {
  const result = spawnSync('tar', tarArguments(archive, '-xOf', member), { encoding: null, maxBuffer: 512 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Cannot read ${member} from ${archive}: ${result.stderr.toString().trim()}`);
  writeFileSync(destination, result.stdout);
}

function locate(artifactsToFind, options) {
  const expected = new Map(artifactsToFind.map((artifact) => [artifact.integrity, artifact]));
  const located = new Map();
  const scratch = mkdtempSync(join(tmpdir(), 'koios-dependency-closure-'));
  const consider = (candidate, source) => {
    if (!existsSync(candidate) || !lstatSync(candidate).isFile()) return;
    for (const [integrity, artifact] of expected) {
      if (!located.has(integrity) && verifies(candidate, integrity)) located.set(integrity, { path: candidate, source });
    }
  };

  for (const artifact of artifactsToFind) {
    const candidate = cachePath(options.cache, artifact.integrity);
    consider(candidate, 'npm-cacache');
  }
  for (const source of options.sources) walkFiles(source, (candidate) => consider(candidate, `source:${source}`));
  for (const backup of options.backups) {
    if (existsSync(backup) && statSync(backup).isDirectory()) {
      walkFiles(backup, (candidate) => consider(candidate, `verdaccio-storage:${backup}`));
      continue;
    }
    if (!existsSync(backup)) continue;
    try {
      let sequence = 0;
      for (const member of archiveMembers(backup)) {
        if (located.size === expected.size) break;
        const temporary = join(scratch, String(sequence++));
        materializeArchiveMember(backup, member, temporary);
        consider(temporary, `verdaccio-backup:${backup}#${member}`);
      }
    } catch (error) {
      rmSync(scratch, { recursive: true, force: true });
      throw error;
    }
  }
  return { located, cleanup: () => rmSync(scratch, { recursive: true, force: true }) };
}

function report(root, options) {
  const expected = artifacts(root);
  const location = locate(expected, options);
  const located = location.located;
  const artifactsReport = expected.map((artifact) => ({
    ...artifact,
    found: located.has(artifact.integrity),
    source: located.get(artifact.integrity)?.source || null
  }));
  const result = {
    schema: 'koios-npm-dependency-closure/v1', root, lockfiles: lockfiles(root).map((file) => relative(root, file)),
    artifactCount: artifactsReport.length,
    foundCount: artifactsReport.filter((artifact) => artifact.found).length,
    missingCount: artifactsReport.filter((artifact) => !artifact.found).length,
    artifacts: artifactsReport
  };
  location.cleanup();
  return result;
}

function writeJson(path, object) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(object, null, 2)}\n`);
}

function exportBundle(result, output, options) {
  if (result.missingCount) return;
  const objects = join(output, 'objects');
  mkdirSync(objects, { recursive: true });
  const locations = locate(result.artifacts, options);
  try {
    for (const artifact of result.artifacts) {
      const parsed = parseIntegrity(artifact.integrity).sort((left, right) => right.algorithm.localeCompare(left.algorithm))[0];
      const filename = `${parsed.algorithm}-${Buffer.from(parsed.digest, 'base64').toString('hex')}`;
      copyFileSync(locations.located.get(artifact.integrity).path, join(objects, filename));
      artifact.object = `objects/${filename}`;
    }
  } finally { locations.cleanup(); }
}

function exportPortableCache(result, output, options) {
  if (result.missingCount) return;
  // npm's --cache option names its cache root. Pacote passes the cacache
  // content location beneath that root as <cache>/_cacache; exporting the
  // content-v2/index-v5 directories directly under <cache> makes direct
  // cacache readers succeed while `npm ci --offline` fails ENOTCACHED.
  const cacheRoot = join(output, 'cache');
  const cache = join(cacheRoot, '_cacache');
  const locations = locate(result.artifacts, options);
  const synthesizedIndexEntries = [];
  const indexEntries = [];
  try {
    for (const artifact of result.artifacts) {
      const source = locations.located.get(artifact.integrity)?.path;
      if (!source || !verifies(source, artifact.integrity)) throw new Error(`Verified source disappeared: ${artifact.integrity}`);
      const destination = cachePath(cache, artifact.integrity);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(source, destination);
      artifact.cacheObject = relative(output, destination);
      for (const resolved of artifact.resolvedUrls) {
        const copied = exactIndexEntry(options.cache, resolved, artifact.integrity);
        const line = copied || synthesizedIndexEntry(resolved, artifact.integrity, statSync(source).size);
        if (!copied) synthesizedIndexEntries.push({ integrity: artifact.integrity, resolved, key: indexKey(resolved) });
        indexEntries.push({ integrity: artifact.integrity, resolved, key: indexKey(resolved), line, copied: Boolean(copied) });
      }
    }
    for (const entry of indexEntries.sort((left, right) => left.key.localeCompare(right.key))) {
      const destination = indexPath(cache, entry.key);
      mkdirSync(dirname(destination), { recursive: true });
      appendFileSync(destination, `${entry.line}\n`);
    }
  } finally { locations.cleanup(); }
  result.portableCache = {
    path: 'cache', cacachePath: 'cache/_cacache', indexEntryCount: indexEntries.length,
    copiedIndexEntryCount: indexEntries.filter((entry) => entry.copied).length,
    synthesizedIndexEntryCount: synthesizedIndexEntries.length,
    synthesizedIndexEntries
  };
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) return console.log(usage());
  const root = resolve(options.root);
  const result = report(root, options);
  if (options.command === 'export') exportBundle(result, options.output, options);
  if (options.command === 'export-cache') exportPortableCache(result, options.output, options);
  const manifest = options.manifest || (['export', 'export-cache'].includes(options.command) ? join(options.output, 'manifest.json') : null);
  if (manifest) writeJson(manifest, result);
  console.log(JSON.stringify({ artifactCount: result.artifactCount, foundCount: result.foundCount, missingCount: result.missingCount, manifest: manifest || null }, null, 2));
  if (result.missingCount) process.exitCode = 1;
}

try { main(); } catch (error) { console.error(`dependency-closure: ${error.message}`); process.exitCode = 2; }
