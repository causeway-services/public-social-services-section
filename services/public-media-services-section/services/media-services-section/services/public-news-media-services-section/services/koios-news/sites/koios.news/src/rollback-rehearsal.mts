#!/usr/bin/env node

import { resolve4 } from "node:dns/promises";
import { isIP } from "node:net";
import { spawnSync } from "node:child_process";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mts";
import { appendKoiosAct } from "./management/ledger.mts";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const instant = argument("--now");
const originHost = argument("--origin-host");
if (instant === undefined) throw new Error("rollback rehearsal requires --now with an explicit UTC instant");
if (originHost === undefined) throw new Error("rollback rehearsal requires --origin-host naming the retained VPS operations host");
const witness = latestLivePublicationWitness(DEFAULT_DATA_DIR);
const article = witness.articleRoutes[0];
if (article === undefined) throw new Error("live publication witness contains no article for rollback probing");
const addresses = Object.freeze(isIP(originHost) === 4
  ? [originHost]
  : [...new Set(await resolve4(originHost))].sort());
if (addresses.length === 0) throw new Error(`retained origin host ${originHost} has no IPv4 address`);
const routes = Object.freeze(["/healthz", "/feed.json", "/sitemap.xml", article]);

const attempts = addresses.flatMap((address) => routes.map((route) => {
  const execution = spawnSync("curl", [
    "--silent", "--show-error", "--connect-timeout", "10", "--max-time", "30",
    "--output", "/dev/null",
    "--write-out", "%{http_code}\t%{content_type}\t%{remote_ip}",
    "--resolve", `koios.news:443:${address}`,
    `https://koios.news${route}`,
  ], { encoding: "utf8", timeout: 35_000 });
  const [statusText = "0", mediaType = "", remoteAddress = ""] = (execution.stdout ?? "").trim().split("\t");
  return Object.freeze({
    address,
    route,
    status: Number(statusText),
    mediaType,
    remoteAddress,
    reachable: execution.status === 0 && Number(statusText) === 200 && remoteAddress === address,
    diagnostic: execution.status === 0 ? null : (execution.stderr || execution.error?.message || "curl probe failed").trim(),
  });
}));
const reachableAddresses = addresses.filter((address) => routes.every((route) => attempts.some((attempt) => attempt.address === address && attempt.route === route && attempt.reachable)));
const ok = reachableAddresses.length > 0;
const report = Object.freeze({
  kind: "koios.rollback-rehearsal/v1",
  rehearsalScope: "retained-origin-reachability",
  rehearsedAt: instant,
  currentPublicAuthority: "https://koios.news via existing Cloudflare-proxied VPS delivery",
  retainedOriginHost: originHost,
  resolvedAddresses: addresses,
  reachableAddresses: Object.freeze(reachableAddresses),
  livePublicationWitnessDigest: witness.witnessDigest,
  probes: Object.freeze(attempts),
  proved: Object.freeze(["non-DNS-dependent-origin-route", "canonical-host-TLS-at-retained-origin", "root-supporting-feed-and-sitemap-reachability", "one-live-article-reachability"]),
  unproved: Object.freeze(["Cloudflare-preview-route-restoration", "provider-cache-purge", "DNS-or-Worker-route-mutation", "rollback-elapsed-time-under-production-authority"]),
  authorityChanged: false,
  ok,
});
await appendKoiosAct({
  dataRoot: DEFAULT_DATA_DIR,
  ledger: "deployments",
  instant,
  act: ok ? "deployment.rollback-origin-rehearsed" : "deployment.rollback-origin-refused",
  subject: "vps-to-cloudflare-shadow",
  data: report as unknown as Record<string, unknown>,
});
process.stdout.write(`${JSON.stringify(report)}\n`);
if (!ok) process.exitCode = 2;
