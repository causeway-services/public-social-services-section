#!/usr/bin/env node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { admitSourcePacket, deliverSourcePacket, firstPacketDraft } from "@emsenn/mathematics-research-enterprise";
import { admitLessonBrief, deliverLessonBrief, formNextLessonOffer, loadLessonBriefDraft } from "@emsenn/mathematics-curriculum-enterprise";
import { formCinematicOrder } from "../src/channel.mjs";
import { observeExistingPublicVideo } from "../src/existing-receiver.mjs";

const at = "2026-08-03T12:00:00.000Z";
const root = mkdtempSync(join(tmpdir(), "mathematics-receiver-"));
try {
  const sourcePacket = await admitSourcePacket(firstPacketDraft(), { dataRoot: join(root, "research"), at });
  const sourceDelivery = deliverSourcePacket(sourcePacket);
  const offer = formNextLessonOffer({ offeredAt: at });
  const brief = loadLessonBriefDraft({ courseId: "causality-and-kinematic-space", lessonId: "order-before-distance" });
  const lessonAdmission = await admitLessonBrief({ offer, sourcePacket: sourceDelivery.object, brief }, {
    dataRoot: join(root, "curriculum"), at,
    verifySourcePacket: async (candidate) => candidate.id === sourceDelivery.object.id && sourceDelivery.target === "urn:ame:mathematics-curriculum-enterprise",
  });
  const curriculumDelivery = deliverLessonBrief(lessonAdmission);
  const cinematicOrder = formCinematicOrder(curriculumDelivery.object, at);
  const receiver = await observeExistingPublicVideo({ sourcePacket, lessonAdmission, cinematicOrder, observedAt: new Date().toISOString() });
  process.stdout.write(`${JSON.stringify({ disposition: "observed-existing-public-receiver", sourcePacket: sourcePacket.id, curriculumProduct: lessonAdmission.id, channelOrder: cinematicOrder.id, receiver }, null, 2)}\n`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
