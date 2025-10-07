# EcomHack.AI: commercetools Hackathon Starter Kit

A comprehensive starter kit for building modern commerce applications using commercetools' suite of products and APIs. This kit provides multiple pathways to integrate with commercetools, from traditional SDK usage to cutting-edge AI-powered Model Context Protocol (MCP) integrations.

## 🔑 Project Setup

### 1. Create or use existing commercetools account

> If you do not have a commercetools account follow the following instructions
 
1. Visit [commercetools Merchant Center](https://mc.europe-west1.gcp.commercetools.com/login/new)
2. Create a new account and organization - no credit card required
3. Enter your E-Mail and follow the instruction in the E-Mail sent
4. The project creation flow shows
   - Select "Create project with sample data"
   - Choose B2B or B2C sample data based on your needs
   - Chose an organization name of your liking
   - Choose a project key (it will automatically be prefixed with `ecomhack25-`)
   - Make sure you check "I am participating in the ecomhack event with this project"

> If you have a commercetools account follow the following instructions

1. Visit [commercetools Merchant Center](https://mc.europe-west1.gcp.commercetools.com/login)
2. Login with your username and password
3. Visit the [project creation page](https://mc.europe-west1.gcp.commercetools.com/account/projects/new)
   - Select "Create project with sample data"
   - Choose B2B or B2C sample data based on your needs
   - Choose a project key (it will automatically be prefixed with `ecomhack25-`)
   - Make sure you check "I am participating in the ecomhack event with this project"

### 3. Get API Credentials
1. Visit Merchant Center with created project
2. Navigate to: Settings > Developer settings
3. Click "Create new API client"
4. Configure client:
   - Name: `team<XX>-app`
   - Template: Select "Admin Client" (Only for hackathon/testing purposes, production workloads should always use fine grained API client scopes)
5. Save credentials immediately after creation

### 4. Configure Environment
1. Copy environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
# Project Configuration
CTP_PROJECT_KEY=ecomhack25-team<XX>

# API Credentials
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret

# API Endpoints
CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com

# Scopes (Admin template provides full access)
CTP_SCOPES="manage_project:${CTP_PROJECT_KEY} view_products:${CTP_PROJECT_KEY}"
```

⚠️ **IMPORTANT NOTES:**
- Save your Client Secret immediately - it cannot be retrieved later
- Never commit `.env` file to version control
- Keep credentials secure and never share in AI prompts


## 🛠 Available guides

### 📦 **Composable Commerce SDK**
Traditional commercetools integration using TypeScript SDK
- **Location**: `composable-commerce/`
- **Best for**: Direct API integration, custom commerce applications
- **Features**: Full SDK access, type safety, complete control over API calls
- **Full guide**: [composable-commerce/README.md](composable-commerce/README.md)

### 🤖 **Commerce MCP (Model Context Protocol)**
AI-native integrations for modern LLM applications

#### **Developer MCP**
- **Location**: `commerce-mcp/developer-mcp/`
- **Best for**: Faster commerce development
- **Features**: MCP server ready to be integrated in IDE
- **Full guide**: [commerce-mcp/developer-mcp/README.md](commerce-mcp/developer-mcp/README.md)

#### **Essentials MCP**
- **Location**: `commerce-mcp/essentials-mcp/`
- **Best for**: Rapid AI-powered commerce prototypes, chatbots, AI assistants
- **Features**: MCP server offering 60+ commerce based tools 
- **Full guide**: [commerce-mcp/essentials-mcp/README.md](commerce-mcp/essentials-mcp/README.md)

### 📦 **Checkout**
commercetools Checkout integration using Browser SDK
- **Location**: `checkout/`
- **Best for**: Prebuilt checkout component including payment integrations
- **Features**: Full SDK access, type safety, complete control over API calls
- **Full guide**: [checkout/README.md](checkout/README.md)

## 🚀 Quick Start

### For AI/LLM Applications
```bash
git clone https://github.com/commercetools/hackathon-starter-kit.git
cd commerce-mcp/sample-app
# See README for setup instructions
```

### For Traditional SDK Development
```bash
git clone https://github.com/commercetools/hackathon-starter-kit.git
cd composable-commerce
npm install
```

### For precomposed Checkout
```bash
git clone https://github.com/commercetools/hackathon-starter-kit.git
cd checkout
npm run setup
# Configure .env with your credentials and Checkout Application ID
npm run build-client && npm run start-client
npm run start-server
```

## 💡 Sample Implementations & Use Cases

### 🎯 **AI-Powered Commerce Assistant** (Essentials + Developer MCP)
Complete chat application demonstrating:
- **commercetols Usage Guidance** - Built-in access to commercetools documentation and schemas
- **Customer Service**: Answer product questions, order status inquiries
- **Product Discovery**: AI-powered product search and recommendations
- **Order Management**: Create, update, and track orders through conversation
- **Inventory Management**: Real-time stock checking and updates
- **Multi-language Support**: Global commerce with AI translation
- **OpenAI Support**: OpenAI GPT integration ready

**Framework**: `commerce-mcp/sample-mcp/`

### 🛒 **E-commerce Applications** (Composable Commerce)
Traditional service layer applications with:
- Product catalog browsing
- Shopping cart functionality
- Customer account management
- Bulk import operations

**Examples**: `composable-commerce/src/examples/`

### 💳 **Checkout Integration Example** (commercetools Checkout)
Complete React e-commerce application with embedded checkout:
- **Full Shopping Experience**: Product catalog, cart management, and checkout
- **Embedded Payments**: Secure payment processing with commercetools Checkout
- **Multiple Payment Methods**: Credit cards, PayPal, and more
- **Order Completion**: Success pages and order confirmation
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Cart and checkout state management

**Framework**: `checkout/`
**Full guide**: [checkout/README.md](checkout/README.md)



## 🆘 Support & Resources

### **Documentation**
- [commercetools Documentation](https://docs.commercetools.com)
- [Commerce MCP Documentation](https://docs.commercetools.com/sdk/commerce-mcp)
- [API Reference](https://docs.commercetools.com/api)
- [Checkout Reference](https://docs.commercetools.com/checkout)

### **Community**
- [Community Forum](https://community.commercetools.com)
- [Support](https://support.commercetools.com)
- [GitHub Issues](https://github.com/commercetools/hackathon-starter-kit/issues)

### **AI & MCP Resources**
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

