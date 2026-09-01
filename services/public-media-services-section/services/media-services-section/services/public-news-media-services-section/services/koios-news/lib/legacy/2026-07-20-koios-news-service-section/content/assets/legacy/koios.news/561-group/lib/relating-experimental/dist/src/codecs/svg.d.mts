/**
 * codecs/svg — the relational SVG codec: charged, placed relational data ⇄ a
 * self-describing SVG, the categorical-diagram analog of the Semantic Hypertext
 * Packet. SVG is a restriction of XML (see ./xml), so this codec inherits the
 * XML writer and adds the relational vocabulary (morphism, document builders,
 * normalize, project, profiles, projector), consolidated here flat on the new
 * base. Layout is NOT here: a caller supplies each box's centre.
 */
import { type Projector } from "../holography/index.mjs";
import { type ChargeCarrier, type ChargeValueName } from "../articulating/predicating/positing/bilattice-charge.mjs";
import { serialize, type XmlElement, type XmlNode } from "./xml.mjs";
/** The shape a node morphism is drawn as. */
export type NodeShape = "rect" | "rounded" | "parallelogram" | "stadium";
/** The visual form of a node morphism. */
export interface ShapeMorphism {
    readonly shape: NodeShape;
    readonly fill: string;
    readonly stroke: string;
    readonly dash?: string;
    readonly strokeWidth?: number;
}
/** The visual form of an edge morphism. */
export interface EdgeMorphism {
    readonly stroke?: string;
    readonly dash?: string;
    readonly marker?: string;
}
/** Resolve a node group / edge kind to its visual form. */
export interface ShapeMorphismRegistry {
    shape(group: string): ShapeMorphism;
    edge(kind: string): EdgeMorphism;
}
/** The neutral fallback node form: a rounded slate box. */
export declare const DEFAULT_SHAPE: ShapeMorphism;
export interface ShapeMorphismSpec {
    readonly shapes?: Readonly<Record<string, ShapeMorphism>>;
    readonly edges?: Readonly<Record<string, EdgeMorphism>>;
    readonly fallback?: ShapeMorphism;
}
/** Build a registry over an explicit shape/edge vocabulary. */
export declare function shapeMorphismRegistry(spec?: ShapeMorphismSpec): ShapeMorphismRegistry;
/** A reasonable default registry: rounded slate boxes, plain arrows. */
export declare function defaultShapeMorphisms(): ShapeMorphismRegistry;
/** Box geometry: a centre and a size. The codec is layout-agnostic. */
export interface Box {
    readonly cx: number;
    readonly cy: number;
    readonly w: number;
    readonly h: number;
}
export interface SvgRootOptions {
    readonly width: number;
    readonly height: number;
    readonly title?: string;
    readonly desc?: string;
    readonly fontFamily?: string;
}
/** The `<svg>` root: namespaced, with a viewBox, role, and optional title/desc. */
export declare function svgRoot(options: SvgRootOptions, children: readonly XmlNode[]): XmlElement;
export interface ShapeStyle {
    readonly fill: string;
    readonly stroke: string;
    readonly dash?: string;
    readonly strokeWidth?: number;
}
/** A node shape for a kind, sized to a box. */
export declare function nodeShape(shape: NodeShape, box: Box, style: ShapeStyle): XmlElement;
/** A curved edge from the bottom of one box to the top of another, with an arrow. */
export declare function edgePath(from: Box, to: Box, style: {
    readonly stroke?: string;
    readonly dash?: string;
    readonly marker: string;
}, dataAttrs: Record<string, string | number | null | undefined>): XmlElement;
/** Multi-line centred text: `label` split on `\n` becomes vertically-centred tspans. */
export declare function textLines(label: string, cx: number, cy: number, fill: string, fontSize?: number): XmlElement;
/** A `<g>` group with arbitrary attributes. */
export declare function group(attributes: Record<string, string | number | null | undefined>, children: readonly XmlNode[]): XmlElement;
/** Wrap a node in a top-targeting `<a href>` (interactive profiles only). */
export declare function anchor(href: string, child: XmlNode): XmlElement;
/** A `<rect>` background filling the document. */
export declare function background(width: number, height: number, fill: string): XmlElement;
/** An arrow-head `<marker>` definition. */
export declare function arrowMarker(id: string, fill: string): XmlElement;
/** A hollow-triangle `<marker>` (UML generalization / "extends"). */
export declare function hollowTriangleMarker(id: string, fill: string, stroke: string): XmlElement;
/** A `<defs>` block. */
export declare function defs(children: readonly XmlNode[]): XmlElement;
/** A node of the relational SVG: a charged cell (e/a/v) with a box and morphism. */
export interface PlacedCell {
    readonly e: string;
    readonly a?: string;
    readonly v?: string;
    readonly group: string;
    readonly label: string;
    readonly title?: string;
    readonly href?: string;
    readonly focus?: boolean;
    readonly data?: Readonly<Record<string, string | number>>;
    readonly charge: ChargeCarrier;
    readonly box: Box;
}
/** An edge of the relational SVG: a charged relation from one node to another. */
export interface PlacedEdge {
    readonly from: string;
    readonly to: string;
    readonly kind?: string;
    readonly href?: string;
    readonly charge: ChargeCarrier;
    readonly fromBox: Box;
    readonly toBox: Box;
}
/** The normalized form the projector renders. */
export interface SvgDataform {
    readonly width: number;
    readonly height: number;
    readonly title?: string;
    readonly desc?: string;
    readonly nodes: readonly PlacedCell[];
    readonly edges: readonly PlacedEdge[];
    readonly background?: string;
    readonly textColor?: string;
    readonly edgeColor?: string;
}
/** The default charge for a plainly-asserted datum: affirmed (potential). */
export declare function affirmedCharge(): ChargeCarrier;
/** The bilattice value-name of a charge (potential | active | stable | absurd). */
export declare const chargeValueOf: (c: ChargeCarrier) => ChargeValueName;
/** A compact charge glyph: ⊤ both, ⊥ neither, t truth-only, f falsity-only. */
export declare function chargeMark(c: ChargeCarrier): "t" | "f" | "⊥" | "⊤";
/** A contested (stable) charge projected to one side; otherwise the value itself. */
export declare function calmChargeOf(c: ChargeCarrier, projection?: "supported" | "negated"): ChargeValueName;
/** The bilattice charge attributes for a cell or edge (data-positive/.../mark). */
export declare function chargeAttributes(c: ChargeCarrier): Record<string, string>;
export interface LintViolation {
    readonly rule: string;
    readonly detail: string;
}
export interface LintReport {
    readonly ok: boolean;
    readonly violations: readonly LintViolation[];
}
/** An inhabitant profile of the relational SVG codec. */
export interface Profile {
    readonly name: string;
    readonly permitsAnchors: boolean;
    readonly permitsDataAttributes: boolean;
    lint(svg: string): LintReport;
}
/** The default, interactive web profile: clickable, fully self-describing. */
export declare const svgInteractiveProfile: Profile;
/** The RFC 7996 static profile: embeddable in documents, no interactivity. */
export declare const rfc7996Profile: Profile;
export interface ProjectSvgOptions {
    readonly registry?: ShapeMorphismRegistry;
    readonly profile?: Profile;
    readonly declaration?: boolean;
}
/** Project a placed, charged dataform into a self-describing SVG string. */
export declare function projectSvg(dataform: SvgDataform, options?: ProjectSvgOptions): string;
export { serialize };
/** The SVG vocabulary as a holography projector restricting XML. */
export declare const svgProjector: Projector<XmlNode>;
//# sourceMappingURL=svg.d.mts.map