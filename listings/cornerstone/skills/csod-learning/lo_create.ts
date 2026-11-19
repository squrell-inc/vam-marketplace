import { csod, runTool, text } from "./lib/csod.ts";

export async function loCreate(args: Record<string, any>) {
  const title = text(args, "title", true, 500);
  const trainingType = text(args, "trainingType", true, 100);
  const body = args.body && typeof args.body === "object" ? args.body : { Title: title, TrainingType: trainingType };
  const { json } = await csod("POST", "/services/api/LO/Create", body);
  return { created: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(loCreate);