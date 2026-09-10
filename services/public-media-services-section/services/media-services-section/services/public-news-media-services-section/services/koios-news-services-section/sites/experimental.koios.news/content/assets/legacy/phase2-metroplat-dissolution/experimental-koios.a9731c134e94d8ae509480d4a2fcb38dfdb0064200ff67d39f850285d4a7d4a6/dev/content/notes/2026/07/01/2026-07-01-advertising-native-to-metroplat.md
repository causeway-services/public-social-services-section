# Advertising, built into metroplat rather than pasted into koios.news

This is a build plan, not a decision record and not a math note. It exists so an
agent picking this up does not have to re-derive the prior-art research or
re-litigate what got ruled out. Read this whole file before writing any code.

## Why this exists

Koios.News used to run with a working brutalist theme and live ads (AdSense +
A-Ads) on the VPS, on a now-decommissioned codebase
(`561-group/sites/koios.news`, git remote `git@github.com:emsenn/koios-news.git`,
last commit `a11ba52`, dependencies on `@emsenn/relating` /
`@emsenn/producing-content` / `@emsenn/organizing-*`, all decommissioned per
`sites/koios.news/CLAUDE.md`). Pointing the live site back at that codebase was
tried and reverted the same session — it crash-loops on
`ERR_PACKAGE_PATH_NOT_EXPORTED` because `561-group/lib/animating` imports
`@emsenn/relating/articulating/predicating/positing/settling`, a subpath that
`561-group/lib/relating`'s current `package.json` `exports` no longer has (the
two packages drifted apart on 2026-06-23 and nobody rebuilt the chain after).
That codebase is reference material only — read it, never import it, never
re-point the live services at it.

The theming half of this is already done correctly, natively, in the current
package: `sites/koios.news/src/surface.mts` already expresses the old
brutalist "mill" palette (`KOIOS_THEME`, regime
`"koios.news/mill-dark-web-2"`: surface `#141310`, ink `#ece8de`, accent
`#ff5a42`, Archivo/Georgia) through metroplat's real `ThemedPageProfile`
feeling-rules system, not copy-pasted CSS. Advertising is the missing half.
This note is the plan for building it the same way: as metroplat-native
carriers/projections/witnesses, not as hand-rolled HTML string concatenation
living only inside the koios.news package.

## Hard constraints on this work (read before writing code)

Two things were established the hard way this session and apply to every file
this plan touches:

1. **No invented algebra.** `FOUR` (the bilattice in
   `lib/calculus/predicating/positing/bilattice-charge.mts`) is real,
   independently re-run and confirmed to satisfy its claimed laws, and has a
   genuine current Lean proof behind the Klein-four gauge part
   (`Obsmetrologia (“Infomaterial” at time of writing).Positing.Gauge.K4.isGroup` in
   `sites/infomaterial.emsenn.net/Infomaterial/Language/Positing/Gauge.lean`,
   verified sorry-free, axioms `[propext]` only). But there is **no existing
   corpus grounding for advertising revenue or money as a mathematical
   object** — checked, nothing in `sites/infomaterial.emsenn.net/dev/content`.
   Do not make ad revenue, ad admission, or anything else in this feature
   `ChargeValueName`-valued, quantale-valued, or otherwise dressed in FOUR
   machinery, with **one specific exception** carved out below (§3). Plain
   integers and plain booleans are the correct, honest tool for everything
   else here.
2. **No appeals to outside authority in comments or data.** Do not add any
   field or comment that cites an external theorem/project name as the source
   of a claim's truth (the pattern `"theorem": "RelMath.…"` /
   `"sourceModule": "RelMath.…"` found — 527 times across 27 files in
   `sites/metroplat.emsenn.net/lib` and `src` — citing a decommissioned,
   unbuilt Lean project, sometimes backing functions that don't actually
   compute the thing they claim to witness). If a function claims to verify
   something, it must actually compute that check against its real input, in
   this codebase, right now. If you want to reference the Lean project, you
   must independently verify the declaration exists and is sorry-free via the
   `infomaterial-lean-lsp` MCP tools first — the way `K4.isGroup` was checked
   above — never by writing a plausible-sounding name. Every comment in new
   code is plain JSDoc about calling the function: parameters, return shape,
   behavior. No narration of what was decided, proven, or derived, and no
   reference to this note, this task, or any prior implementation.

