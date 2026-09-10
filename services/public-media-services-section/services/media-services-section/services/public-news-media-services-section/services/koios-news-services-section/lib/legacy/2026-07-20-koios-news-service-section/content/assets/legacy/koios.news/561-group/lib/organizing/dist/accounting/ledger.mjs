// accounting/ledger.mts — the double-entry ledger engine: the adjudicated record-state
// (stage 9 substrate, PORT). Turns parsed entries into a settled paraconsistent model:
//
//   1. build the commodity registry (declared precision, else max observed — formatting never loses digits)
//   2. assign transaction ids; infer the one elided posting amount by graded completion
//   3. synthesize pad-fills (one commodity per pad, nonzero diff only)
//   4. articulate check-claims as utterances — balanced facts settle clean; imbalanced transactions
//      and mismatched balance assertions carry their evidence and surface on the worklist
//   5. settle ONCE through the one descent (utterances → fixed-point section)
//   6. compute final per-account totals UNCONDITIONALLY (the no-halt guarantee)
//
// Genuine programming bugs may throw; bad ledger DATA may not. An imbalanced transaction or a
// failed assertion is a HELD value on the worklist, never an error (INVARIANT). The running
// balances are always computed, regardless of how many cells hold (INVARIANT, no-halt).
//
// PORT note (CLAUDE.md "Absence" + the rebuild authority note
// dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md):
// the retired `@emsenn/animating/.../accounting` subpath is gone — an absence is a design judgment,
// not a thing to revive. This module now OWNS the ledger-domain carrier records and conservation
// functions that have NO relating/analysis analogue (Registry / Entry / Transaction / Posting /
// Directive / Malformed / makeRegistry / declareCommodity / observe / inferElided / balances /
// postingHolding / txnId / the type guards), RE-DERIVED here on the trading `Money` carrier (an
// exact graded `Rational`, never a float) from ./money, and on the corpus conservation law from
// ./conservation. Money replaces every Amount / add / negate / isZero / toExactString / zero of the
// dead path; the double-entry law replaces the dead balances / inferElided.
//
// The settling engine is @emsenn/relating's meme-topology — the one descent (the-ways #7). This
// module carries no settling logic of its own; the ledger is a *site* mounted on the shared engine,
// whose vocabulary is the check-claims below (the-ways #6 — the address is the proof: the canonical
// content identifying a cell rides in its subject mark).
import { articulate, fixedPoints, fixedPointReadings, posit, predicate, predicationSite, sectionOf, partitionSection, mark, utterance, } from "@emsenn/relating";
import { addMoney, negateMoney, isZeroMoney, subMoney, timesMoney, moneyZero, commodityOf, toExactString, gradedBalanceOf, inferElidedMoney, } from "@emsenn/relating/economy";
function positLog(utterances) {
    const generated = utterances.map((carrier) => predicate(articulate(carrier)));
    const site = predicationSite(generated.flatMap((s) => [...s.cells.cells, ...s.specializations]));
    return posit(site);
}
export function fixedPointReadingsOfUtterances(utterances) {
    return fixedPointReadings(fixedPoints(positLog(utterances)));
}
// ── Constructors ──────────────────────────────────────────────────────────────
export function posting(params) {
    return Object.freeze({
        account: params.account,
        amount: params.amount ?? null,
        cost: params.cost ?? null,
        price: params.price ?? null,
        balanceAssertion: params.balanceAssertion ?? null,
        meta: params.meta ?? {},
    });
}
export function transaction(params) {
    return Object.freeze({
        id: params.id ?? null,
        date: params.date,
        time: params.time ?? null,
        flag: params.flag ?? null,
        payee: params.payee ?? null,
        narration: params.narration,
        postings: Object.freeze([...params.postings]),
        tags: Object.freeze([...(params.tags ?? [])]),
        links: Object.freeze([...(params.links ?? [])]),
        meta: params.meta ?? {},
        code: params.code ?? null,
        source: params.source ?? null,
    });
}
export function open(params) {
    return Object.freeze({
        directive: "open",
        date: params.date ?? null,
        account: params.account,
        commodities: Object.freeze([...(params.commodities ?? [])]),
        booking: params.booking ?? null,
        source: params.source ?? null,
    });
}
export function close(params) {
    return Object.freeze({ directive: "close", date: params.date, account: params.account, source: params.source ?? null });
}
export function commodity(params) {
    return Object.freeze({
        directive: "commodity",
        date: params.date ?? null,
        symbol: params.symbol,
        precision: params.precision ?? null,
        meta: params.meta ?? {},
        source: params.source ?? null,
    });
}
export function price(params) {
    return Object.freeze({ directive: "price", date: params.date, commodity: params.commodity, amount: params.amount, source: params.source ?? null });
}
export function pad(params) {
    return Object.freeze({ directive: "pad", date: params.date, account: params.account, padAccount: params.padAccount, source: params.source ?? null });
}
export function balance(params) {
    return Object.freeze({
        directive: "balance",
        date: params.date,
        account: params.account,
        amount: params.amount,
        tolerance: params.tolerance ?? null,
        source: params.source ?? null,
    });
}
export function option(params) {
    return Object.freeze({ directive: "option", date: null, key: params.key ?? null, value: params.value ?? null, source: params.source ?? null });
}
export function include(params) {
    return Object.freeze({ directive: "include", date: null, path: params.path ?? null, resolved: false, error: null, source: params.source ?? null });
}
export function malformed(params) {
    return Object.freeze({ kind: "malformed", raw: params.raw, reason: params.reason, source: params.source ?? null });
}
// ── Type guards (re-derived) ──────────────────────────────────────────────────
export function isTransaction(e) {
    return typeof e === "object" && e !== null && Array.isArray(e.postings);
}
export function isDirective(e) {
    return typeof e === "object" && e !== null && typeof e.directive === "string";
}
export function isMalformed(e) {
    return typeof e === "object" && e !== null && e.kind === "malformed";
}
export function makeRegistry() {
    return { prec: new Map() };
}
export function declareCommodity(r, symbol, precision) {
    r.prec.set(symbol, precision);
}
export function observe(r, symbol, precision) {
    const cur = r.prec.get(symbol);
    if (cur === undefined || precision > cur)
        r.prec.set(symbol, precision);
}
// precisionFromMoney — display precision implied by a Money value: the number of decimal places its
// exact rational needs, i.e. how many factors of 2 and 5 the (reduced) denominator carries. A
// non-terminating rational (other prime factors) saturates at that factor count — formatting then
// rounds, but the registry only needs the terminating-place hint. Reads the Rational denominator,
// never a float.
function precisionFromMoney(m) {
    const den = moneyDenominator(m);
    let twos = 0;
    let d = den;
    while (d > 1n && d % 2n === 0n) {
        d /= 2n;
        twos++;
    }
    let fives = 0;
    d = den;
    while (d > 1n && d % 5n === 0n) {
        d /= 5n;
        fives++;
    }
    return Math.max(twos, fives);
}
// moneyDenominator — the bigint denominator of a Money's exact value, parsed from its lossless
// `num/den COMMODITY` string. Equal values give equal strings (both reduced), so this is exact.
function moneyDenominator(m) {
    const exact = toExactString(m); // "num/den COMMODITY"
    const slash = exact.indexOf("/");
    const space = exact.indexOf(" ", slash);
    const denStr = exact.slice(slash + 1, space === -1 ? exact.length : space);
    return BigInt(denStr.trim());
}
// ── Posting weights & holdings (re-derived double-entry law on Money) ──────────
// postingWeight — the commodity weight a posting contributes to its transaction's BALANCE check.
// Precedence: cost > price > face. A total-kind reduces to the stated total with the posting's sign;
// per-unit reduces to units × per-unit in the reducer commodity (timesMoney: the dimensional product
// shares × price → cash). Elided → null.
function postingWeight(p) {
    const a = p.amount;
    if (a === null)
        return null;
    const reduce = (reducer, totalKind) => {
        const r = reducer.amount;
        if (r === null)
            return a; // empty {} = face
        if (totalKind) {
            // total cost/price: the stated total, signed by the posting's direction.
            const positiveTotal = isNegative(r) ? negateMoney(r) : r;
            return isNegative(a) ? negateMoney(positiveTotal) : positiveTotal;
        }
        // per-unit: units × per-unit, dimensionally into the reducer's commodity (shares × price → cash).
        return timesMoney(a, r, commodityOf(r));
    };
    if (p.cost)
        return reduce(p.cost, p.cost.kind === "total");
    if (p.price)
        return reduce(p.price, p.price.kind === "@@");
    return a;
}
// isNegative — sign of a Money (used by the cost/price total-sign rule). Exact: read from the
// lossless rational string, never a float.
function isNegative(m) {
    return moneyNumeratorSign(m) < 0;
}
// moneyNumeratorSign — the sign of a Money's exact value, read from its lossless `num/den COMMODITY`
// string (den is always > 0 in reduced form, so the numerator carries the sign).
function moneyNumeratorSign(m) {
    if (isZeroMoney(m))
        return 0;
    const exact = toExactString(m);
    return exact.trimStart().startsWith("-") ? -1 : 1;
}
// postingHolding — what a posting ADDS TO ITS ACCOUNT: the face amount, always. This is what account
// balances accumulate. Elided → null. (Exported: siblings read account holdings off raw postings.)
export function postingHolding(p) {
    return p.amount;
}
// weightsOf — the non-elided posting weights of a transaction, the graded 0-chain whose vanishing is
// "the books balance".
function weightsOf(postings) {
    const weights = [];
    for (const p of postings) {
        const w = postingWeight(p);
        if (w !== null)
            weights.push(w);
    }
    return weights;
}
// inferElided — if exactly ONE posting has amount === null, solve for it by graded completion: the
// missing leg is whatever closes the residual of the others, possible precisely when that residual
// lives in a single commodity (./conservation inferElidedMoney). 0 or >1 elided, or an ambiguous
// residual → unchanged. The completion is a graded judgment, not a throw.
export function inferElided(txn, _registry) {
    const postings = txn.postings;
    const elidedIdxs = [];
    for (let i = 0; i < postings.length; i++) {
        if ((postings[i]?.amount ?? null) === null)
            elidedIdxs.push(i);
    }
    if (elidedIdxs.length !== 1)
        return txn;
    const elidedIdx = elidedIdxs[0];
    const known = weightsOf(postings.filter((_, i) => i !== elidedIdx));
    const completion = inferElidedMoney(known);
    if (!isCompletionWitness(completion))
        return txn;
    const inferred = completion.inferred;
    const newPostings = postings.map((p, i) => (i === elidedIdx ? { ...p, amount: inferred } : p));
    return { ...txn, postings: newPostings };
}
// isCompletionWitness — a graded completion succeeded (the single missing posting was inferred). The
// witness carries `.inferred`; an obstruction carries a `reason` ("balanced" | "ambiguous"). We
// discriminate structurally so the contract is robust to the exact judgment kind string.
function isCompletionWitness(j) {
    return typeof j.inferred !== "undefined"
        && typeof j.reason === "undefined";
}
// balances — does this transaction conserve? The graded double-entry judgment (./conservation
// gradedBalanceOf): balanced is the witness; on obstruction the surviving per-commodity residuals
// are the syndrome, rendered exact. Truth is exact (the residual vanishes), never a tolerance.
export function balances(txn, _registry) {
    const judgment = gradedBalanceOf(weightsOf(txn.postings));
    const residual = balanceResidual(judgment);
    return {
        balanced: residual.length === 0,
        residualStrings: residual.map((m) => toExactString(m)),
    };
}
// balanceResidual — the surviving per-sector residual of a graded conservation judgment, [] when the
// 0-chain conserves. Read structurally: the witness has no residual; the obstruction carries one.
function balanceResidual(j) {
    const residual = j.residual;
    return residual ?? [];
}
// txnId — the canonical id for a transaction with no explicit id: its date and per-date ordinal.
export function txnId(date, ordinal) {
    return `txn:${date}:${ordinal}`;
}
// ── Ledger check-claim vocabulary (this site's predicates over the one descent) ──
// Each transaction and balance assertion settles as one (subject, predicate) cell. Evidence
// (residual amounts; computed vs asserted) rides in the subject mark — the canonical content that
// identifies the cell (the-ways #6). "Held problems" are read back off the settled section by
// predicate. Imbalance/mismatch are HELD values on the worklist, never thrown (INVARIANT).
const BALANCED = "ledger.balanced";
const IMBALANCED = "ledger.imbalanced";
const BALANCE_HOLDS = "ledger.balance-holds";
const BALANCE_MISMATCH = "ledger.balance-mismatch";
const PROBLEM_PREDICATES = new Set([IMBALANCED, BALANCE_MISMATCH]);
// ── Registry construction ──────────────────────────────────────────────────────
function buildRegistry(entries) {
    const registry = makeRegistry();
    for (const e of entries) {
        if (isDirective(e) && e.directive === "commodity" && e.precision !== null) {
            declareCommodity(registry, e.symbol, e.precision);
        }
    }
    for (const e of entries) {
        if (!isTransaction(e))
            continue;
        for (const p of e.postings) {
            if (p.amount)
                observe(registry, commodityOf(p.amount), precisionFromMoney(p.amount));
            if (p.cost?.amount)
                observe(registry, commodityOf(p.cost.amount), precisionFromMoney(p.cost.amount));
            if (p.price?.amount)
                observe(registry, commodityOf(p.price.amount), precisionFromMoney(p.price.amount));
            if (p.balanceAssertion?.amount) {
                observe(registry, commodityOf(p.balanceAssertion.amount), precisionFromMoney(p.balanceAssertion.amount));
            }
        }
    }
    return registry;
}
// ── Transaction preparation ──────────────────────────────────────────────────
function prepareTransactions(entries, registry) {
    const ordinalByDate = new Map();
    return entries.map((e) => {
        if (!isTransaction(e))
            return e;
        let txn = e;
        if (!txn.id) {
            const ord = ordinalByDate.get(txn.date) ?? 0;
            ordinalByDate.set(txn.date, ord + 1);
            txn = { ...txn, id: txnId(txn.date, ord) };
        }
        else {
            ordinalByDate.set(txn.date, (ordinalByDate.get(txn.date) ?? 0) + 1);
        }
        return inferElided(txn, registry);
    });
}
// ── Running balances — UNCONDITIONAL (the no-halt guarantee) ────────────────────
function addHolding(totals, account, w) {
    if (w === null)
        return;
    let byCommodity = totals.get(account);
    if (!byCommodity) {
        byCommodity = new Map();
        totals.set(account, byCommodity);
    }
    const commodity = commodityOf(w);
    const cur = byCommodity.get(commodity);
    byCommodity.set(commodity, cur ? addMoney(cur, w) : w);
}
export function runningBalances(transactions, _registry) {
    const ordered = [...transactions]
        .map((t, i) => ({ t, i }))
        .sort((a, b) => (a.t.date < b.t.date ? -1 : a.t.date > b.t.date ? 1 : a.i - b.i))
        .map(({ t }) => t);
    const totals = new Map();
    for (const txn of ordered) {
        for (const p of txn.postings)
            addHolding(totals, p.account, postingHolding(p));
    }
    for (const [account, byCommodity] of totals) {
        for (const [commodity, amt] of byCommodity)
            if (isZeroMoney(amt))
                byCommodity.delete(commodity);
        if (byCommodity.size === 0)
            totals.delete(account);
    }
    return totals;
}
// balanceAt — running balance of `account` in `commodity` strictly before `date` (beancount
// start-of-day semantics: a `balance` directive on day D checks postings dated < D).
export function balanceAt(transactions, _registry, account, commodity, date) {
    let acc = null;
    for (const txn of transactions) {
        if (!(txn.date < date))
            continue;
        for (const p of txn.postings) {
            if (p.account !== account)
                continue;
            const w = postingHolding(p);
            if (w === null || commodityOf(w) !== commodity)
                continue;
            acc = acc ? addMoney(acc, w) : w;
        }
    }
    return acc ?? moneyZero(commodity);
}
function padFills(entries, transactions, registry) {
    const synthesized = [];
    const padded = new Set();
    const pads = entries.filter((e) => isDirective(e) && e.directive === "pad");
    for (const e of entries) {
        if (!(isDirective(e) && e.directive === "balance"))
            continue;
        const bal = e;
        const pad = pads
            .filter((p) => p.account === bal.account && p.date <= bal.date)
            .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
            .pop();
        if (!pad)
            continue;
        const comm = commodityOf(bal.amount);
        const allTxns = [...transactions, ...synthesized];
        const current = balanceAt(allTxns, registry, bal.account, comm, bal.date);
        const target = bal.amount;
        const diff = subMoney(target, current);
        if (isZeroMoney(diff))
            continue;
        const synthId = `pad:${bal.account}:${pad.date}:${bal.date}`;
        synthesized.push({
            id: synthId,
            date: pad.date,
            time: null,
            flag: "P",
            payee: null,
            narration: `pad ${bal.account} from ${pad.padAccount}`,
            postings: [
                { account: bal.account, amount: diff, cost: null, price: null, balanceAssertion: null, meta: { padSynthetic: true } },
                { account: pad.padAccount, amount: negateMoney(diff), cost: null, price: null, balanceAssertion: null, meta: { padSynthetic: true } },
            ],
            tags: [],
            links: [],
            meta: { padSynthetic: true },
            code: null,
            source: { synthesizedFrom: "pad", pad: pad.source ?? null, balance: bal.source ?? null },
        });
        padded.add(`${bal.account}@${bal.date}`);
    }
    return { synthesized, padded };
}
// ── Main orchestrator ─────────────────────────────────────────────────────────
export default function loadLedger(entries) {
    const list = Array.isArray(entries) ? entries : [];
    const registry = buildRegistry(list);
    const prepared = prepareTransactions(list, registry);
    const transactions = prepared.filter(isTransaction);
    const directives = list.filter(isDirective);
    const malformedEntries = list.filter(isMalformed);
    const { synthesized, padded } = padFills(list, transactions, registry);
    const allTxns = [...transactions, ...synthesized];
    // ── Articulate check-claims as utterances on the one descent ────────────────
    const utterances = [];
    // One cell per transaction. Balanced facts settle clean; imbalanced ones carry their residual and
    // surface on the worklist. Imbalance is a HELD value, not an error (the no-halt guarantee).
    for (const txn of transactions) {
        if (!txn.id)
            continue;
        const { balanced, residualStrings } = balances(txn, registry);
        utterances.push(balanced
            ? utterance(mark({ kind: "transaction", id: txn.id }), mark(BALANCED))
            : utterance(mark({ kind: "transaction", id: txn.id, residual: residualStrings }), mark(IMBALANCED)));
    }
    // Balance assertions (directive + inline posting), start-of-day semantics. The computed running
    // balance is recorded; a mismatch carries computed-vs-asserted and surfaces on the worklist.
    const assertBalance = (account, date, commodity, asserted) => {
        const computed = toExactString(balanceAt(allTxns, registry, account, commodity, date));
        const assertedStr = toExactString(asserted);
        utterances.push(computed === assertedStr
            ? utterance(mark({ kind: "balance-check", account, date, commodity, computed }), mark(BALANCE_HOLDS))
            : utterance(mark({ kind: "balance-check", account, date, commodity, computed, asserted: assertedStr }), mark(BALANCE_MISMATCH)));
    };
    for (const e of directives) {
        if (e.directive === "balance")
            assertBalance(e.account, e.date, commodityOf(e.amount), e.amount);
    }
    for (const txn of transactions) {
        for (const p of txn.postings) {
            if (p.balanceAssertion?.amount) {
                assertBalance(p.account, txn.date, commodityOf(p.balanceAssertion.amount), p.balanceAssertion.amount);
            }
        }
    }
    // ── Settle ONCE ─────────────────────────────────────────────────────────────
    // The utterance log descends through articulate → predicate → posit → settle to a fixed-point
    // section. The worklist is this site's reading of that section: any held contradiction (⊤, the
    // `stable` charge) plus the ledger's diagnostic claims. There is exactly one descent.
    const section = sectionOf(fixedPointReadingsOfUtterances(utterances).knowledgeLeast);
    const heldContradictions = new Set(partitionSection(section).stable);
    const isHeld = (entry) => heldContradictions.has(entry) || PROBLEM_PREDICATES.has(entry.cell.predicate.mark.value);
    const worklist = section.entries.filter(isHeld);
    const clean = section.entries.filter((entry) => !isHeld(entry));
    // ── Final per-account totals — UNCONDITIONAL (no-halt guarantee) ────────────
    const balanceTotals = runningBalances(allTxns, registry);
    return {
        registry,
        transactions: prepared.filter(isTransaction),
        directives,
        malformed: malformedEntries,
        synthesized,
        padded,
        balances: balanceTotals,
        section,
        clean,
        worklist,
    };
}
//# sourceMappingURL=ledger.mjs.map