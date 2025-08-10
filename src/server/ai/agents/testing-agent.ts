import { generateText } from "ai";
import { anthropic, type AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { experimental_createMCPClient } from "ai";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "~/server/db";
import { env } from "~/server/env";
import { ExecutionTracker } from "~/server/ai/utils/execution-tracker";
import { createVmTools } from "~/server/utils/vm-agent-tools";
import { getOrCreateUserVm } from "~/server/utils/vm-manager";
import { TESTING_AGENT_CONFIG } from "~/server/ai/constants";
import type { VulnerabilitySeverity } from "@prisma/client";

interface TestingAgentOptions {
  testRunId: string;
  projectId: string;
  userId: string;
  targetUrl: string;
}

interface VulnerabilityFound {
  name: string;
  details: string;
  severity: VulnerabilitySeverity;
  category?: string;
  evidence?: Record<string, unknown>;
}

/**
 * Testing agent that analyzes applications for vulnerabilities
 */
export class TestingAgent {
  private tracker: ExecutionTracker;
  private testRunId: string;
  private projectId: string;
  private userId: string;
  private targetUrl: string;
  private vmId: string | null = null;

  constructor(options: TestingAgentOptions) {
    this.testRunId = options.testRunId;
    this.projectId = options.projectId;
    this.userId = options.userId;
    this.targetUrl = options.targetUrl;
    this.tracker = new ExecutionTracker();
  }

  /**
   * Execute the testing agent
   */
  async execute(): Promise<VulnerabilityFound[]> {
    let playwrightClient: Awaited<
      ReturnType<typeof experimental_createMCPClient>
    > | null = null;
    const vulnerabilities: VulnerabilityFound[] = [];

    try {
      // Start agent execution tracking
      const executionId = await this.tracker.startExecution("testing-agent", {
        testRunId: this.testRunId,
        projectId: this.projectId,
        targetUrl: this.targetUrl,
      });

      console.log(
        `[TestingAgent] Started execution ${executionId} for test run ${this.testRunId}`,
      );

      // Update test run with execution ID and mark as running
      await db.testRun.update({
        where: { id: this.testRunId },
        data: {
          agentExecutionId: executionId,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      // Get or create VM for the user
      await this.tracker.addText("Setting up testing environment...");
      this.vmId = await getOrCreateUserVm(this.userId);
      console.log(
        `[TestingAgent] Using VM ${this.vmId} for user ${this.userId}`,
      );

      // Get learnings for the project
      await this.tracker.addText(
        "Loading security learnings for the project...",
      );
      const learnings = await db.learning.findMany({
        where: {
          projectId: this.projectId,
          status: "COMPLETED",
        },
        select: {
          id: true,
          summary: true,
          url: true,
        },
      });

      console.log(
        `[TestingAgent] Found ${learnings.length} learnings for project ${this.projectId}`,
      );
      await this.tracker.addText(
        `Found ${learnings.length} security learnings to test against.`,
      );

      if (learnings.length === 0) {
        await this.tracker.addText(
          "No learnings found. Please add security learnings before running tests.",
        );
        await this.completeTestRun([]);
        return [];
      }

      // Create VM tools
      const vmTools = createVmTools(this.vmId);

      // Create Playwright MCP client
      console.log(`[TestingAgent] Creating Playwright MCP client...`);
      await this.tracker.addText("Initializing browser automation tools...");

      // Using STDIO transport for Playwright MCP
      const mcpConfig = {
        transport: {
          type: "stdio" as const,
          command: "npx",
          args: ["-y", "@playwright/mcp"],
          env: {
            ...process.env,
            // Ensure headless mode for server environment
            PLAYWRIGHT_HEADLESS: "true",
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      playwrightClient = await experimental_createMCPClient(mcpConfig as any);

      const playwrightTools = await playwrightClient.tools();
      console.log(
        `[TestingAgent] Playwright tools available:`,
        Object.keys(playwrightTools),
      );

      // Combine all tools
      const allTools = {
        ...vmTools,
        ...playwrightTools,
      };

      // Load the testing agent prompt
      const systemPrompt = readFileSync(
        join(process.cwd(), "src/server/ai/prompts/testing-agent.md"),
        "utf-8",
      );

      // Prepare learnings context
      const learningsContext = learnings
        .map(
          (learning, index) =>
            `## Learning ${index + 1}: ${learning.summary || "Untitled"}\n` +
            `Source: ${learning.url}\n` +
            `Summary: ${learning.summary || "No summary available"}\n`,
        )
        .join("\n\n");

      // Prepare the user prompt
      const userPrompt = `
Target Application URL: ${this.targetUrl}

Please test this application for vulnerabilities based on the following security learnings:

${learningsContext}

Systematically test for each type of vulnerability mentioned in the learnings. Use Playwright to interact with the application and the VM tools to store any test scripts or results as needed.

For each vulnerability you find, provide detailed information including the name, description, severity, and evidence.

Start by navigating to the target URL and exploring the application structure, then proceed with targeted security tests.
`;

      await this.tracker.addText("Starting security analysis...");

      // Execute the AI agent with tools
      console.log(`[TestingAgent] Starting AI generation...`);
      const result = await generateText({
        model: anthropic(TESTING_AGENT_CONFIG.model),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        tools: allTools,
        maxSteps: TESTING_AGENT_CONFIG.maxSteps,
        temperature: TESTING_AGENT_CONFIG.temperature,
        providerOptions: {
          anthropic: {
            thinking: {
              type: TESTING_AGENT_CONFIG.thinking.enabled
                ? "enabled"
                : "disabled",
              budgetTokens: TESTING_AGENT_CONFIG.thinking.budgetTokens,
            },
          } satisfies AnthropicProviderOptions,
        },
        headers: {
          "anthropic-beta": "interleaved-thinking-2025-05-14",
        },
        onStepFinish: async (step) => {
          // Track each step
          console.log(`[TestingAgent] Step completed: ${step.stepType}`);

          // Track reasoning FIRST (if available) - it logically comes before the response
          if ("reasoning" in step && step.reasoning) {
            console.log(`[TestingAgent] Adding reasoning block`);
            await this.tracker.addReasoning(String(step.reasoning));
            console.log(`[TestingAgent] Reasoning block added to database`);
          }

          // Track text content AFTER reasoning
          if (step.text) {
            await this.tracker.addText(step.text);
          }

          if (step.toolCalls && step.toolCalls.length > 0) {
            for (const toolCall of step.toolCalls) {
              await this.tracker.addToolCall(
                toolCall.toolName,
                toolCall.args,
                toolCall.toolCallId,
              );
            }
          }

          if (step.toolResults && step.toolResults.length > 0) {
            for (const toolResult of step.toolResults) {
              await this.tracker.addToolResult(
                toolResult.toolName,
                toolResult.result,
                toolResult.toolCallId,
              );
            }
          }
        },
      });

      console.log(`[TestingAgent] AI generation completed`);
      await this.tracker.addText("Analysis complete. Processing results...");

      // Parse vulnerabilities from the result
      const parsedVulnerabilities = this.parseVulnerabilities(result.text);
      vulnerabilities.push(...parsedVulnerabilities);

      // Save vulnerabilities to database
      for (const vulnerability of vulnerabilities) {
        await db.vulnerability.create({
          data: {
            testRunId: this.testRunId,
            name: vulnerability.name,
            details: vulnerability.details,
            severity: vulnerability.severity,
            category: vulnerability.category,
            evidence: vulnerability.evidence as object | undefined,
          },
        });
      }

      console.log(
        `[TestingAgent] Found ${vulnerabilities.length} vulnerabilities`,
      );
      await this.tracker.addText(
        `Testing complete. Found ${vulnerabilities.length} vulnerabilities.`,
      );

      // Complete the test run
      await this.completeTestRun(vulnerabilities);
      await this.tracker.completeExecution();

      return vulnerabilities;
    } catch (error) {
      console.error(`[TestingAgent] Error during execution:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await this.tracker.failExecution(errorMessage);

      // Mark test run as failed
      await db.testRun.update({
        where: { id: this.testRunId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
        },
      });

      throw error;
    } finally {
      // Clean up Playwright client
      if (playwrightClient) {
        try {
          await playwrightClient.close();
        } catch (error) {
          console.error(
            `[TestingAgent] Error closing Playwright client:`,
            error,
          );
        }
      }
    }
  }

  /**
   * Parse vulnerabilities from AI response text
   */
  private parseVulnerabilities(text: string): VulnerabilityFound[] {
    const vulnerabilities: VulnerabilityFound[] = [];

    // Try to extract JSON blocks from the text
    const jsonMatches = text.matchAll(/```json\n([\s\S]*?)\n```/g);

    for (const match of jsonMatches) {
      try {
        const jsonStr = match[1];
        if (!jsonStr) continue;
        const parsed = JSON.parse(jsonStr) as unknown;

        // Validate the structure
        if (
          parsed &&
          typeof parsed === "object" &&
          "name" in parsed &&
          "details" in parsed &&
          "severity" in parsed
        ) {
          const vuln = parsed as {
            name: string;
            details: string;
            severity: string;
            category?: string;
            evidence?: unknown;
          };
          vulnerabilities.push({
            name: vuln.name,
            details: vuln.details,
            severity: this.mapSeverity(vuln.severity),
            category: vuln.category,
            evidence: vuln.evidence as Record<string, unknown> | undefined,
          });
        }
      } catch (error) {
        console.warn(
          `[TestingAgent] Failed to parse vulnerability JSON:`,
          error,
        );
      }
    }

    // Also try to find vulnerabilities mentioned in plain text
    // This is a fallback in case the AI doesn't format them as JSON
    if (vulnerabilities.length === 0) {
      // Look for patterns like "Found: XSS vulnerability" or "Vulnerability: SQL Injection"
      const patterns = [
        /(?:Found|Detected|Identified|Vulnerability):\s*([^\n]+)/gi,
        /\*\*Vulnerability:\*\*\s*([^\n]+)/gi,
      ];

      for (const pattern of patterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            vulnerabilities.push({
              name: match[1].trim(),
              details:
                "Vulnerability detected during testing. See execution details for more information.",
              severity: "MEDIUM", // Default severity
              category: undefined,
              evidence: undefined,
            });
          }
        }
      }
    }

    return vulnerabilities;
  }

  /**
   * Map severity string to enum
   */
  private mapSeverity(severity: string): VulnerabilitySeverity {
    const upperSeverity = severity.toUpperCase();
    switch (upperSeverity) {
      case "LOW":
        return "LOW";
      case "HIGH":
        return "HIGH";
      case "CRITICAL":
        return "CRITICAL";
      case "MEDIUM":
      default:
        return "MEDIUM";
    }
  }

  /**
   * Complete the test run
   */
  private async completeTestRun(
    vulnerabilities: VulnerabilityFound[],
  ): Promise<void> {
    await db.testRun.update({
      where: { id: this.testRunId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        metadata: {
          vulnerabilityCount: vulnerabilities.length,
          severityCounts: {
            low: vulnerabilities.filter((v) => v.severity === "LOW").length,
            medium: vulnerabilities.filter((v) => v.severity === "MEDIUM")
              .length,
            high: vulnerabilities.filter((v) => v.severity === "HIGH").length,
            critical: vulnerabilities.filter((v) => v.severity === "CRITICAL")
              .length,
          },
        },
      },
    });
  }
}
