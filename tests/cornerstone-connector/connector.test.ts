// Marketplace Cornerstone connector: Phase 6 company address + REST bindings (not MCP).
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const listingConnectorPath = join(
  import.meta.dir,
  "../../listings/cornerstone/connectors/cornerstone/connector.json",
);

describe("cornerstone marketplace connector (HTTP / REST)", () => {
  test("listing ships connector.json", () => {
    expect(existsSync(listingConnectorPath)).toBe(true);
  });

  const conn = existsSync(listingConnectorPath)
    ? JSON.parse(readFileSync(listingConnectorPath, "utf8"))
    : null;

  test("oauth + org client (REST marketplace shape, not MCP discover)", () => {
    expect(conn.urn).toBe("urn:vam:connector:hub.squrell.cloud/squrell/cornerstone");
    expect(conn.version).toBe("1.0.2");
    expect(conn.provider.kind).toBe("oauth2");
    expect(conn.provider.profile).toBe("oauth");
    expect(conn.provider.client).toBe("org");
    expect(conn.provider.clientSecret).toBe("none");
    expect(conn.provider.orgConsent).toBe("none");
    expect(conn.mcp).toBeUndefined();
  });

  test("tenant block so Enable shows company address", () => {
    expect(conn.tenant).toEqual({
      name: "subdomain",
      suffix: "csod.com",
      label: "Your Cornerstone portal",
    });
  });

  test("token/authorize and binding host use {subdomain}.csod.com", () => {
    expect(conn.provider.endpoints.authorize).toBe(
      "https://{subdomain}.csod.com/services/api/oauth2/authorize",
    );
    expect(conn.provider.endpoints.token).toBe(
      "https://{subdomain}.csod.com/services/api/oauth2/token",
    );
    expect(conn.bindings).toHaveLength(1);
    expect(conn.bindings[0]).toMatchObject({
      name: "csod",
      placeholder: "vamsec_cornerstone_csod",
      value: "access_token",
      inject: "bearer",
      hosts: ["{subdomain}.csod.com"],
    });
  });

  test("connection holder is user", () => {
    expect(conn.connection.holder).toBe("user");
    expect(conn.connection.multiAccount).toBe(false);
  });

  test("skill egress hosts match the csod binding template", () => {
    for (const skill of [
      "csod-learning",
      "csod-core-hr",
      "csod-performance",
      "csod-recruiting",
    ]) {
      const manifest = JSON.parse(
        readFileSync(
          join(import.meta.dir, `../../listings/cornerstone/skills/${skill}/manifest.json`),
          "utf8",
        ),
      );
      const hosts = manifest.tools.flatMap((t: { egress?: { binding: string; host: string }[] }) =>
        (t.egress ?? []).map((e) => e),
      );
      expect(hosts.length).toBeGreaterThan(0);
      for (const e of hosts) {
        expect(e.binding).toBe("csod");
        expect(e.host).toBe("{subdomain}.csod.com");
      }
    }
  });
});
