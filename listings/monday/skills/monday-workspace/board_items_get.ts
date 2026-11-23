import { mondayGql, runTool, text, whole } from "./lib/monday.ts";

export async function boardItemsGet(args: Record<string, any>) {
  const boardId = text(args, "boardId", true);
  const limit = whole(args, "limit", 50, 1, 100);
  const query = `query ($boardIds: [ID!], $limit: Int) {
    boards (ids: $boardIds) {
      items_page (limit: $limit) {
        items {
          id
          name
          state
        }
      }
    }
  }`;
  const { json } = await mondayGql(query, { boardIds: [boardId], limit });
  const items = json?.data?.boards?.[0]?.items_page?.items ?? [];
  return {
    items: items.map((i: any) => ({
      id: String(i?.id ?? ""),
      name: String(i?.name ?? ""),
      status: String(i?.state ?? "active"),
    })),
  };
}

if (import.meta.main) await runTool(boardItemsGet);
