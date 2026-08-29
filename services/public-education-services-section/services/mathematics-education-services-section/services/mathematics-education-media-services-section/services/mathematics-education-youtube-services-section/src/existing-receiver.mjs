import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ACTOR, NODE_ROOT, channelIdentity } from "./channel.mjs";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const address = (value, objectKind) => ({ id: identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).token, ...value });

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/u;

export function historicalReceiverEvidence() {
  const activation = JSON.parse(readFileSync(join(NODE_ROOT, "content/config/activation.json"), "utf8"));
  const channel = channelIdentity();
  const videoId = activation?.scheduledPublication?.youtubeVideoId;
  if (channel.actor !== ACTOR || channel.youtubeHandle !== "@MathematicsInRelation" || !VIDEO_ID.test(videoId ?? "")) throw new TypeError("mathematics receiver configuration lacks the named existing channel and public video");
  if (activation.scheduledPublication.status !== "first-schedule-public-and-processed-observed" || activation.publicationObservationRoutine?.status !== "enabled-active-first-public-release-observed") throw new TypeError("mathematics receiver carrier does not claim an observed public publication");
  return Object.freeze({ channel, activation, videoId, publicUrl: `https://www.youtube.com/watch?v=${videoId}` });
}

export async function observeExistingPublicVideo({ sourcePacket, lessonAdmission, cinematicOrder, fetchImpl = fetch, observedAt = new Date().toISOString() } = {}) {
  if (sourcePacket?.id !== lessonAdmission?.sourcePacket || lessonAdmission?.id !== cinematicOrder?.object?.curriculumProduct || lessonAdmission.courseId !== "causality-and-kinematic-space" || lessonAdmission.lessonId !== "order-before-distance") throw new TypeError("receiver observation requires the exact source-to-curriculum-to-channel order path");
  const { channel, activation, videoId, publicUrl } = historicalReceiverEvidence();
  const response = await fetchImpl(`https://www.youtube.com/oembed?url=${encodeURIComponent(publicUrl)}&format=json`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new TypeError(`YouTube receiver observation failed with HTTP ${response.status}`);
  const venue = await response.json();
  if (venue.provider_name !== "YouTube" || venue.author_name !== "MathematicsInRelation" || venue.author_url !== "https://www.youtube.com/@MathematicsInRelation" || !venue.title?.toLowerCase().includes("order before distance")) throw new TypeError("public video is not the configured MathematicsInRelation lesson receiver");
  const body = {
    type: "MathematicsPublicVideoReceiverObservation",
    observer: ACTOR,
    sourcePacket: sourcePacket.id,
    curriculumProduct: lessonAdmission.id,
    channelOrder: cinematicOrder.id,
    courseId: lessonAdmission.courseId,
    lessonId: lessonAdmission.lessonId,
    youtubeChannelId: channel.youtubeChannelId,
    youtubeHandle: channel.youtubeHandle,
    youtubeVideoId: videoId,
    publicUrl,
    venue: { providerName: venue.provider_name, authorName: venue.author_name, authorUrl: venue.author_url, title: venue.title },
    historicalCarrierEvidence: {
      scheduledPublicationReceipt: activation.scheduledPublication.receipt,
      publicPublicationReceipt: activation.scheduledPublication.publicPublicationReceipt,
      identityLaw: "predecessor-urn-sha256-retained-as-historical-custody-only",
    },
    authorityWithheld: ["youtube-write", "publication", "receipt-readdressing", "view-or-revenue-claim"],
    observedAt,
  };
  return address(body, "mathematics-youtube.public-video-receiver-observation");
}
