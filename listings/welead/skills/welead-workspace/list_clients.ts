import { runTool } from "./lib/runner.ts";

export function shapeClients(result: any) {
  let items: any[] = [];
  if (Array.isArray(result)) {
    items = result;
  } else if (Array.isArray(result?.clients)) {
    items = result.clients;
  } else if (result?.content && Array.isArray(result.content)) {
    const textPart = result.content.find((c: any) => c.type === "text");
    if (textPart?.text) {
      try {
        const parsed = JSON.parse(textPart.text);
        items = Array.isArray(parsed) ? parsed : (parsed?.clients ?? []);
      } catch {
        items = [];
      }
    }
  }

  return {
    clients: items.map((c: any) => ({
      id: String(c.id ?? ""),
      name: String(c.name ?? c.client_name ?? "Unnamed Client"),
      industry: String(c.industry ?? "General"),
      contactPerson: String(c.contact_person ?? c.contact_name ?? "Primary Contact"),
      email: String(c.email ?? "N/A"),
      activeDeals: String(c.active_deals ?? c.deals_count ?? "0")
    }))
  };
}

if (import.meta.main) {
  await runTool("list_clients", shapeClients);
}
