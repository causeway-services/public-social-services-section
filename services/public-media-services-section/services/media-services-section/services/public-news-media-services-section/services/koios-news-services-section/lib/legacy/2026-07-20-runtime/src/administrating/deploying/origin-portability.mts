/**
 * Keep Koios's public identity canonical while allowing one immutable HTML
 * artifact to operate under any admitted delivery origin.
 *
 * Canonical metadata and structured data remain absolute. Browser-facing
 * internal navigation and resource attributes become root-relative, so a
 * reader on a shadow, candidate, or successor origin stays on that carrier.
 */

const CANONICAL_REL = "canonical";
const DELIVERY_ATTRIBUTES = Object.freeze(new Map<string, readonly string[]>([
  ["a", ["href"]],
  ["area", ["href"]],
  ["audio", ["src"]],
  ["embed", ["src"]],
  ["form", ["action"]],
  ["iframe", ["src"]],
  ["img", ["src"]],
  ["input", ["src"]],
  ["link", ["href"]],
  ["object", ["data"]],
  ["script", ["src"]],
  ["source", ["src"]],
  ["track", ["src"]],
  ["video", ["src", "poster"]],
]));

export type OriginPortabilityDefect = Readonly<{
  tag: string;
  attribute: string;
  value: string;
}>;

export type NavigationInspection = Readonly<{
  internalTargets: readonly string[];
  canonicalEscapes: readonly string[];
}>;

function openingTags(html: string): IterableIterator<RegExpMatchArray> {
  return html.matchAll(/<([a-z][a-z0-9-]*)(?:\s[^<>]*?)?>/giu);
}

function attributePattern(name: string): RegExp {
  return new RegExp(`(\\b${name}\\s*=\\s*)(["'])(.*?)\\2`, "iu");
}

function attributeValue(tag: string, name: string): string | undefined {
  return tag.match(attributePattern(name))?.[3];
}

function hasCanonicalRel(tag: string): boolean {
  return (attributeValue(tag, "rel") ?? "")
    .toLowerCase()
    .split(/\s+/u)
    .includes(CANONICAL_REL);
}

function isAbsoluteReference(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/iu.test(value) || value.startsWith("//");
}

function rootRelativeCanonicalReference(value: string, canonicalOrigin: string): string | undefined {
  if (!isAbsoluteReference(value)) return undefined;
  let resolved: URL;
  try { resolved = new URL(value, canonicalOrigin); } catch { return undefined; }
  if (resolved.origin !== canonicalOrigin) return undefined;
  return `${resolved.pathname}${resolved.search}${resolved.hash}` || "/";
}

function rewriteAttribute(tag: string, name: string, canonicalOrigin: string): string {
  const pattern = attributePattern(name);
  const match = tag.match(pattern);
  const value = match?.[3];
  if (value === undefined) return tag;
  const portable = rootRelativeCanonicalReference(value, canonicalOrigin);
  if (portable === undefined) return tag;
  return tag.replace(pattern, `$1$2${portable}$2`);
}

/** Rewrite only browser delivery attributes, never metadata or script bodies. */
export function makeHtmlOriginPortable(html: string, canonicalOriginValue: string): string {
  const canonicalOrigin = new URL(canonicalOriginValue).origin;
  return html.replace(/<([a-z][a-z0-9-]*)(?:\s[^<>]*?)?>/giu, (tag, rawName: string) => {
    const name = rawName.toLowerCase();
    const attributes = DELIVERY_ATTRIBUTES.get(name);
    if (attributes === undefined) return tag;
    if (name === "link" && hasCanonicalRel(tag)) return tag;
    return attributes.reduce((current, attribute) => rewriteAttribute(current, attribute, canonicalOrigin), tag);
  });
}

/** Find canonical-origin URLs that would make a portable carrier call home. */
export function originPortabilityDefects(html: string, canonicalOriginValue: string): readonly OriginPortabilityDefect[] {
  const canonicalOrigin = new URL(canonicalOriginValue).origin;
  const defects: OriginPortabilityDefect[] = [];
  for (const match of openingTags(html)) {
    const tag = match[0];
    const name = match[1]!.toLowerCase();
    const attributes = DELIVERY_ATTRIBUTES.get(name);
    if (attributes === undefined || (name === "link" && hasCanonicalRel(tag))) continue;
    for (const attribute of attributes) {
      const value = attributeValue(tag, attribute);
      if (value !== undefined && rootRelativeCanonicalReference(value, canonicalOrigin) !== undefined) {
        defects.push(Object.freeze({ tag: name, attribute, value }));
      }
    }
  }
  return Object.freeze(defects);
}

/** Resolve clickable links exactly as a browser on the supplied document URL. */
export function inspectNavigation(html: string, documentUrlValue: string, canonicalOriginValue: string): NavigationInspection {
  const documentUrl = new URL(documentUrlValue);
  const canonicalOrigin = new URL(canonicalOriginValue).origin;
  const internalTargets = new Set<string>();
  const canonicalEscapes = new Set<string>();
  for (const match of openingTags(html)) {
    const tag = match[0];
    const name = match[1]!.toLowerCase();
    if (name !== "a" && name !== "area") continue;
    const value = attributeValue(tag, "href");
    if (value === undefined || value.trim() === "" || value.startsWith("#")) continue;
    let resolved: URL;
    try { resolved = new URL(value, documentUrl); } catch { continue; }
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") continue;
    if (resolved.origin === documentUrl.origin) {
      internalTargets.add(`${resolved.pathname}${resolved.search}` || "/");
    } else if (resolved.origin === canonicalOrigin) {
      canonicalEscapes.add(resolved.href);
    }
  }
  return Object.freeze({
    internalTargets: Object.freeze([...internalTargets].sort()),
    canonicalEscapes: Object.freeze([...canonicalEscapes].sort()),
  });
}
