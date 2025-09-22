# 🧰 Essentials MCP – README

Essentials MCP enables AI agents and assistants to interact with Composable Commerce through standardized function-calling. Agents can retrieve product information, manage carts & orders, handle customer data, and execute other commerce workflows. Both read-only and full CRUD operations are supported depending on configuration.  

Official docs: https://docs.commercetools.com/sdk/commerce-mcp/essentials-mcp
---

## ⚙️ Key Concepts

- **Tools**: Predefined operations (e.g. `products.read`, `cart.create`) that the MCP server can expose.  
- **Authentication Types**:
  - `client_credentials`: uses client ID + secret to get an access token.
  - `auth_token`: uses an existing access token directly.
- **Transport Modes**:
  - Local STDIO (for CLI / local agent workflows) 
  - HTTP / Remote mode (streamable HTTP server)

---

## 🛠️ Setup & Installation

Replace placeholders (`PROJECT_KEY`, `CLIENT_ID`, etc.) with your actual credentials.

```bash
# Full toolset via client_credentials (default mode)
npx -y @commercetools/mcp-essentials \
  --tools=all \
  --isAdmin=true \
  --authType=client_credentials \
  --clientId=YOUR_CLIENT_ID \
  --clientSecret=YOUR_CLIENT_SECRET \
  --projectKey=YOUR_PROJECT_KEY \
  --authUrl=YOUR_AUTH_URL \
  --apiUrl=YOUR_API_URL
```

```bash
# Read only toolset via client_credentials (default mode)
npx -y @commercetools/mcp-essentials \
  --tools=all.read \
  --isAdmin=true \
  --authType=client_credentials \
  --clientId=YOUR_CLIENT_ID \
  --clientSecret=YOUR_CLIENT_SECRET \
  --projectKey=YOUR_PROJECT_KEY \
  --authUrl=YOUR_AUTH_URL \
  --apiUrl=YOUR_API_URL
```

```bash
# Non admin read only toolset via client_credentials (default mode)
npx -y @commercetools/mcp-essentials \
  --tools=all \
  --isAdmin=false \
  --authType=client_credentials \
  --clientId=YOUR_CLIENT_ID \
  --clientSecret=YOUR_CLIENT_SECRET \
  --projectKey=YOUR_PROJECT_KEY \
  --authUrl=YOUR_AUTH_URL \
  --apiUrl=YOUR_API_URL
```

```bash
# Fine grained tool definition
npx -y @commercetools/mcp-essentials \
  --tools=products.create, products.update, products.read \
  --isAdmin=true \
  --authType=client_credentials \
  --clientId=YOUR_CLIENT_ID \
  --clientSecret=YOUR_CLIENT_SECRET \
  --projectKey=YOUR_PROJECT_KEY \
  --authUrl=YOUR_AUTH_URL \
  --apiUrl=YOUR_API_URL
```

## 🛠️ Tool list

Refer to https://docs.commercetools.com/sdk/commerce-mcp/essentials-mcp#available-tools