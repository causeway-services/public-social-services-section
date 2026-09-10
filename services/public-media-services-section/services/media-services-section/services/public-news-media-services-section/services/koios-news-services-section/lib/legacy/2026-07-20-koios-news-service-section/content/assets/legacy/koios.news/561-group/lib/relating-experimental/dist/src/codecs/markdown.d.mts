import { type Projector } from "../holography/index.mjs";
import { type JsonValue } from "./json.mjs";
import { type JsonSchema, type SchemaAssertion } from "./schema.mjs";
export type MarkdownFrontmatterFormat = "yaml" | "toml" | null;
export type FrontmatterModality = "MUST" | "SHOULD" | "MAY";
export type FrontmatterCharge = "potential" | "active" | "absurd";
export type MarkdownAssertion = Readonly<{
    readonly [key: string]: JsonValue;
    readonly e: string;
    readonly a: string;
    readonly v: JsonValue;
    readonly t: string;
}>;
export type FrontmatterChargeEntry = Readonly<{
    readonly predicate: "has-frontmatter" | "yaml-frontmatter" | "toml-frontmatter";
    readonly modality: FrontmatterModality;
    readonly depth: number;
    readonly value: FrontmatterCharge;
    readonly evidence: readonly [readonly string[], readonly string[]];
}>;
export type FrontmatterConformance = Readonly<{
    readonly settled: true;
    readonly conformant: boolean;
    readonly format: MarkdownFrontmatterFormat;
    readonly charges: readonly FrontmatterChargeEntry[];
    readonly notes: readonly string[];
}>;
export type MarkdownParseResult = Readonly<{
    readonly frontmatter: Readonly<Record<string, JsonValue>> | null;
    readonly format: MarkdownFrontmatterFormat;
    readonly body: string;
}>;
export type MarkdownDataform = Readonly<{
    readonly subject: string;
    readonly format: MarkdownFrontmatterFormat;
    readonly conformant: boolean;
    readonly verdict: FrontmatterConformance;
    readonly frontmatter: Readonly<Record<string, JsonValue>>;
    readonly body: string;
    readonly assertions: readonly MarkdownAssertion[];
    readonly cells: readonly Readonly<{
        readonly cell: Readonly<{
            readonly subject: string;
            readonly predicate: string;
            readonly object: JsonValue;
        }>;
        readonly charge: Readonly<{
            readonly value: readonly [true, false];
            readonly evidence: readonly [readonly string[], readonly string[]];
        }>;
    }>[];
}>;
export type DocumentTypeDefinition = Readonly<{
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly filename: string;
    readonly placement: string;
    readonly bodySkeleton: string;
    readonly schemaFragment?: JsonSchema;
}>;
export declare const DOC_TYPE_STAMP = "tx-document-types";
export declare const markdownProjector: Projector<JsonValue>;
export declare const markdownDocumentSchemaFragment: JsonSchema;
export declare const documentTypeDefinitions: readonly DocumentTypeDefinition[];
export declare function parseMarkdown(text: string): MarkdownParseResult;
export declare function frontmatterConformance(text: string, opts?: {
    readonly witness?: string;
}): FrontmatterConformance;
export declare function markdownDataform(text: string, opts: {
    readonly witness: string;
    readonly subject?: string;
}): MarkdownDataform;
export declare function documentTypeFragment(definition: DocumentTypeDefinition): JsonSchema;
export declare function documentTypeAssertions(definition: DocumentTypeDefinition, opts?: {
    readonly base?: string;
    readonly t?: string;
}): SchemaAssertion[];
export declare function allDocumentTypeAssertions(opts?: {
    readonly base?: string;
    readonly t?: string;
}): readonly SchemaAssertion[];
//# sourceMappingURL=markdown.d.mts.map