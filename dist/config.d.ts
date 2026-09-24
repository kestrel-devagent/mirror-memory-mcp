/** Env config for Mirror Memory MCP. */
export interface MirrorConfig {
    apiBase: string;
    token: string | undefined;
}
export declare function loadConfig(): MirrorConfig;
export declare function requireToken(config: MirrorConfig): string;
