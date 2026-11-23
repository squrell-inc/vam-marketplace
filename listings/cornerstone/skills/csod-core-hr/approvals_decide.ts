import { csod, pathSeg, query, runTool, ToolError } from "./lib/csod.ts";

export async function approvalsDecide(args: Record<string, any>) {
  const userName = pathSeg(args, "userName");
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", `/services/api/Employee/approvals${query({ userName })}`, args.body);
  return { decided: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(approvalsDecide);
