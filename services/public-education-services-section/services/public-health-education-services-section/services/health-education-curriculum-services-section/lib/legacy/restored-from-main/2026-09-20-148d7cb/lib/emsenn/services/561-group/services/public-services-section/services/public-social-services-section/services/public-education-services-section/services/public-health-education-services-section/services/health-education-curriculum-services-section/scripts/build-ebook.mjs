import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { produceEbook } from "@red-cup-engineering/ebook-production-services-section/scripts/produce-ebook.mjs";
import { runJavascriptNodeOperation } from "@red-cup-engineering/javascript-node-services-section/operation";

const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Build understanding-infection-associated-chronic-illness's EPUB and PDF by
 * delegating to @red-cup-engineering/ebook-production-services-section,
 * which owns the pandoc invocation, template, and build-record assembly.
 *
 * Chapter order is filename-sort order (listChapters() in
 * ebook-production-services-section has no other ordering input), so
 * bookDir's *.md files must carry the numeric prefixes below -- the same
 * convention the-agent-operators-handbook uses. The chapters arrive from
 * parallel writers under their bare topic names (what-is-iaci.md,
 * long-covid.md, mechanisms.md, pem-pacing.md, reading-research.md); the
 * landing step that copies them into bookDir is what applies these
 * prefixes, in this order:
 *   00-front-matter.md      (this section's own, not a parallel-writer chapter)
 *   01-what-is-iaci.md
 *   02-long-covid.md
 *   03-mechanisms.md
 *   04-pem-pacing.md
 *   05-reading-research.md
 * @param {{
 *   slug?: string, title?: string, subtitle?: string, author?: string,
 *   bookDir?: string, distDir?: string, pandocBin?: string,
 * }} [options]
 * @returns {Promise<object>} the build record from produceEbook()
 */
export async function buildEbook(options = {}) {
  const {
    slug = "understanding-infection-associated-chronic-illness",
    title = "Understanding Infection-Associated Chronic Illness",
    subtitle = "A Public Guide to Long COVID, Post-Exertional Malaise, and the Science Behind the Diagnosis",
    author = "561 Group",
    bookDir = join(NODE_ROOT, "content/books", slug),
    distDir = join(NODE_ROOT, "dist", slug),
    pandocBin,
  } = options;

  return produceEbook({ slug, title, subtitle, author, bookDir, distDir, pandocBin });
}

if (import.meta.main) {
  const result = await runJavascriptNodeOperation({ name: "build-ebook", description: "Build understanding-infection-associated-chronic-illness's EPUB and PDF by delegating to", operation: buildEbook }, { arguments: process.argv.slice(2), standardInput: process.stdin, standardOutput: process.stdout });
  process.exitCode = result.exitCode;
}