## Current blocking state (check before assuming this builds)

As of 2026-07-01, `sites/koios.news` does not typecheck
(`pnpm -C sites/koios.news run check` fails). `@emsenn/metroplat`'s HTTP
service surface was restructured the same day
(`sites/metroplat.emsenn.net/docs/directory-taxonomy-audit-2026-07-01.md`):
`Context`/`App`/`Resource` moved to
`src/projections/protocols/http/app-surface.mts`, `Repr`/`HandlerResult`/
`jsonRepr`/`textRepr` moved to
`src/projections/protocols/http/representation.mts`, and neither subpath is
currently in metroplat's `package.json` `exports` map. `feedPath` (used by
`sites/koios.news/src/views.mts`, imported from
`@emsenn/metroplat/services/filesystem-store`) no longer exists anywhere in
metroplat's source. The taxonomy audit's corrections log points at
`sites/hole` (`sites/metroplat.emsenn.net/src/carriers/sites`,
`metroplat/running/route-site-descriptor`) as the emerging intended pattern —
a site supplies a route descriptor, `services/http/main` binds it — rather
than the hand-rolled `Context`/`App`/`Resource` style `surface.mts` currently
uses. Whoever picks up §5/§6 below should resolve this first, and should write
any new HTTP surface (the impression beacon, `/ads.txt`) against whatever
pattern that resolution lands on, not the pattern that's mid-replacement.

## Prior art (read the real files, not this summary, before implementing)

- `561-group/sites/koios.news/src/theme.mts` (VPS, decommissioned) — AdSense
  slots keyed by position, A-Ads via `chooseAAdsUnit(key, units)` (hash
  rotation over a unit pool keyed by `${canonical}:${placement}`), per-article
  override via frontmatter `articleAdUnits.aAds`, `suppressMastheadAAds`.
- `sites/koios.news/src/surface.mts` (local, current, lines ~699–766) — the
  live simplified version: `adClient()`, `adSlotId(position)`, `aAdsUnits()`,
  `adsEnabled()`, `adSlotHtml(position)`, `adLoaderHtml()`, `adsTxt()`, all
  reading `KOIOS_NEWS_AD_CLIENT` / `KOIOS_NEWS_AD_SLOT_<POSITION>` /
  `KOIOS_NEWS_A_ADS_UNITS` from `process.env` directly. This is the thing
  being replaced by §1–§2 below.
- `561-group/lib/producing-content/src/content-mill/advertising.mts`
  (decommissioned, but the best-shaped prior art here) — `AdProviderSchema`
  (`"adsense" | "a-ads"`), `AdPerformanceInputSchema` (`provider`, `path`
  matching `^/[\x21-\x7e]{0,512}$`, `day` as `YYYY-MM-DD`, optional `section`,
  optional `tags[]`, optional `impressions`/`clicks`/`revenueMicros` as
  non-negative integers), `AdPerformanceEventSchema` (same plus `kind`, `at`,
  with the optional counters defaulted to required non-negative integers),
  `AdPerformanceBucketSchema` (`impressions`, `clicks`, `revenueMicros`,
  `rpmMicros`, `cpcMicros`), `AdPerformanceReadingSchema` (`eventCount`,
  `totals`, `byProvider`, `bySection`, `byTag` — all `AdPerformanceBucket` —
  plus `constraints: string[]`). `AD_PERFORMANCE_CONSTRAINTS` there is a
  two-item literal string array stating the privacy guarantees as data. Keep
  this schema shape; do not keep the TypeBox/`@emsenn/relating` dependency —
  reimplement it against metroplat's own `carrierFrom`/schema literal
  pattern.
- `561-group/sites/koios.news/src/researching/writing/editing/publishing/managing/advertising/index.mts`
  (decommissioned) — the single best idea here: `AdvertisingPolicy` is data
  (`{enabled, client?, aAdsUnits, adsTxt?, privacyParagraph}`), and both the
  privacy paragraph and the CSP header (`advertisingContentSecurityPolicy`)
  are pure derivations of that one policy object rather than separately
  hand-maintained. Keep this shape.

## 1. `lib/advertising` (pure, no Node, no invented algebra)

New directory in `sites/metroplat.emsenn.net`, sibling to `lib/calculus`,
`lib/closure`, etc. Per the six-root taxonomy in
`docs/directory-taxonomy-audit-2026-07-01.md`, this must have zero Node
imports (no `node:fs`, no `process`).

