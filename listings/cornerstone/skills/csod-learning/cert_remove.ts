import { csod, runTool, ToolError } from "./lib/csod.ts";

export async function certRemove(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", "/services/api/Certification/Remove", args.body);
  return { removed: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(certRemove);