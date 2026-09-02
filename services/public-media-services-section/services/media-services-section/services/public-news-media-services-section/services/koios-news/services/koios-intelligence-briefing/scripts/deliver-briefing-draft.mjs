#!/usr/bin/env node
/**
 * @module deliver-briefing-draft
 * The effect: hand a composed briefing issue's rendered Markdown to
 * `@red-cup-engineering/buttondown-services-section`'s create-draft flow.
 * Draft only — never sends, per the product's founder fence (README).
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createDraftEmail } from "@red-cup-engineering/buttondown-services-section";

/**
 * Creates a Buttondown draft email from one rendered issue Markdown file.
 * Reads the API key from the `BUTTONDOWN_API_KEY` environment variable
 * name only — never stores, hardcodes, or accepts one as an argument — and
 * refuses cleanly, before touching the filesystem or network, when it is
 * unset (no key exists yet; provisioning one is founder hands).
 *
 * @param {{issuePath: string, subject: string, status?: "draft"|"scheduled", publishDate?: string}} input
 * @param {Record<string, string|undefined>} [env] Injected environment, defaults to `process.env`.
 * @param {typeof fetch} [fetchImpl] Injected fetch capability, defaults to the global `fetch`.
 * @returns {Promise<{id: string, subject: string, status: string, publishDate: string|null, response: unknown}>}
 * @throws {Error} When `issuePath`/`subject` are missing, or `BUTTONDOWN_API_KEY` is unset.
 */
export async function deliverBriefingDraft({ issuePath, subject, status, publishDate } = {}, env = process.env, fetchImpl = fetch) {
  if (!issuePath || !subject) {
    throw new Error("usage: deliver-briefing-draft.mjs <issue.md> <subject> [status] [publishDate]");
  }
  const token = env.BUTTONDOWN_API_KEY;
  if (!token) {
    throw new Error(
      "BUTTONDOWN_API_KEY is not set — no Buttondown API key exists yet (provisioning one is founder hands); refusing to attempt delivery.",
    );
  }
  const body = await readFile(issuePath, "utf8");
  return createDraftEmail({ token, fetch: fetchImpl, subject, body, status, publishDate });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [issuePath, subject, status, publishDate] = process.argv.slice(2);
  try {
    const result = await deliverBriefingDraft({ issuePath, subject, status, publishDate });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`deliver-briefing-draft: ${error.message}\n`);
    process.exitCode = 2;
  }
}
