import { openai } from '@ai-sdk/openai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  convertToModelMessages,
  experimental_createMCPClient,
  stepCountIs,
  streamText,
} from 'ai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export async function POST(req: Request) {
  const enableEssentialsMCP = process.env.ENABLE_ESSENTIALS_MCP !== 'false';
  const enableDeveloperMCP = process.env.ENABLE_DEVELOPER_MCP !== 'false';

  const essentialsMCPURL = new URL(process.env.ESSENTIALS_MCP_URL || 'http://localhost:8080/mcp/');
  const developerMCPURL = new URL(process.env.DEVELOPER_MCP_URL || 'https://docs.commercetools.com/apis/mcp/');

  // Create promises for enabled MCP clients
  const clientPromises: Promise<unknown>[] = [];
  const clientPromiseKeys: string[] = [];
  
  if (enableEssentialsMCP) {
    const essentialsTransport = new StreamableHTTPClientTransport(essentialsMCPURL);
    clientPromises.push(experimental_createMCPClient({ transport: essentialsTransport }));
    clientPromiseKeys.push('essentials');
  }
  
  if (enableDeveloperMCP) {
    const developerTransport = new StreamableHTTPClientTransport(developerMCPURL);
    clientPromises.push(experimental_createMCPClient({ transport: developerTransport }));
    clientPromiseKeys.push('developer');
  }

  // Always get messages
  clientPromises.push(req.json());
  clientPromiseKeys.push('messages');

  if (clientPromises.length === 1) {
    throw new Error('At least one MCP server must be enabled. Check ENABLE_ESSENTIALS_MCP and ENABLE_DEVELOPER_MCP environment variables.');
  }

  const results = await Promise.all(clientPromises);
  
  // Extract clients and messages based on what was enabled
  const clients: { essentials?: { tools: () => Promise<Record<string, unknown>>; close: () => Promise<void> }; developer?: { tools: () => Promise<Record<string, unknown>>; close: () => Promise<void> } } = {};
  let messages: unknown;
  
  results.forEach((result, index) => {
    const key = clientPromiseKeys[index];
    if (key === 'messages') {
      messages = (result as { messages: unknown }).messages;
    } else {
      clients[key as keyof typeof clients] = result as typeof clients.essentials;
    }
  });

  try {
    // Get tools from enabled MCP servers
    const toolPromises: Promise<Record<string, unknown>>[] = [];
    const toolKeys: string[] = [];
    
    if (clients.essentials) {
      toolPromises.push(clients.essentials.tools());
      toolKeys.push('essentials');
    }
    
    if (clients.developer) {
      toolPromises.push(clients.developer.tools());
      toolKeys.push('developer');
    }

    const toolResults = await Promise.all(toolPromises);
    
    // Merge tools from enabled servers
    let allTools: Record<string, unknown> = {};
    toolResults.forEach((tools, index) => {
      const key = toolKeys[index];
      console.log(`Available ${key} MCP Tools:`, Object.keys(tools));
      allTools = { ...allTools, ...tools };
    });
    
    console.log('Total Combined Tools:', Object.keys(allTools).length);
    console.log('MCP Status:', {
      essentials: enableEssentialsMCP ? 'enabled' : 'disabled',
      developer: enableDeveloperMCP ? 'enabled' : 'disabled'
    });    const result = streamText({
      model: openai('gpt-4o-mini'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: allTools as any,
      stopWhen: stepCountIs(5),
      onStepFinish: async ({ toolResults }) => {
        console.log(`STEP RESULTS: ${JSON.stringify(toolResults, null, 2)}`);
      },
      system: `You are a professional commerce assistant with access to commercetools tools. Your goal is to provide helpful, accurate, and well-formatted responses based ONLY on actual data from the tools.

## CRITICAL RULES:
1. **NEVER HALLUCINATE DATA** - Only use information returned by the actual tools
2. **ALWAYS USE TOOLS FIRST** - When asked about orders, customers, products, etc., use the appropriate tool to fetch real data
3. **NO FAKE EXAMPLES** - Do not create fictional order numbers, customer IDs, or product details
4. **BE HONEST** - If tools return no data or errors, explain this to the user

## Available Tool Categories:

${enableEssentialsMCP ? `### Operational Tools (Essentials MCP):
- Customer management (search, create, update)
- Product catalog (search, create, query)
- Order management (view status, details)
- Shopping cart operations (create, update, manage)
- Channel management
- Other commercetools operations
` : ''}
${enableDeveloperMCP ? `### Documentation Tools (Developer MCP):
- commercetools-documentation: Find relevant documentation and how-tos
- commercetools-graphql-schemata: Get GraphQL schema information
- commercetools-oas-schemata: Get OpenAPI/REST schema information
- commercetools-prompts: Access development templates and examples
` : ''}
## Response Strategy:
${enableEssentialsMCP && enableDeveloperMCP ? `1. **For operational questions**: Use essentials MCP tools first to get real data
2. **For development questions**: Use developer MCP tools to provide accurate API guidance
3. **For complex scenarios**: Combine both - use documentation tools to understand the domain, then operational tools for actual data` : ''}
${enableEssentialsMCP && !enableDeveloperMCP ? `1. **Focus on operational tasks**: Use available commerce tools to perform real operations
2. **Provide data-driven responses**: Always fetch actual data before responding` : ''}
${!enableEssentialsMCP && enableDeveloperMCP ? `1. **Focus on development guidance**: Use documentation and schema tools to help with API usage
2. **Provide code examples**: Leverage prompts and documentation for implementation guidance` : ''}

## Response Formatting Guidelines:
- Use **bold text** for important information like IDs, names, prices, and statuses
- Structure responses with clear sections using headers (###)
- Use bullet points (-) or numbered lists for multiple items
- Format prices clearly with currency symbols
- Include relevant details like quantities, dates, and contact information
- End responses with a helpful closing statement

## When Tools Are Not Available:
If you cannot access the tools or they return errors, be honest and say:
- "I'm currently unable to access the commerce data. Please check that the MCP servers are running."
- "The commerce tools are not responding. Let me help you in other ways."

Always use tools first, then format the actual results in a professional manner.`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: convertToModelMessages(messages as any),
      onFinish: async () => {
        // Close all active clients
        const closePromises = [];
        if (clients.essentials) {
          closePromises.push(clients.essentials.close());
        }
        if (clients.developer) {
          closePromises.push(clients.developer.close());
        }
        await Promise.all(closePromises);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);

    // Provide more specific error messages for debugging
    if (error instanceof Error) {
      if (error.message.includes('Invalid schema for function')) {
        console.error('Tool schema validation error. Check MCP server tool definitions.');
        return Response.json({
          error: 'Tool configuration error. Please check the MCP server setup.',
          details: error.message
        }, { status: 500 });
      }

      if (error.message.includes('Failed to connect')) {
        const enabledServers = [];
        if (enableEssentialsMCP) enabledServers.push('Essentials MCP (port 8080)');
        if (enableDeveloperMCP) enabledServers.push('Developer MCP (public server)');
        
        return Response.json({
          error: `Cannot connect to one or more MCP servers. Please ensure ${enabledServers.join(' and ')} ${enabledServers.length === 1 ? 'is' : 'are'} accessible.`,
          details: error.message,
          enabledServers: {
            essentials: enableEssentialsMCP,
            developer: enableDeveloperMCP
          }
        }, { status: 503 });
      }
    }

    return Response.json({
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}