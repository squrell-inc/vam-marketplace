// ticket_show: GET /api/v2/tickets/{id}.json (a read).
import { zendesk, runTool, ticketId } from "./lib/zendesk.ts";

export function shape(json: any) {
  const t = json?.ticket ?? {};
  return {
    id: t.id,
    subject: t.subject ?? "",
    status: t.status ?? "",
    priority: t.priority ?? "",
    createdAt: t.created_at ?? "",
    updatedAt: t.updated_at ?? "",
    tags: t.tags ?? [],
    description: String(t.description ?? "").slice(0, 8000),
  };
}

export async function ticketShow(args: Record<string, any>) {
  const { json } = await zendesk("GET", `/api/v2/tickets/${ticketId(args)}.json`);
  return shape(json);
}

if (import.meta.main) await runTool(ticketShow);
