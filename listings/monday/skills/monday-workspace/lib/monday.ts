// Shared helpers for monday.com tools. Runs in the guest under Bun.
//
// Every external request goes to the in-guest proxy endpoint with the destination in X-Target-Url
// and the connector placeholder as credential, or connects via MCP.

export const PLACEHOLDER = "vamsec_monday_api";
export const MONDAY_HOST = "api.monday.com";

/** A failure the member or the model can act on. */
export class ToolError extends Error {}

export function proxyEndpoint(): string {
  return process.env.VAM_EGRESS_ENDPOINT || "http://127.0.0.1:3128";
}

export interface MondayReply {
  status: number;
  json: any;
}

/**
 * Execute a GraphQL operation against monday.com.
 */
export async function mondayGql(
  query: string,
  variables: Record<string, any> = {},
): Promise<MondayReply> {
  const res = await fetch(proxyEndpoint(), {
    method: "POST",
    headers: {
      "X-Target-Url": `https://${MONDAY_HOST}/v2`,
      Authorization: PLACEHOLDER,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json: any = null;
  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }
  if (res.status < 200 || res.status >= 300) {
    const errorMsg = json?.error_message || json?.errors?.[0]?.message || text.slice(0, 300);
    throw new ToolError(`monday.com answered ${res.status}: ${errorMsg}`.trim());
  }
  return { status: res.status, json };
}

/** Reads tool arguments as one JSON object from stdin. */
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

/** Runs one tool: reads stdin, logs JSON output, or exits 1 with error on stderr. */
export async function runTool(
  tool: (args: Record<string, any>) => Promise<unknown>,
): Promise<void> {
  try {
    const result = await tool(await readArgs());
    console.log(JSON.stringify(result));
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

export function whole(args: Record<string, any>, key: string, fallback: number, min: number, max: number): number {
  const v = args[key];
  if (v === undefined || v === null) return fallback;
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) {
    throw new ToolError(`'${key}' must be a whole number from ${min} to ${max}.`);
  }
  return v;
}
