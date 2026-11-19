import { csod, runTool, text, whole, query } from "./lib/csod.ts";

export async function transcriptSearch(args: Record<string, any>) {
  const userId = text(args, "userId", false, 100);
  const page = whole(args, "page", 1, 1, 1000);
  const { json } = await csod(
    "GET",
    `/services/api/LOTranscript/TranscriptSearch${query({ UserId: userId || undefined, PageNumber: page })}`,
  );
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(transcriptSearch);