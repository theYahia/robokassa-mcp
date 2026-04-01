# @theyahia/robokassa-mcp

MCP server for **Robokassa** payment API. 2 tools for invoice creation (with MD5 signature) and status checking.

[![npm](https://img.shields.io/npm/v/@theyahia/robokassa-mcp)](https://www.npmjs.com/package/@theyahia/robokassa-mcp)
[![license](https://img.shields.io/npm/l/@theyahia/robokassa-mcp)](./LICENSE)

## Quick Start

### Claude Desktop

```json
{
  "mcpServers": {
    "robokassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/robokassa-mcp"],
      "env": {
        "ROBOKASSA_LOGIN": "your-login",
        "ROBOKASSA_PASSWORD1": "your-password1",
        "ROBOKASSA_PASSWORD2": "your-password2"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add robokassa -e ROBOKASSA_LOGIN=login -e ROBOKASSA_PASSWORD1=pass1 -e ROBOKASSA_PASSWORD2=pass2 -- npx -y @theyahia/robokassa-mcp
```

### Cursor / Windsurf

```json
{
  "robokassa": {
    "command": "npx",
    "args": ["-y", "@theyahia/robokassa-mcp"],
    "env": {
      "ROBOKASSA_LOGIN": "your-login",
      "ROBOKASSA_PASSWORD1": "your-password1",
      "ROBOKASSA_PASSWORD2": "your-password2"
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `create_invoice` | Create payment URL with MD5 signature, optional 54-FZ receipt |
| `check_invoice` | Check invoice status via OpStateExt XML interface |

## Auth

| Variable | Required | Description |
|----------|----------|-------------|
| `ROBOKASSA_LOGIN` | Yes | Merchant login |
| `ROBOKASSA_PASSWORD1` | Yes | Password 1 (for payment signature) |
| `ROBOKASSA_PASSWORD2` | Yes | Password 2 (for status check signature) |
| `ROBOKASSA_TEST` | No | Set to "true" for test mode |

## HTTP Transport

```bash
HTTP_PORT=3000 npx @theyahia/robokassa-mcp
# or
npx @theyahia/robokassa-mcp --http 3000
```

Endpoints: `POST /mcp` (JSON-RPC), `GET /health` (status).

## Skills

- **skill-create-invoice** -- create a Robokassa payment URL with MD5 signature
- **skill-check-payment** -- check invoice status via OpStateExt

## License

MIT
