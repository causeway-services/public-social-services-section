import { type Newscable } from "@emsenn/organizing-a-newscable";
import type { App } from "@emsenn/http-server";
export declare function createKoiosNewscable(configPath?: string, onSkip?: (message: string) => void): Promise<Newscable>;
export declare function createKoiosNewscableApp(configPath?: string, onSkip?: (message: string) => void): Promise<App>;
export declare function createNewscableApp(cable: Newscable): App;
//# sourceMappingURL=cable-app.d.mts.map