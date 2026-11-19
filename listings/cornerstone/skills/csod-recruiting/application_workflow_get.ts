import { csod, pathSeg, runTool } from "./lib/csod.ts";

export async function applicationWorkflowGet(args: Record<string, any>) {
  const externalId = pathSeg(args, "externalId");
  const { json } = await csod("GET", `/services/api/x/rec-job-requisition/v1/requisition/${externalId}/application-workflow`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(applicationWorkflowGet);
