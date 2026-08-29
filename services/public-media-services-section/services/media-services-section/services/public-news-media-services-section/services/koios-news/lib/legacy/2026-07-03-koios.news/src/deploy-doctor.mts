#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkKoiosDeployRemote,
  type DeployEnvironmentName,
  type DeployEnvironmentSources,
  koiosDeployPlanReading,
  koiosDeployDoctorReading,
  renderKoiosDeployRemoteCheckMarkdown,
  renderKoiosDeployPlanMarkdown,
  renderKoiosDeployDoctorMarkdown,
  renderKoiosDeployRehearsalMarkdown,
  renderKoiosDeployShipMarkdown,
  renderKoiosDeployStageMarkdown,
  rehearseKoiosDeployWorkspace,
  shipKoiosDeployWorkspace,
  stageKoiosDeployWorkspace,
} from "./administrating/deploying/index.mjs";

type DeployCliEnvironment = Readonly<{
  env: NodeJS.ProcessEnv;
  sources: DeployEnvironmentSources;
}>;

type CliOptions = Readonly<{
  help: boolean;
  markdown: boolean;
  plan: boolean;
  stage: boolean;
  rehearse: boolean;
  ship: boolean;
  remoteCheck: boolean;
  selfCheck: boolean;
  apply: boolean;
  allowDirty: boolean;
  keepStage: boolean;
  siteRoot?: string;
  outDir?: string;
  envFile?: string;
}>;

function parseArgs(argv: readonly string[]): CliOptions {
  let help = false;
  let markdown = false;
  let plan = false;
  let stage = false;
  let rehearse = false;
  let ship = false;
  let remoteCheck = false;
  let selfCheck = false;
  let apply = false;
  let allowDirty = false;
  let keepStage = false;
  let siteRoot: string | undefined;
  let outDir: string | undefined;
  let envFile: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }
    if (arg === "--markdown") {
      markdown = true;
      continue;
    }
    if (arg === "--plan") {
      plan = true;
      continue;
    }
    if (arg === "--stage") {
      stage = true;
      continue;
    }
    if (arg === "--rehearse") {
      rehearse = true;
      continue;
    }
    if (arg === "--ship") {
      ship = true;
      continue;
    }
    if (arg === "--remote-check" || arg === "--remote") {
      remoteCheck = true;
      continue;
    }
    if (arg === "--self-check") {
      selfCheck = true;
      continue;
    }
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (arg === "--allow-dirty") {
      allowDirty = true;
      continue;
    }
    if (arg === "--keep-stage" || arg === "--keep") {
      keepStage = true;
      continue;
    }
    if (arg === "--site-root" || arg === "--path") {
      siteRoot = requiredOptionValue(argv, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--out" || arg === "--out-dir") {
      outDir = requiredOptionValue(argv, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--deploy-env") {
      envFile = requiredOptionValue(argv, index, arg);
      index += 1;
      continue;
    }
    if (arg !== undefined && arg.startsWith("-")) throw new Error(`unknown option: ${arg}`);
    if (arg !== undefined && siteRoot === undefined) {
      siteRoot = arg;
      continue;
    }
    if (arg !== undefined) throw new Error(`unexpected positional argument: ${arg}`);
  }
  return Object.freeze({
    help,
    markdown,
    plan,
    stage,
    rehearse,
    ship,
    remoteCheck,
    selfCheck,
    apply,
    allowDirty,
    keepStage,
    ...(siteRoot === undefined ? {} : { siteRoot }),
    ...(outDir === undefined ? {} : { outDir }),
    ...(envFile === undefined ? {} : { envFile }),
  });
}

