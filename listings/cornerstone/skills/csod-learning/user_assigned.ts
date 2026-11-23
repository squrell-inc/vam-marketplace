import { csod, runTool, text, query } from "./lib/csod.ts";

export async function userAssigned(args: Record<string, any>) {
  const userId = text(args, "userId", false, 100);
  const { json } = await csod("GET", `/services/api/TranscriptAndTask/Assigned${query({ UserId: userId || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(userAssigned);