/**
 * Thin HTTP client for Mirror host memory APIs.
 * Clear errors on 401/404 so dogfood can wait on Builder Railway redeploy.
 */

import type {
  BoundedThread,
  HostErrorBody,
  ListPinsItem,
  MemoryNote,
  MemorySearchRequest,
  MemorySearchResponse,
  VoiceProfile,
  VoiceSearchHint,
  WriteNoteInput,
} from "./types.js";
import type { MirrorConfig } from "./config.js";
import { requireToken } from "./config.js";

export class MirrorApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(status: number, path: string, body: unknown) {
    const msg =
      typeof body === "object" &&
      body &&
      ("error" in body || "message" in body)
        ? String(
            (body as HostErrorBody).error ??
              (body as HostErrorBody).message,
          )
        : typeof body === "string"
          ? body.slice(0, 200)
          : `HTTP ${status}`;
    const suffix =
      status === 404
        ? " Route missing — unexpected after deploy 61cd4f3d; check MIRROR_API_BASE path."
        : status === 401
          ? " Check MIRROR_MEMORY_TOKEN (session or extension sync Bearer)."
          : "";
    super(`Mirror API ${status} ${path}: ${msg}${suffix}`);
    this.name = "MirrorApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export class MirrorClient {
  constructor(private readonly config: MirrorConfig) {}

  private headers(json = true): Record<string, string> {
    const token = requireToken(this.config);
    const h: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    if (json) h["Content-Type"] = "application/json";
    return h;
  }

