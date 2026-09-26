---
title: Note offering The Agent Operator's Handbook ebook
date-created: 2026-08-31
tags:
- the-agent-operators-handbook
- ebook
- knowledge-products
- pricing
- funnel
- meet-then-beat
---

## The offer

**The Agent Operator's Handbook: A Field Guide to Dispatching, Steering,
and Recovering Multiple AI Coding Agents at Once** -- a ~16,400-word,
12-section ebook (front matter, nine teaching chapters, a real anonymized
case study, a team-scaling chapter, a glossary, and a five-template
appendix) for anyone who already runs more than one AI coding agent and
keeps finding out the hard way what breaks.

This is the discipline-for-operators book decided for the first
knowledge-products SKU beside the existing **Multi-Agent Operating
Discipline for Teams** cohort in this section. It harvests the cohort's
own curriculum, the `dispatch-agents` house skill, and the
`agent-dispatch-discipline-plugin`'s already leak-checked, public-safe
skill content -- adapted into real chapters with worked examples, not
re-authored from a blank page. Source: `content/books/
the-agent-operators-handbook/` (12 Markdown files, `00-` through `12-`
prefix order). Build pipeline: `scripts/build-ebook.mjs`.

- **Format:** EPUB + PDF, one-time digital purchase.
- **Price:** $29 (see pricing rationale below).
- **Audience:** the same buyer as the cohort -- an engineering lead,
  solo technical founder, or developer already paying for Claude Code,
  Codex, or a comparable agentic coding subscription, who runs more than
  one agent at a time and has zero house/561-Group context.
- **Identity:** published under the 561 Group imprint (same decision as
  the cohort's "named-rails vs x402" call -- see that note for the
  reasoning this SKU inherits).

## Founder ruling applied: our own storefront, not a marketplace (meet-then-beat)

A founder ruling landed mid-draft and changed this SKU's channel
decision from the cohort's own precedent. The house doctrine
(`meet-then-beat` skill, specified 2026-09-01) holds that a house
surface sharing a category with a named incumbent must name it, measure
its capability surface from its own current docs, meet the gaps our
buyer actually needs, and beat it on a differentiator the incumbent
cannot structurally copy -- never merely feed the incumbent. The
standing precedent is play.561.group vs itch.io; the same doctrine
applies here to digital-goods checkout: **our own storefront is
PRIMARY, not Gumroad.** Gumroad, Lemon Squeezy, and Payhip are researched
below as the incumbent capability census, not as the selling channel.

### Incumbents measured (WebFetch/WebSearch, cited, dated 2026-08-31)

