import { csod, runTool, text, query } from "./lib/csod.ts";

export async function transcriptDetails(args: Record<string, any>) {
  const userId = text(args, "userId", false, 100);
  const transcriptId = text(args, "transcriptId", false, 200);
  const { json } = await csod(
    "GET",
    `/services/api/v1/transcripts/details${query({ userId: userId || undefined, transcriptId: transcriptId || undefined })}`,
  );
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(transcriptDetails);