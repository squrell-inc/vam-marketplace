import { mondayGql, runTool, text } from "./lib/monday.ts";

export async function boardInsights(args: Record<string, any>) {
  const boardId = text(args, "boardId", true);
  const query = `query ($boardIds: [ID!]) {
    boards (ids: $boardIds) {
      name
      items_page (limit: 100) {
        items {
          id
          state
        }
      }
    }
  }`;
  const { json } = await mondayGql(query, { boardIds: [boardId] });
  const board = json?.data?.boards?.[0];
  const items: any[] = board?.items_page?.items ?? [];
  const activeCount = items.filter((i) => i.state === "active").length;
  const archivedCount = items.filter((i) => i.state === "archived").length;

  return {
    insights: [
      { label: "Total items", value: String(items.length) },
      { label: "Active items", value: String(activeCount) },
      { label: "Archived items", value: String(archivedCount) },
    ],
  };
}

if (import.meta.main) await runTool(boardInsights);
