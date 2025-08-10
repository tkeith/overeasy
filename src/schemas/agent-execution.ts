import { z } from "zod";

export const AgentExecutionStatusSchema = z.enum([
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export const AgentBlockTypeSchema = z.enum([
  "TEXT",
  "REASONING",
  "TOOL_CALL",
  "TOOL_RESULT",
]);

export const AgentBlockSchema = z.object({
  id: z.string(),
  executionId: z.string(),
  blockType: AgentBlockTypeSchema,
  content: z.unknown(), // JSON content
  sequence: z.number(),
  createdAt: z.date(),
});

export const AgentExecutionSchema = z.object({
  id: z.string(),
  agentName: z.string(),
  status: AgentExecutionStatusSchema,
  metadata: z.unknown().nullable(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  blocks: z.array(AgentBlockSchema).optional(),
});

export type AgentExecutionStatus = z.infer<typeof AgentExecutionStatusSchema>;
export type AgentBlockType = z.infer<typeof AgentBlockTypeSchema>;
export type AgentBlock = z.infer<typeof AgentBlockSchema>;
export type AgentExecution = z.infer<typeof AgentExecutionSchema>;
