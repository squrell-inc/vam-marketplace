// Cornerstone is a built-in VAM connector (like Microsoft 365), not a marketplace MCP file.
// This test checks the built-in descriptor next to this marketplace checkout.
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const builtinPath = join(import.meta.dir, "../../../VAM/spec/connectors/cornerstone.json");
const listingConnectorPath = join(
  import.meta.dir,
  "../../listings/cornerstone/connectors/cornerstone/connector.json",
);

describe("cornerstone built-in connector (VAM)", () => {
  test("marketplace does not ship a connector.json (M365 pattern)", () => {
    expect(existsSync(listingConnectorPath)).toBe(false);
  });

  test("built-in file exists beside this marketplace repo", () => {
    expect(existsSync(builtinPath)).toBe(true);
  });

  const conn = existsSync(builtinPath)
    ? JSON.parse(readFileSync(builtinPath, "utf8"))
    : null;

  test("URN and admin-supplied client (Enable form: client id + secret)", () => {
    expect(conn.urn).toBe("urn:vam:connector:hub.squrell.cloud/squrell/cornerstone");
    expect(conn.provider.kind).toBe("oauth2");
    expect(conn.provider.profile).toBe("discover");
    expect(conn.provider.client).toBe("org");
    expect(conn.provider.clientSecret).toBe("org_vault");
    expect(conn.provider.clientId).toBeUndefined();
    expect(conn.provider.orgConsent).toBe("none");
  });

  test("connection holder is user (VAM v1)", () => {
    expect(conn.connection.holder).toBe("user");
    expect(conn.connection.multiAccount).toBe(false);
  });

  test("REST binding matches skills: csod / vamsec_csod", () => {
    expect(conn.mcp).toBeUndefined();
    expect(conn.bindings).toHaveLength(1);
    expect(conn.bindings[0]).toMatchObject({
      name: "csod",
      placeholder: "vamsec_csod",
      value: "access_token",
      inject: "bearer",
      hosts: ["vithiit.csod.com"],
    });
  });

  test("hardcoded scopes match the skill defaults (until Enable form exists)", () => {
    expect(conn.provider.scopes).toEqual([
      "globalsearch:read",
      "employee:read",
      "transcript:read",
    ]);
  });
});

