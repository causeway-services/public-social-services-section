// link.mts — the Link field (RFC 8288).
//
// Semantic value: a list of link-values (target plus parameters). Wire
// form: the field text. The pair is a RETRACTION: parseLinkHeader
// lowercases parameter names, forgets quoting style, and keeps one
// value per parameter name, so parseLinkHeader ∘ linkHeader = id on
// parsed values.
export function linkHeader(links) {
    return links.map(({ href, ...attrs }) => {
        const params = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join("; ");
        return `<${href}>; ${params}`;
    }).join(", ");
}
export function parseLinkHeader(value) {
    if (!value)
        return Object.freeze([]);
    const links = [];
    for (const part of value.split(/,(?=\s*<)/)) {
        const match = /^\s*<([^>]*)>\s*(.*)$/.exec(part);
        if (!match)
            continue;
        const params = {};
        const paramRe = /;\s*([a-zA-Z0-9*_-]+)\s*=\s*("[^"]*"|[^;,\s]+)/g;
        let param;
        while ((param = paramRe.exec(match[2] ?? "")) !== null) {
            let text = param[2];
            if (text.startsWith("\"") && text.endsWith("\""))
                text = text.slice(1, -1);
            params[param[1].toLowerCase()] = text;
        }
        links.push(Object.freeze({ href: match[1].trim(), params: Object.freeze(params) }));
    }
    return Object.freeze(links);
}
//# sourceMappingURL=link.mjs.map