/**
 * codecs/xml — the XML serialization branch: a well-formed-by-construction XML
 * writer (the syntactic floor) plus its holography projector. SVG restricts this
 * node (see ./svg); other XML vocabularies may too. The whole subtree (escape,
 * markup, projector) is consolidated here, flat on the new base.
 */
import { define } from "../holography/index.mjs";
/* ── escape ─────────────────────────────────────────────────────────────── */
/** Escape a string for XML text content (`&`, `<`, `>`). */
export function escapeXmlText(value) {
    return value.replace(/[&<>]/g, (character) => character === "&" ? "&amp;" : character === "<" ? "&lt;" : "&gt;");
}
/** Escape a string for a double-quoted XML attribute value (text plus `"`/`'`). */
export function escapeXmlAttr(value) {
    return escapeXmlText(value).replace(/["']/g, (character) => character === '"' ? "&quot;" : "&#39;");
}
const XML_NAME = /^[A-Za-z_:][A-Za-z0-9._:-]*$/;
/** Whether a string is a well-formed XML name (element or attribute). */
export function isXmlName(name) {
    return XML_NAME.test(name);
}
/** Return a name unchanged when it is a well-formed XML name, else throw. */
export function requireXmlName(name) {
    if (!isXmlName(name))
        throw new TypeError(`xml: ${JSON.stringify(name)} is not a well-formed XML name`);
    return name;
}
/** Build an element node, lifting bare strings to text and dropping nullish children. */
export function element(name, attributes = {}, children = []) {
    const kids = [];
    for (const child of children) {
        if (child === null || child === undefined || child === false)
            continue;
        kids.push(typeof child === "string" ? text(child) : child);
    }
    return { kind: "element", name: requireXmlName(name), attributes, children: kids };
}
/** Build a text node. */
export function text(value) {
    return { kind: "text", value };
}
/** Build a comment node. */
export function comment(value) {
    if (value.includes("--"))
        throw new TypeError("xml: a comment may not contain '--'");
    return { kind: "comment", value };
}
function serializeAttributes(attributes) {
    let out = "";
    for (const [name, value] of Object.entries(attributes)) {
        if (value === null || value === undefined)
            continue;
        out += ` ${requireXmlName(name)}="${escapeXmlAttr(String(value))}"`;
    }
    return out;
}
/** Serialize a node to a well-formed XML string (empty elements self-close). */
export function serialize(node) {
    switch (node.kind) {
        case "text":
            return escapeXmlText(node.value);
        case "comment":
            return `<!--${node.value}-->`;
        case "element": {
            const attrs = serializeAttributes(node.attributes);
            if (node.children.length === 0)
                return `<${node.name}${attrs}/>`;
            return `<${node.name}${attrs}>${node.children.map(serialize).join("")}</${node.name}>`;
        }
    }
}
/** Render a complete XML document: optional declaration/doctype then the root. */
export function document(root, options = {}) {
    const declaration = options.declaration ? `<?xml version="1.0" encoding="UTF-8"?>\n` : "";
    const doctype = options.doctype ? `${options.doctype}\n` : "";
    return `${declaration}${doctype}${serialize(root)}\n`;
}
/* ── projector ──────────────────────────────────────────────────────────── */
function recognizesXml(content) {
    const head = content.trimStart();
    return head.startsWith("<?xml") || /^<[A-Za-z_:]/.test(head);
}
/** The XML serialization as a holography projector over `XmlNode`. */
export const xmlProjector = define({
    type: "xml",
    recognize: (resource) => recognizesXml(resource.content),
    write: (nodes) => nodes.map(serialize).join(""),
});
//# sourceMappingURL=xml.mjs.map