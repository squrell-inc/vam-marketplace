import { mondayGql, runTool, text, whole } from "./lib/monday.ts";

export async function boardsList(args: Record<string, any>) {
  const workspaceId = text(args, "workspaceId", false);
  const limit = whole(args, "limit", 25, 1, 100);
  const query = `query ($limit: Int, $workspaceIds: [ID!]) {
    boards (limit: $limit, workspace_ids: $workspaceIds) {
      id
      name
      state
    }
  }`;
  const vars: Record<string, any> = { limit };
  if (workspaceId) vars.workspaceIds = [workspaceId];
  const { json } = await mondayGql(query, vars);
  const raw = json?.data?.boards ?? [];
  return {
    boards: raw.map((b: any) => ({
      id: String(b?.id ?? ""),
      name: String(b?.name ?? ""),
      state: String(b?.state ?? "active"),
    })),
  };
}

if (import.meta.main) await runTool(boardsList);
