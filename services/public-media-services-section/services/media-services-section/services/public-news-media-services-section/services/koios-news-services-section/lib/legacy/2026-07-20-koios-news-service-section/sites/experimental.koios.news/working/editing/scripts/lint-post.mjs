#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  lintDraft,
  loadPublicPosts,
  packageRoot,
  postMarkdown,
  readPost,
  slugify,
} from "../../lib/koios-workshop.mjs";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const release = args.includes("--release");
const pathArg = args.find((arg) => arg !== "--release");

if (pathArg === undefined || pathArg === "--help" || pathArg === "-h") {
  console.error("usage: pnpm run lint-post -- [--release] content/posts/<slug>.md");
  process.exit(pathArg === undefined ? 2 : 0);
}

const path = resolve(packageRoot, pathArg);
const { frontmatter, body } = readPost(path);
const { failures, warnings } = lintDraft(frontmatter, body);

for (const warning of warnings) console.log(`warning: ${warning}`);
for (const failure of failures) console.log(`failure: ${failure}`);

if (failures.length > 0) process.exit(1);

const koios = frontmatter.koios !== null && typeof frontmatter.koios === "object" && !Array.isArray(frontmatter.koios) ? frontmatter.koios : {};
frontmatter.koios = {
  ...koios,
  gates_clear: true,
  standards_reviewed_at: new Date().toISOString(),
};
if (release) frontmatter.draft = false;

writeFileSync(path, postMarkdown(frontmatter, body));

const slug = typeof frontmatter.slug === "string" && frontmatter.slug.trim() !== "" ? frontmatter.slug.trim() : slugify(String(frontmatter.title));
const posts = await loadPublicPosts();
const loaded = posts.find((post) => post.slug === slug);
if (release && loaded === undefined) {
  console.log(`failure: released post ${slug} was not returned by loadPosts()`);
  process.exit(1);
}

console.log(`pass: ${path}`);
console.log(`gates_clear=true release=${release ? "true" : "false"} loadPosts=${loaded === undefined ? "withheld" : "accepted"}`);
