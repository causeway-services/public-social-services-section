---
title: "Firefox speeds up with biweekly updates"
date: 2026-07-20
draft: true
author: "Nik Koios"
description: "\"This will be an experiment,\" he wrote, and he added that \"this does not mean that all work needs to ship twice as fast."
summary: "Mozilla is planning to cut Firefox's release interval in half, shifting from a four-week cadence to roughly every two weeks beginning in September 2026, The Register reported on July 17. org mailing list, where Mozilla's director of engineering Sylvestre Ledru posted the proposal. From that version onward, the calendar lists releases at roughly two-week intervals."
keywords: ["mozilla speeds firefox release schedule biweekly", "technology"]
categories: ["technology"]
references:
  - id: "source-0d9767d06b78"
    type: "webpage"
    title: "Mozilla speeds Firefox release schedule to biweekly"
    URL: "https://www.theregister.com/software/2026/07/17/mozilla-speeds-firefox-release-schedule-to-biweekly/5274423"
    container-title: "theregister.com"
  - id: "source-525b7afc47a8"
    type: "webpage"
    title: "Firefox to Move to Biweekly Major Updates Starting in September: Experiment Begins with 155 | XenoSpectrum"
    URL: "https://xenospectrum.com/en/firefox-two-week-release-cadence-september-2026/"
    container-title: "xenospectrum.com"
license: "CC BY 4.0"
license_url: "https://creativecommons.org/licenses/by/4.0/"
syndication_rights: "Licensed under Creative Commons Attribution 4.0 International; Koios.News permits indexing, snippets, large image previews, feed distribution, Google Search/News/Discover surfaces, and other attributed downstream syndication."
koios:
  seo_term: "mozilla speeds firefox release schedule biweekly"
  beat: "technology"
  gates_clear: false
  assignment_id: "technology-mozilla-speeds-firefox-release-schedule-biweekly-ad471c2e:repair:438b06d35e64c0d4:repair:f6ad4f7c17f6f59f"
  predecessor_assignment_id: "technology-mozilla-speeds-firefox-release-schedule-biweekly-ad471c2e:repair:438b06d35e64c0d4"
  repair_context_digest: "sha256:a9bc86e8d901652dcf933b601f85fda5e353393cb30ab5bce33172dda62be5fb"
  source_packet_digest: "sha256:f68dc270647b1b1599c48853a0b971c5f30c8afe9b4d24fbd10e187012848b76"
  source_intelligence_replay_at: 2026-07-20T02:58:33.548Z
tweet: "Firefox speeds up with biweekly updates"
---
Mozilla is planning to cut Firefox's release interval in half, shifting from a four-week cadence to roughly every two weeks beginning in September 2026, [The Register reported on July 17](https://www.theregister.com/software/2026/07/17/mozilla-speeds-firefox-release-schedule-to-biweekly/5274423).

The news arrived through the dev-platform@mozilla.org mailing list, where Mozilla's director of engineering Sylvestre Ledru posted the proposal. In his message, as quoted by The Register, Ledru wrote: "We are planning to move Firefox Desktop and Android from a 4-week release cadence to a 2-week release cadence starting in September 2026."

Ledru was careful to frame the shift as exploratory rather than permanent. "This will be an experiment," he wrote, and he added that "this does not mean that all work needs to ship twice as fast. Work that is not ready should not be rushed, and features can still take the time they need to bake." The message also set a concrete initial target: "The current target is to release Firefox 155 on September 1, 2026, instead of September 15." Ledru concluded that Mozilla would "closely monitor how this change works in practice and adjust if needed," [according to The Register](https://www.theregister.com/software/2026/07/17/mozilla-speeds-firefox-release-schedule-to-biweekly/5274423).

## The release calendar already reflects the shift

The change is not merely stated — it is already visible in the Firefox Release Calendar, The Register noted. At the time of that reporting, the calendar still showed Firefox 153 and Firefox 154 following the existing four-week pattern, but Firefox 155 had been moved forward to September 1. From that version onward, the calendar lists releases at roughly two-week intervals.

Extended Support Release versions are not subject to the new cadence. Those remain on annual cycles, [The Register reported](https://www.theregister.com/software/2026/07/17/mozilla-speeds-firefox-release-schedule-to-biweekly/5274423).

## Not the first time, and not only Mozilla

The Register noted that a compressed Firefox release rhythm is not without precedent — Mozilla ran a faster cadence more than a decade ago. The outlet also observed that Google had announced a comparable interval reduction for Chrome in March 2026, and recalled that it had previously covered Chrome's move to six-weekly releases in 2010 and its shift to four-weekly releases in 2021. Mozilla's September target therefore places Firefox broadly in step with a cadence that Chrome's development team has been pursuing independently.

## Firefox 153 arrives first, and carries ESR status

Before Firefox 155 initiates the new schedule, Firefox 153 is the immediate release. At the time The Register filed its story, version 153 was due on Tuesday, July 21. That release carries particular institutional weight: Firefox 153 will become the next Extended Support Release, which means it will receive security updates for at least fifteen months — through late 2027 at minimum. The Register also noted that Firefox 115 continues to receive updates and is now covered through March 2027, [according to The Register](https://www.theregister.com/software/2026/07/17/mozilla-speeds-firefox-release-schedule-to-biweekly/5274423).

## What Firefox 153 includes

The Register's account of the beta release notes for Firefox 153 describes changes across PDF editing, web security standards, platform capabilities, and address-bar controls.

On the PDF side, version 153 will let users merge multiple documents into a single PDF through a drag-and-drop action in the PDF sidebar, insert images into PDFs as entirely new pages, and improve text highlighting within those documents.

A new QR code generator will allow users to convert any web page link into a scannable code, useful for sharing pages in printed documents or offline contexts. The browser will also gain the ability to verify and display the European Union's Qualified Website Authentication Certificates — QWACs — which form part of the eIDAS framework, the acronym standing for electronic IDentification, Authentication and trust Services.

On the security side, browser extensions will lose local-file access by default in version 153, though users retain the ability to grant that permission individually. When a tab is accessing the device's location, Firefox 153 will indicate that fact with a map-pin icon in the address bar.

The address bar's keyword command system, which already supports muting all audio on a page, is being extended. Version 153 will add typed commands for picking colors from pages and accessing experimental Labs features.

Platform-specific additions include experimental support for the JPEG XL image format, improved controls for the pop-up video player, HDR video playback on Windows for users with compatible GPU hardware and drivers, and on macOS, recognition of the Fn+F keystroke for toggling full-screen mode, [The Register reported](https://www.theregister.com/software/2026/07/17/mozilla-speeds-firefox-release-schedule-to-biweekly/5274423).

## Waterfox tracks Firefox 153 as its ESR base

Because Firefox 153 is the next ESR, it also serves as the foundation for the latest beta of Waterfox, an independently maintained fork aimed at users who want a browser without built-in artificial intelligence features. The Register noted that Waterfox recently added built-in ad blocking to that beta.

The practical question now in front of Firefox users, enterprise administrators, and extension developers is what a two-week release interval demands of their own testing and compatibility workflows — a pressure that Ledru's mailing list message addressed directly by stating that features not ready for a given window should not be forced into it.
