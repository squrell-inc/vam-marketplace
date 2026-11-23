import { mondayGql, runTool, text } from "./lib/monday.ts";

export async function updateCreate(args: Record<string, any>) {
  const itemId = text(args, "itemId", true);
  const body = text(args, "body", true);

  const query = `mutation ($itemId: ID!, $body: String!) {
    create_update (item_id: $itemId, body: $body) {
      id
    }
  }`;

  const { json } = await mondayGql(query, { itemId, body });
  const update = json?.data?.create_update;
  return {
    id: String(update?.id ?? ""),
    posted: Boolean(update?.id),
  };
}

if (import.meta.main) await runTool(updateCreate);
