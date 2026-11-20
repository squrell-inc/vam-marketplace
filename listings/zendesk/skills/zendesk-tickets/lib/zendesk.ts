// Shared helpers for the zendesk-tickets tools. Runs in the guest under Bun.
//
// The tools hold no token. The company's host comes from `.vam/connector.json` (written by the node
// next to manifest.json). Every request goes to the in-guest egress proxy with the destination in
// `X-Target-Url` and only the connector's placeholder as the bearer value; the node swaps in the
// member's access token and enforces each tool's declared shape.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const PLACEHOLDER = "vamsec_zendesk_api";
const HOST_SHAPE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.zendesk\.com$/;

/** A failure the member or the model can act on. The message never holds a token. */
export class ToolError extends Error {}

export function proxyEndpoint(): string {
  return process.env.VAM_EGRESS_ENDPOINT || "http://127.0.0.1:3128";
}

/** Where the node wrote the company host (a test may point it elsewhere). */
export function connectorFile(): string {
  return process.env.VAM_CONNECTOR_FILE || join(import.meta.dir, "..", ".vam", "connector.json");
}

/** The company's Zendesk host, `<subdomain>.zendesk.com`, from `.vam/connector.json` (`hosts.api`). */
export function companyHost(): string {
  let host = "";
  try {
    host = String(JSON.parse(readFileSync(connectorFile(), "utf8"))?.hosts?.api ?? "");
  } catch {
    host = "";
  }
  if (!host) throw new ToolError("This skill does not know the company's Zendesk host: ask your admin to enable the Zendesk connector.");
  if (!HOST_SHAPE.test(host)) throw new ToolError("The company's Zendesk host is not a zendesk.com address.");
  return host;
}

export interface ZendeskReply {
  status: number;
  json: any;
}

/** One call to the company's Zendesk through the egress proxy. `pathAndQuery` starts with `/api/v2/`. */
export async function zendesk(
  method: "GET" | "POST",
  pathAndQuery: string,
  body?: unknown,
): Promise<ZendeskReply> {
  const res = await fetch(proxyEndpoint(), {
    method,
    headers: {
      "X-Target-Url": `https://${companyHost()}${pathAndQuery}`,
      Authorization: PLACEHOLDER,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await res.text();
  let json: any = null;
  if (raw.trim()) {
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }
  }
  if (res.status < 200 || res.status >= 300) {
    const detail = json?.error?.message ?? json?.description ?? (typeof json?.error === "string" ? json.error : "") ?? "";
    throw new ToolError(`Zendesk answered ${res.status} (${detail || raw.slice(0, 300)})`.trim());
  }
  return { status: res.status, json };
}

export async function readArgs(): Promise<Record<string, any>> {
  const raw = (await Bun.stdin.text()).trim();
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    throw new ToolError("The arguments were not a JSON object.");
  }
}

/** Runs one tool: reads stdin, prints the result as JSON, or the failure on stderr with exit 1. */
export async function runTool(tool: (args: Record<string, any>) => Promise<unknown>): Promise<void> {
  try {
    console.log(JSON.stringify(await tool(await readArgs())));
  } catch (e) {
    const message = e instanceof ToolError ? e.message : `Unexpected failure: ${(e as Error)?.message ?? e}`;
    console.error(JSON.stringify({ error: message }));
    process.exit(1);
  }
}

export function text(args: Record<string, any>, key: string, required = false, max = 20000): string {
  const v = args[key];
  if (v === undefined || v === null || v === "") {
    if (required) throw new ToolError(`'${key}' is required.`);
    return "";
  }
  if (typeof v !== "string") throw new ToolError(`'${key}' must be text.`);
  if (v.length > max) throw new ToolError(`'${key}' is longer than ${max} characters.`);
  return v;
}

export function ticketId(args: Record<string, any>): string {
  const v = args.id;
  const id = typeof v === "number" ? String(v) : text(args, "id", true, 20);
  if (!/^[0-9]{1,15}$/.test(id)) throw new ToolError("'id' is not a ticket id (digits only).");
  return id;
}
