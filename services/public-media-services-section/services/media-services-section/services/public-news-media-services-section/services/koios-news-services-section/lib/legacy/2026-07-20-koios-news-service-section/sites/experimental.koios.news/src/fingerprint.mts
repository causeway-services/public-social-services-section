import { crc32, deflateSync } from "node:zlib";

import { document, element, type XmlNode } from "@emsenn/metroplat/codecs/text/xml";
import {
  background,
  chargeAttributes,
  group,
  svgRoot,
} from "@emsenn/metroplat/codecs/text/xml/svg";
import { radialFromValuation } from "@emsenn/metroplat/codecs/text/xml/svg/radial";
import {
  layout,
  type RadialDataform,
  type RadialLayoutCarrier,
  type RadialLayoutProjection,
} from "@emsenn/metroplat/projections/layout";
import { chargeToSvgPattern, chargeToVisual } from "@emsenn/metroplat/projections/visual-valuation";

import type { KoiosItem, KoiosMasthead, KoiosPost } from "./content.mjs";

export const FINGERPRINT_IMAGE_WIDTH = 1200;
export const FINGERPRINT_IMAGE_HEIGHT = 675;
export const FINGERPRINT_WIDTH = FINGERPRINT_IMAGE_WIDTH;
export const FINGERPRINT_HEIGHT = FINGERPRINT_IMAGE_HEIGHT;

const RADIAL_SIZE = 675;
const RADIAL_OFFSET_X = 0;
const RADIAL_OFFSET_Y = 0;
const PANEL_X = 724;
const BACKGROUND = "#111827";
const PANEL = "#f8fafc";
const INK = "#111827";
const STROKE = "#e5e7eb";

type Rgb = readonly [number, number, number];

function slugPath(slug: string, extension: "svg" | "png" | "json"): string {
  return `/fingerprints/${encodeURIComponent(slug)}.${extension}`;
}

export function fingerprintImageUrl(item: KoiosItem, masthead: KoiosMasthead, extension: "svg" | "png" | "json" = "png"): string {
  return `${masthead.siteUrl}${slugPath(item.slug, extension)}`;
}

function fingerprintDataform(post: KoiosPost): RadialDataform {
  return radialFromValuation(post.claims.valuation, {
    title: `Koios.News fingerprint: ${post.frontMatter.title}`,
    desc: `A generative visual valuation of the Koios.News claim projection for ${post.slug}.`,
    size: RADIAL_SIZE,
    background: BACKGROUND,
  });
}

function radialLayout(post: KoiosPost): RadialLayoutProjection {
  return layout(fingerprintDataform(post), {
    kind: "radial",
    center: "apex",
    margin: 36,
    holeRatio: 0.12,
  });
}

function stableContradictionPattern(): XmlNode {
  const pattern = chargeToSvgPattern("stable");
  if (pattern === undefined) return group({}, []);
  return element("defs", {}, [
    element("pattern", {
      id: pattern.id,
      patternUnits: "userSpaceOnUse",
      width: pattern.width,
      height: pattern.height,
    }, [
      element("rect", { width: pattern.width, height: pattern.height, fill: "#b3202c" }),
      element("path", {
        d: pattern.path,
        stroke: pattern.stroke,
        "stroke-width": pattern.strokeWidth,
        opacity: pattern.strokeOpacity,
      }),
    ]),
  ]);
}

function renderSegment(placed: RadialLayoutCarrier): XmlNode {
  const segment = placed.carrier;
  const visual = chargeToVisual(segment.charge);
  const pattern = chargeToSvgPattern(segment.charge);
  const fill = pattern === undefined ? visual.color : `url(#${pattern.id})`;
  const attrs = {
    d: placed.region.path,
    fill,
    "fill-opacity": visual.opacity,
    stroke: STROKE,
    "stroke-width": 1,
    ...(placed.region.full ? { "fill-rule": "evenodd" } : {}),
    "data-e": segment.e,
    "data-orbit": placed.orbit,
    "data-visual-hue": visual.hue,
    "data-visual-lightness": visual.lightness,
    "data-visual-opacity": visual.opacity,
    "data-visual-saturation": visual.saturation,
    "data-visual-pattern": visual.pattern,
    ...chargeAttributes(segment.charge),
  };
  return group({}, [
    element("title", {}, [segment.title ?? segment.label ?? segment.e]),
    element("path", attrs),
  ]);
}

