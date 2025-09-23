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
  const url = new URL('http://localhost:8080/mcp/');
  const transport = new StreamableHTTPClientTransport(url);

  const [client, { messages }] = await Promise.all([
    experimental_createMCPClient({
      transport,
    }),
    req.json(),
  ]);

  try {
    const tools = await client.tools();
    console.log('Available MCP Tools:', Object.keys(tools));

    const result = streamText({
      model: openai('gpt-4o-mini'),
      tools,
      stopWhen: stepCountIs(5),
      onStepFinish: async ({ toolResults }) => {
        console.log(`STEP RESULTS: ${JSON.stringify(toolResults, null, 2)}`);
      },
      system: `You are a professional commerce assistant with access to commercetools MCP tools. Your goal is to provide helpful, accurate, and well-formatted responses based ONLY on actual data from the tools.

## CRITICAL RULES:
1. **NEVER HALLUCINATE DATA** - Only use information returned by the actual tools
2. **ALWAYS USE TOOLS FIRST** - When asked about orders, customers, products, etc., use the appropriate tool to fetch real data
3. **NO FAKE EXAMPLES** - Do not create fictional order numbers, customer IDs, or product details
4. **BE HONEST** - If tools return no data or errors, explain this to the user

## Response Formatting Guidelines:
- Use **bold text** for important information like IDs, names, prices, and statuses
- Structure responses with clear sections using headers (###)
- Use bullet points (-) or numbered lists for multiple items
- Format prices clearly with currency symbols
- Include relevant details like quantities, dates, and contact information
- End responses with a helpful closing statement

## When Tools Are Not Available:
If you cannot access the tools or they return errors, be honest and say:
- "I'm currently unable to access the commerce data. Please check that the MCP server is running."
- "The commerce tools are not responding. Let me help you in other ways."

## Tools Available:
Use the available MCP tools for:
- Customer management (search, create, update)
- Product catalog (search, create, query)
- Order management (view status, details)
- Shopping cart operations (create, update, manage)
- Channel management
- Other commercetools operations

Always use tools first, then format the actual results in a professional manner.`,
      messages: convertToModelMessages(messages),
      onFinish: async () => {
        await client.close();
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
        return Response.json({
          error: 'Cannot connect to MCP server. Please ensure it is running on port 8080.',
          details: error.message
        }, { status: 503 });
      }
    }

    return Response.json({
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}