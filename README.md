# EcomHack.AI: Commercetools Hackathon Starter Kit

A comprehensive starter kit for building modern commerce applications using commercetools' suite of products and APIs.

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/ecomhack-ai.git
cd ecomhack-ai
npm install
```

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

## 📚 Documentation

Detailed documentation is available in the `docs` folder:
- `architecture.md` - System design and component interaction
- `setup.md` - Step-by-step setup guide
- `api-reference.md` - API documentation and examples

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🆘 Support

Need help? Check out:
- [Commercetools Documentation](https://docs.commercetools.com)
- [API Reference](https://docs.commercetools.com/api)
- [Community Forum](https://community.commercetools.com)

## ✨ Acknowledgments

- commercetools Team
- EcomHack.AI Community
- All contributors