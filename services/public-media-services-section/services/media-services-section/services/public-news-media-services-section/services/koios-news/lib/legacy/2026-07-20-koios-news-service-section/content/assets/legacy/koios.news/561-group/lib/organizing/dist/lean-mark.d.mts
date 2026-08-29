import { type DependencyGraph } from "./host-neutral-carriers.mjs";
type LeanDeclarationProofStatus = "proved" | "assumed" | "admitted" | "unknown";
type LeanDeclarationLike = Readonly<{
    kind: string;
    name: string;
    line?: number;
    proofStatus?: LeanDeclarationProofStatus;
}>;
type LeanModuleLike = Readonly<{
    id: string;
    imports: readonly string[];
    declarations: readonly LeanDeclarationLike[];
}>;
export type LeanTheoremSpineEntry = Readonly<{
    module: string;
    name: string;
    kind: "theorem" | "lemma";
    line?: number;
    proofStatus?: LeanDeclarationProofStatus;
}>;
export type LeanTheoremSpine = Readonly<{
    kind: "organizing.lean.theorem-spine";
    rootModule: string;
    entries: readonly LeanTheoremSpineEntry[];
    admitted: readonly string[];
}>;
export type LeanTheoremSpineCoverage = Readonly<{
    kind: "organizing.lean.theorem-spine-coverage";
    declared: number;
    present: number;
    missing: readonly string[];
    extra: readonly string[];
    admitted: readonly string[];
}>;
export declare function leanDependencyGraphFromModules(modules: readonly LeanModuleLike[]): DependencyGraph;
export declare function topologicalSortLeanModules(graph: DependencyGraph): readonly (readonly string[])[];
export declare function leanDependencyGraphH1(graph: DependencyGraph): number;
export declare function leanTheoremSpine(modules: readonly LeanModuleLike[], rootModule?: string, names?: readonly string[]): LeanTheoremSpine;
export declare function leanTheoremSpineCoverage(spine: LeanTheoremSpine, declarationIndex: Readonly<{
    declarations: readonly string[];
}>): LeanTheoremSpineCoverage;
export {};
//# sourceMappingURL=lean-mark.d.mts.map