import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../src/index.mjs";

const assets = {
  fetch(request) {
    return new Response(`asset:${new URL(request.url).pathname}`, { status: 200 });
  },
};

test("health names the iYappy service", async () => {
  const response = await worker.fetch(new Request("https://iyappy.561.group/health"), { ASSETS: assets });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { service: "iyappy", status: "ok" });
});

test("site build projects the iYappy course through VICTOR", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const world = JSON.parse(await readFile(new URL("../public/data/iyappy-world.json", import.meta.url), "utf8"));
  assert.match(html, /iYappy/);
  assert.match(html, /Lakȟótiyapi/);
  assert.match(html, /data-tufte-theme="early-mac"/);
  assert.match(html, /id="load-status"/);
  assert.match(html, /id="room-list"/);
  assert.match(html, /id="content-panel"/);
  assert.match(html, /LDL 121: Intensive Lakota\/Dakota for Beginners/);
  assert.equal(world.exercises.length, 12);
});
