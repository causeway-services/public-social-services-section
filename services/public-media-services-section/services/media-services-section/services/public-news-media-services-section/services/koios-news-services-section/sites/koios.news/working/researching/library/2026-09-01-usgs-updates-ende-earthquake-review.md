---
title: "USGS updates reviewed record for Ende, Indonesia earthquake"
date: 2026-09-01
seo_term: "Ende Indonesia earthquake"
status: brief
---

## The event record

The U.S. Geological Survey (USGS) event-detail GeoJSON for `us6000tkt2`
records a reviewed magnitude 7.8 earthquake 64 km NNW of Ende, Indonesia. The
record gives the event time as 2026-08-14T21:58:21.505Z and says it was updated
at 2026-09-01T00:32:09.665Z. Its `alert` field is `yellow`, its `mmi` field is
7.833, and its `tsunami` field is `0`.[S1]

This packet treats each of those values as a value in the USGS event record.
In particular, `tsunami: 0` is not a broader safety conclusion.

## Primary source

### S1 — USGS event-detail record

- Title: “M 7.8 - 64 km NNW of Ende, Indonesia”
- Author/publisher: U.S. Geological Survey, Earthquake Hazards Program
- Source publication or update time: 2026-09-01T00:32:09.665Z
- URL: https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tkt2.geojson
- Accessed: 2026-09-01T17:36:27Z
- Stable source label: `usgs-event-detail-us6000tkt2`
- Retrieved-content digest: `sha256:7448a8fb231bd8206a806cd5cf5a5b71cb594da297706f0b1990e7db5c25fb81`
- Exact locator: `$.properties.mag`, `$.properties.place`,
  `$.properties.time`, `$.properties.updated`, `$.properties.status`,
  `$.properties.alert`, `$.properties.mmi`, and `$.properties.tsunami`
- Supports: magnitude 7.8; the named location; event and update timestamps;
  reviewed status; and the record values `yellow`, 7.833, and 0 for `alert`,
  `mmi`, and `tsunami`, respectively.

## Interpretation boundary

The event record is primary evidence for the measurements and labels that USGS
publishes. It does not, by itself, establish casualties, damage, a forecast,
or conditions on the ground. No such claim belongs in the proposed manuscript.

The record's current update timestamp establishes that USGS revised the event
record; it does not identify what changed between versions.

## Editorial limitations

- This dossier uses one official event record. It does not independently
  corroborate USGS's measurements or alert label.
- The endpoint is live and may change after the stated access time. The digest
  identifies the retrieved version used here.
- The field names and values do not establish the practical meaning of the
  yellow alert or `tsunami: 0` beyond what the event record states.
- No local reporting, official Indonesian authority statement, or field
  assessment was reviewed for this packet.
