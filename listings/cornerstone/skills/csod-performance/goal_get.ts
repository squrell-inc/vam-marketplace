import { csod, runTool, query, text } from "./lib/csod.ts";

export async function goalGet(args: Record<string, any>) {
  const goalId = text(args, "goalId", false, 200);
  const { json } = await csod("GET", `/services/api/Goals/GetDetails${query({ GoalId: goalId || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(goalGet);
