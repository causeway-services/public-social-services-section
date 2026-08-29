/**
 * federate-graded - contradiction-aware federation over coherent RWIL readings.
 *
 * This is the bridge where held top and graded H1 meet: sources contribute
 * protocol-local collections, each cell is admitted as a Reading over one RWIL
 * witness, disagreement is retained as a bilattice top, and only nonzero-H1
 * residue is routed into Raft.
 */
import { canonical, carrierFrom, charge, chargeValue, cohomologyTerms, evaluateRunTerm, joinKnowledge, mark, monotonicityCertificateOfFederatedCover, negate, valueOf, } from "@emsenn/relating";
import { cell, cohere } from "@emsenn/relating/ledger";
import { ACTIVITYSTREAMS_CONTEXT, federateActivities, mergeActivities } from "./writing/activitypub/index.mjs";
import { coordinateByCalmOrRaft, emptyRaftLog, } from "./writing/raft/index.mjs";
const nonnegativeIntegerSchema = { type: "integer", minimum: 0 };
const federatedCellSchema = {
    type: "object",
    additionalProperties: false,
    required: ["cell", "value", "witness"],
    properties: {
        cell: { type: "string", minLength: 1 },
        value: {},
        witness: { type: "string", minLength: 1 },
        polarity: { enum: ["assert", "deny"] },
    },
};
export const federateGradedSourceSchema = {
    $id: "organizing/federate-graded/source",
    title: "FederateGradedSource",
    description: "One protocol source admitted into contradiction-aware federation. Its cells are protocol-local readings of RWIL witnesses.",
    type: "object",
    additionalProperties: false,
    required: ["id", "protocol", "collection"],
    properties: {
        id: { type: "string", minLength: 1 },
        protocol: { type: "string", minLength: 1 },
        collection: { type: "array", items: federatedCellSchema },
    },
};
export const federateGradedSourceCarrier = carrierFrom(federateGradedSourceSchema);
const sourceStatementSchema = {
    type: "object",
    additionalProperties: false,
    required: ["source", "protocol", "cell", "value", "polarity", "witness"],
    properties: {
        source: { type: "string", minLength: 1 },
        protocol: { type: "string", minLength: 1 },
        cell: { type: "string", minLength: 1 },
        value: {},
        polarity: { enum: ["assert", "deny"] },
        witness: { type: "string", minLength: 1 },
    },
};
const sharedCellSchema = {
    type: "object",
    additionalProperties: false,
    required: ["cell", "value", "witnesses", "statements"],
    properties: {
        cell: { type: "string", minLength: 1 },
        value: {},
        witnesses: { type: "array", items: { type: "string", minLength: 1 } },
        statements: { type: "array", items: sourceStatementSchema },
    },
};
const contestedCellSchema = {
    type: "object",
    additionalProperties: false,
    required: ["cell", "standing", "topCharge", "truthWitnesses", "falsityWitnesses", "statements", "calm"],
    properties: {
        cell: { type: "string", minLength: 1 },
        standing: { const: "stable" },
        topCharge: {},
        truthWitnesses: { type: "array", items: { type: "string", minLength: 1 } },
        falsityWitnesses: { type: "array", items: { type: "string", minLength: 1 } },
        statements: { type: "array", items: sourceStatementSchema },
        calm: { const: "coordination-free" },
    },
};
const needsCoordinationCellSchema = {
    type: "object",
    additionalProperties: false,
    required: ["cell", "standing", "topCharge", "truthWitnesses", "falsityWitnesses", "statements", "h1", "raftCommand"],
    properties: {
        cell: { type: "string", minLength: 1 },
        standing: { const: "stable" },
        topCharge: {},
        truthWitnesses: { type: "array", items: { type: "string", minLength: 1 } },
        falsityWitnesses: { type: "array", items: { type: "string", minLength: 1 } },
        statements: { type: "array", items: sourceStatementSchema },
        h1: nonnegativeIntegerSchema,
        raftCommand: {},
    },
};
export const gradedConsensusSchema = {
    $id: "organizing/federate-graded/consensus",
    title: "GradedConsensus",
    description: "Contradiction-aware federation report: shared cells, top-held contested cells, and the nonzero-H1 residue routed through Raft.",
    type: "object",
    additionalProperties: false,
    required: [
        "kind",
        "sources",
        "federation",
        "mergedActivities",
        "coherence",
        "shared",
        "contested",
        "needsCoordination",
        "h1",
        "calm",
        "raft",
        "decomposition",
    ],
    properties: {
        kind: { const: "organizing.federate-graded.consensus" },
        sources: { type: "array", items: { type: "string", minLength: 1 } },
        federation: {},
        mergedActivities: nonnegativeIntegerSchema,
        coherence: { type: "array", items: {} },
        shared: { type: "array", items: sharedCellSchema },
        contested: { type: "array", items: contestedCellSchema },
        needsCoordination: { type: "array", items: needsCoordinationCellSchema },
        h1: {
            type: "object",
            additionalProperties: false,
            required: ["rank", "cells", "cohomology"],
            properties: {
                rank: nonnegativeIntegerSchema,
                cells: { type: "array", items: { type: "string", minLength: 1 } },
                cohomology: {
                    description: "normalized relating cohomology receipt for the nonzero cover H1 residue",
                },
            },
        },
        calm: {},
        raft: {},
        decomposition: {
            type: "object",
            additionalProperties: false,
            required: ["exhaustive", "disjoint", "shared", "contested", "needsCoordination"],
            properties: {
                exhaustive: { type: "boolean" },
                disjoint: { type: "boolean" },
                shared: nonnegativeIntegerSchema,
                contested: nonnegativeIntegerSchema,
                needsCoordination: nonnegativeIntegerSchema,
            },
        },
    },
};
export const gradedConsensusCarrier = carrierFrom(gradedConsensusSchema);
function polarityOf(cellInput) {
    return cellInput.polarity ?? "assert";
}
function statementOf(source, cellInput) {
    return Object.freeze({
        source: source.id,
        protocol: source.protocol,
        cell: cellInput.cell,
        value: cellInput.value,
        polarity: polarityOf(cellInput),
        witness: cellInput.witness,
    });
}
function witnessOf(statement) {
    return cell(Object.freeze({
        bridge: "organizing.federate-graded",
        source: statement.source,
        protocol: statement.protocol,
        cell: statement.cell,
    }), Object.freeze({
        polarity: statement.polarity,
    }), statement.value, Object.freeze({
        source: statement.source,
        protocol: statement.protocol,
        witness: statement.witness,
    }));
}
function sourceWireFromWitness(row) {
    if (row.e === null || typeof row.e !== "object" || Array.isArray(row.e))
        throw new TypeError("federateGraded reading: witness entity is not a record");
    if (row.a === null || typeof row.a !== "object" || Array.isArray(row.a))
        throw new TypeError("federateGraded reading: witness attribute is not a record");
    if (row.t === null || typeof row.t !== "object" || Array.isArray(row.t))
        throw new TypeError("federateGraded reading: witness time is not a record");
    const entity = row.e;
    const attribute = row.a;
    const time = row.t;
    const id = entity.source;
    const protocol = entity.protocol;
    const cellName = entity.cell;
    const polarity = attribute.polarity;
    const witness = time.witness;
    if (typeof id !== "string" || typeof protocol !== "string" || typeof cellName !== "string")
        throw new TypeError("federateGraded reading: malformed entity");
    if (polarity !== "assert" && polarity !== "deny")
        throw new TypeError("federateGraded reading: malformed polarity");
    if (typeof witness !== "string")
        throw new TypeError("federateGraded reading: malformed witness");
    return Object.freeze({
        id,
        protocol,
        collection: Object.freeze([Object.freeze({
                cell: cellName,
                value: row.v,
                polarity,
                witness,
            })]),
    });
}
function sourceReading(source) {
    return Object.freeze({
        id: `organizing.federate-graded.${source.protocol}.${source.id}`,
        toWire: sourceWireFromWitness,
        fromWire: (wire) => {
            if (wire.collection.length !== 1)
                throw new TypeError("federateGraded reading: expected one witnessed cell");
            return witnessOf(statementOf({ id: wire.id, protocol: wire.protocol, collection: wire.collection }, wire.collection[0]));
        },
    });
}
const canonicalReading = Object.freeze({
    id: "organizing.federate-graded.canonical",
    toWire: sourceWireFromWitness,
    fromWire: (wire) => {
        if (wire.collection.length !== 1)
            throw new TypeError("federateGraded canonical reading: expected one witnessed cell");
        return witnessOf(statementOf({ id: wire.id, protocol: wire.protocol, collection: wire.collection }, wire.collection[0]));
    },
});
function activityOf(statement) {
    return Object.freeze({
        "@context": ACTIVITYSTREAMS_CONTEXT,
        id: `urn:organizing:federate-graded:${encodeURIComponent(statement.source)}:${encodeURIComponent(statement.witness)}`,
        type: statement.polarity === "deny" ? "Undo" : "Create",
        actor: statement.cell,
        object: {
            type: "Note",
            content: `${statement.cell}|${canonical(statement.value)}`,
        },
    });
}
function stanceKey(statement) {
    return `${statement.polarity}:${canonical(statement.value)}`;
}
function statementOrder(left, right) {
    return left.cell.localeCompare(right.cell)
        || stanceKey(left).localeCompare(stanceKey(right))
        || left.source.localeCompare(right.source)
        || left.witness.localeCompare(right.witness);
}
function affirmed(witnesses) {
    return charge(chargeValue("potential"), [witnesses.map((witness) => mark(witness)), []]);
}
function heldTop(statements) {
    const byStance = new Map();
    for (const statement of statements) {
        const key = stanceKey(statement);
        byStance.set(key, [...(byStance.get(key) ?? []), statement]);
    }
    const stances = [...byStance.entries()].sort(([left], [right]) => left.localeCompare(right));
    const truthWitnesses = stances[0]?.[1].map((statement) => statement.witness).sort() ?? [];
    const falsityWitnesses = stances.slice(1).flatMap(([, group]) => group.map((statement) => statement.witness)).sort();
    const topCharge = joinKnowledge(affirmed(truthWitnesses), negate(affirmed(falsityWitnesses)));
    const standing = valueOf(topCharge).name;
    if (standing !== "stable")
        throw new TypeError(`federateGraded: expected held top, got ${standing}`);
    return Object.freeze({
        topCharge,
        truthWitnesses: Object.freeze(truthWitnesses),
        falsityWitnesses: Object.freeze(falsityWitnesses),
    });
}
function hasDisagreement(statements) {
    return new Set(statements.map(stanceKey)).size > 1;
}
function coverStatementOf(statement) {
    return Object.freeze({
        source: statement.source,
        cell: statement.cell,
        stance: stanceKey(statement),
        witness: statement.witness,
    });
}
function naturalSize(value) {
    return value.members.length;
}
function h1CohomologyReceipt(certificate) {
    return Object.freeze({
        kind: "organizing.federate-graded.h1-cohomology",
        rank: naturalSize(certificate.rank),
        cells: Object.freeze([...certificate.cells]),
        vanishing: evaluateRunTerm(cohomologyTerms.rankVanishing, certificate.vanishing),
        obstructions: Object.freeze(certificate.obstructions.map((obstruction) => Object.freeze({
            cell: obstruction.cell,
            rank: naturalSize(obstruction.rank),
            vanishing: evaluateRunTerm(cohomologyTerms.rankVanishing, obstruction.vanishing),
            carrier: evaluateRunTerm(cohomologyTerms.carrier, obstruction.cohomology),
        }))),
    });
}
function raftCommandOf(statements) {
    return Object.freeze({
        bridge: "organizing.federate-graded",
        cell: statements[0]?.cell ?? "",
        residue: statements.map((statement) => Object.freeze({
            source: statement.source,
            protocol: statement.protocol,
            value: statement.value,
            polarity: statement.polarity,
            witness: statement.witness,
        })),
    });
}
function calmReading(shared, contested, needsCoordination) {
    return Object.freeze({
        kind: "organizing.writing.calm.reading",
        theorem: "CALM",
        operation: "federate",
        monotone: needsCoordination === 0,
        coordination: needsCoordination === 0 ? "coordination-free" : "consensus-required",
        witness: {
            shared,
            contested,
            federationOnly: needsCoordination,
        },
    });
}
function defaultLeadership(cluster) {
    return Object.freeze({
        kind: "organizing.writing.raft.leadership",
        cluster,
        term: 1,
        leader: "federate-graded",
    });
}
function decompositionIsDisjoint(shared, contested, needsCoordination) {
    const all = [...shared.map((entry) => entry.cell), ...contested.map((entry) => entry.cell), ...needsCoordination.map((entry) => entry.cell)];
    return new Set(all).size === all.length;
}
/**
 * federateGraded - hold cross-source contradiction and grade the consensus cost.
 *
 * Agreement enters `shared`; H1-vanishing disagreement enters `contested` as held
 * top with both witness sides retained; nonzero H1 disagreement enters
 * `needsCoordination` and is the only payload sent through Raft.
 */
