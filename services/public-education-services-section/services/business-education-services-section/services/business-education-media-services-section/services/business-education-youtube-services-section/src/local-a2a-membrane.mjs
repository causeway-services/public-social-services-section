import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

function digest(value) { return createHash("sha256").update(value).digest("hex"); }
function clone(value) { return value === undefined ? undefined : structuredClone(value); }
function pathFor(root, coordinate) { return join(root, `${digest(coordinate)}.json`); }
function lane() { let pending = Promise.resolve(); return (operation) => { const next = pending.then(operation, operation); pending = next.catch(() => {}); return next; }; }
async function read(path) { try { return JSON.parse(await readFile(path, "utf8")); } catch (error) { if (error.code === "ENOENT") return null; throw error; } }
async function write(path, value) { await mkdir(dirname(path), { recursive: true }); const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`; await writeFile(temporary, `${JSON.stringify(value)}\n`, { mode: 0o600 }); await rename(temporary, path); }
async function list(root) { try { return (await Promise.all((await readdir(root)).filter((name) => name.endsWith(".json")).sort().map((name) => read(join(root, name))))).filter(Boolean); } catch (error) { if (error.code === "ENOENT") return []; throw error; } }

export function createLocalA2aTaskSource(root) {
  const serialize = lane();
  return Object.freeze({
    put(record) { return serialize(async () => { const stored = clone(record); await write(pathFor(root, `${record.tenant ?? ""}\0${record.taskId}`), stored); return clone(stored); }); },
    async get({ taskId, tenant = "" }) { return clone(await read(pathFor(root, `${tenant}\0${taskId}`))); },
    async list({ tenant = "" } = {}) { return clone((await list(root)).filter((record) => (record.tenant ?? "") === tenant)); },
  });
}

export function createLocalA2aCoordinationSource(root) {
  const serialize = lane(); const coordinate = ({ namespace, tenant = "", key }) => `${namespace}\0${tenant}\0${key}`;
  return Object.freeze({
    put(record) { return serialize(async () => { const stored = { ...clone(record), contentSha256: digest(JSON.stringify(record)), etag: randomUUID() }; await write(pathFor(root, coordinate(record)), stored); return clone(stored); }); },
    async get(record) { return clone(await read(pathFor(root, coordinate(record)))); },
    async list({ namespace, tenant = "" }) { return clone((await list(root)).filter((record) => record.namespace === namespace && (record.tenant ?? "") === tenant)); },
    remove(record) { return serialize(async () => { try { await rm(pathFor(root, coordinate(record))); return true; } catch (error) { if (error.code === "ENOENT") return false; throw error; } }); },
  });
}

export function localA2aMembrane(stateRoot, providerName) {
  const root = resolve(stateRoot, "a2a-state", providerName);
  return { taskSource: createLocalA2aTaskSource(join(root, "tasks")), coordinationSource: createLocalA2aCoordinationSource(join(root, "coordination")) };
}
