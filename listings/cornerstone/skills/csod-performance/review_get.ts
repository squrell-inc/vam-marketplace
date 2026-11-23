import { csod, runTool, query, text } from "./lib/csod.ts";

export async function reviewGet(args: Record<string, any>) {
  const userId = text(args, "userId", false, 100);
  const { json } = await csod("GET", `/services/api/Review/PerformanceReview${query({ UserId: userId || undefined })}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(reviewGet);
