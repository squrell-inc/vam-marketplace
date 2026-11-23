// local_tool_runner.ts: Adapter script executing WeLead API requests through VAM egress proxy
import { readFileSync } from "node:fs";

export function proxyEndpoint(): string {
  return process.env.VAM_EGRESS_ENDPOINT || "http://127.0.0.1:3128";
}

export async function invokeWeLead(toolName: string, args: Record<string, any>) {
  const res = await fetch(proxyEndpoint(), {
    method: "POST",
    headers: {
      "X-Target-Url": "https://welead.vithiit.com/mcp",
      "Content-Type": "application/json",
      Authorization: "vamsec_welead_token",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WeLead request failed with status ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`WeLead tool error: ${data.error.message || JSON.stringify(data.error)}`);
  }
  return data.result;
}

export async function runTool(toolName: string, transform?: (result: any) => any) {
  try {
    const inputRaw = readFileSync(0, "utf-8");
    const args = inputRaw.trim() ? JSON.parse(inputRaw) : {};
    const result = await invokeWeLead(toolName, args);
    const finalResult = transform ? transform(result) : result;
    process.stdout.write(JSON.stringify(finalResult));
  } catch (err: any) {
    process.stderr.write(err.message || String(err));
    process.exit(1);
  }
}
