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
    const { text } = await generateText({
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

          Use the firecrawl_scrape tool to get the content, then process it and provide both the cleaned content and a summary following the XML format specified in your instructions.`,
        },
      ],
    });

    // Parse content and summary from XML tags in the response
    let content: string | null = null;
    let summary: string | null = null;

    // Extract content between <content> tags
    const contentMatch = text.match(/<content>\s*([\s\S]*?)\s*<\/content>/);
    if (contentMatch && contentMatch[1]) {
      content = contentMatch[1].trim();
    }

    // Extract summary between <summary> tags
    const summaryMatch = text.match(/<summary>\s*([\s\S]*?)\s*<\/summary>/);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }

    // Validate that we got both content and summary
    if (!content || !summary) {
      throw new Error(
        "Failed to extract content and summary from AI response. Response may not be in the expected XML format.",
      );
    }

    // Update the learning with extracted data
    await db.learning.update({
      where: { id: learningId },
      data: {
        summary,
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