export function federateGraded(sources, options = {}) {
    if (sources.length === 0)
        throw new TypeError("federateGraded: at least one source is required");
    const admitted = sources.map((source) => federateGradedSourceCarrier.assert(source, `source ${source.id}`));
    const statements = admitted.flatMap((source) => source.collection.map((entry) => statementOf(source, entry)));
    if (statements.length === 0)
        throw new TypeError("federateGraded: source collections are empty");
    const coherence = admitted.flatMap((source) => {
        const reading = sourceReading(source);
        return source.collection.map((entry) => cohere(reading, canonicalReading, witnessOf(statementOf(source, entry))));
    });
    const activitiesBySource = admitted.map((source) => source.collection.map((entry) => activityOf(statementOf(source, entry))));
    const federation = federateActivities(activitiesBySource);
    const merged = mergeActivities(...activitiesBySource);
    const byCell = new Map();
    for (const statement of statements)
        byCell.set(statement.cell, [...(byCell.get(statement.cell) ?? []), statement]);
    const monotonicity = monotonicityCertificateOfFederatedCover(statements.map(coverStatementOf));
    const h1RankByCell = new Map(monotonicity.obstructions.map((entry) => [entry.cell, naturalSize(entry.rank)]));
    const shared = [];
    const contested = [];
    const needsCoordination = [];
    for (const [cellName, group] of [...byCell.entries()].sort(([left], [right]) => left.localeCompare(right))) {
        const sorted = Object.freeze([...group].sort(statementOrder));
        if (!hasDisagreement(sorted)) {
            shared.push(Object.freeze({
                cell: cellName,
                value: sorted[0].value,
                witnesses: Object.freeze(sorted.map((statement) => statement.witness).sort()),
                statements: sorted,
            }));
            continue;
        }
        const top = heldTop(sorted);
        const h1Rank = h1RankByCell.get(cellName) ?? 0;
        if (h1Rank === 0) {
            contested.push(Object.freeze({
                cell: cellName,
                standing: "stable",
                topCharge: top.topCharge,
                truthWitnesses: top.truthWitnesses,
                falsityWitnesses: top.falsityWitnesses,
                statements: sorted,
                calm: "coordination-free",
            }));
            continue;
        }
        needsCoordination.push(Object.freeze({
            cell: cellName,
            standing: "stable",
            topCharge: top.topCharge,
            truthWitnesses: top.truthWitnesses,
            falsityWitnesses: top.falsityWitnesses,
            statements: sorted,
            h1: h1Rank,
            raftCommand: raftCommandOf(sorted),
        }));
    }
    const h1Cells = Object.freeze(monotonicity.cells);
    const h1Rank = naturalSize(monotonicity.rank);
    const h1Cohomology = h1CohomologyReceipt(monotonicity);
    const calm = calmReading(shared.length, contested.length, h1Rank);
    const cluster = options.cluster ?? options.leadership?.cluster ?? "organizing";
    const proposals = Object.freeze(needsCoordination.map((entry, index) => Object.freeze({
        cluster,
        index: index + 1,
        term: options.leadership?.term ?? 1,
        leader: options.leadership?.leader ?? "federate-graded",
        command: entry.raftCommand,
        witness: `h1:${entry.cell}`,
    })));
    const raft = coordinateByCalmOrRaft(calm, {
        log: options.log ?? emptyRaftLog(cluster),
        ...(needsCoordination.length === 0 && options.leadership === undefined
            ? {}
            : { leadership: needsCoordination.length === 0 ? options.leadership : (options.leadership ?? defaultLeadership(cluster)) }),
        proposals,
        operation: "federateGraded",
    });
    const decomposition = {
        exhaustive: shared.length + contested.length + needsCoordination.length === byCell.size,
        disjoint: decompositionIsDisjoint(shared, contested, needsCoordination),
        shared: shared.length,
        contested: contested.length,
        needsCoordination: needsCoordination.length,
    };
    return gradedConsensusCarrier.assert(Object.freeze({
        kind: "organizing.federate-graded.consensus",
        sources: Object.freeze(admitted.map((source) => source.id)),
        federation,
        mergedActivities: merged.totalItems,
        coherence: Object.freeze(coherence),
        shared: Object.freeze(shared),
        contested: Object.freeze(contested),
        needsCoordination: Object.freeze(needsCoordination),
        h1: {
            rank: h1Rank,
            cells: h1Cells,
            cohomology: h1Cohomology,
        },
        calm,
        raft,
        decomposition,
    }), "graded consensus");
}
//# sourceMappingURL=federate-graded.mjs.map