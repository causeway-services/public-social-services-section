/** Sec-WebSocket-Accept derivation: the handshake's key representation. */
export declare function acceptKey(clientKey: string): string;
/** Encode one frame in server framing (unmasked). */
export declare function encodeFrame(opcode: number, data?: Buffer, fin?: boolean): Buffer;
export type WsFrame = {
    fin: boolean;
    opcode: number;
    payload: Buffer;
    masked: boolean;
    tooLarge?: boolean;
};
/** Incremental decoder: push bytes as they arrive, get complete frames back, unmasked. */
export declare class FrameDecoder {
    private buf;
    private readonly opts;
    constructor(opts?: {
        maxPayload?: number;
    });
    push(chunk: Buffer): WsFrame[];
    private next;
}
//# sourceMappingURL=frame.d.mts.map