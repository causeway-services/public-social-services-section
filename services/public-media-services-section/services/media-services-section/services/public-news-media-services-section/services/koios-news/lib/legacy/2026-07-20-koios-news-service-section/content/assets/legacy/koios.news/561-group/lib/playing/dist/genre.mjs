import { playAffect } from "./affect.mjs";
const resolves = (c) => {
    const last = c.actions[c.actions.length - 1];
    return last !== undefined && last.variety !== "daimon";
};
function exemplar(chronicles) {
    let longest;
    for (const c of chronicles)
        if (longest === undefined || c.actions.length > longest.actions.length)
            longest = c;
    return longest;
}
function halves(c) {
    const mid = Math.ceil(c.actions.length / 2);
    return {
        opening: Object.freeze({ kind: "game.chronicle", actions: Object.freeze(c.actions.slice(0, mid)) }),
        closing: Object.freeze({ kind: "game.chronicle", actions: Object.freeze(c.actions.slice(mid)) }),
    };
}
function signatureAffect(chronicles) {
    const tally = new Map();
    for (const c of chronicles) {
        const affect = playAffect(c).dominant;
        tally.set(affect, (tally.get(affect) ?? 0) + 1);
    }
    let best = "interest";
    let bestCount = -1;
    for (const [affect, count] of tally)
        if (count > bestCount) {
            bestCount = count;
            best = affect;
        }
    return best;
}
/**
 * genre — read a genre off the set of plays that count within its frame (the behaviour's chronicles):
 * how many resolve vs surrender, whether it is an IMPASSE (no play resolves — Berlant's cruel optimism),
 * the affect-arc of its exemplar play (opening affect → closing affect), and its affective signature.
 * The formal half (which plays count) is the behaviour the caller supplies; this reads the felt half.
 */
export function genre(chronicles) {
    const plays = chronicles.length;
    const resolving = chronicles.filter(resolves).length;
    const surrenders = chronicles.filter((c) => c.actions[c.actions.length - 1]?.variety === "daimon").length;
    const sample = exemplar(chronicles);
    const arc = sample === undefined
        ? { opening: "interest", closing: "interest", moves: false }
        : (() => {
            const { opening, closing } = halves(sample);
            const o = playAffect(opening).dominant;
            const c = playAffect(closing).dominant;
            return { opening: o, closing: c, moves: o !== c };
        })();
    return Object.freeze({
        kind: "playing.genre",
        plays,
        resolving,
        surrenders,
        impasse: plays > 0 && resolving === 0,
        arc,
        signature: signatureAffect(chronicles),
    });
}
//# sourceMappingURL=genre.mjs.map