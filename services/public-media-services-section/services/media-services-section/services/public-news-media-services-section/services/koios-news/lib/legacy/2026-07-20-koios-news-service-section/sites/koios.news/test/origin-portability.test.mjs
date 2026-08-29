import assert from "node:assert/strict";
import test from "node:test";

import {
  inspectNavigation,
  makeHtmlOriginPortable,
  originPortabilityDefects,
} from "../dist/administrating/deploying/origin-portability.mjs";

const CANONICAL = "https://koios.news";
const PREVIEW = "https://koios-news-shadow.morgan-sennhauser.workers.dev";

test("portable HTML keeps canonical identity while moving browser delivery to the active origin", () => {
  const input = [
    '<link rel="canonical" href="https://koios.news/posts/example">',
    '<link rel="alternate" href="https://koios.news/feed.xml">',
    '<meta property="og:url" content="https://koios.news/posts/example">',
    '<a href="https://koios.news/posts/next?from=example#claim">Next</a>',
    '<img src="https://koios.news/fingerprints/example.svg">',
    '<a href="https://example.org/source">Source</a>',
    '<script type="application/ld+json">{"url":"https://koios.news/posts/example"}</script>',
  ].join("\n");

  const output = makeHtmlOriginPortable(input, CANONICAL);
  assert.match(output, /rel="canonical" href="https:\/\/koios\.news\/posts\/example"/u);
  assert.match(output, /rel="alternate" href="\/feed\.xml"/u);
  assert.match(output, /content="https:\/\/koios\.news\/posts\/example"/u);
  assert.match(output, /href="\/posts\/next\?from=example#claim"/u);
  assert.match(output, /src="\/fingerprints\/example\.svg"/u);
  assert.match(output, /href="https:\/\/example\.org\/source"/u);
  assert.match(output, /\{"url":"https:\/\/koios\.news\/posts\/example"\}/u);
  assert.deepEqual(originPortabilityDefects(output, CANONICAL), []);
});

test("preview navigation resolves internal links on preview and reports canonical escapes", () => {
  const portable = inspectNavigation('<a href="/posts/next">Next</a><a href="https://example.org/source">Source</a>', `${PREVIEW}/topics/news`, CANONICAL);
  assert.deepEqual(portable.internalTargets, ["/posts/next"]);
  assert.deepEqual(portable.canonicalEscapes, []);

  const escaped = inspectNavigation('<a href="https://koios.news/posts/next">Next</a>', `${PREVIEW}/`, CANONICAL);
  assert.deepEqual(escaped.internalTargets, []);
  assert.deepEqual(escaped.canonicalEscapes, ["https://koios.news/posts/next"]);
});
