import { csod, runTool, query } from "./lib/csod.ts";

export async function applicantUpdateStatus(args: Record<string, any>) {
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(args)) {
    if (typeof v === "string" || typeof v === "number") params[k] = v;
  }
  const { json } = await csod("GET", `/services/api/Recruiting/JobApplicantUpdateStatus${query(params)}`);
  return { updated: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(applicantUpdateStatus);
