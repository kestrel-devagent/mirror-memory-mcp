# Mirror Memory — Claude Desktop Connect (honest clone path)

**Goal:** Claude Desktop reads/writes your Mirror vault via the same Connect path as Cursor.  
**Soft Pro Capture:** **HOLD** — no Soft Pro convert / Capture gates.  
**Live Memory UI:** https://web-production-0e178.up.railway.app/memory  
**Package source (pre-npm):** https://github.com/kestrel-devagent/mirror-memory-mcp  
**Sibling:** [INSTALL_HUDSON.md](./INSTALL_HUDSON.md) (Cursor) · [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md) (npx draft — **NOT LIVE YET**)

---

## Until npm is live (clone — use this)

`npm view mirror-memory-mcp version` is still **404**. Do **not** invent an `npx` one-liner.

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp
npm install
npm run build
```

**ENTRY** = absolute path to that clone’s `dist/index.js`, e.g.:

```text
/Users/you/mirror-memory-mcp/dist/index.js
```

Connect UI placeholder: `/path/to/mirror-memory-mcp/dist/index.js` (never a founder machine path).

### Config file locations

| OS | Path |
| --- | --- |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` (if Desktop is installed) |

---

## Fast path (Connect UI)

1. Clone + build (above).
2. Sign in → `/memory` → **Connect** → **Claude Desktop**.
3. Set package path to your local `dist/index.js`.
4. **Copy Claude Desktop config** (mints a short-lived token into the snippet).
5. Paste under `mcpServers` in `claude_desktop_config.json` (merge if you already have other servers).
6. **Fully quit** Claude Desktop (**Cmd-Q** on macOS — closing the window is **not** enough), then relaunch.
7. On `/memory`, **Test connection**, or ask Claude:  
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

---

## Manual fallback

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "node",
      "args": ["/path/to/mirror-memory-mcp/dist/index.js"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "<paste token from /memory>"
      }
    }
  }
}
```

If `node` is not on PATH for Claude’s launcher, set `command` to the absolute node binary (same as Connect’s `{{NODE}}`).

Remint token on 401. Soft Pro Capture **HOLD**.

---

## After npm (NOT LIVE YET)

When `npm view mirror-memory-mcp version` greens, use [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md) and Builder cutover in `NPM_ENTRY_CUTOVER.md`. Until then: **clone path only**.
