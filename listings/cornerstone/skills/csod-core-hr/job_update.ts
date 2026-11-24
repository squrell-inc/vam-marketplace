import { csod, pathSeg, runTool, ToolError } from "./lib/csod.ts";

export async function jobUpdate(args: Record<string, any>) {
  const jobId = pathSeg(args, "jobId");
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("PATCH", `/services/api/x/chr-jobmgmt-app/v1/jobs/${jobId}`, args.body);
  return { updated: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(jobUpdate);
