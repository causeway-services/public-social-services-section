import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { produceEbook } from "@red-cup-engineering/ebook-production-services-section/scripts/produce-ebook.mjs";

const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Build the-agent-operators-handbook's EPUB and PDF by delegating to
 * @red-cup-engineering/ebook-production-services-section, which owns the
 * pandoc invocation, template, and build-record assembly.
 * @param {{
 *   slug?: string, title?: string, subtitle?: string, author?: string,
 *   bookDir?: string, distDir?: string, pandocBin?: string,
 * }} [options]
 * @returns {Promise<object>} the build record from produceEbook()
 */
export async function buildEbook(options = {}) {
  const {
    slug = "the-agent-operators-handbook",
    title = "The Agent Operator's Handbook",
    subtitle = "A Field Guide to Dispatching, Steering, and Recovering Multiple AI Coding Agents at Once",
    author = "561 Group",
    bookDir = join(NODE_ROOT, "content/books", slug),
    distDir = join(NODE_ROOT, "dist", slug),
    pandocBin,
  } = options;

  return produceEbook({ slug, title, subtitle, author, bookDir, distDir, pandocBin });
}

async function main() {
  const result = await buildEbook();
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
