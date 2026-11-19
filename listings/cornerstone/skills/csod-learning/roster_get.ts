import { csod, runTool, text, query } from "./lib/csod.ts";

export async function rosterGet(args: Record<string, any>) {
  const sessionId = text(args, "sessionId", true, 200);
  const { json } = await csod("GET", `/services/api/SessionRoster/GetSessionRoster${query({ SessionId: sessionId })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(rosterGet);