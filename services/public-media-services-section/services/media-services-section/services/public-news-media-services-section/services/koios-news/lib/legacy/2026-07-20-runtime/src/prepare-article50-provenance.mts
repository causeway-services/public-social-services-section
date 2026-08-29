#!/usr/bin/env node

import { loadPosts } from "./content.mjs";
import { DEFAULT_CONTENT_DIR } from "./config.mjs";
import { koiosMasthead, koiosWireItems } from "./index.mjs";
import { prepareArticle50Fingerprint } from "./administrating/deploying/article50-provenance.mjs";

const posts = loadPosts(DEFAULT_CONTENT_DIR), items = koiosWireItems(), masthead = koiosMasthead();
const bySlug = new Map(posts.map((post) => [post.slug, post]));
const publicItems = items.filter((item) => item.isPublic);
const results = [];
for (const item of publicItems) {
  const post = bySlug.get(item.slug);
  if (!post) throw new Error(`public item has no sovereign source post: ${item.slug}`);
  results.push(await prepareArticle50Fingerprint({ post, item, masthead }));
}
process.stdout.write(`${JSON.stringify({ type: "Article50ProvenancePreparation", articles: results.length, created: results.filter((result) => !result.reused).length, reused: results.filter((result) => result.reused).length })}\n`);
