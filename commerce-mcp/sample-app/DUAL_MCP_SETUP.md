# 🔗 Dual MCP Setup Guide

This guide explains how to connect both **Essentials MCP** and **Developer MCP** in your AI chat pipeline.

## 🏗️ Architecture Overview

The application now connects to two complementary MCP servers:

### 1. **Essentials MCP** (Local)
- **URL**: `http://localhost:8080/mcp/`
- **Purpose**: Operational commerce tools
- **Tools**: Products, customers, orders, carts, channels, etc.
- **Authentication**: Requires your commercetools credentials

### 2. **Developer MCP** (Public)
- **URL**: `https://docs.commercetools.com/apis/mcp/`
- **Purpose**: Documentation and development support
- **Tools**: Documentation search, GraphQL schemas, OpenAPI specs, development prompts
- **Authentication**: Public access (no credentials needed)

## 🚀 Setup Instructions

### 1. Start the Essentials MCP Server

```bash
# In a separate terminal, start the local MCP server
npx -y @commercetools/mcp-essentials \
  --tools=all \
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

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values:
OPENAI_API_KEY=your-openai-api-key-here

# Enable/disable specific MCP servers (default: both enabled)
ENABLE_ESSENTIALS_MCP=true    # Set to false to disable operational tools
ENABLE_DEVELOPER_MCP=true     # Set to false to disable documentation tools

# Optional: Customize MCP URLs (defaults work fine)
ESSENTIALS_MCP_URL=http://localhost:8080/mcp/
DEVELOPER_MCP_URL=https://docs.commercetools.com/apis/mcp/
```

**Configuration Options:**
- **Both enabled** (default): Full functionality with operational + documentation tools
- **Essentials only**: `ENABLE_DEVELOPER_MCP=false` - Focus on commerce operations
- **Developer only**: `ENABLE_ESSENTIALS_MCP=false` - Focus on development guidance

### 3. Start the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🛠️ How It Works

The application automatically:

1. **Connects to both MCP servers** simultaneously
2. **Merges tools** from both servers into a single tool registry
3. **Routes requests** to the appropriate server based on tool usage
4. **Provides enhanced capabilities** by combining operational and documentation tools

## 🎯 Example Use Cases

### Operational Queries (Uses Essentials MCP)
- "Show me all customers"
- "Create a new product"
- "What orders were placed today?"
- "Add items to cart"

### Development Queries (Uses Developer MCP)
- "How do I create a GraphQL query for products?"
- "Show me the schema for Cart objects"
- "What's the REST API endpoint for customers?"
- "Give me example code for product creation"

### Combined Queries (Uses Both)
- "Create a product and show me the GraphQL schema for it"
- "Find customer documentation and then search for customers"
- "Explain how to update orders and show current orders"

## 🔧 Customization

### Selectively Enabling MCPs

You can run with only one MCP server by setting environment variables:

```bash
# Run with only Essentials MCP (operational tools only)
ENABLE_DEVELOPER_MCP=false

# Run with only Developer MCP (documentation tools only)  
ENABLE_ESSENTIALS_MCP=false

# Default: both enabled
ENABLE_ESSENTIALS_MCP=true
ENABLE_DEVELOPER_MCP=true
```

### Adding More Tools

Edit `app/api/chat/route.ts` to:
- Filter available tools
- Add custom tool logic
- Modify system prompts
- Add error handling

### Changing MCP Servers

Update environment variables or modify URLs directly in the code:

```typescript
const essentialsMCPURL = new URL('http://your-custom-mcp:8080/mcp/');
const developerMCPURL = new URL('https://your-custom-dev-mcp/apis/mcp/');
```

## 🚨 Troubleshooting

### Common Issues

1. **"At least one MCP server must be enabled"**
   - Both `ENABLE_ESSENTIALS_MCP` and `ENABLE_DEVELOPER_MCP` are set to `false`
   - Set at least one to `true`

2. **"Cannot connect to MCP servers"**
   - If Essentials MCP is enabled: Ensure it's running on port 8080
   - If Developer MCP is enabled: Check your internet connection  
   - Verify URLs in environment variables

3. **"Tool configuration error"**
   - Check your commercetools credentials (if using Essentials MCP)
   - Ensure proper scopes are configured
   - Verify MCP server is properly authenticated

4. **Missing tools**
   - Check console logs for tool loading status
   - Verify enabled MCP servers are responding
   - Check network connectivity for enabled servers

### Debug Mode

Enable detailed logging by adding to your `.env`:

```env
NODE_ENV=development
```

The console will show which MCPs are enabled and how many tools are loaded from each.

## 📚 Additional Resources

- [Essentials MCP Documentation](https://docs.commercetools.com/sdk/commerce-mcp/essentials-mcp)
- [Developer MCP Documentation](https://docs.commercetools.com/sdk/commerce-mcp/developer-mcp)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
