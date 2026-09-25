# Mirror Memory MCP

Cursor-ready MCP server + skill for **Mirror** shared agent memory.

Connect Cursor, Claude Desktop, or local Devin to your Mirror vault so agents can search history, pins, and notes — and leave notes for each other.

> Soft Pro Capture monetization: **HOLD** (product lock — not part of this package).

## Primary ENTRY (LIVE)

```bash
npx -y mirror-memory-mcp@0.1.1
```

`npm view mirror-memory-mcp version` → `0.1.1`. Soft Pro Capture **HOLD**.

One-pagers: [INSTALL_CURSOR_NPM.md](./INSTALL_CURSOR_NPM.md) · [INSTALL_CLAUDE_DESKTOP_NPM.md](./INSTALL_CLAUDE_DESKTOP_NPM.md)  
Advanced / local build fallback: [INSTALL_CURSOR.md](./INSTALL_CURSOR.md) · [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md)  
Cutover: [NPM_ENTRY_CUTOVER.md](./NPM_ENTRY_CUTOVER.md) (DONE / LIVE)

## Advanced / local build fallback

Use only when you need a local `dist/index.js`:

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp
npm install
npm run build
```

**ENTRY** = absolute path to `dist/index.js` (placeholder `/path/to/mirror-memory-mcp/dist/index.js`).

## What it does

Exposes seven tools against Mirror host APIs:

| Tool | Host |
|---|---|
| `search_history` | `POST /api/memory/search` |
| `get_thread` | `GET /api/memory/thread/:id` |
| `list_pins` | `GET /api/memory/pins` (fallback: `GET /api/archive/search?pinned=1`) |
| `write_note` | `POST /api/memory/notes` |
| `search_notes` | `GET /api/memory/notes` |
| `append_memory` | `POST /api/memory/notes` with `id` (else create + tag `memory`) |
| `get_voice` | `GET /api/memory/voice` (Your voice — read-only) |

`search_history` may include a short `voiceHint` when Your voice exists — call `get_voice` for the full preference notes + starters. Soft Pro Capture **HOLD**.

## Connect (preferred product path)

1. Sign in on Mirror → **Memory**: https://web-production-0e178.up.railway.app/memory
2. Pick Cursor / Claude Desktop / Devin (local) → **Copy config** (npx `@0.1.1`).
3. Paste into the client config path, reload / relaunch.
4. **Test connection** on `/memory`.

## Manual mcp.json (Cursor — LIVE npx)

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "npx",
      "args": ["-y", "mirror-memory-mcp@0.1.1"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "PASTE_SESSION_OR_EXTENSION_SYNC_TOKEN"
      }
    }
  }
}
```

Mint a token from signed-in `/memory` (Copy config) or `GET /api/extension/token`.

Skill: copy or point Cursor at `skills/mirror-memory/SKILL.md`.

## Smoke (no token)

```bash
npm run smoke
```

Prints the tool schemas. Does not call the live host.

## Env

See `.env.example`:

- `MIRROR_API_BASE` — default Railway host
- `MIRROR_MEMORY_TOKEN` — Bearer session or extension sync token (**never commit**)

## Layout

```
src/config.ts   env
src/types.ts    hit / citation types
src/client.ts   HTTP client
src/tools.ts    MCP tool registration
src/index.ts    stdio entry
skills/mirror-memory/SKILL.md
scripts/smoke.mjs
connect/        Connect UI config templates
```
