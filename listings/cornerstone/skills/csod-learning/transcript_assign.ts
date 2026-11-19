import { csod, runTool } from "./lib/csod.ts";
import { ToolError } from "./lib/csod.ts";

export async function transcriptAssign(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", "/services/api/v1/transcripts/assign", args.body);
  return { assigned: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(transcriptAssign);