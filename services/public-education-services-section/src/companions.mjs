// A lesson's Studio companions: what else the account's Gemini Notebook pool
// makes from the lesson's report once its video is made, kept in the lesson's
// episode directory. Made media belongs to the channel repository that publishes
// it, beside the episode's thumbnail; the curriculum in the house repository holds
// text and receives no binaries. Lessons, articles and books draw on a companion
// through its media work receipt (output identity and file).
//
//   source     the report goes into the channel notebook as a source of its own
//              (titled apart from the video's, so neither removes the other's),
//              and is removed again once every companion is kept. Companions
//              follow the report: a revised report is made into them again;
//   companion  each kind production.json `companions` names (an infographic, a
//              slide deck) is one Studio work (gemini-notebook studio-work.mjs):
//              held in the allowance ledger, submitted, reconciled, observed
//              and downloaded, then received as a media work receipt;
//   failure    a kind Studio fails `maxFailures` times is given up for that
//              lesson; one waiting on capacity stops every lesson's companions
//              for the turn, since the window is the one pool.
//
// companions.json in the episode directory is the checkpoint, and each effect
// is appended to the episode's record.jsonl like the video's.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { completeMediaArtifactWork, createMediaArtifactWorkLot } from "@red-cup-engineering/computer-inference-engine/media/artifact-work";
import { allowanceLedgerPath } from "@red-cup-engineering/computer-inference-engine/media/allowance-ledger";
import { advanceStudioWork, StudioWorkBlocked } from "@red-cup-engineering/gemini-notebook-services-section/studio-work";
import { sha256Hex } from "@red-cup-engineering/cryptographic-computer-data-engineering-services-section/integrity";
import { episodeDirectory, lessonReportPath, readJson, recordedPath, writeAtomic } from "./channel.mjs";
import { PRINCIPAL } from "./video-capacity.mjs";

/** The companions a lesson can have: the file each is kept as and how Studio is asked for it. */
export const COMPANIONS = Object.freeze({
  infographic: {
    file: "infographic.png", mimeType: "image/png", capability: "source-grounded-infographic",
    options: { orientation: "landscape", detail: "standard" },
    instructions: (lesson) => `An infographic of the lesson "${lesson.title}": its central idea, how it works and the evidence for it, readable at a glance. Keep the report's qualifications; do not add claims it does not make.`,
  },
  "slide-deck": {
    file: "slides.pdf", mimeType: "application/pdf", capability: "source-grounded-slide-deck",
    options: { format: "detailed", length: "default" },
    instructions: (lesson) => `Slides for teaching the lesson "${lesson.title}" from this report: definitions, mechanism, evidence, examples and limitations, in the order a learner needs them. Keep the report's qualifications; do not add claims it does not make.`,
  },
});

const sha256 = (path) => sha256Hex(readFileSync(path));
const sha256ni = (path) => `ni:///sha-256;${Buffer.from(sha256(path), "hex").toString("base64url")}`;

/** Whether a lesson is ready for companions: its video is made or published, so they never compete with it. */
export const companionReady = (state) => Boolean(state?.reportSha256 && (state.videoWorkReceipt || state.youtubeVideoId) && state.notebookId && state.stage !== "abandoned");

/** The kinds still to make for a lesson under `kinds`, given its companions checkpoint. */
export const companionsWanted = (checkpoint, kinds, { maxFailures = 2 } = {}) => kinds.filter((kind) => {
  const entry = checkpoint?.kinds?.[kind];
  return !entry?.receipt && !entry?.givenUp && (entry?.work?.failedArtifacts ?? []).length < maxFailures;
});

/**
 * Advance one lesson's companions as far as they go now.
 * @returns {Promise<{channel, lesson, status, kinds?, message?}>} status `completed`, `not-ready`, or why it waits
 */
