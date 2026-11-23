import { csod, runTool, text, query } from "./lib/csod.ts";

export async function userSessions(args: Record<string, any>) {
  const userId = text(args, "userId", false, 100);
  const { json } = await csod("GET", `/services/api/TranscriptAndTask/Session${query({ UserId: userId || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(userSessions);