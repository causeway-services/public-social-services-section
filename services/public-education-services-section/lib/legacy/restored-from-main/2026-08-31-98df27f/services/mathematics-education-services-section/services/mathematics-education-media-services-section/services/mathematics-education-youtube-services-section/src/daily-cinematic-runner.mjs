#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { querySettlementRecords } from "./journal-client.mjs";
import { ACTOR, CURRICULUM, admitCinematicInventory, channelIdentity, claimDailyRelease, contentId, formCinematicOrder, NODE_ROOT } from "./channel.mjs";
import { formPersistentNotebookCinematicOrder, persistentNotebookClient } from "./persistent-notebook-client.mjs";
import { createAuthorizedFetch, executePrivatePilot, loadChannelEnvironment, refreshAccessToken } from "./private-pilot.mjs";
import { schedulePublicRelease } from "./public-release.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { journalRecords as curriculumJournalRecords } from "@emsenn/mathematics-curriculum-enterprise/journal";
import { HISTORICAL_PUBLICATION_CATEGORY } from "./historical-publication-admission.mjs";
import { requireSettlementAccountId, settlementAccountIdFromEnvironment } from "./settlement-account.mjs";

const LESSON_CATEGORY = "mathematics-curriculum.lesson-brief-admission";
const INVENTORY_CATEGORY = "mathematics-youtube.cinematic-inventory-admission";
const CLAIM_CATEGORY = "mathematics-youtube.daily-release-claim";

function chicagoDay(instant) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(instant));
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function nextReleaseSlot(at, claims) {
  const instant = new Date(at); if (!Number.isFinite(instant.valueOf())) throw new TypeError("release planning requires an ISO instant");
  const claimed = new Set(claims.map((row) => row.civilDay));
  for (let offset = 0; offset < 370; offset += 1) {
    const candidate = new Date(instant); candidate.setUTCDate(candidate.getUTCDate() + offset); candidate.setUTCHours(15, 0, 0, 0);
    if (candidate <= instant) continue;
    const day = chicagoDay(candidate); if (!claimed.has(day)) return { civilDay: day, plannedPublishAt: candidate.toISOString() };
  }
  throw new TypeError("no mathematics release slot is available in the bounded horizon");
}

export async function witnessedLessons(curriculumRoot) {
  return curriculumJournalRecords(resolve(curriculumRoot), LESSON_CATEGORY).filter((row) => row.provider === CURRICULUM).sort((a, b) => a.courseId.localeCompare(b.courseId) || a.courseRevision - b.courseRevision || a.sequence - b.sequence || a.id.localeCompare(b.id));
}

export function selectNextLesson(lessons, inventoryRows) {
  if (!Array.isArray(lessons) || !Array.isArray(inventoryRows)) throw new TypeError("mathematics lesson selection requires witnessed lesson and inventory arrays");
  const booked = new Set(inventoryRows.map((row) => row.curriculumProduct));
  return lessons.find((row) => !booked.has(row.id) && row.prerequisites.every((id) => inventoryRows.some((inventory) => inventory.courseId === row.courseId && inventory.courseRevision === row.courseRevision && inventory.lessonId === id))) ?? null;
}

export function lessonMetadata(lesson) {
  return {
    title: `${lesson.title} | Mathematics in Relation`.slice(0, 100),
    description: [lesson.promise, "", `Course: ${lesson.courseId.replaceAll("-", " ")}`, `Lesson ${lesson.sequence}: ${lesson.title}`, "", "Learning objectives:", ...lesson.learningObjectives.map((value) => `• ${value}`), "", "Generated from an admitted research packet through the channel's persistent NotebookLM curriculum pipeline."].join("\n"),
  };
}

