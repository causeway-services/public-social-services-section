/**
 * allocating — socializing's FAIR DIVISION of indivisible work-items among agents. The office layer
 * (`office.mts`) binds a work-item to an agent as a duty (`assign`); this decides WHICH agent gets
 * which item FAIRLY, the central question for a swarm drawing from a shared pool of labor: split the
 * work without envy or starvation.
 *
 * Indivisible goods admit no perfectly envy-free split in general, so the modern fairness literature
 * uses relaxations. Round-robin picking (each agent in turn takes its most-valued remaining item)
 * guarantees ENVY-FREENESS UP TO ONE ITEM (EF1): any residual envy is erased by removing a single item
 * from the envied bundle (Caragiannis et al. 2019, Lipton et al. 2004). We also report PROPORTIONALITY
 * (each agent gets ≥ 1/n of its own total valuation) and the NASH WELFARE (the product of utilities —
 * the allocation maximizing it is EF1 and Pareto-efficient; we report it for the round-robin result).
 *
 * Valuations are additive: each agent values each work-item, and a bundle's value is the sum.
 */
/** An allocation of work-items to agents and its fairness diagnostics. */
export interface Allocation {
    readonly kind: "socializing.allocation";
    /** the bundle of work-item ids each agent received. */
    readonly bundles: Readonly<Record<string, readonly string[]>>;
    /** each agent's utility (its additive valuation of its own bundle). */
    readonly utility: Readonly<Record<string, number>>;
    /** ENVY-FREE UP TO ONE ITEM: every agent's envy of another vanishes after removing one item from
     *  the envied bundle. Guaranteed by round-robin for additive valuations. */
    readonly ef1: boolean;
    /** PROPORTIONAL: every agent receives at least 1/n of its own valuation of the whole pool. */
    readonly proportional: boolean;
    /** the Nash welfare — the product of the agents' utilities (0 if any agent got nothing it values). */
    readonly nashWelfare: number;
    /** fully ENVY-FREE: no agent prefers another's bundle outright (rare for indivisible goods). */
    readonly envyFree: boolean;
}
type Valuations = Readonly<Record<string, Readonly<Record<string, number>>>>;
/**
 * allocateWork — assign indivisible work-items to agents by ROUND-ROBIN picking in the given agent
 * order: each agent, in turn, takes its most-valued remaining item until the pool is empty. Returns
 * the bundles and the fairness diagnostics (EF1, proportionality, Nash welfare, exact envy-freeness).
 * Round-robin guarantees EF1 for additive valuations; the other properties are reported, not forced.
 */
export declare function allocateWork(agents: readonly string[], items: readonly string[], valuations: Valuations): Allocation;
export {};
//# sourceMappingURL=allocating.d.mts.map