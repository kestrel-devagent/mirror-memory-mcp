/**
 * MCP tools — roadmap names mapped to host /api/memory/* routes.
 * Search hits are Dreamer RETRIEVAL_CONTRACT shapes (pass-through).
 */
import { z } from "zod";
import type { MirrorClient } from "./client.js";
export declare const toolDefs: {
    readonly search_history: {
        readonly name: "search_history";
        readonly description: string;
        readonly inputSchema: z.ZodObject<{
            q: z.ZodString;
            limit: z.ZodOptional<z.ZodNumber>;
            providers: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                chatgpt: "chatgpt";
                claude: "claude";
                grok: "grok";
            }>>>;
            kinds: z.ZodOptional<z.ZodArray<z.ZodEnum<{
                thread: "thread";
                message: "message";
                note: "note";
                pin: "pin";
            }>>>;
        }, z.core.$strip>;
    };
    readonly get_thread: {
        readonly name: "get_thread";
        readonly description: string;
        readonly inputSchema: z.ZodObject<{
            id: z.ZodString;
            provider: z.ZodOptional<z.ZodEnum<{
                chatgpt: "chatgpt";
                claude: "claude";
                grok: "grok";
            }>>;
            maxMessages: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    };
    readonly list_pins: {
        readonly name: "list_pins";
        readonly description: string;
        readonly inputSchema: z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    };
    readonly write_note: {
        readonly name: "write_note";
        readonly description: string;
        readonly inputSchema: z.ZodObject<{
            body: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            sourceAgent: z.ZodOptional<z.ZodString>;
            sourceThread: z.ZodOptional<z.ZodObject<{
                provider: z.ZodString;
                conversationId: z.ZodString;
                messageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
    };
    readonly search_notes: {
        readonly name: "search_notes";
        readonly description: string;
        readonly inputSchema: z.ZodObject<{
            q: z.ZodOptional<z.ZodString>;
            limit: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    };
    readonly append_memory: {
        readonly name: "append_memory";
        readonly description: string;
        readonly inputSchema: z.ZodObject<{
            body: z.ZodString;
            noteId: z.ZodOptional<z.ZodString>;
            title: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            sourceAgent: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
};
export type ToolName = keyof typeof toolDefs;
export declare function registerTools(server: {
    registerTool: (...args: any[]) => unknown;
}, client: MirrorClient): void;
/** Flat schema export for smoke script (no live host). */
export declare function listToolSchemasForSmoke(): {
    name: string;
    description: string;
    inputProperties: string[];
}[];
