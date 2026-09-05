/**
 * codecs/svg — the relational SVG codec: charged, placed relational data ⇄ a
 * self-describing SVG, the categorical-diagram analog of the Semantic Hypertext
 * Packet. SVG is a restriction of XML (see ./xml), so this codec inherits the
 * XML writer and adds the relational vocabulary (morphism, document builders,
 * normalize, project, profiles, projector), consolidated here flat on the new
 * base. Layout is NOT here: a caller supplies each box's centre.
 */
import { restrict } from "../holography/index.mjs";
import { charge, chargeValue, valueOf, chargeValueName, } from "../articulating/predicating/positing/bilattice-charge.mjs";
import { document, element, serialize, xmlProjector } from "./xml.mjs";
/** The neutral fallback node form: a rounded slate box. */
export const DEFAULT_SHAPE = Object.freeze({
    shape: "rounded",
    fill: "#1b3a4b",
    stroke: "#3f7d9c",
});
/** Build a registry over an explicit shape/edge vocabulary. */
export function shapeMorphismRegistry(spec = {}) {
    const shapes = spec.shapes ?? {};
    const edges = spec.edges ?? {};
    const fallback = spec.fallback ?? DEFAULT_SHAPE;
    return {
        shape: (group) => shapes[group] ?? fallback,
        edge: (kind) => edges[kind] ?? {},
    };
}
/** A reasonable default registry: rounded slate boxes, plain arrows. */
export function defaultShapeMorphisms() {
    return shapeMorphismRegistry();
}
/* ── document ───────────────────────────────────────────────────────────── */
const SVG_NS = "http://www.w3.org/2000/svg";
const fixed = (value) => value.toFixed(1);
/** The `<svg>` root: namespaced, with a viewBox, role, and optional title/desc. */
export function svgRoot(options, children) {
    const head = [];
    if (options.title !== undefined)
        head.push(element("title", {}, [options.title]));
    if (options.desc !== undefined)
        head.push(element("desc", {}, [options.desc]));
    return element("svg", {
        xmlns: SVG_NS,
        viewBox: `0 0 ${options.width} ${options.height}`,
        width: options.width,
        height: options.height,
        "font-family": options.fontFamily ?? "ui-monospace,Menlo,monospace",
        role: "img",
    }, [...head, ...children]);
}
/** A node shape for a kind, sized to a box. */
export function nodeShape(shape, box, style) {
    const x = box.cx - box.w / 2;
    const y = box.cy - box.h / 2;
    const base = {
        fill: style.fill,
        stroke: style.stroke,
        "stroke-width": style.strokeWidth ?? 1.5,
        "stroke-dasharray": style.dash ?? null,
    };
    switch (shape) {
        case "rect":
            return element("rect", { x: fixed(x), y: fixed(y), width: fixed(box.w), height: fixed(box.h), ...base });
        case "rounded":
            return element("rect", { x: fixed(x), y: fixed(y), width: fixed(box.w), height: fixed(box.h), rx: 4, ...base });
        case "stadium":
            return element("rect", { x: fixed(x), y: fixed(y), width: fixed(box.w), height: fixed(box.h), rx: fixed(box.h / 2), ...base });
        case "parallelogram": {
            const slant = Math.min(12, box.w / 4);
            const points = `${fixed(x + slant)},${fixed(y)} ${fixed(x + box.w)},${fixed(y)} ${fixed(x + box.w - slant)},${fixed(y + box.h)} ${fixed(x)},${fixed(y + box.h)}`;
            return element("polygon", { points, ...base });
        }
    }
}
/** A curved edge from the bottom of one box to the top of another, with an arrow. */
export function edgePath(from, to, style, dataAttrs) {
    const x1 = from.cx;
    const y1 = from.cy + from.h / 2;
    const x2 = to.cx;
    const y2 = to.cy - to.h / 2;
    const my = (y1 + y2) / 2;
    const d = `M${fixed(x1)},${fixed(y1)} C${fixed(x1)},${fixed(my)} ${fixed(x2)},${fixed(my)} ${fixed(x2)},${fixed(y2)}`;
    return element("path", {
        d,
        fill: "none",
        stroke: style.stroke ?? null,
        "stroke-dasharray": style.dash ?? null,
        "marker-end": `url(#${style.marker})`,
        ...dataAttrs,
    });
}
/** Multi-line centred text: `label` split on `\n` becomes vertically-centred tspans. */
export function textLines(label, cx, cy, fill, fontSize = 12) {
    const lines = label.split("\n");
    const lineHeight = 13;
    const top = cy - ((lines.length - 1) * lineHeight) / 2 + 4;
    const tspans = lines.map((line, index) => element("tspan", { x: fixed(cx), y: fixed(top + index * lineHeight) }, [line]));
    return element("text", { "text-anchor": "middle", "font-size": fontSize, fill }, tspans);
}
/** A `<g>` group with arbitrary attributes. */
export function group(attributes, children) {
    return element("g", attributes, children);
}
/** Wrap a node in a top-targeting `<a href>` (interactive profiles only). */
export function anchor(href, child) {
    return element("a", { href, target: "_top" }, [child]);
}
/** A `<rect>` background filling the document. */
export function background(width, height, fill) {
    return element("rect", { x: 0, y: 0, width, height, fill });
}
/** An arrow-head `<marker>` definition. */
export function arrowMarker(id, fill) {
    return element("marker", { id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }, [element("path", { d: "M0,0 L10,5 L0,10 z", fill })]);
}
/** A hollow-triangle `<marker>` (UML generalization / "extends"). */
export function hollowTriangleMarker(id, fill, stroke) {
    return element("marker", { id, viewBox: "0 0 12 12", refX: 11, refY: 6, markerWidth: 11, markerHeight: 11, orient: "auto-start-reverse" }, [element("path", { d: "M0,0 L12,6 L0,12 z", fill, stroke, "stroke-width": 1 })]);
}
/** A `<defs>` block. */
export function defs(children) {
    return element("defs", {}, children);
}
/** The default charge for a plainly-asserted datum: affirmed (potential). */
export function affirmedCharge() {
    return charge(chargeValue("potential"), [[], []]);
}
const present = (c, side) => c.value[side].name === "present";
/** The bilattice value-name of a charge (potential | active | stable | absurd). */
export const chargeValueOf = (c) => chargeValueName(valueOf(c));
/** A compact charge glyph: ⊤ both, ⊥ neither, t truth-only, f falsity-only. */
export function chargeMark(c) {
    const value = chargeValueOf(c);
    if (value === "stable")
        return "⊤";
    if (value === "absurd")
        return "⊥";
    return value === "potential" ? "t" : "f";
}
/** A contested (stable) charge projected to one side; otherwise the value itself. */
export function calmChargeOf(c, projection = "supported") {
    const value = chargeValueOf(c);
    if (value !== "stable")
        return value;
    return projection === "negated" ? "active" : "potential";
}
/** The bilattice charge attributes for a cell or edge (data-positive/.../mark). */
export function chargeAttributes(c) {
    return {
        "data-positive": String(present(c, 0)),
        "data-negative": String(present(c, 1)),
        "data-value": chargeValueOf(c),
        "data-calm": calmChargeOf(c),
        "data-mark": chargeMark(c),
    };
}
const FORBIDDEN = [
    { rule: "no-script", pattern: /<script[\s>]/i, detail: "RFC 7996 forbids <script>" },
    { rule: "no-anchor", pattern: /<a[\s>]/i, detail: "RFC 7996 forbids interactive <a> links" },
    { rule: "no-event-handler", pattern: /\son[a-z]+="/i, detail: "RFC 7996 forbids on* event-handler attributes" },
    { rule: "no-foreign-object", pattern: /<foreignObject[\s>]/i, detail: "RFC 7996 forbids <foreignObject>" },
];
function rfc7996Lint(svg) {
    const violations = [];
    for (const { rule, pattern, detail } of FORBIDDEN) {
        if (pattern.test(svg))
            violations.push({ rule, detail });
    }
    return { ok: violations.length === 0, violations };
}
function interactiveLint(svg) {
    const ok = /<svg[\s>]/i.test(svg);
    return { ok, violations: ok ? [] : [{ rule: "is-svg", detail: "not an <svg> document" }] };
}
/** The default, interactive web profile: clickable, fully self-describing. */
export const svgInteractiveProfile = Object.freeze({
    name: "svg-interactive",
    permitsAnchors: true,
    permitsDataAttributes: true,
    lint: interactiveLint,
});
/** The RFC 7996 static profile: embeddable in documents, no interactivity. */
export const rfc7996Profile = Object.freeze({
    name: "rfc7996",
    permitsAnchors: false,
    permitsDataAttributes: false,
    lint: rfc7996Lint,
});
/* ── project ────────────────────────────────────────────────────────────── */
const ARROW = "svg-arrow";
const EXTENDS = "svg-extends";
function nodeDataAttributes(node, profile) {
    const attrs = { class: node.group, "data-e": node.e };
    if (node.a !== undefined)
        attrs["data-a"] = node.a;
    if (node.v !== undefined)
        attrs["data-v"] = node.v;
    if (node.focus)
        attrs["data-focus"] = "true";
    if (!profile.permitsDataAttributes)
        return attrs;
    for (const [key, value] of Object.entries(node.data ?? {}))
        attrs[`data-${key}`] = value;
    Object.assign(attrs, chargeAttributes(node.charge));
    return attrs;
}
function renderNode(node, registry, profile, textColor) {
    const morphism = registry.shape(node.group);
    const shape = nodeShape(morphism.shape, node.box, {
        fill: morphism.fill,
        stroke: node.focus ? "#f0f6fc" : morphism.stroke,
        ...(node.focus ? { strokeWidth: 3 } : morphism.strokeWidth === undefined ? {} : { strokeWidth: morphism.strokeWidth }),
        ...(morphism.dash === undefined ? {} : { dash: morphism.dash }),
    });
    const title = element("title", {}, [node.title ?? node.label.replace(/\n/g, " ")]);
    const text = textLines(node.label, node.box.cx, node.box.cy, textColor);
    const box = group(nodeDataAttributes(node, profile), [title, shape, text]);
    return node.href !== undefined && profile.permitsAnchors ? anchor(node.href, box) : box;
}
function renderEdge(edge, registry, profile, edgeColor) {
    const morphism = registry.edge(edge.kind ?? "");
    const dataAttrs = { "data-from": edge.from, "data-to": edge.to };
    if (edge.kind !== undefined)
        dataAttrs["data-kind"] = edge.kind;
    if (profile.permitsDataAttributes)
        Object.assign(dataAttrs, chargeAttributes(edge.charge));
    const path = edgePath(edge.fromBox, edge.toBox, {
        stroke: morphism.stroke ?? edgeColor,
        marker: morphism.marker ?? ARROW,
        ...(morphism.dash === undefined ? {} : { dash: morphism.dash }),
    }, dataAttrs);
    return edge.href !== undefined && profile.permitsAnchors ? anchor(edge.href, path) : path;
}
function describe(dataform) {
    const byGroup = dataform.nodes.reduce((acc, node) => {
        acc[node.group] = (acc[node.group] ?? 0) + 1;
        return acc;
    }, {});
    const groups = Object.entries(byGroup).map(([g, count]) => `${g} ${count}`).join(", ");
    return `${dataform.nodes.length} nodes, ${dataform.edges.length} edges. By group: ${groups}.`;
}
/** Project a placed, charged dataform into a self-describing SVG string. */
export function projectSvg(dataform, options = {}) {
    const registry = options.registry ?? defaultShapeMorphisms();
    const profile = options.profile ?? svgInteractiveProfile;
    const edgeColor = dataform.edgeColor ?? "#3a4452";
    const textColor = dataform.textColor ?? "#e6edf3";
    const backgroundColor = dataform.background ?? "#0d1117";
    const markers = defs([arrowMarker(ARROW, edgeColor), hollowTriangleMarker(EXTENDS, backgroundColor, "#8b949e")]);
    const edgeGroup = group({ stroke: edgeColor, "stroke-width": 1, fill: "none", opacity: 0.55 }, dataform.edges.map((edge) => renderEdge(edge, registry, profile, edgeColor)));
    const nodeGroup = group({}, dataform.nodes.map((node) => renderNode(node, registry, profile, textColor)));
    const root = svgRoot({
        width: dataform.width,
        height: dataform.height,
        title: dataform.title ?? "relational diagram",
        desc: dataform.desc ?? describe(dataform),
    }, [background(dataform.width, dataform.height, backgroundColor), markers, edgeGroup, nodeGroup]);
    return document(root, { ...(options.declaration ? { declaration: true } : {}) }).trimEnd();
}
export { serialize };
/* ── projector ──────────────────────────────────────────────────────────── */
/** The SVG vocabulary as a holography projector restricting XML. */
export const svgProjector = restrict(xmlProjector, {
    type: "svg.xml",
    recognize: (resource) => /<svg[\s>]/.test(resource.content),
});
//# sourceMappingURL=svg.mjs.map