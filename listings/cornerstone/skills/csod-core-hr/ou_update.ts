import { csod, pathSeg, query, runTool, ToolError } from "./lib/csod.ts";

export async function ouUpdate(args: Record<string, any>) {
  const id = pathSeg(args, "id");
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("PUT", `/services/api/x/organizations/v1/ous${query({ id })}`, args.body);
  return { updated: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(ouUpdate);
