---
title: "Note on upload readiness, channel repositories and syndication to Turntide Islands"
date-created: 2026-10-10
description: "The Leader's statements that a deterministic check should decide whether a video is ready for upload, that each education channel is its own repository, and that syndication of the Causeway YouTube channels into Turntide Islands is to be fixed."
type: note
keywords:
  - video-upload
  - readiness
  - channel-repository
  - syndication
  - turntide-islands
  - tti
provenance:
  utterances:
    - ni:///sha-256;zUe5Q5KfD94Um3Y1un1ZAX0PxKxPUyUw8WPXlGlWVBw
    - ni:///sha-256;K9sEFIHg2FCjX4bupLxMc5pa4jaTskv9Wd_gPwZ0EJ0
    - ni:///sha-256;nfHib-ScQzQGQeenoiyLDz5ZWL5oJ-tmy6NRdm-zZEQ
  authors:
    - emsenn
    - claude
  pass: education-media
---

Utterances `ni:///sha-256;zUe5Q5KfD94Um3Y1un1ZAX0PxKxPUyUw8WPXlGlWVBw` (2026-09-24 19:03Z), `ni:///sha-256;K9sEFIHg2FCjX4bupLxMc5pa4jaTskv9Wd_gPwZ0EJ0` (2026-09-30 23:41Z) and `ni:///sha-256;nfHib-ScQzQGQeenoiyLDz5ZWL5oJ-tmy6NRdm-zZEQ` (2026-10-03 02:34Z). Paths below are relative to `lib/emsenn/services/561-group/services/`; `EDU` stands for `public-services-section/services/public-social-services-section/services/public-education-services-section`.

## Theory

1. Whether a video is ready for upload is decided by software that checks on a schedule, not by an agent session. The Leader's words: "We should enrich our software such that that whole process is more automated, such that something deterministic checks every so often if the video is ready for upload."
2. Readiness is a function of the episode's retained evidence. The education package retains `production/episodes/<lesson>/state.json`, `record.jsonl`, `video-work.json`, `video-work-receipt.json` (the downloaded output's hash and the provider artifact id), the Drive custody receipt (file id, link, byte count, SHA-256, verified MD5) and `thumbnail-receipt.json` (`EDU/README.md`). A video is ready when its receipts are present and agree, its Drive copy is verified, its Short carriers pass the ffprobe three-minute check, and no pending authentication or capacity wait is recorded. Each unready video has a named reason from that same evidence, and "awaiting-capacity" and "pending authentication" are the names the package already uses.
3. The mechanism already runs on a clock. The Cold Red Gate timers advance education work every twenty minutes after each run finishes, and publishing runs when a generation run ends (`EDU/README.md`). That is held. What the Leader asked for beyond it is that the readiness check be one deterministic, separately testable decision whose result the clock acts on, and whose refusals are typed. The README describes the stages and does not name such a decision.
4. Each education channel is its own repository: "these are supposed to be each channel its own repo". The six channels the programme table names (emsenn0, modern-business-practices, machine-learning-history-frontier, mathematics-in-relation, climate-place-by-place, pace-yourself) are submodules of the superrepo (gitlinks, `ignore = all`, `update = none`; `561-group-services-section/services/561-group-operations-services-section/services/bare-cedar-fog-services-section/content/text/documents/articles/notes/2026/10/09/2026-10-09-note-on-the-superrepo-forest.md`). The channels `EDU/channels/american-culture-mandarin` and `EDU/channels/turntide-islands` are, in the superrepo's index, tracked plain files (`config.json`), not gitlinks, so by this rule they are not yet channel repositories.
5. The Causeway YouTube channels are syndicated into Turntide Islands (TTI). The mechanism exists: `EDU/scripts/syndicate-to-turntide.mjs` observes each channel's uploads, treats public uploads that are not failed or rejected as offers, records a baseline on first sight so videos older than 24 hours are not offered, and offers new ones to Zelo's placement desk, which decides the island and the pace; the job `turntide-youtube-chatter` runs it every 1800 seconds with `--live`. A channel takes part only if its config declares `turntide.subjects`; with none declared the script throws "No education channel declares turntide.subjects".
6. The Leader approved fixing this syndication ("Approved; we also wanna fix ..."). The fault to fix is not named in the utterance. One fact observed in the superrepo's tracked files bears on it: no tracked channel config (`EDU/channels/*/config.json`) declares a `turntide` key, and the six submodule configs are not checked out in a cloud clone. Whether the deployed channels declare `turntide.subjects` is therefore open, and when none does, syndication fails as a whole.

## Open questions

- Which fault the Leader meant by "fix" is not in the utterance or in a record the house holds. The requirement below states the behaviour whose failure the fix would remove, and does not guess the defect.
- Whether the Leader meant by "these" in the 2026-09-30 utterance the education channels or a wider set (the Turntide channels) is not recorded; the requirement covers every education channel the programme enables.
- Whether the readiness decision lives in the education package or in the media-production package that the Cold Red Gate timers install is open; the requirement is stated of the education production service as delivered.
