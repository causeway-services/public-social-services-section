import { type Projector } from "../holography/index.mjs";
import { type JsonValue } from "./json.mjs";
import { type EAVTRecord } from "./eavt.mjs";
export declare const JSON_SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";
/** The schema projector: JSON resources whose path ends `.schema.json`. */
export declare const schemaProjector: Projector<JsonValue>;
export type JsonSchema = {
    readonly [key: string]: JsonValue;
};
export type JsonSchemaDocument = JsonValue;
export type SchemaAssertion = Readonly<{
    readonly [key: string]: JsonValue;
    readonly e: string;
    readonly a: string;
    readonly v: JsonValue;
    readonly t: string;
}>;
export type SchemaContradiction = Readonly<{
    readonly e: string;
    readonly a: string;
    readonly values: readonly JsonValue[];
    readonly assertions: readonly SchemaAssertion[];
}>;
export type SchemaCohereResult = Readonly<{
    readonly schema: JsonSchema | null;
    readonly contradictions: readonly SchemaContradiction[];
}>;
export type SchemaProjectResult = SchemaCohereResult;
export declare function canonicalJson(value: unknown): string;
export declare function schemaAssertionId(assertion: SchemaAssertion): string;
export declare function assertSchemaAssertion(value: unknown): SchemaAssertion;
export declare function parseSchemaAssertions(content: string): SchemaAssertion[];
export declare function serializeSchemaAssertions(assertions: readonly SchemaAssertion[]): string;
export declare function mergeSchemaAssertions(...traces: readonly (readonly SchemaAssertion[])[]): SchemaAssertion[];
export declare function unfoldSchema(schema: unknown, opts: {
    readonly base?: string;
    readonly t: string;
}): SchemaAssertion[];
export declare function foldSchema(assertions: readonly SchemaAssertion[]): JsonSchema;
export declare function cohereSchemaAssertions(assertions: readonly SchemaAssertion[]): SchemaCohereResult;
export declare function projectSchemaAssertions(assertions: readonly SchemaAssertion[], opts: {
    readonly id: string;
}): SchemaProjectResult;
export declare function schemaAssertionTriple(assertion: SchemaAssertion): Readonly<{
    readonly s: JsonValue;
    readonly p: JsonValue;
    readonly o: JsonValue;
}>;
export declare function schemaAssertionEavt(assertion: SchemaAssertion): EAVTRecord;
export declare function schemaAssertionEavtId(assertion: SchemaAssertion): string;
export declare function resolveJsonPointer(document: JsonValue, fragment: string): JsonValue | undefined;
//# sourceMappingURL=schema.d.mts.map