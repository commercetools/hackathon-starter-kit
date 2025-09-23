# EcomHack.AI: commercetools Hackathon Starter Kit

A comprehensive starter kit for building modern commerce applications using commercetools' suite of products and APIs. This kit provides multiple pathways to integrate with commercetools, from traditional SDK usage to cutting-edge AI-powered Model Context Protocol (MCP) integrations.

## 🛠 Available Implementations

### 📦 **Composable Commerce SDK**
Traditional commercetools integration using TypeScript SDK
- **Location**: `composable-commerce/`
- **Best for**: Direct API integration, custom commerce applications
- **Features**: Full SDK access, type safety, complete control over API calls

### 🤖 **Commerce MCP (Model Context Protocol)**
AI-native integrations for modern LLM applications

#### **Developer MCP**
- **Location**: `commerce-mcp/developer-mcp/`
- **Best for**: Faster commerce development
- **Features**: MCP server ready to be integrated in IDE

#### **Essentials MCP** ⭐ *Recommended for Hackathons*
- **Location**: `commerce-mcp/essentials-mcp/`
- **Best for**: Rapid AI-powered commerce prototypes, chatbots, AI assistants
- **Features**:
  - Pre-built MCP server with 60+ commerce tools
  - **Sample Chat Application** - Complete Next.js AI assistant
  - One-command setup and deployment
  - OpenAI GPT integration ready
  - Professional UI with streaming responses

## 🚀 Quick Start

### For AI/LLM Applications (Recommended)
```bash
git clone https://github.com/commercetools/hackathon-starter-kit.git
cd commerce-mcp/essentials-mcp
# See README for setup instructions
```

### For Traditional SDK Development
```bash
git clone https://github.com/commercetools/hackathon-starter-kit.git
cd composable-commerce
npm install
```

## 💡 Sample Implementations & Use Cases

### 🎯 **AI-Powered Commerce Assistant** (Essentials MCP)
Complete chat application demonstrating:
- **Customer Service**: Answer product questions, order status inquiries
- **Product Discovery**: AI-powered product search and recommendations
- **Order Management**: Create, update, and track orders through conversation
- **Inventory Management**: Real-time stock checking and updates
- **Multi-language Support**: Global commerce with AI translation

**Demo**: `commerce-mcp/essentials-mcp/sample-app/`

### 🛒 **E-commerce Applications** (Composable Commerce)
Traditional web applications with:
- Product catalog browsing
- Shopping cart functionality
- Order processing workflows
- Customer account management

**Examples**: `composable-commerce/src/examples/`

### 🔧 **commercetools Development Support** (Developer MCP)
Integrate commercetools docs MCP in IDE for:
- Faster implementation of commerce solutions 
- Increase commercetools offerings awareness
- Learn about commercetools products specifications

**Framework**: `commerce-mcp/developer-mcp/`

## 🔑 Project Setup

### 1. Create commercetools Account
1. Visit [commercetools Merchant Center](https://mc.europe-west1.gcp.commercetools.com/login/new)
2. Create a new account and organization
3. No credit card required

### 2. Create New Project
1. Login to Merchant Center
2. Click "Create New Project"
3. Important settings:
   - Mark as "used during ecomhack"
   - Project key format: `ecomhack25-team<XX>` (e.g., ecomhack25-team17)
   - Select "Create project with sample data"

### 3. Get API Credentials
1. Navigate to: Settings > Developer settings
2. Click "Create new API client"
3. Configure client:
   - Name: `team<XX>-app`
   - Template: Select "Admin Client"
4. Save credentials immediately after creation

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
- Project key must start with `ecomhack25-`

## 🛠 Prerequisites

- Node.js v16 or higher
- npm or yarn
- commercetools account with:
  - API Client credentials
  - Project setup
  - Required scopes configured

## 🔧 Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_SCOPE=your-scopes
```

## 🚀 Getting Started Guides

### **Essentials MCP** (AI Commerce Assistant)
```bash
cd commerce-mcp/essentials-mcp
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm run dev
```
**Full guide**: [commerce-mcp/essentials-mcp/README.md](commerce-mcp/essentials-mcp/README.md)

### **Composable Commerce** (Traditional SDK)
```bash
cd composable-commerce
npm install
cp .env.example .env
# Add your commercetools credentials to .env
npm run examples
```
**Full guide**: [composable-commerce/README.md](composable-commerce/README.md)

### **Developer MCP** (Custom AI Tools)
```bash
cd commerce-mcp/developer-mcp
# Follow setup instructions for custom MCP development
```
**Full guide**: [commerce-mcp/developer-mcp/README.md](commerce-mcp/developer-mcp/README.md)

## 🆘 Support & Resources

### **Documentation**
- [Commercetools Platform Documentation](https://docs.commercetools.com)
- [Commerce MCP Documentation](https://docs.commercetools.com/sdk/commerce-mcp)
- [API Reference](https://docs.commercetools.com/api)

### **Community**
- [Community Forum](https://community.commercetools.com)
- [Support](https://support.commercetools.com)
- [GitHub Issues](https://github.com/commercetools/hackathon-starter-kit/issues)

### **AI & MCP Resources**
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

## ✨ Acknowledgments

- commercetools Team
- EcomHack.AI Community
- All open source contributors