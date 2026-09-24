# Mirror Memory MCP

Cursor-ready MCP server + skill for **Mirror** shared agent memory.

Connect Cursor, Claude Desktop, or local Devin to your Mirror vault so agents can search history, pins, and notes — and leave notes for each other.

> Soft Pro Capture monetization: **HOLD** (product lock — not part of this package).

## Until npm is live (honest clone)

`mirror-memory-mcp` is **not** on the npm registry yet (`npm view mirror-memory-mcp version` → 404). Do **not** invent an `npx` one-liner until that greens.

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp
npm install
npm run build
```

**ENTRY** for MCP configs = absolute path to `dist/index.js` on your machine, e.g.:

```text
/absolute/path/to/mirror-memory-mcp/dist/index.js
```

Generic placeholder used in Connect UI: `/path/to/mirror-memory-mcp/dist/index.js`

## After npm (NOT LIVE YET / TBD after publish)

Once `npm view mirror-memory-mcp version` returns a version and Asa has published:

```bash
# TBD AFTER PUBLISH — do not run until registry greens
npx -y mirror-memory-mcp
```

Until then, use the **clone path** above. Connect UI keeps `{{ENTRY}}` as a local `dist/index.js` path.

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
2. Clone + build this repo (Until npm section above).
3. Pick Cursor / Claude Desktop / Devin (local), set ENTRY to your local `dist/index.js`, **Copy config**.
4. Paste into the client config path, reload / relaunch.
5. **Test connection** on `/memory`.

One-pagers: [INSTALL_HUDSON.md](./INSTALL_HUDSON.md) (Cursor) · [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md)

## Manual mcp.json (Cursor)

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "node",
      "args": ["/path/to/mirror-memory-mcp/dist/index.js"],
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

Prints the six tool schemas. Does not call the live host.

## Env

See `.env.example`:

- `MIRROR_API_BASE` — default Railway host
- `MIRROR_MEMORY_TOKEN` — Bearer session or extension sync token (**never commit**)

## Publish notes (Asa)

- `private: false` + `publishConfig.access: "public"` — ready for `npm publish` from an authenticated npm account.
- Do **not** publish from this box if auth/IP is blocked — Asa publishes from a machine with npm credentials.
- Gate: only advertise `npx` after `npm view mirror-memory-mcp version` succeeds.

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
