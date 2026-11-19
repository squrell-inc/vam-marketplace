import { csod, runTool, text, query } from "./lib/csod.ts";

export async function assignmentSearch(args: Record<string, any>) {
  const name = text(args, "name", false, 200);
  const { json } = await csod(
    "GET",
    `/services/x/lms-learning-assignment/v1/learning-assignment/search${query({ name: name || undefined })}`,
  );
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(assignmentSearch);