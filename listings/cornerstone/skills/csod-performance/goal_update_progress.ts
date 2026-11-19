import { csod, runTool, ToolError } from "./lib/csod.ts";

export async function goalUpdateProgress(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("PUT", "/services/api/Goals/UpdateProgress", args.body);
  return { updated: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(goalUpdateProgress);
