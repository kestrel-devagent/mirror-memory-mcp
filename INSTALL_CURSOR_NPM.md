# Mirror Memory — Cursor (npm cutover draft)

> **NOT LIVE YET.** Do not run this `npx` config until `npm view mirror-memory-mcp version` greens. Until then use the clone path in README / INSTALL_*.md.

**Status:** DRAFT until `npm view mirror-memory-mcp version` returns a version. Soft Pro Capture **HOLD**.

Same ENTRY as [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md):

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "npx",
      "args": ["-y", "mirror-memory-mcp@0.1.0"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "{{TOKEN}}"
      }
    }
  }
}
```

Paste into `~/.cursor/mcp.json` under `mcpServers`. Reload MCP. Test on `/memory`. Soft Pro Capture **HOLD**.
