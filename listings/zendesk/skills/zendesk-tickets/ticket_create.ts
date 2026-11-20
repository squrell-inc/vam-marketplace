// ticket_create: POST /api/v2/tickets.json (a write; always approved by the member first).
import { zendesk, runTool, text, ToolError } from "./lib/zendesk.ts";

const PRIORITIES = ["urgent", "high", "normal", "low"];

export function createBody(args: Record<string, any>) {
  const subject = text(args, "subject", true, 250);
  const body = text(args, "body", true, 20000);
  const priority = text(args, "priority", false, 10);
  if (priority && !PRIORITIES.includes(priority)) throw new ToolError(`'priority' must be one of ${PRIORITIES.join(", ")}.`);
  return { ticket: { subject, comment: { body }, ...(priority ? { priority } : {}) } };
}

export async function ticketCreate(args: Record<string, any>) {
  const { json } = await zendesk("POST", "/api/v2/tickets.json", createBody(args));
  const t = json?.ticket ?? {};
  return { created: true, id: t.id, subject: t.subject ?? "", status: t.status ?? "" };
}

if (import.meta.main) await runTool(ticketCreate);
