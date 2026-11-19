import { csod, runTool, text, query } from "./lib/csod.ts";

export async function applicantCustomFields(args: Record<string, any>) {
  const RequisitionId = text(args, "RequisitionId", false, 200);
  const { json } = await csod("GET", `/services/api/Recruiting/JobApplicant/CustomFields${query({ RequisitionId: RequisitionId || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(applicantCustomFields);
