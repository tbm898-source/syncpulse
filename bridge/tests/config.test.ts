import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("parses defaults", () => {
    const config = loadConfig({});
    expect(config.BRIDGE_PORT).toBe(9284);
    expect(config.OBS_PORT).toBe(4455);
    expect(config.corsOrigins).toContain("http://localhost:5173");
  });

  it("parses cors origins list", () => {
    const config = loadConfig({
      BRIDGE_CORS_ORIGINS: "http://a.test, http://b.test"
    });
    expect(config.corsOrigins).toEqual(["http://a.test", "http://b.test"]);
  });
});
