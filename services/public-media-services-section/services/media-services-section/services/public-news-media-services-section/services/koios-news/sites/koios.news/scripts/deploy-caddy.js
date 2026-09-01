#!/usr/bin/env node

// deploy-caddy.js — project site-admin.config.json endpoints into a managed
// Caddy reverse-proxy block for koios.news.
//
// The deploy plan (src/administrating/deploying/index.mts) invokes this as:
//   node scripts/deploy-caddy.js --domain <domain> --skip-build           (rehearsal / dry-run)
//   node scripts/deploy-caddy.js --domain <domain> --apply --skip-build   (remote configure step)
//
// Dry-run (no --apply): render the full Caddyfile to stdout and exit 0. This is
// what runs during `deploy:rehearse` and is safe on any machine.
//
// --apply: actually install the rendered Caddyfile and reload Caddy. This is
// guarded: it only writes/reloads when --apply is present, and it shells out to
// `caddy` (or systemctl) which only exist on the VPS. Everything it does is
// stated explicitly below so there are no hidden side effects.
//
// --domain <domain>: the deploy step iterates one --domain per site-admin
//   endpoint. We render the WHOLE Caddyfile (every endpoint) regardless, because
//   a single Caddyfile must contain every managed site block; --domain is used
//   only to validate that the named domain is actually one we manage, and to
//   label which invocation is "primary" when --apply writes the file.
//
// --skip-build: accepted as a no-op. The deploy plan always passes it because
//   the workspace build is handled by the separate install-build step; this
//   script never builds.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LOOPBACK = "127.0.0.1";

// Where --apply installs the rendered Caddyfile and how it reloads Caddy. These
// are overridable by env so the VPS can point them at its real layout without a
// code change, but the defaults match a conventional Caddy install.
const CADDYFILE_PATH = process.env.KOIOS_CADDYFILE_PATH ?? "/etc/caddy/Caddyfile";
const CADDY_BIN = process.env.KOIOS_CADDY_BIN ?? "caddy";

function parseArgs(argv) {
  let domain;
  let apply = false;
  let skipBuild = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (arg === "--skip-build") {
      skipBuild = true;
      continue;
    }
    if (arg === "--domain") {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error("--domain requires a value");
      }
      domain = value;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(renderHelp());
      process.exit(0);
    }
    if (arg.startsWith("-")) throw new Error(`unknown option: ${arg}`);
    if (domain === undefined) {
      domain = arg;
      continue;
    }
    throw new Error(`unexpected positional argument: ${arg}`);
  }
  return Object.freeze({ domain, apply, skipBuild });
}

function renderHelp() {
  return [
    "deploy-caddy — project site-admin endpoints into a Caddy reverse-proxy config",
    "",
    "Usage:",
    "  node scripts/deploy-caddy.js --domain <domain> [--apply] [--skip-build]",
    "",
    "Options:",
    "  --domain <domain>  Managed domain to validate against site-admin.config.json.",
    "  --apply            Write the Caddyfile and reload Caddy (VPS only). Otherwise",
    "                     the rendered Caddyfile is printed to stdout (dry-run).",
    "  --skip-build       Accepted as a no-op; the deploy build is a separate step.",
    "",
    "Env:",
    "  KOIOS_CADDYFILE_PATH  Target Caddyfile path for --apply (default /etc/caddy/Caddyfile).",
    "  KOIOS_CADDY_BIN       Caddy binary used for validate/reload (default caddy).",
    "",
  ].join("\n");
}

