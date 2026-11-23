import { csod, runTool, text, query } from "./lib/csod.ts";

export async function applicantSearch(args: Record<string, any>) {
  const CurrentStatus = text(args, "CurrentStatus", true, 100);
  const { json } = await csod("GET", `/services/api/Recruiting/JobApplicant${query({ CurrentStatus })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(applicantSearch);