- `AdvertisingPolicy`: `{ enabled: boolean; providers: { adsense?: { client:
  string }; aAds?: { units: readonly string[] } }; constraints: readonly
  string[] }`. `constraints` is literal string data carried on the value, the
  same move `AD_PERFORMANCE_CONSTRAINTS` made — e.g. "Aggregate ad-performance
  records only; never IP addresses, user agents, cookies, or reader
  identifiers." Do not hardcode these strings elsewhere; every downstream
  consumer (privacy page, CSP, README) reads them off the policy value.
- `advertisingPolicy(providers)` — pure constructor: `enabled` is true iff at
  least one provider is configured.
- `advertisingPrivacyParagraph(policy)` — pure function, policy in, prose
  string out. No provider-specific prose hardcoded outside this function.
- `advertisingCspFragment(policy)` — pure function returning the
  script-src/img-src/connect-src/frame-src host allowances implied by which
  providers are enabled. This is the only place that knows AdSense needs
  `pagead2.googlesyndication.com` / `googleads.g.doubleclick.net` /
  `tpc.googlesyndication.com` and A-Ads needs `acceptable.a-ads.com`.
- `chooseUnit(units: readonly string[], key: string): string | undefined` —
  deterministic hash-based rotation, generalized off
  `561-group`'s `chooseAAdsUnit`. Not provider-specific; usable for any
  future rotated-unit provider, not just A-Ads.
- `AdPerformanceEvent` / `AdPerformanceBucket` / `AdPerformanceReading` types
  matching the field shapes listed under Prior Art above, as plain
  TypeScript/JSON-Schema-literal types (see §2 for the carrier). `provider` is
  a closed union: `"adsense" | "a-ads"`.
- `foldAdPerformance(events: readonly AdPerformanceEvent[]): AdPerformanceReading`
  — plain sum/count fold into `totals`/`byProvider`/`bySection`/`byTag`
  buckets, with `rpmMicros = revenueMicros / impressions * 1000` and
  `cpcMicros = revenueMicros / clicks` (both `0` when the denominator is `0`,
  not `NaN` or thrown). Every number here is a plain integer or integer ratio.
  No `ChargeValueName`, no `charge()`, no bilattice import anywhere in this
  directory.

## 2. `src/carriers/advertising`

New directory, sibling to `src/carriers/article`, `src/carriers/page`, etc.
Use `carrierFrom(schema)` from the package root exactly as documented in
`docs/carrier-kernel.md` — JSON-Schema literal `as const`, get `id`,
`schema`, `validate`, `assert`, `errors` for free.

Four carriers: `metroplat/advertising/policy`, `metroplat/advertising/ad-slot`
(position name + which loci it may attach to), `metroplat/advertising/impression-event`
(mirrors `AdPerformanceEvent`), `metroplat/advertising/performance-reading`
(mirrors `AdPerformanceReading`). Each carrier's JSDoc states only what it
admits and what shape it produces — no theorem citations, verified or
otherwise, unless one is independently confirmed to exist (see Hard
Constraints §2 above) and is actually load-bearing for something this carrier
claims, which is not expected here since none of this is FOUR-shaped.

## 3. Extend `src/projections/themed-page`

This is the one place FOUR legitimately enters this feature, and only because
it is reusing already-verified, already-running machinery rather than
extending the theory: `ThemedPageLocus`
(`sites/metroplat.emsenn.net/src/projections/themed-page/index.mts`) is
currently the union `"page" | "main" | "entry" | "header" | "title" |
"byline" | "published" | "content" | "license" | "sources"`, each with an
entry in `defaultCharges: Readonly<Record<ThemedPageLocus, ChargeValueName>>`
and `semanticLoci: readonly SemanticLocusSpec[]` (id/selector/parent/role/label).
Add ad positions (`"adHeader" | "adInArticle" | "adFooter"`, or fold them into
one `"ad"` locus parameterized by position — decide based on whether the CSS
selector needs to differ per position, read `koiosMillPageClaims`'s
`.koios-ad-slot`/`.koios-ad-slot iframe` rules in the current `surface.mts`
for what the selector needs to do) into these existing tables the same way
every other locus is already there. This makes "does this regime admit an ad
here" a `ThemedPageFeelingRules.charges` entry like every other locus, not a
new boolean flag or a new mechanism. Do not add a parallel ad-admission
system next to the existing charge table.