function claimBands(post: KoiosPost, item: KoiosItem): XmlNode[] {
  const claims = post.claims.memes.slice(0, 12);
  return claims.map((meme, index) => {
    const visual = chargeToVisual(meme.charge);
    const y = 92 + index * 38;
    return group({ "data-claim-band": index, "data-value": visual.value }, [
      element("rect", {
        x: PANEL_X,
        y,
        width: 392,
        height: 24,
        fill: visual.color,
        "fill-opacity": visual.opacity,
      }),
      element("rect", {
        x: PANEL_X,
        y,
        width: 392,
        height: 24,
        fill: "none",
        stroke: visual.borderColor,
        "stroke-width": 1,
      }),
    ]);
  }).concat([
    element("text", {
      x: PANEL_X,
      y: 560,
      fill: INK,
      "font-size": 22,
      "font-weight": 700,
    }, ["KOIOS.NEWS"]),
    element("text", {
      x: PANEL_X,
      y: 594,
      fill: "#374151",
      "font-size": 15,
    }, [item.slug]),
  ]);
}

export function articleFingerprintSvg(post: KoiosPost, item: KoiosItem): string {
  const radial = radialLayout(post);
  const rings = radial.rings.map((ring) =>
    group({ "data-ordinal": ring.ordinal, ...(ring.label === undefined ? {} : { "data-ring": ring.label }) }, ring.carriers.map(renderSegment)));
  const centerDisc = element("circle", {
    cx: radial.cx,
    cy: radial.cy,
    r: radial.holeRadius.toFixed(2),
    fill: PANEL,
    stroke: STROKE,
    "stroke-width": 1,
  });
  const root = svgRoot(
    {
      width: FINGERPRINT_IMAGE_WIDTH,
      height: FINGERPRINT_IMAGE_HEIGHT,
      title: `Koios.News fingerprint for ${item.headline}`,
      desc: `A generated visual identity derived from the post claim valuation for ${item.slug}.`,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    },
    [
      stableContradictionPattern(),
      background(FINGERPRINT_IMAGE_WIDTH, FINGERPRINT_IMAGE_HEIGHT, BACKGROUND),
      element("rect", { x: 690, y: 0, width: 510, height: FINGERPRINT_IMAGE_HEIGHT, fill: PANEL }),
      group({
        "data-codec": "radial",
        "data-fingerprint": "koios.news.visual-valuation.v1",
        "data-slug": item.slug,
        transform: `translate(${RADIAL_OFFSET_X} ${RADIAL_OFFSET_Y})`,
      }, [centerDisc, ...rings]),
      ...claimBands(post, item),
    ],
  );
  return document(root, { declaration: true }).trimEnd();
}