export async function advanceCompanions(config, lessonId, { client, notebook, kinds, maxFailures = 2, env = process.env, now = () => new Date(), recordStep }) {
  const lesson = config.curriculum.find((entry) => entry.id === lessonId);
  const dir = episodeDirectory(config, lessonId);
  const state = readJson(join(dir, "state.json"), null);
  const result = (status, extra = {}) => ({ channel: config.id, lesson: lessonId, status: `companions-${status}`, ...extra });
  if (!lesson || !companionReady(state)) return result("not-ready");
  const reportPath = lessonReportPath(config, lesson);
  if (!existsSync(reportPath)) return result("report-missing", { message: "The lesson report is missing" });
  const reportSha256 = sha256(reportPath);
  const checkpointPath = join(dir, "companions.json");
  let checkpoint = readJson(checkpointPath, { version: 1, reportSha256, kinds: {} });
  const save = (updates) => { checkpoint = { ...checkpoint, ...updates, updatedAt: now().toISOString() }; writeAtomic(checkpointPath, checkpoint); };
  const saveKind = (kind, updates) => save({ kinds: { ...checkpoint.kinds, [kind]: { ...checkpoint.kinds[kind], ...updates } } });
  const record = (entry) => recordStep(config, lessonId, { provider: "notebooklm", ...entry });
  const notebookId = state.notebookId;
  const removeSource = async () => {
    if (!checkpoint.source?.owned || !checkpoint.source.sourceId || checkpoint.source.removed) return true;
    try {
      await notebook.removeSources({ notebookId, sourceIds: [checkpoint.source.sourceId] });
      save({ source: { ...checkpoint.source, removed: true } });
      record({ step: "companion-source", outcome: "removed", sourceId: checkpoint.source.sourceId });
      return true;
    } catch (error) { record({ step: "companion-source", outcome: "cleanup-deferred", message: error.message }); return false; }
  };

  // Companions follow the report: a revised report is made into companions again from its own source.
  if (checkpoint.reportSha256 !== reportSha256) {
    if (!await removeSource()) return result("source-cleanup-deferred", { message: "The superseded report's source could not be removed yet" });
    record({ step: "companions", outcome: "report-revised", from: checkpoint.reportSha256, to: reportSha256 });
    checkpoint = { version: 1, reportSha256, kinds: {}, revisedFrom: checkpoint.reportSha256 };
    save({});
  }

  for (const kind of kinds) {
    const failed = checkpoint.kinds[kind]?.work?.failedArtifacts ?? [];
    if (!checkpoint.kinds[kind]?.receipt && !checkpoint.kinds[kind]?.givenUp && failed.length >= maxFailures) {
      saveKind(kind, { givenUp: now().toISOString() });
      record({ step: kind, outcome: "given-up", failures: failed });
    }
  }
  const wanted = companionsWanted(checkpoint, kinds, { maxFailures });

  if (wanted.length) {
    // source: the report as a source of the companions' own.
    let source;
    try {
      source = await notebook.ensureSource({ notebookId, reportPath, title: `${config.id}/${lessonId}/${reportSha256.slice(0, 16)}/companions`, checkpoint: checkpoint.source?.checkpoint ?? {}, onCheckpoint: (sourceCheckpoint) => save({ source: { ...checkpoint.source, checkpoint: sourceCheckpoint } }) });
    } catch (error) {
      return result(error.ambiguous ? "needs-reconcile" : "source-failed", { message: error.message });
    }
    if (checkpoint.source?.sourceId !== source.sourceId) {
      save({ source: { ...checkpoint.source, checkpoint: source.checkpoint, sourceId: source.sourceId, owned: checkpoint.source?.owned === true || source.created === true, removed: false } });
      record({ step: "companion-source", outcome: source.created ? "uploaded" : "found", sourceId: source.sourceId });
    }
    if (!source.ready) return result("source-processing", { message: "The companion source is still processing" });

    // Studio renders in parallel, so a companion still processing does not hold the next back; capacity does.
    const waiting = [];
    for (const kind of wanted) {
      const companion = COMPANIONS[kind];
      const outputPath = join(dir, companion.file);
      const request = { kind, sourceIds: [source.sourceId], instructions: companion.instructions(lesson), options: companion.options };
      const work = createMediaArtifactWorkLot({
        workLot: `${config.id}/${lessonId}/${kind}`, principal: PRINCIPAL, capability: companion.capability,
        prompt: JSON.stringify({ title: lesson.title, kind, instructions: request.instructions, options: request.options }),
        sources: [{ path: recordedPath(reportPath), identity: sha256ni(reportPath) }], outputMimeType: companion.mimeType,
      });
      if (checkpoint.kinds[kind]?.workLot !== work.id) {
        saveKind(kind, { workLot: work.id });
        record({ step: kind, outcome: "work-requested", capability: work.capability, workLot: work.id });
      }
      const made = await advanceStudioWork({
        client, notebookId, request, outputPath, principal: PRINCIPAL, reference: work.id,
        checkpoint: checkpoint.kinds[kind]?.work ?? {}, onCheckpoint: (studio) => saveKind(kind, { work: studio }),
        onRecord: record, storePath: allowanceLedgerPath(env), now,
      });
      if (made instanceof StudioWorkBlocked) {
        waiting.push(result(made.status, { kind, message: made.message }));
        if (made.status === "awaiting-capacity") break;
        continue;
      }
      const receipt = completeMediaArtifactWork(work, {
        providerIdentity: "urn:ame:gemini-notebook-services-section", product: "gemini-notebook",
        executionMode: "asynchronous-artifact-provider", providerArtifactId: made.artifactId,
        bytes: readFileSync(outputPath), mimeType: companion.mimeType,
        resource: made.capacity ?? { status: "not-observed" },
      });
      writeAtomic(join(dir, `${kind}-work-receipt.json`), receipt);
      saveKind(kind, { receipt: receipt.id, file: recordedPath(outputPath), sha256: made.output.sha256, title: made.title });
      record({ step: kind, outcome: "artifact-received", workLot: work.id, receipt: receipt.id, artifactId: made.artifactId, output: receipt.output.identity });
    }
    if (waiting.length) return waiting.find(({ status }) => status === "companions-awaiting-capacity") ?? waiting[0];
  }

  // Every companion is kept or given up: the source the companions owned goes.
  await removeSource();
  return result("completed", { kinds: Object.fromEntries(kinds.map((kind) => [kind, checkpoint.kinds[kind]?.receipt ? "kept" : "given-up"])) });
}
