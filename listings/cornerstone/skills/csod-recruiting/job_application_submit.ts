import { csod, runTool, query } from "./lib/csod.ts";

export async function jobApplicationSubmit(args: Record<string, any>) {
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(args)) {
    if (typeof v === "string" || typeof v === "number") params[k] = v;
  }
  const { json } = await csod("GET", `/services/api/x/external-application/v1/job-application/submit${query(params)}`);
  return { submitted: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(jobApplicationSubmit);
