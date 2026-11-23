import { csod, runTool, query, text } from "./lib/csod.ts";

export async function requisitionGet(args: Record<string, any>) {
  const title = text(args, "title", false, 200);
  const { json } = await csod("GET", `/services/api/Recruiting/JobRequisitionDetails${query({ Title: title || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(requisitionGet);
