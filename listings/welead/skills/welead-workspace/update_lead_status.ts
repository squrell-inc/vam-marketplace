import { runTool } from "./lib/runner.ts";

if (import.meta.main) {
  await runTool("update_lead_status");
}
