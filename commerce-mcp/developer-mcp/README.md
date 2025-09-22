# 🛠️ Developer MCP – README

Welcome to **Developer MCP** — a public MCP server from commercetools that exposes documentation, schema content, API references and prompt/tools via a simple HTTP API.  

This makes it easy to surface commercetools docs and schemas inside editors, codegen pipelines, and AI assistants (e.g., GitHub Copilot / Copilot Agent).

👉 Official docs: [Developer MCP](https://docs.commercetools.com/sdk/commerce-mcp/developer-mcp)

Useful as a contextual knowledge source for IDEs, code generators, and LLM-based assistants when working with commercetools APIs.

---

## 📡 Key Tools & Endpoints

| Tool / Endpoint                        | What it provides                                                                 |
|----------------------------------------|---------------------------------------------------------------------------------|
| `commercetools-documentation`          | Doc snippets & how-tos returned for natural language queries.                   |
| `commercetools-graphql-schemata`       | GraphQL schema segments for specific commercetools resources (useful for codegen). |
| `commercetools-oas-schemata`           | Partial OpenAPI / OAS fragments for REST resources.                             |
| `commercetools-prompts`                | Predefined prompt templates (e.g., generate GraphQL query, add TypeScript types). |
| `/apis/rest/content/similar-content`   | Similarity search — find docs by natural language query.                        |
| `/content/by-id`                       | Fetch specific content items by id (single or batch).                           |

---

## ⚙️ Quick VSCode Setup

Create or update `.vscode/settings.json` in your workspace:

```json
{
  "commercetools-developer": {
    "type": "http",
    "url": "https://docs.commercetools.com/apis/mcp"
  }
}
```
This registers the MCP server as a documentation/schema source for MCP-aware tooling or Copilot integrations.