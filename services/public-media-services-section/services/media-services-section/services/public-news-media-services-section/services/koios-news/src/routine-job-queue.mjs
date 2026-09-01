import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const KIND = "koios.news.routine-publication-queue-reservation/v1";
const digest = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const recordName = (value) => createHash("sha256").update(value).digest("hex");
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const jobFile = (name) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.json$/u.test(name);

function realDirectory(path, label) {
  const absolute = resolve(path);
  try {
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error();
  } catch { throw new Error(`${label} must be an existing real directory`); }
  return absolute;
}
function readReservation(path, label) {
  let value;
  try { value = JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { throw new Error(`${label} is not readable JSON: ${error.message}`); }
  if (!isRecord(value) || value.kind !== KIND || typeof value.pulseId !== "string" || typeof value.jobName !== "string" || typeof value.jobSha256 !== "string") throw new Error(`${label} has an invalid shape`);
  return value;
}
function createOnlyJson(path, value) {
  let descriptor;
  try { descriptor = openSync(path, "wx", 0o600); }
  catch (error) { if (error?.code === "EEXIST") return false; throw error; }
  try { writeFileSync(descriptor, `${JSON.stringify(value)}\n`, "utf8"); fsyncSync(descriptor); }
  finally { closeSync(descriptor); }
  return true;
}
function fsyncDirectory(path) {
  const descriptor = openSync(path, "r");
  try { fsyncSync(descriptor); }
  finally { closeSync(descriptor); }
}
function selectedJob(queueRoot, reservation, label) {
  if (!jobFile(reservation.jobName)) throw new Error(`${label} names an invalid queue job`);
  const path = join(queueRoot, reservation.jobName);
  let stat;
  try { stat = lstatSync(path); }
  catch { throw new Error(`${label} names a missing queue job: ${reservation.jobName}`); }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${label} names a non-regular queue job: ${reservation.jobName}`);
  const bytes = readFileSync(path);
  if (digest(bytes) !== reservation.jobSha256) throw new Error(`${label} queue job changed after reservation: ${reservation.jobName}`);
  return Object.freeze({ manifestPath: path, jobName: reservation.jobName, jobSha256: reservation.jobSha256 });
}

// Queue entries are immutable ceremony-formed routine-job JSON files. The
// replay root, not the read-only queue, holds durable occurrence-to-job
// bindings so retries cannot advance the queue or rebind a manuscript.
export function selectRoutineQueueJob({ queueRoot, replayRoot, pulseId, reserve = true }) {
  if (reserve && (typeof pulseId !== "string" || pulseId === "")) throw new Error("queue selection requires a pulseId");
  const queue = realDirectory(queueRoot, "routine-publication queue root");
  const replay = realDirectory(replayRoot, "routine-publication replay root");
  const reservations = join(replay, "queue-reservations");
  const claims = join(reservations, "claims");
  if (reserve) {
    mkdirSync(claims, { recursive: true, mode: 0o700 });
    fsyncDirectory(replay); fsyncDirectory(reservations); fsyncDirectory(claims);
  } else if (existsSync(reservations)) {
    realDirectory(reservations, "queue reservation root");
    if (existsSync(claims)) realDirectory(claims, "queue claim store");
  }
  const occurrencePath = reserve ? join(reservations, `${recordName(pulseId)}.json`) : undefined;
  if (occurrencePath !== undefined && existsSync(occurrencePath)) return selectedJob(queue, readReservation(occurrencePath, "queue occurrence reservation"), "queue occurrence reservation");

  let recovered;
  const claimed = new Set();
  const claimEntries = existsSync(claims) ? readdirSync(claims, { withFileTypes: true }) : [];
  for (const entry of claimEntries.sort((left, right) => Buffer.compare(Buffer.from(left.name), Buffer.from(right.name)))) {
    if (!entry.isFile() || !/^[a-f0-9]{64}\.json$/u.test(entry.name)) throw new Error(`queue claim store contains an unsupported entry: ${entry.name}`);
    const reservation = readReservation(join(claims, entry.name), "queue job claim");
    claimed.add(reservation.jobName);
    if (reservation.pulseId === pulseId) {
      if (recovered) throw new Error("queue claim store has multiple jobs for one pulse");
      recovered = reservation;
    }
  }
  if (recovered) {
    createOnlyJson(occurrencePath, recovered);
    fsyncDirectory(reservations);
    return selectedJob(queue, recovered, "queue job claim");
  }

  const names = readdirSync(queue, { withFileTypes: true })
    .map((entry) => {
      if (!entry.isFile() || !jobFile(entry.name)) throw new Error(`routine-publication queue contains an unsupported entry: ${entry.name}`);
      return entry.name;
    })
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  for (const jobName of names) {
    if (claimed.has(jobName)) continue;
    const path = join(queue, jobName);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`routine-publication queue job is not a regular file: ${jobName}`);
    const reservation = Object.freeze({ kind: KIND, pulseId: reserve ? pulseId : "preflight", jobName, jobSha256: digest(readFileSync(path)) });
    if (!reserve) return selectedJob(queue, reservation, "queue preflight selection");
    if (!createOnlyJson(join(claims, `${recordName(jobName)}.json`), reservation)) continue;
    fsyncDirectory(claims);
    createOnlyJson(occurrencePath, reservation);
    fsyncDirectory(reservations);
    return selectedJob(queue, reservation, "new queue reservation");
  }
  throw new Error("routine-publication queue has no unreserved jobs");
}
