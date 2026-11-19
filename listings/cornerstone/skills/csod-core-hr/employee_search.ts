import { csod, runTool, whole, query } from "./lib/csod.ts";

export async function employeeSearch(args: Record<string, any>) {
  const page = whole(args, "page", 1, 1, 1000);
  const { json } = await csod("GET", `/services/api/x/users/v2/employees${query({ page })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(employeeSearch);
