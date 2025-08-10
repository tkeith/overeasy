import { experimental_createMCPClient } from "ai";
import { env } from "~/server/env";

/**
 * Firecrawl MCP client for web scraping and content extraction
 * Uses the hosted MCP server with SSE transport
 */
export const createFirecrawlMcp = () => {
  const url = `https://mcp.firecrawl.dev/${env.FIRECRAWL_API_KEY}/sse`;
  console.log(
    `[Firecrawl MCP] Creating client with URL: https://mcp.firecrawl.dev/[API_KEY]/sse`,
  );

  return experimental_createMCPClient({
    transport: {
      type: "sse",
      // Hosted MCP server using the Firecrawl API key
      url,
    },
  });
};

/**
 * Helper to get Firecrawl tools and ensure client cleanup
 */
export const getFirecrawlTools = async () => {
  console.log(`[Firecrawl MCP] Creating MCP client...`);
  const client = await createFirecrawlMcp();
  console.log(`[Firecrawl MCP] MCP client created, getting tools...`);
  const tools = await client.tools();
  console.log(`[Firecrawl MCP] Tools obtained:`, Object.keys(tools));

  return {
    tools,
    cleanup: async () => {
      console.log(`[Firecrawl MCP] Closing MCP client...`);
      await client.close();
      console.log(`[Firecrawl MCP] MCP client closed`);
    },
  };
};
