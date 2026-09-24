# Mirror Memory — Claude Desktop Connect

**Goal:** Claude Desktop reads/writes your Mirror vault via the same Connect path as Cursor.

**Live:** https://web-production-0e178.up.railway.app/memory  
**Package source (pre-npm):** https://github.com/kestrel-devagent/mirror-memory-mcp  
**Sibling:** [INSTALL_HUDSON.md](./INSTALL_HUDSON.md) (Cursor)

---

## Until npm is live (clone)

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp && npm install && npm run build
```

ENTRY = absolute path to your local `dist/index.js`.  
**After npm (NOT LIVE YET):** no `npx` until registry greens.

---

## Fast path

1. Clone + build (above).
2. Sign in → `/memory` → **Connect** → **Claude Desktop**.
3. Set entry path to your local `dist/index.js`, **Copy Claude Desktop config**.
4. Paste into `~/Library/Application Support/Claude/claude_desktop_config.json` under `mcpServers`.
5. **Fully quit** Claude Desktop (**Cmd-Q** — closing the window is not enough), then relaunch.
6. On `/memory`, **Test connection** or ask Claude:  
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

---

## Manual fallback

Same `mcpServers.mirror-memory` block as Cursor (`command` / `args` / `env` with `MIRROR_API_BASE` + `MIRROR_MEMORY_TOKEN`). Soft Pro Capture **HOLD**.
