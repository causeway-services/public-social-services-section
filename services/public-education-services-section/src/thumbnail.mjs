// A YouTube thumbnail: an engine-generated illustration fitted to YouTube's
// carrier, a 1280x720 JPEG of at most 2 MiB.
import { generateImage } from "@red-cup-engineering/computer-inference-engine/image/image-generation";
import { completeAccountArtifactWork, loadAccountArtifactObservations, requestAccountArtifactWork } from "@red-cup-engineering/computer-inference-engine/media/account-artifact-work";
import { accountArtifactCapacityStorePath, transitionAccountArtifactCapacity } from "@red-cup-engineering/computer-inference-engine/media/account-artifact-capacity";
import { fitJpeg } from "@red-cup-engineering/computer-media-content-services-section/raster";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/** Framing added to every thumbnail prompt: text-free, centred, legible when small. */
export const THUMBNAIL_COMPOSITION = "Create an original editorial illustration for a YouTube thumbnail. Panoramic 16:9 composition, all essential subjects within the middle horizontal 16:9 band, clear focal point and readable forms at small sizes. No text, letters, numbers, labels, logos, signatures, or watermarks.";
const ni = (bytes) => `ni:///sha-256;${createHash("sha256").update(bytes).digest("base64url")}`;

/** Request an observed expiring account resource by image capability. */
export async function prepareThumbnailWork(prompt, { workLot, reportPath, transcriptPath, env = process.env, evaluatedAt } = {}) {
  const observations = loadAccountArtifactObservations(env);
  if (!observations.length) return null;
  const completePrompt = `${THUMBNAIL_COMPOSITION}\n\n${prompt}`;
  const sources = [reportPath, transcriptPath].map((path) => ({ path, identity: ni(readFileSync(path)) }));
  let available = observations;
  while (available.length) {
    const result = requestAccountArtifactWork({ workLot, principal: "urn:ame:public-education-services-section", capability: "image-generation", prompt: completePrompt, sources, outputMimeType: "image/*" }, available, evaluatedAt ? { evaluatedAt } : {});
    if (!result.packet) return null;
    const reservation = await transitionAccountArtifactCapacity(result.packet, observations, { storePath: accountArtifactCapacityStorePath(env), action: "reserve", ...(evaluatedAt ? { evaluatedAt } : {}) });
    if (reservation.disposition === "held") return result.packet;
    if (reservation.reason !== "resource-quota-exhausted") throw new Error(`Account artifact capacity was not held: ${reservation.reason ?? reservation.disposition}`);
    available = available.filter((observation) => observation.providerIdentity !== result.packet.providerIdentity || observation.accountIdentity !== result.packet.accountIdentity || observation.windowIdentity !== result.packet.windowIdentity || observation.product !== result.packet.product);
  }
  return null;
}

/** Adopt an operator-returned image after recording its bytes and reported spend. */
export async function adoptThumbnailWork(packet, sourcePath, outputPath, unitsSpent) {
  const bytes = readFileSync(sourcePath);
  const mimeType = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png"
    : bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? "image/jpeg" : null;
  if (!mimeType) throw new TypeError("operator artifact must be PNG or JPEG");
  const receipt = completeAccountArtifactWork(packet, { bytes, mimeType, unitsSpent });
  const fitted = await fitJpeg(bytes, outputPath, { width: 1280, height: 720, maxBytes: 2 * 1024 * 1024 });
  return { receipt, fitted, publishedImage: ni(readFileSync(outputPath)) };
}

/** Generate and fit one thumbnail for `prompt`. */
export async function produceThumbnail(prompt, outputPath) {
  const completePrompt = `${THUMBNAIL_COMPOSITION}\n\n${prompt}`;
  if (completePrompt.length > 2048) throw new Error("Thumbnail prompt exceeds the image model's 2048 characters");
  const image = await generateImage(completePrompt);
  return { ...(await fitJpeg(image.bytes, outputPath, { width: 1280, height: 720, maxBytes: 2 * 1024 * 1024 })), provider: image.provider, model: image.model };
}