export function articleFingerprintJson(post: KoiosPost, item: KoiosItem, masthead: KoiosMasthead): string {
  const png = fingerprintImageUrl(item, masthead, "png");
  const svg = fingerprintImageUrl(item, masthead, "svg");
  return `${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${item.url}#koios-fingerprint`,
    name: `Koios.News fingerprint for ${item.headline}`,
    caption: "A generative visual valuation derived from the post claim projection.",
    url: png,
    contentUrl: png,
    encodingFormat: "image/png",
    width: FINGERPRINT_IMAGE_WIDTH,
    height: FINGERPRINT_IMAGE_HEIGHT,
    representativeOfPage: true,
    isBasedOn: svg,
    about: {
      "@type": "NewsArticle",
      "@id": item.url,
      headline: item.headline,
      datePublished: item.published,
    },
    creator: {
      "@type": "Organization",
      name: masthead.publisher,
      url: masthead.siteUrl,
    },
  }, null, 2)}\n`;
}

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace(/^#/u, "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

function blendPixel(pixels: Buffer, x: number, y: number, color: Rgb, alpha = 1): void {
  if (x < 0 || x >= FINGERPRINT_IMAGE_WIDTH || y < 0 || y >= FINGERPRINT_IMAGE_HEIGHT) return;
  const at = (y * FINGERPRINT_IMAGE_WIDTH + x) * 3;
  pixels[at] = Math.round(pixels[at]! * (1 - alpha) + color[0] * alpha);
  pixels[at + 1] = Math.round(pixels[at + 1]! * (1 - alpha) + color[1] * alpha);
  pixels[at + 2] = Math.round(pixels[at + 2]! * (1 - alpha) + color[2] * alpha);
}

function paintRect(pixels: Buffer, x0: number, y0: number, w: number, h: number, color: Rgb, alpha = 1): void {
  const left = Math.max(0, Math.floor(x0));
  const top = Math.max(0, Math.floor(y0));
  const right = Math.min(FINGERPRINT_IMAGE_WIDTH, Math.ceil(x0 + w));
  const bottom = Math.min(FINGERPRINT_IMAGE_HEIGHT, Math.ceil(y0 + h));
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) blendPixel(pixels, x, y, color, alpha);
  }
}

function paintCircle(pixels: Buffer, cx: number, cy: number, radius: number, color: Rgb): void {
  const left = Math.max(0, Math.floor(cx - radius));
  const top = Math.max(0, Math.floor(cy - radius));
  const right = Math.min(FINGERPRINT_IMAGE_WIDTH - 1, Math.ceil(cx + radius));
  const bottom = Math.min(FINGERPRINT_IMAGE_HEIGHT - 1, Math.ceil(cy + radius));
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= radius) blendPixel(pixels, x, y, color);
    }
  }
}

function angleBetween(angle: number, start: number, end: number, full: boolean): boolean {
  if (full) return true;
  const tau = Math.PI * 2;
  const normalized = (angle - start + tau) % tau;
  const span = (end - start + tau) % tau;
  return normalized <= span;
}

function paintSegment(pixels: Buffer, placed: RadialLayoutCarrier): void {
  const visual = chargeToVisual(placed.carrier.charge);
  const color = hexToRgb(visual.color);
  const cx = RADIAL_OFFSET_X + RADIAL_SIZE / 2;
  const cy = RADIAL_OFFSET_Y + RADIAL_SIZE / 2;
  const outer = placed.region.outerRadius;
  const inner = placed.region.seatedInnerRadius;
  const left = Math.max(0, Math.floor(cx - outer));
  const top = Math.max(0, Math.floor(cy - outer));
  const right = Math.min(FINGERPRINT_IMAGE_WIDTH - 1, Math.ceil(cx + outer));
  const bottom = Math.min(FINGERPRINT_IMAGE_HEIGHT - 1, Math.ceil(cy + outer));
  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const radius = Math.hypot(dx, dy);
      if (radius < inner || radius > outer) continue;
      const angle = Math.atan2(dy, dx);
      if (angleBetween(angle, placed.region.startAngle, placed.region.endAngle, placed.region.full)) {
        blendPixel(pixels, x, y, color, visual.opacity);
      }
    }
  }
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(pixels: Buffer): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(FINGERPRINT_IMAGE_WIDTH, 0);
  ihdr.writeUInt32BE(FINGERPRINT_IMAGE_HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const stride = FINGERPRINT_IMAGE_WIDTH * 3;
  const raw = Buffer.alloc((stride + 1) * FINGERPRINT_IMAGE_HEIGHT);
  for (let y = 0; y < FINGERPRINT_IMAGE_HEIGHT; y += 1) {
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

export function articleFingerprintPng(post: KoiosPost, _item?: KoiosItem): Buffer {
  const radial = radialLayout(post);
  const pixels = Buffer.alloc(FINGERPRINT_IMAGE_WIDTH * FINGERPRINT_IMAGE_HEIGHT * 3);
  paintRect(pixels, 0, 0, FINGERPRINT_IMAGE_WIDTH, FINGERPRINT_IMAGE_HEIGHT, hexToRgb(BACKGROUND));
  paintRect(pixels, 690, 0, 510, FINGERPRINT_IMAGE_HEIGHT, hexToRgb(PANEL));
  for (const ring of radial.rings) {
    for (const carrier of ring.carriers) paintSegment(pixels, carrier);
  }
  paintCircle(pixels, radial.cx, radial.cy, radial.holeRadius, hexToRgb(PANEL));
  for (const [index, meme] of post.claims.memes.slice(0, 12).entries()) {
    const visual = chargeToVisual(meme.charge);
    paintRect(pixels, PANEL_X, 92 + index * 38, 392, 24, hexToRgb(visual.color), visual.opacity);
  }
  return encodePng(pixels);
}
