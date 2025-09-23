# 🤖 commercetools AI Chat Assistant

This is a Next.js application that demonstrates how to build an AI-powered commerce assistant using **commercetools MCP (Model Context Protocol)** servers. The app provides a professional chat interface where users can interact with commercetools data through natural language.

## 🏗️ Application Structure

```
├── app/
│   ├── page.tsx              # Main chat interface (React component)
│   ├── layout.tsx            # App layout and global styles
│   ├── globals.css           # Global CSS styles
│   └── api/
│       └── chat/
│           └── route.ts      # API endpoint handling MCP connections
├── .env.example              # Environment variables template
├── DUAL_MCP_SETUP.md        # Comprehensive MCP setup guide
├── MCP_CONFIG_REFERENCE.md  # Quick configuration reference
└── package.json             # Dependencies and scripts
```

### Key Components

- **Chat Interface** (`page.tsx`): Modern React chat UI with streaming responses, markdown support, and dark mode
- **API Route** (`api/chat/route.ts`): Connects to MCP servers, merges tools, and handles AI conversation flow
- **MCP Integration**: Supports both Essentials MCP (operational tools) and Developer MCP (documentation tools)

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ 
- OpenAI API key
- commercetools project (optional, for operational tools)

### 2. Installation & Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Start the application
npm run dev
```

### 3. Advanced Setup (Dual MCP)

For the full experience with both operational and documentation tools, see:

📖 **[DUAL_MCP_SETUP.md](./DUAL_MCP_SETUP.md)** - Complete setup guide

## 🛠️ MCP Configuration Options

The application supports flexible MCP server configurations:

| Mode | Description | Environment Variables |
|------|-------------|----------------------|
| **Documentation Only** | Uses public Developer MCP for API docs and schemas | `ENABLE_ESSENTIALS_MCP=false` |
| **Operations Only** | Uses local Essentials MCP for commerce operations | `ENABLE_DEVELOPER_MCP=false` |
| **Full Stack** (Default) | Uses both MCPs for complete functionality | Both enabled |

## 🎯 Features

- **🎨 Modern UI**: Responsive chat interface with dark mode support
- **📝 Rich Formatting**: AI responses with markdown rendering and syntax highlighting  
- **🛒 Commerce Tools**: Full integration with commercetools via MCP
- **⚡ Real-time**: Streaming responses for better user experience
- **🎯 Smart Assistant**: AI trained for commerce scenarios with 60+ tools
- **📚 Documentation Access**: Built-in access to commercetools documentation and schemas
- **🔧 Configurable**: Enable/disable MCP servers as needed

## 💬 Example Interactions

### Operational Queries
- "Show me all customers in the system"
- "Create a new product with price $29.99"
- "What orders were placed in the last week?"
- "Add a laptop to my shopping cart"

### Development Queries  
- "How do I create a GraphQL query for products?"
- "Show me the REST API schema for customers"
- "What fields are available on Cart objects?"
- "Give me TypeScript code examples for product creation"

## 🔧 Development

### Environment Variables

```env
# Required
OPENAI_API_KEY=your-openai-api-key

# MCP Server Control (optional)
ENABLE_ESSENTIALS_MCP=true    # Operational commerce tools
ENABLE_DEVELOPER_MCP=true     # Documentation tools

# Custom MCP URLs (optional)
ESSENTIALS_MCP_URL=http://localhost:8080/mcp/
DEVELOPER_MCP_URL=https://docs.commercetools.com/apis/mcp/
```

### Customization

- **System Prompts**: Edit `app/api/chat/route.ts` to modify AI behavior
- **UI Styling**: Uses Tailwind CSS for responsive design
- **Tool Filtering**: Configure which MCP tools are available
- **Error Handling**: Comprehensive error messages for debugging

## 📚 Learn More

### commercetools Resources
- [commercetools Documentation](https://docs.commercetools.com/)
- [Essentials MCP Documentation](https://docs.commercetools.com/sdk/commerce-mcp/essentials-mcp)
- [Developer MCP Documentation](https://docs.commercetools.com/sdk/commerce-mcp/developer-mcp)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)

### Next.js Resources

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions welcome

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🤝 Contributing

This project is part of the commercetools hackathon starter kit. Contributions and feedback are welcome!

---

**Built with** ❤️ **using commercetools MCP, Next.js, and OpenAI**
