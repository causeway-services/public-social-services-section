import type { IncomingMessage } from "node:http";
export type CidrMatcher = {
    family: 4 | 6;
    contains(ip: string): boolean;
};
/** Strip IPv4-mapped IPv6 prefix (::ffff:) and zone id (%...). */
export declare function normalizeIp(ip: string | undefined): string;
/** The real client IP: socket address or first X-Forwarded-For entry when explicitly trusted. */
export declare function clientIp(req: IncomingMessage, opts?: {
    trustProxy?: boolean | number;
}): string;
/** Parse a CIDR string into a matcher. Bare addresses match only themselves. */
export declare function parseCidr(cidr: string): CidrMatcher | null;
/** Test an IP against a CIDR string or parsed matcher. */
export declare function inCidr(ip: string, cidr: string | CidrMatcher | null): boolean;
//# sourceMappingURL=net.d.mts.map