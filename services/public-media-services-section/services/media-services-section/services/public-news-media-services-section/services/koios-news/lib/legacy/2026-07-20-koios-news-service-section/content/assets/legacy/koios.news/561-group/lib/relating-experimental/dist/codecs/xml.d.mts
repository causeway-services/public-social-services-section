/**
 * codecs/xml — the XML serialization branch: a well-formed-by-construction XML
 * writer (the syntactic floor) plus its holography projector. SVG restricts this
 * node (see ./svg); other XML vocabularies may too. The whole subtree (escape,
 * markup, projector) is consolidated here, flat on the new base.
 */
import { type Projector } from "../holography/index.mjs";
/** Escape a string for XML text content (`&`, `<`, `>`). */
export declare function escapeXmlText(value: string): string;
/** Escape a string for a double-quoted XML attribute value (text plus `"`/`'`). */
export declare function escapeXmlAttr(value: string): string;
/** Whether a string is a well-formed XML name (element or attribute). */
export declare function isXmlName(name: string): boolean;
/** Return a name unchanged when it is a well-formed XML name, else throw. */
export declare function requireXmlName(name: string): string;
/** A single attribute value; `null`/`undefined` attributes are dropped. */
export type XmlAttrValue = string | number | null | undefined;
/** An attribute bag: name → value, dropped where the value is null/undefined. */
export type XmlAttributes = Readonly<Record<string, XmlAttrValue>>;
/** An element node: a validated name, its attributes, and its children. */
export interface XmlElement {
    readonly kind: "element";
    readonly name: string;
    readonly attributes: XmlAttributes;
    readonly children: readonly XmlNode[];
}
/** A text node; its value is escaped on serialization. */
export interface XmlText {
    readonly kind: "text";
    readonly value: string;
}
/** A comment node; `--` is forbidden inside an XML comment. */
export interface XmlComment {
    readonly kind: "comment";
    readonly value: string;
}
export type XmlNode = XmlElement | XmlText | XmlComment;
/** Build an element node, lifting bare strings to text and dropping nullish children. */
export declare function element(name: string, attributes?: XmlAttributes, children?: ReadonlyArray<XmlNode | string | null | undefined | false>): XmlElement;
/** Build a text node. */
export declare function text(value: string): XmlText;
/** Build a comment node. */
export declare function comment(value: string): XmlComment;
/** Serialize a node to a well-formed XML string (empty elements self-close). */
export declare function serialize(node: XmlNode): string;
/** Options for a complete XML document. */
export interface DocumentOptions {
    readonly declaration?: boolean;
    readonly doctype?: string;
}
/** Render a complete XML document: optional declaration/doctype then the root. */
export declare function document(root: XmlElement, options?: DocumentOptions): string;
/** The XML serialization as a holography projector over `XmlNode`. */
export declare const xmlProjector: Projector<XmlNode>;
//# sourceMappingURL=xml.d.mts.map