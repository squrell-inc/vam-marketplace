import { csod, runTool } from "./lib/csod.ts";

export async function jobList(_args: Record<string, any>) {
  const { json } = await csod("GET", "/services/api/x/chr-jobmgmt-app/v1/jobs");
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(jobList);
