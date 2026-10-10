#!/usr/bin/env node
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as curriculumAuthority from "@emsenn/artificial-intelligence-curriculum-enterprise/curriculum";
import * as researchAuthority from "@emsenn/artificial-intelligence-research-enterprise/research";
import { ACTOR as CHANNEL, contentId } from "./channel.mjs";
import { INVENTORY_CATEGORY } from "./inventory.mjs";
import { queryJournalRecords } from "./record-journal.mjs";
import { HISTORICAL_PUBLICATION_CATEGORY } from "./historical-publication-admission.mjs";

export const NO_DECLARED_AI_RESEARCH = "AI research has no declared packet for the next eligible lesson";

const MOUNTED_AUTHORITIES = Object.freeze({
  "@emsenn/artificial-intelligence-curriculum-enterprise": curriculumAuthority,
  "@emsenn/artificial-intelligence-research-enterprise": researchAuthority,
});

function exactChannelRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const { id, ...body } = value;
  return id === contentId(body);
}

function exactRoot(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${label} journal root must be explicitly supplied`);
  return resolve(value);
}

async function mountedExport(root, expectedName, subpath, label) {
  if (typeof root !== "string" || root.trim() === "") throw new TypeError(`${label} service root must be explicitly mounted`);
  const mountedRoot = realpathSync(resolve(root)), manifestPath = join(mountedRoot, "package.json");
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() || !lstatSync(manifestPath).isFile()) throw new TypeError(`${label} service mount lacks an exact package manifest`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== expectedName) throw new TypeError(`${label} service mount names ${manifest.name ?? "no package"}, not ${expectedName}`);
  const relativeExport = manifest.exports?.[subpath];
  if (typeof relativeExport !== "string" || !relativeExport.startsWith("./")) throw new TypeError(`${label} service does not declare ${subpath}`);
  const candidate = resolve(mountedRoot, relativeExport), targetRoot = `${mountedRoot}/`;
  if (!candidate.startsWith(targetRoot) || !existsSync(candidate) || lstatSync(candidate).isSymbolicLink() || !lstatSync(candidate).isFile()) throw new TypeError(`${label} service export escapes or is not a regular file`);
  const target = realpathSync(candidate);
  if (!target.startsWith(targetRoot)) throw new TypeError(`${label} service export escapes through an indirection`);
  const authority = MOUNTED_AUTHORITIES[expectedName];
  if (!authority) throw new TypeError(`${label} service has no admitted static authority`);
  return { mountedRoot, module: authority };
}

function result(body) {
  return Object.freeze({ id: contentId(body), ...body });
}

export async function replenishOneArtificialIntelligenceLesson(options = {}) {
  const at = options.at ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(at)) || new Date(at).toISOString() !== at) throw new TypeError("AI replenishment requires an exact ISO instant");
  const researchMount = await mountedExport(options.researchServiceRoot ?? process.env.ARTIFICIAL_INTELLIGENCE_RESEARCH_SERVICE_ROOT, "@emsenn/artificial-intelligence-research-enterprise", "./research", "AI research");
  const curriculumMount = await mountedExport(options.curriculumServiceRoot ?? process.env.ARTIFICIAL_INTELLIGENCE_CURRICULUM_SERVICE_ROOT, "@emsenn/artificial-intelligence-curriculum-enterprise", "./curriculum", "AI curriculum");
  const researchJournalRoot = exactRoot(options.researchJournalRoot ?? process.env.ARTIFICIAL_INTELLIGENCE_RESEARCH_JOURNAL_ROOT, "AI research");
  const curriculumJournalRoot = exactRoot(options.curriculumJournalRoot ?? process.env.ARTIFICIAL_INTELLIGENCE_CURRICULUM_JOURNAL_ROOT, "AI curriculum");
  const channelJournalRoot = exactRoot(options.channelJournalRoot ?? process.env.ARTIFICIAL_INTELLIGENCE_CHANNEL_JOURNAL_ROOT, "AI channel");
  if (new Set([researchJournalRoot, curriculumJournalRoot, channelJournalRoot]).size !== 3) throw new TypeError("AI replenishment journal roots must remain subject-owned and distinct");

  const lockRoot = resolve(options.lockRoot ?? join(channelJournalRoot, "runtime/replenishment-locks"));
  mkdirSync(lockRoot, { recursive: true });
  const lock = join(lockRoot, "one-lesson");
  try { mkdirSync(lock); }
  catch (error) {
    if (error?.code !== "EEXIST") throw error;
    return result({ type: "ArtificialIntelligenceOneLessonReplenishmentResult", outcome: "refused", code: "replenishment-concurrent", externalEffects: [], recordedAt: at });
  }

  try {
    const research = researchMount.module, curriculum = curriculumMount.module, course = curriculum.loadCourse();
    if (research.CUSTOMER !== curriculum.ACTOR) throw new TypeError("AI mounted research and curriculum authorities do not form one delivery relation");
    const inventoryRows = queryJournalRecords(INVENTORY_CATEGORY, { root: channelJournalRoot });
    if (inventoryRows.some((row) => !exactChannelRecord(row) || row.type !== "ArtificialIntelligenceExplainerInventoryAdmission")) throw new TypeError("AI replenishment inventory contains a foreign or malformed record");
    const historicalRows = queryJournalRecords(HISTORICAL_PUBLICATION_CATEGORY, { root: channelJournalRoot });
    if (historicalRows.some((row) => !exactChannelRecord(row) || row.type !== "ArtificialIntelligenceHistoricalPublicReleaseAdmission")) throw new TypeError("AI replenishment historical completion contains a foreign or malformed record");
    const completedLessonIds = [...inventoryRows, ...historicalRows]
      .filter((row) => row.courseId === course.courseId && row.courseRevision === course.revision)
      .map((row) => row.lessonId);
    const offer = curriculum.formNextLessonOffer({ course, completedLessonIds: [...new Set(completedLessonIds)], offeredAt: at }), lesson = offer.object.lesson;
    if (research.researchDraftAvailable({ courseId: course.courseId, lessonId: lesson.id, revision: 1 }) !== true) return result({ type: "ArtificialIntelligenceOneLessonReplenishmentResult", outcome: "no-work", code: "no-declared-research-packet", courseId: course.courseId, courseRevision: course.revision, lessonId: lesson.id, sequence: lesson.sequence, externalEffects: [], recordedAt: at });
    const priorResearch = research.admittedResearchProducts({ dataRoot: researchJournalRoot });
    const priorLessons = curriculum.admittedLessonProducts({ dataRoot: curriculumJournalRoot });
    const draft = research.loadResearchDraftForLesson({ courseId: course.courseId, lessonId: lesson.id, revision: 1 });
    const researchProduct = await research.admitResearchProduct(draft, { dataRoot: researchJournalRoot, at });
    const researchDelivery = research.deliverResearchProduct(researchProduct);
    const brief = curriculum.loadLessonBriefDraft({ courseId: course.courseId, lessonId: lesson.id, revision: 1 });
    const lessonProduct = await curriculum.admitLessonProduct({ course, offer, researchDelivery, brief }, {
      dataRoot: curriculumJournalRoot,
      at,
      verifyResearchDelivery: async (candidate) => candidate === researchDelivery
        && candidate.actor === research.ACTOR
        && candidate.target === curriculum.ACTOR
        && candidate.object?.product?.id === researchProduct.id,
    });
    const curriculumDelivery = curriculum.deliverLessonProduct(lessonProduct, CHANNEL);
    const replayed = priorResearch.some((row) => row.id === researchProduct.id) && priorLessons.some((row) => row.id === lessonProduct.id);
    return result({
      type: "ArtificialIntelligenceOneLessonReplenishmentResult",
      outcome: replayed ? "replayed" : "completed",
      code: null,
      courseId: course.courseId,
      courseRevision: course.revision,
      lessonId: lesson.id,
      sequence: lesson.sequence,
      researchProduct: researchProduct.id,
      researchDelivery: researchDelivery.id,
      curriculumProduct: lessonProduct.id,
      curriculumDelivery: curriculumDelivery.id,
      authenticatedSuppliers: [research.ACTOR, curriculum.ACTOR],
      journalRoots: { research: researchJournalRoot, curriculum: curriculumJournalRoot, channel: channelJournalRoot },
      serviceMounts: { research: researchMount.mountedRoot, curriculum: curriculumMount.mountedRoot },
      externalEffects: [],
      recordedAt: at,
    });
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

export async function main() {
  const value = await replenishOneArtificialIntelligenceLesson();
  process.stdout.write(`${JSON.stringify(value)}\n`);
  if (value.outcome === "no-work") {
    process.stderr.write(`refused: ${NO_DECLARED_AI_RESEARCH}\n`);
    process.exitCode = 78;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => {
  process.stderr.write(`refused: ${error.message}\n`);
  process.exitCode = 78;
});
