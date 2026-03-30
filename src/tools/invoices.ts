import { z } from "zod";
import { RobokassaClient } from "../client.js";
import type { ReceiptItem } from "../types.js";

let client: RobokassaClient | null = null;

function getClient(): RobokassaClient {
  if (!client) {
    client = new RobokassaClient();
  }
  return client;
}

// --- create_invoice ---

export const createInvoiceSchema = z.object({
  outSum: z.number().positive().describe("Сумма платежа в рублях"),
  invId: z.number().int().min(0).describe("Номер счёта (уникальный ID заказа). 0 = автоматически"),
  description: z.string().max(100).describe("Описание заказа (до 100 символов)"),
  email: z.string().email().optional().describe("Email покупателя для чека"),
  culture: z.enum(["ru", "en"]).optional().describe("Язык интерфейса оплаты"),
  expirationDate: z.string().optional().describe("Срок жизни счёта в формате ISO 8601 (например 2025-12-31T23:59:59)"),
  items: z.array(z.object({
    name: z.string().describe("Наименование товара"),
    quantity: z.number().positive().describe("Количество"),
    sum: z.number().positive().describe("Стоимость позиции (quantity * price)"),
    tax: z.enum(["none", "vat0", "vat10", "vat110", "vat20", "vat120"]).describe("Ставка НДС"),
  })).optional().describe("Позиции чека 54-ФЗ (если нужна фискализация)"),
});

export async function handleCreateInvoice(params: z.infer<typeof createInvoiceSchema>): Promise<string> {
  const c = getClient();

  let receipt: string | undefined;
  if (params.items && params.items.length > 0) {
    const receiptObj = {
      items: params.items.map((item: ReceiptItem) => ({
        name: item.name,
        quantity: item.quantity,
        sum: item.sum,
        tax: item.tax,
      })),
    };
    receipt = encodeURIComponent(JSON.stringify(receiptObj));
  }

  const paymentUrl = c.generatePaymentUrl({
    outSum: params.outSum,
    invId: params.invId,
    description: params.description,
    email: params.email,
    culture: params.culture,
    expirationDate: params.expirationDate,
    receipt,
  });

  const result = {
    payment_url: paymentUrl,
    invId: params.invId,
    outSum: params.outSum,
    description: params.description,
    test_mode: process.env.ROBOKASSA_TEST === "true",
  };

  return JSON.stringify(result, null, 2);
}

// --- check_invoice ---

export const checkInvoiceSchema = z.object({
  invId: z.number().int().positive().describe("Номер счёта для проверки статуса"),
});

export async function handleCheckInvoice(params: z.infer<typeof checkInvoiceSchema>): Promise<string> {
  const c = getClient();
  const xmlResponse = await c.checkInvoiceStatus(params.invId);

  // Parse key fields from XML response
  const parsed = parseOpStateXml(xmlResponse);

  const result = {
    invoiceId: params.invId,
    raw_xml: xmlResponse,
    ...parsed,
  };

  return JSON.stringify(result, null, 2);
}

/** Simple XML field extractor for OpStateExt response */
function parseOpStateXml(xml: string): Record<string, string> {
  const fields: Record<string, string> = {};

  const extractTag = (tag: string): string | undefined => {
    const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
    return match?.[1];
  };

  const stateCode = extractTag("Code");
  if (stateCode !== undefined) fields.stateCode = stateCode;

  const requestDate = extractTag("RequestDate");
  if (requestDate !== undefined) fields.requestDate = requestDate;

  const resultCode = extractTag("ResultCode");
  if (resultCode !== undefined) fields.resultCode = resultCode;

  const resultDescription = extractTag("ResultDescription");
  if (resultDescription !== undefined) fields.resultDescription = resultDescription;

  const paymentMethod = extractTag("PaymentMethod");
  if (paymentMethod !== undefined) fields.paymentMethod = paymentMethod;

  const clientSum = extractTag("ClientSum");
  if (clientSum !== undefined) fields.clientSum = clientSum;

  const clientAccount = extractTag("ClientAccount");
  if (clientAccount !== undefined) fields.clientAccount = clientAccount;

  return fields;
}
