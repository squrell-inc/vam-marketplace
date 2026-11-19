import { csod, runTool, text, query } from "./lib/csod.ts";

export async function globalSearch(args: Record<string, any>) {
  const q = text(args, "query", false, 500);
  const { json } = await csod("GET", `/services/api/Core/GlobalSearch${query({ SearchText: q || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(globalSearch);
