import { describe, it, expect, vi } from "vitest";

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

vi.mock("../src/client.js", () => ({
  RobokassaClient: class {
    md5 = vi.fn().mockReturnValue("abc123");
    generatePaymentUrl = vi.fn().mockReturnValue("https://auth.robokassa.ru/test");
    checkInvoiceStatus = vi.fn().mockResolvedValue("<xml>ok</xml>");
  },
}));

vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

describe("server smoke test", () => {
  it("registers exactly 2 tools", async () => {
    const { server } = await import("../src/index.js");
    const s = server as any;
    expect(s._registeredTools).toBeDefined();
    const toolNames = Object.keys(s._registeredTools);
    expect(toolNames.length).toBe(2);
    const expected = ["create_invoice", "check_invoice"];
    for (const n of expected) {
      expect(toolNames).toContain(n);
    }
  });
});
