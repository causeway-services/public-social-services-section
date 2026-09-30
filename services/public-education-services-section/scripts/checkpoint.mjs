#!/usr/bin/env node
// Production files use the house's exact-path publisher. Retained data and
// incoming source are reconciled together without taking another writer's index.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { commitGitPaths } from "@red-cup-engineering/computer-code-development-engine/git/operations";
import { EDUCATION_ROOT } from "../src/channel.mjs";

export const PRODUCTION_PATHS = Object.freeze([":(glob)**/channels/*/production/**", ":(glob)**/lessons/*/report*", ":(glob)**/content/curricula/*/curriculum.json", ":(glob)**/content/curricula/*/reports/*.md", ":(glob)**/content/curricula/*/reports/*.sources.json"]);

export async function persistCheckpoint({ educationRoot = EDUCATION_ROOT, message = "Retain channel production state" } = {}) {
  const git = (args) => execFileSync("git", args, { cwd: educationRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const repository = git(["rev-parse", "--show-toplevel"]).trim();
  const prefix = path.relative(repository, educationRoot).split(path.sep).join("/");
  const paths = [...new Set(git(["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...PRODUCTION_PATHS])
    .split("\0").filter(Boolean).map((file) => path.posix.join(prefix, file)))];
  if (paths.length === 0) return { committed: false };
  const result = commitGitPaths({ packageRoot: repository }, { paths, message, push: true });
  // A refused join leaves the producer's files and commit intact for the next run.
  // Do not stage unrelated source, rebase shared main, or discard another index.
  return { ...result, committed: result.head ?? false, pushed: result.ok };
}

if (process.argv[1] === new URL(import.meta.url).pathname) process.stdout.write(`${JSON.stringify(await persistCheckpoint())}\n`);
