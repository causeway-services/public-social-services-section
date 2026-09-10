#!/usr/bin/env node

/**
 * This is deliberately an admission seam, not a production runner.  It proves
 * that the current, package-local providers are addressable and produces a
 * dry-run workflow plan.  It never imports a provider implementation, reads
 * secrets, makes a network request, writes provider custody, or posts content.
 */
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG = resolve(HERE, "../config/runtime.json");
const REQUIRED_NODE = Object.freeze([22, 18]);
const FORBIDDEN_KEYS = /(?:secret|token|credential|password|api[-_]?key|private[-_]?key|env(?:ironment)?|command|shell|path(?:name)?|url)$/iu;
const EXPECTED_PROVIDER_KEYS = Object.freeze(["sourceDiscovery", "sourceAcquisition", "editorialAssessment", "proseContribution"]);

function issue(code, message, details = {}) { return Object.freeze({ code, message, ...details }); }
function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function nodeAtLeast(version = process.versions.node) {
  const [major = 0, minor = 0] = String(version).split(".").map(Number);
  return major > REQUIRED_NODE[0] || major === REQUIRED_NODE[0] && minor >= REQUIRED_NODE[1];
}
function safeJson(path) {
  try { return { value: JSON.parse(readFileSync(path, "utf8")) }; }
  catch (error) { return { error: issue("invalid-json", `cannot read JSON: ${error.message}`, { path }) }; }
}
function forbidden(value, at = "config") {
  if (Array.isArray(value)) return value.map((entry, index) => forbidden(entry, `${at}[${index}]`)).find(Boolean);
  if (!isObject(value)) return undefined;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.test(key)) return `${at}.${key}`;
    const nested = forbidden(child, `${at}.${key}`);
    if (nested !== undefined) return nested;
  }
  return undefined;
}
function absoluteConfigPath(path) { return isAbsolute(path) ? path : resolve(process.cwd(), path); }
function sourceExports(text, exportName) {
  const escaped = exportName.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`export\\s+(?:async\\s+)?function\\s+${escaped}\\b|export\\s*\\{[^}]*\\b${escaped}\\b`, "u").test(text);
}
function declarationReachable(packageRoot, packageJson) {
  const missing = [];
  for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
    // Do not import providers or their dependencies: several are ESM-only or
    // intentionally export subpaths rather than a CommonJS root.  Presence of
    // the exact installed package manifest is the offline reachability fact.
    const manifest = resolve(packageRoot, "node_modules", dependency, "package.json");
    if (!safeJson(manifest).value) missing.push(issue("dependency-unreachable", `declared dependency is not installed: ${dependency}`, { dependency, manifest }));
  }
  return missing;
}

export function readRuntimeConfig(configPath = DEFAULT_CONFIG) {
  const absolute = absoluteConfigPath(configPath);
  const parsed = safeJson(absolute);
  if (parsed.error) return Object.freeze({ configPath: absolute, errors: Object.freeze([parsed.error]) });
  return Object.freeze({ configPath: absolute, config: parsed.value, errors: Object.freeze([]) });
}