## 4. Provider codecs — `src/codecs/.../advertising/{adsense,a-ads}.mts`

Exact subdirectory TBD by whoever's placing it — follow the existing
`src/codecs/text/...` / `src/codecs/host/...` grouping convention, this is
neither text nor host-JS-value, so it may need its own
`src/codecs/advertising/` root; check `codec-boundary-tree.md` before
deciding. Each provider codec returns a `Mark`-wrapped opaque render — read
`lib/articulation/utterance.mts` first, specifically the doc comment: "`Mark`
is the opaque atom... Core code never inspects a Mark's payload as ordinary
data — only a codec boundary may." That is the exact right model for a
third-party AdSense `<ins>`/`<script>` tag or an A-Ads `<iframe>`: opaque
material admitted at this one boundary, never parsed as RMN, never touched by
the themed-page/typography layer above it, which should only ever see "there
is an ad locus here, filled or empty," never the provider markup itself.

## 5. Witnessed impressions via the existing witness substrate

No new persistence primitive. Read `docs/witness-projection.md`'s "Smallest
Feed" example first — it is the exact shape to copy. Define a feed
(`{name: "ad-impression", functional: [...], cellize(observation, at) {...}}`)
and call `appendWitnessesAtRoot`, `projectLogPathState`,
`projectStatePathContent` from `@emsenn/metroplat/services/filesystem-store`
the same way `sites/koios.news/src/views.mts`'s `/hit` beacon already does —
read that file for the concrete call pattern in a live site package before
writing this. Output: an `/ads-performance.json` content projection sibling to
the existing `/views.json`. Do not invent a second witness log format.
This is blocked on the `feedPath` gap in Current Blocking State above if
`views.mts`'s pattern turns out to depend on it — check before assuming it's
copyable as-is.

## 6. One CSP source of truth

`services/http/policy.mts` (`sites/metroplat.emsenn.net`) already carries
the live HTTP security/CORS/compression defaults
(`metroplat/services/http/policy` carrier, per the taxonomy audit). §1's
`advertisingCspFragment(policy)` output must compose into that carrier's
output — e.g. that policy module imports and merges the fragment — not exist
as a second, separately-maintained CSP builder the way
`advertisingContentSecurityPolicy()` did standalone in the decommissioned
code. Read `services/http/policy.mts` first to see its current shape before
deciding how the merge point should look.

## 7. `sites/koios.news` supplies its own concrete policy

Once §1–§6 exist in metroplat, `sites/koios.news/src/surface.mts` (or
wherever the theme profile is assembled after this refactor) constructs one
`AdvertisingPolicy` value from its own env vars
(`KOIOS_NEWS_AD_CLIENT`, `KOIOS_NEWS_A_ADS_UNITS`) — the same role
`KOIOS_THEME`/`themeProfile` already plays for theming. No ad-specific logic
should need to live in `sites/koios.news` beyond this one declaration plus
whatever route wiring §5's beacon needs; if you find yourself writing
provider-specific markup or CSP logic inside `sites/koios.news`, it belongs in
metroplat instead and this section should be revised.

## Sequencing

§1 → §2 → §3 and §4 can proceed in parallel once §1/§2 exist → §5 depends on
resolving Current Blocking State first → §6 can happen any time after §1 →
§7 depends on everything above. Do not start §5's HTTP surface work before
Current Blocking State is resolved; anything written against the current
`Context`/`App`/`Resource` pattern will need to be rewritten once that
resolution lands.

## Explicitly out of scope / explicitly not decided here

- Whether ad-locus admission should someday be a full `ChargeValueName`
  instead of the boolean-gated `enabled` in `AdvertisingPolicy`, and whether
  ad revenue deserves its own algebra (quantale, residuated lattice, or
  something not yet named) — both open. Per
  `sites/infomaterial.emsenn.net/CLAUDE.md`'s own house rule ("absence is a
  design judgment... find the new principled form, do not stub the old
  one"), settling either requires reading/writing an actual corpus node in
  `sites/infomaterial.emsenn.net/dev/content` first, then formalizing — not
  backward-fitting FOUR onto this feature because it's already in the
  codebase. Do not resolve this inside an ads implementation PR.
- Auditing the other 526 `RelMath.*` citations elsewhere in metroplat. Real,
  separate, larger task. Not part of this plan.
