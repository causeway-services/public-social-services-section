import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { koiosItem, loadPosts } from "../dist/index.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Koios content model", () => {
  it("loads a real post and projects its public wire item", async () => {
    const posts = await loadPosts(resolve(root, "content/posts"));
    const post = posts.find((candidate) => candidate.slug === "acurite-delays-app-migration-due-to-user-concerns-over");
    assert.ok(post);

    const item = koiosItem(post);
    assert.equal(item.headline, "AcuRite Delays App Migration Due to User Concerns Over New App's Shortfalls, Including Data Center Water Use");
    assert.match(item.summary, /AcuRite delays its app migration/u);
    assert.equal(item.url, "https://koios.news/posts/acurite-delays-app-migration-due-to-user-concerns-over");
    assert.equal(item.isPublic, true);
  });
});
