/**
 * MCP tools — roadmap names mapped to host /api/memory/* routes.
 * Search hits are Dreamer RETRIEVAL_CONTRACT shapes (pass-through).
 * get_voice is read-only Your voice. Soft Pro Capture HOLD.
 */

import { z } from "zod";
import type { MirrorClient } from "./client.js";
import { MirrorApiError } from "./client.js";

function textResult(payload: unknown, isError = false) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2),
      },
    ],
    isError,
  };
}

function errResult(err: unknown) {
  if (err instanceof MirrorApiError) {
    return textResult(
      {
        ok: false,
        status: err.status,
        path: err.path,
        error: err.message,
        hostBody: err.body,
        hint:
          err.status === 404
            ? "Unexpected 404 after Railway deploy 61cd4f3d — verify MIRROR_API_BASE and path."
            : err.status === 401
              ? "Set MIRROR_MEMORY_TOKEN to a Mirror session or extension sync Bearer token."
              : undefined,
      },
      true,
    );
  }
  const message = err instanceof Error ? err.message : String(err);
  return textResult({ ok: false, error: message }, true);
}

const providerEnum = z.enum(["chatgpt", "claude", "grok"]);
const kindEnum = z.enum(["thread", "message", "note", "pin"]);

export const toolDefs = {
  search_history: {
    name: "search_history" as const,
    description:
      "Search the user's Mirror vault (threads, messages, notes, optional pin boost). " +
      "Returns Dreamer retrieval hits: kind=message|thread|note|pin with required citation " +
      "{label, deepLink, threadId/messageId/noteId}. Always cite citation.label + ids; never dump the whole vault. " +
      "Message hits keep SearchMatch snippet fields (text, matchStart, matchEnd). " +
      "Host: POST /api/memory/search.",
    inputSchema: z.object({
      q: z
        .string()
        .min(1)
        .describe("Search query (substring/FTS v1 — not embeddings)."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Max hits (default host ~40, cap 100)."),
      providers: z
        .array(providerEnum)
        .optional()
        .describe("Optional provider filter: chatgpt, claude, grok."),
      kinds: z
        .array(kindEnum)
        .optional()
        .describe("Optional kind filter: message, thread, note, pin."),
    }),
  },
  get_thread: {
    name: "get_thread" as const,
    description:
      "Fetch a bounded thread payload by id. Prefer composite id provider:conversationId " +
      "(from citation.threadId + citation.provider). Host: GET /api/memory/thread/:id.",
    inputSchema: z.object({
      id: z
        .string()
        .min(1)
        .describe(
          "Thread id — prefer 'chatgpt:…' / 'claude:…' / 'grok:…' composite, or bare id with provider.",
        ),
      provider: providerEnum
        .optional()
        .describe("Required when id is not composite provider:conversationId."),
      maxMessages: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Bound message count (host default ~40)."),
    }),
  },
  list_pins: {
    name: "list_pins" as const,
    description:
      "List pinned threads as citations {provider, conversationId, title, pinnedAt, citation}. " +
      "Pins are a flag on threads, not notes. Uses GET /api/memory/pins when live; " +
      "otherwise wraps GET /api/archive/search?pinned=1.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(200).optional(),
    }),
  },
  write_note: {
    name: "write_note" as const,
    description:
      "Create a durable shared-memory note other agents can retrieve. " +
      "Host: POST /api/memory/notes. Prefer short titles; tag meaningfully; set sourceAgent.",
    inputSchema: z.object({
      body: z.string().min(1).describe("Note body (markdown plain text)."),
      title: z.string().max(200).optional().describe("≤200 chars."),
      tags: z.array(z.string()).max(32).optional(),
      sourceAgent: z
        .string()
        .max(120)
        .optional()
        .describe("e.g. cursor, claude-desktop, human."),
      sourceThread: z
        .object({
          provider: z.string(),
          conversationId: z.string(),
          messageId: z.string().nullable().optional(),
        })
        .optional()
        .describe("Optional back-link to a vault thread."),
    }),
  },
  search_notes: {
    name: "search_notes" as const,
    description:
      "List/search durable notes only. Host: GET /api/memory/notes?q=&limit=. " +
      "For mixed vault+notes search prefer search_history with kinds=['note'].",
    inputSchema: z.object({
      q: z.string().optional().describe("Substring filter on title/body/tags."),
      limit: z.number().int().min(1).max(200).optional(),
    }),
  },
  append_memory: {
    name: "append_memory" as const,
    description:
      "Append to an existing note (POST /api/memory/notes with id) when the host supports it. " +
      "If noteId omitted, creates a new note tagged 'memory' (write_note fallback).",
    inputSchema: z.object({
      body: z.string().min(1).describe("Text to append (or create)."),
      noteId: z
        .string()
        .optional()
        .describe("Existing note id to append to."),
      title: z.string().max(200).optional(),
      tags: z.array(z.string()).max(32).optional(),
      sourceAgent: z.string().max(120).optional(),
    }),
  },
  get_voice: {
    name: "get_voice" as const,
    description:
      "Read the user's Your voice profile (preference notes + starter prompts). " +
      "Read-only. Empty profile returns source 'empty' with empty arrays (not an error). " +
      "Prefer this when adapting tone/style; search_history may also include a short voiceHint. " +
      "Host: GET /api/memory/voice. Soft Pro Capture HOLD — no billing.",
    inputSchema: z.object({}),
  },
} as const;

export type ToolName = keyof typeof toolDefs;