  private url(path: string, query?: Record<string, string | undefined>): string {
    const u = new URL(path.replace(/^\//, ""), this.config.apiBase + "/");
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== "") u.searchParams.set(k, v);
      }
    }
    return u.toString();
  }

  private async request(
    method: string,
    path: string,
    opts?: {
      query?: Record<string, string | undefined>;
      body?: unknown;
      allow404?: boolean;
    },
  ): Promise<unknown> {
    const url = this.url(path, opts?.query);
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: this.headers(opts?.body !== undefined),
        body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Mirror API network error ${method} ${path}: ${reason}. Is MIRROR_API_BASE reachable?`,
      );
    }

    const body = await parseBody(res);
    if (res.status === 404 && opts?.allow404) return null;
    if (!res.ok) {
      throw new MirrorApiError(res.status, path, body);
    }
    return body;
  }

  /**
   * POST /api/memory/search
   * Body: { q, providers?, kinds?, limit? } (legacy `query` also sent).
   * Hits pass through Dreamer shape unchanged (hitId, kind, score, citation, …).
   */
  async searchHistory(input: MemorySearchRequest): Promise<MemorySearchResponse> {
    const body: Record<string, unknown> = {
      q: input.q,
      query: input.q,
      limit: input.limit,
    };
    if (input.providers?.length) body.providers = input.providers;
    if (input.kinds?.length) body.kinds = input.kinds;

    const raw = (await this.request("POST", "/api/memory/search", {
      body,
    })) as Partial<MemorySearchResponse> | null;

    const hits = Array.isArray(raw?.hits) ? raw!.hits : [];
    const out: MemorySearchResponse = {
      query: raw?.query ?? input.q,
      hits,
      hitCount: raw?.hitCount ?? hits.length,
      truncated: Boolean(raw?.truncated),
    };
    if (raw && typeof raw === "object" && "voiceHint" in raw && raw.voiceHint) {
      out.voiceHint = raw.voiceHint as VoiceSearchHint;
    }
    return out;
  }

  /** GET /api/memory/thread/:id — composite id preferred: provider:conversationId */
  async getThread(
    id: string,
    opts?: { provider?: string; maxMessages?: number },
  ): Promise<BoundedThread> {
    const encoded = encodeURIComponent(id);
    const query: Record<string, string | undefined> = {};
    if (opts?.provider) query.provider = opts.provider;
    if (opts?.maxMessages != null) query.maxMessages = String(opts.maxMessages);

    const raw = (await this.request("GET", `/api/memory/thread/${encoded}`, {
      query,
    })) as BoundedThread | { thread: BoundedThread };

    if (raw && typeof raw === "object" && "thread" in raw && raw.thread) {
      return raw.thread;
    }
    return raw as BoundedThread;
  }

  /**
   * POST /api/memory/notes — create (no id) or append (id set).
   * Host returns { note, appended }.
   */
  async writeNote(
    input: WriteNoteInput,
  ): Promise<{ note: MemoryNote; appended: boolean }> {
    const body: Record<string, unknown> = {
      title: input.title,
      body: input.body,
      tags: input.tags,
      sourceAgent: input.sourceAgent,
      sourceThread: input.sourceThread,
    };
    if (input.id) body.id = input.id;

    const raw = (await this.request("POST", "/api/memory/notes", {
      body,
    })) as { note: MemoryNote; appended?: boolean } | MemoryNote;

    if (raw && typeof raw === "object" && "note" in raw && raw.note) {
      return { note: raw.note, appended: Boolean(raw.appended) };
    }
    return { note: raw as MemoryNote, appended: Boolean(input.id) };
  }

  /** GET /api/memory/notes?q=&limit= */
  async searchNotes(opts?: {
    q?: string;
    limit?: number;
  }): Promise<{ notes: MemoryNote[]; total?: number }> {
    const raw = (await this.request("GET", "/api/memory/notes", {
      query: {
        q: opts?.q,
        limit: opts?.limit != null ? String(opts.limit) : undefined,
      },
    })) as { notes: MemoryNote[]; total?: number } | MemoryNote[];

    if (Array.isArray(raw)) return { notes: raw, total: raw.length };
    return {
      notes: Array.isArray(raw.notes) ? raw.notes : [],
      total: raw.total,
    };
  }

  /**
   * GET /api/memory/voice — Your voice profile (preference notes + starters).
   * Empty profile → source "empty" + empty arrays (200, not 404).
   * Soft Pro Capture HOLD — read-only; no billing fields.
   */
  async getVoice(): Promise<VoiceProfile> {
    const raw = (await this.request("GET", "/api/memory/voice")) as Partial<VoiceProfile> | null;
    return {
      preferenceNotes: Array.isArray(raw?.preferenceNotes)
        ? raw!.preferenceNotes
        : [],
      starters: Array.isArray(raw?.starters) ? raw!.starters : [],
      updatedAt:
        typeof raw?.updatedAt === "string" ? raw.updatedAt : undefined,
      source:
        raw?.source === "manual" || raw?.source === "built" || raw?.source === "empty"
          ? raw.source
          : "empty",
    };
  }

  /**
   * list_pins — GET /api/memory/pins when live;
   * else wrap GET /api/archive/search?pinned=1 (already on Railway).
   */
  async listPins(opts?: { limit?: number }): Promise<ListPinsItem[]> {
    const memoryPins = (await this.request("GET", "/api/memory/pins", {
      query: {
        limit: opts?.limit != null ? String(opts.limit) : undefined,
      },
      allow404: true,
    })) as { pins: ListPinsItem[]; count?: number } | ListPinsItem[] | null;

    if (memoryPins) {
      const pins = Array.isArray(memoryPins)
        ? memoryPins
        : memoryPins.pins ?? [];
      return opts?.limit ? pins.slice(0, opts.limit) : pins;
    }

    // Fallback: live archive search pinned filter.
    const archive = (await this.request("GET", "/api/archive/search", {
      query: {
        pinned: "1",
        maxMatches: opts?.limit != null ? String(opts.limit) : "100",
      },
    })) as {
      conversations?: {
        id: string;
        provider: string;
        title?: string;
        pinned?: boolean;
        pinnedAt?: number | string | null;
      }[];
    };

    const convos = archive.conversations ?? [];
    return convos
      .filter((c) => c.pinned !== false)
      .slice(0, opts?.limit ?? 100)
      .map((c) => {
        const pinnedAt =
          c.pinnedAt == null
            ? new Date(0).toISOString()
            : typeof c.pinnedAt === "number"
              ? new Date(c.pinnedAt).toISOString()
              : String(c.pinnedAt);
        return {
          provider: c.provider,
          conversationId: c.id,
          title: c.title || c.id,
          pinnedAt,
          citation: {
            label: c.title || c.id,
            deepLink: `/archive?provider=${encodeURIComponent(c.provider)}&id=${encodeURIComponent(c.id)}`,
            threadId: c.id,
            provider: c.provider,
            pinned: true,
          },
        };
      });
  }
}
