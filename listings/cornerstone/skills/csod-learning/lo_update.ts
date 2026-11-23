import { csod, runTool, text } from "./lib/csod.ts";

export async function loUpdate(args: Record<string, any>) {
  const objectId = text(args, "objectId", true, 200);
  const body = args.body && typeof args.body === "object" ? { ...args.body, ObjectId: objectId } : { ObjectId: objectId };
  const { json } = await csod("POST", "/services/api/LO/Update", body);
  return { updated: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(loUpdate);