import { mondayGql, runTool, text } from "./lib/monday.ts";

export async function itemCreate(args: Record<string, any>) {
  const boardId = text(args, "boardId", true);
  const itemName = text(args, "itemName", true);
  const groupId = text(args, "groupId", false);

  const query = `mutation ($boardId: ID!, $itemName: String!, $groupId: String) {
    create_item (board_id: $boardId, item_name: $itemName, group_id: $groupId) {
      id
      name
    }
  }`;
  const vars: Record<string, any> = { boardId, itemName };
  if (groupId) vars.groupId = groupId;

  const { json } = await mondayGql(query, vars);
  const item = json?.data?.create_item;
  return {
    id: String(item?.id ?? ""),
    name: String(item?.name ?? itemName),
    created: Boolean(item?.id),
  };
}

if (import.meta.main) await runTool(itemCreate);
