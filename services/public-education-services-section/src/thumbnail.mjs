// A YouTube thumbnail: an engine-generated illustration fitted to YouTube's
// carrier, a 1280x720 JPEG of at most 2 MiB.
import { generateImage } from "@red-cup-engineering/computer-inference-engine/image/image-generation";
import { fitJpeg } from "@red-cup-engineering/computer-media-content-services-section/raster";

/** Framing added to every thumbnail prompt: text-free, centred, legible when small. */
export const THUMBNAIL_COMPOSITION = "Create an original editorial illustration for a YouTube thumbnail. Panoramic 16:9 composition, all essential subjects within the middle horizontal 16:9 band, clear focal point and readable forms at small sizes. No text, letters, numbers, labels, logos, signatures, or watermarks.";

/** Generate and fit one thumbnail for `prompt`. */
export async function produceThumbnail(prompt, outputPath) {
  const completePrompt = `${THUMBNAIL_COMPOSITION}\n\n${prompt}`;
  if (completePrompt.length > 2048) throw new Error("Thumbnail prompt exceeds the image model's 2048 characters");
  const image = await generateImage(completePrompt);
  return { ...(await fitJpeg(image.bytes, outputPath, { width: 1280, height: 720, maxBytes: 2 * 1024 * 1024 })), provider: image.provider, model: image.model };
}
