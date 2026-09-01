import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dependency = path.resolve(app, "../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-platform-services-section/services/web2-platform-services-section/services/discord-services-section/services/discord-engineering-services-section/services/discord-community-moderation-planning-service");
const ttiRoot = path.resolve(app, "../../../..");
const temp = await mkdtemp(path.join(os.tmpdir(), "tti-moderation-clean-"));
const clean = { recursive: true, filter: (source) => !["node_modules", "dist"].includes(path.basename(source)) };
const run = (cwd, ...args) => { const result = spawnSync("npm", args, { cwd, encoding: "utf8" }); if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`); };
try { const copied = path.join(temp, ...Array(13).fill("clean"), "adapter"); await cp(app, copied, clean); const cleanTtiRoot = path.resolve(copied, "../../../.."); const configuration = "content/configurations/zelo-moderation-reporting.json", policy = JSON.parse(await readFile(path.join(ttiRoot, configuration), "utf8")); await cp(path.join(ttiRoot, configuration), path.join(cleanTtiRoot, configuration), clean); for (const source of policy.sources) await cp(path.join(ttiRoot, source), path.join(cleanTtiRoot, source), clean); const target = path.resolve(copied, "../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-platform-services-section/services/web2-platform-services-section/services/discord-services-section/services/discord-engineering-services-section/services/discord-community-moderation-planning-service"); await cp(dependency, target, clean); run(target, "install", "--ignore-scripts"); run(copied, "install", "--ignore-scripts"); run(copied, "test"); process.stdout.write("clean moderation adapter proof passed\n"); } finally { await rm(temp, { recursive: true, force: true }); }
