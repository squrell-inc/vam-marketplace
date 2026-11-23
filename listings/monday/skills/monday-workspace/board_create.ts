import { mondayGql, runTool, text } from "./lib/monday.ts";

export async function boardCreate(args: Record<string, any>) {
  const boardName = text(args, "boardName", true);
  const workspaceId = text(args, "workspaceId", false);
  const boardKind = text(args, "boardKind", false) || "public";

  const query = `mutation ($boardName: String!, $boardKind: BoardKind!, $workspaceId: ID) {
    create_board (board_name: $boardName, board_kind: $boardKind, workspace_id: $workspaceId) {
      id
      name
    }
  }`;
  const vars: Record<string, any> = { boardName, boardKind };
  if (workspaceId) vars.workspaceId = workspaceId;

  const { json } = await mondayGql(query, vars);
  const board = json?.data?.create_board;
  return {
    id: String(board?.id ?? ""),
    name: String(board?.name ?? boardName),
    created: Boolean(board?.id),
  };
}

if (import.meta.main) await runTool(boardCreate);
