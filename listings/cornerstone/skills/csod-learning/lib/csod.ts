// Shared helpers for Cornerstone skill tools. Runs in the guest under Bun.
// Manifest egress uses `{subdomain}.csod.com`. The node writes the filled host into
// `.vam/connector.json` after Enable (CN-6.5). No portal URL is hardcoded here.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const PLACEHOLDER = "vamsec_cornerstone_csod";
export class ToolError extends Error {}
export function proxyEndpoint(): string {
  return process.env.VAM_EGRESS_ENDPOINT || "http://127.0.0.1:3128";
}
function hostFromHint(): string {
  try {
    const raw = readFileSync(join(import.meta.dir, "..", ".vam", "connector.json"), "utf8");
    const v = JSON.parse(raw);
    const h = v?.hosts?.csod;
    return typeof h === "string" ? h.trim().toLowerCase() : "";
  } catch {
    return "";
  }
}
export function csodHost(): string {
  // Tests may set VAM_CSOD_HOST; in a session the node hint wins when env is unset.
  const h = (process.env.VAM_CSOD_HOST || hostFromHint()).trim().toLowerCase();
  if (!h) {
    throw new ToolError(
      "Cornerstone portal is not configured. An admin must Enable the connector with the company address.",
    );
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.csod\.com$/.test(h)) {
    throw new ToolError("Cornerstone host must look like acme.csod.com.");
  }
  return h;
}
export interface CsodReply { status: number; json: any; }
export async function csod(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  pathAndQuery: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<CsodReply> {
  if (!pathAndQuery.startsWith("/")) throw new ToolError("Internal path must start with /.");
  const res = await fetch(proxyEndpoint(), {
    method,
    headers: {
      "X-Target-Url": `https://${csodHost()}${pathAndQuery}`,
      Authorization: PLACEHOLDER,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const textBody = await res.text();
  let json: any = null;
  if (textBody.trim()) {
    try { json = JSON.parse(textBody); } catch { json = null; }
  }
  if (res.status < 200 || res.status >= 300) {
    const message = json?.error?.description || json?.error?.message || json?.message || textBody.slice(0, 300);
    throw new ToolError(`Cornerstone answered ${res.status} (${message})`.trim());
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
export function whole(args: Record<string, any>, key: string, fallback: number, min: number, max: number): number {
  const v = args[key];
  if (v === undefined || v === null) return fallback;
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) {
    throw new ToolError(`'${key}' must be a whole number from ${min} to ${max}.`);
  }
  return v;
}
export function query(params: Record<string, string | number | undefined | null>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}
export function pathSeg(args: Record<string, any>, key: string, required = true, max = 200): string {
  const v = text(args, key, required, max);
  if (!v) return "";
  if (!/^[A-Za-z0-9_@.=-]+$/.test(v)) throw new ToolError(`'${key}' is not a safe id.`);
  return encodeURIComponent(v);
}
