## Minimal integration (AI SDK + Firecrawl MCP)

1. **Connect MCP (SSE)**

```ts
// lib/mcp-firecrawl.ts
import { experimental_createMCPClient } from "ai";

export const firecrawlMcp = experimental_createMCPClient({
  transport: {
    type: "sse",
    // hosted MCP server; or run your own (see docs)
    url: `https://mcp.firecrawl.dev/${process.env.FIRECRAWL_API_KEY}/sse`,
  },
});
```

2. **Expose tools to your agent**

```ts
// app/api/chat/route.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { firecrawlMcp } from "@/lib/mcp-firecrawl";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const tools = await firecrawlMcp.tools();

  const result = await streamText({
    model: openai("gpt-4.5-mini"), // any model
    tools, // ← Firecrawl tools now available
    messages,
  });

  await firecrawlMcp.close();
  return result.toDataStreamResponse();
}
```

That’s using the **AI SDK’s MCP client** (`experimental_createMCPClient`) to inject MCP tools straight into `streamText`/`generateText`. ([AI SDK][5])

Your model can now call e.g.:

```json
{
  "tool": "firecrawl_scrape",
  "arguments": {
    "url": "https://example.com",
    "formats": ["markdown", "html", "screenshot@fullPage"],
    "onlyMainContent": true,
    "waitFor": 2000
  }
}
```

(Those arguments mirror Firecrawl MCP’s tool schema.) ([Firecrawl][2])
