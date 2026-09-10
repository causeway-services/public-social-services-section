/**
 * Shared graph-to-SVG projection for organizing packages.
 */
export type DiagramNode = Readonly<{
    id: string;
    label: string;
    group?: string;
    focus?: boolean;
    href?: string;
    title?: string;
}>;
export type DiagramEdge = Readonly<{
    from: string;
    to: string;
    kind?: string;
    label?: string;
}>;
export type DiagramPaletteEntry = Readonly<{
    fill: string;
    stroke: string;
}>;
export type DiagramGraph = Readonly<{
    nodes: readonly DiagramNode[];
    edges: readonly DiagramEdge[];
}>;
export type DiagramRenderOptions = Readonly<{
    title?: string;
    palette?: Readonly<Record<string, DiagramPaletteEntry>>;
    defaultColor?: DiagramPaletteEntry;
    nodeWidth?: number;
    nodeHeight?: number;
    hGap?: number;
    vGap?: number;
    margin?: number;
    edgeStyles?: Readonly<Record<string, Readonly<{
        stroke: string;
    }>>>;
}>;
export declare function graphDiagramSvg(graph: DiagramGraph, options?: DiagramRenderOptions): string;
//# sourceMappingURL=diagramming.d.mts.map