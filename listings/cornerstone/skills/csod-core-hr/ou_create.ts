import { csod, runTool, ToolError } from "./lib/csod.ts";

export async function ouCreate(args: Record<string, any>) {
  if (!args.body || typeof args.body !== "object") throw new ToolError("'body' is required.");
  const { json } = await csod("POST", "/services/api/x/organizations/v1/ous", args.body);
  return { created: true, result: json?.data ?? json };
}

if (import.meta.main) await runTool(ouCreate);