function siteRoot() {
  // The deploy plan runs this with cwd set to the workspace/site root
  // (cd <remote-path> && node scripts/deploy-caddy.js ...), so the config lives
  // next to package.json in cwd. Fall back to the script's own parent for
  // direct invocation from elsewhere.
  if (existsSync(join(process.cwd(), "site-admin.config.json"))) return process.cwd();
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

function readEndpoints(root) {
  const configPath = join(root, "site-admin.config.json");
  if (!existsSync(configPath)) {
    throw new Error(`site-admin.config.json not found at ${configPath}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`failed to parse ${configPath}: ${message}`);
  }
  const rawEndpoints = Array.isArray(parsed?.endpoints) ? parsed.endpoints : [];
  const endpoints = rawEndpoints
    .filter((entry) => entry && typeof entry.domain === "string" && typeof entry.port === "number")
    .map((entry) => Object.freeze({
      domain: entry.domain,
      port: entry.port,
      serviceName: typeof entry.serviceName === "string" ? entry.serviceName : entry.domain,
    }));
  if (endpoints.length === 0) {
    throw new Error(`no proxy endpoints with domain+port found in ${configPath}`);
  }
  return Object.freeze(endpoints);
}

function renderCaddyfile(endpoints) {
  const header = [
    "# Managed by scripts/deploy-caddy.js — projected from site-admin.config.json.",
    "# Do not edit by hand; rerun `node scripts/deploy-caddy.js --domain <domain> --apply`.",
    "# Caddy provisions automatic HTTPS (Let's Encrypt) for each site block below.",
    "",
  ];
  const blocks = endpoints.map((endpoint) => [
    `${endpoint.domain} {`,
    `\treverse_proxy ${LOOPBACK}:${endpoint.port}`,
    "}",
    "",
  ].join("\n"));
  return `${header.join("\n")}${blocks.join("\n")}`;
}

function applyCaddyfile(caddyfile, root, primaryDomain) {
  const notes = [];

  // 1. Write the rendered Caddyfile to the configured path.
  const targetDir = dirname(CADDYFILE_PATH);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
    notes.push(`created directory ${targetDir}`);
  }
  writeFileSync(CADDYFILE_PATH, caddyfile, "utf8");
  notes.push(`wrote ${CADDYFILE_PATH}`);

  // 2. Validate, then reload Caddy with the new config. caddy validate fails
  //    fast on a malformed file before we attempt a reload.
  const validate = spawnSync(CADDY_BIN, ["validate", "--config", CADDYFILE_PATH], {
    stdio: "inherit",
    cwd: root,
  });
  if (validate.error) {
    throw new Error(`${CADDY_BIN} validate failed to run: ${validate.error.message}`);
  }
  if (validate.status !== 0) {
    throw new Error(`${CADDY_BIN} validate rejected ${CADDYFILE_PATH} (exit ${validate.status})`);
  }
  notes.push(`validated ${CADDYFILE_PATH}`);

  const reload = spawnSync(CADDY_BIN, ["reload", "--config", CADDYFILE_PATH], {
    stdio: "inherit",
    cwd: root,
  });
  if (reload.error) {
    throw new Error(`${CADDY_BIN} reload failed to run: ${reload.error.message}`);
  }
  if (reload.status !== 0) {
    throw new Error(`${CADDY_BIN} reload failed for ${CADDYFILE_PATH} (exit ${reload.status})`);
  }
  notes.push(`reloaded Caddy for ${primaryDomain}`);

  return notes;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = siteRoot();
  const endpoints = readEndpoints(root);

  if (options.domain !== undefined) {
    const managed = endpoints.some((endpoint) => endpoint.domain === options.domain);
    if (!managed) {
      const known = endpoints.map((endpoint) => endpoint.domain).join(", ");
      throw new Error(`--domain ${options.domain} is not a managed endpoint (known: ${known})`);
    }
  }

  const caddyfile = renderCaddyfile(endpoints);

  if (!options.apply) {
    // Dry-run: print the Caddyfile we would install and stop. No side effects.
    process.stdout.write(caddyfile.endsWith("\n") ? caddyfile : `${caddyfile}\n`);
    return 0;
  }

  const notes = applyCaddyfile(caddyfile, root, options.domain ?? endpoints[0].domain);
  for (const note of notes) process.stderr.write(`deploy-caddy: ${note}\n`);
  return 0;
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    process.exit(main());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`deploy-caddy: ${message}\n`);
    process.exit(1);
  }
}
