# Mirror Memory — Claude Desktop Connect (Advanced / local build fallback)

**Primary install (LIVE):** use **[INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md)** — `npx -y mirror-memory-mcp@0.1.1`.  
This page is the **Advanced / local build fallback** only (clone + build when you need a local `dist/index.js`).

**Goal:** Claude Desktop reads/writes your Mirror vault via the same Connect path as Cursor.  
**Soft Pro Capture:** **HOLD** — no Soft Pro convert / Capture gates.  
**Live Memory UI:** https://web-production-0e178.up.railway.app/memory  
**Package:** https://github.com/kestrel-devagent/mirror-memory-mcp · npm `mirror-memory-mcp@0.1.1`  
**Siblings:** [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md) (primary) · [INSTALL_CURSOR.md](./INSTALL_CURSOR.md) · [NPM_ENTRY_CUTOVER.md](./NPM_ENTRY_CUTOVER.md)

---

## Advanced / local build fallback

Prefer `npx -y mirror-memory-mcp@0.1.1` ([INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md)). Use this path only when you need a local build:

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

### Config file locations

| OS | Path |
| --- | --- |
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` (if Desktop is installed) |

---

## Fast path (Connect UI — Advanced)

1. Clone + build (above), **or** skip and use [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md).
2. Sign in → `/memory` → **Connect** → **Claude Desktop**.
3. Primary ENTRY is npx `@0.1.1`. For Advanced, set package path to your local `dist/index.js`.
4. **Copy Claude Desktop config** (mints a short-lived token into the snippet).
5. Paste under `mcpServers` in `claude_desktop_config.json` (merge if you already have other servers).
6. **Fully quit** Claude Desktop (**Cmd-Q** on macOS — closing the window is **not** enough), then relaunch.
7. On `/memory`, **Test connection**, or ask Claude:  
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

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

If `node` is not on PATH for Claude’s launcher, set `command` to the absolute node binary (same as Connect’s `{{NODE}}`).

Remint token on 401. Soft Pro Capture **HOLD**.

---

## Primary ENTRY (LIVE)

Live Connect ENTRY: `npx -y mirror-memory-mcp@0.1.1` — see [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md) and [NPM_ENTRY_CUTOVER.md](./NPM_ENTRY_CUTOVER.md). Soft Pro Capture **HOLD**.
