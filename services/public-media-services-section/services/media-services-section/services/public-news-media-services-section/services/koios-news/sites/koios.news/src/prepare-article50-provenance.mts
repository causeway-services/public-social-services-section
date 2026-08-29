#!/usr/bin/env node

import { loadPosts } from "./content.mts";
import { DEFAULT_CONTENT_DIR } from "./config.mts";
import { koiosMasthead, koiosWireItems } from "./index.mts";
import { prepareArticle50Fingerprint } from "./administrating/deploying/article50-provenance.mts";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const slug = argument("--slug");
if (slug === undefined || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) {
  throw new Error("Article 50 provenance preparation requires one explicit --slug; publication preparation does not rescan every prior article");
}
const posts = loadPosts(DEFAULT_CONTENT_DIR), items = koiosWireItems(), masthead = koiosMasthead();
const bySlug = new Map(posts.map((post) => [post.slug, post]));
const publicItems = items.filter((item) => item.isPublic && item.slug === slug);
if (publicItems.length !== 1) throw new Error(`no single public item is admitted for Article 50 preparation at ${slug}`);
const results = [];
for (const item of publicItems) {
  const post = bySlug.get(item.slug);
  if (!post) throw new Error(`public item has no sovereign source post: ${item.slug}`);
  results.push(await prepareArticle50Fingerprint({ post, item, masthead }));
}
process.stdout.write(`${JSON.stringify({ type: "Article50ProvenancePreparation", articles: results.length, created: results.filter((result) => !result.reused).length, reused: results.filter((result) => result.reused).length })}\n`);
