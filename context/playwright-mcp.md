you can run Playwright MCP **fully inside your Node.js app** with no extra services. Easiest is to spawn it as a child process (STDIO) and connect with the Vercel AI SDK’s MCP client. If you prefer, you can also run it as a tiny local HTTP/SSE server or even embed it programmatically.

You can embed the server inside your Node HTTP server:

```ts
import http from "http";
import { createConnection } from "@playwright/mcp";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

http.createServer(async (req, res) => {
  const connection = await createConnection({
    browser: { launchOptions: { headless: true } },
  });
  const transport = new SSEServerTransport("/messages", res);
  await connection.sever.connect(transport);
});
```

Wiring into Vercel AI SDK

Once you have `client.tools()`, pass the tools straight into `generateText`/`streamText`. The SDK docs include examples for both **STDIO** and **SSE** transports. ([AI SDK][1])

> Bottom line: running Playwright MCP locally is lightweight. You can keep it entirely inside your Node.js app (spawned via STDIO), or run a local SSE server if you want a long-lived browser you can share across processes. No extra “bunch of tooling” required.

[1]: https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client "AI SDK Core: experimental_createMCPClient"
[2]: https://github.com/microsoft/playwright-mcp "GitHub - microsoft/playwright-mcp: Playwright MCP server"
