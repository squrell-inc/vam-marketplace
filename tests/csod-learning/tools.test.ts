// Tests for csod-learning tools against a fake egress proxy (no network, no token).
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const skill = join(import.meta.dir, "../../listings/cornerstone/skills/csod-learning");
const hintDir = join(skill, ".vam");
const hintFile = join(hintDir, "connector.json");
const recorded = (name: string) => JSON.parse(readFileSync(join(import.meta.dir, "recorded", name), "utf8"));

type Seen = { method: string; target: string; auth: string; body: any };
let seen: Seen[] = [];
let reply: { status: number; body: unknown } = { status: 200, body: {} };
let server: ReturnType<typeof Bun.serve>;

beforeAll(() => {
  // Same shape the node writes at session stage (CN-6.5) after admin Enable.
  mkdirSync(hintDir, { recursive: true });
  writeFileSync(
    hintFile,
    JSON.stringify({ connector: "cornerstone", hosts: { csod: "acme.csod.com" } }),
  );
  delete process.env.VAM_CSOD_HOST;
  server = Bun.serve({
    port: 0,
    async fetch(req) {
      const text = await req.text();
      seen.push({
        method: req.method,
        target: req.headers.get("x-target-url") ?? "",
        auth: req.headers.get("authorization") ?? "",
        body: text ? JSON.parse(text) : null,
      });
      return new Response(JSON.stringify(reply.body), {
        status: reply.status,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  process.env.VAM_EGRESS_ENDPOINT = `http://127.0.0.1:${server.port}`;
});
afterAll(() => {
  server.stop(true);
  rmSync(hintDir, { recursive: true, force: true });
});

function answer(status: number, body: unknown) {
  seen = [];
  reply = { status, body };
}

const mod = (name: string) => import(join(skill, name));

describe("catalog_search", () => {
  test("searches the catalog and shapes results", async () => {
    answer(200, recorded("catalog.json"));
    const { catalogSearch } = await mod("catalog_search.ts");
    const out = await catalogSearch({ query: "compliance", pageSize: 10 });
    expect(seen).toHaveLength(1);
    const url = new URL(seen[0].target);
    expect(url.origin).toBe("https://acme.csod.com");
    expect(url.pathname).toBe("/services/api/Catalog/GlobalSearch");
    expect(url.searchParams.get("SearchText")).toBe("compliance");
    expect(seen[0].auth).toBe("vamsec_cornerstone_csod");
    expect(out.results[0]).toEqual({
      id: "lo-1001",
      title: "Compliance Foundations",
      type: "Online Course",
      provider: "Cornerstone",
    });
  });

  test("rejects a bad page size", async () => {
    const { catalogSearch } = await mod("catalog_search.ts");
    await expect(catalogSearch({ pageSize: 500 })).rejects.toThrow("'pageSize'");
  });
});

describe("lo_get_details", () => {
  test("requires objectId and hits GetDetails", async () => {
    answer(200, { data: { ObjectId: "lo-1001", Title: "Compliance Foundations" } });
    const { loGetDetails } = await mod("lo_get_details.ts");
    const out = await loGetDetails({ objectId: "lo-1001" });
    expect(new URL(seen[0].target).pathname).toBe("/services/api/LO/GetDetails");
    expect(out.title).toBe("Compliance Foundations");
  });
});

describe("assignment_create", () => {
  test("posts a standard assignment with placeholder auth", async () => {
    answer(200, { data: { assignmentId: 1022 } });
    const { assignmentCreate } = await mod("assignment_create.ts");
    const out = await assignmentCreate({ name: "Q1 compliance", body: { learningObjectIds: ["lo-1001"] } });
    expect(seen[0].method).toBe("POST");
    expect(new URL(seen[0].target).pathname).toBe(
      "/services/x/lms-learning-assignment/v1/learning-assignment/standard",
    );
    expect(seen[0].auth).toBe("vamsec_cornerstone_csod");
    expect(out.created).toBe(true);
  });
});
