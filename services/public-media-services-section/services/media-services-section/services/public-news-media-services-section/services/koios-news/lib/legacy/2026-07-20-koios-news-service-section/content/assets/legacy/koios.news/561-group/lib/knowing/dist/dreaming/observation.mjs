/**
 * observation — an observer's charged claim about a task.
 *
 * The shared currency of knowing's dreaming: the knower dreams new observations by
 * recombining held ones (the three inward regimes) or by reaching outside the
 * settled fibers for genuinely new generators (the aperiodic regime). It carries a
 * `charge`, so it interoperates with anything that reads a charge (e.g. socializing's
 * `sheafObservations`, which keys only on `.charge`).
 */
/** Build a frozen `Observation`, dropping absent optional fields. */
export function observation(input) {
    return Object.freeze({
        observer: input.observer,
        task: input.task,
        charge: input.charge,
        ...(input.at === undefined ? {} : { at: input.at }),
        ...(input.note === undefined ? {} : { note: input.note }),
    });
}
//# sourceMappingURL=observation.mjs.map