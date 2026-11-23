import { csod, pathSeg, runTool } from "./lib/csod.ts";

export async function approvalsList(args: Record<string, any>) {
  const userName = pathSeg(args, "userName");
  const { json } = await csod("GET", `/services/api/Employee/${userName}/approvals`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(approvalsList);
