import { mondayGql, runTool, text } from "./lib/monday.ts";

export async function itemChangeColumnValues(args: Record<string, any>) {
  const boardId = text(args, "boardId", true);
  const itemId = text(args, "itemId", true);
  const columnValues = text(args, "columnValues", true);

  const query = `mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
    change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
      id
    }
  }`;

  const { json } = await mondayGql(query, { boardId, itemId, columnValues });
  const item = json?.data?.change_multiple_column_values;
  return {
    id: String(item?.id ?? itemId),
    updated: Boolean(item?.id),
  };
}

if (import.meta.main) await runTool(itemChangeColumnValues);
