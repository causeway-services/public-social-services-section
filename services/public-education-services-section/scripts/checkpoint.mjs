#!/usr/bin/env node
// Production files use the house's exact-path publisher. Retained data and
// incoming source are reconciled together without taking another writer's index.
// A channel that is its own repository retains its production there; public
// education retains curricula, lesson reports and any channel still inside it.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { commitGitPaths } from "@red-cup-engineering/computer-code-development-engine/git/operations";
import { EDUCATION_ROOT, channelDirectories } from "../src/channel.mjs";

export const PRODUCTION_PATHS = Object.freeze([":(glob)**/channels/*/production/**", ":(glob)**/lessons/*/report*", ":(glob)**/content/curricula/*/curriculum.json", ":(glob)**/content/curricula/*/reports/*.md", ":(glob)**/content/curricula/*/reports/*.sources.json"]);
export const CHANNEL_PRODUCTION_PATHS = Object.freeze([":(glob)production/**"]);

const git = (cwd, args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const toplevel = (directory) => path.resolve(git(directory, ["rev-parse", "--show-toplevel"]).trim());

/** Commit and push the retained paths under `directory` to the repository that holds it. */
function retain(directory, pathspecs, message) {
  const repository = toplevel(directory);
  const prefix = path.relative(repository, directory).split(path.sep).join("/");
  const paths = [...new Set(git(directory, ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", ...pathspecs])
    .split("\0").filter(Boolean).map((file) => path.posix.join(prefix, file)))];
  if (paths.length === 0) return { repository, committed: false };
  const result = commitGitPaths({ packageRoot: repository }, { paths, message, push: true });
  // A refused join leaves the producer's files and commit intact for the next run.
  // Do not stage unrelated source, rebase shared main, or discard another index.
  return { ...result, repository, committed: result.head ?? false, pushed: result.ok };
}

export async function persistCheckpoint({ educationRoot = EDUCATION_ROOT, message = "Retain channel production state" } = {}) {
  const channels = channelDirectories(educationRoot).filter((directory) => toplevel(directory) === path.resolve(directory));
  return { repositories: [...channels.map((directory) => retain(directory, CHANNEL_PRODUCTION_PATHS, message)), retain(educationRoot, PRODUCTION_PATHS, message)] };
}

if (process.argv[1] === new URL(import.meta.url).pathname) process.stdout.write(`${JSON.stringify(await persistCheckpoint())}\n`);