- **Gumroad.** Direct-sale fee: 10% + $0.50/transaction, no monthly fee
  (30% flat if sold through Gumroad's own "Discover" marketplace
  surface instead of a creator's own link).
  <https://gumroad.com/pricing>. Payout: bank (via Stripe, full KYC) or
  PayPal (lighter KYC), weekly, with a 7-day new-sale holding period.
  <https://gumroad.com/help/article/260-your-payout-settings-page>.
  Payout minimum: reported raised from $10 to $100 on 2026-03-23 per one
  secondary source (<https://medium.com/the-behavioral/gumroad-quietly-
  raised-its-payout-minimum-by-900-a752e958646c>); several other 2026
  aggregator pages still say $10 -- unresolved conflict, flagged rather
  than picked. Gumroad has been merchant of record for global sales
  tax/VAT since 2025-01-01, so its sellers do not register for VAT
  themselves. <https://help.gumroad.com/article/11-us-sales-tax-on-
  gumroad>. Listing needs: title, description, cover image (>=1280x720),
  square thumbnail (>=600x600), file upload, price (fixed or
  pay-what-you-want).
- **Lemon Squeezy.** 5% + $0.50 base, plus add-ons (1.5% international,
  1.5% PayPal, 0.5% subscriptions) pushing the effective rate to
  roughly 5.5-11%; also merchant of record for VAT/sales tax compliance.
  <https://getstacksmart.com/blog/lemon-squeezy-merchant-of-record-
  fees-2026>
- **Payhip.** Three tiers -- Free ($0/mo + 5%), Plus ($29/mo + 2%), Pro
  ($99/mo + 0%) -- plus standard card-processor fees (~2.9%+$0.30) on
  every tier. <https://www.passivekit.com/payhip-pricing/>. Its
  merchant-of-record status for VAT was not independently confirmed this
  session -- reported as unverified rather than assumed.

### Real comparables found live on Gumroad (proof the category exists)

- "Claude Code Prompt Pack -- 50+ Battle-Tested Developer Prompts":
  pay-what-you-want, $0+. <https://maxtendies.gumroad.com/l/claude-code-
  prompt-pack>
- "[Claude Code] Coding Prompts: 79 Prompts From First Test to Clean
  Commit": $45+ (PWYW, $45 floor).
  <https://buildtolaunch.gumroad.com/l/claude-code-coding-prompts>
- "[Bundle] Prompt Engineering for Programmers": $360 (from $498 list).
  <https://godsol.gumroad.com/l/prompt-engineering-for-programmers>
- "OpenClaw + Claude Code: 24/7 Persistent Agent Playbook (2026)": $57
  fixed. <https://numbpilled.gumroad.com/l/openclaw-claude-code>
- "The Complete Claude Code Playbook" (Flowmate, 91 pages/31 chapters,
  the closest direct-format comparable): listing confirmed live, price
  could not be extracted after repeated fetch attempts -- reported
  unverified rather than guessed. <https://getflowmate.gumroad.com/l/
  dxnjk>

### MEET: the gap list (this surface's engineering roadmap)

Stripe Checkout direct (2.9% + $0.30/transaction,
<https://stripe.com/pricing>) is the human-card rail this storefront
uses instead of a marketplace's bundled cut. Measured against the
incumbents above, here is what a self-hosted storefront must build to
meet what buyers actually get from Gumroad/Lemon Squeezy today, and what
stays a real, honestly-stated gap:

| Capability | Incumbent gives it for free | Our gap | Effort to close |
|---|---|---|---|
| Hosted checkout UI | yes, built in | met via Stripe Checkout's own hosted page | none -- Stripe provides this directly |
| Secure file delivery after payment | yes, built in | **gap**: no first-party Stripe product for this; requires a webhook handler that verifies `checkout.session.completed`, then issues a signed/expiring download URL or emails one (<https://docs.stripe.com/checkout/fulfillment>) | small: one Cloudflare Worker + signed-URL storage |
| VAT/sales-tax calculation | yes (Gumroad/Lemon Squeezy are merchant of record) | **partial**: Stripe Tax Basic (0.5%/transaction, calculation + collection only) can be added; it does NOT handle registration or filing on the pay-as-you-go tier -- that stays our own legal obligation per jurisdiction unless we buy Stripe Tax Complete ($90/mo+) or a full merchant-of-record wrapper (<https://stripe.com/tax/pricing>) | real, ongoing: VAT/GST registration and remittance is genuine compliance work, honestly flagged, not solved by checking a box |
| Payout rails | yes, but Gumroad gates behind a $100 (or $10, disputed) minimum, weekly schedule, 7-day hold | **met, and arguably beaten**: Stripe pays out to our own bank account on Stripe's own standard schedule, no marketplace-imposed minimum on top | none -- already better |
| Refund/dispute handling | built-in buyer-protection UX | **gap**: we must publish our own clear refund policy and support contact; Stripe provides the mechanics (refund API, dispute handling), not the policy page | small: one static page |
| Affiliate program | Gumroad and Payhip offer native affiliate tooling | **gap, deferred**: no affiliate mechanism planned for this launch; exact incumbent affiliate-fee mechanics were not independently researched this session (unverified, not invented) | deferred -- not required for first sale |
| Pay-what-you-want pricing | native on Gumroad | **gap, minor**: Stripe Checkout supports a fixed price or an "adjustable quantity" pattern, not a native PWYW slider; a small custom price-tier selector would be needed if PWYW is wanted later | small, deferred -- first listing ships fixed-price |
| Automatic receipts | built in | met -- Stripe emails a receipt automatically | none |
| Marketplace discovery traffic | Gumroad's own "Discover" surface and existing buyer base | **structural gap, not closeable by building anything**: a brand-new storefront has zero organic marketplace traffic on day one | addressed by the funnel spec below, not by more engineering |

### BEAT: the differentiator Gumroad cannot structurally copy

A marketplace platform sells opaque files from an opaque pipeline --
buyers have no way to verify what they're actually getting matches any
particular claimed source. This storefront can ship something no
marketplace listing can: **a public, hash-verified build record.** Every
release states the exact source commit, the exact `pandoc` build command
run (see `scripts/build-ebook.mjs`), and the exact SHA-256 of the
resulting EPUB and PDF -- so a buyer, or anyone reviewing the offer
before buying, can independently confirm the bytes they'd receive were
produced from the exact, publicly inspectable Markdown source in this
change, not from an opaque upload nobody can check. Gumroad has no
access to our source tree and no reason to build this; it is the same
receipts/provenance move the house makes everywhere else (dated records,
verifiable build state), applied to a commercial product for the first
time. This differentiator ships with the first release, not as a later
add-on.

## Pricing rationale

**$29, fixed, one-time.** Positioned between the PWYW-floor prompt packs
($0-45) and the two priced-comparable full playbooks ($57 fixed for a
comparable-scope Claude Code playbook, $360 for an unrelated bundled
product) found live on Gumroad above. At ~16,400 words across twelve
sections with five reusable templates and one real, dated case study --
genuinely more structured than the PWYW prompt-pack tier and
comparable in scope to the $57 "OpenClaw + Claude Code" playbook -- $29
prices below every fixed-price comparable found, deliberately, for the
same reason the cohort priced below its own comparables: this is a first
release with no completion or review track record yet. Net per sale
after Stripe's 2.9% + $0.30: **$27.86** (before any VAT/tax remittance
obligation described in the meet-gap table).

## Funnel: ads under an assumed monthly budget, and the honest math

Per the funnel spec required for this SKU, the flow is **ads -> our own
landing page -> our own Stripe Checkout** -- no marketplace in the loop,
per the channel decision above. Ad-cost assumptions, cited above: AI/
developer-targeted keyword CPCs researched at $0.80-$1.50
(<https://bootstrapcreative.com/how-much-does-it-cost-to-buy-keywords-
on-google/>), general cross-industry Google Search CPC at $5.42
(<https://www.wordstream.com/blog/2026-google-ads-benchmarks.>), and
Meta CPC at roughly $0.50-$3.75
(<https://ppcchief.com/blog/average-cpc-by-ad-platform-2026>). This table
uses **$1.50 CPC** (the researched developer-keyword figure) as the base
case, with landing-page-to-purchase conversion stated explicitly as an
**assumption** (not independently researched this session) at three
levels -- 1%, 2%, and 5% -- since cold-traffic ebook conversion rates
vary widely by creative and audience match, and no house-specific number
exists yet to cite.

| Monthly ad budget | Clicks at $1.50 CPC | Sales at 1% conv. | Sales at 2% conv. | Sales at 5% conv. | Net revenue at 5% conv. | Break-even sales needed (budget / $27.86 net) |
|---|---|---|---|---|---|---|
| $100 | 66 | 0.7 | 1.3 | 3.3 | $92 | 3.6 |
| $300 | 200 | 2.0 | 4.0 | 10.0 | $279 | 10.8 |
| $1,000 | 666 | 6.7 | 13.3 | 33.3 | $928 | 35.9 |

**The honest reading of this table:** at the researched developer-CPC
rate and any conversion assumption below 5%, cold paid-traffic
acquisition for a single $29 ebook does not clearly break even at any
of these three budget levels -- $100/month at 1-2% conversion loses
money outright; even $1,000/month needs conversion nearer 5-6% just to
clear its own ad spend, before counting the time cost of running the
campaign. This is a real finding, not a reason to inflate the conversion
assumption to make the table look better.

**What this means for the actual first move:** paid cold-traffic
acquisition is not the primary channel for this SKU's launch. The
cohort's own funnel research (this section's 2026-08-31 cohort note)
already identified r/ClaudeCode (~395,000 members), r/ClaudeAI (part of
a 740,000-member community), and Latent Space as places the exact buyer
segment already congregates at zero acquisition cost -- the same
research applies unchanged to this ebook, since it's the same buyer.
**Primary channel: organic posts to r/ClaudeCode and the cohort's own
existing funnel surfaces, at $0 CPC.** An assumed monthly ad budget, once
one exists, is better spent as **retargeting spend against warm traffic**
(visitors who reached the landing page but didn't buy) rather than cold
prospecting -- retargeting CPCs run meaningfully lower and conversion
meaningfully higher than cold acquisition, which is exactly what the
table above shows cold acquisition struggling to clear.

## Landing page copy (draft)

```
# The Agent Operator's Handbook

You already run more than one AI coding agent at once.
This is the discipline that keeps that from costing you more than it saves.

Redone work. Silently overwritten files. A "done" that wasn't true on
disk. If any of that sounds familiar, this book teaches the six-part
discipline that prevents it: how to write a brief a subagent with zero
memory of your conversation can't misread, how to tell a real
parallel-work split from a fan-out that just burns tokens, how to steer
and recover an agent mid-flight, how to receive a report without
accepting an unverified claim, and how to use a dated receipt so
tomorrow's session doesn't have to re-derive what today already
learned.

Chapter 7 is not a hypothetical -- it's a real, dated incident where two
concurrent agent sessions collided on one shared, uncommitted repository,
walked start to finish, with the exact coordination protocol that
resolved it.

**What's inside:**
- Twelve sections, ~16,400 words, EPUB + PDF
- Five ready-to-use templates: a brief template, a fan-out decision
  checklist, a recovery runbook, a minimal receipt format, and a
  coordination protocol for shared repositories
- A real case study, not a composite
- A chapter on scaling the discipline from one operator to a small team
- Zero framework, zero new tooling required -- works with Claude Code,
  Codex, or any comparable agentic coding tool

**$29. One-time purchase. Instant EPUB + PDF download.**

Every release ships with a public build record -- exact source commit,
exact build command, exact file hash -- so you can verify the file you
download matches the source, not just take our word for it.

[Buy now -- $29]
```

## First-dollar path

**Engineering -- delivered in this change, all on disk:**

- The book's Markdown source (`content/books/the-agent-operators-
  handbook/`, 12 files, ~16,400 words) and its build pipeline
  (`scripts/build-ebook.mjs`), producing a real EPUB and PDF via
  `pandoc` (see the build receipt below for hashes and sizes).
- This landing/offer note, including the meet-gap table, pricing
  rationale, and funnel math.
- The dated launch-state record seeded through
  `@red-cup-engineering/semantic-record-journal-service`.

**Hands -- not done by this session, and not claimed as done:**

- **The one hands-step: create a Stripe account** (business/individual
  details, bank account for payout, standard KYC) at
  <https://dashboard.stripe.com/register>. Basic account creation is
  achievable in the same ~10-15 minutes the cohort's original Gumroad
  runbook step assumed; full payout verification depends on Stripe's own
  KYC review timeline and is not guaranteed same-day.
- Standing up the actual storefront page and its Checkout-session /
  webhook-fulfillment Worker on an existing Cloudflare-served house
  property (the meet-gap table above names the exact shape; no such
  Worker exists yet).
- Deciding whether and when to add Stripe Tax, and at what registration
  threshold VAT/GST obligations actually trigger for this product's
  buyer geography -- a real compliance decision, not an engineering one.
- Posting the organic first-move content to r/ClaudeCode or any other
  channel.

## Launch steps

1. **List it on a merchant-of-record platform.** Gumroad or Lemon Squeezy
   sells the EPUB and PDF at $29 today. The platform collects and remits
   VAT and GST, so no tax registration is needed first. The house
   storefront follows once live Stripe keys are in its deployed Worker.
2. **Ship the draft.** `content/books/the-agent-operators-handbook/` has
   real chapters, worked examples, a case study, and five templates, and
   it has been leak-checked. Each reader's question becomes the next
   edition's fix, and buyers get updates free.
3. **Post it where the readers are.** Post to r/ClaudeCode and the Latent
   Space community, and from the founder's accounts, with a free chapter as
   the hook.
