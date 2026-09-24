#!/usr/bin/env node
/**
 * Mirror Memory MCP — stdio server for Cursor.
 * Brand: Mirror (Aftermodel rename later). Soft Pro / Capture: out of scope.
 */
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadConfig } from "./config.js";
import { MirrorClient } from "./client.js";
import { registerTools } from "./tools.js";
const VERSION = "0.1.1";
function createServer() {
    const config = loadConfig();
    const client = new MirrorClient(config);
    const server = new McpServer({
        name: "mirror-memory",
        version: VERSION,
    });
    registerTools(server, client);
    console.error(`[mirror-memory-mcp] v${VERSION} base=${config.apiBase} token=${config.token ? "set" : "MISSING"}`);
    return server;
}
void serveStdio(createServer);
//# sourceMappingURL=index.js.map