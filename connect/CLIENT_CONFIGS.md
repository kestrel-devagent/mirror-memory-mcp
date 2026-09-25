# Mirror Memory — Connect client configs (for `/memory` Connect)

**Audience:** Builder UI that one-click-copies a ready MCP config + token.
**Locks:** Soft Pro Capture HOLD. No Soft Pro CTAs.
**Host:** `https://web-production-0e178.up.railway.app`
**Source:** https://github.com/kestrel-devagent/mirror-memory-mcp
**Live ENTRY:** `npx -y mirror-memory-mcp@0.1.1` (`MIRROR_MCP_NPM_LIVE=1`)
**Docs:** `INSTALL_CURSOR_NPM.md` · `INSTALL_CLAUDE_DESKTOP_NPM.md`

## Live (npm)

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

Placeholders the Connect UI must substitute:
- `{{TOKEN}}` — fresh Bearer from `GET /api/extension/token`

## Clone fallback (Advanced)

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp && npm install && npm run build
```

Then `command: node` + absolute path to `dist/index.js` (placeholder `/path/to/mirror-memory-mcp/dist/index.js`).

---

## Cursor (`~/.cursor/mcp.json`)

One-sitting: copy npx config → paste → reload MCP. Guide: `INSTALL_CURSOR_NPM.md`. Soft Pro Capture **HOLD**.

Reload: Settings → MCP → toggle off/on (or reload window). Windows path: `%USERPROFILE%\.cursor\mcp.json`.

---

## Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

Same `mcpServers` block as Cursor. **Cmd-Q** then relaunch (closing the window is not enough). Guide: `INSTALL_CLAUDE_DESKTOP_NPM.md`.

---

## Devin local (`~/.config/devin/mcp_config.json` or `devin mcp add -s user`)

Same npx `mcpServers` block. **Cloud Devin cannot use Mac STDIO paths** — local Devin Desktop/CLI only.

---

## Test connection (product copy)

Button on `/memory`: **Test connection**
1. `write_note` body `Mirror Connect test {{ISO_TS}}` tags `[connect-test]`
2. `search_notes` q = that marker
3. UI: **Connected** if hit, else show 401 / tools-missing / path error plainly.

Human prompt fallback (any client):
> Search my Mirror notes for “MCP dogfood note” and show the citation.
