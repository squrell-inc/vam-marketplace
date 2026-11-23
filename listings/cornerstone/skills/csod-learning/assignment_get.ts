import { csod, pathSeg, runTool } from "./lib/csod.ts";

export async function assignmentGet(args: Record<string, any>) {
  const id = pathSeg(args, "id");
  const { json } = await csod("GET", `/services/x/lms-learning-assignment/v1/learning-assignment/${id}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(assignmentGet);