function main(): number {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(renderHelp());
    return 0;
  }
  if (options.selfCheck) {
    const reading = deployCliSelfCheck();
    process.stdout.write(options.markdown
      ? renderDeployCliSelfCheckMarkdown(reading)
      : `${JSON.stringify(reading, null, 2)}\n`);
    return reading.ok ? 0 : 1;
  }
  const deployEnv = deployEnvironment(options);
  if (options.remoteCheck) {
    const reading = checkKoiosDeployRemote({
      ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
      env: deployEnv.env,
      envSources: deployEnv.sources,
    });
    process.stdout.write(options.markdown
      ? renderKoiosDeployRemoteCheckMarkdown(reading)
      : `${JSON.stringify(reading, null, 2)}\n`);
    return reading.ok ? 0 : 1;
  }
  if (options.ship) {
    const reading = shipKoiosDeployWorkspace({
      ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
      env: deployEnv.env,
      envSources: deployEnv.sources,
      apply: options.apply,
      allowDirty: options.allowDirty,
    });
    process.stdout.write(options.markdown
      ? renderKoiosDeployShipMarkdown(reading)
      : `${JSON.stringify(reading, null, 2)}\n`);
    return reading.ok ? 0 : 1;
  }
  if (options.rehearse) {
    const reading = rehearseKoiosDeployWorkspace({
      ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
      ...(options.outDir === undefined ? {} : { outDir: options.outDir }),
      keepStage: options.keepStage,
    });
    process.stdout.write(options.markdown
      ? renderKoiosDeployRehearsalMarkdown(reading)
      : `${JSON.stringify(reading, null, 2)}\n`);
    return reading.ok ? 0 : 1;
  }
  if (options.stage) {
    const reading = stageKoiosDeployWorkspace({
      ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
      ...(options.outDir === undefined ? {} : { outDir: options.outDir }),
    });
    process.stdout.write(options.markdown
      ? renderKoiosDeployStageMarkdown(reading)
      : `${JSON.stringify(reading, null, 2)}\n`);
    return 0;
  }
  if (options.plan) {
    const reading = koiosDeployPlanReading({
      ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
      env: deployEnv.env,
      envSources: deployEnv.sources,
    });
    process.stdout.write(options.markdown
      ? renderKoiosDeployPlanMarkdown(reading)
      : `${JSON.stringify(reading, null, 2)}\n`);
    return 0;
  }
  const reading = koiosDeployDoctorReading({
    ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
    env: deployEnv.env,
    envSources: deployEnv.sources,
  });
  process.stdout.write(options.markdown
    ? renderKoiosDeployDoctorMarkdown(reading)
    : `${JSON.stringify(reading, null, 2)}\n`);
  return reading.ok ? 0 : 1;
}

function requiredOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith("-")) throw new Error(`${option} requires a value`);
  return value;
}

function renderHelp(): string {
  return [
    "Koios.News deploy cockpit",
    "",
    "Usage:",
    "  deploy-doctor [--markdown] [--site-root <path>]",
    "  deploy-doctor --plan [--markdown] [--deploy-env <path>]",
    "  deploy-doctor --stage [--markdown] [--out <path>]",
    "  deploy-doctor --rehearse [--markdown] [--keep-stage]",
    "  deploy-doctor --ship [--markdown] [--deploy-env <path>] [--apply] [--allow-dirty]",
    "  deploy-doctor --remote-check [--markdown] [--deploy-env <path>]",
    "  deploy-doctor --self-check [--markdown]",
    "",
    "Modes:",
    "  --plan          Render the dry-run VPS handoff plan.",
    "  --stage         Materialize the rsync workspace subset locally under .tmp or --out.",
    "  --rehearse      Stage, install, build, project Caddy/systemd, then clean up.",
    "  --ship          Render or apply the remote rsync/ssh deploy sequence.",
    "  --remote-check  Run read-only remote preflight checks once SSH env is valid.",
    "  --self-check    Run the deploy CLI help/error/plan probes sequentially.",
    "",
    "Options:",
    "  --deploy-env <path>  Load KOIOS_DEPLOY_* values from a local env file.",
    "  --site-root <path>   Use a Koios checkout other than the detected package root.",
    "  --out <path>         Choose the local stage directory.",
    "  --markdown           Render human-readable markdown instead of JSON.",
    "  --apply              Execute remote ship commands; otherwise ship is dry-run.",
    "  --allow-dirty        Permit apply-mode ship from a dirty workspace sync subset.",
    "  --keep-stage         Keep rehearsal stage directory for inspection.",
    "",
  ].join("\n");
}

type DeployCliSelfCheckCase = Readonly<{
  name: string;
  args: readonly string[];
  expectedExit: number;
  stdoutIncludes?: string;
  stdoutIncludesAll?: readonly string[];
  stderrIncludes?: string;
  stderrIncludesAll?: readonly string[];
  validate?: (stdout: string, stderr: string) => boolean;
}>;

type DeployCliSelfCheckResult = Readonly<{
  name: string;
  args: readonly string[];
  expectedExit: number;
  exitCode: number | null;
  passed: boolean;
  stdoutTail: string;
  stderrTail: string;
}>;

type DeployCliSelfCheckReading = Readonly<{
  kind: "koios.deploy-cli-self-check";
  generatedAt: string;
  ok: boolean;
  cases: readonly DeployCliSelfCheckResult[];
  notes: readonly string[];
}>;

