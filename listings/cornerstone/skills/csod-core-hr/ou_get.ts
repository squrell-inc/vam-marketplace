import { csod, pathSeg, runTool } from "./lib/csod.ts";

export async function ouGet(args: Record<string, any>) {
  const id = pathSeg(args, "id");
  const { json } = await csod("GET", `/services/api/x/organizations/v1/ous/${id}`);
  return { result: json?.data ?? json };
}

if (import.meta.main) await runTool(ouGet);