export function registerTools(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  server: { registerTool: (...args: any[]) => unknown },
  client: MirrorClient,
): void {
  server.registerTool(
    toolDefs.search_history.name,
    {
      description: toolDefs.search_history.description,
      inputSchema: toolDefs.search_history.inputSchema,
    },
    async (args: z.infer<typeof toolDefs.search_history.inputSchema>) => {
      try {
        const result = await client.searchHistory({
          q: args.q,
          limit: args.limit,
          providers: args.providers,
          kinds: args.kinds,
        });
        // Prefer host voiceHint; if absent (older host), fetch a light fallback once.
        let voiceHint = result.voiceHint;
        if (!voiceHint) {
          try {
            const voice = await client.getVoice();
            if (
              voice.source !== "empty" &&
              (voice.preferenceNotes.length > 0 || voice.starters.length > 0)
            ) {
              voiceHint = {
                source: voice.source,
                preferenceNoteCount: voice.preferenceNotes.length,
                starterCount: voice.starters.length,
                snippets: voice.preferenceNotes
                  .slice(0, 3)
                  .map((n) =>
                    n.text.length > 80
                      ? n.text.slice(0, 79) + "…"
                      : n.text,
                  )
                  .filter(Boolean),
                updatedAt: voice.updatedAt ?? null,
              };
            }
          } catch {
            // Voice enrichment is best-effort; search hits still return.
          }
        }
        return textResult({
          ok: true,
          ...result,
          ...(voiceHint ? { voiceHint } : {}),
          _contract:
            "Dreamer RETRIEVAL_CONTRACT — cite citation.label + deepLink/ids; snippets are display-only.",
          _voice:
            voiceHint
              ? "voiceHint is a short Your-voice header — call get_voice for the full profile."
              : undefined,
        });
      } catch (err) {
        return errResult(err);
      }
    },
  );

  server.registerTool(
    toolDefs.get_thread.name,
    {
      description: toolDefs.get_thread.description,
      inputSchema: toolDefs.get_thread.inputSchema,
    },
    async (args: z.infer<typeof toolDefs.get_thread.inputSchema>) => {
      try {
        const thread = await client.getThread(args.id, {
          provider: args.provider,
          maxMessages: args.maxMessages,
        });
        return textResult({ ok: true, thread });
      } catch (err) {
        return errResult(err);
      }
    },
  );

  server.registerTool(
    toolDefs.list_pins.name,
    {
      description: toolDefs.list_pins.description,
      inputSchema: toolDefs.list_pins.inputSchema,
    },
    async (args: z.infer<typeof toolDefs.list_pins.inputSchema>) => {
      try {
        const pins = await client.listPins({ limit: args.limit });
        return textResult({ ok: true, pins, count: pins.length });
      } catch (err) {
        return errResult(err);
      }
    },
  );

  server.registerTool(
    toolDefs.write_note.name,
    {
      description: toolDefs.write_note.description,
      inputSchema: toolDefs.write_note.inputSchema,
    },
    async (args: z.infer<typeof toolDefs.write_note.inputSchema>) => {
      try {
        const { note, appended } = await client.writeNote({
          body: args.body,
          title: args.title,
          tags: args.tags,
          sourceAgent: args.sourceAgent,
          sourceThread: args.sourceThread,
        });
        return textResult({ ok: true, note, appended });
      } catch (err) {
        return errResult(err);
      }
    },
  );

  server.registerTool(
    toolDefs.search_notes.name,
    {
      description: toolDefs.search_notes.description,
      inputSchema: toolDefs.search_notes.inputSchema,
    },
    async (args: z.infer<typeof toolDefs.search_notes.inputSchema>) => {
      try {
        const result = await client.searchNotes({
          q: args.q,
          limit: args.limit,
        });
        return textResult({ ok: true, ...result });
      } catch (err) {
        return errResult(err);
      }
    },
  );

  server.registerTool(
    toolDefs.append_memory.name,
    {
      description: toolDefs.append_memory.description,
      inputSchema: toolDefs.append_memory.inputSchema,
    },
    async (args: z.infer<typeof toolDefs.append_memory.inputSchema>) => {
      try {
        if (args.noteId) {
          const { note, appended } = await client.writeNote({
            body: args.body,
            title: args.title,
            tags: args.tags,
            sourceAgent: args.sourceAgent,
            id: args.noteId,
          });
          return textResult({ ok: true, appended, note });
        }
        const tags = Array.from(new Set([...(args.tags ?? []), "memory"]));
        const { note } = await client.writeNote({
          body: args.body,
          title: args.title ?? "Memory",
          tags,
          sourceAgent: args.sourceAgent,
        });
        return textResult({
          ok: true,
          appended: false,
          created: true,
          note,
          _note:
            "No noteId — created new note with tag 'memory'. Pass noteId to append.",
        });
      } catch (err) {
        return errResult(err);
      }
    },
  );

  server.registerTool(
    toolDefs.get_voice.name,
    {
      description: toolDefs.get_voice.description,
      inputSchema: toolDefs.get_voice.inputSchema,
    },
    async (_args: z.infer<typeof toolDefs.get_voice.inputSchema>) => {
      try {
        const voice = await client.getVoice();
        return textResult({
          ok: true,
          voice,
          _note:
            voice.source === "empty"
              ? "Your voice is empty — user can build/edit at /voice. Soft Pro Capture HOLD."
              : "Use preferenceNotes + starters to adapt tone; call get_voice again after edits.",
        });
      } catch (err) {
        return errResult(err);
      }
    },
  );
}

/** Flat schema export for smoke script (no live host). */
export function listToolSchemasForSmoke(): {
  name: string;
  description: string;
  inputProperties: string[];
}[] {
  return (Object.keys(toolDefs) as ToolName[]).map((name) => {
    const def = toolDefs[name];
    const shape = def.inputSchema.shape;
    return {
      name: def.name,
      description: def.description,
      inputProperties: Object.keys(shape),
    };
  });
}
