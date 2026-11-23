import { csod, runTool, query, text } from "./lib/csod.ts";

export async function requisitionAd(args: Record<string, any>) {
  const id = text(args, "requisitionId", false, 200);
  const { json } = await csod("GET", `/services/api/Recruiting/JobRequisitionDetails/Ad${query({ RequisitionId: id || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(requisitionAd);
