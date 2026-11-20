// ticket_search: GET /api/v2/search.json (a read; the card lists the tickets).
import { zendesk, runTool, text, ToolError } from "./lib/zendesk.ts";

export function searchPath(args: Record<string, any>): string {
  const query = text(args, "query", true, 500).trim();
  if (!query) throw new ToolError("'query' is required.");
  // Zendesk's search syntax: restrict to tickets unless the member's query already names a type.
  const q = /\btype:/.test(query) ? query : `type:ticket ${query}`;
  return `/api/v2/search.json?query=${encodeURIComponent(q)}`;
}

export function shape(json: any) {
  return {
    count: json?.count ?? 0,
    tickets: (json?.results ?? []).map((t: any) => ({
      id: t.id,
      subject: t.subject ?? "",
      status: t.status ?? "",
      priority: t.priority ?? "",
      updatedAt: t.updated_at ?? "",
      description: String(t.description ?? "").slice(0, 280),
    })),
  };
}

export async function ticketSearch(args: Record<string, any>) {
  const { json } = await zendesk("GET", searchPath(args));
  return shape(json);
}

if (import.meta.main) await runTool(ticketSearch);
