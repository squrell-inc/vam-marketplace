import { csod, runTool, text } from "./lib/csod.ts";

export async function assignmentCreate(args: Record<string, any>) {
  const name = text(args, "name", true, 500);
  const body = args.body && typeof args.body === "object" ? { name, ...args.body } : { name };
  const { json } = await csod("POST", "/services/x/lms-learning-assignment/v1/learning-assignment/standard", body);
  return { created: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(assignmentCreate);