export async function runDailyCinematic(supplied = {}) {
  const settlementAccountId = requireSettlementAccountId(supplied.settlementAccountId);
  const configuredCurriculumRoot = supplied.curriculumRoot ?? process.env.MATHEMATICS_CURRICULUM_JOURNAL_ROOT;
  if (typeof configuredCurriculumRoot !== "string" || configuredCurriculumRoot.trim() === "") throw new TypeError("mathematics daily runner requires an explicitly mounted curriculum journal root");
  const at = supplied.at ?? new Date().toISOString(), dataRoot = resolve(supplied.dataRoot ?? join(NODE_ROOT, "data")), curriculumRoot = resolve(configuredCurriculumRoot), gate = supplied.activation ?? JSON.parse(readFileSync(join(NODE_ROOT, "content/config/activation.json"), "utf8"));
  if (gate.dailyCinematicProduction !== "granted" || gate.inventoryAdmission !== "granted") throw new TypeError("mathematics daily runner requires cinematic production and inventory grants");
  const inventoryRows = await querySettlementRecords(INVENTORY_CATEGORY, { dataRoot });
  const historicalRows = await querySettlementRecords(HISTORICAL_PUBLICATION_CATEGORY, { dataRoot });
  const lesson = selectNextLesson(await witnessedLessons(curriculumRoot), [...inventoryRows, ...historicalRows.map((row) => ({ ...row, curriculumProduct: `historical:${row.lessonId}` }))]);
  if (!lesson) throw new TypeError("mathematics daily runner has no prerequisite-eligible unbooked lesson product");
  const order = formCinematicOrder(lesson, at), providerOrder = (supplied.formProviderOrder ?? formPersistentNotebookCinematicOrder)(lesson), client = supplied.client ?? persistentNotebookClient(dataRoot);
  const delivery = await client.requestCinematic(providerOrder), artifact = await client.materializeArtifact(delivery), notebookDelivery = client.cinematicActivity(delivery);
  const curriculumBody = { type: "Accept", actor: CURRICULUM, target: ACTOR, object: lesson }, curriculumDelivery = { id: contentId(curriculumBody, "mathematics-curriculum.lesson-brief-delivery"), ...curriculumBody };
  const inventory = await (supplied.admitInventory ?? admitCinematicInventory)({ order, curriculumDelivery, notebookDelivery }, { at, dataRoot, runtimeRoot: join(dataRoot, "runtime/inventory-locks"), settlement: settlementAccountId, witnessJournalAgentUrl: supplied.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, verifyDelivery: async (kind, activity) => kind === "persistent-notebook" ? client.verifyActivity(activity, providerOrder) : kind === "curriculum" && activity.object.id === lesson.id && witnessedLessons(curriculumRoot).some((row) => row.id === lesson.id) });
  const slot = nextReleaseSlot(at, await querySettlementRecords(CLAIM_CATEGORY, { dataRoot }));
  const claim = await (supplied.claimRelease ?? claimDailyRelease)({ inventoryAdmission: inventory, ...slot }, { at, dataRoot, runtimeRoot: join(dataRoot, "runtime/release-locks"), settlement: settlementAccountId, witnessJournalAgentUrl: supplied.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT });
  let publication = null;
  if (["granted-private-only", "granted"].includes(gate.youtubeWrites)) {
    const environment = supplied.environment ?? loadChannelEnvironment(), credentials = { clientId: environment.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: environment.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: environment[REFRESH_TOKEN_ENV] }, input = { releaseClaim: claim, inventoryAdmission: inventory, videoBytes: artifact.bytes ?? readFileSync(artifact.path), metadata: lessonMetadata(lesson) };
    if (gate.youtubeWrites === "granted") { const token = await (supplied.refreshToken ?? refreshAccessToken)(credentials), authorizedFetch = supplied.authorizedFetch ?? createAuthorizedFetch(token.accessToken); publication = await (supplied.schedulePublic ?? schedulePublicRelease)(input, { activation: gate, expectedChannelId: channelIdentity().youtubeChannelId, authorizedFetch, dataRoot, runtimeRoot: join(dataRoot, "runtime/scheduled-publication-locks"), settlement: settlementAccountId, witnessJournalAgentUrl: supplied.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at }); }
    else { const publishPrivate = supplied.publishPrivate ?? executePrivatePilot; publication = await publishPrivate(input, { executePrivate: true, releaseClaimId: claim.id, activation: gate, credentials, dataRoot, runtimeRoot: join(dataRoot, "runtime/private-pilot-locks"), settlement: settlementAccountId, witnessJournalAgentUrl: supplied.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT, at }); }
  }
  return { type: "MathematicsDailyCinematicRun", lesson: lesson.id, providerOrder: providerOrder.id, artifact: { path: artifact.path, sha256: artifact.sha256, byteLength: artifact.byteLength }, inventory: inventory.id, releaseClaim: claim.id, releaseMode: gate.youtubeWrites === "granted" ? "scheduled-public-insert" : gate.youtubeWrites === "granted-private-only" ? "private-draft-pilot" : "withheld", scheduledPublicationReceipt: gate.youtubeWrites === "granted" ? publication?.id ?? null : null, privatePublicationReceipt: gate.youtubeWrites === "granted-private-only" ? publication?.id ?? null : null, youtubeVideoId: publication?.youtubeVideoId ?? null, civilDay: claim.civilDay, plannedPublishAt: claim.plannedPublishAt };
}

export async function main() { process.stdout.write(`${JSON.stringify(await runDailyCinematic({ settlementAccountId: settlementAccountIdFromEnvironment() }))}\n`); }
if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => { process.stderr.write(`refused: ${error.message}\n`); process.exitCode = 78; });
