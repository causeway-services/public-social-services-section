/** A decoded event: data is the joined text, as the EventSource algorithm leaves it. */
export type SseEvent = Readonly<{
    event?: string;
    data: string;
    id?: string;
    retry?: number;
}>;
/** The general encoder: one event record to one frame. Multi-line data emits one data: line per line. */
export declare function sseEventFrame(event: SseEvent): string;
/** The house JSON encoder: a named event whose data line is JSON. */
export declare function sseFrame(name: string, data: unknown, id?: string): string;
/** A comment frame. Parsers discard it; it exists to keep connections warm. */
export declare function sseCommentFrame(text?: string): string;
/** Decode a stream of frames into event records (comments and unknown fields dropped). */
export declare function parseSseStream(text: string): readonly SseEvent[];
//# sourceMappingURL=frame.d.mts.map