import { csod, runTool, ToolError } from "./lib/csod.ts";

export async function transcriptRequest(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", "/services/api/v1/transcripts/request", args.body);
  return { requested: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(transcriptRequest);