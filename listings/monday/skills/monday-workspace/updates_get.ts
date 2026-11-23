import { mondayGql, runTool, text } from "./lib/monday.ts";

export async function updatesGet(args: Record<string, any>) {
  const itemId = text(args, "itemId", true);
  const query = `query ($itemIds: [ID!]) {
    items (ids: $itemIds) {
      updates {
        id
        body
        creator {
          name
        }
      }
    }
  }`;
  const { json } = await mondayGql(query, { itemIds: [itemId] });
  const raw = json?.data?.items?.[0]?.updates ?? [];
  return {
    updates: raw.map((u: any) => ({
      id: String(u?.id ?? ""),
      creator: String(u?.creator?.name ?? "Teammate"),
      body: String(u?.body ?? "").replace(/<[^>]*>/g, "").trim(),
    })),
  };
}

if (import.meta.main) await runTool(updatesGet);
