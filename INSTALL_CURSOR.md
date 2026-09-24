# Mirror Memory — Cursor Connect (honest clone path)

**Goal:** Cursor reads/writes your Mirror vault as shared agent memory (second agent alongside Claude Desktop).  
**Soft Pro Capture:** **HOLD** — no Soft Pro convert / Capture gates.  
**Live Memory UI:** https://web-production-0e178.up.railway.app/memory  
**Package source (pre-npm):** https://github.com/kestrel-devagent/mirror-memory-mcp  
**Siblings:** [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md) · [INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md) (npx draft — **NOT LIVE YET**) · [NPM_ENTRY_CUTOVER.md](./NPM_ENTRY_CUTOVER.md)

**Acceptance:** Connect copies config → Test connection PASS → one plain-English prompt finds a citation.

---

## Until npm is live (clone — use this)

`npm view mirror-memory-mcp version` is still **404**. Do **not** invent an `npx` one-liner. Live Connect ENTRY stays a local path.

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

### Config file

| OS | Path |
| --- | --- |
| macOS / Linux | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |

Also editable via Cursor → Settings → MCP → Edit config.

---

## One sitting (Connect UI)

1. Clone + build (above).
2. Sign in → `/memory` → **Connect** → **Cursor**.
3. Set package path to your local `dist/index.js`.
4. **Copy Cursor config** (mints a short-lived token into the snippet).
5. Paste under `mcpServers` in `~/.cursor/mcp.json` (merge if you already have other servers).
6. Reload MCP: Settings → MCP → toggle off/on, or reload the Cursor window.
7. On `/memory`, **Test connection**.
8. In Cursor chat:  
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

That’s the human dogfood gate for second-agent shared memory.

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

If `node` is missing from Cursor’s PATH, set `command` to an absolute node binary (`{{NODE}}` in Connect templates). Remint token on 401.

---

## After npm (NOT LIVE YET)

When `npm view mirror-memory-mcp version` greens, use [INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md) and Builder cutover in `NPM_ENTRY_CUTOVER.md`. Until then: **clone path only**. Soft Pro Capture **HOLD**.
