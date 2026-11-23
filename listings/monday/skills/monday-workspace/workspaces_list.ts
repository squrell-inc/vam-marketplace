import { mondayGql, runTool, whole } from "./lib/monday.ts";

export async function workspacesList(args: Record<string, any>) {
  const limit = whole(args, "limit", 25, 1, 100);
  const query = `query ($limit: Int) {
    workspaces (limit: $limit) {
      id
      name
      kind
    }
  }`;
  const { json } = await mondayGql(query, { limit });
  const raw = json?.data?.workspaces ?? [];
  return {
    workspaces: raw.map((w: any) => ({
      id: String(w?.id ?? ""),
      name: String(w?.name ?? ""),
      kind: String(w?.kind ?? "open"),
    })),
  };
}

if (import.meta.main) await runTool(workspacesList);
