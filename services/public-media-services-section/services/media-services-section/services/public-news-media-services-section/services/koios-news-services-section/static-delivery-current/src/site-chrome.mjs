// Reader-facing chrome for koios.news: the stylesheet, the house-ad loader,
// and the standing pages. Served as files (never inline) so the site's own
// Content-Security-Policy can stay `script-src 'self'; style-src 'self'`.

export const HOUSE_AD_SERVER = "https://house-ads-server.morgan-sennhauser.workers.dev";

export const SITE_CSS = `:root{--ink:#161616;--paper:#fbfaf7;--muted:#5d5a52;--rule:#d9d5cb;--accent:#8a1c1c;--accent-ink:#fff;--soft:#f1eee6;--link:#0f4c81;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--serif:Georgia,"Times New Roman",Times,serif;--sans:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
@media (prefers-color-scheme:dark){:root{--ink:#ecebe6;--paper:#131313;--muted:#a9a59b;--rule:#33322e;--accent:#e0665f;--accent-ink:#131313;--soft:#1d1d1b;--link:#8fbde6}}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);font-size:1.0625rem;line-height:1.55}
a{color:var(--link);text-decoration-thickness:1px;text-underline-offset:2px}a:hover{color:var(--accent)}
img,svg{max-width:100%;height:auto}
.wrap{max-width:72rem;margin:0 auto;padding:0 1.25rem}
.masthead{border-bottom:3px double var(--rule);padding:1rem 0 .5rem}
.masthead .brand{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.masthead .brand a.title{font-family:var(--serif);font-weight:700;font-size:2.25rem;letter-spacing:-.02em;color:var(--ink);text-decoration:none}
.masthead .brand .tagline{font-family:var(--sans);color:var(--muted);font-size:.9rem}
nav.desks{font-family:var(--sans);font-size:.9rem;display:flex;gap:.25rem 1rem;flex-wrap:wrap;padding:.5rem 0 .25rem;border-top:1px solid var(--rule);margin-top:.5rem}
nav.desks a{color:var(--ink);text-decoration:none;text-transform:uppercase;letter-spacing:.06em;font-size:.78rem;padding:.2rem 0}
nav.desks a:hover,nav.desks a[aria-current]{color:var(--accent);border-bottom:2px solid var(--accent)}
nav.utility{font-family:var(--sans);font-size:.78rem;display:flex;gap:1rem;flex-wrap:wrap;color:var(--muted)}
nav.utility a{color:var(--muted);text-decoration:none}nav.utility a:hover{color:var(--accent)}
main{padding:1.5rem 0 3rem}
h1,h2,h3{font-family:var(--serif);line-height:1.2;letter-spacing:-.01em;margin:0 0 .5rem}
h1{font-size:2rem}h2{font-size:1.4rem}h3{font-size:1.1rem}
.kicker{font-family:var(--sans);text-transform:uppercase;letter-spacing:.08em;font-size:.72rem;color:var(--accent);font-weight:600;margin:0 0 .25rem}
.meta{font-family:var(--sans);font-size:.8rem;color:var(--muted)}
.lede{font-size:1.15rem;color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:1.5rem 2rem}
.front{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:2rem;align-items:start}
@media (max-width:52rem){.front{grid-template-columns:1fr}}
.lead h2{font-size:1.9rem}.lead .p-summary{font-size:1.15rem}
article.h-entry{padding:.9rem 0;border-top:1px solid var(--rule)}article.h-entry:first-of-type{border-top:0}
article.h-entry h2 a,article.h-entry h3 a{color:var(--ink);text-decoration:none}article.h-entry h2 a:hover,article.h-entry h3 a:hover{color:var(--accent)}
.wire-list{list-style:none;margin:0;padding:0}
.wire-list li{padding:.7rem 0;border-top:1px solid var(--rule)}.wire-list li:first-child{border-top:0}
.wire-list .headline{font-weight:700;display:block;color:var(--ink);text-decoration:none;font-size:1.05rem}.wire-list .headline:hover{color:var(--accent)}
.wire-list .summary{margin:.2rem 0 0;color:var(--muted);font-size:.95rem}
.wire-list .provenance{font-family:var(--sans);font-size:.75rem;color:var(--muted);margin-top:.25rem}
.wire-list .provenance a{color:var(--muted)}
.section-head{display:flex;align-items:baseline;justify-content:space-between;border-bottom:2px solid var(--ink);margin:1.5rem 0 .5rem;padding-bottom:.2rem}
.section-head h2{margin:0}.section-head a.more{font-family:var(--sans);font-size:.8rem;text-decoration:none}
.panel{background:var(--soft);padding:1rem 1.25rem;border-radius:4px;font-family:var(--sans);font-size:.9rem}
.panel h2,.panel h3{font-family:var(--sans)}
.stats{display:flex;gap:1.5rem;flex-wrap:wrap;font-family:var(--sans);font-size:.85rem;color:var(--muted);margin:.5rem 0 1rem}
.stats strong{color:var(--ink);font-size:1.3rem;display:block;font-family:var(--serif)}
.e-content{max-width:44rem}.e-content p{margin:0 0 1rem}.e-content h2{margin-top:1.75rem}.e-content ul{padding-left:1.25rem}
article#article h1{font-size:2.4rem}
aside{font-family:var(--sans);font-size:.85rem;color:var(--muted);border-top:1px solid var(--rule);margin-top:2rem;padding-top:1rem}
table.ledger{border-collapse:collapse;width:100%;font-family:var(--sans);font-size:.85rem}
table.ledger th,table.ledger td{text-align:left;vertical-align:top;padding:.45rem .5rem;border-bottom:1px solid var(--rule)}
table.ledger th{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
table.ledger td.value{font-family:var(--serif);font-size:.95rem}
.scroll{overflow-x:auto}
code,pre{font-family:var(--mono);font-size:.85em}pre{background:var(--soft);padding:.75rem 1rem;overflow-x:auto;border-radius:4px}
.tags a{display:inline-block;font-family:var(--sans);font-size:.75rem;background:var(--soft);padding:.15rem .5rem;border-radius:999px;margin:0 .25rem .25rem 0;text-decoration:none;color:var(--ink)}
footer.colophon{border-top:3px double var(--rule);padding:1.25rem 0 2rem;font-family:var(--sans);font-size:.8rem;color:var(--muted)}
footer.colophon .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem 2rem}
footer.colophon h3{font-family:var(--sans);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 .4rem}
footer.colophon ul{list-style:none;margin:0;padding:0}footer.colophon li{margin:.15rem 0}footer.colophon a{color:var(--muted)}footer.colophon a:hover{color:var(--accent)}
#house-ad-footer{margin-top:1rem;padding-top:.75rem;border-top:1px solid var(--rule)}#house-ad-footer:empty{display:none}
#house-ad-footer a{display:inline-block;padding:.5rem .75rem;background:var(--soft);border-radius:4px;color:var(--ink);text-decoration:none}
#house-ad-footer .label{font-size:.7rem;text-transform:uppercase;letter-spacing:.08em;margin-right:.5rem}
`;

