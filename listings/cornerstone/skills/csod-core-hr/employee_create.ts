import { csod, runTool, ToolError } from "./lib/csod.ts";

export async function employeeCreate(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", "/services/api/x/users/v2/employees", args.body);
  return { created: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(employeeCreate);
