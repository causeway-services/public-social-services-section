#!/usr/bin/env node
/**
 * This is deliberately a bounded release surface.  The historical site is not
 * a migrated provider consumer: it still contains retired remote-RDF custody
 * operations and therefore must not be executed as a current Koios aggregate.
 */
export const status = Object.freeze({
  type: "KoiosNewsAggregateTombstone",
  package: "@causeway-services/koios-news",
  reason: "The historical aggregate is retired; current custody and effects belong only to the package-local successor contracts.",
  successorTopology: Object.freeze([
    "@causeway-services/newscable-source-broker",
    "@causeway-services/web-source-acquisition",
    "@causeway-services/independent-editorial-assessment",
    "@causeway-services/koios-news-service-section",
  ]),
});

export function requireMigratedAggregate() {
  throw new Error(`${status.package} is a bounded tombstone; use its package-local provider, publication, scheduling, and delivery contracts.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stderr.write(`${JSON.stringify(status)}\n`);
  process.exitCode = 2;
}
