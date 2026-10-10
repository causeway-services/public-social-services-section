#!/usr/bin/env node
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as research from "@emsenn/modern-business-research-enterprise";
import * as curriculum from "@emsenn/modern-business-curriculum-enterprise";
import { admitBootstrapCompletion } from "./bootstrap-completion.mjs";
import { ACTOR as CHANNEL, contentId } from "./channel.mjs";
import { INVENTORY_CATEGORY } from "./inventory.mjs";
import { querySettlementRecords } from "./record-journal.mjs";

function exactRoot(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${label} journal root must be explicitly supplied`);
  return resolve(value);
}

function mountedMainExport(root, expectedName, label) {
  if (typeof root !== "string" || root.trim() === "") throw new TypeError(`${label} service root must be explicitly mounted`);
  const mountedRoot = realpathSync(resolve(root)), manifestPath = join(mountedRoot, "package.json");
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() || !lstatSync(manifestPath).isFile()) throw new TypeError(`${label} service mount lacks an exact package manifest`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== expectedName) throw new TypeError(`${label} service mount names ${manifest.name ?? "no package"}, not ${expectedName}`);
  const relativeExport = typeof manifest.exports === "string" ? manifest.exports : manifest.exports?.["."];
  if (typeof relativeExport !== "string" || !relativeExport.startsWith("./")) throw new TypeError(`${label} service does not declare its main export`);
  const candidate = resolve(mountedRoot, relativeExport), targetRoot = `${mountedRoot}/`;
  if (!candidate.startsWith(targetRoot) || !existsSync(candidate) || lstatSync(candidate).isSymbolicLink() || !lstatSync(candidate).isFile()) throw new TypeError(`${label} service export escapes or is not a regular file`);
  const target = realpathSync(candidate);
  if (!target.startsWith(targetRoot)) throw new TypeError(`${label} service export escapes through an indirection`);
  return { mountedRoot };
}

function result(body) { return Object.freeze({ id: contentId(body), ...body }); }
function exactChannelRecord(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }

export async function replenishOneModernBusinessLesson(options = {}) {
  const at = options.at ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(at)) || new Date(at).toISOString() !== at) throw new TypeError("business replenishment requires an exact ISO instant");
  const researchMount = mountedMainExport(options.researchServiceRoot ?? process.env.MODERN_BUSINESS_RESEARCH_SERVICE_ROOT ?? research.NODE_ROOT, "@emsenn/modern-business-research-enterprise", "business research");
  const curriculumMount = mountedMainExport(options.curriculumServiceRoot ?? process.env.MODERN_BUSINESS_CURRICULUM_SERVICE_ROOT ?? curriculum.NODE_ROOT, "@emsenn/modern-business-curriculum-enterprise", "business curriculum");
  const researchJournalRoot = exactRoot(options.researchJournalRoot ?? process.env.MODERN_BUSINESS_RESEARCH_JOURNAL_ROOT, "business research");
  const curriculumJournalRoot = exactRoot(options.curriculumJournalRoot ?? process.env.MODERN_BUSINESS_CURRICULUM_JOURNAL_ROOT, "business curriculum");
  const channelJournalRoot = exactRoot(options.channelJournalRoot ?? process.env.MODERN_BUSINESS_CHANNEL_JOURNAL_ROOT, "business channel");
  if (new Set([researchJournalRoot, curriculumJournalRoot, channelJournalRoot]).size !== 3) throw new TypeError("business replenishment journal roots must remain subject-owned and distinct");
  const lockRoot = resolve(options.lockRoot ?? join(channelJournalRoot, "runtime/replenishment-locks"));
  mkdirSync(lockRoot, { recursive: true });
  const lock = join(lockRoot, "one-lesson");
  try { mkdirSync(lock); }
  catch (error) {
    if (error?.code !== "EEXIST") throw error;
    return result({ type: "ModernBusinessOneLessonReplenishmentResult", outcome: "refused", code: "replenishment-concurrent", externalEffects: [], recordedAt: at });
  }

  try {
    const course = curriculum.loadCourse();
    if (research.CUSTOMER !== curriculum.ACTOR) throw new TypeError("mounted business research and curriculum authorities do not form one delivery relation");
    const bootstrap = await (options.admitBootstrapCompletion ?? admitBootstrapCompletion)({ dataRoot: channelJournalRoot, at, witnessJournalAgentUrl: options.witnessJournalAgentUrl });
    if (!exactChannelRecord(bootstrap) || bootstrap.type !== "ModernBusinessBootstrapCourseCompletion" || bootstrap.channel !== CHANNEL || bootstrap.courseId !== course.courseId || bootstrap.courseRevision !== course.revision || bootstrap.sequence !== 1 || bootstrap.lessonId !== course.lessons[0].id || bootstrap.status !== "legacy-publication-admitted") throw new TypeError("business replenishment requires the exact admitted bootstrap completion");
    const inventory = await querySettlementRecords(INVENTORY_CATEGORY, { root: channelJournalRoot }), byId = new Map(course.lessons.map((lesson) => [lesson.id, lesson]));
    for (const row of inventory) {
      const lesson = byId.get(row?.lessonId);
      if (!exactChannelRecord(row) || row.type !== "ModernBusinessExplainerInventoryAdmission" || row.channel !== CHANNEL || row.courseId !== course.courseId || row.courseRevision !== course.revision || !lesson || row.sequence !== lesson.sequence || JSON.stringify(row.prerequisites) !== JSON.stringify(lesson.prerequisites)) throw new TypeError("business replenishment found foreign or malformed channel inventory");
    }
    const completedLessonIds = [...new Set([bootstrap.lessonId, ...inventory.map((row) => row.lessonId)])];
    let offer;
    try { offer = curriculum.formNextLessonOffer({ course, completedLessonIds, offeredAt: at }); }
    catch (error) {
      if (!/no eligible next lesson/u.test(error?.message ?? "")) throw error;
      return result({ type: "ModernBusinessOneLessonReplenishmentResult", outcome: "no-work", code: "course-complete", courseId: course.courseId, courseRevision: course.revision, completedLessonIds, externalEffects: [], recordedAt: at });
    }
    const lesson = offer.object.lesson, declaration = { courseId: course.courseId, lessonId: lesson.id, revision: 1 }, missingDeclarations = [];
    if (!research.hasResearchDraftForLesson(declaration)) missingDeclarations.push("research-manifest");
    if (!curriculum.hasLessonBrief(declaration)) missingDeclarations.push("curriculum-brief");
    if (missingDeclarations.length) return result({ type: "ModernBusinessOneLessonReplenishmentResult", outcome: "no-work", code: "no-declared-research-or-brief", courseId: course.courseId, courseRevision: course.revision, lessonId: lesson.id, sequence: lesson.sequence, missingDeclarations, externalEffects: [], recordedAt: at });
    const priorResearch = research.admittedResearchProducts({ dataRoot: researchJournalRoot }), priorLessons = curriculum.admittedLessonProducts({ dataRoot: curriculumJournalRoot });
    const draft = research.loadResearchDraftForLesson(declaration), researchProduct = await research.admitResearchProduct(draft, { dataRoot: researchJournalRoot, at }), researchDelivery = research.deliverResearchProduct(researchProduct);
    const brief = curriculum.loadLessonBriefForLesson(declaration), lessonProduct = await curriculum.admitLessonProduct({ course, offer, researchDelivery, brief }, {
      dataRoot: curriculumJournalRoot,
      at,
      verifyResearchDelivery: async (candidate) => candidate === researchDelivery && candidate.actor === research.ACTOR && candidate.target === curriculum.ACTOR && candidate.object?.product?.id === researchProduct.id,
    });
    const curriculumDelivery = curriculum.deliverLessonProduct(lessonProduct, CHANNEL), replayed = priorResearch.some((row) => row.id === researchProduct.id) && priorLessons.some((row) => row.id === lessonProduct.id);
    return result({ type: "ModernBusinessOneLessonReplenishmentResult", outcome: replayed ? "replayed" : "completed", code: null, courseId: course.courseId, courseRevision: course.revision, lessonId: lesson.id, sequence: lesson.sequence, researchProduct: researchProduct.id, researchDelivery: researchDelivery.id, curriculumProduct: lessonProduct.id, curriculumDelivery: curriculumDelivery.id, authenticatedSuppliers: [research.ACTOR, curriculum.ACTOR], journalRoots: { research: researchJournalRoot, curriculum: curriculumJournalRoot, channel: channelJournalRoot }, serviceMounts: { research: researchMount.mountedRoot, curriculum: curriculumMount.mountedRoot }, externalEffects: [], recordedAt: at });
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export async function main() {
  const value = await replenishOneModernBusinessLesson();
  process.stdout.write(`${JSON.stringify(value)}\n`);
  if (value.outcome === "no-work") { process.stderr.write(`refused: business replenishment no-work: ${value.code}\n`); process.exitCode = 78; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => { process.stderr.write(`refused: ${error.message}\n`); process.exitCode = 78; });
