import { runTool } from "./lib/runner.ts";

if (import.meta.main) {
  await runTool("create_client");
}
