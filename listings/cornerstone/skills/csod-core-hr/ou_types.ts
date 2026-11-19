import { csod, runTool } from "./lib/csod.ts";

export async function ouTypes(_args: Record<string, any>) {
  const { json } = await csod("GET", "/services/api/x/organizations/v1/types");
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(ouTypes);
