/**
 * Second-client dogfood: Process A write_note → Process B search_notes + search_history.
 * Uses MirrorClient from this package (same HTTP path MCP tools use).
 * Env: MIRROR_API_BASE, MIRROR_MEMORY_TOKEN (never logged).
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const marker = `SCDF-${new Date().toISOString().slice(0, 10)}-${randomBytes(4).toString("hex")}`;
const title = `Second-client dogfood ${marker}`;
const body = `Cross-session proof marker ${marker}. Written by process A; retrieved by process B. Soft Pro Capture HOLD.`;
const tag = "second-client-dogfood";

const reportPath =
  process.env.DOGFOOD_REPORT ||
  "/workspace/reports/mirror-mcp-second-client-dogfood-2026-09-24.md";

function runChild(role, extraEnv = {}) {
  const code = `
import { loadConfig } from ${JSON.stringify(path.join(root, "dist/config.js"))};
import { MirrorClient } from ${JSON.stringify(path.join(root, "dist/client.js"))};

const role = process.env.DOGFOOD_ROLE;
const marker = process.env.DOGFOOD_MARKER;
const title = process.env.DOGFOOD_TITLE;
const body = process.env.DOGFOOD_BODY;
const tag = process.env.DOGFOOD_TAG;
const noteIdHint = process.env.DOGFOOD_NOTE_ID || "";

const client = new MirrorClient(loadConfig());
const out = { role, pid: process.pid, ok: false };

try {
  if (role === "A") {
    const { note, appended } = await client.writeNote({
      title,
      body,
      tags: [tag, "mirror-mcp-launch"],
      sourceAgent: "second-client-dogfood-process-A",
    });
    out.ok = Boolean(note?.id);
    out.noteId = note?.id ?? null;
    out.title = note?.title ?? null;
    out.appended = appended;
    out.hasCitationShape = false; // write path returns note, not search hit
  } else if (role === "B") {
    const q = marker;
    const notesRes = await client.searchNotes({ q, limit: 10 });
    const notes = notesRes.notes || [];
    const noteHit = notes.find(
      (n) =>
        (n.title && n.title.includes(marker)) ||
        (n.body && n.body.includes(marker)) ||
        (noteIdHint && n.id === noteIdHint)
    );

    const hist = await client.searchHistory({
      q,
      limit: 10,
      kinds: ["note"],
    });
    const hits = hist.hits || [];
    const histHit = hits.find(
      (h) =>
        h.kind === "note" &&
        h.citation &&
        ((h.note && (h.note.title?.includes(marker) || h.note.snippet?.includes(marker))) ||
          h.citation.label?.includes(marker) ||
          (noteIdHint && (h.citation.noteId === noteIdHint || h.note?.id === noteIdHint)))
    );

    const citation = histHit?.citation;
    const citationOk = Boolean(
      citation &&
        typeof citation.label === "string" &&
        citation.label.length > 0 &&
        typeof citation.deepLink === "string" &&
        citation.deepLink.length > 0
    );

    out.ok = Boolean(noteHit) && Boolean(histHit) && citationOk;
    out.searchNotesFound = Boolean(noteHit);
    out.searchNotesCount = notes.length;
    out.searchHistoryFound = Boolean(histHit);
    out.searchHistoryHitCount = hist.hitCount ?? hits.length;
    out.citationPresent = citationOk;
    out.citationLabel = citation?.label ?? null;
    out.citationHasDeepLink = Boolean(citation?.deepLink);
    out.citationNoteId = citation?.noteId ?? histHit?.note?.id ?? null;
    out.matchedNoteId = noteHit?.id ?? null;
  } else {
    out.error = "unknown role";
  }
} catch (err) {
  out.ok = false;
  out.error = err instanceof Error ? err.message : String(err);
  // scrub any accidental token echoes
  if (typeof out.error === "string") {
    out.error = out.error.replace(/Bearer\\s+\\S+/gi, "Bearer [redacted]");
  }
}

process.stdout.write(JSON.stringify(out));
`;
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", code], {
      env: {
        ...process.env,
        ...extraEnv,
        DOGFOOD_ROLE: role,
        DOGFOOD_MARKER: marker,
        DOGFOOD_TITLE: title,
        DOGFOOD_BODY: body,
        DOGFOOD_TAG: tag,
      },
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr, pid: child.pid });
    });
  });
}

function parseJson(stdout) {
  const t = stdout.trim();
  try {
    return JSON.parse(t);
  } catch {
    return { ok: false, error: `non-json stdout: ${t.slice(0, 300)}` };
  }
}

const started = new Date().toISOString();
console.error(`[dogfood] marker=${marker}`);
console.error(`[dogfood] Process A (write_note) starting…`);

const aRaw = await runChild("A");
const a = parseJson(aRaw.stdout);
if (aRaw.stderr) console.error(`[A stderr] ${aRaw.stderr.trim().slice(0, 400)}`);
console.error(`[dogfood] Process A pid=${a.pid ?? aRaw.pid} ok=${a.ok} noteId=${a.noteId ? "[set]" : "[missing]"}`);

if (!a.ok || !a.noteId) {
  const fail = {
    result: "FAIL",
    reason: a.error || "Process A write_note failed",
    a,
  };
  writeReport(fail);
  process.exit(1);
}

// Brief pause so host indexes note for search
await new Promise((r) => setTimeout(r, 1500));

console.error(`[dogfood] Process B (search_notes + search_history) starting…`);
const bRaw = await runChild("B", { DOGFOOD_NOTE_ID: a.noteId });
const b = parseJson(bRaw.stdout);
if (bRaw.stderr) console.error(`[B stderr] ${bRaw.stderr.trim().slice(0, 400)}`);
console.error(
  `[dogfood] Process B pid=${b.pid ?? bRaw.pid} ok=${b.ok} notes=${b.searchNotesFound} hist=${b.searchHistoryFound} citation=${b.citationPresent}`
);

const pass =
  a.ok &&
  b.ok &&
  b.searchNotesFound &&
  b.searchHistoryFound &&
  b.citationPresent &&
  a.pid !== b.pid;

const summary = {
  result: pass ? "PASS" : "FAIL",
  marker,
  title,
  processA: {
    pid: a.pid,
    noteId: a.noteId ? "[redacted-id-present]" : null,
    ok: a.ok,
  },
  processB: {
    pid: b.pid,
    searchNotesFound: b.searchNotesFound,
    searchHistoryFound: b.searchHistoryFound,
    citationPresent: b.citationPresent,
    citationLabel: b.citationLabel,
    citationHasDeepLink: b.citationHasDeepLink,
    ok: b.ok,
    error: b.error || null,
  },
  distinctPids: a.pid !== b.pid,
  started,
  finished: new Date().toISOString(),
};

writeReport(summary);
console.error(`[dogfood] ${summary.result}`);
process.exit(pass ? 0 : 1);

function writeReport(summary) {
  const lines = [
    "# Mirror MCP — second-client dogfood",
    "",
    `**Date:** 2026-09-24 (America/New_York)`,
    `**Result:** **${summary.result}**`,
    `**Package:** \`/workspace/ship/mirror-memory-mcp\``,
    `**Host:** \`https://web-production-0e178.up.railway.app\``,
    `**Method:** Two separate Node processes via \`MirrorClient\` (same client MCP tools use).`,
    "",
    "## What ran",
    "",
    "1. **Process A** — `writeNote` with unique marker in title/body.",
    "2. **Process B** (new process, new client instance) — `searchNotes` + `searchHistory({ kinds: [\"note\"] })`.",
    "3. Require: note found in both searches; history hit includes `citation.label` + `citation.deepLink`.",
    "",
    "## Marker",
    "",
    `\`${summary.marker || marker}\``,
    "",
    "## Process results",
    "",
    "```json",
    JSON.stringify(
      {
        processA: summary.processA || summary.a,
        processB: summary.processB,
        distinctPids: summary.distinctPids,
        reason: summary.reason,
      },
      null,
      2
    ),
    "```",
    "",
    "## Claude Desktop",
    "",
    "Claude Desktop app is **not** installed on this Linux box. Install one-pager: `INSTALL_CLAUDE_DESKTOP.md`. Dual-process MCP/client dogfood above is the second-client proof for launch readiness.",
    "",
    "## Soft Pro Capture",
    "",
    "**HOLD** — no Soft Pro convert/SEO copy changes; no Grok-on-store/Capture claims in this work.",
    "",
    "## Secrets",
    "",
    "Token loaded from env / `.dogfood-token` — **not printed**.",
    "",
  ];
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join("\n"));
  console.error(`[dogfood] report → ${reportPath}`);
}
