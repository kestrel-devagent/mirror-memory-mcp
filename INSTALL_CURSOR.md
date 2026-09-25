# Mirror Memory — Cursor Connect (Advanced / local build fallback)

**Primary install (LIVE):** use **[INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md)** — `npx -y mirror-memory-mcp@0.1.1`.  
This page is the **Advanced / local build fallback** only (clone + build when you need a local `dist/index.js`).

**Goal:** Cursor reads/writes your Mirror vault as shared agent memory (second agent alongside Claude Desktop).  
**Soft Pro Capture:** **HOLD** — no Soft Pro convert / Capture gates.  
**Live Memory UI:** https://web-production-0e178.up.railway.app/memory  
**Package:** https://github.com/kestrel-devagent/mirror-memory-mcp · npm `mirror-memory-mcp@0.1.1`  
**Siblings:** [INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md) (primary) · [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md) · [NPM_ENTRY_CUTOVER.md](./NPM_ENTRY_CUTOVER.md)

**Acceptance:** Connect copies config → Test connection PASS → one plain-English prompt finds a citation.

---

## Advanced / local build fallback

Prefer `npx -y mirror-memory-mcp@0.1.1` ([INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md)). Use this path only when you need a local build:

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp
npm install
npm run build
```

**ENTRY** = absolute path to that clone’s `dist/index.js`, e.g.:

```text
/path/to/mirror-memory-mcp/dist/index.js
```

Connect UI placeholder: `/path/to/mirror-memory-mcp/dist/index.js` (never a founder machine path).

### Config file

| OS | Path |
| --- | --- |
| macOS / Linux | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |

Also editable via Cursor → Settings → MCP → Edit config.

---

## One sitting (Connect UI — Advanced)

1. Clone + build (above), **or** skip and use [INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md).
2. Sign in → `/memory` → **Connect** → **Cursor**.
3. Primary ENTRY is npx `@0.1.1`. For Advanced, set package path to your local `dist/index.js`.
4. **Copy Cursor config** (mints a short-lived token into the snippet).
5. Paste under `mcpServers` in `~/.cursor/mcp.json` (merge if you already have other servers).
6. Reload MCP: Settings → MCP → toggle off/on, or reload the Cursor window.
7. On `/memory`, **Test connection**.
8. In Cursor chat:  
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

Optional: `get_voice` reads Your voice (preference notes + starters) via `GET /api/memory/voice`. Soft Pro Capture **HOLD**.

---

## Manual fallback (local node path)

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

## Primary ENTRY (LIVE)

Live Connect ENTRY: `npx -y mirror-memory-mcp@0.1.1` — see [INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md) and [NPM_ENTRY_CUTOVER.md](./NPM_ENTRY_CUTOVER.md). Soft Pro Capture **HOLD**.