const SELF_CHECK_CASES: readonly DeployCliSelfCheckCase[] = Object.freeze([
  Object.freeze({
    name: "help",
    args: Object.freeze(["--help"]),
    expectedExit: 0,
    stdoutIncludes: "Koios.News deploy cockpit",
  }),
  Object.freeze({
    name: "missing-deploy-env-value",
    args: Object.freeze(["--deploy-env"]),
    expectedExit: 2,
    stderrIncludes: "--deploy-env requires a value",
  }),
  Object.freeze({
    name: "unknown-option",
    args: Object.freeze(["--definitely-not-a-koios-option"]),
    expectedExit: 2,
    stderrIncludes: "unknown option",
  }),
  Object.freeze({
    name: "dry-run-plan-env-example",
    args: Object.freeze(["--plan", "--deploy-env", ".koios-deploy.env.example"]),
    expectedExit: 0,
    stdoutIncludes: "\"kind\": \"koios.deploy-plan\"",
  }),
  Object.freeze({
    name: "apply-source-gate-reflects-workspace",
    args: Object.freeze(["--ship", "--apply", "--deploy-env", ".koios-deploy.env.example"]),
    expectedExit: 1,
    validate: validateApplySourceGate,
  }),
  Object.freeze({
    name: "allow-dirty-reflects-workspace",
    args: Object.freeze(["--ship", "--apply", "--allow-dirty", "--deploy-env", ".koios-deploy.env.example"]),
    expectedExit: 1,
    validate: validateAllowDirtySourceGate,
  }),
]);

function deployCliSelfCheck(): DeployCliSelfCheckReading {
  const script = fileURLToPath(import.meta.url);
  const cases = SELF_CHECK_CASES.map((testCase): DeployCliSelfCheckResult => {
    const result = spawnSync(process.execPath, [script, ...testCase.args], {
      cwd: defaultSiteRoot(),
      encoding: "utf8",
      windowsHide: true,
      timeout: 120_000,
    });
    const stdout = result.stdout ?? "";
    const stderr = [result.stderr ?? "", result.error?.message ?? ""].filter((entry) => entry !== "").join("\n");
    const exitCode = result.status;
    const passed = exitCode === testCase.expectedExit
      && (testCase.stdoutIncludes === undefined || stdout.includes(testCase.stdoutIncludes))
      && (testCase.stderrIncludes === undefined || stderr.includes(testCase.stderrIncludes))
      && (testCase.stdoutIncludesAll === undefined || testCase.stdoutIncludesAll.every((fragment) => stdout.includes(fragment)))
      && (testCase.stderrIncludesAll === undefined || testCase.stderrIncludesAll.every((fragment) => stderr.includes(fragment)))
      && (testCase.validate === undefined || testCase.validate(stdout, stderr));
    return Object.freeze({
      name: testCase.name,
      args: testCase.args,
      expectedExit: testCase.expectedExit,
      exitCode,
      passed,
      stdoutTail: tailForCli(stdout),
      stderrTail: tailForCli(stderr),
    });
  });
  return Object.freeze({
    kind: "koios.deploy-cli-self-check" as const,
    generatedAt: new Date().toISOString(),
    ok: cases.every((entry) => entry.passed),
    cases: Object.freeze(cases),
    notes: Object.freeze([
      "self-check invokes the already-built deploy-doctor CLI sequentially, avoiding parallel pnpm/package-script lock contention",
      "remote checks stay dry-run because the example deploy env points at a missing local SSH key",
    ]),
  });
}

function renderDeployCliSelfCheckMarkdown(reading: DeployCliSelfCheckReading): string {
  return [
    "# Koios.News Deploy CLI Self-Check",
    "",
    `Generated: ${reading.generatedAt}`,
    `Status: ${reading.ok ? "passed" : "failed"}`,
    "",
    "## Cases",
    "",
    ...reading.cases.flatMap((entry) => [
      `- ${entry.passed ? "passed" : "failed"} ${entry.name}: \`deploy-doctor ${entry.args.join(" ")}\``,
      `  - expected exit: ${entry.expectedExit}`,
      `  - actual exit: ${entry.exitCode ?? "unknown"}`,
      ...(entry.stdoutTail.trim() === "" ? [] : [`  - stdout tail: ${oneLineForCli(entry.stdoutTail)}`]),
      ...(entry.stderrTail.trim() === "" ? [] : [`  - stderr tail: ${oneLineForCli(entry.stderrTail)}`]),
    ]),
    "",
    "## Notes",
    "",
    ...reading.notes.map((note) => `- ${note}`),
    "",
  ].join("\n");
}

function tailForCli(value: string, limit = 2_000): string {
  return value.length <= limit ? value : value.slice(value.length - limit);
}

function oneLineForCli(value: string): string {
  return JSON.stringify(value.replace(/\s+/g, " ").trim());
}

