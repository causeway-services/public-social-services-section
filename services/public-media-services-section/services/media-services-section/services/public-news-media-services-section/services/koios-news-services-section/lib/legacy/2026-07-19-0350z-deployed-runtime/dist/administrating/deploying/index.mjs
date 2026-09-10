// administrating/deploying - local production and VPS deployment readiness for Koios.News.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
const REQUIRED_SCRIPTS = Object.freeze([
    "check",
    "build",
    "serve",
    "serve:newsroom",
    "deploy:probe",
]);
const DEPLOY_SUPPORT_PACKAGES = Object.freeze(["@emsenn/jsnode-ick"]);
const KOIOS_WORKSPACE_BUILD_COMMAND = "pnpm --filter @emsenn/jsnode-ick... run build && pnpm --filter @emsenn/koios.news... run build";
const ENVIRONMENT = Object.freeze([
    Object.freeze({
        name: "KOIOS_DEPLOY_HOST",
        purpose: "VPS hostname or SSH host alias that will receive the built Koios site.",
    }),
    Object.freeze({
        name: "KOIOS_DEPLOY_USER",
        purpose: "SSH user for the deployment account on the VPS.",
    }),
    Object.freeze({
        name: "KOIOS_DEPLOY_PATH",
        purpose: "Remote directory where Koios source/data should be synchronized.",
    }),
    Object.freeze({
        name: "KOIOS_DEPLOY_SSH_KEY",
        purpose: "Private key path for non-interactive deploys once the key is available.",
    }),
]);
const DEPLOY_TOOLS = Object.freeze([
    Object.freeze({
        name: "ssh",
        command: "ssh",
        candidates: Object.freeze(["ssh"]),
        args: Object.freeze(["-V"]),
        purpose: "Run remote install/build/restart commands on the VPS.",
        remediation: "Install or enable OpenSSH client, then re-run deploy:doctor.",
    }),
    Object.freeze({
        name: "rsync",
        command: "rsync",
        candidates: Object.freeze(process.platform === "win32" ? ["C:\\msys64\\usr\\bin\\rsync.exe", "rsync"] : ["rsync"]),
        args: Object.freeze(["--version"]),
        purpose: "Synchronize the Koios workspace subset to the VPS without shipping node_modules or dist.",
        remediation: "On this Windows cockpit, install MSYS2 rsync with `pacman -S --needed rsync` and keep C:\\msys64\\usr\\bin on PATH.",
    }),
]);
export function koiosDeployDoctorReading(options = {}) {
    const env = options.env ?? process.env;
    const siteRoot = options.siteRoot === undefined ? findSiteRoot() : resolve(options.siteRoot);
    const packageJson = readJson(join(siteRoot, "package.json"), {});
    const scripts = Object.freeze(Object.keys(packageJson.scripts ?? {}).sort());
    const workspaceDependencies = workspaceDependenciesOf(packageJson);
    const workspaceSubset = workspaceSubsetFor(siteRoot, packageJson.name ?? "@emsenn/koios.news");
    const workspaceSource = workspaceSourceReading(workspaceSubset);
    const missingScripts = Object.freeze(REQUIRED_SCRIPTS.filter((script) => !(script in (packageJson.scripts ?? {}))));
    const adminConfig = readJson(join(siteRoot, "site-admin.config.json"), {});
    const paths = deployPaths(siteRoot);
    const endpoints = Object.freeze((adminConfig.endpoints ?? []).flatMap(readEndpoint));
    const repositories = Object.freeze([
        repositoryReading(join(siteRoot, "content")),
        repositoryReading(join(siteRoot, "data")),
    ]);
    const environment = environmentReadings(env, options.envSources);
    const tools = deployToolReadings();
    const localReady = paths
        .filter((entry) => entry.requiredFor !== "remote-deploy")
        .every((entry) => entry.present)
        && missingScripts.length === 0
        && endpoints.length >= 2;
    const remoteReadiness = remoteReadinessReading(env, tools);
    const remoteReady = remoteReadiness.ready;
    const plan = koiosDeployPlanReading({
        siteRoot,
        localReady,
        remoteReady,
        env,
        ...(options.envSources === undefined ? {} : { envSources: options.envSources }),
        environment,
        tools,
        workspaceDependencies,
        workspaceSubset,
        workspaceSource,
    });
    return Object.freeze({
        kind: "koios.deploy-doctor",
        generatedAt: (options.now ?? (() => new Date()))().toISOString(),
        siteRoot,
        packageName: packageJson.name ?? "@emsenn/koios.news",
        localReady,
        remoteReady,
        remoteReadiness,
        ok: localReady,
        paths,
        scripts,
        missingScripts,
        endpoints,
        repositories,
        workspaceSource,
        environment,
        tools,
        plan,
        commands: Object.freeze([
            "pnpm --filter @emsenn/koios.news run check",
            "pnpm --filter @emsenn/koios.news run build",
            "pnpm --filter @emsenn/koios.news run deploy:plan",
            "pnpm --filter @emsenn/koios.news run deploy:stage",
            "pnpm --filter @emsenn/koios.news run deploy:rehearse",
            "pnpm --filter @emsenn/koios.news run deploy:ship",
            "pnpm --filter @emsenn/koios.news run deploy:remote-check",
            "pnpm --filter @emsenn/koios.news run deploy:self-check",
            "pnpm --filter @emsenn/koios.news run serve",
            "pnpm --filter @emsenn/koios.news run serve:newsroom",
            "pnpm --filter @emsenn/koios.news run deploy:probe",
        ]),
        notes: deployNotes({ localReady, remoteReady, repositories, workspaceSource, environment, tools }),
    });
}
export function renderKoiosDeployDoctorMarkdown(reading) {
    return [
        "# Koios.News Deploy Doctor",
        "",
        `Generated: ${reading.generatedAt}`,
        "",
        "## Readiness",
        "",
        `- local production: ${reading.localReady ? "ready" : "blocked"}`,
        `- remote VPS deploy: ${reading.remoteReady ? "ready" : "pending"}`,
        `- site root: \`${reading.siteRoot}\``,
        "",
        "## Paths",
        "",
        ...reading.paths.map((entry) => `- ${entry.present ? "ok" : "missing"} ${entry.id}: \`${entry.path}\` (${entry.requiredFor})`),
        "",
        "## Endpoints",
        "",
        ...reading.endpoints.map((entry) => `- ${entry.domain} -> ${entry.serviceName}:${entry.port} via \`${entry.script}\`${entry.access === undefined ? "" : ` (${entry.access})`}`),
        "",
        "## Repositories",
        "",
        ...reading.repositories.map((entry) => `- ${entry.git ? "git" : "not-git"} ${entry.dirty ? "dirty" : "clean"} \`${entry.path}\``),
        "",
        "## Workspace Source Status",
        "",
        ...renderWorkspaceSourceStatus(reading.workspaceSource),
        "",
        "## Remote Environment",
        "",
        ...reading.environment.map((entry) => `- ${renderEnvironmentStatus(entry)} ${entry.name}${renderEnvironmentSource(entry)}: ${entry.purpose}${entry.issue === undefined ? "" : ` ${entry.issue}`}`),
        "",
        ...renderRemoteReadinessSection(reading.remoteReadiness),
        "",
        "## Local Deploy Tools",
        "",
        ...reading.tools.map((entry) => `- ${entry.present ? "ok" : "missing"} ${entry.name}: ${entry.purpose} Command: \`${entry.command}\`${entry.version === undefined ? "" : ` (${entry.version})`}${entry.error === undefined ? "" : ` - ${entry.error}`}${entry.present || entry.remediation === undefined ? "" : ` Remedy: ${entry.remediation}`}`),
        "",
        "## Deploy Plan",
        "",
        `- mode: ${reading.plan.mode}`,
        `- target: ${reading.plan.target ?? "pending remote env"}`,
        "",
        ...reading.plan.steps.map((step) => `- ${step.status} ${step.phase}/${step.id}: ${step.summary}${step.command === undefined ? "" : `\n  - \`${step.command}\``}${step.reason === undefined ? "" : `\n  - ${step.reason}`}`),
        "",
        "## Workspace Dependencies",
        "",
        ...(reading.plan.workspaceDependencies.length === 0
            ? ["- none"]
            : reading.plan.workspaceDependencies.map((entry) => `- ${entry.name}: ${entry.spec}`)),
        "",
        "## Workspace Sync Subset",
        "",
        `- root: \`${reading.plan.workspaceSubset.root}\``,
        ...reading.plan.workspaceSubset.rootFiles.map((entry) => `- root file: \`${entry}\``),
        ...reading.plan.workspaceSubset.packages.map((entry) => `- package: ${entry.name} \`${entry.directory}\``),
        ...reading.plan.workspaceSubset.missingPackages.map((entry) => `- missing package: ${entry}`),
        "",
        "## Commands",
        "",
        ...reading.commands.map((command) => `- \`${command}\``),
        "",
        "## Notes",
        "",
        ...reading.notes.map((note) => `- ${note}`),
        "",
    ].join("\n");
}
export function koiosDeployPlanReading(input = {}) {
    const env = input.env ?? process.env;
    const siteRoot = input.siteRoot ?? findSiteRoot();
    const environment = input.environment ?? environmentReadings(env, input.envSources);
    const tools = input.tools ?? deployToolReadings();
    const host = env["KOIOS_DEPLOY_HOST"];
    const user = env["KOIOS_DEPLOY_USER"];
    const remotePath = env["KOIOS_DEPLOY_PATH"];
    const key = deploySshKeyArgument(env["KOIOS_DEPLOY_SSH_KEY"]);
    const target = nonBlank(host) && nonBlank(user) && nonBlank(remotePath)
        ? `${user}@${host}:${remotePath}`
        : null;
    const localReady = input.localReady ?? true;
    const remoteReady = input.remoteReady ?? remoteReadinessReading(env, tools).ready;
    const packageJson = readJson(join(siteRoot, "package.json"), {});
    const workspaceDependencies = input.workspaceDependencies ?? workspaceDependenciesOf(packageJson);
    const workspaceSubset = input.workspaceSubset ?? workspaceSubsetFor(siteRoot, packageJson.name ?? "@emsenn/koios.news");
    const workspaceSource = input.workspaceSource ?? workspaceSourceReading(workspaceSubset);
    const remoteReadiness = Object.freeze({
        ready: remoteReady,
        gaps: remoteReady ? Object.freeze([]) : remoteReadinessReading(env, tools).gaps,
    });
    const caddyDomains = deployCaddyDomains(siteRoot);
    const serviceNames = deployServiceNames(siteRoot);
    const sshPrefix = sshCommandPrefix(key);
    const rsyncCommand = deployToolCommand(tools, "rsync");
    const rsyncSsh = rsyncSshArgs(key, rsyncCommand);
    const syncTarget = target ?? "<user>@<host>:<remote-path>";
    const syncEntries = workspaceSubset.syncEntries.map((entry) => quote(posixRelativePath(entry))).join(" ");
    const steps = [
        step({
            id: "verify-local",
            phase: "local",
            status: localReady ? "ready" : "blocked",
            summary: "Typecheck and build Koios from the Windows checkout before shipping anything.",
            command: "pnpm --filter @emsenn/koios.news run check && pnpm --filter @emsenn/koios.news run build",
            ...(localReady ? {} : { reason: "Local doctor is blocked." }),
        }),
        step({
            id: "preflight-remote-path",
            phase: "remote",
            status: remoteReady ? "ready" : "pending",
            summary: "Read-only check that the VPS deploy directory exists before synchronizing source.",
            command: `${sshPrefix} ${targetHost(target)} "test -d ${shellSingleQuote(remotePath ?? "<remote-path>")} && cd ${shellSingleQuote(remotePath ?? "<remote-path>")} && pwd"`,
            ...(remoteReady ? {} : { reason: "Remote path preflight waits for SSH configuration." }),
        }),
        step({
            id: "preflight-remote-runtime",
            phase: "remote",
            status: remoteReady ? "ready" : "pending",
            summary: "Read-only check that the VPS has Node and Corepack before install/build.",
            command: `${sshPrefix} ${targetHost(target)} "cd ${shellSingleQuote(remotePath ?? "<remote-path>")} && command -v node && node --version && command -v corepack && corepack --version"`,
            ...(remoteReady ? {} : { reason: "Remote runtime preflight waits for SSH configuration." }),
        }),
        step({
            id: "sync-workspace-source",
            phase: "sync",
            status: remoteReady ? "ready" : "pending",
            summary: "Synchronize the Koios workspace subset needed by the package, excluding generated and local dependency directories.",
            command: [
                `cd ${quote(workspaceSubset.root)} &&`,
                quote(rsyncCommand),
                "-az",
                "--relative",
                "--delete",
                ...rsyncSsh,
                "--exclude node_modules",
                "--exclude dist",
                "--exclude .tmp",
                syncEntries,
                quote(`${syncTarget}/`),
            ].join(" "),
            ...(remoteReady ? {} : { reason: "Remote host/user/path/key are not all configured yet." }),
        }),
        step({
            id: "verify-remote-workspace-shape",
            phase: "remote",
            status: remoteReady ? "ready" : "pending",
            summary: "Verify the VPS received the expected workspace root files and package manifests before install/build.",
            command: `${sshPrefix} ${targetHost(target)} "cd ${shellSingleQuote(remotePath ?? "<remote-path>")} && ${remoteWorkspaceShapeCommand(workspaceSubset)}"`,
            ...(remoteReady ? {} : { reason: "Remote workspace shape verification waits for SSH configuration." }),
        }),
        step({
            id: "install-build",
            phase: "remote",
            status: remoteReady ? "ready" : "pending",
            summary: "Install dependencies and build on the VPS from the synchronized package/workspace checkout.",
            command: `${sshPrefix} ${targetHost(target)} "cd ${shellSingleQuote(remotePath ?? "<remote-path>")} && corepack enable && pnpm install --frozen-lockfile && ${KOIOS_WORKSPACE_BUILD_COMMAND}"`,
            ...(workspaceDependencies.length === 0
                ? {}
                : { reason: "Koios still has workspace:* dependencies, so the remote checkout must include a compatible workspace or a future standalone artifact." }),
        }),
        step({
            id: "configure-caddy-services",
            phase: "remote",
            status: remoteReady ? "ready" : "pending",
            summary: "Project site-admin endpoints into managed Caddy blocks and systemd user units on the VPS.",
            command: `${sshPrefix} ${targetHost(target)} "cd ${shellSingleQuote(remotePath ?? "<remote-path>")} && ${caddyDomains.map((domain) => `node scripts/deploy-caddy.js --domain ${shellSingleQuote(domain)} --apply --skip-build`).join(" && ")}"`,
            ...(remoteReady ? {} : { reason: "Caddy/service configuration waits for SSH configuration." }),
        }),
        step({
            id: "restart-services",
            phase: "remote",
            status: remoteReady ? "ready" : "pending",
            summary: "Restart the public and newsroom services named by site-admin.config.json.",
            command: `${sshPrefix} ${targetHost(target)} "systemctl --user restart ${serviceNames.map(shellSingleQuote).join(" ")}"`,
            ...(remoteReady ? {} : { reason: "Service restart waits for SSH configuration and server-side unit names." }),
        }),
        step({
            id: "probe-local-or-forwarded",
            phase: "probe",
            status: "ready",
            summary: "After services are reachable on local forwarded ports, run the existing deploy readiness probe.",
            command: "pnpm --filter @emsenn/koios.news run deploy:probe",
        }),
    ];
    return Object.freeze({
        kind: "koios.deploy-plan",
        mode: "workspace-source",
        siteRoot,
        target,
        remoteReadiness,
        tools,
        workspaceDependencies,
        workspaceSubset,
        workspaceSource,
        steps: Object.freeze(steps),
        warnings: Object.freeze([
            ...(workspaceDependencies.length === 0 ? [] : [`Current package has workspace:* dependencies; deploy plan now syncs a ${workspaceSubset.packages.length}-package workspace subset.`]),
            ...(workspaceSubset.missingPackages.length === 0 ? [] : [`Workspace subset is missing package manifests for: ${workspaceSubset.missingPackages.join(", ")}.`]),
            ...(workspaceSource.dirty ? [`Workspace sync subset has ${workspaceSource.statusCount} dirty git status entr${workspaceSource.statusCount === 1 ? "y" : "ies"} before deploy.`] : []),
            ...(workspaceSource.error === undefined ? [] : [`Workspace source status check failed: ${workspaceSource.error}`]),
            ...(tools.every((entry) => entry.present) ? [] : [`Local deploy tooling is missing: ${tools.filter((entry) => !entry.present).map((entry) => entry.name).join(", ")}.`]),
            ...(remoteReady ? [] : ["Remote deploy is intentionally dry-run/pending until SSH environment variables and keys exist."]),
        ]),
    });
}
export function renderKoiosDeployPlanMarkdown(reading) {
    return [
        "# Koios.News Deploy Plan",
        "",
        `- mode: ${reading.mode}`,
        `- target: ${reading.target ?? "pending remote env"}`,
        "",
        "## Steps",
        "",
        ...reading.steps.map((step) => `- ${step.status} ${step.phase}/${step.id}: ${step.summary}${step.command === undefined ? "" : `\n  - \`${step.command}\``}${step.reason === undefined ? "" : `\n  - ${step.reason}`}`),
        "",
        ...renderRemoteReadinessSection(reading.remoteReadiness),
        "",
        "## Workspace Sync Subset",
        "",
        `- root: \`${reading.workspaceSubset.root}\``,
        ...reading.workspaceSubset.rootFiles.map((entry) => `- root file: \`${entry}\``),
        ...reading.workspaceSubset.packages.map((entry) => `- package: ${entry.name} \`${posixRelativePath(entry.directory)}\``),
        ...reading.workspaceSubset.missingPackages.map((entry) => `- missing package: ${entry}`),
        "",
        "## Workspace Source Status",
        "",
        ...renderWorkspaceSourceStatus(reading.workspaceSource),
        "",
        "## Warnings",
        "",
        ...(reading.warnings.length === 0 ? ["- none"] : reading.warnings.map((warning) => `- ${warning}`)),
        "",
    ].join("\n");
}
const STAGE_EXCLUDED_NAMES = Object.freeze(["node_modules", "dist", ".tmp", ".git"]);
export function stageKoiosDeployWorkspace(options = {}) {
    const siteRoot = options.siteRoot === undefined ? findSiteRoot() : resolve(options.siteRoot);
    const generatedAt = (options.now ?? (() => new Date()))().toISOString();
    const plan = koiosDeployPlanReading({ siteRoot });
    const outDir = resolveStageOutDir(plan.workspaceSubset.root, options.outDir, generatedAt);
    for (const pkg of plan.workspaceSubset.packages) {
        const source = join(plan.workspaceSubset.root, pkg.directory);
        if (isInside(source, outDir)) {
            throw new Error(`stageKoiosDeployWorkspace: output cannot be inside copied package ${pkg.directory}: ${outDir}`);
        }
    }
    if (existsSync(outDir))
        throw new Error(`stageKoiosDeployWorkspace: output already exists: ${outDir}`);
    mkdirSync(outDir, { recursive: true });
    runLocalRsyncStage(plan, outDir);
    const verified = verifyRsyncStageShape(plan, outDir);
    const manifest = join(outDir, ".koios-deploy-stage.json");
    writeFileSync(manifest, `${JSON.stringify({
        kind: "koios.deploy-stage.manifest",
        generatedAt,
        sourceRoot: plan.workspaceSubset.root,
        outDir,
        rootFiles: verified.rootFiles,
        packages: verified.packages,
        excludedNames: STAGE_EXCLUDED_NAMES,
        plan,
    }, null, 2)}\n`, "utf8");
    return Object.freeze({
        kind: "koios.deploy-stage",
        generatedAt,
        outDir,
        plan,
        copied: Object.freeze({
            rootFiles: verified.rootFiles,
            packages: verified.packages,
            manifest,
        }),
        excludedNames: STAGE_EXCLUDED_NAMES,
    });
}
export function renderKoiosDeployStageMarkdown(reading) {
    return [
        "# Koios.News Deploy Stage",
        "",
        `Generated: ${reading.generatedAt}`,
        `Output: \`${reading.outDir}\``,
        "",
        "## Copied",
        "",
        ...reading.copied.rootFiles.map((entry) => `- root file: \`${entry}\``),
        ...reading.copied.packages.map((entry) => `- package dir: \`${posixRelativePath(entry)}\``),
        `- manifest: \`${reading.copied.manifest}\``,
        "",
        "## Excluded Names",
        "",
        ...reading.excludedNames.map((entry) => `- \`${entry}\``),
        "",
        "## Next Local Rehearsal",
        "",
        `- \`cd ${reading.outDir} && pnpm install --frozen-lockfile && ${KOIOS_WORKSPACE_BUILD_COMMAND} && ${deployCaddyDomains(reading.plan.siteRoot).map((domain) => `node scripts/deploy-caddy.js --domain ${domain} --skip-build`).join(" && ")}\``,
        "",
    ].join("\n");
}
export function rehearseKoiosDeployWorkspace(options = {}) {
    const stage = stageKoiosDeployWorkspace(options);
    const generatedAt = (options.now ?? (() => new Date()))().toISOString();
    const commands = [];
    const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
    const install = runRehearsalCommand(stage.outDir, pnpm, ["install", "--frozen-lockfile"]);
    commands.push(install);
    if (install.status === "passed") {
        commands.push(runRehearsalCommand(stage.outDir, pnpm, ["--filter", "@emsenn/jsnode-ick...", "run", "build"]));
    }
    if (commands.every((command) => command.status === "passed")) {
        commands.push(runRehearsalCommand(stage.outDir, pnpm, ["--filter", "@emsenn/koios.news...", "run", "build"]));
    }
    for (const domain of deployCaddyDomains(stage.plan.siteRoot)) {
        if (!commands.every((command) => command.status === "passed"))
            break;
        commands.push(runRehearsalCommand(stage.outDir, "node", ["scripts/deploy-caddy.js", "--domain", domain, "--skip-build"]));
    }
    const ok = commands.every((command) => command.status === "passed");
    const cleanup = cleanupRehearsalStage({
        keepStage: options.keepStage === true,
        root: stage.plan.workspaceSubset.root,
        outDir: stage.outDir,
    });
    return Object.freeze({
        kind: "koios.deploy-rehearsal",
        generatedAt,
        ok,
        stage,
        commands: Object.freeze(commands),
        cleanup,
    });
}
export function renderKoiosDeployRehearsalMarkdown(reading) {
    return [
        "# Koios.News Deploy Rehearsal",
        "",
        `Generated: ${reading.generatedAt}`,
        `Status: ${reading.ok ? "passed" : "failed"}`,
        `Stage: \`${reading.stage.outDir}\``,
        "",
        "## Commands",
        "",
        ...reading.commands.flatMap((command) => [
            `- ${command.status} \`${command.command}\` (${command.durationMs}ms)`,
            `  - cwd: \`${command.cwd}\``,
            ...(command.exitCode === null ? [] : [`  - exit: ${command.exitCode}`]),
            ...(command.stdoutTail.trim() === "" ? [] : [`  - stdout tail: ${oneLine(command.stdoutTail)}`]),
            ...(command.stderrTail.trim() === "" ? [] : [`  - stderr tail: ${oneLine(command.stderrTail)}`]),
        ]),
        "",
        "## Cleanup",
        "",
        `- requested: ${reading.cleanup.requested}`,
        `- performed: ${reading.cleanup.performed}`,
        `- reason: ${reading.cleanup.reason}`,
        "",
    ].join("\n");
}
export function shipKoiosDeployWorkspace(options = {}) {
    const env = options.env ?? process.env;
    const apply = options.apply === true;
    const allowDirty = options.allowDirty === true;
    const plan = koiosDeployPlanReading({
        ...(options.siteRoot === undefined ? {} : { siteRoot: options.siteRoot }),
        env,
        ...(options.envSources === undefined ? {} : { envSources: options.envSources }),
    });
    const remoteReadiness = remoteReadinessReading(env, plan.tools);
    const remoteReady = remoteReadiness.ready;
    const sourceDirtyReason = workspaceSourceDirtyReason(plan.workspaceSource);
    const sourceReady = sourceDirtyReason === undefined || allowDirty;
    const planCommands = shipPlanCommands(plan);
    const commands = [];
    if (!apply) {
        commands.push(...planCommands.map((command) => Object.freeze({
            ...command,
            status: command.id === "verify-local" || remoteReady ? "ready" : "pending",
            ...(command.id === "verify-local" || remoteReady ? {} : { reason: remoteReadiness.gaps.join("; ") }),
        })));
    }
    else if (!remoteReady || !sourceReady) {
        const reasons = [
            ...remoteReadiness.gaps,
            ...(sourceDirtyReason === undefined || allowDirty ? [] : [sourceDirtyReason]),
        ];
        commands.push(...planCommands.map((command) => Object.freeze({
            ...command,
            status: "skipped",
            reason: `apply requested but ${reasons.join("; ")}`,
        })));
    }
    else {
        for (const command of planCommands) {
            const result = runShellCommand(plan.workspaceSubset.root, command.command);
            commands.push(Object.freeze({
                ...command,
                status: result.status,
                exitCode: result.exitCode,
                durationMs: result.durationMs,
                stdoutTail: result.stdoutTail,
                stderrTail: result.stderrTail,
            }));
            if (result.status === "failed")
                break;
        }
    }
    const ok = apply
        ? remoteReady && sourceReady && commands.every((command) => command.status === "passed")
        : commands.every((command) => command.status === "ready" || command.status === "pending");
    return Object.freeze({
        kind: "koios.deploy-ship",
        generatedAt: (options.now ?? (() => new Date()))().toISOString(),
        apply,
        allowDirty,
        ok,
        sourceReady,
        remoteReady,
        remoteReadiness,
        target: plan.target,
        plan,
        commands: Object.freeze(commands),
        notes: Object.freeze([
            apply ? "apply mode requested" : "dry-run only; pass --apply to execute rsync and ssh commands",
            ...(allowDirty ? ["dirty workspace sync subset is explicitly allowed for this ship reading"] : []),
            ...(sourceDirtyReason === undefined ? [] : [allowDirty ? workspaceSourceDirtyAllowedNote(plan.workspaceSource) : sourceDirtyReason]),
            ...(remoteReady ? [] : [`remote deploy awaits ${remoteReadiness.gaps.join("; ")}`]),
        ]),
    });
}
export function renderKoiosDeployShipMarkdown(reading) {
    return [
        "# Koios.News Deploy Ship",
        "",
        `Generated: ${reading.generatedAt}`,
        `Mode: ${reading.apply ? "apply" : "dry-run"}`,
        `Status: ${reading.ok ? "ready" : "blocked"}`,
        `Allow dirty source: ${reading.allowDirty ? "yes" : "no"}`,
        `Source gate: ${reading.sourceReady ? "ready" : "blocked"}`,
        `Target: ${reading.target ?? "pending remote env"}`,
        "",
        ...renderRemoteReadinessSection(reading.remoteReadiness),
        "",
        "## Workspace Source Status",
        "",
        ...renderWorkspaceSourceStatus(reading.plan.workspaceSource),
        "",
        "## Commands",
        "",
        ...reading.commands.flatMap((command) => [
            `- ${command.status} ${command.id}: \`${command.command}\``,
            ...(command.exitCode === undefined ? [] : [`  - exit: ${command.exitCode}`]),
            ...(command.durationMs === undefined ? [] : [`  - duration: ${command.durationMs}ms`]),
            ...(command.reason === undefined ? [] : [`  - ${command.reason}`]),
            ...(command.stdoutTail === undefined || command.stdoutTail.trim() === "" ? [] : [`  - stdout tail: ${oneLine(command.stdoutTail)}`]),
            ...(command.stderrTail === undefined || command.stderrTail.trim() === "" ? [] : [`  - stderr tail: ${oneLine(command.stderrTail)}`]),
        ]),
        "",
        "## Notes",
        "",
        ...reading.notes.map((note) => `- ${note}`),
        "",
    ].join("\n");
}
export function checkKoiosDeployRemote(options = {}) {
    const env = options.env ?? process.env;
    const siteRoot = options.siteRoot === undefined ? findSiteRoot() : resolve(options.siteRoot);
    const plan = koiosDeployPlanReading({
        siteRoot,
        env,
        ...(options.envSources === undefined ? {} : { envSources: options.envSources }),
    });
    const remoteReadiness = remoteReadinessReading(env, plan.tools);
    const remoteReady = remoteReadiness.ready;
    const plannedCommands = remoteCheckCommands(siteRoot, env, plan.target, plan.workspaceSubset);
    const commands = [];
    if (!remoteReady) {
        commands.push(...plannedCommands.map((command) => Object.freeze({
            ...command,
            status: "skipped",
            reason: remoteReadiness.gaps.join("; "),
        })));
    }
    else {
        for (const command of plannedCommands) {
            const result = runShellCommand(plan.workspaceSubset.root, command.command);
            commands.push(Object.freeze({
                ...command,
                status: result.status,
                exitCode: result.exitCode,
                durationMs: result.durationMs,
                stdoutTail: result.stdoutTail,
                stderrTail: result.stderrTail,
            }));
            if (result.status === "failed")
                break;
        }
    }
    const ok = remoteReady && commands.every((command) => command.status === "passed");
    return Object.freeze({
        kind: "koios.deploy-remote-check",
        generatedAt: (options.now ?? (() => new Date()))().toISOString(),
        ok,
        remoteReady,
        remoteReadiness,
        target: plan.target,
        plan,
        commands: Object.freeze(commands),
        notes: Object.freeze([
            "read-only remote preflight for the VPS deploy path, runtime tools, and configured user services",
            ...(remoteReady ? [] : [`remote check awaits ${remoteReadiness.gaps.join("; ")}`]),
        ]),
    });
}
export function renderKoiosDeployRemoteCheckMarkdown(reading) {
    return [
        "# Koios.News Remote Check",
        "",
        `Generated: ${reading.generatedAt}`,
        `Status: ${reading.ok ? "passed" : "blocked"}`,
        `Target: ${reading.target ?? "pending remote env"}`,
        "",
        ...renderRemoteReadinessSection(reading.remoteReadiness),
        "",
        "## Commands",
        "",
        ...reading.commands.flatMap((command) => [
            `- ${command.status} ${command.id}: \`${command.command}\``,
            ...(command.exitCode === undefined ? [] : [`  - exit: ${command.exitCode}`]),
            ...(command.durationMs === undefined ? [] : [`  - duration: ${command.durationMs}ms`]),
            ...(command.reason === undefined ? [] : [`  - ${command.reason}`]),
            ...(command.stdoutTail === undefined || command.stdoutTail.trim() === "" ? [] : [`  - stdout tail: ${oneLine(command.stdoutTail)}`]),
            ...(command.stderrTail === undefined || command.stderrTail.trim() === "" ? [] : [`  - stderr tail: ${oneLine(command.stderrTail)}`]),
        ]),
        "",
        "## Notes",
        "",
        ...reading.notes.map((note) => `- ${note}`),
        "",
    ].join("\n");
}
const WORKSPACE_LAYERS = Object.freeze(["lib", "apps", "services", "sites", "ops"]);
function workspaceSubsetFor(siteRoot, packageName) {
    const root = findWorkspaceRoot(siteRoot);
    const packagesByName = workspacePackagesByName(root);
    const missing = new Set();
    const selected = new Set();
    const visit = (name) => {
        if (selected.has(name))
            return;
        const pkg = packagesByName.get(name);
        if (pkg === undefined) {
            missing.add(name);
            return;
        }
        selected.add(name);
        for (const dependency of pkg.dependencies)
            visit(dependency);
    };
    visit(packageName);
    for (const supportPackage of DEPLOY_SUPPORT_PACKAGES)
        visit(supportPackage);
    const packages = [...selected]
        .flatMap((name) => {
        const pkg = packagesByName.get(name);
        return pkg === undefined ? [] : [pkg];
    })
        .sort((left, right) => left.directory.localeCompare(right.directory));
    const rootFileCandidates = ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", ".npmrc", "tsconfig.json", "tsconfig.base.json", "scripts/deploy-caddy.js"];
    const rootFiles = Object.freeze(rootFileCandidates.filter((entry) => existsSync(join(root, entry))));
    return Object.freeze({
        root,
        rootFiles,
        packages: Object.freeze(packages),
        missingPackages: Object.freeze([...missing].sort()),
        syncEntries: Object.freeze([
            ...rootFiles,
            ...packages.map((pkg) => pkg.directory),
        ]),
    });
}
function workspacePackagesByName(root) {
    const packages = new Map();
    for (const layer of WORKSPACE_LAYERS) {
        const layerDir = join(root, layer);
        let entries;
        try {
            entries = readdirSync(layerDir);
        }
        catch {
            continue;
        }
        for (const entry of entries) {
            const directory = join(layer, entry);
            const manifest = readJson(join(root, directory, "package.json"), {});
            if (manifest.name === undefined)
                continue;
            packages.set(manifest.name, Object.freeze({
                name: manifest.name,
                directory,
                dependencies: Object.freeze(workspaceDependenciesOf(manifest).map((dependency) => dependency.name)),
            }));
        }
    }
    return packages;
}
function posixRelativePath(path) {
    return path.replaceAll("\\", "/");
}
function timestampForPath(value) {
    return value.replaceAll(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, "");
}
function resolveStageOutDir(root, outDir, generatedAt) {
    if (outDir === undefined)
        return join(root, ".tmp", `koios-deploy-workspace-${timestampForPath(generatedAt)}`);
    return isAbsolute(outDir) ? resolve(outDir) : resolve(root, outDir);
}
function isInside(parent, child) {
    const rel = relative(resolve(parent), resolve(child));
    return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}
