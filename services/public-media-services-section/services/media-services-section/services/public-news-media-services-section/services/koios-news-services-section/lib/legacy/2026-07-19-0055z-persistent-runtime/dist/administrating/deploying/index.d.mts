export type DeployPathReading = Readonly<{
    id: "content" | "data" | "dist" | "site-admin";
    path: string;
    present: boolean;
    requiredFor: "local-production" | "local-build" | "remote-deploy";
}>;
export type DeployEndpointReading = Readonly<{
    domain: string;
    serviceName: string;
    kind: string;
    port: number;
    script: string;
    access?: string;
}>;
export type DeployRepositoryReading = Readonly<{
    path: string;
    git: boolean;
    dirty: boolean;
    status: readonly string[];
}>;
export type DeployEnvironmentName = "KOIOS_DEPLOY_HOST" | "KOIOS_DEPLOY_USER" | "KOIOS_DEPLOY_PATH" | "KOIOS_DEPLOY_SSH_KEY";
export type DeployEnvironmentSource = Readonly<{
    source: "process" | "deploy-env" | "missing";
    path?: string;
}>;
export type DeployEnvironmentSources = Readonly<Partial<Record<DeployEnvironmentName, DeployEnvironmentSource>>>;
export type DeployEnvironmentReading = Readonly<{
    name: DeployEnvironmentName;
    present: boolean;
    source: DeployEnvironmentSource["source"];
    sourcePath?: string;
    purpose: string;
    issue?: string;
}>;
export type DeployToolReading = Readonly<{
    name: "ssh" | "rsync";
    present: boolean;
    command: string;
    purpose: string;
    remediation?: string;
    version?: string;
    error?: string;
}>;
export type DeployWorkspaceDependency = Readonly<{
    name: string;
    spec: string;
}>;
export type DeployWorkspacePackage = Readonly<{
    name: string;
    directory: string;
    dependencies: readonly string[];
}>;
export type DeployWorkspaceSubset = Readonly<{
    root: string;
    rootFiles: readonly string[];
    packages: readonly DeployWorkspacePackage[];
    missingPackages: readonly string[];
    syncEntries: readonly string[];
}>;
export type DeployWorkspaceSourceReading = Readonly<{
    root: string;
    git: boolean;
    dirty: boolean;
    statusCount: number;
    status: readonly string[];
    truncated: boolean;
    paths: readonly string[];
    error?: string;
}>;
export type DeployRemoteReadiness = Readonly<{
    ready: boolean;
    gaps: readonly string[];
}>;
export type DeployPlanStep = Readonly<{
    id: string;
    phase: "local" | "sync" | "remote" | "probe";
    status: "ready" | "pending" | "blocked";
    summary: string;
    command?: string;
    reason?: string;
}>;
export type DeployPlanReading = Readonly<{
    kind: "koios.deploy-plan";
    mode: "workspace-source";
    siteRoot: string;
    target: string | null;
    remoteReadiness: DeployRemoteReadiness;
    tools: readonly DeployToolReading[];
    workspaceDependencies: readonly DeployWorkspaceDependency[];
    workspaceSubset: DeployWorkspaceSubset;
    workspaceSource: DeployWorkspaceSourceReading;
    steps: readonly DeployPlanStep[];
    warnings: readonly string[];
}>;
export type DeployStageReading = Readonly<{
    kind: "koios.deploy-stage";
    generatedAt: string;
    outDir: string;
    plan: DeployPlanReading;
    copied: Readonly<{
        rootFiles: readonly string[];
        packages: readonly string[];
        manifest: string;
    }>;
    excludedNames: readonly string[];
}>;
export type DeployStageOptions = Readonly<{
    siteRoot?: string;
    outDir?: string;
    now?: () => Date;
}>;
export type DeployRehearsalCommand = Readonly<{
    command: string;
    cwd: string;
    status: "passed" | "failed";
    exitCode: number | null;
    durationMs: number;
    stdoutTail: string;
    stderrTail: string;
}>;
export type DeployRehearsalReading = Readonly<{
    kind: "koios.deploy-rehearsal";
    generatedAt: string;
    ok: boolean;
    stage: DeployStageReading;
    commands: readonly DeployRehearsalCommand[];
    cleanup: Readonly<{
        requested: boolean;
        performed: boolean;
        reason: string;
    }>;
}>;
export type DeployRehearsalOptions = DeployStageOptions & Readonly<{
    keepStage?: boolean;
}>;
export type DeployShipCommand = Readonly<{
    id: "verify-local" | "preflight-remote-path" | "preflight-remote-runtime" | "sync-workspace-source" | "verify-remote-workspace-shape" | "install-build" | "configure-caddy-services" | "restart-services";
    command: string;
    status: "ready" | "pending" | "skipped" | "passed" | "failed";
    exitCode?: number | null;
    durationMs?: number;
    stdoutTail?: string;
    stderrTail?: string;
    reason?: string;
}>;
export type DeployShipReading = Readonly<{
    kind: "koios.deploy-ship";
    generatedAt: string;
    apply: boolean;
    allowDirty: boolean;
    ok: boolean;
    sourceReady: boolean;
    remoteReady: boolean;
    remoteReadiness: DeployRemoteReadiness;
    target: string | null;
    plan: DeployPlanReading;
    commands: readonly DeployShipCommand[];
    notes: readonly string[];
}>;
export type DeployRemoteCheckCommand = Readonly<{
    id: "remote-path" | "remote-runtime" | "remote-workspace-shape" | "remote-services";
    command: string;
    status: "skipped" | "passed" | "failed";
    exitCode?: number | null;
    durationMs?: number;
    stdoutTail?: string;
    stderrTail?: string;
    reason?: string;
}>;
export type DeployRemoteCheckReading = Readonly<{
    kind: "koios.deploy-remote-check";
    generatedAt: string;
    ok: boolean;
    remoteReady: boolean;
    remoteReadiness: DeployRemoteReadiness;
    target: string | null;
    plan: DeployPlanReading;
    commands: readonly DeployRemoteCheckCommand[];
    notes: readonly string[];
}>;
export type DeployShipOptions = Readonly<{
    siteRoot?: string;
    env?: NodeJS.ProcessEnv;
    envSources?: DeployEnvironmentSources;
    apply?: boolean;
    allowDirty?: boolean;
    now?: () => Date;
}>;
export type DeployRemoteCheckOptions = Readonly<{
    siteRoot?: string;
    env?: NodeJS.ProcessEnv;
    envSources?: DeployEnvironmentSources;
    now?: () => Date;
}>;
export type DeployDoctorReading = Readonly<{
    kind: "koios.deploy-doctor";
    generatedAt: string;
    siteRoot: string;
    packageName: string;
    localReady: boolean;
    remoteReady: boolean;
    remoteReadiness: DeployRemoteReadiness;
    ok: boolean;
    paths: readonly DeployPathReading[];
    scripts: readonly string[];
    missingScripts: readonly string[];
    endpoints: readonly DeployEndpointReading[];
    repositories: readonly DeployRepositoryReading[];
    workspaceSource: DeployWorkspaceSourceReading;
    environment: readonly DeployEnvironmentReading[];
    tools: readonly DeployToolReading[];
    plan: DeployPlanReading;
    commands: readonly string[];
    notes: readonly string[];
}>;
export type DeployDoctorOptions = Readonly<{
    siteRoot?: string;
    env?: NodeJS.ProcessEnv;
    envSources?: DeployEnvironmentSources;
    now?: () => Date;
}>;
export declare function koiosDeployDoctorReading(options?: DeployDoctorOptions): DeployDoctorReading;
export declare function renderKoiosDeployDoctorMarkdown(reading: DeployDoctorReading): string;
export declare function koiosDeployPlanReading(input?: Readonly<{
    siteRoot?: string;
    localReady?: boolean;
    remoteReady?: boolean;
    environment?: readonly DeployEnvironmentReading[];
    tools?: readonly DeployToolReading[];
    workspaceDependencies?: readonly DeployWorkspaceDependency[];
    workspaceSubset?: DeployWorkspaceSubset;
    workspaceSource?: DeployWorkspaceSourceReading;
    env?: NodeJS.ProcessEnv;
    envSources?: DeployEnvironmentSources;
}>): DeployPlanReading;
export declare function renderKoiosDeployPlanMarkdown(reading: DeployPlanReading): string;
export declare function stageKoiosDeployWorkspace(options?: DeployStageOptions): DeployStageReading;
export declare function renderKoiosDeployStageMarkdown(reading: DeployStageReading): string;
export declare function rehearseKoiosDeployWorkspace(options?: DeployRehearsalOptions): DeployRehearsalReading;
export declare function renderKoiosDeployRehearsalMarkdown(reading: DeployRehearsalReading): string;
export declare function shipKoiosDeployWorkspace(options?: DeployShipOptions): DeployShipReading;
export declare function renderKoiosDeployShipMarkdown(reading: DeployShipReading): string;
export declare function checkKoiosDeployRemote(options?: DeployRemoteCheckOptions): DeployRemoteCheckReading;
export declare function renderKoiosDeployRemoteCheckMarkdown(reading: DeployRemoteCheckReading): string;
//# sourceMappingURL=index.d.mts.map