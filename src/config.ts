/** Env config for Mirror Memory MCP. */

const DEFAULT_BASE = "https://web-production-0e178.up.railway.app";

export interface MirrorConfig {
  apiBase: string;
  token: string | undefined;
}

export function loadConfig(): MirrorConfig {
  const apiBase = (
    process.env.MIRROR_API_BASE?.trim() || DEFAULT_BASE
  ).replace(/\/+$/, "");
  const token = process.env.MIRROR_MEMORY_TOKEN?.trim() || undefined;
  return { apiBase, token };
}

export function requireToken(config: MirrorConfig): string {
  if (!config.token) {
    throw new Error(
      "MIRROR_MEMORY_TOKEN is not set. Add your Mirror session or extension sync token to Cursor mcp.json env (see README).",
    );
  }
  return config.token;
}
