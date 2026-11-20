// Tests for the zendesk-tickets tools. A local server plays the guest's egress proxy: it checks what
// the tool sent (target URL, placeholder, body) and answers with a canned Zendesk response.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const skill = join(import.meta.dir, "../../listings/zendesk/skills/zendesk-tickets");
type Seen = { method: string; target: string; auth: string; body: any };
let seen: Seen[] = [];
let reply: { status: number; body: unknown } = { status: 200, body: {} };
let server: ReturnType<typeof Bun.serve>;
const dir = mkdtempSync(join(tmpdir(), "zd-"));
const file = join(dir, "connector.json");

function host(h: string) {
  writeFileSync(file, JSON.stringify({ connector: "zendesk", hosts: { api: h } }));
}
function answer(status: number, body: unknown) {
  seen = [];
  reply = { status, body };
}

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    async fetch(req) {
      const t = await req.text();
      seen.push({
        method: req.method,
        target: req.headers.get("x-target-url") ?? "",
        auth: req.headers.get("authorization") ?? "",
        body: t ? JSON.parse(t) : null,
      });
      return new Response(JSON.stringify(reply.body), { status: reply.status, headers: { "Content-Type": "application/json" } });
    },
  });
  process.env.VAM_EGRESS_ENDPOINT = `http://127.0.0.1:${server.port}`;
  process.env.VAM_CONNECTOR_FILE = file;
  host("acme.zendesk.com");
});
afterAll(() => server.stop(true));

const mod = (n: string) => import(join(skill, n));

describe("ticket_search", () => {
  test("uses the host from .vam/connector.json and the placeholder as the bearer", async () => {
    answer(200, { count: 1, results: [{ id: 35436, subject: "Printer jam", status: "open", priority: "high", updated_at: "2026-11-09T07:00:00Z", description: "It jams." }] });
    const { ticketSearch } = await mod("ticket_search.ts");
    const out = await ticketSearch({ query: "printer" });
    const url = new URL(seen[0].target);
    expect(seen[0].method).toBe("GET");
    expect(url.origin).toBe("https://acme.zendesk.com");
    expect(url.pathname).toBe("/api/v2/search.json");
    expect(url.searchParams.get("query")).toBe("type:ticket printer");
    expect(seen[0].auth).toBe("vamsec_zendesk_api");
    expect(out.tickets[0]).toEqual({ id: 35436, subject: "Printer jam", status: "open", priority: "high", updatedAt: "2026-11-09T07:00:00Z", description: "It jams." });
  });

  test("another subdomain in the file changes the host", async () => {
    host("globex.zendesk.com");
    answer(200, { count: 0, results: [] });
    const { ticketSearch } = await mod("ticket_search.ts");
    await ticketSearch({ query: "type:ticket status:open" });
    expect(new URL(seen[0].target).origin).toBe("https://globex.zendesk.com");
    expect(new URL(seen[0].target).searchParams.get("query")).toBe("type:ticket status:open");
    host("acme.zendesk.com");
  });

  test("needs a query", async () => {
    const { ticketSearch } = await mod("ticket_search.ts");
    await expect(ticketSearch({})).rejects.toThrow("'query'");
  });

  test("refuses a missing file and a host outside zendesk.com", async () => {
    const { ticketSearch } = await mod("ticket_search.ts");
    writeFileSync(file, JSON.stringify({ hosts: { api: "evil.example" } }));
    await expect(ticketSearch({ query: "x" })).rejects.toThrow("zendesk.com");
    process.env.VAM_CONNECTOR_FILE = join(dir, "none.json");
    await expect(ticketSearch({ query: "x" })).rejects.toThrow("does not know");
    process.env.VAM_CONNECTOR_FILE = file;
    host("acme.zendesk.com");
  });
});

describe("ticket_show", () => {
  test("reads one ticket by numeric id", async () => {
    answer(200, { ticket: { id: 35436, subject: "Printer jam", status: "open", description: "It jams.", tags: ["it"] } });
    const { ticketShow } = await mod("ticket_show.ts");
    const out = await ticketShow({ id: 35436 });
    expect(new URL(seen[0].target).pathname).toBe("/api/v2/tickets/35436.json");
    expect(seen[0].auth).toBe("vamsec_zendesk_api");
    expect(out.subject).toBe("Printer jam");
    expect(out.tags).toEqual(["it"]);
  });

  test("an id cannot add a path segment", async () => {
    const { ticketShow } = await mod("ticket_show.ts");
    await expect(ticketShow({ id: "1/../2" })).rejects.toThrow("not a ticket id");
    await expect(ticketShow({ id: "12.json" })).rejects.toThrow("not a ticket id");
  });

  test("a Zendesk error is reported without a token", async () => {
    answer(404, { error: "RecordNotFound", description: "Not found" });
    const { ticketShow } = await mod("ticket_show.ts");
    await expect(ticketShow({ id: 1 })).rejects.toThrow("Zendesk answered 404");
  });
});

describe("ticket_create", () => {
  test("posts the ticket to the exact path", async () => {
    answer(201, { ticket: { id: 77, subject: "Laptop", status: "new" } });
    const { ticketCreate } = await mod("ticket_create.ts");
    const out = await ticketCreate({ subject: "Laptop", body: "Needs a new one", priority: "low" });
    expect(seen[0].method).toBe("POST");
    expect(new URL(seen[0].target).pathname).toBe("/api/v2/tickets.json");
    expect(new URL(seen[0].target).origin).toBe("https://acme.zendesk.com");
    expect(seen[0].auth).toBe("vamsec_zendesk_api");
    expect(seen[0].body).toEqual({ ticket: { subject: "Laptop", comment: { body: "Needs a new one" }, priority: "low" } });
    expect(out).toEqual({ created: true, id: 77, subject: "Laptop", status: "new" });
  });

  test("rejects missing fields and a bad priority", async () => {
    const { ticketCreate } = await mod("ticket_create.ts");
    await expect(ticketCreate({ body: "x" })).rejects.toThrow("'subject'");
    await expect(ticketCreate({ subject: "x", body: "y", priority: "asap" })).rejects.toThrow("'priority'");
  });
});

describe("no token in code", () => {
  test("the skill source names only the placeholder and holds no token", () => {
    const files = [...readdirSync(skill), ...readdirSync(join(skill, "lib")).map((f) => `lib/${f}`)].filter((f) => f.endsWith(".ts"));
    for (const f of files) {
      const src = readFileSync(join(skill, f), "utf8");
      expect(src).not.toMatch(/Bearer\s+[A-Za-z0-9]/);
      expect(src).not.toMatch(/access_token\s*[:=]\s*["'][^"']+["']/);
      expect(src).not.toMatch(/\b[A-Za-z0-9_-]{32,}\b/);
    }
    expect(readFileSync(join(skill, "lib/zendesk.ts"), "utf8")).toContain('"vamsec_zendesk_api"');
  });
});
