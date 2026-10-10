// Leader-run, channel-local OAuth admission. Credential exchange and storage
// remain inside the mathematics channel membrane; the hired YouTube protocol
// provider receives only an attenuated authorizedFetch capability.
import { createHash, randomBytes } from "node:crypto";
import { chmodSync, existsSync, lstatSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { observeAuthorizedChannel } from "@red-cup-engineering/youtube-services-section";
import { NODE_ROOT, channelIdentity } from "./channel.mjs";

export const REFRESH_TOKEN_ENV = "MATHEMATICS_YOUTUBE_OAUTH_REFRESH_TOKEN";
export const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/yt-analytics.readonly"];
export const COURSE_PLAYLIST_SCOPE = "https://www.googleapis.com/auth/youtube.force-ssl";
export const COURSE_PLAYLIST_SCOPES = [...SCOPES, COURSE_PLAYLIST_SCOPE];

function loadEnv() { let cursor = NODE_ROOT; for (let depth = 0; depth < 12; depth += 1) { const path = join(cursor, ".env"); if (existsSync(path)) for (const line of readFileSync(path, "utf8").split("\n")) { const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/u); if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/u, "$2"); } const parent = dirname(cursor); if (parent === cursor) break; cursor = parent; } }
function required(name) { const value = process.env[name]; if (!value) throw new Error(`required environment ${name} is absent`); return value; }
function envPath() { let cursor = NODE_ROOT; for (let depth = 0; depth < 12; depth += 1) { const path = join(cursor, ".env"); if (existsSync(path)) return path; const parent = dirname(cursor); if (parent === cursor) break; cursor = parent; } throw new Error("no existing ignored .env was found"); }
function store(path, name, value) { if (lstatSync(path).isSymbolicLink()) throw new Error("credential custody refuses a symlinked .env"); const current = readFileSync(path, "utf8"), line = `${name}=${value}`, pattern = new RegExp(`^${name}=.*$`, "mu"), next = pattern.test(current) ? current.replace(pattern, line) : `${current.replace(/\n?$/u, "\n")}${line}\n`, temporary = `${path}.oauth-${process.pid}-${randomBytes(8).toString("hex")}`; writeFileSync(temporary, next, { flag: "wx", mode: 0o600 }); chmodSync(temporary, 0o600); renameSync(temporary, path); chmodSync(path, 0o600); }
function authorizedFetch(token) { return (url, init = {}) => { const headers = new Headers(init.headers); headers.set("authorization", `Bearer ${token}`); return fetch(url, { ...init, headers }); }; }

async function receiveCode({ clientId, verifier, challenge, state, scopes }) {
  return new Promise((resolvePromise, rejectPromise) => {
    let settled = false, listeningRedirectUri; const finish = (fn, value) => { if (settled) return; settled = true; clearTimeout(timer); if (server.listening) { server.close(); server.closeAllConnections?.(); } fn(value); };
    const server = createServer((req, res) => { if(settled||!listeningRedirectUri){res.writeHead(410);res.end("Expired OAuth listener.");return;}const redirectUri=listeningRedirectUri,url = new URL(req.url, redirectUri), code = url.searchParams.get("code"), error = url.searchParams.get("error"); if (url.searchParams.get("state") !== state) { res.writeHead(400); res.end("Invalid state."); finish(rejectPromise, new Error("OAuth state mismatch")); } else if (error) { res.writeHead(400); res.end("Authorization refused."); finish(rejectPromise, new Error(`OAuth refused: ${error}`)); } else if (code) { res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" }); res.end("Authorized. Return to Codex."); finish(resolvePromise, { code, redirectUri, verifier }); } });
    const timer = setTimeout(() => finish(rejectPromise, new Error("OAuth loopback timed out")), 600_000); server.once("error", (error) => finish(rejectPromise, error));
    server.listen(0, "127.0.0.1", () => { const redirectUri = `http://127.0.0.1:${server.address().port}`;listeningRedirectUri=redirectUri;const url = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: scopes.join(" "), access_type: "offline", include_granted_scopes: "true", prompt: "select_account consent", state, code_challenge: challenge, code_challenge_method: "S256" })}`; console.error(`Authorize @MathematicsInRelation:\n\n${url}\n\nWaiting on ${redirectUri}`); });
  });
}

export async function main() {
  loadEnv(); const clientId = required("YOUTUBE_OAUTH_CLIENT_ID"), clientSecret = required("YOUTUBE_OAUTH_CLIENT_SECRET"), identity = channelIdentity();
  const scopes = process.argv.includes("--course-playlist") ? COURSE_PLAYLIST_SCOPES : SCOPES;
  const verifier = randomBytes(64).toString("base64url"), challenge = createHash("sha256").update(verifier, "ascii").digest("base64url"), state = randomBytes(24).toString("base64url");
  const authorization = await receiveCode({ clientId, verifier, challenge, state, scopes });
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: authorization.code, client_id: clientId, client_secret: clientSecret, redirect_uri: authorization.redirectUri, code_verifier: authorization.verifier, grant_type: "authorization_code" }) });
  if (!response.ok) throw new Error(`token exchange failed ${response.status}: ${(await response.text()).slice(0, 300)}`); const tokens = await response.json(); if (!tokens.access_token || !tokens.refresh_token) throw new Error("token exchange returned incomplete credentials"); const granted = new Set(String(tokens.scope ?? "").split(/\s+/u).filter(Boolean)); if (scopes.some((scope) => !granted.has(scope))) throw new Error("token exchange omitted a requested mathematics scope");
  const observed = await observeAuthorizedChannel({ authorizedFetch: authorizedFetch(tokens.access_token) }); if (observed.id !== identity.youtubeChannelId) throw new Error(`authorized ${observed.id}, not mathematics channel ${identity.youtubeChannelId}`);
  store(envPath(), REFRESH_TOKEN_ENV, tokens.refresh_token); console.error(`Verified ${observed.title} (${observed.id}); refresh token stored without printing.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
