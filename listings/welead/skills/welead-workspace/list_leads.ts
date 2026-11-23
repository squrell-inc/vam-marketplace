import { runTool } from "./lib/runner.ts";

export function shapeLeads(result: any) {
  // Support both raw array, MCP content wrapper, or structured object
  let items: any[] = [];
  if (Array.isArray(result)) {
    items = result;
  } else if (Array.isArray(result?.leads)) {
    items = result.leads;
  } else if (result?.content && Array.isArray(result.content)) {
    const textPart = result.content.find((c: any) => c.type === "text");
    if (textPart?.text) {
      try {
        const parsed = JSON.parse(textPart.text);
        items = Array.isArray(parsed) ? parsed : (parsed?.leads ?? []);
      } catch {
        items = [];
      }
    }
  }

  return {
    leads: items.map((l: any) => ({
      id: String(l.id ?? ""),
      title: String(l.title ?? l.project_name ?? l.name ?? "Untitled Lead"),
      status: String(l.status ?? "New"),
      clientName: String(l.client_name ?? l.customer_name ?? "Direct"),
      valueLakhs: String(l.value_lakhs ?? l.amount ?? "0"),
      owner: String(l.owner ?? l.assigned_to ?? "Unassigned")
    }))
  };
}

if (import.meta.main) {
  await runTool("list_leads", shapeLeads);
}
