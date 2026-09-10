// date.mts — HTTP-date (RFC 9110 §5.6.7), emitted as IMF-fixdate.
//
// Semantic value: an instant. Wire form: the date text. The pair is a
// RETRACTION onto second precision: parseHttpDate ∘ httpDate = id up
// to the sub-second part httpDate cannot carry, and parseHttpDate also
// accepts the obsolete forms a Date parser tolerates.
export function httpDate(when = new Date()) {
    return new Date(when).toUTCString();
}
export function parseHttpDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
//# sourceMappingURL=date.mjs.map