import { anthropic, type AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { readFile } from "fs/promises";
import { join } from "path";
import { firecrawlTools } from "~/server/ai/tools/firecrawl";
import { db } from "~/server/db";
import { ExecutionTracker } from "~/server/ai/utils/execution-tracker";

/**
 * Extract learnings from a URL using AI and Firecrawl
 */
export async function extractLearningsFromUrl(
  url: string,
  learningId: string,
): Promise<void> {
  console.log(
    `[Learning Extractor] Starting extraction for learning ${learningId}`,
  );
  console.log(`[Learning Extractor] URL: ${url}`);

  const tracker = new ExecutionTracker();

  try {
    // Start execution tracking
    console.log(`[Learning Extractor] Creating agent execution record...`);
    const executionId = await tracker.startExecution("learning-extractor", {
      url,
      learningId,
    });
    console.log(`[Learning Extractor] Agent execution created: ${executionId}`);

    // Update learning with execution ID and status
    console.log(
      `[Learning Extractor] Updating learning status to PROCESSING...`,
    );
    await db.learning.update({
      where: { id: learningId },
      data: {
        status: "PROCESSING",
        agentExecutionId: executionId,
      },
    });
    console.log(`[Learning Extractor] Learning status updated`);

    console.log(`[Learning Extractor] Using direct Firecrawl API tools`);
    const tools = firecrawlTools;
    console.log(
      `[Learning Extractor] Tools ready: ${Object.keys(tools).join(", ")}`,
    );

    try {
      // Read the prompt from markdown file
      const promptPath = join(
        process.cwd(),
        "src/server/ai/prompts/learning-extractor.md",
      );
      console.log(`[Learning Extractor] Reading prompt from ${promptPath}`);
      const systemPrompt = await readFile(promptPath, "utf-8");
      console.log(
        `[Learning Extractor] Prompt loaded, length: ${systemPrompt.length} chars`,
      );

      // Generate AI response with Firecrawl tools and track in real-time
      console.log(`[Learning Extractor] Starting LLM request to Claude...`);
      console.log(
        `[Learning Extractor] Tools available: ${Object.keys(tools).join(", ")}`,
      );

      console.log(`[Learning Extractor] Calling generateText now...`);
      const result = await generateText({
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
        // Real-time tracking callback - fires as each step completes
        onStepFinish: async (step) => {
          console.log(`[Learning Extractor] Step finished callback fired`);
          console.log(
            `[Learning Extractor] Step type: ${step.stepType || "unknown"}`,
          );

          // Track reasoning FIRST (if available) - it logically comes before the response
          if ("reasoning" in step && step.reasoning) {
            console.log(`[Learning Extractor] Adding reasoning block`);
            await tracker.addReasoning(String(step.reasoning));
            console.log(
              `[Learning Extractor] Reasoning block added to database`,
            );
          }

          // Track text content AFTER reasoning
          if (step.text) {
            console.log(
              `[Learning Extractor] Adding text block, length: ${step.text.length} chars`,
            );
            await tracker.addText(step.text);
            console.log(`[Learning Extractor] Text block added to database`);
          }

          // Track tool calls
          if (step.toolCalls && step.toolCalls.length > 0) {
            console.log(
              `[Learning Extractor] Found ${step.toolCalls.length} tool call(s)`,
            );
            for (const toolCall of step.toolCalls) {
              console.log(
                `[Learning Extractor] Adding tool call: ${toolCall.toolName}`,
              );
              await tracker.addToolCall(
                toolCall.toolName,
                toolCall.args,
                toolCall.toolCallId,
              );
              console.log(`[Learning Extractor] Tool call added to database`);
            }
          }

          // Track tool results
          if (step.toolResults && step.toolResults.length > 0) {
            console.log(
              `[Learning Extractor] Found ${step.toolResults.length} tool result(s)`,
            );
            for (const toolResult of step.toolResults) {
              console.log(
                `[Learning Extractor] Adding tool result: ${toolResult.toolName}`,
              );
              await tracker.addToolResult(
                toolResult.toolName,
                toolResult.result,
                toolResult.toolCallId,
              );
              console.log(`[Learning Extractor] Tool result added to database`);
            }
          }
        },
      });

      console.log(`[Learning Extractor] LLM request completed`);
      const { text } = result;
      console.log(
        `[Learning Extractor] Response text length: ${text.length} chars`,
      );

      // Parse content and summary from XML tags in the response
      console.log(`[Learning Extractor] Parsing XML response...`);
      let content: string | null = null;
      let summary: string | null = null;

      // Extract content between <content> tags
      const contentMatch = text.match(/<content>\s*([\s\S]*?)\s*<\/content>/);
      if (contentMatch && contentMatch[1]) {
        content = contentMatch[1].trim();
        console.log(
          `[Learning Extractor] Extracted content, length: ${content.length} chars`,
        );
      } else {
        console.log(
          `[Learning Extractor] WARNING: No content tags found in response`,
        );
      }

      // Extract summary between <summary> tags
      const summaryMatch = text.match(/<summary>\s*([\s\S]*?)\s*<\/summary>/);
      if (summaryMatch && summaryMatch[1]) {
        summary = summaryMatch[1].trim();
        console.log(
          `[Learning Extractor] Extracted summary, length: ${summary.length} chars`,
        );
      } else {
        console.log(
          `[Learning Extractor] WARNING: No summary tags found in response`,
        );
      }

      // Validate that we got both content and summary
      if (!content || !summary) {
        console.log(`[Learning Extractor] ERROR: Missing content or summary`);
        console.log(
          `[Learning Extractor] Full response text: ${text.substring(0, 500)}...`,
        );
        throw new Error(
          "Failed to extract content and summary from AI response. Response may not be in the expected XML format.",
        );
      }

      // Update the learning with extracted data
      console.log(
        `[Learning Extractor] Updating learning with extracted data...`,
      );
      await db.learning.update({
        where: { id: learningId },
        data: {
          summary,
          content,
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });
      console.log(`[Learning Extractor] Learning updated successfully`);

      // Mark execution as successful
      console.log(`[Learning Extractor] Marking execution as completed...`);
      await tracker.completeExecution();
      console.log(`[Learning Extractor] Execution marked as completed`);
    } catch (error) {
      // Track and handle inner errors
      console.log(`[Learning Extractor] ERROR occurred during processing`);
      console.error(`[Learning Extractor] Error details:`, error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.log(`[Learning Extractor] Marking execution as failed...`);
      await tracker.failExecution(errorMessage);
      console.log(`[Learning Extractor] Execution marked as failed`);

      // Update learning with error status
      console.log(`[Learning Extractor] Updating learning status to FAILED...`);
      await db.learning.update({
        where: { id: learningId },
        data: {
          status: "FAILED",
        },
      });
      console.log(`[Learning Extractor] Learning status updated to FAILED`);

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Handle any errors that occurred before MCP client creation
    console.log(`[Learning Extractor] OUTER ERROR occurred`);
    console.error(`[Learning Extractor] Outer error details:`, error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (tracker.getExecutionId()) {
      console.log(
        `[Learning Extractor] Marking execution as failed (outer catch)...`,
      );
      await tracker.failExecution(errorMessage);
      console.log(
        `[Learning Extractor] Execution marked as failed (outer catch)`,
      );
    } else {
      console.log(`[Learning Extractor] No execution ID to mark as failed`);
    }

    // Ensure learning status is updated to FAILED
    console.log(
      `[Learning Extractor] Updating learning status to FAILED (outer catch)...`,
    );
    await db.learning.update({
      where: { id: learningId },
      data: {
        status: "FAILED",
      },
    });
    console.log(
      `[Learning Extractor] Learning status updated to FAILED (outer catch)`,
    );

    console.error(
      `[Learning Extractor] Final: Failed to process learning ${learningId}:`,
      error,
    );
  }

  console.log(
    `[Learning Extractor] Process completed for learning ${learningId}`,
  );
}
