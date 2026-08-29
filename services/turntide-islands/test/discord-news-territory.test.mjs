import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
test("TTI contracts for two hourly editions while retaining plate authority", async () => {
  const specification = JSON.parse(await readFile(join(root, "content/configurations/discord-news-territory.json"), "utf8"));
  const contracts = await Promise.all(["union-hourly-news-service.json", "colonial-hourly-news-service.json", "discord-news-territory-planning.json"].map(async (name) => JSON.parse(await readFile(join(root, "content/contracts", name), "utf8"))));
  assert.deepEqual(specification.lanes.map((lane) => lane.category), ["UHC Embassy", "TTI Governance"]);
  assert.equal(specification.lanes[0].audience.members.length, 1); assert.equal(specification.lanes[1].audience.kind, "everyone");
  assert.ok(contracts.every((contract) => /Turntide Islands local Discord boundary executor only|none; the provider never calls Discord/u.test(contract.publicationAuthority ?? contract.effectAuthority)));
});
