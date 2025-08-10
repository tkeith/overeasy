import { experimental_createMCPClient } from "ai";
import { env } from "~/server/env";

/**
 * Firecrawl MCP client for web scraping and content extraction
 * Uses the hosted MCP server with SSE transport
 */
export const createFirecrawlMcp = () => {
  return experimental_createMCPClient({
    transport: {
      type: "sse",
      // Hosted MCP server using the Firecrawl API key
      url: `https://mcp.firecrawl.dev/${env.FIRECRAWL_API_KEY}/sse`,
    },
  });
};

/**
 * Helper to get Firecrawl tools and ensure client cleanup
 */
export const getFirecrawlTools = async () => {
  const client = await createFirecrawlMcp();
  const tools = await client.tools();

  return {
    tools,
    cleanup: async () => await client.close(),
  };
};
