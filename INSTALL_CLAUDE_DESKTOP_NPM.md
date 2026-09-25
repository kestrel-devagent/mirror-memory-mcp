# Mirror Memory — Claude Desktop (npm)

**Status:** LIVE — `mirror-memory-mcp@0.1.1`. Soft Pro Capture **HOLD**.

**Package:** `mirror-memory-mcp@0.1.1`  
**Live host:** https://web-production-0e178.up.railway.app  
**Sibling (clone fallback):** [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md)

---

## One sitting

1. Sign in → `/memory` → **Connect your agents** → **Claude Desktop**.
2. **Copy Claude Desktop config** (token filled in).
3. Paste into `~/Library/Application Support/Claude/claude_desktop_config.json` under `mcpServers` (merge if you already have other servers).
4. **Fully quit** Claude Desktop (**Cmd-Q** — closing the window is not enough), then relaunch.
5. On `/memory`, **Test connection**, or ask Claude:
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

No clone. No `npm install && npm run build`. No absolute path to `dist/index.js`.

---

## Config blob

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "npx",
      "args": ["-y", "mirror-memory-mcp@0.1.1"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "{{TOKEN}}"
      }
    }
  }
}
```

**Windows / Linux Claude config paths differ; same `mcpServers` block.** Soft Pro Capture **HOLD**.
