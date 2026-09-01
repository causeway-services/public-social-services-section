import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { journalRecords, recordJournal } from "./journal.mjs";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

const semanticId = (objectKind, value) => identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
const exactSemanticRecord = (objectKind, value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const { id, ...body } = value;
  return id === semanticId(objectKind, body);
};

export const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ACTOR = "urn:ame:mathematics-curriculum-enterprise";
export const COURSE_PATH = join(NODE_ROOT, "content/curricula/causality-and-kinematic-space.v1.json");
export const LESSON_BRIEF_ROOT = join(NODE_ROOT, "content/lesson-briefs");
const REQUIRED_RIGHTS = ["notebooklm-transformation", "public-youtube-release"];
const WITHHELD = ["youtube-channel-authority", "youtube-credential-custody", "notebooklm-provider-authority", "playlist-or-course-designation", "upload-schedule-or-publication-authority"];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function digest(value) { return semanticId("mathematics-curriculum.semantic-digest", value); }
export function contentId(objectKind, value) { return semanticId(objectKind, value); }
export function loadCourse(path = COURSE_PATH) { return JSON.parse(readFileSync(path, "utf8")); }
export function loadLessonBriefDraft({ courseId, lessonId, revision = 1 } = {}) {
  if (!ID.test(courseId ?? "") || !ID.test(lessonId ?? "") || !Number.isInteger(revision) || revision < 1) throw new TypeError("lesson brief lookup requires bounded course, lesson, and revision identities");
  const root = realpathSync(LESSON_BRIEF_ROOT), path = join(root, courseId, `${lessonId}.v${revision}.json`), actual = realpathSync(path);
  if (!actual.startsWith(`${root}/`)) throw new TypeError("lesson brief escapes the curriculum settlement");
  const stat = lstatSync(path); if (stat.isSymbolicLink() || !stat.isFile() || stat.size < 100 || stat.size > 1_000_000) throw new TypeError("lesson brief must be one bounded regular file");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validateCourse(course) {
  if (course?.type !== "MathematicsCourseRevision" || typeof course.courseId !== "string" || !Number.isInteger(course.revision) || course.revision < 1) throw new TypeError("course requires a named positive revision");
  if (!Array.isArray(course.competencies) || course.competencies.length === 0 || !Array.isArray(course.lessons) || course.lessons.length === 0) throw new TypeError("course requires competencies and lessons");
  const competencyIds = course.competencies.map((entry) => entry?.id);
  if (competencyIds.some((id) => typeof id !== "string") || new Set(competencyIds).size !== competencyIds.length) throw new TypeError("course competency identities must be unique");
  const lessonIds = course.lessons.map((lesson) => lesson?.id);
  if (lessonIds.some((id) => typeof id !== "string") || new Set(lessonIds).size !== lessonIds.length) throw new TypeError("course lesson identities must be unique");
  const byId = new Map(course.lessons.map((lesson) => [lesson.id, lesson]));
  for (const [index, lesson] of course.lessons.entries()) {
    if (lesson.sequence !== index + 1) throw new TypeError("course lesson sequence must be unique and contiguous");
    if (!Array.isArray(lesson.prerequisites) || new Set(lesson.prerequisites).size !== lesson.prerequisites.length) throw new TypeError("lesson prerequisites must be unique arrays");
    if (!Array.isArray(lesson.competencies) || lesson.competencies.some((id) => !competencyIds.includes(id))) throw new TypeError("lesson names an unknown competency");
    for (const prerequisite of lesson.prerequisites) {
      const predecessor = byId.get(prerequisite);
      if (!predecessor || predecessor.sequence >= lesson.sequence) throw new TypeError("course prerequisite graph must be acyclic and point backward");
    }
  }
  return { courseDigest: semanticId("mathematics-curriculum.course-revision", course), lessonCount: course.lessons.length, competencyCount: competencyIds.length };
}

export function formNextLessonOffer({ course = loadCourse(), completedLessonIds = [], offeredAt = new Date().toISOString() } = {}) {
  const { courseDigest } = validateCourse(course);
  if (!Array.isArray(completedLessonIds) || new Set(completedLessonIds).size !== completedLessonIds.length) throw new TypeError("completedLessonIds must be unique");
  const known = new Set(course.lessons.map((lesson) => lesson.id));
  if (completedLessonIds.some((id) => !known.has(id))) throw new TypeError("completedLessonIds contains a foreign lesson");
  const completed = new Set(completedLessonIds);
  for (const completedId of completed) {
    const completedLesson = course.lessons.find((lesson) => lesson.id === completedId);
    if (completedLesson.prerequisites.some((id) => !completed.has(id))) throw new TypeError("completedLessonIds does not satisfy its own prerequisites");
  }
  const lesson = course.lessons.find((candidate) => !completed.has(candidate.id) && candidate.prerequisites.every((id) => completed.has(id)));
  if (!lesson) throw new TypeError("course has no prerequisite-eligible uncompleted lesson");
  const object = {
    type: "MathematicsLessonBriefOrderTerms", courseId: course.courseId, courseRevision: course.revision,
    courseDigest, lesson: structuredClone(lesson), price: { status: "same-legal-body-cost-allocation", accountingUnit: "USD-micros", amountMicros: 100000, cashSettlementRequired: false, externalBoundaryProtocol: "x402" },
    authorityWithheld: [...WITHHELD],
  };
  const body = { type: "Offer", actor: ACTOR, object, published: offeredAt };
  return { id: contentId("mathematics-curriculum.next-lesson-offer", body), ...body };
}

function exactId(value, objectKind) { return exactSemanticRecord(objectKind, value); }
function requireText(value, name) { if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${name} must be non-empty`); return value; }

function record(category, value, options = {}) {
  const at = options.at ?? new Date().toISOString();
  return recordJournal(resolve(options.dataRoot ?? NODE_ROOT), category, at, value);
}

export async function admitLessonBrief({ course = loadCourse(), offer, sourcePacket, brief } = {}, options = {}) {
  const { courseDigest } = validateCourse(course);
  if (!exactId(offer, "mathematics-curriculum.next-lesson-offer") || offer.type !== "Offer" || offer.actor !== ACTOR) throw new TypeError("lesson admission requires the curriculum's content-valid offer");
  const terms = offer.object;
  if (terms?.courseId !== course.courseId || terms.courseRevision !== course.revision || terms.courseDigest !== courseDigest) throw new TypeError("lesson offer does not bind the exact course revision");
  const lesson = course.lessons.find((entry) => entry.id === terms.lesson?.id);
  if (!lesson || canonical(terms.lesson) !== canonical(lesson)) throw new TypeError("lesson offer does not preserve course membership");
  if (!exactId(sourcePacket, "mathematics-research.source-packet-admission") || sourcePacket.type !== "ResearchSourcePacketAdmission" || sourcePacket.courseId !== course.courseId || sourcePacket.lessonId !== lesson.id || !/^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u.test(sourcePacket.corpusDigest ?? "")) throw new TypeError("lesson admission requires a content-valid source packet for the exact lesson");
  if (typeof options.verifySourcePacket !== "function" || (await options.verifySourcePacket(sourcePacket)) !== true) throw new TypeError("source packet lacks authenticated supplier delivery evidence");
  if (!Array.isArray(sourcePacket.reuseGrant) || REQUIRED_RIGHTS.some((right) => !sourcePacket.reuseGrant.includes(right))) throw new TypeError("source packet lacks NotebookLM and public-release reuse rights");
  if (brief?.type !== "MathematicsLessonBriefDraft" || brief.courseId !== course.courseId || brief.courseRevision !== course.revision || brief.lessonId !== lesson.id) throw new TypeError("lesson brief does not bind the exact course revision and lesson");
  if (!Array.isArray(brief?.learningObjectives) || brief.learningObjectives.length === 0 || !Array.isArray(brief.definitions) || brief.definitions.length === 0) throw new TypeError("lesson brief requires objectives and definitions");
  requireText(brief.notebookPrompt, "notebookPrompt"); requireText(brief.humanFrame, "humanFrame"); requireText(brief.assessment, "assessment");
  const notebookPromptDigest = semanticId("mathematics-curriculum.notebook-prompt", brief.notebookPrompt), root = resolve(options.dataRoot ?? NODE_ROOT);
  const lessonPrior = journalRecords(root, "mathematics-curriculum.lesson-brief-admission").find((row) => row.courseId === course.courseId && row.courseRevision === course.revision && row.lessonId === lesson.id);
  if (lessonPrior) {
    if (lessonPrior.sourcePacket === sourcePacket.id && lessonPrior.notebookPromptDigest === notebookPromptDigest && canonical(lessonPrior.learningObjectives) === canonical(brief.learningObjectives) && canonical(lessonPrior.definitions) === canonical(brief.definitions)) return lessonPrior;
    throw new TypeError("course lesson already has a different immutable product; form a successor product or course revision");
  }
  const admittedAt = options.at ?? new Date().toISOString();
  const body = {
    type: "MathematicsLessonBriefAdmission", provider: ACTOR, courseId: course.courseId, courseRevision: course.revision,
    courseDigest, lessonId: lesson.id, sequence: lesson.sequence, title: lesson.title, promise: lesson.promise,
    prerequisites: [...lesson.prerequisites], competencies: [...lesson.competencies], sourcePacket: sourcePacket.id,
    sourceCorpusDigest: sourcePacket.corpusDigest, reuseGrant: [...REQUIRED_RIGHTS], learningObjectives: [...brief.learningObjectives],
    definitions: [...brief.definitions], notebookPrompt: brief.notebookPrompt, notebookPromptDigest,
    humanFrame: brief.humanFrame, assessment: brief.assessment, authorityWithheld: [...WITHHELD], admittedAt,
  };
  const admission = { id: contentId("mathematics-curriculum.lesson-brief-admission", body), ...body };
  record("mathematics-curriculum.lesson-brief-admission", admission, options);
  return admission;
}

export function deliverLessonBrief(admission, target = "urn:ame:mathematics-youtube-channel-enterprise") {
  if (!exactId(admission, "mathematics-curriculum.lesson-brief-admission") || admission.type !== "MathematicsLessonBriefAdmission" || admission.provider !== ACTOR) throw new TypeError("curriculum delivery requires one exact admitted lesson brief");
  const body = { type: "Accept", actor: ACTOR, target, object: admission };
  return { id: contentId("mathematics-curriculum.lesson-brief-delivery", body), ...body };
}
