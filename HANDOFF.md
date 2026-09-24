# HANDOFF — Mirror Memory MCP

**From:** Asa (MCP + skill)  
**Updated:** 2026-09-24 ~5:50 PM ET  
**Package:** `/workspace/ship/mirror-memory-mcp/`  
**Contract:** `/workspace/ship/brand/RETRIEVAL_CONTRACT.md`  
**Host report:** `/workspace/reports/mirror-memory-api-stub-2026-09-23.md`

## Status

- MCP + skill ready against locked Dreamer hit contract.
- **v0.1.1** adds read-only `get_voice` + light `voiceHint` on `search_history`.
- Soft Pro Capture **HOLD**; ENFORCE stays 0; npx ENTRY dark.
- Railway **green** deploy `61cd4f3d` — `/api/memory/search|thread|notes|pins` live (unauth → 401).
- Dogfood blocked only on a Bearer sync/session token from the extension token card.

## Auth

```
Authorization: Bearer <MIRROR_MEMORY_TOKEN>
```

Cookie session also works for browser; MCP uses Bearer only.

## Tool → host map

| Tool | Host |
|---|---|
| `search_history` | `POST /api/memory/search` |
| `get_thread` | `GET /api/memory/thread/:id` |
| `list_pins` | `GET /api/memory/pins` |
| `write_note` / `append_memory` | `POST /api/memory/notes` (`id` → append) |
| `search_notes` | `GET /api/memory/notes?q=` |
| `get_voice` | `GET /api/memory/voice` |

## Cursor mcp.json

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "node",
      "args": ["/workspace/ship/mirror-memory-mcp/dist/index.js"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "PASTE_SYNC_OR_SESSION_TOKEN"
      }
    }
  }
}
```

Skill: `skills/mirror-memory/SKILL.md`

## Dogfood gate

1. Mint token from signed-in Mirror → Extension token card (`GET /api/extension/token`).
2. `write_note` then `search_notes` (second process) — note must round-trip.
