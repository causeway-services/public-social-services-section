import type { ManifestCarrier } from "@emsenn/computing";
import { type DependencyGraph, type Resolution, type WorkspaceCarrier } from "./host-neutral-carriers.mjs";
export type WorkspaceManifest = Readonly<{
    locator: string;
    manifest: ManifestCarrier;
}>;
export declare function decodePnpmWorkspace(text: string, manifests?: readonly WorkspaceManifest[], id?: string): WorkspaceCarrier;
export declare function encodePnpmWorkspace(workspace: WorkspaceCarrier): string;
export declare function decodePnpmLock(text: string, manifests?: readonly ManifestCarrier[]): Resolution;
export declare function encodePnpmLockResolution(resolution: Resolution): string;
export declare function dependencyGraphFromManifests(manifests: readonly ManifestCarrier[], resolution?: Resolution): DependencyGraph;
export declare function topologicalSortDependencyGraph(graph: DependencyGraph): readonly (readonly string[])[];
export declare function dependencyGraphH1(graph: DependencyGraph): number;
//# sourceMappingURL=js-mark.d.mts.map