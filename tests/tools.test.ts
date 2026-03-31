import { describe, it, expect, vi } from "vitest";

vi.mock("../src/client.js", () => ({
  RobokassaClient: class {
    md5 = vi.fn().mockReturnValue("abc123");
    generatePaymentUrl = vi.fn().mockReturnValue("https://auth.robokassa.ru/test?param=1");
    checkInvoiceStatus = vi.fn().mockResolvedValue("<xml>ok</xml>");
  },
}));

import { createInvoiceSchema, checkInvoiceSchema } from "../src/tools/invoices.js";

describe("createInvoiceSchema", () => {
  it("accepts valid invoice params", () => {
    const result = createInvoiceSchema.safeParse({
      outSum: 100.50,
      invId: 1001,
      description: "Test order",
    });
    expect(result.success).toBe(true);
  });

  it("requires outSum, invId, description", () => {
    expect(createInvoiceSchema.safeParse({}).success).toBe(false);
    expect(createInvoiceSchema.safeParse({ outSum: 100 }).success).toBe(false);
    expect(createInvoiceSchema.safeParse({ outSum: 100, invId: 1 }).success).toBe(false);
  });

  it("rejects negative amounts", () => {
    expect(createInvoiceSchema.safeParse({ outSum: -10, invId: 1, description: "x" }).success).toBe(false);
  });

  it("accepts invoice with receipt items", () => {
    const result = createInvoiceSchema.safeParse({
      outSum: 500,
      invId: 1002,
      description: "With receipt",
      email: "buyer@example.com",
      items: [
        { name: "Product A", quantity: 2, sum: 500, tax: "vat20" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = createInvoiceSchema.safeParse({
      outSum: 250,
      invId: 0,
      description: "Auto ID",
      email: "test@test.com",
      culture: "en",
      expirationDate: "2025-12-31T23:59:59",
    });
    expect(result.success).toBe(true);
  });
});

describe("checkInvoiceSchema", () => {
  it("requires invId", () => {
    expect(checkInvoiceSchema.safeParse({}).success).toBe(false);
  });

  it("accepts valid invId", () => {
    expect(checkInvoiceSchema.safeParse({ invId: 1001 }).success).toBe(true);
  });

  it("rejects zero invId", () => {
    expect(checkInvoiceSchema.safeParse({ invId: 0 }).success).toBe(false);
  });

  it("rejects negative invId", () => {
    expect(checkInvoiceSchema.safeParse({ invId: -1 }).success).toBe(false);
  });
});