export function inspectRuntime(configPath = DEFAULT_CONFIG, { nodeVersion = process.versions.node } = {}) {
  const loaded = readRuntimeConfig(configPath);
  const errors = [...loaded.errors];
  if (!nodeAtLeast(nodeVersion)) errors.push(issue("node-too-old", `Node >=${REQUIRED_NODE.join(".")} is required`, { actual: nodeVersion }));
  const config = loaded.config;
  if (!isObject(config)) return Object.freeze({ ok: false, configPath: loaded.configPath, errors: Object.freeze(errors.concat(issue("invalid-config", "runtime config must be an object"))), providers: Object.freeze([]) });
  if (config.version !== 1) errors.push(issue("unsupported-config-version", "runtime config version must be 1"));
  if (config.executionMode !== "dry-run") errors.push(issue("unsafe-execution-mode", "this admission seam only accepts executionMode dry-run"));
  if (typeof config.customer !== "string" || !config.customer.startsWith("urn:")) errors.push(issue("invalid-customer", "customer must be a non-empty URN"));
  const leak = forbidden(config);
  if (leak !== undefined) errors.push(issue("forbidden-control-surface", "runtime config must not contain credentials, environment controls, commands, locations, or URLs", { field: leak }));
  if (!isObject(config.providers)) {
    errors.push(issue("invalid-providers", "providers must be an object"));
    return Object.freeze({ ok: false, configPath: loaded.configPath, errors: Object.freeze(errors), providers: Object.freeze([]) });
  }
  const providers = [];
  for (const name of EXPECTED_PROVIDER_KEYS) {
    const provider = config.providers[name];
    const providerErrors = [];
    if (!isObject(provider)) {
      providers.push(Object.freeze({ name, reachable: false, errors: Object.freeze([issue("missing-provider", `missing ${name} provider`)]), packageRoot: null }));
      continue;
    }
    for (const field of ["packageRoot", "source", "bin", "exportName", "operation"]) if (typeof provider[field] !== "string" || provider[field].trim() === "") providerErrors.push(issue("invalid-provider-field", `${name}.${field} must be a non-empty string`));
    const packageRoot = typeof provider.packageRoot === "string" ? resolve(dirname(loaded.configPath), provider.packageRoot) : null;
    const packageJsonPath = packageRoot === null ? null : resolve(packageRoot, "package.json");
    const providerPackage = packageJsonPath === null ? undefined : safeJson(packageJsonPath).value;
    if (!isObject(providerPackage)) providerErrors.push(issue("provider-package-unreadable", `${name} package.json cannot be read`, { packageRoot }));
    else {
      if (providerPackage.type !== "module") providerErrors.push(issue("provider-not-esm", `${name} is not declared as an ESM provider`, { packageRoot }));
      if (providerPackage.bin?.[provider.bin] !== `./${provider.source}` && providerPackage.bin?.[provider.bin] !== provider.source) providerErrors.push(issue("provider-bin-mismatch", `${name} bin does not point to its declared contract source`, { bin: provider.bin, source: provider.source }));
      const sourcePath = resolve(packageRoot, provider.source);
      let source;
      try { source = readFileSync(sourcePath, "utf8"); }
      catch (error) { providerErrors.push(issue("contract-source-unreadable", `${name} contract source cannot be read`, { sourcePath, cause: error.code ?? error.message })); }
      if (source !== undefined && !sourceExports(source, provider.exportName)) providerErrors.push(issue("contract-export-unreachable", `${name} does not export ${provider.exportName}`, { sourcePath }));
      if (source !== undefined && typeof provider.contract === "string" && !source.includes(provider.contract)) providerErrors.push(issue("contract-identity-mismatch", `${name} source does not expose its configured contract identity`, { sourcePath }));
      if (source !== undefined && typeof provider.actor === "string" && !source.includes(`ACTOR = "${provider.actor}"`)) providerErrors.push(issue("provider-actor-mismatch", `${name} source does not expose its configured ActivityPub actor`, { sourcePath }));
      providerErrors.push(...declarationReachable(packageRoot, providerPackage));
    }
    providers.push(Object.freeze({ name, packageRoot, reachable: providerErrors.length === 0, errors: Object.freeze(providerErrors), operation: provider.operation }));
  }
  const allErrors = Object.freeze([...errors, ...providers.flatMap((provider) => provider.errors)]);
  return Object.freeze({ ok: allErrors.length === 0, configPath: loaded.configPath, errors: allErrors, providers: Object.freeze(providers), executionMode: config.executionMode });
}

export function dryRunPlan(report) {
  if (!report.ok) return Object.freeze({ disposition: "refused", code: "runtime-admission-failed", reasons: report.errors });
  return Object.freeze({
    disposition: "ready",
    executionMode: "dry-run",
    authority: "none",
    effects: Object.freeze([]),
    steps: Object.freeze(report.providers.map(({ name, operation, packageRoot }) => Object.freeze({ name, operation, packageRoot, invocation: "not-performed" }))),
    blockers: Object.freeze([
      "A separately authorized activity contract and customer capability are required before any provider invocation.",
      "Inference market, WIT transition, provider credentials, custody binding, publication, ActivityPub delivery, and deployment are intentionally outside this seam."
    ])
  });
}

function parseArgs(argv) {
  const operation = argv[2] ?? "inspect";
  const index = argv.indexOf("--config");
  return { operation, configPath: index === -1 ? DEFAULT_CONFIG : argv[index + 1] };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { operation, configPath } = parseArgs(process.argv);
  const report = inspectRuntime(configPath);
  const result = operation === "inspect" ? report : operation === "plan" ? dryRunPlan(report) : Object.freeze({ disposition: "refused", code: "unknown-operation", operation });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (operation !== "inspect" && operation !== "plan" || !report.ok) process.exitCode = 2;
}
