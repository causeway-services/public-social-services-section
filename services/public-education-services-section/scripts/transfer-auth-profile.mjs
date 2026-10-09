#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transferAuthProfile } from "@red-cup-engineering/computer-inference-engine/authentication/profile-transfer";
import { loadEnvironment } from "../src/channel.mjs";

loadEnvironment();

const [mode, kind, profilePathArg, sealedPathArg, ...extra] = process.argv.slice(2);
if (extra.length || !["restore", "save"].includes(mode) || !["notebook", "codex"].includes(kind)) {
  throw new Error("Usage: transfer-auth-profile.mjs restore|save notebook|codex [profile-path sealed-path]");
}
if (Boolean(profilePathArg) !== Boolean(sealedPathArg)) throw new Error("Supply both explicit paths or neither");
const profileHome = kind === "notebook" ? process.env.NOTEBOOKLM_HOME : process.env.CODEX_HOME;
const defaultProfile = kind === "notebook"
  ? profileHome && join(profileHome, "profiles/default/storage_state.json")
  : profileHome && join(profileHome, "auth.json");
const profilePath = profilePathArg ?? defaultProfile;
const sealedPath = sealedPathArg ?? join(dirname(dirname(fileURLToPath(import.meta.url))), "state", `${kind}-auth.enc.json`);
if (!profilePath) throw new Error(`${kind === "notebook" ? "NOTEBOOKLM_HOME" : "CODEX_HOME"} is required unless a profile path is supplied`);

const validate = kind === "notebook"
  ? (value) => Array.isArray(value.cookies) && value.cookies.length > 0
  : (value) => typeof value.tokens?.access_token === "string" && value.tokens.access_token.length > 0;
transferAuthProfile({ mode, seed: process.env[kind === "notebook" ? "NOTEBOOKLM_AUTH_JSON" : "CODEX_AUTH_JSON"], profilePath, sealedPath, namespace: `youtube-${kind}`, validate });
