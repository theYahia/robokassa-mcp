#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createInvoiceSchema, handleCreateInvoice,
  checkInvoiceSchema, handleCheckInvoice,
} from "./tools/invoices.js";

const server = new McpServer({
  name: "robokassa-mcp",
  version: "1.1.0",
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
  const httpPort = process.env.HTTP_PORT || (process.argv.includes("--http") ? process.argv[process.argv.indexOf("--http") + 1] : null);
  if (httpPort) {
    const port = parseInt(String(httpPort), 10) || 3000;
    await startHttpTransport(port);
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[robokassa-mcp] Сервер запущен (stdio). 2 инструмента.");
  }
}

async function startHttpTransport(port: number) {
  const { createServer } = await import("node:http");
  const { StreamableHTTPServerTransport } = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined as unknown as (() => string) });
  const httpServer = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", tools: 2, transport: "streamable-http" }));
      return;
    }
    if (req.url === "/mcp") { await transport.handleRequest(req, res); return; }
    res.writeHead(404); res.end("Not found. Use /mcp or /health.");
  });
  await server.connect(transport);
  httpServer.listen(port, () => {
    console.error(`[robokassa-mcp] HTTP server on port ${port}. 2 tools available.`);
  });
}

const isDirectRun = process.argv[1]?.endsWith("index.js") || process.argv[1]?.endsWith("index.ts");
if (isDirectRun) {
  main().catch((error) => { console.error("[robokassa-mcp] Ошибка запуска:", error); process.exit(1); });
}

export { server };
