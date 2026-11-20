// mail_search: GET /v1.0/me/messages (a read; the card lists the messages).
import { graph, runTool, text, whole, sender, ToolError } from "./lib/graph.ts";

export const SELECT = "id,subject,from,receivedDateTime,bodyPreview,isRead";

/** An ISO 8601 instant with a zone (`Z` or an offset), as UTC ISO text; "" when absent. */
export function instant(args: Record<string, any>, key: string): string {
  const v = text(args, key, false, 40);
  if (!v) return "";
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v) || isNaN(Date.parse(v))) {
    throw new ToolError(`'${key}' must be a date-time with a zone, like 2026-11-19T00:00:00Z.`);
  }
  return new Date(v).toISOString();
}

export function searchPath(args: Record<string, any>, now: Date = new Date()): string {
  const query = text(args, "query", false, 500).replace(/"/g, " ").trim();
  const top = whole(args, "top", 10, 1, 25);
  const since = instant(args, "since");
  const until = instant(args, "until");
  const q = [`$select=${SELECT}`, `$top=${top}`];
  if (query) {
    if (since || until || args.sinceHours !== undefined) {
      // Graph cannot combine $search with $filter or $orderby.
      throw new ToolError("'query' cannot be combined with 'since', 'until' or 'sinceHours'.");
    }
    q.push(`$search=${encodeURIComponent(`"${query}"`)}`);
  } else {
    if ((since || until) && args.sinceHours !== undefined) {
      throw new ToolError("Give 'since'/'until' or 'sinceHours', not both.");
    }
    const from = since || new Date(now.getTime() - whole(args, "sinceHours", 24, 1, 24 * 31) * 3600_000).toISOString();
    if (until && until <= from) throw new ToolError("'until' must be after 'since'.");
    const filter = until ? `receivedDateTime ge ${from} and receivedDateTime lt ${until}` : `receivedDateTime ge ${from}`;
    q.push(`$filter=${encodeURIComponent(filter)}`);
    q.push(`$orderby=${encodeURIComponent("receivedDateTime desc")}`);
  }
  return `/v1.0/me/messages?${q.join("&")}`;
}

export function shape(json: any) {
  return {
    messages: (json?.value ?? []).map((m: any) => ({
      id: m.id,
      from: sender(m.from),
      subject: m.subject ?? "",
      receivedAt: m.receivedDateTime ?? "",
      preview: (m.bodyPreview ?? "").slice(0, 280),
      unread: m.isRead === false,
    })),
  };
}

export async function mailSearch(args: Record<string, any>) {
  const { json } = await graph("GET", searchPath(args));
  return shape(json);
}

if (import.meta.main) await runTool(mailSearch);
