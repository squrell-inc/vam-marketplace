import { csod, runTool } from "./lib/csod.ts";

export async function ouList(_args: Record<string, any>) {
  const { json } = await csod("GET", "/services/api/x/organizations/v1/ous");
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(ouList);
