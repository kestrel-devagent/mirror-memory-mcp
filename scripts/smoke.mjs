#!/usr/bin/env node
/**
 * Dry-run smoke — validates tool schemas without a live token or host.
 * Exit 0 when all seven tools (incl. get_voice) are registered with expected inputs.
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const require = createRequire(path.join(root, "package.json"));

const EXPECTED = [
  { name: "search_history", props: ["q"] },
  { name: "get_thread", props: ["id"] },
  { name: "list_pins", props: [] },
  { name: "write_note", props: ["body"] },
  { name: "search_notes", props: [] },
  { name: "append_memory", props: ["body"] },
  { name: "get_voice", props: [] },
];

async function main() {
  // Prefer built dist; fall back to tsx-loading src.
  let listToolSchemasForSmoke;
  try {
    const mod = await import(pathToFileURL(path.join(root, "dist/tools.js")).href);
    listToolSchemasForSmoke = mod.listToolSchemasForSmoke;
  } catch {
    // Build first if needed
    const { execSync } = await import("node:child_process");
    execSync("npx tsc", { cwd: root, stdio: "inherit" });
    const mod = await import(pathToFileURL(path.join(root, "dist/tools.js")).href + `?t=${Date.now()}`);
    listToolSchemasForSmoke = mod.listToolSchemasForSmoke;
  }

  const schemas = listToolSchemasForSmoke();
  const byName = new Map(schemas.map((s) => [s.name, s]));

  const problems = [];
  for (const exp of EXPECTED) {
    const got = byName.get(exp.name);
    if (!got) {
      problems.push(`missing tool: ${exp.name}`);
      continue;
    }
    for (const p of exp.props) {
      if (!got.inputProperties.includes(p)) {
        problems.push(`${exp.name}: missing input property '${p}'`);
      }
    }
  }

  // Dreamer contract reminder in search_history description
  const search = byName.get("search_history");
  if (search && !/citation/i.test(search.description)) {
    problems.push("search_history description should mention citation");
  }
  const voice = byName.get("get_voice");
  if (voice && !/voice/i.test(voice.description)) {
    problems.push("get_voice description should mention voice");
  }

  console.log("Mirror Memory MCP — smoke (schema dry-run)");
  console.log(`tools: ${schemas.map((s) => s.name).join(", ")}`);
  for (const s of schemas) {
    console.log(`  - ${s.name}(${s.inputProperties.join(", ")})`);
  }

  if (problems.length) {
    console.error("FAIL:");
    for (const p of problems) console.error("  " + p);
    process.exit(1);
  }
  console.log("OK — all 7 tools present incl. get_voice (no live token required).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
