import { csod, runTool, text, query } from "./lib/csod.ts";

export async function loGetDetails(args: Record<string, any>) {
  const objectId = text(args, "objectId", true, 200);
  const { json } = await csod("GET", `/services/api/LO/GetDetails${query({ ObjectId: objectId })}`);
  const d = json?.data ?? json?.Data ?? json;
  return {
    id: String(d?.ObjectId ?? d?.id ?? objectId),
    title: String(d?.Title ?? d?.title ?? ""),
    type: String(d?.TrainingType ?? d?.type ?? ""),
    description: String(d?.Description ?? d?.description ?? "").slice(0, 4000),
    raw: d,
  };
}

if (import.meta.main) await runTool(loGetDetails);