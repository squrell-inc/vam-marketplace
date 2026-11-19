import { csod, runTool, ToolError } from "./lib/csod.ts";

export async function jobCreate(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", "/services/api/x/chr-jobmgmt-app/v1/jobs", args.body);
  return { created: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(jobCreate);
