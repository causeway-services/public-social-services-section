/**
 * codecs/html — the Semantic Hypertext Packet (SHP) codec: a carrier⇄HTML
 * holography projector.
 *
 * SHP is a finite, deterministic, MONOTONE projection of a settled carrier
 * frontier into HTML, where `class` names a morphism identity and `data-*`
 * attributes carry carrier coordinates (entity/attribute/value + bilattice
 * sides), with RFC 7992 as one pluggable inhabitant profile. `project` is the
 * write direction (cells → HTML), `markup` the read direction (HTML → charged
 * cells), and `htmlProjector` binds both into the holography kernel — so the
 * markup boundary settles through the same charge algebra as everything else.
 *
 * The whole subtree (escape, morphism, markup, lint, profiles, normalize,
 * project, packet, projector) is consolidated here, flat on the new base.
 */
import { type Projector } from "../holography/index.mjs";
import { type ChargeCarrier, type ChargeValueName } from "../articulating/predicating/positing/bilattice-charge.mjs";
import { type JsonValue } from "./json.mjs";
/** Values the SHP codec is allowed to inspect and stringify at its boundary. */
export type HtmlValue = JsonValue | {
    readonly const: JsonValue;
};
/** Escape a value for HTML text content (`&`, `<`, `>`). */
export declare function escapeText(value: HtmlValue): string;
/** Escape a value for a quoted HTML attribute (text escaping plus `"` and `'`). */
export declare function escapeAttr(value: HtmlValue): string;
/** A URL/id-safe slug derived from a value, falling back to "cell" when empty. */
export declare function slug(value: HtmlValue): string;
/** Unwrap a marked value: the inner `const` when present, else the value. */
export declare function unmark(value: HtmlValue | undefined): JsonValue | undefined;
/** The bilattice value-name of a charge — relating's four-valued naming. */
export declare const chargeValueOf: (c: ChargeCarrier) => ChargeValueName;
/** A compact glyph for a charge: ⊤ both, ⊥ neither, t truth-only, f falsity-only. */
export declare function chargeMark(c: ChargeCarrier): "t" | "f" | "⊥" | "⊤";
/** A contested (stable) charge projected to one side: supported→potential, negated→active. */
export declare function calmChargeOf(c: ChargeCarrier, projection?: "supported" | "negated"): ChargeValueName;
/** A charge is contested when truth and falsity are both present (stable). */
export declare function isContested(c: ChargeCarrier): boolean;
/** A single subject-predicate-object claim before any charge is attached. */
export type ShpCell = {
    subject: HtmlValue;
    predicate: HtmlValue;
    object?: HtmlValue;
};
/** A claim paired with its charge over the bilattice. */
export type ChargedCell = {
    cell: ShpCell;
    charge: ChargeCarrier;
};
/** One entry within a section: a built `ChargedCell` or a raw witness record. */
export type SectionEntry = ChargedCell | {
    predicate?: HtmlValue;
    object?: HtmlValue;
    citation?: HtmlValue | readonly HtmlValue[];
    affirmedBy?: HtmlValue | readonly HtmlValue[];
    deniedBy?: HtmlValue | readonly HtmlValue[];
};
/** A read grouped by stance: affirmed / denied / contradicted entry lists. */
export type Section = {
    affirmed?: readonly SectionEntry[];
    denied?: readonly SectionEntry[];
    contradicted?: readonly SectionEntry[];
};
/** String-keyed HTML dataform metadata carried only at the HTML boundary. */
export type HtmlMetadata = {
    readonly [key: string]: HtmlValue;
};
/** Optional rendering settings carried onto a dataform. */
export type DataformOptions = {
    title?: string;
    observer?: HtmlValue;
    metadata?: HtmlMetadata;
    mode?: "calm" | "audit";
    projection?: "supported" | "negated";
};
/** The normalized form the projector renders. */
export type ShpDataform = DataformOptions & {
    subject: HtmlValue;
    cells: readonly ChargedCell[];
};
/** A located region from a detector report. */
export type DetectSpan = {
    tier: HtmlValue;
    start: HtmlValue;
    end: HtmlValue;
};
/** A detector rule that matched. */
export type DetectRule = {
    text: HtmlValue;
    severity: HtmlValue;
};
/** A single detector finding. */
export type DetectFinding = {
    span: DetectSpan;
    rule: DetectRule;
    charge: ChargeCarrier;
};
/** A detector report. */
export type DetectReport = {
    cells?: readonly DetectFinding[];
};
/** Normalize a `Section` into an `ShpDataform`. */
export declare function fromSection(section: Section, opts?: DataformOptions & {
    subject?: HtmlValue;
}): ShpDataform;
/** Build an `ShpDataform` from a subject and already-charged cells. */
export declare function fromCells(subject: HtmlValue, cells?: readonly ChargedCell[], opts?: DataformOptions): ShpDataform;
/** Normalize a `DetectReport` into an `ShpDataform`. */
export declare function fromDetect(report: DetectReport, opts?: DataformOptions & {
    subject?: HtmlValue;
}): ShpDataform;
/** A class-to-predicate binding. */
export interface Morphism {
    readonly className: string;
    readonly predicate: HtmlValue;
}
/** The correspondence between carrier predicates and packet classes. */
export interface MorphismRegistry {
    className(predicate: HtmlValue): string;
    predicate(className: string): HtmlValue;
}
/** The default registry: class = slug(predicate); inverse returns the class. */
export declare function defaultMorphisms(): MorphismRegistry;
/** A registry over an explicit class↔predicate vocabulary. */
export declare function morphismRegistry(morphisms: readonly Morphism[]): MorphismRegistry;
/** Project a settled `ShpDataform` into a finite HTML semantic-hypertext packet. */
export declare function project(dataform: ShpDataform, morphisms?: MorphismRegistry): string;
/** The SHP projection. `shp` is the historical name for `project`. */
export declare const shp: typeof project;
/** Decode an SHP HTML packet into the charged cells it projects. */
export declare function markup(html: string): ChargedCell[];
/** The SHP packet object: a finite, content-addressed projection witness. */
export interface ShpPacket {
    readonly kind: "shp.packet";
    readonly source: HtmlValue;
    readonly frontier: readonly string[];
    readonly settlement: HtmlValue;
    readonly projection: string;
    readonly html: string;
    readonly evidence: HtmlValue;
    readonly identity: string;
}
/** The inputs to pack. */
export interface PackDeclaration {
    readonly source: HtmlValue;
    readonly settlement?: HtmlValue;
    readonly evidence?: HtmlValue;
    readonly projection?: string;
    readonly morphisms?: MorphismRegistry;
}
/** Project a dataform into an ShpPacket with a deterministic content-address. */
export declare function pack(dataform: ShpDataform, decl: PackDeclaration): ShpPacket;
/** The canonical identity of a cell: its [entity, attribute, value] coordinates. */
export declare function cellKey(cell: Partial<ShpCell>): string;
/** A deterministic content-address (FNV-1a, 64-bit, hex). Pure; no I/O. */
export declare function address(content: string): string;
export type LintViolation = {
    rule: string;
    severity: "error" | "warning";
    message: string;
};
export type LintReport = {
    violations: readonly LintViolation[];
};
/** Lint an HTML string against the SHP packet-safety and RFC 7992 rules. */
export declare function lint(html: string): LintReport;
/** An inhabitant profile constraining an SHP packet to a concrete HTML shape. */
export interface Profile {
    readonly name: string;
    readonly classes: readonly string[];
    lint(html: string): LintReport;
}
/** RFC 7992 structural classes — its <span class> morphism identities. */
export declare const RFC7992_CLASSES: readonly ["bcp14", "xref", "eref", "relref", "selfRef", "artwork", "sourcecode"];
/** The union of RFC 7992 structural class names. */
export type Rfc7992Class = (typeof RFC7992_CLASSES)[number];
/** The RFC 7992 inhabitant profile. */
export declare const rfc7992Profile: Profile;
/** The html codec as a holography projector over `ChargedCell`. */
export declare const htmlProjector: Projector<ChargedCell>;
//# sourceMappingURL=html.d.mts.map