#!/usr/bin/env node

import { lstatSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { planRoutinePublication, writeRoutinePublication } from "../routine-publication-current/src/routine-publication.mjs";
import { selectRoutineQueueJob } from "../src/routine-job-queue.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "https://bare-cedar-fog.561.group/actors/koios-news";
const SCHEDULE_DELIVERY_ACTOR = "https://bare-cedar-fog.561.group/actors/cold-red-gate-scheduled-activity-delivery";
const ROUTINE_CAPABILITY = "urn:capability:koios-news:cold-red-gate:routine-publication:v1";
const CONTRACT = "koios-news/routine-operation/v1";
const MAX_INPUT_BYTES = 128 * 1024;
const CONFIG_PATH = new URL("../config/routine-operation.json", import.meta.url).pathname;

function reply(source, code, reason, details = {}) {
  return {
    "@context": CONTEXT,
    type: "Reject",
    actor: KOIOS_ACTOR,
    target: typeof source?.actor === "string" ? source.actor : SCHEDULE_DELIVERY_ACTOR,
    inReplyTo: typeof source?.id === "string" ? source.id : "urn:activity:unidentified",
    object: {
      type: "KoiosRoutineOperationRefusal",
      contract: CONTRACT,
      code,
      reason,
      customerTerritoryMutation: false,
      ...details,
    },
  };
}
function accept(source, details) { return { "@context": CONTEXT, type: "Accept", actor: KOIOS_ACTOR, target: source.actor, inReplyTo: source.id, object: { type: "KoiosRoutineOperationReceipt", contract: CONTRACT, code: "offline-candidate-written", customerTerritoryMutation: true, ...details } }; }

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a nonempty string`);
  return value;
}

function admittedWorkOrder(activity) {
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Create") throw new Error("work order must be an ActivityStreams Create");
  requireString(activity.id, "work order id");
  if (activity.actor !== SCHEDULE_DELIVERY_ACTOR) throw new Error("work order actor is not the retained ScheduleDelivery provider");
  if (activity.target !== KOIOS_ACTOR) throw new Error("work order is not targeted to the retained Koios actor");
  if (activity.capability !== ROUTINE_CAPABILITY) throw new Error("work order does not carry the exact Koios routine-publication capability");
  const demand = activity.object;
  if (demand?.type !== "KoiosRoutinePublicationDemand" || demand.contract !== CONTRACT) throw new Error("work order demand is not the current Koios routine-publication contract");
  requireString(demand.pulseId, "work order pulseId");
  if (demand.operation !== "form-offline-candidate") throw new Error("work order names an unsupported routine operation");
  return demand;
}

async function readActivity() {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > MAX_INPUT_BYTES) throw new Error("work order exceeds the routine-operation input bound");
    chunks.push(buffer);
  }
  const input = Buffer.concat(chunks).toString("utf8");
  if (input === "") throw new Error("work order is required on standard input");
  try { return JSON.parse(input); }
  catch { throw new Error("work order is not valid JSON"); }
}
function readJson(path, label) { try { return JSON.parse(readFileSync(path, "utf8")); } catch (error) { throw new Error(`${label} is not readable JSON: ${error.message}`); } }
function requireAbsolutePath(value, label) { requireString(value, label); if (!value.startsWith("/")) throw new Error(`${label} must be an absolute path`); return resolve(value); }
function requireRealDirectory(path, label) { try { const stat = lstatSync(path); if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(); } catch { throw new Error(`${label} must be an existing real directory`); } return path; }
function requireRealFile(path, label) { try { const stat = lstatSync(path); if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(); } catch { throw new Error(`${label} must be an existing real file`); } return path; }
function safeChild(root, name, label) { const candidate = resolve(root, name), rel = relative(root, candidate); if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error(`${label} escapes its configured root`); return candidate; }
function operationConfig() {
  const config = readJson(CONFIG_PATH, "package routine-operation config"), required = ["contract", "jobEnvironment", "queueEnvironment", "authorityKeysEnvironment", "assessmentKeysEnvironment", "baselineRootEnvironment", "outputRootEnvironment", "replayRootEnvironment"];
  if (!config || typeof config !== "object" || Array.isArray(config) || Object.keys(config).length !== required.length || required.some((key) => typeof config[key] !== "string")) throw new Error("package routine-operation config has an invalid shape");
  if (config.contract !== CONTRACT || ![config.jobEnvironment, config.queueEnvironment, config.authorityKeysEnvironment, config.assessmentKeysEnvironment, config.baselineRootEnvironment, config.outputRootEnvironment, config.replayRootEnvironment].every((name) => /^[A-Z][A-Z0-9_]*$/u.test(name))) throw new Error("package routine-operation config is invalid");
  return config;
}
function selectedJob(demand, authorityNow, reserveQueue = true) {
  const config = operationConfig(), fixedJob = process.env[config.jobEnvironment], queueRoot = process.env[config.queueEnvironment];
  if ((typeof fixedJob === "string" && fixedJob !== "") === (typeof queueRoot === "string" && queueRoot !== "")) throw new Error(`exactly one of ${config.jobEnvironment} or ${config.queueEnvironment} is required`);
  const productionBaselineDir = requireRealDirectory(requireAbsolutePath(process.env[config.baselineRootEnvironment], `${config.baselineRootEnvironment} baseline root`), `${config.baselineRootEnvironment} baseline root`), outputRoot = requireRealDirectory(requireAbsolutePath(process.env[config.outputRootEnvironment], `${config.outputRootEnvironment} output root`), `${config.outputRootEnvironment} output root`), replayRoot = requireRealDirectory(requireAbsolutePath(process.env[config.replayRootEnvironment], `${config.replayRootEnvironment} replay root`), `${config.replayRootEnvironment} replay root`);
  const queued = queueRoot === undefined || queueRoot === "" ? undefined : selectRoutineQueueJob({ queueRoot: requireAbsolutePath(queueRoot, `${config.queueEnvironment} queue root`), replayRoot, pulseId: demand.pulseId, reserve: reserveQueue });
  const manifestPath = queued === undefined ? requireRealFile(requireAbsolutePath(fixedJob, `${config.jobEnvironment} job manifest`), `${config.jobEnvironment} job manifest`) : queued.manifestPath, job = readJson(manifestPath, "selected routine-publication job manifest");
  const required = ["admissionPath", "authorityGrantPath", "candidateName", "contentDir", "draftPath", "jobId", "operation"], optional = ["assessmentReceiptPath"];
  if (!job || typeof job !== "object" || Array.isArray(job) || Object.keys(job).some((key) => ![...required, ...optional].includes(key)) || required.some((key) => typeof job[key] !== "string")) throw new Error("selected routine-publication job manifest has an invalid shape");
  if (job.operation !== demand.operation) throw new Error("selected routine-publication job manifest names an unsupported operation");
  if (!/^[A-Za-z0-9_-]{16,128}$/u.test(job.jobId)) throw new Error("selected routine-publication job manifest has an invalid jobId");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(job.candidateName) || basename(job.candidateName) !== job.candidateName) throw new Error("selected routine-publication job manifest has an invalid candidateName");
  for (const field of ["contentDir", "draftPath", "admissionPath", "authorityGrantPath", ...optional.filter((key) => Object.hasOwn(job, key))]) requireAbsolutePath(job[field], `selected routine-publication job manifest ${field}`);
  const authorityKeysPath = requireRealFile(requireAbsolutePath(process.env[config.authorityKeysEnvironment], `${config.authorityKeysEnvironment} authority keys`), `${config.authorityKeysEnvironment} authority keys`);
  const assessmentKeysPath = Object.hasOwn(job, "assessmentReceiptPath") ? requireRealFile(requireAbsolutePath(process.env[config.assessmentKeysEnvironment], `${config.assessmentKeysEnvironment} assessment keys`), `${config.assessmentKeysEnvironment} assessment keys`) : undefined;
  return { ...job, authorityKeysPath, assessmentKeysPath, authorityNow, productionBaselineDir, outputDir: safeChild(outputRoot, job.candidateName, "candidate output"), replayRoot: safeChild(replayRoot, job.candidateName, "candidate replay"), queueReservation: queued };
}

function canonicalInstant(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) || new Date(value).toISOString() !== value) throw new Error(`${label} must be a canonical UTC timestamp`);
  return value;
}

if (process.argv[2] === "preflight") {
  try {
    const index = process.argv.indexOf("--now"), now = canonicalInstant(index < 0 ? undefined : process.argv[index + 1], "preflight --now");
    const job = selectedJob({ operation: "form-offline-candidate" }, now, false), plan = planRoutinePublication(job);
    process.stdout.write(`${JSON.stringify({ type: "KoiosRoutineOperationPreflight", ready: true, jobId: job.jobId, slug: plan.candidate.slug, authorityScope: plan.provenance.authority.scope, authorityValidity: { issuedAt: plan.provenance.authority.issuedAt, expiresAt: plan.provenance.authority.expiresAt }, sourceSha256: plan.candidate.sourceSha256, baseline: plan.provenance.baseline, executionMode: plan.provenance.runtime.executionMode, queueReservation: job.queueReservation === undefined ? undefined : { jobName: job.queueReservation.jobName, jobSha256: job.queueReservation.jobSha256 }, effects: [] }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`koios-news-routine-operation preflight: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
} else {

let activity;
let admitted = false;
try {
  activity = await readActivity();
  const demand = admittedWorkOrder(activity);
  admitted = true;
  canonicalInstant(activity.published, "work order published");
  const job = selectedJob(demand, activity.published), written = writeRoutinePublication(job);
  process.stdout.write(`${JSON.stringify(accept(activity, { pulseId: demand.pulseId, operation: demand.operation, jobId: job.jobId, disposition: written.disposition, slug: written.slug, candidate: written.outputDir, consumptionId: written.consumptionId, queueReservation: job.queueReservation === undefined ? undefined : { jobName: job.queueReservation.jobName, jobSha256: job.queueReservation.jobSha256 }, effects: ["offline-static-candidate-written", "publication-authority-use-recorded"], limitations: ["The accepted editorial authority was consumed only for this offline static candidate. This operation does not deploy, release, publish, or activate a schedule."] }), null, 2)}\n`);
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  process.stdout.write(`${JSON.stringify(reply(activity, admitted ? "offline-candidate-unavailable" : "invalid-work-order", reason), null, 2)}\n`);
  process.exitCode = 2;
}
}