function validateApplySourceGate(stdout: string): boolean {
  const reading = parseSelfCheckJson(stdout);
  if (reading === undefined) return false;
  const workspaceSource = objectAt(reading, "plan", "workspaceSource");
  const dirty = workspaceSource?.["dirty"];
  const sourceReady = reading["sourceReady"];
  const notes = stringArray(reading["notes"]);
  if (dirty === true) {
    return sourceReady === false && notes.some((note) => note.includes("pass --allow-dirty"));
  }
  if (dirty === false) return sourceReady === true;
  return false;
}

function validateAllowDirtySourceGate(stdout: string): boolean {
  const reading = parseSelfCheckJson(stdout);
  if (reading === undefined) return false;
  const workspaceSource = objectAt(reading, "plan", "workspaceSource");
  const dirty = workspaceSource?.["dirty"];
  const allowDirty = reading["allowDirty"];
  const sourceReady = reading["sourceReady"];
  const notes = stringArray(reading["notes"]);
  if (allowDirty !== true || sourceReady !== true) return false;
  if (dirty === true) return notes.some((note) => note.includes("acknowledged by --allow-dirty"));
  return dirty === false;
}

function parseSelfCheckJson(value: string): Record<string, unknown> | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function objectAt(root: Record<string, unknown>, ...path: readonly string[]): Record<string, unknown> | undefined {
  let current: unknown = root;
  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }
  return isRecord(current) ? current : undefined;
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : Object.freeze([]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const DEPLOY_ENVIRONMENT_NAMES: readonly DeployEnvironmentName[] = Object.freeze([
  "KOIOS_DEPLOY_HOST",
  "KOIOS_DEPLOY_USER",
  "KOIOS_DEPLOY_PATH",
  "KOIOS_DEPLOY_SSH_KEY",
]);

function deployEnvironment(options: CliOptions): DeployCliEnvironment {
  const siteRoot = options.siteRoot === undefined ? defaultSiteRoot() : resolve(options.siteRoot);
  const envPath = options.envFile === undefined
    ? join(siteRoot, ".koios-deploy.env")
    : resolveMaybe(siteRoot, options.envFile);
  const fileEnv = readDeployEnvFile(envPath, options.envFile !== undefined);
  const normalizedFileEnv = normalizeDeployEnvFileValues(fileEnv, envPath);
  const env = Object.freeze({ ...normalizedFileEnv, ...process.env });
  const sources: Partial<Record<DeployEnvironmentName, { source: "process" | "deploy-env" | "missing"; path?: string }>> = {};
  for (const name of DEPLOY_ENVIRONMENT_NAMES) {
    if (nonBlank(process.env[name])) {
      sources[name] = Object.freeze({ source: "process" });
    } else if (nonBlank(normalizedFileEnv[name])) {
      sources[name] = Object.freeze({ source: "deploy-env", path: envPath });
    } else {
      sources[name] = Object.freeze({ source: "missing" });
    }
  }
  return Object.freeze({ env, sources: Object.freeze(sources) });
}

function normalizeDeployEnvFileValues(
  env: Readonly<Record<string, string>>,
  envPath: string,
): Readonly<Record<string, string>> {
  const normalized: Record<string, string> = { ...env };
  const keyPath = env["KOIOS_DEPLOY_SSH_KEY"];
  if (nonBlank(keyPath) && !isAbsolute(keyPath) && !keyPath.startsWith("~/") && !keyPath.startsWith("~\\")) {
    normalized["KOIOS_DEPLOY_SSH_KEY"] = resolve(dirname(envPath), keyPath);
  }
  return Object.freeze(normalized);
}

function defaultSiteRoot(): string {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

function resolveMaybe(base: string, path: string): string {
  return isAbsolute(path) ? path : resolve(base, path);
}

function readDeployEnvFile(path: string, required: boolean): Readonly<Record<string, string>> {
  if (!existsSync(path)) {
    if (required) throw new Error(`deploy env file not found: ${path}`);
    return Object.freeze({});
  }
  const env: Record<string, string> = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (match === null) continue;
    const [, name, rawValue] = match;
    if (name === undefined || rawValue === undefined) continue;
    env[name] = unquoteEnvValue(rawValue.trim());
  }
  return Object.freeze(env);
}

function unquoteEnvValue(value: string): string {
  if (value.length >= 2) {
    const first = value.at(0);
    const last = value.at(-1);
    if ((first === "\"" && last === "\"") || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function nonBlank(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== "";
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.exit(main());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`deploy-doctor: ${message}\n`);
    process.stderr.write("deploy-doctor: pass --help for usage\n");
    process.exit(2);
  }
}
