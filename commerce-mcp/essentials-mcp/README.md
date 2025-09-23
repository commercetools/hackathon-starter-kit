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

---

## 💬 Sample Chat Application

This repository includes a complete sample Next.js application (`sample-app/`) that demonstrates how to integrate the Essentials MCP with an AI chat interface. The app provides a professional commerce assistant that can handle customer inquiries, product searches, order management, and more.

### Features

- **🎨 Modern UI**: Beautiful chat interface with responsive design and dark mode support
- **📝 Rich Formatting**: AI responses support markdown formatting with proper typography
- **🛒 Commerce Tools**: Full integration with commercetools via MCP
- **⚡ Real-time**: Streaming responses for better user experience
- **🎯 Smart Assistant**: Professional AI assistant trained for commerce scenarios

### Quick Start

1. **Install Dependencies**
   ```bash
   cd sample-app
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start MCP Server** (in a separate terminal)
   ```bash
   # Run the MCP server on port 8080
   npx -y @commercetools/mcp-essentials \
     --tools=all \
     --isAdmin=true \
     --authType=client_credentials \
     --clientId=YOUR_CLIENT_ID \
     --clientSecret=YOUR_CLIENT_SECRET \
     --projectKey=YOUR_PROJECT_KEY \
     --authUrl=YOUR_AUTH_URL \
     --apiUrl=YOUR_API_URL \
     --port=8080
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Visit [http://localhost:3000](http://localhost:3000) to start chatting with your commerce assistant!

### Configuration

#### Environment Variables

Create a `.env` file in the `sample-app` directory:

```env
# Required: OpenAI API Key for the AI assistant
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Customize MCP server endpoint (default: http://localhost:8080/mcp/)
MCP_SERVER_URL=http://localhost:8080/mcp/
```

#### MCP Server Setup

The sample app expects an MCP server running on `http://localhost:8080/mcp/`. You can customize this by:

1. **Using different tools**: Adjust the `--tools` parameter when starting the MCP server
2. **Changing permissions**: Use `--isAdmin=false` for read-only operations
3. **Custom port**: Use `--port=XXXX` and update `MCP_SERVER_URL` in `.env`

#### Example MCP Configurations

**Fine grained tools**:
```bash
npx -y @commercetools/mcp-essentials \
  --tools=order.read,products.read,category.read,cart.create,order.create,order.update,cart.update,cart.read,products.update,products.create,category.create,category.update,customer.create,customer.update,customer.read \
  --isAdmin=true \
  --authType=client_credentials \
  --clientId=YOUR_CLIENT_ID \
  --clientSecret=YOUR_CLIENT_SECRET \
  --projectKey=YOUR_PROJECT_KEY \
  --authUrl=YOUR_AUTH_URL \
  --apiUrl=YOUR_API_URL \
  --remote=true \
  --stateless=true \
  --port=8080
```


### Architecture

The sample app consists of:

- **Frontend** (`app/page.tsx`): React chat interface with real-time streaming
- **API Route** (`app/api/chat/route.ts`): Next.js API route that connects to MCP server
- **MCP Integration**: Uses `@modelcontextprotocol/sdk` for tool communication
- **AI Processing**: OpenAI GPT-4 with custom commerce-focused prompts

### Customization

#### Modifying the AI Assistant

Edit `app/api/chat/route.ts` to customize:
- **System prompts**: Change the assistant's personality and instructions
- **Model selection**: Switch between different OpenAI models
- **Tool filtering**: Control which MCP tools are available
- **Response formatting**: Adjust how responses are structured

#### Styling the Interface

The app uses Tailwind CSS with:
- **Responsive design**: Mobile-first approach
- **Dark mode**: Automatic theme switching
- **Typography**: Professional formatting with `@tailwindcss/typography`
- **Components**: Reusable UI components for chat bubbles, forms, etc.


### Deployments

For production deployment:

1. **Secure your environment variables**
2. **Use read-only MCP configuration** when possible
3. **Implement rate limiting** for the chat API
4. **Add authentication** to protect the chat interface
5. **Monitor API usage** for both OpenAI and commercetools

### Example Interactions

Try these sample queries with your commerce assistant:

- "Show me the latest products in our catalog"
- "Find customers from Germany"
- "What's the status of order #12345?"
- "Create a new customer account"
- "Add product ABC123 to a new cart"
- "Update inventory for product XYZ789"

The assistant will use the appropriate MCP tools to fetch real data from your commercetools project and provide properly formatted responses.