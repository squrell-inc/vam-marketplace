import { csod, pathSeg, runTool } from "./lib/csod.ts";

export async function jobGet(args: Record<string, any>) {
  const jobId = pathSeg(args, "jobId");
  const { json } = await csod("GET", `/services/api/x/chr-jobmgmt-app/v1/jobs/${jobId}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(jobGet);
