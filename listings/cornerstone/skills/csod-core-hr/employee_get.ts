import { csod, pathSeg, runTool } from "./lib/csod.ts";

export async function employeeGet(args: Record<string, any>) {
  const id = pathSeg(args, "id");
  const { json } = await csod("GET", `/services/api/x/users/v2/employees/${id}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(employeeGet);
