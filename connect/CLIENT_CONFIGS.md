# Mirror Memory — Connect client configs (for `/memory` Connect)

**Audience:** Builder UI that one-click-copies a ready MCP config + token.
**Locks:** Soft Pro Capture HOLD. No Soft Pro CTAs.
**Host:** `https://web-production-0e178.up.railway.app`
**Source (pre-npm):** https://github.com/kestrel-devagent/mirror-memory-mcp
**Binary (placeholder — package not on npm yet):** `/path/to/mirror-memory-mcp/dist/index.js`

## Until npm is live (honest clone)

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp && npm install && npm run build
```

ENTRY = absolute path to that clone’s `dist/index.js`.  
**After npm (NOT LIVE YET / TBD):** do not invent `npx mirror-memory-mcp` until `npm view mirror-memory-mcp version` greens.

Placeholders the Connect UI must substitute:
- `{{TOKEN}}` — fresh Bearer from `GET /api/extension/token` (same as Copy token)
- `{{ENTRY}}` — absolute path to `dist/index.js` after local clone + build (default placeholder above; never a founder username path; never a fake npx)
- `{{NODE}}` — `node` or absolute node path if PATH is thin (Devin/Claude Desktop)

---
---

## Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "{{NODE}}",
      "args": ["{{ENTRY}}"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "{{TOKEN}}"
      }
    }
  }
}
```

Reload: Settings → MCP → toggle off/on (or reload window).

---

## Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

Same `mcpServers` block as Cursor. **Cmd-Q** then relaunch (closing the window is not enough).

---

## Devin local (`~/.config/devin/mcp_config.json` or `devin mcp add -s user`)

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "{{NODE}}",
      "args": ["{{ENTRY}}"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "{{TOKEN}}"
      }
    }
  }
}
```

CLI equivalent:

```bash
devin mcp add -s user mirror-memory --env MIRROR_API_BASE=https://web-production-0e178.up.railway.app --env MIRROR_MEMORY_TOKEN={{TOKEN}} -- {{NODE}} {{ENTRY}}
```

**Cloud Devin cannot use Mac STDIO paths** — local Devin Desktop/CLI only.

---

## Test connection (product copy)

Button on `/memory`: **Test connection**
1. `write_note` body `Mirror Connect test {{ISO_TS}}` tags `[connect-test]`
2. `search_notes` q = that marker
3. UI: **Connected** if hit, else show 401 / tools-missing / path error plainly.

Human prompt fallback (any client):
> Search my Mirror notes for “MCP dogfood note” and show the citation.
