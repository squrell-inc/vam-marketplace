import { csod, pathSeg, runTool, ToolError } from "./lib/csod.ts";

export async function employeeUpdate(args: Record<string, any>) {
  const id = pathSeg(args, "id");
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("PATCH", `/services/api/x/users/v2/employees/${id}`, args.body);
  return { updated: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(employeeUpdate);
