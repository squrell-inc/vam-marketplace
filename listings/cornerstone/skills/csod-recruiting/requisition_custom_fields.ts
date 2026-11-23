import { csod, runTool, query, text } from "./lib/csod.ts";

export async function requisitionCustomFields(args: Record<string, any>) {
  const id = text(args, "requisitionId", false, 200);
  const { json } = await csod("GET", `/services/api/Recruiting/JobRequisitionDetails/CustomField${query({ RequisitionId: id || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(requisitionCustomFields);
