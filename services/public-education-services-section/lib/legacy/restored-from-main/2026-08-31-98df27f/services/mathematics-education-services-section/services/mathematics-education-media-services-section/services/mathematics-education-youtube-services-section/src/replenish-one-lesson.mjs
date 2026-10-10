#!/usr/bin/env node
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACTOR as RESEARCH,
  CUSTOMER as RESEARCH_CUSTOMER,
  admitSourcePacket,
  deliverSourcePacket,
  sourcePacketDraft,
} from "@emsenn/mathematics-research-enterprise";
import { journalRecords as researchJournalRecords } from "@emsenn/mathematics-research-enterprise/journal";
import {
  ACTOR as CURRICULUM,
  admitLessonBrief,
  deliverLessonBrief,
  formNextLessonOffer,
  loadCourse,
  loadLessonBriefDraft,
} from "@emsenn/mathematics-curriculum-enterprise";
import { journalRecords as curriculumJournalRecords } from "@emsenn/mathematics-curriculum-enterprise/journal";
import { ACTOR as CHANNEL, contentId } from "./channel.mjs";
import { journalRecords as channelJournalRecords } from "./journal.mjs";
import { HISTORICAL_PUBLICATION_CATEGORY } from "./historical-publication-admission.mjs";

const CLAIM_CATEGORY = "mathematics-youtube.daily-release-claim";
const SOURCE_CATEGORY = "mathematics-research.source-packet-admission";
const LESSON_CATEGORY = "mathematics-curriculum.lesson-brief-admission";

function mountedPackage(root, expectedName, label) {
  if (typeof root !== "string" || root.trim() === "") throw new TypeError(`${label} service root must be explicitly mounted`);
  const exact = resolve(root), manifestPath = join(exact, "package.json");
  if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() || !lstatSync(manifestPath).isFile()) throw new TypeError(`${label} service mount lacks an exact package manifest`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.name !== expectedName) throw new TypeError(`${label} service mount names ${manifest.name ?? "no package"}, not ${expectedName}`);
  return exact;
}

function exactRoot(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${label} journal root must be explicitly supplied`);
  return resolve(value);
}

function result(body) {
  return Object.freeze({ id: contentId(body, "mathematics-youtube.one-lesson-replenishment-result"), ...body });
}

export async function replenishOneMathematicsLesson(options = {}) {
  const at = options.at ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(at)) || new Date(at).toISOString() !== at) throw new TypeError("mathematics replenishment requires an exact ISO instant");
  const researchServiceRoot = mountedPackage(options.researchServiceRoot ?? process.env.MATHEMATICS_RESEARCH_SERVICE_ROOT, "@emsenn/mathematics-research-enterprise", "mathematics research");
  const curriculumServiceRoot = mountedPackage(options.curriculumServiceRoot ?? process.env.MATHEMATICS_CURRICULUM_SERVICE_ROOT, "@emsenn/mathematics-curriculum-enterprise", "mathematics curriculum");
  const researchJournalRoot = exactRoot(options.researchJournalRoot ?? process.env.MATHEMATICS_RESEARCH_JOURNAL_ROOT, "mathematics research");
  const curriculumJournalRoot = exactRoot(options.curriculumJournalRoot ?? process.env.MATHEMATICS_CURRICULUM_JOURNAL_ROOT, "mathematics curriculum");
  const channelJournalRoot = exactRoot(options.channelJournalRoot ?? process.env.MATHEMATICS_CHANNEL_JOURNAL_ROOT, "mathematics channel");
  if (new Set([researchJournalRoot, curriculumJournalRoot, channelJournalRoot]).size !== 3) throw new TypeError("mathematics replenishment journal roots must remain subject-owned and distinct");

  const lockRoot = resolve(options.lockRoot ?? join(channelJournalRoot, "runtime/replenishment-locks"));
  mkdirSync(lockRoot, { recursive: true });
  const lock = join(lockRoot, "one-lesson");
  try { mkdirSync(lock); }
  catch (error) {
    if (error?.code !== "EEXIST") throw error;
    return result({ type: "MathematicsOneLessonReplenishmentResult", outcome: "refused", code: "replenishment-concurrent", externalEffects: [], recordedAt: at });
  }

  try {
    const course = loadCourse(), completedLessonIds = [...channelJournalRecords(channelJournalRoot, CLAIM_CATEGORY), ...channelJournalRecords(channelJournalRoot, HISTORICAL_PUBLICATION_CATEGORY)]
      .filter((row) => row.courseId === course.courseId && row.courseRevision === course.revision)
      .map((row) => row.lessonId);
    const offer = formNextLessonOffer({ course, completedLessonIds: [...new Set(completedLessonIds)], offeredAt: at });
    const lesson = offer.object.lesson;
    const priorSources = researchJournalRecords(researchJournalRoot, SOURCE_CATEGORY);
    const priorLessons = curriculumJournalRecords(curriculumJournalRoot, LESSON_CATEGORY);
    const draft = sourcePacketDraft({ courseId: course.courseId, lessonId: lesson.id, revision: 1 });
    const sourcePacket = await admitSourcePacket(draft, { dataRoot: researchJournalRoot, at });
    const sourceDelivery = deliverSourcePacket(sourcePacket);
    const brief = loadLessonBriefDraft({ courseId: course.courseId, lessonId: lesson.id, revision: 1 });
    const lessonAdmission = await admitLessonBrief({ course, offer, sourcePacket, brief }, {
      dataRoot: curriculumJournalRoot,
      at,
      verifySourcePacket: async (candidate) => sourceDelivery.actor === RESEARCH
        && sourceDelivery.target === RESEARCH_CUSTOMER
        && sourceDelivery.target === CURRICULUM
        && sourceDelivery.object.id === candidate.id
        && candidate.id === sourcePacket.id,
    });
    const curriculumDelivery = deliverLessonBrief(lessonAdmission, CHANNEL);
    const replayed = priorSources.some((row) => row.id === sourcePacket.id) && priorLessons.some((row) => row.id === lessonAdmission.id);
    return result({
      type: "MathematicsOneLessonReplenishmentResult",
      outcome: replayed ? "replayed" : "completed",
      code: null,
      courseId: course.courseId,
      courseRevision: course.revision,
      lessonId: lesson.id,
      sequence: lesson.sequence,
      sourcePacket: sourcePacket.id,
      sourceDelivery: sourceDelivery.id,
      curriculumProduct: lessonAdmission.id,
      curriculumDelivery: curriculumDelivery.id,
      authenticatedSuppliers: [RESEARCH, CURRICULUM],
      journalRoots: { research: researchJournalRoot, curriculum: curriculumJournalRoot, channel: channelJournalRoot },
      serviceMounts: { research: researchServiceRoot, curriculum: curriculumServiceRoot },
      externalEffects: [],
      recordedAt: at,
    });
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

export async function main() {
  process.stdout.write(`${JSON.stringify(await replenishOneMathematicsLesson())}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => {
  process.stderr.write(`refused: ${error.message}\n`);
  process.exitCode = 78;
});
