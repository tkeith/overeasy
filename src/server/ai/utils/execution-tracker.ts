import { db } from "~/server/db";
import type {
  AgentExecutionStatus,
  AgentBlockType,
  Prisma,
} from "@prisma/client";

export class ExecutionTracker {
  private executionId: string | null = null;
  private sequence: number = 0;

  /**
   * Start a new agent execution
   */
  async startExecution(
    agentName: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    console.log(
      `[ExecutionTracker] Starting execution for agent: ${agentName}`,
    );
    const execution = await db.agentExecution.create({
      data: {
        agentName,
        status: "RUNNING",
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
    });
    console.log(
      `[ExecutionTracker] Execution created with ID: ${execution.id}`,
    );
    this.executionId = execution.id;
    this.sequence = 0;
    return execution.id;
  }

  /**
   * Add a block to the current execution
   */
  async addBlock(blockType: AgentBlockType, content: unknown): Promise<void> {
    if (!this.executionId) {
      console.error(
        `[ExecutionTracker] ERROR: No active execution to add block to`,
      );
      throw new Error("No active execution to add block to");
    }

    console.log(
      `[ExecutionTracker] Adding block: type=${blockType}, sequence=${this.sequence}, executionId=${this.executionId}`,
    );
    const block = await db.agentBlock.create({
      data: {
        executionId: this.executionId,
        blockType,
        content: content as object,
        sequence: this.sequence++,
      },
    });
    console.log(`[ExecutionTracker] Block created with ID: ${block.id}`);
  }

  /**
   * Add text block
   */
  async addText(text: string): Promise<void> {
    await this.addBlock("TEXT", { text });
  }

  /**
   * Add reasoning block
   */
  async addReasoning(reasoning: string): Promise<void> {
    await this.addBlock("REASONING", { reasoning });
  }

  /**
   * Add tool call block
   */
  async addToolCall(
    toolName: string,
    args: unknown,
    toolCallId?: string,
  ): Promise<void> {
    await this.addBlock("TOOL_CALL", {
      toolName,
      args,
      toolCallId,
    });
  }

  /**
   * Add tool result block
   */
  async addToolResult(
    toolName: string,
    result: unknown,
    toolCallId?: string,
  ): Promise<void> {
    await this.addBlock("TOOL_RESULT", {
      toolName,
      result,
      toolCallId,
    });
  }

  /**
   * Mark execution as completed successfully
   */
  async completeExecution(): Promise<void> {
    if (!this.executionId) {
      console.error(
        `[ExecutionTracker] ERROR: No active execution to complete`,
      );
      throw new Error("No active execution to complete");
    }

    console.log(
      `[ExecutionTracker] Marking execution ${this.executionId} as SUCCEEDED`,
    );
    await db.agentExecution.update({
      where: { id: this.executionId },
      data: {
        status: "SUCCEEDED",
        completedAt: new Date(),
      },
    });
    console.log(`[ExecutionTracker] Execution marked as SUCCEEDED`);
  }

  /**
   * Mark execution as failed
   */
  async failExecution(error?: string): Promise<void> {
    if (!this.executionId) {
      console.error(`[ExecutionTracker] ERROR: No active execution to fail`);
      throw new Error("No active execution to fail");
    }

    console.log(
      `[ExecutionTracker] Marking execution ${this.executionId} as FAILED`,
    );

    // Add error as final block if provided
    if (error) {
      console.log(`[ExecutionTracker] Adding error block: ${error}`);
      await this.addBlock("TEXT", { text: `Error: ${error}`, isError: true });
    }

    await db.agentExecution.update({
      where: { id: this.executionId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    });
    console.log(`[ExecutionTracker] Execution marked as FAILED`);
  }

  /**
   * Get the current execution ID
   */
  getExecutionId(): string | null {
    return this.executionId;
  }
}
