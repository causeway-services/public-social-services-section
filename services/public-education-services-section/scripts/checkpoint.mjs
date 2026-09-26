#!/usr/bin/env node
// Retain the education tree's production state (episode states, records,
// transcripts, metadata, thumbnails, reports) in git: commit only the files the
// producer writes (channel production directories and lesson reports), then push.
// The worktree may be shared with other work, so nothing else is staged, and a rejected push waits for the next run rather
// than rebasing someone else's checkout.
import { execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { EDUCATION_ROOT } from "../src/channel.mjs";

/** The paths the producer writes, relative to the education tree. */
export const PRODUCTION_PATHS = Object.freeze([":(glob)**/channels/*/production/**", ":(glob)**/lessons/*/report*", ":(glob)**/content/curricula/*/curriculum.json", ":(glob)**/content/curricula/*/reports/*.md", ":(glob)**/content/curricula/*/reports/*.sources.json"]);

const lockBusy = (error) => /Unable to create '[^'\n]+\.lock': File exists/u.test(String(error.stderr ?? ""));

export async function persistCheckpoint({ educationRoot = EDUCATION_ROOT, message = "Retain channel production state" } = {}) {
  const git = async (args) => {
    for (let attempt = 0; ; attempt += 1) {
      try { return execFileSync("git", args, { cwd: educationRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
      catch (error) {
        if (!lockBusy(error) || attempt >= 10) throw error;
        await delay(1000);
      }
    }
  };
  try {
    await git(["add", "--all", "--", ...PRODUCTION_PATHS]);
    if (!(await git(["diff", "--cached", "--name-only", "--", ...PRODUCTION_PATHS])).trim()) return { committed: false };
    await git(["commit", "--quiet", "-m", message, "--", ...PRODUCTION_PATHS]);
  } catch (error) {
    // Another worker owns the repository lock. Retained files remain available
    // for the next production cycle; never remove that worker's lock.
    if (lockBusy(error)) return { committed: false, deferred: "git-lock-busy" };
    throw error;
  }
  const commit = (await git(["rev-parse", "--short", "HEAD"])).trim();
  try { await git(["push", "--quiet", "origin", "HEAD:main"]); return { committed: commit, pushed: true }; }
  catch (error) { return { committed: commit, pushed: false, reason: String(error.stderr || error.message).trim().split("\n").at(-1) }; }
}

if (process.argv[1] === new URL(import.meta.url).pathname) process.stdout.write(`${JSON.stringify(await persistCheckpoint())}\n`);
