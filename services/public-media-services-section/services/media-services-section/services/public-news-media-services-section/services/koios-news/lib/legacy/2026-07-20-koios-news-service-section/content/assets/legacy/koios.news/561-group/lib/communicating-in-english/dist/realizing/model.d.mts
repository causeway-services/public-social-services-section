import type { Corpus, CorpusAssertion, SettledToken, SettlingModel } from "./types.mjs";
declare const PRECEDES = "precedes";
declare const DENIES = "denies";
export declare const emptyCorpus: Corpus;
export declare function ingest(corpus: Corpus, text: string, witness?: unknown): Corpus;
export declare function recall(corpus: Corpus, context: string): readonly CorpusAssertion[];
export declare function predict(corpus: Corpus, context: string): readonly SettledToken[];
export declare function settleNext(corpus: Corpus, context: string): SettledToken;
export declare function model(seedText?: string, witness?: unknown): SettlingModel;
export { PRECEDES, DENIES };
//# sourceMappingURL=model.d.mts.map