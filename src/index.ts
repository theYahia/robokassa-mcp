#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createInvoiceSchema, handleCreateInvoice,
  checkInvoiceSchema, handleCheckInvoice,
} from "./tools/invoices.js";

const server = new McpServer({
  name: "robokassa-mcp",
  version: "1.0.0",
});

// Invoices
server.tool(
  "create_invoice",
  "Создать счёт Robokassa. Возвращает ссылку на оплату с MD5-подписью.",
  createInvoiceSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleCreateInvoice(params) }],
  }),
);

server.tool(
  "check_invoice",
  "Проверить статус счёта Robokassa по номеру (OpStateExt).",
  checkInvoiceSchema.shape,
  async (params) => ({
    content: [{ type: "text", text: await handleCheckInvoice(params) }],
  }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[robokassa-mcp] Сервер запущен. 2 инструмента. Первый MCP для Robokassa.");
}

main().catch((error) => {
  console.error("[robokassa-mcp] Ошибка запуска:", error);
  process.exit(1);
});