function runLocalRsyncStage(plan, outDir) {
    const rsync = plan.tools.find((entry) => entry.name === "rsync");
    if (rsync === undefined || !rsync.present) {
        throw new Error(`stageKoiosDeployWorkspace: rsync is required for deploy staging${rsync?.remediation === undefined ? "" : `; ${rsync.remediation}`}`);
    }
    const destination = `${rsyncLocalPath(outDir, rsync.command)}/`;
    const args = Object.freeze([
        "-a",
        "--relative",
        "--delete",
        ...STAGE_EXCLUDED_NAMES.flatMap((name) => ["--exclude", name]),
        ...plan.workspaceSubset.syncEntries.map(posixRelativePath),
        destination,
    ]);
    const result = spawnSync(rsync.command, [...args], {
        cwd: plan.workspaceSubset.root,
        encoding: "utf8",
        windowsHide: true,
        timeout: 300_000,
    });
    if (result.error !== undefined || result.status !== 0) {
        throw new Error([
            `stageKoiosDeployWorkspace: rsync staging failed with exit ${result.status ?? "unknown"}`,
            `command: ${[quote(rsync.command), ...args.map(quote)].join(" ")}`,
            `stdout: ${tail(result.stdout ?? "")}`,
            `stderr: ${tail([result.stderr ?? "", result.error?.message ?? ""].filter((entry) => entry !== "").join("\n"))}`,
        ].join("\n"));
    }
}
function verifyRsyncStageShape(plan, outDir) {
    const rootFiles = plan.workspaceSubset.rootFiles.filter((entry) => existsSync(join(outDir, entry)));
    const packages = plan.workspaceSubset.packages.map((pkg) => pkg.directory).filter((entry) => existsSync(join(outDir, entry, "package.json")));
    const missing = [
        ...plan.workspaceSubset.rootFiles.filter((entry) => !rootFiles.includes(entry)).map((entry) => `root file ${entry}`),
        ...plan.workspaceSubset.packages.map((pkg) => pkg.directory).filter((entry) => !packages.includes(entry)).map((entry) => `package ${entry}`),
    ];
    if (missing.length > 0) {
        throw new Error(`stageKoiosDeployWorkspace: rsync stage missing planned entries: ${missing.join(", ")}`);
    }
    return Object.freeze({
        rootFiles: Object.freeze(rootFiles),
        packages: Object.freeze(packages),
    });
}
function runRehearsalCommand(cwd, command, args) {
    const started = Date.now();
    const result = spawnSync(command, [...args], {
        cwd,
        encoding: "utf8",
        shell: process.platform === "win32",
        windowsHide: true,
        timeout: 300_000,
    });
    const exitCode = result.status;
    return Object.freeze({
        command: [command, ...args].join(" "),
        cwd,
        status: exitCode === 0 ? "passed" : "failed",
        exitCode,
        durationMs: Date.now() - started,
        stdoutTail: tail(result.stdout ?? ""),
        stderrTail: tail([result.stderr ?? "", result.error?.message ?? ""].filter((entry) => entry !== "").join("\n")),
    });
}
function shipPlanCommands(plan) {
    return Object.freeze(plan.steps.flatMap((step) => {
        if ((step.id === "verify-local" || step.id === "preflight-remote-path" || step.id === "preflight-remote-runtime" || step.id === "sync-workspace-source" || step.id === "verify-remote-workspace-shape" || step.id === "install-build" || step.id === "configure-caddy-services" || step.id === "restart-services")
            && step.command !== undefined) {
            return [Object.freeze({ id: step.id, command: step.command })];
        }
        return [];
    }));
}
function remoteWorkspaceShapeCommand(workspaceSubset) {
    const entries = [
        ...workspaceSubset.rootFiles,
        ...workspaceSubset.packages.map((pkg) => `${posixRelativePath(pkg.directory)}/package.json`),
    ];
    return `for path in ${entries.map((entry) => shellSingleQuote(posixRelativePath(entry))).join(" ")}; do test -e $path || { echo missing:$path; exit 1; }; done`;
}
function runShellCommand(cwd, command) {
    const started = Date.now();
    const result = spawnSync(command, {
        cwd,
        encoding: "utf8",
        shell: true,
        windowsHide: true,
        timeout: 600_000,
    });
    return Object.freeze({
        status: result.status === 0 ? "passed" : "failed",
        exitCode: result.status,
        durationMs: Date.now() - started,
        stdoutTail: tail(result.stdout ?? ""),
        stderrTail: tail([result.stderr ?? "", result.error?.message ?? ""].filter((entry) => entry !== "").join("\n")),
    });
}
function remoteCheckCommands(siteRoot, env, target, workspaceSubset) {
    const adminConfig = readJson(join(siteRoot, "site-admin.config.json"), {});
    const endpoints = Object.freeze((adminConfig.endpoints ?? []).flatMap(readEndpoint));
    const remotePath = env["KOIOS_DEPLOY_PATH"] ?? "<remote-path>";
    const key = deploySshKeyArgument(env["KOIOS_DEPLOY_SSH_KEY"]);
    const sshPrefix = sshCommandPrefix(key);
    const sshTarget = targetHost(target);
    const serviceNames = deployServiceNames(siteRoot, endpoints);
    return Object.freeze([
        Object.freeze({
            id: "remote-path",
            command: `${sshPrefix} ${sshTarget} "test -d ${shellSingleQuote(remotePath)} && cd ${shellSingleQuote(remotePath)} && pwd"`,
        }),
        Object.freeze({
            id: "remote-runtime",
            command: `${sshPrefix} ${sshTarget} "cd ${shellSingleQuote(remotePath)} && command -v node && node --version && command -v corepack && corepack --version"`,
        }),
        Object.freeze({
            id: "remote-workspace-shape",
            command: `${sshPrefix} ${sshTarget} "cd ${shellSingleQuote(remotePath)} && ${remoteWorkspaceShapeCommand(workspaceSubset)}"`,
        }),
        Object.freeze({
            id: "remote-services",
            command: `${sshPrefix} ${sshTarget} "systemctl --user status ${serviceNames.map(shellSingleQuote).join(" ")} --no-pager"`,
        }),
    ]);
}
function deployToolReadings() {
    return Object.freeze(DEPLOY_TOOLS.map((tool) => {
        const attempts = tool.candidates.map((candidate) => Object.freeze({
            command: candidate,
            result: spawnSync(candidate, [...tool.args], {
                encoding: "utf8",
                windowsHide: true,
                timeout: 10_000,
            }),
        }));
        const passed = attempts.find((attempt) => attempt.result.error === undefined && attempt.result.status === 0);
        const attempt = passed ?? attempts[0] ?? Object.freeze({
            command: tool.command,
            result: spawnSync(tool.command, [...tool.args], {
                encoding: "utf8",
                windowsHide: true,
                timeout: 10_000,
            }),
        });
        const result = attempt.result;
        const output = [result.stdout ?? "", result.stderr ?? ""].join("\n").trim();
        const version = output.split(/\r?\n/).find((line) => line.trim() !== "");
        const error = result.error?.message ?? (result.status === 0 ? undefined : `exit ${result.status ?? "unknown"}`);
        return Object.freeze({
            name: tool.name,
            command: attempt.command,
            purpose: tool.purpose,
            remediation: tool.remediation,
            present: result.error === undefined && result.status === 0,
            ...(version === undefined ? {} : { version }),
            ...(error === undefined ? {} : { error }),
        });
    }));
}
function deployToolCommand(tools, name) {
    return tools.find((entry) => entry.name === name && entry.present)?.command ?? name;
}
function environmentReadings(env, sources = Object.freeze({})) {
    return Object.freeze(ENVIRONMENT.map((entry) => {
        const value = env[entry.name];
        const configured = nonBlank(value);
        const present = environmentValuePresent(entry.name, value);
        const source = configured ? (sources[entry.name]?.source ?? "process") : "missing";
        const sourcePath = sources[entry.name]?.path;
        const issue = environmentIssue(entry.name, value);
        return Object.freeze({
            ...entry,
            present,
            source,
            ...(source === "deploy-env" && sourcePath !== undefined ? { sourcePath } : {}),
            ...(issue === undefined ? {} : { issue }),
        });
    }));
}
function renderEnvironmentStatus(entry) {
    if (entry.present)
        return "set";
    if (entry.source === "missing")
        return "missing";
    return "invalid";
}
function renderEnvironmentSource(entry) {
    if (entry.source === "deploy-env" && entry.sourcePath !== undefined)
        return ` (deploy-env: ${entry.sourcePath})`;
    if (entry.source === "missing")
        return "";
    return ` (${entry.source})`;
}
function renderRemoteReadinessSection(reading) {
    return Object.freeze([
        "## Remote Readiness",
        "",
        `- status: ${reading.ready ? "ready" : "pending"}`,
        ...(reading.gaps.length === 0 ? ["- gaps: none"] : reading.gaps.map((gap) => `- gap: ${gap}`)),
    ]);
}
function remoteReadinessReading(env, tools) {
    const missingEnv = ENVIRONMENT
        .filter((entry) => !nonBlank(env[entry.name]))
        .map((entry) => entry.name);
    const invalidEnv = ENVIRONMENT
        .flatMap((entry) => {
        const value = env[entry.name];
        if (!nonBlank(value) || environmentValuePresent(entry.name, value))
            return [];
        return [`invalid ${entry.name}: ${environmentIssue(entry.name, value) ?? "configured value is not usable"}`];
    });
    const missingTools = tools.filter((entry) => !entry.present).map((entry) => entry.name);
    const gaps = Object.freeze([
        ...(missingEnv.length === 0 ? [] : [`missing env ${missingEnv.join(", ")}`]),
        ...invalidEnv,
        ...(missingTools.length === 0 ? [] : [`missing local tools ${missingTools.join(", ")}`]),
    ]);
    return Object.freeze({
        ready: gaps.length === 0,
        gaps,
    });
}
function cleanupRehearsalStage(input) {
    if (input.keepStage) {
        return Object.freeze({ requested: false, performed: false, reason: "stage retained by request" });
    }
    const tmpRoot = join(input.root, ".tmp");
    if (!isInside(tmpRoot, input.outDir)) {
        return Object.freeze({ requested: true, performed: false, reason: "stage is outside workspace .tmp and was left in place" });
    }
    rmSync(input.outDir, { recursive: true, force: true });
    return Object.freeze({ requested: true, performed: true, reason: "stage removed from workspace .tmp after rehearsal" });
}
function tail(value, limit = 2_000) {
    return value.length <= limit ? value : value.slice(value.length - limit);
}
function oneLine(value) {
    return JSON.stringify(value.trim().replaceAll(/\s+/g, " "));
}
function deployPaths(siteRoot) {
    return Object.freeze([
        pathReading("content", join(siteRoot, "content"), "local-production"),
        pathReading("data", join(siteRoot, "data"), "local-production"),
        pathReading("dist", join(siteRoot, "dist"), "local-build"),
        pathReading("site-admin", join(siteRoot, "site-admin.config.json"), "remote-deploy"),
    ]);
}
function pathReading(id, path, requiredFor) {
    return Object.freeze({ id, path, present: existsSync(path), requiredFor });
}
function repositoryReading(path) {
    const git = existsSync(join(path, ".git"));
    const statusResult = git
        ? spawnSync("git", ["-C", path, "status", "--short"], { encoding: "utf8", windowsHide: true, timeout: 10_000 })
        : undefined;
    const status = Object.freeze((statusResult?.stdout ?? "").split(/\r?\n/).filter((line) => line.length > 0));
    return Object.freeze({
        path,
        git,
        dirty: status.length > 0,
        status,
    });
}
function workspaceSourceReading(workspaceSubset, limit = 80) {
    const git = existsSync(join(workspaceSubset.root, ".git"));
    if (!git) {
        return Object.freeze({
            root: workspaceSubset.root,
            git,
            dirty: false,
            statusCount: 0,
            status: Object.freeze([]),
            truncated: false,
            paths: workspaceSubset.syncEntries,
        });
    }
    const result = spawnSync("git", ["-C", workspaceSubset.root, "status", "--short", "--", ...workspaceSubset.syncEntries], {
        encoding: "utf8",
        windowsHide: true,
        timeout: 15_000,
    });
    const error = result.error?.message ?? (result.status === 0 ? undefined : `exit ${result.status ?? "unknown"}`);
    const status = Object.freeze((result.stdout ?? "").split(/\r?\n/).filter((line) => line.length > 0));
    return Object.freeze({
        root: workspaceSubset.root,
        git,
        dirty: status.length > 0 || error !== undefined,
        statusCount: status.length,
        status: Object.freeze(status.slice(0, limit)),
        truncated: status.length > limit,
        paths: workspaceSubset.syncEntries,
        ...(error === undefined ? {} : { error }),
    });
}
function renderWorkspaceSourceStatus(reading) {
    return Object.freeze([
        `- ${reading.git ? "git" : "not-git"} ${reading.dirty ? "dirty" : "clean"} \`${reading.root}\``,
        `- sync entries: ${reading.paths.length}`,
        `- status entries: ${reading.statusCount}${reading.truncated ? ` (showing ${reading.status.length})` : ""}`,
        ...(reading.error === undefined ? [] : [`- status error: ${reading.error}`]),
        ...reading.status.map((entry) => `- \`${entry}\``),
    ]);
}
function workspaceSourceDirtyReason(reading) {
    if (!reading.dirty)
        return undefined;
    const status = reading.statusCount === 0 ? "unknown dirty status" : `${reading.statusCount} dirty git status entr${reading.statusCount === 1 ? "y" : "ies"}`;
    return `workspace sync subset has ${status}; pass --allow-dirty to apply anyway`;
}
function workspaceSourceDirtyAllowedNote(reading) {
    const status = reading.statusCount === 0 ? "unknown dirty status" : `${reading.statusCount} dirty git status entr${reading.statusCount === 1 ? "y" : "ies"}`;
    return `workspace sync subset has ${status}, acknowledged by --allow-dirty`;
}
function readEndpoint(value) {
    if (typeof value.domain !== "string"
        || typeof value.serviceName !== "string"
        || typeof value.kind !== "string"
        || typeof value.port !== "number"
        || typeof value.script !== "string")
        return Object.freeze([]);
    return Object.freeze([Object.freeze({
            domain: value.domain,
            serviceName: value.serviceName,
            kind: value.kind,
            port: value.port,
            script: value.script,
            ...(typeof value.access === "string" ? { access: value.access } : {}),
        })]);
}
function deployCaddyDomains(siteRoot) {
    const adminConfig = readJson(join(siteRoot, "site-admin.config.json"), {});
    const domains = (adminConfig.endpoints ?? [])
        .flatMap(readEndpoint)
        .map((endpoint) => endpoint.domain)
        .filter((domain, index, all) => all.indexOf(domain) === index);
    return Object.freeze(domains.length === 0 ? ["koios.news"] : domains);
}
function deployServiceNames(siteRoot, endpoints) {
    const source = endpoints ?? (readJson(join(siteRoot, "site-admin.config.json"), {}).endpoints ?? []).flatMap(readEndpoint);
    const names = source
        .map((endpoint) => endpoint.serviceName)
        .filter((name, index, all) => all.indexOf(name) === index);
    return Object.freeze(names.length === 0 ? ["koios-news-site"] : names);
}
function deployNotes(input) {
    const notes = [];
    if (input.localReady)
        notes.push("Local content production can run from this Windows checkout: build, public serve, newsroom serve, and deploy probe are discoverable.");
    else
        notes.push("Local production is blocked; repair missing paths, scripts, or endpoint config before treating this checkout as the cockpit.");
    if (!input.remoteReady) {
        const missing = input.environment.filter((entry) => !entry.present).map((entry) => entry.issue ?? entry.name).join(", ");
        const missingTools = input.tools.filter((entry) => !entry.present).map((entry) => entry.name).join(", ");
        notes.push(`Remote deploy is pending external credentials/configuration${missing === "" ? "" : `: ${missing}`}${missingTools === "" ? "" : `; local tools: ${missingTools}`}. This is expected before SSH keys are installed.`);
    }
    for (const repository of input.repositories) {
        if (repository.dirty)
            notes.push(`Nested repository has uncommitted content/data state before deploy: ${repository.path}.`);
    }
    if (input.workspaceSource.dirty) {
        notes.push(`Workspace sync subset has ${input.workspaceSource.statusCount} dirty git status entr${input.workspaceSource.statusCount === 1 ? "y" : "ies"} before deploy.`);
    }
    return Object.freeze(notes);
}
function workspaceDependenciesOf(packageJson) {
    const dependencies = packageJson.dependencies ?? {};
    return Object.freeze(Object.entries(dependencies)
        .filter(([, spec]) => spec === "workspace:*")
        .map(([name, spec]) => Object.freeze({ name, spec })));
}
function step(value) {
    return Object.freeze(value);
}
function quote(value) {
    return /\s/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
}
function sshCommandPrefix(key) {
    return nonBlank(key) ? `ssh -i ${quote(key)}` : "ssh";
}
function rsyncSshArgs(key, rsyncCommand) {
    if (!nonBlank(key))
        return Object.freeze([]);
    return Object.freeze(["-e", quote(`ssh -i ${shellSingleQuote(rsyncSshKeyPath(key, rsyncCommand))}`)]);
}
function rsyncSshKeyPath(key, rsyncCommand) {
    return rsyncLocalPath(key, rsyncCommand);
}
function rsyncLocalPath(path, rsyncCommand) {
    if (process.platform !== "win32" || !rsyncCommand.toLowerCase().endsWith("rsync.exe"))
        return path;
    const match = /^([A-Za-z]):[\\/](.*)$/.exec(path);
    if (match === null)
        return path.replaceAll("\\", "/");
    const [, drive, rest] = match;
    return `/${drive.toLowerCase()}/${rest.replaceAll("\\", "/")}`;
}
function targetHost(target) {
    return target === null ? "<user>@<host>" : target.slice(0, target.indexOf(":"));
}
function shellSingleQuote(value) {
    return `'${value.replaceAll("'", "'\"'\"'")}'`;
}
function readJson(path, fallback) {
    try {
        return JSON.parse(readFileSync(path, "utf8"));
    }
    catch {
        return fallback;
    }
}
function nonBlank(value) {
    return value !== undefined && value.trim() !== "";
}
function environmentValuePresent(name, value) {
    if (!nonBlank(value))
        return false;
    if (name !== "KOIOS_DEPLOY_SSH_KEY")
        return true;
    return existsSync(resolveHome(value));
}
function environmentIssue(name, value) {
    if (!nonBlank(value))
        return undefined;
    if (name !== "KOIOS_DEPLOY_SSH_KEY")
        return undefined;
    const path = resolveHome(value);
    return existsSync(path) ? undefined : `Configured key path does not exist: ${path}`;
}
function resolveHome(path) {
    if (path === "~")
        return homedir();
    if (path.startsWith("~/") || path.startsWith("~\\"))
        return join(homedir(), path.slice(2));
    return path;
}
function deploySshKeyArgument(value) {
    return nonBlank(value) ? resolveHome(value) : undefined;
}
function findSiteRoot() {
    let current = dirname(fileURLToPath(import.meta.url));
    for (;;) {
        const packagePath = join(current, "package.json");
        if (existsSync(packagePath)) {
            const packageJson = readJson(packagePath, {});
            if (packageJson.name === "@emsenn/koios.news")
                return current;
        }
        const parent = dirname(current);
        if (parent === current)
            return resolve(process.cwd());
        current = parent;
    }
}
function findWorkspaceRoot(start) {
    let current = resolve(start);
    for (;;) {
        if (existsSync(join(current, "pnpm-workspace.yaml")))
            return current;
        const parent = dirname(current);
        if (parent === current)
            return resolve(process.cwd());
        current = parent;
    }
}
//# sourceMappingURL=index.mjs.map