import { anthropic, type AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { readFile } from "fs/promises";
import { join } from "path";
import { getFirecrawlTools } from "~/server/ai/mcp/firecrawl";
import { db } from "~/server/db";

/**
 * Extract learnings from a URL using AI and Firecrawl
 */
export async function extractLearningsFromUrl(
  url: string,
  learningId: string,
): Promise<void> {
  // Update status to processing
  await db.learning.update({
    where: { id: learningId },
    data: { status: "PROCESSING" },
  });

  const { tools, cleanup } = await getFirecrawlTools();

  try {
    // Read the prompt from markdown file
    const promptPath = join(
      process.cwd(),
      "src/server/ai/prompts/learning-extractor.md",
    );
    const systemPrompt = await readFile(promptPath, "utf-8");

    // Generate AI response with Firecrawl tools
    const { text, steps } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      tools,
      maxSteps: 20, // Allow up to 20 tool calls
      providerOptions: {
        anthropic: {
          thinking: { type: "enabled", budgetTokens: 15000 },
        } satisfies AnthropicProviderOptions,
      },
      headers: {
        "anthropic-beta": "interleaved-thinking-2025-05-14",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Extract learnings from this URL: ${url}

          Use the firecrawl_scrape tool to get the content, then analyze it and provide a summary.`,
        },
      ],
    });

    // Get raw content from Firecrawl tool results
    let content: string | null = null;
    for (const step of steps) {
      if (step.toolResults && step.toolResults.length > 0) {
        for (const result of step.toolResults) {
          // Look for Firecrawl scrape results
          if (result.toolName === "firecrawl_scrape" && result.result) {
            // Extract markdown content if available
            const firecrawlResult = result.result as unknown as Record<
              string,
              unknown
            >;
            if (typeof firecrawlResult.markdown === "string") {
              content = firecrawlResult.markdown;
            } else if (typeof firecrawlResult.text === "string") {
              content = firecrawlResult.text;
            } else {
              content = JSON.stringify(result.result);
            }
            break;
          }
        }
      }
    }

    // Update the learning with extracted data
    await db.learning.update({
      where: { id: learningId },
      data: {
        summary: text,
        content,
        status: "COMPLETED",
        processedAt: new Date(),
      },
    });
  } catch (error) {
    // Update learning with error status
    console.error(
      `[Learning Extractor] Failed to process learning ${learningId}:`,
      error,
    );
    await db.learning.update({
      where: { id: learningId },
      data: {
        status: "FAILED",
      },
    });
  } finally {
    // Always cleanup the MCP client
    await cleanup();
  }
}
