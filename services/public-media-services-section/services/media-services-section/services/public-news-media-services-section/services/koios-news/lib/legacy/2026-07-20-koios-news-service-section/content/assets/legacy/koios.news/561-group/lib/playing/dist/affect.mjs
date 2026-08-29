const POSITIVE = new Set(["interest", "enjoyment"]);
const NEUTRAL = new Set(["surprise"]);
const valenceOf = (affect) => POSITIVE.has(affect) ? "positive" : NEUTRAL.has(affect) ? "neutral" : "negative";
/**
 * playAffect — read the dominant Tomkins affect of a chronicle off its stimulation gradient (the
 * branching `ramification` opened at each action). A give-up (Daimon) fires shame; a startling onset
 * (maximal stimulation at the first move) fires surprise; a steep build fires fear, a moderate build
 * interest; sustained-high-without-relief fires anger, sustained-moderate distress; a smooth low or
 * resolved line settles to enjoyment. The empty play is bare attention (interest).
 */
export function playAffect(c) {
    const sizes = c.actions.map((action) => action.ramification.length);
    const length = c.actions.length;
    const onset = sizes[0] ?? 0;
    const peak = sizes.reduce((max, size) => Math.max(max, size), 0);
    const buildup = peak - onset;
    const last = c.actions[length - 1];
    const surrender = last?.variety === "daimon";
    let dominant;
    const fell = (sizes[length - 1] ?? 0) < onset;
    if (length === 0)
        dominant = "interest";
    else if (surrender)
        dominant = "shame";
    else if (onset >= 2 && onset === peak && length >= 2 && fell)
        dominant = "surprise";
    else if (buildup >= 2)
        dominant = "fear";
    else if (buildup === 1)
        dominant = "interest";
    else if (peak >= 2)
        dominant = "anger";
    else if (peak === 1)
        dominant = "distress";
    else
        dominant = "enjoyment";
    return Object.freeze({
        kind: "playing.play-affect",
        dominant,
        valence: valenceOf(dominant),
        onset,
        peak,
        buildup,
        length,
        surrender,
    });
}
//# sourceMappingURL=affect.mjs.map