export const HOUSE_AD_JS = `(function(){var s="footer",p="koios-news",el=document.getElementById("house-ad-footer"),base="${HOUSE_AD_SERVER}";if(!el||!window.fetch)return;fetch(base+"/ad?slot="+s+"&property="+p).then(function(r){return r.ok?r.json():null;}).then(function(d){if(!d||!d.creative)return;var label=document.createElement("span");label.className="label";label.textContent="House ad";var a=document.createElement("a");a.href=base+"/click?slot="+s+"&property="+p+"&creative="+encodeURIComponent(d.creative.id);a.rel="sponsored noopener noreferrer";a.textContent=d.creative.title+" \\u2014 "+d.creative.body;el.appendChild(label);el.appendChild(a);}).catch(function(){});})();
`;

/** Standing pages: true statements about how the publication is owned, funded, produced, and corrected. */
export const STANDING_PAGES = Object.freeze({
  "/about": {
    title: "About Koios.News",
    description: "Who publishes Koios.News, how it is funded, how it is written, and how to reach it.",
    body: `<h1>About Koios.News</h1>
<p class="lede">Koios.News is a general news publication with systems-analysis depth. It reads climate, technology, politics, markets, culture, and sport as one compounding system, and it publishes the evidence behind every story as data a reader or a machine can check.</p>
<h2>Ownership and funding</h2>
<p>Koios.News is owned and operated by the 561 Group. It has no outside investors, sponsors, grant funders, or paying subscribers. The only advertising on the site is a single house slot served by the 561 Group's own ad server, which promotes the group's other properties; no outside advertising is sold today. No reader identifiers are stored or sold.</p>
<h2>Two kinds of page</h2>
<p><strong>Koios reporting</strong> is bylined under the masthead name Nik Koios, an artificial editor persona operated by the 561 Group since February 2025. These articles are drafted with AI language models from a research packet of named sources, then pass deterministic editorial gates and an independent assessment before publication. Every published article's exact source bytes are digested in the public <a href="/newswire-audit.json">editorial audit</a>.</p>
<p><strong>The wire</strong> is not written by Koios. It is the headline, summary, link, and publication time of articles published by named outside sources, recorded as attributed claims in the <a href="/claims/">claim store</a> and filed by desk. Koios asserts nothing on the wire beyond "this source published this."</p>
<h2>Contact</h2>
<p>Corrections and editorial contact: <a href="/corrections">corrections</a>. The publication's ActivityPub actor is <code>@koios-news@bare-cedar-fog.561.group</code>.</p>`,
  },
  "/standards": {
    title: "Editorial standards",
    description: "How Koios.News sources, writes, discloses, and corrects.",
    body: `<h1>Editorial standards</h1>
<h2>Sourcing</h2>
<p>Koios reporting cites primary and named sources by link inside the article. Anonymous sourcing is not used. A claim that cannot be attributed to a named source is not published as fact; it is either dropped or labelled as analysis.</p>
<h2>Evidence and analysis</h2>
<p>Evidence is what a named source asserts. Analysis is Koios's reading of it. Headlines may not strengthen an allegation, estimate, interpretation, causation, scope, urgency, or certainty beyond what the article body supports; that rule is enforced by machine at draft time, not by taste after the fact.</p>
<h2>Use of AI</h2>
<p>Koios reporting is drafted with AI language models under the masthead persona Nik Koios and passes deterministic gates (attribution, numeric citation, quotation, duplication) and an independent assessment on a different model lineage before it can be published. Wire items are never generated: they are the named source's own headline and summary, recorded verbatim with a citation.</p>
<h2>Corrections</h2>
<p>A material error withdraws the exact published manuscript by digest, and the corrected bytes must pass every gate again before republication. The <a href="/newswire-audit.json">editorial audit</a> records the source digest of every published article so an outside verifier can see exactly which bytes changed and when. See <a href="/corrections">corrections</a>.</p>
<h2>Machine readers</h2>
<p>Every article carries schema.org NewsArticle data and h-entry microformats. Every wire item's claims are published as JSON with witness and citation under <a href="/claims/">/claims/</a>, and the whole store is projected into <a href="/wire/feed.xml">RSS</a>, <a href="/wire/feed.atom">Atom</a>, <a href="/wire/feed.json">JSON Feed</a>, and a Google News sitemap.</p>`,
  },
  "/corrections": {
    title: "Corrections",
    description: "How to report an error and how Koios.News records corrections.",
    body: `<h1>Corrections</h1>
<p>To report a possible error in Koios reporting, message the publication's ActivityPub actor <code>@koios-news@bare-cedar-fog.561.group</code> or open an issue against the source digest listed for the article in the <a href="/newswire-audit.json">editorial audit</a>.</p>
<p>A confirmed material error withdraws the affected article by its exact digest. The corrected article is republished only after it independently passes the ordinary editorial gates, and the audit records both digests.</p>
<p>Wire items are attributed claims about what a named source published; an error in a source's own article is the source's to correct, and Koios records the source's correction as a new claim when it is observed.</p>`,
  },
  "/privacy": {
    title: "Privacy",
    description: "What Koios.News does and does not collect.",
    body: `<h1>Privacy</h1>
<p>Koios.News is a static site. It sets no cookies, runs no analytics, and retains no reader identifiers.</p>
<p>Each page asks the 561 Group's own ad server for one house creative. That request carries the slot and property name only; the ad server selects by context, keeps no per-viewer state, and records hash-chained delivery receipts that contain no reader identifier.</p>
<p>Feeds and claim data are public and may be read by anyone, including automated agents.</p>`,
  },
});
